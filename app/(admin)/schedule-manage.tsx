import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  Plus,
  Pencil,
  Trash2,
  Clock,
  X,
} from "lucide-react-native";
import { useAuthStore } from "@/stores/auth-store";
import { supabase } from "@/lib/supabase";
import { CLASS_TYPES, DAYS_OF_WEEK } from "@/lib/constants";
import { theme, common } from "@/lib/theme";
import type { ClassType } from "@/types/database";

interface ScheduleRow {
  id: string;
  gym_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  class_type: ClassType;
  instructor: string | null;
  topic: string | null;
  active: boolean;
}

const INITIAL_FORM = {
  day_of_week: 1,
  start_time: "06:00",
  end_time: "07:00",
  class_type: "gi" as ClassType,
  instructor: "",
  topic: "",
};

export default function ScheduleManageAdmin() {
  const router = useRouter();
  const { activeMembership } = useAuthStore();
  const gymId = activeMembership?.gym_id;

  const [classes, setClasses] = useState<ScheduleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);

  const fetchClasses = useCallback(async () => {
    if (!gymId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("class_schedules")
        .select("*")
        .eq("gym_id", gymId)
        .order("day_of_week", { ascending: true })
        .order("start_time", { ascending: true });

      if (err) throw err;
      setClasses((data as ScheduleRow[]) ?? []);
    } catch (e: any) {
      setError(e.message || "Failed to load schedule");
    } finally {
      setLoading(false);
    }
  }, [gymId]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const openAddModal = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setModalVisible(true);
  };

  const openEditModal = (cls: ScheduleRow) => {
    setEditingId(cls.id);
    setForm({
      day_of_week: cls.day_of_week,
      start_time: cls.start_time,
      end_time: cls.end_time,
      class_type: cls.class_type,
      instructor: cls.instructor ?? "",
      topic: cls.topic ?? "",
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!gymId) return;
    if (!form.start_time || !form.end_time) {
      Alert.alert("Error", "Start and end times are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        gym_id: gymId,
        day_of_week: form.day_of_week,
        start_time: form.start_time,
        end_time: form.end_time,
        class_type: form.class_type,
        instructor: form.instructor || null,
        topic: form.topic || null,
        active: true,
      };

      if (editingId) {
        const { error: err } = await supabase
          .from("class_schedules")
          .update(payload)
          .eq("id", editingId);
        if (err) throw err;
      } else {
        const { error: err } = await supabase
          .from("class_schedules")
          .insert(payload);
        if (err) throw err;
      }

      setModalVisible(false);
      await fetchClasses();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (cls: ScheduleRow) => {
    Alert.alert("Delete Class", `Remove ${getClassLabel(cls.class_type)} on ${DAYS_OF_WEEK[cls.day_of_week]}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const { error: err } = await supabase
              .from("class_schedules")
              .delete()
              .eq("id", cls.id);
            if (err) throw err;
            await fetchClasses();
          } catch (e: any) {
            Alert.alert("Error", e.message);
          }
        },
      },
    ]);
  };

  const getClassLabel = (type: ClassType) =>
    CLASS_TYPES.find((c) => c.value === type)?.label ?? type;

  const formatTime = (time: string) => {
    // time is "HH:mm" or "HH:mm:ss", display as 12h
    const [h, m] = time.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${m} ${ampm}`;
  };

  // Group classes by day
  const classesByDay: Record<number, ScheduleRow[]> = {};
  classes.forEach((cls) => {
    if (!classesByDay[cls.day_of_week]) classesByDay[cls.day_of_week] = [];
    classesByDay[cls.day_of_week].push(cls);
  });

  return (
    <SafeAreaView style={common.screen}>
      <ScrollView
        style={common.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={common.backRow}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color={theme.colors.brand} />
          <Text style={common.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.headerRow}>
          <Text style={common.pageTitle}>Class Schedule</Text>
          <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
            <Plus size={18} color={theme.colors.bg} />
            <Text style={styles.addBtnText}>Add Class</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={common.emptyState}>
            <ActivityIndicator size="large" color={theme.colors.brand} />
          </View>
        ) : error ? (
          <View style={common.errorBox}>
            <Text style={common.errorText}>{error}</Text>
          </View>
        ) : classes.length === 0 ? (
          <View style={common.emptyState}>
            <Calendar size={40} color={theme.colors.textFaint} />
            <Text style={common.emptyText}>No classes scheduled yet</Text>
            <Text style={common.emptySubtext}>
              Tap "Add Class" to create your first class
            </Text>
          </View>
        ) : (
          <View style={styles.dayList}>
            {DAYS_OF_WEEK.map((dayName, dayIndex) => {
              const dayClasses = classesByDay[dayIndex];
              if (!dayClasses || dayClasses.length === 0) return null;
              return (
                <View key={dayIndex} style={styles.daySection}>
                  <Text style={styles.dayLabel}>{dayName}</Text>
                  <View style={styles.dayCards}>
                    {dayClasses.map((cls) => (
                      <View key={cls.id} style={styles.classCard}>
                        <View style={common.flex1}>
                          <Text style={styles.classType}>
                            {getClassLabel(cls.class_type)}
                          </Text>
                          <View style={styles.timeRow}>
                            <Clock
                              size={13}
                              color={theme.colors.textMuted}
                            />
                            <Text style={styles.timeText}>
                              {formatTime(cls.start_time)} &mdash;{" "}
                              {formatTime(cls.end_time)}
                            </Text>
                          </View>
                          {cls.instructor && (
                            <Text style={styles.instructorText}>
                              {cls.instructor}
                            </Text>
                          )}
                          {cls.topic && (
                            <Text style={styles.topicText}>
                              {cls.topic}
                            </Text>
                          )}
                        </View>
                        <View style={styles.cardActions}>
                          <TouchableOpacity
                            style={styles.iconBtn}
                            onPress={() => openEditModal(cls)}
                          >
                            <Pencil
                              size={16}
                              color={theme.colors.textSecondary}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.iconBtn}
                            onPress={() => handleDelete(cls)}
                          >
                            <Trash2 size={16} color={theme.colors.error} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Add / Edit Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? "Edit Class" : "Add Class"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={22} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Day of Week */}
              <Text style={common.inputLabel}>Day of Week</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScroll}
              >
                <View style={styles.chipRow}>
                  {DAYS_OF_WEEK.map((day, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.chip,
                        form.day_of_week === idx && styles.chipSelected,
                      ]}
                      onPress={() => setForm({ ...form, day_of_week: idx })}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          form.day_of_week === idx && styles.chipTextSelected,
                        ]}
                      >
                        {day.slice(0, 3)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Times */}
              <View style={styles.timeInputRow}>
                <View style={common.flex1}>
                  <Text style={common.inputLabel}>Start Time</Text>
                  <TextInput
                    style={common.input}
                    value={form.start_time}
                    onChangeText={(v) => setForm({ ...form, start_time: v })}
                    placeholder="06:00"
                    placeholderTextColor={theme.colors.placeholder}
                  />
                </View>
                <View style={common.flex1}>
                  <Text style={common.inputLabel}>End Time</Text>
                  <TextInput
                    style={common.input}
                    value={form.end_time}
                    onChangeText={(v) => setForm({ ...form, end_time: v })}
                    placeholder="07:00"
                    placeholderTextColor={theme.colors.placeholder}
                  />
                </View>
              </View>

              {/* Class Type */}
              <Text style={[common.inputLabel, { marginTop: theme.spacing.lg }]}>
                Class Type
              </Text>
              <View style={styles.chipRow}>
                {CLASS_TYPES.map((ct) => (
                  <TouchableOpacity
                    key={ct.value}
                    style={[
                      styles.chip,
                      form.class_type === ct.value && styles.chipSelected,
                    ]}
                    onPress={() =>
                      setForm({ ...form, class_type: ct.value as ClassType })
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,
                        form.class_type === ct.value && styles.chipTextSelected,
                      ]}
                    >
                      {ct.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Instructor */}
              <Text style={[common.inputLabel, { marginTop: theme.spacing.lg }]}>
                Instructor
              </Text>
              <TextInput
                style={common.input}
                value={form.instructor}
                onChangeText={(v) => setForm({ ...form, instructor: v })}
                placeholder="Instructor name"
                placeholderTextColor={theme.colors.placeholder}
              />

              {/* Topic */}
              <Text style={[common.inputLabel, { marginTop: theme.spacing.lg }]}>
                Topic (optional)
              </Text>
              <TextInput
                style={common.input}
                value={form.topic}
                onChangeText={(v) => setForm({ ...form, topic: v })}
                placeholder="e.g. Mount Escapes"
                placeholderTextColor={theme.colors.placeholder}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[common.primaryButton, common.flex1]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color={theme.colors.bg} />
                  ) : (
                    <Text style={common.primaryButtonText}>
                      {editingId ? "Update" : "Add Class"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing["2xl"],
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.brand,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  addBtnText: {
    color: theme.colors.bg,
    fontWeight: "700",
    fontSize: 14,
  },
  dayList: {
    gap: theme.spacing.xl,
  },
  daySection: {},
  dayLabel: {
    ...theme.typography.labelUppercase,
    marginBottom: theme.spacing.md,
  },
  dayCards: {
    gap: theme.spacing.sm,
  },
  classCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
  },
  classType: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  timeText: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  instructorText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  topicText: {
    color: theme.colors.brand,
    fontSize: 12,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  iconBtn: {
    padding: theme.spacing.sm,
  },
  bottomSpacer: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    paddingBottom: 40,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  modalTitle: {
    ...theme.typography.h3,
  },
  horizontalScroll: {
    marginBottom: theme.spacing.lg,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipSelected: {
    borderColor: theme.colors.brand,
    backgroundColor: theme.colors.brandMuted,
  },
  chipText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  chipTextSelected: {
    color: theme.colors.brand,
  },
  timeInputRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  modalActions: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginTop: theme.spacing["2xl"],
  },
  modalCancel: {
    flex: 1,
    paddingVertical: theme.spacing.lg,
    alignItems: "center",
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalCancelText: {
    color: theme.colors.textSecondary,
    fontWeight: "600",
    fontSize: 16,
  },
});
