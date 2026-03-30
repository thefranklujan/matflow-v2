import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ShoppingBag } from "lucide-react-native";
import { theme, common } from "@/lib/theme";

export default function ShopTab() {
  return (
    <SafeAreaView style={common.screen}>
      <ScrollView style={common.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Pro Shop</Text>

        <View style={common.emptyState}>
          <ShoppingBag size={48} color={theme.colors.textFaint} />
          <Text style={common.emptyText}>No products available yet.</Text>
          <Text style={common.emptySubtext}>
            Your academy's gear will appear here.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    ...theme.typography.h2,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing["2xl"],
  },
});
