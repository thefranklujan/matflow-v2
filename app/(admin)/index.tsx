import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Users,
  Calendar,
  ShoppingBag,
  Settings,
  ChevronRight,
  ArrowLeft,
} from "lucide-react-native";
import { BRAND } from "@/lib/constants";
import { useAuthStore } from "@/stores/auth-store";

export default function AdminDashboard() {
  const router = useRouter();
  const { activeMembership } = useAuthStore();
  const gymName = activeMembership?.gym?.name || "Your Academy";

  const adminCards = [
    {
      icon: Users,
      title: "Members",
      description: "Manage roster, belt promotions, approvals",
      route: "/(admin)/members" as const,
      count: null,
    },
    {
      icon: Calendar,
      title: "Class Schedule",
      description: "Set up weekly classes and instructors",
      route: "/(admin)/schedule-manage" as const,
      count: null,
    },
    {
      icon: ShoppingBag,
      title: "Pro Shop",
      description: "Products, inventory, orders",
      route: "/(admin)/products-manage" as const,
      count: null,
    },
    {
      icon: Settings,
      title: "Settings",
      description: "Gym name, colors, branding, billing",
      route: "/(admin)/settings" as const,
      count: null,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <TouchableOpacity
          className="flex-row items-center mt-2 mb-4"
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color={BRAND.primaryColor} />
          <Text
            style={{ color: BRAND.primaryColor }}
            className="ml-1 font-medium"
          >
            Back
          </Text>
        </TouchableOpacity>

        <Text className="text-white text-2xl font-bold mb-1">
          Admin Dashboard
        </Text>
        <Text className="text-neutral-500 text-sm mb-6">{gymName}</Text>

        {/* Quick Stats */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-[#171717] border border-[#262626] rounded-2xl p-4">
            <Text className="text-neutral-500 text-xs">Members</Text>
            <Text className="text-white text-2xl font-bold mt-1">0</Text>
          </View>
          <View className="flex-1 bg-[#171717] border border-[#262626] rounded-2xl p-4">
            <Text className="text-neutral-500 text-xs">Classes/Week</Text>
            <Text className="text-white text-2xl font-bold mt-1">0</Text>
          </View>
          <View className="flex-1 bg-[#171717] border border-[#262626] rounded-2xl p-4">
            <Text className="text-neutral-500 text-xs">Orders</Text>
            <Text className="text-white text-2xl font-bold mt-1">0</Text>
          </View>
        </View>

        {/* Admin Cards */}
        <View className="gap-3 mb-8">
          {adminCards.map((card) => (
            <TouchableOpacity
              key={card.title}
              className="bg-[#171717] border border-[#262626] rounded-2xl p-5 flex-row items-center"
              onPress={() => router.push(card.route)}
              activeOpacity={0.7}
            >
              <View
                className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: BRAND.primaryColor + "15" }}
              >
                <card.icon size={22} color={BRAND.primaryColor} />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-base">
                  {card.title}
                </Text>
                <Text className="text-neutral-500 text-sm mt-0.5">
                  {card.description}
                </Text>
              </View>
              <ChevronRight size={18} color="#525252" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
