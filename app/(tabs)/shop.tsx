import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ShoppingBag } from "lucide-react-native";

export default function ShopTab() {
  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="text-white text-2xl font-bold mt-4 mb-6">
          Pro Shop
        </Text>

        <View className="flex-1 items-center justify-center py-20">
          <ShoppingBag size={48} color="#404040" />
          <Text className="text-neutral-500 text-base mt-4">
            No products available yet.
          </Text>
          <Text className="text-neutral-600 text-sm mt-1">
            Your academy's gear will appear here.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
