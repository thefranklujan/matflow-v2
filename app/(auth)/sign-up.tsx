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
  StyleSheet,
} from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { BRAND } from "@/lib/constants";
import { theme, common } from "@/lib/theme";

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
      <SafeAreaView style={[common.screen, styles.successContainer]}>
        <View style={styles.successContent}>
          <Text style={styles.successTitle}>Check Your Email</Text>
          <Text style={styles.successBody}>
            We sent a confirmation link to{" "}
            <Text style={styles.successEmail}>{email}</Text>. Tap it to
            activate your account.
          </Text>
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity style={styles.backLink}>
              <Text style={styles.backLinkText}>Back to Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={common.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={common.flex1}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>
              Mat<Text style={{ color: BRAND.primaryColor }}>Flow</Text>
            </Text>
            <Text style={styles.subtitle}>Create your account</Text>
          </View>

          <View style={styles.form}>
            {error && (
              <View style={common.errorBox}>
                <Text style={common.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.nameRow}>
              <View style={common.flex1}>
                <Text style={common.inputLabel}>First Name *</Text>
                <TextInput
                  style={common.input}
                  placeholder="First"
                  placeholderTextColor={theme.colors.placeholder}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoComplete="given-name"
                  textContentType="givenName"
                />
              </View>
              <View style={common.flex1}>
                <Text style={common.inputLabel}>Last Name</Text>
                <TextInput
                  style={common.input}
                  placeholder="Last"
                  placeholderTextColor={theme.colors.placeholder}
                  value={lastName}
                  onChangeText={setLastName}
                  autoComplete="family-name"
                  textContentType="familyName"
                />
              </View>
            </View>

            <View>
              <Text style={common.inputLabel}>Email *</Text>
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
              <Text style={common.inputLabel}>Password *</Text>
              <TextInput
                style={common.input}
                placeholder="At least 6 characters"
                placeholderTextColor={theme.colors.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textContentType="newPassword"
              />
            </View>

            <TouchableOpacity
              style={[common.primaryButton, styles.createButton]}
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.bg} />
              ) : (
                <Text style={common.primaryButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    paddingHorizontal: theme.spacing.xl + 4,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
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
  nameRow: {
    flexDirection: "row",
    gap: theme.spacing.lg,
  },
  createButton: {
    marginTop: theme.spacing.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: theme.spacing["3xl"],
    marginBottom: theme.spacing["3xl"],
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
  successContainer: {
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl + 4,
  },
  successContent: {
    alignItems: "center",
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  successBody: {
    color: theme.colors.textSecondary,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
  },
  successEmail: {
    color: theme.colors.text,
    fontWeight: "500",
  },
  backLink: {
    marginTop: theme.spacing["3xl"],
  },
  backLinkText: {
    color: theme.colors.brand,
    fontWeight: "600",
    fontSize: 16,
  },
});
