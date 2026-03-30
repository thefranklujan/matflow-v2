import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar } from "lucide-react-native";
import { theme, common } from "@/lib/theme";

export default function ScheduleManageAdmin() {
  return (
    <SafeAreaView style={common.screen}>
      <ScrollView style={common.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={common.emptyState}>
          <Calendar size={48} color={theme.colors.textFaint} />
          <Text style={common.emptyText}>No classes scheduled yet.</Text>
          <Text style={common.emptySubtext}>
            Add your first class to get started.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
