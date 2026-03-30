import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { BRAND } from "@/lib/constants";

export default function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !firstName) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        },
      },
    });

    if (authError) {
      setError(authError.message);
    } else {
      setSuccess(true);
    }

    setLoading(false);
  };

  if (success) {
    return (
      <SafeAreaView className="flex-1 bg-[#0a0a0a] justify-center px-6">
        <View className="items-center">
          <Text className="text-3xl font-bold text-white mb-4">Check Your Email</Text>
          <Text className="text-neutral-400 text-center text-base leading-6">
            We sent a confirmation link to{" "}
            <Text className="text-white font-medium">{email}</Text>. Tap it to
            activate your account.
          </Text>
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity className="mt-8">
              <Text style={{ color: BRAND.primaryColor }} className="font-semibold text-base">
                Back to Sign In
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          className="px-6"
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center mb-12">
            <Text className="text-4xl font-bold text-white tracking-tight">
              Mat<Text style={{ color: BRAND.primaryColor }}>Flow</Text>
            </Text>
            <Text className="text-neutral-500 mt-2 text-base">
              Create your account
            </Text>
          </View>

          <View className="gap-4">
            {error && (
              <View className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <Text className="text-red-400 text-sm text-center">
                  {error}
                </Text>
              </View>
            )}

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-neutral-400 text-sm mb-2 ml-1">
                  First Name *
                </Text>
                <TextInput
                  className="bg-[#171717] border border-[#262626] rounded-xl px-4 py-4 text-white text-base"
                  placeholder="First"
                  placeholderTextColor="#525252"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoComplete="given-name"
                  textContentType="givenName"
                />
              </View>
              <View className="flex-1">
                <Text className="text-neutral-400 text-sm mb-2 ml-1">
                  Last Name
                </Text>
                <TextInput
                  className="bg-[#171717] border border-[#262626] rounded-xl px-4 py-4 text-white text-base"
                  placeholder="Last"
                  placeholderTextColor="#525252"
                  value={lastName}
                  onChangeText={setLastName}
                  autoComplete="family-name"
                  textContentType="familyName"
                />
              </View>
            </View>

            <View>
              <Text className="text-neutral-400 text-sm mb-2 ml-1">
                Email *
              </Text>
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
                Password *
              </Text>
              <TextInput
                className="bg-[#171717] border border-[#262626] rounded-xl px-4 py-4 text-white text-base"
                placeholder="At least 6 characters"
                placeholderTextColor="#525252"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textContentType="newPassword"
              />
            </View>

            <TouchableOpacity
              className="rounded-xl py-4 mt-2 items-center"
              style={{ backgroundColor: BRAND.primaryColor }}
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#0a0a0a" />
              ) : (
                <Text className="text-[#0a0a0a] font-bold text-base">
                  Create Account
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center mt-8 mb-8">
            <Text className="text-neutral-500">Already have an account? </Text>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity>
                <Text
                  style={{ color: BRAND.primaryColor }}
                  className="font-semibold"
                >
                  Sign In
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
