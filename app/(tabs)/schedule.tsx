import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DAYS_OF_WEEK, BRAND } from "@/lib/constants";

export default function ScheduleTab() {
  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="text-white text-2xl font-bold mt-4 mb-6">
          Class Schedule
        </Text>

        {DAYS_OF_WEEK.map((day, index) => (
          <View key={day} className="mb-4">
            <Text className="text-neutral-400 text-sm font-semibold uppercase tracking-wider mb-2">
              {day}
            </Text>
            <View className="bg-[#171717] border border-[#262626] rounded-2xl p-4">
              <Text className="text-neutral-500 text-sm text-center">
                No classes scheduled
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
