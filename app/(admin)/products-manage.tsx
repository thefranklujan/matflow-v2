import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ShoppingBag } from "lucide-react-native";
import { theme, common } from "@/lib/theme";

export default function ProductsManageAdmin() {
  return (
    <SafeAreaView style={common.screen}>
      <ScrollView style={common.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={common.emptyState}>
          <ShoppingBag size={48} color={theme.colors.textFaint} />
          <Text style={common.emptyText}>No products yet.</Text>
          <Text style={common.emptySubtext}>
            Add gear and apparel for your pro shop.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
