import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/auth-store";
import { BRAND } from "@/lib/constants";
import { theme, common } from "@/lib/theme";

export default function SettingsAdmin() {
  const { activeMembership } = useAuthStore();
  const gym = activeMembership?.gym;

  return (
    <SafeAreaView style={common.screen}>
      <ScrollView style={common.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.cardList}>
          <View style={common.card}>
            <Text style={styles.cardLabel}>Academy Name</Text>
            <Text style={styles.cardValue}>{gym?.name || "Not set"}</Text>
          </View>

          <View style={common.card}>
            <Text style={styles.cardLabel}>URL Slug</Text>
            <Text style={styles.cardValueLight}>{gym?.slug || "Not set"}</Text>
          </View>

          <View style={common.card}>
            <Text style={styles.cardLabel}>Brand Color</Text>
            <View style={styles.colorRow}>
              <View
                style={[
                  styles.colorSwatch,
                  {
                    backgroundColor:
                      gym?.primary_color || BRAND.primaryColor,
                  },
                ]}
              />
              <Text style={styles.cardValueLight}>
                {gym?.primary_color || BRAND.primaryColor}
              </Text>
            </View>
          </View>

          <View style={common.card}>
            <Text style={styles.cardLabel}>Subscription</Text>
            <Text style={styles.cardValueLight}>Free Trial (14 days)</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cardList: {
    gap: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  cardLabel: {
    ...theme.typography.labelUppercase,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  cardValue: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  cardValueLight: {
    color: theme.colors.text,
    fontSize: 18,
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    marginTop: 4,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.sm,
  },
});
