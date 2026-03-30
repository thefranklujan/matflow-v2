import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Camera, Check } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuthStore } from "@/stores/auth-store";
import { supabase } from "@/lib/supabase";
import { theme, common } from "@/lib/theme";

const COLOR_PRESETS = [
  "#0fe69b",
  "#3b82f6",
  "#8b5cf6",
  "#ef4444",
  "#f59e0b",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#6366f1",
  "#10b981",
  "#06b6d4",
  "#84cc16",
];

export default function SettingsAdmin() {
  const router = useRouter();
  const { activeMembership, initialize } = useAuthStore();
  const gymId = activeMembership?.gym_id;
  const gym = activeMembership?.gym;

  const [name, setName] = useState(gym?.name ?? "");
  const [slug, setSlug] = useState(gym?.slug ?? "");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [primaryColor, setPrimaryColor] = useState(
    gym?.primary_color ?? "#0fe69b"
  );
  const [logoUrl, setLogoUrl] = useState(gym?.logo_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Fetch full gym record on mount
  useEffect(() => {
    if (!gymId) return;
    (async () => {
      const { data } = await supabase
        .from("gyms")
        .select("*")
        .eq("id", gymId)
        .single();
      if (data) {
        setName(data.name);
        setSlug(data.slug);
        setPhone(data.phone ?? "");
        setWebsite(data.website ?? "");
        setPrimaryColor(data.primary_color);
        setLogoUrl(data.logo_url);
      }
      setLoaded(true);
    })();
  }, [gymId]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant photo library access to upload a logo"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    setUploading(true);
    try {
      const asset = result.assets[0];
      const ext = asset.uri.split(".").pop() || "jpg";
      const fileName = `${gymId}_logo_${Date.now()}.${ext}`;

      // Fetch the local file as a blob
      const response = await fetch(asset.uri);
      const blob = await response.blob();

      // Upload to Supabase Storage "logos" bucket
      const { data, error } = await supabase.storage
        .from("logos")
        .upload(fileName, blob, {
          cacheControl: "3600",
          upsert: true,
          contentType: asset.mimeType || `image/${ext}`,
        });

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("logos").getPublicUrl(data.path);

      setLogoUrl(publicUrl);

      // Save immediately to gym record
      await supabase
        .from("gyms")
        .update({ logo_url: publicUrl })
        .eq("id", gymId!);
    } catch (e: any) {
      Alert.alert("Upload Failed", e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!gymId) return;
    if (!name.trim()) {
      Alert.alert("Error", "Gym name is required");
      return;
    }
    if (!slug.trim()) {
      Alert.alert("Error", "URL slug is required");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("gyms")
        .update({
          name: name.trim(),
          slug: slug
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, ""),
          phone: phone.trim() || null,
          website: website.trim() || null,
          primary_color: primaryColor,
          logo_url: logoUrl,
        })
        .eq("id", gymId);

      if (error) throw error;

      // Re-initialize auth store so sidebar/header picks up changes
      await initialize();

      Alert.alert("Saved", "Settings updated successfully");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
    return (
      <SafeAreaView style={common.screen}>
        <View style={[common.emptyState, common.flex1]}>
          <ActivityIndicator size="large" color={theme.colors.brand} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={common.screen}>
      <ScrollView
        style={common.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={common.backRow}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color={theme.colors.brand} />
          <Text style={common.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={common.pageTitle}>Settings</Text>

        {/* Logo Upload */}
        <View style={styles.logoSection}>
          <Text style={styles.sectionLabel}>Logo</Text>
          <TouchableOpacity
            style={styles.logoContainer}
            onPress={handlePickImage}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color={theme.colors.brand} />
            ) : logoUrl ? (
              <Image source={{ uri: logoUrl }} style={styles.logoImage} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Camera size={28} color={theme.colors.textFaint} />
                <Text style={styles.logoPlaceholderText}>Tap to upload</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Fields */}
        <View style={styles.fieldGroup}>
          <Text style={common.inputLabel}>Academy Name</Text>
          <TextInput
            style={common.input}
            value={name}
            onChangeText={setName}
            placeholder="Your Academy"
            placeholderTextColor={theme.colors.placeholder}
          />

          <Text style={[common.inputLabel, { marginTop: theme.spacing.lg }]}>
            URL Slug
          </Text>
          <TextInput
            style={common.input}
            value={slug}
            onChangeText={setSlug}
            placeholder="your-academy"
            placeholderTextColor={theme.colors.placeholder}
            autoCapitalize="none"
          />

          <Text style={[common.inputLabel, { marginTop: theme.spacing.lg }]}>
            Phone
          </Text>
          <TextInput
            style={common.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="(555) 123-4567"
            placeholderTextColor={theme.colors.placeholder}
            keyboardType="phone-pad"
          />

          <Text style={[common.inputLabel, { marginTop: theme.spacing.lg }]}>
            Website
          </Text>
          <TextInput
            style={common.input}
            value={website}
            onChangeText={setWebsite}
            placeholder="https://youracademy.com"
            placeholderTextColor={theme.colors.placeholder}
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>

        {/* Color Picker */}
        <View style={styles.colorSection}>
          <Text style={styles.sectionLabel}>Brand Color</Text>
          <View style={styles.colorGrid}>
            {COLOR_PRESETS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[styles.colorSwatch, { backgroundColor: color }]}
                onPress={() => setPrimaryColor(color)}
              >
                {primaryColor === color && (
                  <Check size={18} color="#fff" />
                )}
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.colorPreview}>
            <View
              style={[
                styles.colorPreviewDot,
                { backgroundColor: primaryColor },
              ]}
            />
            <Text style={styles.colorPreviewText}>{primaryColor}</Text>
          </View>
        </View>

        {/* Subscription Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Subscription</Text>
          <Text style={styles.infoValue}>Free Trial (14 days)</Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[common.primaryButton, styles.saveBtn]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={theme.colors.bg} />
          ) : (
            <Text style={common.primaryButtonText}>Save Settings</Text>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    ...theme.typography.labelUppercase,
    marginBottom: theme.spacing.md,
  },
  logoSection: {
    marginBottom: theme.spacing["2xl"],
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.lg,
  },
  logoPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoPlaceholderText: {
    color: theme.colors.textFaint,
    fontSize: 11,
    marginTop: 4,
  },
  fieldGroup: {
    marginBottom: theme.spacing["2xl"],
  },
  colorSection: {
    marginBottom: theme.spacing["2xl"],
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  colorPreviewDot: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.sm,
  },
  colorPreviewText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing["2xl"],
  },
  infoLabel: {
    ...theme.typography.labelUppercase,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  infoValue: {
    color: theme.colors.text,
    fontSize: 16,
  },
  saveBtn: {
    marginBottom: theme.spacing.lg,
  },
  bottomSpacer: {
    height: 40,
  },
});
