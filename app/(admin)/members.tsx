import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Users,
  CheckCircle,
  XCircle,
  ChevronUp,
  Shield,
  Copy,
} from "lucide-react-native";
import { useAuthStore } from "@/stores/auth-store";
import { supabase } from "@/lib/supabase";
import { BELT_RANKS } from "@/lib/constants";
import { theme, common } from "@/lib/theme";
import type { BeltRank, UserRole } from "@/types/database";

interface MemberRow {
  id: string;
  profile_id: string;
  role: UserRole;
  belt_rank: BeltRank;
  stripes: number;
  approved: boolean;
  active: boolean;
  joined_at: string;
  profile: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

export default function MembersAdmin() {
  const router = useRouter();
  const { activeMembership } = useAuthStore();
  const gymId = activeMembership?.gym_id;
  const gymSlug = activeMembership?.gym?.slug;

  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<MemberRow | null>(null);
  const [promoteModalVisible, setPromoteModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [promoteBelt, setPromoteBelt] = useState<BeltRank>("white");
  const [promoteStripes, setPromoteStripes] = useState(0);
  const [tab, setTab] = useState<"active" | "pending">("active");

  const fetchMembers = useCallback(async () => {
    if (!gymId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("gym_members")
        .select(
          `
          id, profile_id, role, belt_rank, stripes, approved, active, joined_at,
          profile:profiles (id, email, first_name, last_name, avatar_url)
        `
        )
        .eq("gym_id", gymId)
        .order("joined_at", { ascending: false });

      if (err) throw err;
      setMembers((data as any) ?? []);
    } catch (e: any) {
      setError(e.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  }, [gymId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const activeMembers = members.filter((m) => m.approved && m.active);
  const pendingMembers = members.filter((m) => !m.approved);

  const handleApprove = async (member: MemberRow) => {
    setSaving(true);
    try {
      const { error: err } = await supabase
        .from("gym_members")
        .update({ approved: true, active: true })
        .eq("id", member.id);
      if (err) throw err;
      await fetchMembers();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async (member: MemberRow) => {
    Alert.alert("Reject Member", "Remove this pending member?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          setSaving(true);
          try {
            const { error: err } = await supabase
              .from("gym_members")
              .delete()
              .eq("id", member.id);
            if (err) throw err;
            await fetchMembers();
          } catch (e: any) {
            Alert.alert("Error", e.message);
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  const handleToggleActive = async (member: MemberRow) => {
    setSaving(true);
    try {
      const { error: err } = await supabase
        .from("gym_members")
        .update({ active: !member.active })
        .eq("id", member.id);
      if (err) throw err;
      await fetchMembers();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  const openPromoteModal = (member: MemberRow) => {
    setSelectedMember(member);
    setPromoteBelt(member.belt_rank);
    setPromoteStripes(member.stripes);
    setPromoteModalVisible(true);
  };

  const handleSavePromotion = async () => {
    if (!selectedMember) return;
    setSaving(true);
    try {
      const { error: err } = await supabase
        .from("gym_members")
        .update({ belt_rank: promoteBelt, stripes: promoteStripes })
        .eq("id", selectedMember.id);
      if (err) throw err;

      // Log belt progress
      await supabase.from("belt_progress").insert({
        gym_id: gymId!,
        member_id: selectedMember.id,
        belt_rank: promoteBelt,
        stripes: promoteStripes,
        awarded_at: new Date().toISOString(),
        awarded_by: activeMembership?.id ?? null,
      });

      setPromoteModalVisible(false);
      setSelectedMember(null);
      await fetchMembers();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  const gymName = activeMembership?.gym?.name || "our academy";

  const handleShareSlug = async () => {
    if (!gymSlug) return;
    const joinLink = `https://matflow.app/join/${gymSlug}`;
    try {
      await Share.share({
        message: `Join ${gymName} on MatFlow!\n\nSign up here: ${joinLink}`,
        url: joinLink,
      });
    } catch {}
  };

  const getBeltColor = (rank: BeltRank) =>
    BELT_RANKS.find((b) => b.value === rank)?.color ?? "#FFFFFF";

  const getBeltLabel = (rank: BeltRank) =>
    BELT_RANKS.find((b) => b.value === rank)?.label ?? rank;

  const getMemberName = (m: MemberRow) => {
    const first = m.profile?.first_name ?? "";
    const last = m.profile?.last_name ?? "";
    if (first || last) return `${first} ${last}`.trim();
    return m.profile?.email ?? "Unknown";
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "gym_admin":
        return "Admin";
      case "instructor":
        return "Instructor";
      default:
        return "Member";
    }
  };

  const renderMemberCard = (member: MemberRow) => {
    const beltColor = getBeltColor(member.belt_rank);
    return (
      <View key={member.id} style={styles.memberCard}>
        <View style={styles.memberTop}>
          <View style={[styles.beltDot, { backgroundColor: beltColor }]} />
          <View style={common.flex1}>
            <Text style={styles.memberName}>{getMemberName(member)}</Text>
            <Text style={styles.memberEmail}>
              {member.profile?.email ?? ""}
            </Text>
          </View>
          {(member.role === "gym_admin" || member.role === "instructor") && (
            <View style={styles.roleBadge}>
              <Shield size={12} color={theme.colors.brand} />
              <Text style={styles.roleBadgeText}>
                {getRoleLabel(member.role)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.memberMeta}>
          <View style={styles.metaChip}>
            <Text style={styles.metaChipText}>
              {getBeltLabel(member.belt_rank)}
            </Text>
          </View>
          {member.stripes > 0 && (
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>
                {member.stripes} stripe{member.stripes > 1 ? "s" : ""}
              </Text>
            </View>
          )}
          <View
            style={[
              styles.metaChip,
              member.active ? styles.activeChip : styles.inactiveChip,
            ]}
          >
            <Text
              style={[
                styles.metaChipText,
                member.active ? styles.activeChipText : styles.inactiveChipText,
              ]}
            >
              {member.active ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>

        <View style={styles.memberActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => openPromoteModal(member)}
          >
            <ChevronUp size={16} color={theme.colors.brand} />
            <Text style={styles.actionBtnText}>Promote</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleToggleActive(member)}
          >
            <Text style={styles.actionBtnTextMuted}>
              {member.active ? "Deactivate" : "Activate"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderPendingCard = (member: MemberRow) => (
    <View key={member.id} style={styles.memberCard}>
      <View style={styles.memberTop}>
        <View
          style={[
            styles.beltDot,
            { backgroundColor: getBeltColor(member.belt_rank) },
          ]}
        />
        <View style={common.flex1}>
          <Text style={styles.memberName}>{getMemberName(member)}</Text>
          <Text style={styles.memberEmail}>
            {member.profile?.email ?? ""}
          </Text>
        </View>
      </View>
      <View style={styles.pendingActions}>
        <TouchableOpacity
          style={styles.approveBtn}
          onPress={() => handleApprove(member)}
          disabled={saving}
        >
          <CheckCircle size={18} color={theme.colors.bg} />
          <Text style={styles.approveBtnText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rejectBtn}
          onPress={() => handleReject(member)}
          disabled={saving}
        >
          <XCircle size={18} color={theme.colors.error} />
          <Text style={styles.rejectBtnText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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

        <Text style={common.pageTitle}>Members</Text>

        {/* Join Slug Banner */}
        {gymSlug && (
          <TouchableOpacity style={styles.slugBanner} onPress={handleShareSlug}>
            <View style={common.flex1}>
              <Text style={styles.slugLabel}>Invite Link</Text>
              <Text style={styles.slugValue}>matflow.app/join/{gymSlug}</Text>
            </View>
            <Copy size={18} color={theme.colors.brand} />
          </TouchableOpacity>
        )}

        {/* Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === "active" && styles.tabBtnActive]}
            onPress={() => setTab("active")}
          >
            <Text
              style={[
                styles.tabBtnText,
                tab === "active" && styles.tabBtnTextActive,
              ]}
            >
              Active ({activeMembers.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, tab === "pending" && styles.tabBtnActive]}
            onPress={() => setTab("pending")}
          >
            <Text
              style={[
                styles.tabBtnText,
                tab === "pending" && styles.tabBtnTextActive,
              ]}
            >
              Pending ({pendingMembers.length})
            </Text>
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
        ) : tab === "active" ? (
          activeMembers.length === 0 ? (
            <View style={common.emptyState}>
              <Users size={40} color={theme.colors.textFaint} />
              <Text style={common.emptyText}>No active members yet</Text>
              <Text style={common.emptySubtext}>
                Share your join code to invite members
              </Text>
            </View>
          ) : (
            <View style={styles.cardList}>
              {activeMembers.map(renderMemberCard)}
            </View>
          )
        ) : pendingMembers.length === 0 ? (
          <View style={common.emptyState}>
            <Users size={40} color={theme.colors.textFaint} />
            <Text style={common.emptyText}>No pending requests</Text>
          </View>
        ) : (
          <View style={styles.cardList}>
            {pendingMembers.map(renderPendingCard)}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Promote Modal */}
      <Modal
        visible={promoteModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPromoteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Promote {selectedMember ? getMemberName(selectedMember) : ""}
            </Text>

            <Text style={common.inputLabel}>Belt Rank</Text>
            <View style={styles.pickerRow}>
              {BELT_RANKS.map((belt) => (
                <TouchableOpacity
                  key={belt.value}
                  style={[
                    styles.beltOption,
                    promoteBelt === belt.value && styles.beltOptionSelected,
                  ]}
                  onPress={() => setPromoteBelt(belt.value as BeltRank)}
                >
                  <View
                    style={[
                      styles.beltOptionDot,
                      { backgroundColor: belt.color },
                    ]}
                  />
                  <Text
                    style={[
                      styles.beltOptionText,
                      promoteBelt === belt.value &&
                        styles.beltOptionTextSelected,
                    ]}
                  >
                    {belt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[common.inputLabel, { marginTop: theme.spacing.lg }]}>
              Stripes
            </Text>
            <View style={styles.stripesRow}>
              {[0, 1, 2, 3, 4].map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[
                    styles.stripeBtn,
                    promoteStripes === n && styles.stripeBtnSelected,
                  ]}
                  onPress={() => setPromoteStripes(n)}
                >
                  <Text
                    style={[
                      styles.stripeBtnText,
                      promoteStripes === n && styles.stripeBtnTextSelected,
                    ]}
                  >
                    {n}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setPromoteModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[common.primaryButton, common.flex1]}
                onPress={handleSavePromotion}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={theme.colors.bg} />
                ) : (
                  <Text style={common.primaryButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  slugBanner: {
    backgroundColor: theme.colors.brandMuted,
    borderWidth: 1,
    borderColor: theme.colors.brandBorder,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  slugLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  slugValue: {
    color: theme.colors.brand,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 2,
  },
  tabRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tabBtnActive: {
    backgroundColor: theme.colors.brandMuted,
    borderColor: theme.colors.brandBorder,
  },
  tabBtnText: {
    color: theme.colors.textMuted,
    fontWeight: "600",
    fontSize: 14,
  },
  tabBtnTextActive: {
    color: theme.colors.brand,
  },
  cardList: {
    gap: theme.spacing.md,
  },
  memberCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  memberTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  beltDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  memberName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  memberEmail: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.colors.brandMuted,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  roleBadgeText: {
    color: theme.colors.brand,
    fontSize: 11,
    fontWeight: "600",
  },
  memberMeta: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    flexWrap: "wrap",
  },
  metaChip: {
    backgroundColor: theme.colors.surfaceRaised,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  metaChipText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },
  activeChip: {
    backgroundColor: "rgba(15, 230, 155, 0.1)",
  },
  activeChipText: {
    color: theme.colors.brand,
  },
  inactiveChip: {
    backgroundColor: theme.colors.errorMuted,
  },
  inactiveChipText: {
    color: theme.colors.error,
  },
  memberActions: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionBtnText: {
    color: theme.colors.brand,
    fontSize: 14,
    fontWeight: "600",
  },
  actionBtnTextMuted: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: "500",
  },
  pendingActions: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  approveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: theme.colors.brand,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
  },
  approveBtnText: {
    color: theme.colors.bg,
    fontWeight: "700",
    fontSize: 14,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: theme.colors.errorMuted,
    borderWidth: 1,
    borderColor: theme.colors.errorBorder,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
  },
  rejectBtnText: {
    color: theme.colors.error,
    fontWeight: "600",
    fontSize: 14,
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
  },
  modalTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.xl,
  },
  pickerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  beltOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  beltOptionSelected: {
    borderColor: theme.colors.brand,
    backgroundColor: theme.colors.brandMuted,
  },
  beltOptionDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  beltOptionText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  beltOptionTextSelected: {
    color: theme.colors.brand,
  },
  stripesRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  stripeBtn: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stripeBtnSelected: {
    borderColor: theme.colors.brand,
    backgroundColor: theme.colors.brandMuted,
  },
  stripeBtnText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
  stripeBtnTextSelected: {
    color: theme.colors.brand,
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
