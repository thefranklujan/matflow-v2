import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/auth-store";
import { BELT_RANKS, BRAND } from "@/lib/constants";

export default function ProgressTab() {
  const { activeMembership } = useAuthStore();
  const beltRank = activeMembership?.belt_rank || "white";
  const stripes = activeMembership?.stripes || 0;

  const currentBelt = BELT_RANKS.find((b) => b.value === beltRank);

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="text-white text-2xl font-bold mt-4 mb-6">
          My Progress
        </Text>

        {/* Belt Display */}
        <View className="bg-[#171717] border border-[#262626] rounded-2xl p-6 items-center mb-6">
          <Text className="text-neutral-500 text-xs uppercase tracking-wider mb-3">
            Current Rank
          </Text>
          <View
            className="w-full h-8 rounded-lg mb-3"
            style={{
              backgroundColor: currentBelt?.color || "#FFFFFF",
              borderWidth: beltRank === "white" ? 1 : 0,
              borderColor: "#404040",
            }}
          >
            {/* Stripe indicators */}
            <View className="flex-row items-center justify-end h-full pr-3 gap-1.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <View
                  key={i}
                  className={`w-2 h-5 rounded-sm ${
                    i < stripes ? "bg-yellow-400" : "bg-black/30"
                  }`}
                />
              ))}
            </View>
          </View>
          <Text className="text-white text-xl font-bold capitalize">
            {beltRank} Belt
          </Text>
          <Text className="text-neutral-500 text-sm mt-1">
            {stripes} / 4 Stripes
          </Text>
        </View>

        {/* Belt Journey */}
        <Text className="text-white text-lg font-bold mb-3">Belt Journey</Text>
        <View className="gap-3 mb-8">
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
                className={`flex-row items-center p-4 rounded-2xl border ${
                  isCurrent
                    ? "border-[#0fe69b]/50 bg-[#0fe69b]/5"
                    : "border-[#262626] bg-[#171717]"
                }`}
              >
                <View
                  className="w-10 h-5 rounded mr-4"
                  style={{
                    backgroundColor: belt.color,
                    borderWidth: belt.value === "white" ? 1 : 0,
                    borderColor: "#404040",
                  }}
                />
                <View className="flex-1">
                  <Text className="text-white font-semibold">{belt.label} Belt</Text>
                  <Text className="text-neutral-500 text-xs">
                    {isComplete
                      ? "Completed"
                      : isCurrent
                      ? "In Progress"
                      : "Upcoming"}
                  </Text>
                </View>
                {isCurrent && (
                  <Text style={{ color: BRAND.primaryColor }} className="text-xs font-semibold">
                    CURRENT
                  </Text>
                )}
                {isComplete && (
                  <Text className="text-neutral-500 text-xs">&#10003;</Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Technique Progress */}
        <Text className="text-white text-lg font-bold mb-3">Techniques</Text>
        <View className="bg-[#171717] border border-[#262626] rounded-2xl p-5 items-center mb-8">
          <Text className="text-neutral-500 text-sm">
            Technique tracking will appear as you progress.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
