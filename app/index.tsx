import { Redirect } from "expo-router";
import { useAuthStore } from "@/stores/auth-store";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { theme } from "@/lib/theme";

export default function Index() {
  const { session, isLoading, isOnboarded } = useAuthStore();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.brand} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!isOnboarded) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.bg,
  },
});
