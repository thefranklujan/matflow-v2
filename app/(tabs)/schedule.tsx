import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DAYS_OF_WEEK } from "@/lib/constants";
import { theme, common } from "@/lib/theme";

export default function ScheduleTab() {
  return (
    <SafeAreaView style={common.screen}>
      <ScrollView style={common.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Class Schedule</Text>

        {DAYS_OF_WEEK.map((day) => (
          <View key={day} style={styles.daySection}>
            <Text style={styles.dayLabel}>{day}</Text>
            <View style={[common.card, styles.emptyCard]}>
              <Text style={styles.emptyText}>No classes scheduled</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    ...theme.typography.h2,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing["2xl"],
  },
  daySection: {
    marginBottom: theme.spacing.lg,
  },
  dayLabel: {
    ...theme.typography.labelUppercase,
    color: theme.colors.textSecondary,
    fontWeight: "600",
    marginBottom: theme.spacing.sm,
  },
  emptyCard: {
    alignItems: "center",
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    textAlign: "center",
  },
});
