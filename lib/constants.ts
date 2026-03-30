export const BELT_RANKS = [
  { value: "white", label: "White", color: "#FFFFFF" },
  { value: "blue", label: "Blue", color: "#0066CC" },
  { value: "purple", label: "Purple", color: "#6B21A8" },
  { value: "brown", label: "Brown", color: "#8B4513" },
  { value: "black", label: "Black", color: "#1a1a1a" },
] as const;

export const CLASS_TYPES = [
  { value: "gi", label: "Gi" },
  { value: "nogi", label: "No Gi" },
  { value: "kids", label: "Kids" },
  { value: "fundamentals", label: "Fundamentals" },
  { value: "competition", label: "Competition" },
  { value: "womens", label: "Women's" },
  { value: "self_defense", label: "Self Defense" },
] as const;

export const SCHEDULE_TOPICS = [
  "Mount Escapes",
  "Guard Retention",
  "Takedowns",
  "Guard Passing",
  "Back Control",
  "Side Control",
  "Submissions from Guard",
  "Submissions from Mount",
  "Half Guard",
  "Open Guard",
  "Butterfly Guard",
  "Spider Guard",
  "De La Riva",
  "X Guard",
  "Leg Locks",
  "Wrestling",
  "Judo Throws",
  "Self Defense",
  "Competition Prep",
] as const;

export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const GI_SIZES = ["A0", "A1", "A2", "A3", "A4", "A5", "A6"] as const;
export const APPAREL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export const BELT_SIZES = ["A0", "A1", "A2", "A3", "A4", "A5"] as const;

export const ORDER_STATUSES = [
  { value: "pending", label: "Pending", color: "#f59e0b" },
  { value: "confirmed", label: "Confirmed", color: "#3b82f6" },
  { value: "shipped", label: "Shipped", color: "#8b5cf6" },
  { value: "delivered", label: "Delivered", color: "#10b981" },
  { value: "cancelled", label: "Cancelled", color: "#ef4444" },
] as const;

export const BRAND = {
  name: "MatFlow",
  primaryColor: "#0fe69b",
  darkBg: "#0a0a0a",
  darkSurface: "#171717",
  darkBorder: "#262626",
} as const;
