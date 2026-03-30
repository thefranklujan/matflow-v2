import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  ShoppingBag,
  Plus,
  Pencil,
  Trash2,
  Star,
  X,
} from "lucide-react-native";
import { useAuthStore } from "@/stores/auth-store";
import { supabase } from "@/lib/supabase";
import { theme, common } from "@/lib/theme";

interface ProductRow {
  id: string;
  gym_id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  featured: boolean;
  active: boolean;
}

const INITIAL_FORM = {
  name: "",
  description: "",
  price: "",
  compare_at_price: "",
  featured: false,
  active: true,
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ProductsManageAdmin() {
  const router = useRouter();
  const { activeMembership } = useAuthStore();
  const gymId = activeMembership?.gym_id;

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);

  const fetchProducts = useCallback(async () => {
    if (!gymId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("products")
        .select("*")
        .eq("gym_id", gymId)
        .order("created_at", { ascending: false });

      if (err) throw err;
      setProducts((data as ProductRow[]) ?? []);
    } catch (e: any) {
      setError(e.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [gymId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openAddModal = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setModalVisible(true);
  };

  const openEditModal = (product: ProductRow) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description ?? "",
      price: product.price.toString(),
      compare_at_price: product.compare_at_price
        ? product.compare_at_price.toString()
        : "",
      featured: product.featured,
      active: product.active,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!gymId) return;
    if (!form.name.trim()) {
      Alert.alert("Error", "Product name is required");
      return;
    }
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0) {
      Alert.alert("Error", "Enter a valid price");
      return;
    }
    const compareAt = form.compare_at_price
      ? parseFloat(form.compare_at_price)
      : null;

    setSaving(true);
    try {
      const payload = {
        gym_id: gymId,
        name: form.name.trim(),
        slug: slugify(form.name.trim()),
        description: form.description.trim() || null,
        price,
        compare_at_price: compareAt,
        featured: form.featured,
        active: form.active,
      };

      if (editingId) {
        const { error: err } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingId);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from("products").insert(payload);
        if (err) throw err;
      }

      setModalVisible(false);
      await fetchProducts();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (product: ProductRow) => {
    Alert.alert("Delete Product", `Remove "${product.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const { error: err } = await supabase
              .from("products")
              .delete()
              .eq("id", product.id);
            if (err) throw err;
            await fetchProducts();
          } catch (e: any) {
            Alert.alert("Error", e.message);
          }
        },
      },
    ]);
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

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

        <View style={styles.headerRow}>
          <Text style={common.pageTitle}>Products</Text>
          <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
            <Plus size={18} color={theme.colors.bg} />
            <Text style={styles.addBtnText}>Add Product</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={common.emptyState}>
            <ActivityIndicator size="large" color={theme.colors.brand} />
          </View>
        ) : error ? (
          <View style={common.errorBox}>
            <Text style={common.errorText}>{error}</Text>
          </View>
        ) : products.length === 0 ? (
          <View style={common.emptyState}>
            <ShoppingBag size={40} color={theme.colors.textFaint} />
            <Text style={common.emptyText}>No products yet</Text>
            <Text style={common.emptySubtext}>
              Add gear and apparel for your pro shop
            </Text>
          </View>
        ) : (
          <View style={styles.cardList}>
            {products.map((product) => (
              <View key={product.id} style={styles.productCard}>
                <View style={common.flex1}>
                  <View style={styles.productNameRow}>
                    <Text style={styles.productName}>{product.name}</Text>
                    {product.featured && (
                      <Star
                        size={14}
                        color={theme.colors.yellow}
                        fill={theme.colors.yellow}
                      />
                    )}
                  </View>
                  {product.description && (
                    <Text style={styles.productDesc} numberOfLines={2}>
                      {product.description}
                    </Text>
                  )}
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>
                      {formatPrice(product.price)}
                    </Text>
                    {product.compare_at_price &&
                      product.compare_at_price > product.price && (
                        <Text style={styles.comparePrice}>
                          {formatPrice(product.compare_at_price)}
                        </Text>
                      )}
                  </View>
                  <View
                    style={[
                      styles.statusChip,
                      product.active
                        ? styles.activeChip
                        : styles.inactiveChip,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusChipText,
                        product.active
                          ? styles.activeChipText
                          : styles.inactiveChipText,
                      ]}
                    >
                      {product.active ? "Active" : "Inactive"}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => openEditModal(product)}
                  >
                    <Pencil size={16} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => handleDelete(product)}
                  >
                    <Trash2 size={16} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Add / Edit Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? "Edit Product" : "Add Product"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={22} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={common.inputLabel}>Name</Text>
              <TextInput
                style={common.input}
                value={form.name}
                onChangeText={(v) => setForm({ ...form, name: v })}
                placeholder="Product name"
                placeholderTextColor={theme.colors.placeholder}
              />

              <Text
                style={[common.inputLabel, { marginTop: theme.spacing.lg }]}
              >
                Description
              </Text>
              <TextInput
                style={[common.input, styles.multiline]}
                value={form.description}
                onChangeText={(v) => setForm({ ...form, description: v })}
                placeholder="Product description"
                placeholderTextColor={theme.colors.placeholder}
                multiline
                numberOfLines={3}
              />

              <View style={styles.priceInputRow}>
                <View style={common.flex1}>
                  <Text
                    style={[
                      common.inputLabel,
                      { marginTop: theme.spacing.lg },
                    ]}
                  >
                    Price ($)
                  </Text>
                  <TextInput
                    style={common.input}
                    value={form.price}
                    onChangeText={(v) => setForm({ ...form, price: v })}
                    placeholder="0.00"
                    placeholderTextColor={theme.colors.placeholder}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={common.flex1}>
                  <Text
                    style={[
                      common.inputLabel,
                      { marginTop: theme.spacing.lg },
                    ]}
                  >
                    Compare at ($)
                  </Text>
                  <TextInput
                    style={common.input}
                    value={form.compare_at_price}
                    onChangeText={(v) =>
                      setForm({ ...form, compare_at_price: v })
                    }
                    placeholder="Optional"
                    placeholderTextColor={theme.colors.placeholder}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Featured</Text>
                <Switch
                  value={form.featured}
                  onValueChange={(v) => setForm({ ...form, featured: v })}
                  trackColor={{
                    false: theme.colors.border,
                    true: theme.colors.brand,
                  }}
                  thumbColor="#fff"
                />
              </View>

              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Active</Text>
                <Switch
                  value={form.active}
                  onValueChange={(v) => setForm({ ...form, active: v })}
                  trackColor={{
                    false: theme.colors.border,
                    true: theme.colors.brand,
                  }}
                  thumbColor="#fff"
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[common.primaryButton, common.flex1]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color={theme.colors.bg} />
                  ) : (
                    <Text style={common.primaryButtonText}>
                      {editingId ? "Update" : "Add Product"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing["2xl"],
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.brand,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  addBtnText: {
    color: theme.colors.bg,
    fontWeight: "700",
    fontSize: 14,
  },
  cardList: {
    gap: theme.spacing.md,
  },
  productCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  productNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  productName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  productDesc: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  price: {
    color: theme.colors.brand,
    fontSize: 16,
    fontWeight: "700",
  },
  comparePrice: {
    color: theme.colors.textFaint,
    fontSize: 14,
    textDecorationLine: "line-through",
  },
  statusChip: {
    alignSelf: "flex-start",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.sm,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: "600",
  },
  activeChip: {
    backgroundColor: "rgba(15, 230, 155, 0.1)",
  },
  activeChipText: {
    color: theme.colors.brand,
  },
  inactiveChip: {
    backgroundColor: theme.colors.errorMuted,
  },
  inactiveChipText: {
    color: theme.colors.error,
  },
  cardActions: {
    gap: theme.spacing.md,
    marginLeft: theme.spacing.md,
  },
  iconBtn: {
    padding: theme.spacing.sm,
  },
  bottomSpacer: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    paddingBottom: 40,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  modalTitle: {
    ...theme.typography.h3,
  },
  multiline: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: theme.spacing.md,
  },
  priceInputRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
  },
  toggleLabel: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginTop: theme.spacing["2xl"],
  },
  modalCancel: {
    flex: 1,
    paddingVertical: theme.spacing.lg,
    alignItems: "center",
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalCancelText: {
    color: theme.colors.textSecondary,
    fontWeight: "600",
    fontSize: 16,
  },
});
