import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/auth-store";
import { BELT_RANKS } from "@/lib/constants";
import { theme, common } from "@/lib/theme";

export default function ProgressTab() {
  const { activeMembership } = useAuthStore();
  const beltRank = activeMembership?.belt_rank || "white";
  const stripes = activeMembership?.stripes || 0;

  const currentBelt = BELT_RANKS.find((b) => b.value === beltRank);

  return (
    <SafeAreaView style={common.screen}>
      <ScrollView style={common.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>My Progress</Text>

        {/* Belt Display */}
        <View style={[common.card, styles.beltDisplay]}>
          <Text style={styles.rankLabel}>Current Rank</Text>
          <View
            style={[
              styles.beltBar,
              {
                backgroundColor: currentBelt?.color || "#FFFFFF",
                borderWidth: beltRank === "white" ? 1 : 0,
                borderColor: "#404040",
              },
            ]}
          >
            <View style={styles.stripesContainer}>
              {Array.from({ length: 4 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.stripeSlot,
                    {
                      backgroundColor:
                        i < stripes ? theme.colors.yellow : "rgba(0,0,0,0.3)",
                    },
                  ]}
                />
              ))}
            </View>
          </View>
          <Text style={styles.beltName}>
            {beltRank.charAt(0).toUpperCase() + beltRank.slice(1)} Belt
          </Text>
          <Text style={styles.stripeCount}>{stripes} / 4 Stripes</Text>
        </View>

        {/* Belt Journey */}
        <Text style={styles.sectionTitle}>Belt Journey</Text>
        <View style={styles.journeyList}>
          {BELT_RANKS.map((belt) => {
            const isCurrent = belt.value === beltRank;
            const currentIndex = BELT_RANKS.findIndex(
              (b) => b.value === beltRank
            );
            const beltIndex = BELT_RANKS.findIndex(
              (b) => b.value === belt.value
            );
            const isComplete = beltIndex < currentIndex;

            return (
              <View
                key={belt.value}
                style={[
                  styles.journeyItem,
                  isCurrent && styles.journeyItemCurrent,
                ]}
              >
                <View
                  style={[
                    styles.journeySwatch,
                    {
                      backgroundColor: belt.color,
                      borderWidth: belt.value === "white" ? 1 : 0,
                      borderColor: "#404040",
                    },
                  ]}
                />
                <View style={common.flex1}>
                  <Text style={styles.journeyBeltName}>
                    {belt.label} Belt
                  </Text>
                  <Text style={styles.journeyStatus}>
                    {isComplete
                      ? "Completed"
                      : isCurrent
                      ? "In Progress"
                      : "Upcoming"}
                  </Text>
                </View>
                {isCurrent && (
                  <Text style={styles.currentTag}>CURRENT</Text>
                )}
                {isComplete && (
                  <Text style={styles.checkMark}>&#10003;</Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Technique Progress */}
        <Text style={styles.sectionTitle}>Techniques</Text>
        <View style={[common.card, styles.emptyCard]}>
          <Text style={styles.emptyText}>
            Technique tracking will appear as you progress.
          </Text>
        </View>
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
  beltDisplay: {
    alignItems: "center",
    padding: theme.spacing["2xl"],
    marginBottom: theme.spacing["2xl"],
  },
  rankLabel: {
    ...theme.typography.labelUppercase,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
  },
  beltBar: {
    width: "100%",
    height: 32,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
  },
  stripesContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    height: "100%",
    paddingRight: theme.spacing.md,
    gap: 6,
  },
  stripeSlot: {
    width: 8,
    height: 20,
    borderRadius: 2,
  },
  beltName: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "700",
  },
  stripeCount: {
    color: theme.colors.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: theme.spacing.md,
  },
  journeyList: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing["3xl"],
  },
  journeyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  journeyItemCurrent: {
    borderColor: theme.colors.brandBorder,
    backgroundColor: theme.colors.brandSubtle,
  },
  journeySwatch: {
    width: 40,
    height: 20,
    borderRadius: 4,
    marginRight: theme.spacing.lg,
  },
  journeyBeltName: {
    color: theme.colors.text,
    fontWeight: "600",
    fontSize: 15,
  },
  journeyStatus: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  currentTag: {
    color: theme.colors.brand,
    fontSize: 12,
    fontWeight: "600",
  },
  checkMark: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  emptyCard: {
    alignItems: "center",
    marginBottom: theme.spacing["3xl"],
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
});
