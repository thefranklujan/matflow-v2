import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { BRAND } from "@/lib/constants";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError) {
      setError(authError.message);
    }

    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center px-6"
      >
        <View className="items-center mb-12">
          <Text className="text-4xl font-bold text-white tracking-tight">
            Mat<Text style={{ color: BRAND.primaryColor }}>Flow</Text>
          </Text>
          <Text className="text-neutral-500 mt-2 text-base">
            Sign in to your academy
          </Text>
        </View>

        <View className="gap-4">
          {error && (
            <View className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <Text className="text-red-400 text-sm text-center">{error}</Text>
            </View>
          )}

          <View>
            <Text className="text-neutral-400 text-sm mb-2 ml-1">Email</Text>
            <TextInput
              className="bg-[#171717] border border-[#262626] rounded-xl px-4 py-4 text-white text-base"
              placeholder="you@example.com"
              placeholderTextColor="#525252"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
            />
          </View>

          <View>
            <Text className="text-neutral-400 text-sm mb-2 ml-1">
              Password
            </Text>
            <TextInput
              className="bg-[#171717] border border-[#262626] rounded-xl px-4 py-4 text-white text-base"
              placeholder="Your password"
              placeholderTextColor="#525252"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="password"
            />
          </View>

          <TouchableOpacity
            className="rounded-xl py-4 mt-2 items-center"
            style={{ backgroundColor: BRAND.primaryColor }}
            onPress={handleSignIn}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#0a0a0a" />
            ) : (
              <Text className="text-[#0a0a0a] font-bold text-base">
                Sign In
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-8">
          <Text className="text-neutral-500">No account yet? </Text>
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity>
              <Text style={{ color: BRAND.primaryColor }} className="font-semibold">
                Sign Up
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
