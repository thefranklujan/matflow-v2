import { View, Text, ScrollView, TouchableOpacity } from "react-native";
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

export default function ProfileTab() {
  const { profile, activeMembership, signOut } = useAuthStore();

  const fullName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    "User";
  const email = profile?.email || "";
  const isAdmin =
    activeMembership?.role === "gym_admin" || profile?.role === "super_admin";

  const menuItems = [
    {
      icon: Bell,
      label: "Notifications",
      onPress: () => {},
    },
    {
      icon: Moon,
      label: "Appearance",
      onPress: () => {},
    },
    {
      icon: Shield,
      label: "Privacy & Security",
      onPress: () => {},
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="text-white text-2xl font-bold mt-4 mb-6">
          Profile
        </Text>

        {/* Profile Card */}
        <View className="bg-[#171717] border border-[#262626] rounded-2xl p-5 mb-6">
          <View className="flex-row items-center">
            <View
              className="w-16 h-16 rounded-full items-center justify-center mr-4"
              style={{ backgroundColor: BRAND.primaryColor + "20" }}
            >
              <Text
                style={{ color: BRAND.primaryColor }}
                className="text-2xl font-bold"
              >
                {(profile?.first_name?.[0] || "U").toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-white text-lg font-bold">{fullName}</Text>
              <Text className="text-neutral-500 text-sm">{email}</Text>
              {isAdmin && (
                <View className="mt-1 self-start px-2 py-0.5 rounded-md bg-[#0fe69b]/10">
                  <Text
                    style={{ color: BRAND.primaryColor }}
                    className="text-xs font-semibold"
                  >
                    Admin
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View className="bg-[#171717] border border-[#262626] rounded-2xl overflow-hidden mb-6">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              className={`flex-row items-center px-5 py-4 ${
                index < menuItems.length - 1 ? "border-b border-[#262626]" : ""
              }`}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <item.icon size={20} color="#a3a3a3" />
              <Text className="text-white text-base flex-1 ml-4">
                {item.label}
              </Text>
              <ChevronRight size={18} color="#525252" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          className="bg-[#171717] border border-red-500/20 rounded-2xl flex-row items-center justify-center py-4 mb-8"
          onPress={signOut}
          activeOpacity={0.7}
        >
          <LogOut size={18} color="#ef4444" />
          <Text className="text-red-400 font-semibold ml-2">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
