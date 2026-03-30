import { Slot, usePathname, useRouter } from "expo-router";
import { View, TouchableOpacity, Text, Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Home,
  Calendar,
  Trophy,
  ShoppingBag,
  User,
} from "lucide-react-native";
import { BRAND } from "@/lib/constants";
import { theme } from "@/lib/theme";

const TABS = [
  { name: "Home", href: "/(tabs)", icon: Home },
  { name: "Schedule", href: "/(tabs)/schedule", icon: Calendar },
  { name: "Progress", href: "/(tabs)/progress", icon: Trophy },
  { name: "Shop", href: "/(tabs)/shop", icon: ShoppingBag },
  { name: "Profile", href: "/(tabs)/profile", icon: User },
] as const;

export default function TabLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isActive = (href: string) => {
    if (href === "/(tabs)") return pathname === "/" || pathname === "/(tabs)";
    return pathname.startsWith(href.replace("/(tabs)", ""));
  };

  return (
    <View style={styles.root}>
      <View style={common.flex1}>
        <Slot />
      </View>
      <View
        style={[
          styles.tabBar,
          { paddingBottom: Platform.OS === "ios" ? insets.bottom : 10 },
        ]}
      >
        {TABS.map((tab) => {
          const active = isActive(tab.href);
          const IconComponent = tab.icon;
          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => router.replace(tab.href as any)}
              activeOpacity={0.7}
              style={styles.tabItem}
            >
              <IconComponent
                size={22}
                color={active ? BRAND.primaryColor : theme.colors.placeholder}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: active ? BRAND.primaryColor : theme.colors.placeholder },
                ]}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const common = StyleSheet.create({
  flex1: { flex: 1 },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: theme.colors.bg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
});
