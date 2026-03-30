import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/auth-store";
import { BRAND } from "@/lib/constants";

export default function SettingsAdmin() {
  const { activeMembership } = useAuthStore();
  const gym = activeMembership?.gym;

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="gap-4 mt-4">
          <View className="bg-[#171717] border border-[#262626] rounded-2xl p-5">
            <Text className="text-neutral-500 text-xs uppercase tracking-wider mb-1">
              Academy Name
            </Text>
            <Text className="text-white text-lg font-bold">
              {gym?.name || "Not set"}
            </Text>
          </View>

          <View className="bg-[#171717] border border-[#262626] rounded-2xl p-5">
            <Text className="text-neutral-500 text-xs uppercase tracking-wider mb-1">
              URL Slug
            </Text>
            <Text className="text-white text-lg">
              {gym?.slug || "Not set"}
            </Text>
          </View>

          <View className="bg-[#171717] border border-[#262626] rounded-2xl p-5">
            <Text className="text-neutral-500 text-xs uppercase tracking-wider mb-1">
              Brand Color
            </Text>
            <View className="flex-row items-center gap-3 mt-1">
              <View
                className="w-8 h-8 rounded-lg"
                style={{
                  backgroundColor: gym?.primary_color || BRAND.primaryColor,
                }}
              />
              <Text className="text-white text-lg">
                {gym?.primary_color || BRAND.primaryColor}
              </Text>
            </View>
          </View>

          <View className="bg-[#171717] border border-[#262626] rounded-2xl p-5">
            <Text className="text-neutral-500 text-xs uppercase tracking-wider mb-1">
              Subscription
            </Text>
            <Text className="text-white text-lg">Free Trial (14 days)</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
