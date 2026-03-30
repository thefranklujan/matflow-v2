import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Bell, ChevronRight, Settings } from "lucide-react-native";
import { useAuthStore } from "@/stores/auth-store";
import { useNetworkStore } from "@/stores/network-store";
import { BRAND } from "@/lib/constants";
import { theme, common } from "@/lib/theme";

export default function HomeTab() {
  const router = useRouter();
  const { profile, activeMembership } = useAuthStore();
  const { isConnected } = useNetworkStore();

  const firstName = profile?.first_name || "Athlete";
  const gymName = activeMembership?.gym?.name || "Your Academy";
  const beltRank = activeMembership?.belt_rank || "white";
  const stripes = activeMembership?.stripes || 0;
  const isAdmin =
    activeMembership?.role === "gym_admin" ||
    profile?.role === "super_admin";

  return (
    <SafeAreaView style={common.screen}>
      {/* Offline banner */}
      {!isConnected && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>
            You're offline. Changes will sync when you reconnect.
          </Text>
        </View>
      )}

      <ScrollView style={common.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.welcomeLabel}>Welcome back,</Text>
            <Text style={styles.welcomeName}>{firstName}</Text>
          </View>
          <View style={styles.headerActions}>
            {isAdmin && (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => router.push("/(admin)")}
              >
                <Settings size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.headerButton}>
              <Bell size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Gym Card */}
        <View style={styles.gymCard}>
          <Text style={styles.gymLabel}>Academy</Text>
          <Text style={styles.gymName}>{gymName}</Text>
          <View style={styles.beltRow}>
            <View style={styles.beltInfo}>
              <View
                style={[
                  styles.beltSwatch,
                  {
                    backgroundColor:
                      beltRank === "white"
                        ? "#FFFFFF"
                        : beltRank === "blue"
                        ? "#0066CC"
                        : beltRank === "purple"
                        ? "#6B21A8"
                        : beltRank === "brown"
                        ? "#8B4513"
                        : "#1a1a1a",
                    borderWidth: beltRank === "white" ? 1 : 0,
                    borderColor: "#404040",
                  },
                ]}
              />
              <Text style={styles.beltText}>
                {beltRank.charAt(0).toUpperCase() + beltRank.slice(1)} Belt
              </Text>
            </View>
            {stripes > 0 && (
              <View style={styles.stripesRow}>
                {Array.from({ length: stripes }).map((_, i) => (
                  <View key={i} style={styles.stripe} />
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>This Month</Text>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statUnit}>Classes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Streak</Text>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statUnit}>Weeks</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Techniques</Text>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statUnit}>Learned</Text>
          </View>
        </View>

        {/* Today's Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Classes</Text>
            <TouchableOpacity
              style={common.row}
              onPress={() => router.push("/(tabs)/schedule")}
            >
              <Text style={styles.seeAll}>See All</Text>
              <ChevronRight size={16} color={BRAND.primaryColor} />
            </TouchableOpacity>
          </View>

          <View style={[common.card, styles.emptyCard]}>
            <Text style={styles.emptyText}>
              No classes scheduled for today.
            </Text>
          </View>
        </View>

        {/* Announcements */}
        <View style={styles.sectionLast}>
          <Text style={styles.sectionTitle}>Announcements</Text>
          <View style={[common.card, styles.emptyCard]}>
            <Text style={styles.emptyText}>No announcements yet.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  offlineBanner: {
    backgroundColor: theme.colors.warningMuted,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  offlineText: {
    color: theme.colors.warning,
    fontSize: 12,
    textAlign: "center",
    fontWeight: "500",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing["2xl"],
  },
  welcomeLabel: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  welcomeName: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "700",
  },
  headerActions: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  headerButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
    padding: theme.spacing.md,
  },
  gymCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing["2xl"],
    backgroundColor: `${BRAND.primaryColor}15`,
  },
  gymLabel: {
    ...theme.typography.labelUppercase,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  gymName: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "700",
  },
  beltRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  beltInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  beltSwatch: {
    width: 24,
    height: 12,
    borderRadius: 2,
  },
  beltText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  stripesRow: {
    flexDirection: "row",
    gap: 4,
  },
  stripe: {
    width: 6,
    height: 12,
    backgroundColor: theme.colors.yellow,
    borderRadius: 2,
  },
  statsRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginBottom: theme.spacing["2xl"],
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  statLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "700",
  },
  statUnit: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  section: {
    marginBottom: theme.spacing["2xl"],
  },
  sectionLast: {
    marginBottom: theme.spacing["3xl"],
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: theme.spacing.md,
  },
  seeAll: {
    color: theme.colors.brand,
    fontSize: 14,
    fontWeight: "500",
  },
  emptyCard: {
    alignItems: "center",
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
});
