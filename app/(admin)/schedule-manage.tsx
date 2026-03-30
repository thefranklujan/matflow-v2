import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar } from "lucide-react-native";

export default function ScheduleManageAdmin() {
  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="flex-1 items-center justify-center py-20">
          <Calendar size={48} color="#404040" />
          <Text className="text-neutral-500 text-base mt-4">
            No classes scheduled yet.
          </Text>
          <Text className="text-neutral-600 text-sm mt-1">
            Add your first class to get started.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
