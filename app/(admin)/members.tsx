import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Users } from "lucide-react-native";
import { theme, common } from "@/lib/theme";

export default function MembersAdmin() {
  return (
    <SafeAreaView style={common.screen}>
      <ScrollView style={common.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={common.emptyState}>
          <Users size={48} color={theme.colors.textFaint} />
          <Text style={common.emptyText}>No members yet.</Text>
          <Text style={common.emptySubtext}>
            Share your gym's join code to invite students.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
