import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  LogOut,
  ChevronRight,
  Shield,
  Bell,
  HelpCircle,
  Moon,
} from "lucide-react-native";
import { useAuthStore } from "@/stores/auth-store";
import { BRAND } from "@/lib/constants";
import { theme, common } from "@/lib/theme";

export default function ProfileTab() {
  const { profile, activeMembership, signOut } = useAuthStore();

  const fullName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    "User";
  const email = profile?.email || "";
  const isAdmin =
    activeMembership?.role === "gym_admin" || profile?.role === "super_admin";

  const menuItems = [
    { icon: Bell, label: "Notifications", onPress: () => {} },
    { icon: Moon, label: "Appearance", onPress: () => {} },
    { icon: Shield, label: "Privacy & Security", onPress: () => {} },
    { icon: HelpCircle, label: "Help & Support", onPress: () => {} },
  ];

  return (
    <SafeAreaView style={common.screen}>
      <ScrollView style={common.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profile</Text>

        {/* Profile Card */}
        <View style={[common.card, styles.profileCard]}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(profile?.first_name?.[0] || "U").toUpperCase()}
              </Text>
            </View>
            <View style={common.flex1}>
              <Text style={styles.profileName}>{fullName}</Text>
              <Text style={styles.profileEmail}>{email}</Text>
              {isAdmin && (
                <View style={styles.adminBadge}>
                  <Text style={styles.adminBadgeText}>Admin</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuItem,
                index < menuItems.length - 1 && styles.menuItemBorder,
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <item.icon size={20} color={theme.colors.textSecondary} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <ChevronRight size={18} color={theme.colors.placeholder} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={signOut}
          activeOpacity={0.7}
        >
          <LogOut size={18} color={theme.colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
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
  profileCard: {
    marginBottom: theme.spacing["2xl"],
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.lg,
    backgroundColor: `${BRAND.primaryColor}20`,
  },
  avatarText: {
    color: theme.colors.brand,
    fontSize: 24,
    fontWeight: "700",
  },
  profileName: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  profileEmail: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  adminBadge: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: theme.colors.brandMuted,
  },
  adminBadgeText: {
    color: theme.colors.brand,
    fontSize: 12,
    fontWeight: "600",
  },
  menuCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    marginBottom: theme.spacing["2xl"],
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuLabel: {
    color: theme.colors.text,
    fontSize: 16,
    flex: 1,
    marginLeft: theme.spacing.lg,
  },
  signOutButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.errorBorder,
    borderRadius: theme.borderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.lg,
    marginBottom: theme.spacing["3xl"],
  },
  signOutText: {
    color: theme.colors.error,
    fontWeight: "600",
    marginLeft: theme.spacing.sm,
  },
});
