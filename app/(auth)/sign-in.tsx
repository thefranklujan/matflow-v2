import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";
import { BRAND } from "@/lib/constants";
import { theme, common } from "@/lib/theme";

export default function SignIn() {
  const router = useRouter();
  const initialize = useAuthStore((s) => s.initialize);
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
      setLoading(false);
      return;
    }

    // Fetch profile and memberships
    await initialize();

    const { isOnboarded } = useAuthStore.getState();
    if (isOnboarded) {
      router.replace("/(tabs)");
    } else {
      router.replace("/onboarding");
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={common.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            Mat<Text style={{ color: BRAND.primaryColor }}>Flow</Text>
          </Text>
          <Text style={styles.subtitle}>Sign in to your academy</Text>
        </View>

        <View style={styles.form}>
          {error && (
            <View style={common.errorBox}>
              <Text style={common.errorText}>{error}</Text>
            </View>
          )}

          <View>
            <Text style={common.inputLabel}>Email</Text>
            <TextInput
              style={common.input}
              placeholder="you@example.com"
              placeholderTextColor={theme.colors.placeholder}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
            />
          </View>

          <View>
            <Text style={common.inputLabel}>Password</Text>
            <TextInput
              style={common.input}
              placeholder="Your password"
              placeholderTextColor={theme.colors.placeholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="password"
            />
          </View>

          <TouchableOpacity
            style={[common.primaryButton, styles.signInButton]}
            onPress={handleSignIn}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.bg} />
            ) : (
              <Text style={common.primaryButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>No account yet? </Text>
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl + 4,
  },
  header: {
    alignItems: "center",
    marginBottom: theme.spacing["5xl"],
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
    fontSize: 16,
  },
  form: {
    gap: theme.spacing.lg,
  },
  signInButton: {
    marginTop: theme.spacing.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: theme.spacing["3xl"],
  },
  footerText: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  footerLink: {
    color: theme.colors.brand,
    fontWeight: "600",
    fontSize: 14,
  },
});
