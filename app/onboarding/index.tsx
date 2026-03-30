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
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";
import { BRAND } from "@/lib/constants";
import { theme, common } from "@/lib/theme";

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Anchorage",
  "Pacific/Honolulu",
];

export default function Onboarding() {
  const router = useRouter();
  const { user, initialize } = useAuthStore();
  const [step, setStep] = useState<"role" | "create_gym" | "join_gym">("role");
  const [gymName, setGymName] = useState("");
  const [gymSlug, setGymSlug] = useState("");
  const [timezone, setTimezone] = useState("America/Chicago");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSlugGenerate = (name: string) => {
    setGymName(name);
    setGymSlug(
      name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 50)
    );
  };

  const handleCreateGym = async () => {
    if (!gymName.trim() || !gymSlug.trim()) {
      setError("Please enter a gym name.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: existing } = await supabase
        .from("gyms")
        .select("id")
        .eq("slug", gymSlug)
        .single();

      if (existing) {
        setError("That URL slug is already taken. Try a different name.");
        setLoading(false);
        return;
      }

      const { data: gym, error: gymError } = await supabase
        .from("gyms")
        .insert({
          name: gymName.trim(),
          slug: gymSlug,
          timezone,
          primary_color: BRAND.primaryColor,
          subscription_status: "trialing",
          trial_ends_at: new Date(
            Date.now() + 14 * 24 * 60 * 60 * 1000
          ).toISOString(),
        })
        .select()
        .single();

      if (gymError) throw gymError;

      const { error: memberError } = await supabase
        .from("gym_members")
        .insert({
          gym_id: gym.id,
          profile_id: user!.id,
          role: "gym_admin",
          belt_rank: "black",
          stripes: 0,
          approved: true,
          active: true,
          joined_at: new Date().toISOString(),
        });

      if (memberError) throw memberError;

      await initialize();
      router.replace("/(tabs)");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    }

    setLoading(false);
  };

  const handleJoinGym = async () => {
    if (!joinCode.trim()) {
      setError("Please enter a gym join code or URL slug.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: gym, error: gymError } = await supabase
        .from("gyms")
        .select("id, name")
        .eq("slug", joinCode.trim().toLowerCase())
        .single();

      if (gymError || !gym) {
        setError("No gym found with that code. Check with your instructor.");
        setLoading(false);
        return;
      }

      const { error: memberError } = await supabase
        .from("gym_members")
        .insert({
          gym_id: gym.id,
          profile_id: user!.id,
          role: "member",
          belt_rank: "white",
          stripes: 0,
          approved: false,
          active: true,
          joined_at: new Date().toISOString(),
        });

      if (memberError) {
        if (memberError.code === "23505") {
          setError("You're already a member of this gym.");
        } else {
          throw memberError;
        }
        setLoading(false);
        return;
      }

      await initialize();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    }

    setLoading(false);
  };

  // Step 1: Choose role
  if (step === "role") {
    return (
      <SafeAreaView style={[common.screen, styles.centered]}>
        <View style={styles.roleHeader}>
          <Text style={styles.roleTitle}>
            Welcome to{" "}
            <Text style={{ color: BRAND.primaryColor }}>MatFlow</Text>
          </Text>
          <Text style={styles.roleSubtitle}>
            Are you setting up a new academy or joining one?
          </Text>
        </View>

        <View style={styles.roleCards}>
          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => setStep("create_gym")}
            activeOpacity={0.7}
          >
            <Text style={styles.roleCardTitle}>I'm an Academy Owner</Text>
            <Text style={styles.roleCardDesc}>
              Set up your gym, manage members, schedule, pro shop, and more.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => setStep("join_gym")}
            activeOpacity={0.7}
          >
            <Text style={styles.roleCardTitle}>I'm a Student</Text>
            <Text style={styles.roleCardDesc}>
              Join your academy to track progress, view schedule, and shop gear.
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Step 2a: Create gym
  if (step === "create_gym") {
    return (
      <SafeAreaView style={common.screen}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={common.flex1}
        >
          <ScrollView
            contentContainerStyle={styles.createScrollContent}
            style={styles.scrollPadding}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity
              onPress={() => setStep("role")}
              style={styles.backButton}
            >
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            <Text style={styles.createTitle}>Set Up Your Academy</Text>
            <Text style={styles.createSubtitle}>
              This creates your gym's MatFlow account. You'll be the admin.
            </Text>

            <View style={styles.form}>
              {error && (
                <View style={common.errorBox}>
                  <Text style={common.errorText}>{error}</Text>
                </View>
              )}

              <View>
                <Text style={common.inputLabel}>Academy Name *</Text>
                <TextInput
                  style={common.input}
                  placeholder="e.g. Ceconi BJJ"
                  placeholderTextColor={theme.colors.placeholder}
                  value={gymName}
                  onChangeText={handleSlugGenerate}
                />
              </View>

              <View>
                <Text style={common.inputLabel}>URL Slug</Text>
                <TextInput
                  style={common.input}
                  placeholder="ceconi-bjj"
                  placeholderTextColor={theme.colors.placeholder}
                  value={gymSlug}
                  onChangeText={setGymSlug}
                  autoCapitalize="none"
                />
                <Text style={styles.slugHint}>
                  matflow.app/{gymSlug || "your-gym"}
                </Text>
              </View>

              <View>
                <Text style={common.inputLabel}>Timezone</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                >
                  <View style={styles.timezoneRow}>
                    {TIMEZONES.map((tz) => {
                      const isSelected = timezone === tz;
                      return (
                        <TouchableOpacity
                          key={tz}
                          style={[
                            styles.timezoneChip,
                            isSelected && styles.timezoneChipActive,
                          ]}
                          onPress={() => setTimezone(tz)}
                        >
                          <Text
                            style={[
                              styles.timezoneText,
                              isSelected && styles.timezoneTextActive,
                            ]}
                          >
                            {tz.split("/")[1]?.replace("_", " ")}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>

              <TouchableOpacity
                style={[common.primaryButton, styles.submitButton]}
                onPress={handleCreateGym}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.bg} />
                ) : (
                  <Text style={common.primaryButtonText}>Create Academy</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Step 2b: Join gym
  return (
    <SafeAreaView style={[common.screen, styles.joinContainer]}>
      <TouchableOpacity
        onPress={() => setStep("role")}
        style={styles.backButton}
      >
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.createTitle}>Join Your Academy</Text>
      <Text style={styles.createSubtitle}>
        Enter the code or link your instructor gave you.
      </Text>

      <View style={styles.form}>
        {error && (
          <View style={common.errorBox}>
            <Text style={common.errorText}>{error}</Text>
          </View>
        )}

        <View>
          <Text style={common.inputLabel}>Gym Code or Slug *</Text>
          <TextInput
            style={common.input}
            placeholder="e.g. ceconi-bjj"
            placeholderTextColor={theme.colors.placeholder}
            value={joinCode}
            onChangeText={setJoinCode}
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={[common.primaryButton, styles.joinButton]}
          onPress={handleJoinGym}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.bg} />
          ) : (
            <Text style={common.primaryButtonText}>Join Academy</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl + 4,
  },
  roleHeader: {
    alignItems: "center",
    marginBottom: theme.spacing["5xl"],
  },
  roleTitle: {
    fontSize: 36,
    fontWeight: "700",
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  roleSubtitle: {
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md,
    fontSize: 16,
    textAlign: "center",
  },
  roleCards: {
    gap: theme.spacing.lg,
  },
  roleCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing["2xl"],
  },
  roleCardTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  roleCardDesc: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  scrollPadding: {
    paddingHorizontal: theme.spacing.xl + 4,
  },
  createScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  backButton: {
    marginBottom: theme.spacing["3xl"],
  },
  backText: {
    color: theme.colors.brand,
    fontSize: 16,
  },
  createTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  createSubtitle: {
    color: theme.colors.textMuted,
    marginBottom: theme.spacing["3xl"],
    fontSize: 16,
  },
  form: {
    gap: theme.spacing.lg,
  },
  slugHint: {
    color: theme.colors.textFaint,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  timezoneRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  timezoneChip: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  timezoneChipActive: {
    borderColor: theme.colors.brand,
    backgroundColor: theme.colors.brandMuted,
  },
  timezoneText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  timezoneTextActive: {
    color: theme.colors.brand,
  },
  submitButton: {
    marginTop: theme.spacing.lg,
  },
  joinContainer: {
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl + 4,
  },
  joinButton: {
    marginTop: theme.spacing.sm,
  },
});
