import { StyleSheet, TextStyle, ViewStyle } from "react-native";

export const theme = {
  colors: {
    brand: "#0fe69b",
    brandDark: "#0a0a0a",
    brandMuted: "rgba(15, 230, 155, 0.1)",
    brandSubtle: "rgba(15, 230, 155, 0.05)",
    brandBorder: "rgba(15, 230, 155, 0.5)",

    bg: "#0a0a0a",
    surface: "#171717",
    surfaceRaised: "#1f1f1f",
    border: "#262626",
    borderSubtle: "#1f1f1f",

    text: "#FFFFFF",
    textSecondary: "#a3a3a3",
    textMuted: "#737373",
    textSubtle: "#525252",
    textFaint: "#404040",

    error: "#ef4444",
    errorMuted: "rgba(239, 68, 68, 0.1)",
    errorBorder: "rgba(239, 68, 68, 0.3)",

    warning: "#f59e0b",
    warningMuted: "rgba(245, 158, 11, 0.2)",

    yellow: "#facc15",

    placeholder: "#525252",
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    "2xl": 24,
    "3xl": 32,
    "4xl": 40,
    "5xl": 48,
  },

  typography: {
    h1: {
      fontSize: 32,
      fontWeight: "700" as TextStyle["fontWeight"],
      color: "#FFFFFF",
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 24,
      fontWeight: "700" as TextStyle["fontWeight"],
      color: "#FFFFFF",
    },
    h3: {
      fontSize: 20,
      fontWeight: "700" as TextStyle["fontWeight"],
      color: "#FFFFFF",
    },
    h4: {
      fontSize: 18,
      fontWeight: "700" as TextStyle["fontWeight"],
      color: "#FFFFFF",
    },
    body: {
      fontSize: 16,
      fontWeight: "400" as TextStyle["fontWeight"],
      color: "#FFFFFF",
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: "400" as TextStyle["fontWeight"],
      color: "#a3a3a3",
    },
    caption: {
      fontSize: 12,
      fontWeight: "400" as TextStyle["fontWeight"],
      color: "#737373",
    },
    label: {
      fontSize: 14,
      fontWeight: "400" as TextStyle["fontWeight"],
      color: "#a3a3a3",
    },
    labelUppercase: {
      fontSize: 12,
      fontWeight: "600" as TextStyle["fontWeight"],
      color: "#737373",
      textTransform: "uppercase" as TextStyle["textTransform"],
      letterSpacing: 1,
    },
    button: {
      fontSize: 16,
      fontWeight: "700" as TextStyle["fontWeight"],
    },
    buttonSmall: {
      fontSize: 14,
      fontWeight: "600" as TextStyle["fontWeight"],
    },
    tabLabel: {
      fontSize: 11,
      fontWeight: "600" as TextStyle["fontWeight"],
    },
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },

  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
    },
  },
} as const;

/** Reusable common styles */
export const common = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
  },
  cardCompact: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    color: theme.colors.text,
    fontSize: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    marginLeft: 4,
  },
  primaryButton: {
    backgroundColor: theme.colors.brand,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.lg,
    alignItems: "center" as ViewStyle["alignItems"],
  },
  primaryButtonText: {
    color: theme.colors.bg,
    fontSize: 16,
    fontWeight: "700" as TextStyle["fontWeight"],
  },
  errorBox: {
    backgroundColor: theme.colors.errorMuted,
    borderWidth: 1,
    borderColor: theme.colors.errorBorder,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    textAlign: "center" as TextStyle["textAlign"],
  },
  row: {
    flexDirection: "row" as ViewStyle["flexDirection"],
    alignItems: "center" as ViewStyle["alignItems"],
  },
  center: {
    alignItems: "center" as ViewStyle["alignItems"],
    justifyContent: "center" as ViewStyle["justifyContent"],
  },
  flex1: {
    flex: 1,
  },
  emptyState: {
    alignItems: "center" as ViewStyle["alignItems"],
    justifyContent: "center" as ViewStyle["justifyContent"],
    paddingVertical: 80,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 16,
    marginTop: theme.spacing.lg,
  },
  emptySubtext: {
    color: theme.colors.textFaint,
    fontSize: 14,
    marginTop: 4,
  },
  backRow: {
    flexDirection: "row" as ViewStyle["flexDirection"],
    alignItems: "center" as ViewStyle["alignItems"],
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  backText: {
    color: theme.colors.brand,
    fontWeight: "500" as TextStyle["fontWeight"],
    marginLeft: 4,
    fontSize: 15,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "700" as TextStyle["fontWeight"],
    color: "#FFFFFF",
    marginBottom: theme.spacing["2xl"],
  },
});
