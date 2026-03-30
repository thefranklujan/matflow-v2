import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Bell, ChevronRight, Settings } from "lucide-react-native";
import { useAuthStore } from "@/stores/auth-store";
import { useNetworkStore } from "@/stores/network-store";
import { BRAND } from "@/lib/constants";

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
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      {/* Offline banner */}
      {!isConnected && (
        <View className="bg-yellow-500/20 px-4 py-2">
          <Text className="text-yellow-400 text-xs text-center font-medium">
            You're offline. Changes will sync when you reconnect.
          </Text>
        </View>
      )}

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between mt-4 mb-6">
          <View>
            <Text className="text-neutral-500 text-sm">Welcome back,</Text>
            <Text className="text-white text-2xl font-bold">{firstName}</Text>
          </View>
          <View className="flex-row gap-3">
            {isAdmin && (
              <TouchableOpacity
                className="bg-[#171717] border border-[#262626] rounded-full p-3"
                onPress={() => router.push("/(admin)")}
              >
                <Settings size={20} color="#a3a3a3" />
              </TouchableOpacity>
            )}
            <TouchableOpacity className="bg-[#171717] border border-[#262626] rounded-full p-3">
              <Bell size={20} color="#a3a3a3" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Gym Card */}
        <View
          className="rounded-2xl p-5 mb-6"
          style={{ backgroundColor: BRAND.primaryColor + "15" }}
        >
          <Text className="text-neutral-400 text-xs uppercase tracking-wider mb-1">
            Academy
          </Text>
          <Text className="text-white text-xl font-bold">{gymName}</Text>
          <View className="flex-row items-center mt-3 gap-3">
            <View className="flex-row items-center gap-2">
              <View
                className="w-6 h-3 rounded-sm"
                style={{
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
                }}
              />
              <Text className="text-neutral-300 text-sm capitalize">
                {beltRank} Belt
              </Text>
            </View>
            {stripes > 0 && (
              <View className="flex-row gap-1">
                {Array.from({ length: stripes }).map((_, i) => (
                  <View
                    key={i}
                    className="w-1.5 h-3 bg-yellow-400 rounded-sm"
                  />
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Quick Stats */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-[#171717] border border-[#262626] rounded-2xl p-4">
            <Text className="text-neutral-500 text-xs mb-1">This Month</Text>
            <Text className="text-white text-2xl font-bold">0</Text>
            <Text className="text-neutral-500 text-xs">Classes</Text>
          </View>
          <View className="flex-1 bg-[#171717] border border-[#262626] rounded-2xl p-4">
            <Text className="text-neutral-500 text-xs mb-1">Streak</Text>
            <Text className="text-white text-2xl font-bold">0</Text>
            <Text className="text-neutral-500 text-xs">Weeks</Text>
          </View>
          <View className="flex-1 bg-[#171717] border border-[#262626] rounded-2xl p-4">
            <Text className="text-neutral-500 text-xs mb-1">Techniques</Text>
            <Text className="text-white text-2xl font-bold">0</Text>
            <Text className="text-neutral-500 text-xs">Learned</Text>
          </View>
        </View>

        {/* Today's Schedule */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white text-lg font-bold">
              Today's Classes
            </Text>
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => router.push("/(tabs)/schedule")}
            >
              <Text
                style={{ color: BRAND.primaryColor }}
                className="text-sm font-medium"
              >
                See All
              </Text>
              <ChevronRight size={16} color={BRAND.primaryColor} />
            </TouchableOpacity>
          </View>

          <View className="bg-[#171717] border border-[#262626] rounded-2xl p-5 items-center">
            <Text className="text-neutral-500 text-sm">
              No classes scheduled for today.
            </Text>
          </View>
        </View>

        {/* Announcements */}
        <View className="mb-8">
          <Text className="text-white text-lg font-bold mb-3">
            Announcements
          </Text>
          <View className="bg-[#171717] border border-[#262626] rounded-2xl p-5 items-center">
            <Text className="text-neutral-500 text-sm">
              No announcements yet.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
