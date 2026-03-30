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
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";
import { BRAND } from "@/lib/constants";

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
      // Check slug availability
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

      // Create the gym
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

      // Add current user as gym_admin
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

      // Re-initialize auth to pick up new membership
      await initialize();
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

      // Add as pending member
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
      <SafeAreaView className="flex-1 bg-[#0a0a0a] justify-center px-6">
        <View className="items-center mb-12">
          <Text className="text-4xl font-bold text-white tracking-tight">
            Welcome to{" "}
            <Text style={{ color: BRAND.primaryColor }}>MatFlow</Text>
          </Text>
          <Text className="text-neutral-500 mt-3 text-base text-center">
            Are you setting up a new academy or joining one?
          </Text>
        </View>

        <View className="gap-4">
          <TouchableOpacity
            className="bg-[#171717] border border-[#262626] rounded-2xl p-6"
            onPress={() => setStep("create_gym")}
            activeOpacity={0.7}
          >
            <Text className="text-white text-lg font-bold mb-1">
              I'm an Academy Owner
            </Text>
            <Text className="text-neutral-500 text-sm">
              Set up your gym, manage members, schedule, pro shop, and more.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-[#171717] border border-[#262626] rounded-2xl p-6"
            onPress={() => setStep("join_gym")}
            activeOpacity={0.7}
          >
            <Text className="text-white text-lg font-bold mb-1">
              I'm a Student
            </Text>
            <Text className="text-neutral-500 text-sm">
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
            <TouchableOpacity onPress={() => setStep("role")} className="mb-8">
              <Text style={{ color: BRAND.primaryColor }} className="text-base">
                Back
              </Text>
            </TouchableOpacity>

            <Text className="text-3xl font-bold text-white mb-2">
              Set Up Your Academy
            </Text>
            <Text className="text-neutral-500 mb-8 text-base">
              This creates your gym's MatFlow account. You'll be the admin.
            </Text>

            <View className="gap-4">
              {error && (
                <View className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <Text className="text-red-400 text-sm text-center">
                    {error}
                  </Text>
                </View>
              )}

              <View>
                <Text className="text-neutral-400 text-sm mb-2 ml-1">
                  Academy Name *
                </Text>
                <TextInput
                  className="bg-[#171717] border border-[#262626] rounded-xl px-4 py-4 text-white text-base"
                  placeholder="e.g. Ceconi BJJ"
                  placeholderTextColor="#525252"
                  value={gymName}
                  onChangeText={handleSlugGenerate}
                />
              </View>

              <View>
                <Text className="text-neutral-400 text-sm mb-2 ml-1">
                  URL Slug
                </Text>
                <TextInput
                  className="bg-[#171717] border border-[#262626] rounded-xl px-4 py-4 text-white text-base"
                  placeholder="ceconi-bjj"
                  placeholderTextColor="#525252"
                  value={gymSlug}
                  onChangeText={setGymSlug}
                  autoCapitalize="none"
                />
                <Text className="text-neutral-600 text-xs mt-1 ml-1">
                  matflow.app/{gymSlug || "your-gym"}
                </Text>
              </View>

              <View>
                <Text className="text-neutral-400 text-sm mb-2 ml-1">
                  Timezone
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="gap-2"
                >
                  <View className="flex-row gap-2">
                    {TIMEZONES.map((tz) => (
                      <TouchableOpacity
                        key={tz}
                        className={`px-4 py-3 rounded-xl border ${
                          timezone === tz
                            ? "border-[#0fe69b] bg-[#0fe69b]/10"
                            : "border-[#262626] bg-[#171717]"
                        }`}
                        onPress={() => setTimezone(tz)}
                      >
                        <Text
                          className={`text-sm ${
                            timezone === tz ? "text-[#0fe69b]" : "text-neutral-400"
                          }`}
                        >
                          {tz.split("/")[1]?.replace("_", " ")}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <TouchableOpacity
                className="rounded-xl py-4 mt-4 items-center"
                style={{ backgroundColor: BRAND.primaryColor }}
                onPress={handleCreateGym}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#0a0a0a" />
                ) : (
                  <Text className="text-[#0a0a0a] font-bold text-base">
                    Create Academy
                  </Text>
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
    <SafeAreaView className="flex-1 bg-[#0a0a0a] justify-center px-6">
      <TouchableOpacity onPress={() => setStep("role")} className="mb-8">
        <Text style={{ color: BRAND.primaryColor }} className="text-base">
          Back
        </Text>
      </TouchableOpacity>

      <Text className="text-3xl font-bold text-white mb-2">
        Join Your Academy
      </Text>
      <Text className="text-neutral-500 mb-8 text-base">
        Enter the code or link your instructor gave you.
      </Text>

      <View className="gap-4">
        {error && (
          <View className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <Text className="text-red-400 text-sm text-center">{error}</Text>
          </View>
        )}

        <View>
          <Text className="text-neutral-400 text-sm mb-2 ml-1">
            Gym Code or Slug *
          </Text>
          <TextInput
            className="bg-[#171717] border border-[#262626] rounded-xl px-4 py-4 text-white text-base"
            placeholder="e.g. ceconi-bjj"
            placeholderTextColor="#525252"
            value={joinCode}
            onChangeText={setJoinCode}
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          className="rounded-xl py-4 mt-2 items-center"
          style={{ backgroundColor: BRAND.primaryColor }}
          onPress={handleJoinGym}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#0a0a0a" />
          ) : (
            <Text className="text-[#0a0a0a] font-bold text-base">
              Join Academy
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
