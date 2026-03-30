import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Users,
  Calendar,
  ShoppingBag,
  Settings,
  ChevronRight,
  ArrowLeft,
} from "lucide-react-native";
import { BRAND } from "@/lib/constants";
import { useAuthStore } from "@/stores/auth-store";
import { theme, common } from "@/lib/theme";

export default function AdminDashboard() {
  const router = useRouter();
  const { activeMembership } = useAuthStore();
  const gymName = activeMembership?.gym?.name || "Your Academy";

  const adminCards = [
    {
      icon: Users,
      title: "Members",
      description: "Manage roster, belt promotions, approvals",
      route: "/(admin)/members" as const,
    },
    {
      icon: Calendar,
      title: "Class Schedule",
      description: "Set up weekly classes and instructors",
      route: "/(admin)/schedule-manage" as const,
    },
    {
      icon: ShoppingBag,
      title: "Pro Shop",
      description: "Products, inventory, orders",
      route: "/(admin)/products-manage" as const,
    },
    {
      icon: Settings,
      title: "Settings",
      description: "Gym name, colors, branding, billing",
      route: "/(admin)/settings" as const,
    },
  ];

  return (
    <SafeAreaView style={common.screen}>
      <ScrollView style={common.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <TouchableOpacity
          style={styles.backRow}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color={BRAND.primaryColor} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>{gymName}</Text>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Members</Text>
            <Text style={styles.statValue}>0</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Classes/Week</Text>
            <Text style={styles.statValue}>0</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Orders</Text>
            <Text style={styles.statValue}>0</Text>
          </View>
        </View>

        {/* Admin Cards */}
        <View style={styles.cardList}>
          {adminCards.map((card) => (
            <TouchableOpacity
              key={card.title}
              style={styles.adminCard}
              onPress={() => router.push(card.route)}
              activeOpacity={0.7}
            >
              <View style={styles.adminCardIcon}>
                <card.icon size={22} color={BRAND.primaryColor} />
              </View>
              <View style={common.flex1}>
                <Text style={styles.adminCardTitle}>{card.title}</Text>
                <Text style={styles.adminCardDesc}>{card.description}</Text>
              </View>
              <ChevronRight size={18} color={theme.colors.placeholder} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  backText: {
    color: theme.colors.brand,
    fontWeight: "500",
    marginLeft: 4,
    fontSize: 15,
  },
  title: {
    ...theme.typography.h2,
    marginBottom: 4,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 14,
    marginBottom: theme.spacing["2xl"],
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
  },
  statValue: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "700",
    marginTop: 4,
  },
  cardList: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing["3xl"],
  },
  adminCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    flexDirection: "row",
    alignItems: "center",
  },
  adminCardIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.lg,
    backgroundColor: `${BRAND.primaryColor}15`,
  },
  adminCardTitle: {
    color: theme.colors.text,
    fontWeight: "700",
    fontSize: 16,
  },
  adminCardDesc: {
    color: theme.colors.textMuted,
    fontSize: 14,
    marginTop: 2,
  },
});
