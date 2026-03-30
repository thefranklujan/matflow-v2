import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, CheckCircle } from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";
import { theme, common } from "@/lib/theme";

interface GymInfo {
  id: string;
  name: string;
  slug: string;
  primary_color: string;
  logo_url: string | null;
}

export default function JoinGym() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { session, user, initialize } = useAuthStore();

  const [gym, setGym] = useState<GymInfo | null>(null);
  const [loadingGym, setLoadingGym] = useState(true);
  const [gymNotFound, setGymNotFound] = useState(false);

  // Auth form state (for users not signed in)
  const [mode, setMode] = useState<"info" | "signup" | "signin">("info");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
  const [alreadyMember, setAlreadyMember] = useState(false);

  // Fetch gym info
  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoadingGym(true);
      const { data, error } = await supabase
        .from("gyms")
        .select("id, name, slug, primary_color, logo_url")
        .eq("slug", slug)
        .single();

      if (error || !data) {
        setGymNotFound(true);
      } else {
        setGym(data as GymInfo);
      }
      setLoadingGym(false);
    })();
  }, [slug]);

  // If already signed in, check if already a member
  useEffect(() => {
    if (!session?.user || !gym) return;
    (async () => {
      const { data } = await supabase
        .from("gym_members")
        .select("id")
        .eq("gym_id", gym.id)
        .eq("profile_id", session.user.id)
        .single();

      if (data) {
        setAlreadyMember(true);
      }
    })();
  }, [session, gym]);

  const handleJoinGym = async (userId: string) => {
    if (!gym) return;

    // Check if already a member
    const { data: existing } = await supabase
      .from("gym_members")
      .select("id")
      .eq("gym_id", gym.id)
      .eq("profile_id", userId)
      .single();

    if (existing) {
      setAlreadyMember(true);
      return;
    }

    const { error: joinErr } = await supabase.from("gym_members").insert({
      gym_id: gym.id,
      profile_id: userId,
      role: "member",
      belt_rank: "white",
      stripes: 0,
      approved: false,
      active: true,
      joined_at: new Date().toISOString(),
    });

    if (joinErr) throw joinErr;
    setJoined(true);
    await initialize();
  };

  const handleSignUpAndJoin = async () => {
    if (!firstName.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: authErr } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          },
        },
      });

      if (authErr) throw authErr;
      if (!data.user) throw new Error("Sign up failed");

      await handleJoinGym(data.user.id);
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  };

  const handleSignInAndJoin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: authErr } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

      if (authErr) throw authErr;
      if (!data.user) throw new Error("Sign in failed");

      await handleJoinGym(data.user.id);
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  };

  const handleSignedInJoin = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      await handleJoinGym(user.id);
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  };

  // Loading gym
  if (loadingGym) {
    return (
      <SafeAreaView style={[common.screen, common.center, common.flex1]}>
        <ActivityIndicator size="large" color={theme.colors.brand} />
      </SafeAreaView>
    );
  }

  // Gym not found
  if (gymNotFound) {
    return (
      <SafeAreaView style={[common.screen, styles.centered]}>
        <Text style={styles.errorTitle}>Academy Not Found</Text>
        <Text style={styles.errorDesc}>
          No academy found with the code "{slug}". Check with your instructor
          for the correct link.
        </Text>
        <TouchableOpacity
          style={common.primaryButton}
          onPress={() => router.replace("/(auth)/sign-in")}
        >
          <Text style={common.primaryButtonText}>Go to Sign In</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Successfully joined
  if (joined) {
    return (
      <SafeAreaView style={[common.screen, styles.centered]}>
        <CheckCircle size={64} color={theme.colors.brand} />
        <Text style={styles.successTitle}>Request Sent!</Text>
        <Text style={styles.successDesc}>
          Your request to join{" "}
          <Text style={{ fontWeight: "700", color: theme.colors.text }}>
            {gym!.name}
          </Text>{" "}
          has been sent. The academy admin will review and approve your
          membership.
        </Text>
        <TouchableOpacity
          style={[common.primaryButton, { marginTop: theme.spacing["2xl"], width: "100%" }]}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={common.primaryButtonText}>Go to Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Already a member
  if (alreadyMember) {
    return (
      <SafeAreaView style={[common.screen, styles.centered]}>
        <CheckCircle size={64} color={theme.colors.brand} />
        <Text style={styles.successTitle}>Already a Member</Text>
        <Text style={styles.successDesc}>
          You're already part of{" "}
          <Text style={{ fontWeight: "700", color: theme.colors.text }}>
            {gym!.name}
          </Text>
          .
        </Text>
        <TouchableOpacity
          style={[common.primaryButton, { marginTop: theme.spacing["2xl"], width: "100%" }]}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={common.primaryButtonText}>Go to Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const brandColor = gym?.primary_color || theme.colors.brand;

  // Info screen — gym details + join options
  if (mode === "info") {
    return (
      <SafeAreaView style={common.screen}>
        <ScrollView
          contentContainerStyle={styles.infoContent}
          style={{ paddingHorizontal: theme.spacing.xl }}
        >
          {/* Gym Header */}
          <View style={styles.gymHeader}>
            <View
              style={[styles.gymInitial, { backgroundColor: brandColor + "20" }]}
            >
              <Text style={[styles.gymInitialText, { color: brandColor }]}>
                {gym!.name[0].toUpperCase()}
              </Text>
            </View>
            <Text style={styles.gymName}>{gym!.name}</Text>
            <Text style={styles.gymInvite}>
              You've been invited to join this academy
            </Text>
          </View>

          {/* Actions */}
          {session ? (
            // Already signed in — just join
            <View style={styles.actionSection}>
              <Text style={styles.signedInAs}>
                Signed in as{" "}
                <Text style={{ color: theme.colors.text }}>
                  {user?.email}
                </Text>
              </Text>
              <TouchableOpacity
                style={[common.primaryButton, { backgroundColor: brandColor }]}
                onPress={handleSignedInJoin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.bg} />
                ) : (
                  <Text style={common.primaryButtonText}>
                    Join {gym!.name}
                  </Text>
                )}
              </TouchableOpacity>
              {error && (
                <View style={common.errorBox}>
                  <Text style={common.errorText}>{error}</Text>
                </View>
              )}
            </View>
          ) : (
            // Not signed in — show signup/signin options
            <View style={styles.actionSection}>
              <TouchableOpacity
                style={[common.primaryButton, { backgroundColor: brandColor }]}
                onPress={() => setMode("signup")}
              >
                <Text style={common.primaryButtonText}>
                  Create Account & Join
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setMode("signin")}
              >
                <Text style={[styles.secondaryButtonText, { color: brandColor }]}>
                  I already have an account
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Sign Up form
  if (mode === "signup") {
    return (
      <SafeAreaView style={common.screen}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={common.flex1}
        >
          <ScrollView
            contentContainerStyle={styles.formContent}
            style={{ paddingHorizontal: theme.spacing.xl }}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity
              style={common.backRow}
              onPress={() => { setMode("info"); setError(null); }}
            >
              <ArrowLeft size={20} color={brandColor} />
              <Text style={[common.backText, { color: brandColor }]}>Back</Text>
            </TouchableOpacity>

            <Text style={styles.formTitle}>
              Join {gym!.name}
            </Text>
            <Text style={styles.formSubtitle}>
              Create your account to get started
            </Text>

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
                />
              </View>
            </View>

            <Text style={common.inputLabel}>Email *</Text>
            <TextInput
              style={common.input}
              placeholder="you@example.com"
              placeholderTextColor={theme.colors.placeholder}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={[common.inputLabel, { marginTop: theme.spacing.lg }]}>
              Password *
            </Text>
            <TextInput
              style={common.input}
              placeholder="At least 6 characters"
              placeholderTextColor={theme.colors.placeholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[common.primaryButton, { backgroundColor: brandColor, marginTop: theme.spacing["2xl"] }]}
              onPress={handleSignUpAndJoin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.bg} />
              ) : (
                <Text style={common.primaryButtonText}>
                  Create Account & Join
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Sign In form
  return (
    <SafeAreaView style={common.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={common.flex1}
      >
        <ScrollView
          contentContainerStyle={styles.formContent}
          style={{ paddingHorizontal: theme.spacing.xl }}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={common.backRow}
            onPress={() => { setMode("info"); setError(null); }}
          >
            <ArrowLeft size={20} color={brandColor} />
            <Text style={[common.backText, { color: brandColor }]}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.formTitle}>
            Join {gym!.name}
          </Text>
          <Text style={styles.formSubtitle}>
            Sign in to your existing account
          </Text>

          {error && (
            <View style={common.errorBox}>
              <Text style={common.errorText}>{error}</Text>
            </View>
          )}

          <Text style={common.inputLabel}>Email</Text>
          <TextInput
            style={common.input}
            placeholder="you@example.com"
            placeholderTextColor={theme.colors.placeholder}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={[common.inputLabel, { marginTop: theme.spacing.lg }]}>
            Password
          </Text>
          <TextInput
            style={common.input}
            placeholder="Your password"
            placeholderTextColor={theme.colors.placeholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[common.primaryButton, { backgroundColor: brandColor, marginTop: theme.spacing["2xl"] }]}
            onPress={handleSignInAndJoin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.bg} />
            ) : (
              <Text style={common.primaryButtonText}>
                Sign In & Join
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing["2xl"],
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  errorDesc: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: theme.spacing["3xl"],
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.text,
    marginTop: theme.spacing["2xl"],
    marginBottom: theme.spacing.md,
  },
  successDesc: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  infoContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  gymHeader: {
    alignItems: "center",
    marginBottom: theme.spacing["4xl"],
  },
  gymInitial: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.lg,
  },
  gymInitialText: {
    fontSize: 36,
    fontWeight: "700",
  },
  gymName: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  gymInvite: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  actionSection: {
    gap: theme.spacing.lg,
  },
  signedInAs: {
    color: theme.colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  secondaryButton: {
    paddingVertical: theme.spacing.lg,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  formContent: {
    flexGrow: 1,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 4,
  },
  formSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 16,
    marginBottom: theme.spacing.lg,
  },
  nameRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
});
