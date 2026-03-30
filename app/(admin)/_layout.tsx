import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#0a0a0a" },
        headerTintColor: "#ffffff",
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Admin Dashboard" }} />
      <Stack.Screen name="members" options={{ title: "Members" }} />
      <Stack.Screen name="schedule-manage" options={{ title: "Manage Schedule" }} />
      <Stack.Screen name="products-manage" options={{ title: "Products" }} />
      <Stack.Screen name="settings" options={{ title: "Gym Settings" }} />
    </Stack>
  );
}
