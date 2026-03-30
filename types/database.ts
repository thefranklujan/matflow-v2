export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type BeltRank = "white" | "blue" | "purple" | "brown" | "black";

export type ClassType =
  | "gi"
  | "nogi"
  | "kids"
  | "fundamentals"
  | "competition"
  | "womens"
  | "self_defense";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type UserRole = "super_admin" | "gym_admin" | "instructor" | "member";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "cancelled"
  | "inactive";

export interface Database {
  public: {
    Tables: {
      gyms: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          primary_color: string;
          secondary_color: string | null;
          timezone: string;
          phone: string | null;
          website: string | null;
          stripe_customer_id: string | null;
          subscription_status: SubscriptionStatus;
          trial_ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["gyms"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["gyms"]["Insert"]>;
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      gym_members: {
        Row: {
          id: string;
          gym_id: string;
          profile_id: string;
          role: UserRole;
          belt_rank: BeltRank;
          stripes: number;
          approved: boolean;
          active: boolean;
          joined_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["gym_members"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["gym_members"]["Insert"]>;
      };
      belt_progress: {
        Row: {
          id: string;
          gym_id: string;
          member_id: string;
          belt_rank: BeltRank;
          stripes: number;
          note: string | null;
          awarded_at: string;
          awarded_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["belt_progress"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["belt_progress"]["Insert"]>;
      };
      technique_progress: {
        Row: {
          id: string;
          gym_id: string;
          member_id: string;
          technique_id: string;
          completed_at: string;
          verified_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["technique_progress"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["technique_progress"]["Insert"]>;
      };
      class_schedules: {
        Row: {
          id: string;
          gym_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          class_type: ClassType;
          instructor: string | null;
          location_slug: string | null;
          topic: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["class_schedules"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["class_schedules"]["Insert"]>;
      };
      attendance: {
        Row: {
          id: string;
          gym_id: string;
          member_id: string;
          class_date: string;
          class_type: ClassType;
          checked_in_at: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["attendance"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["attendance"]["Insert"]>;
      };
      schedule_commitments: {
        Row: {
          id: string;
          gym_id: string;
          member_id: string;
          class_date: string;
          class_type: ClassType;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["schedule_commitments"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["schedule_commitments"]["Insert"]>;
      };
      products: {
        Row: {
          id: string;
          gym_id: string;
          name: string;
          slug: string;
          description: string | null;
          price: number;
          compare_at_price: number | null;
          featured: boolean;
          active: boolean;
          category_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["products"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          alt: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["product_images"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["product_images"]["Insert"]>;
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          size: string | null;
          color: string | null;
          stock: number;
          sku: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["product_variants"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["product_variants"]["Insert"]>;
      };
      categories: {
        Row: {
          id: string;
          gym_id: string;
          name: string;
          slug: string;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["categories"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
      };
      orders: {
        Row: {
          id: string;
          gym_id: string;
          member_id: string | null;
          customer_name: string;
          customer_email: string;
          customer_phone: string | null;
          shipping_address: string | null;
          status: OrderStatus;
          total: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["orders"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          variant_id: string | null;
          quantity: number;
          unit_price: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["order_items"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
      };
      videos: {
        Row: {
          id: string;
          gym_id: string;
          title: string;
          description: string | null;
          embed_url: string;
          class_type: ClassType | null;
          class_date: string | null;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["videos"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["videos"]["Insert"]>;
      };
      announcements: {
        Row: {
          id: string;
          gym_id: string;
          title: string;
          content: string;
          pinned: boolean;
          published_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["announcements"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["announcements"]["Insert"]>;
      };
      events: {
        Row: {
          id: string;
          gym_id: string;
          title: string;
          description: string | null;
          date: string;
          end_date: string | null;
          event_type: string | null;
          location_slug: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["events"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
      };
      competition_results: {
        Row: {
          id: string;
          gym_id: string;
          member_id: string;
          competition_name: string;
          date: string;
          placement: string | null;
          division: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["competition_results"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["competition_results"]["Insert"]>;
      };
      personal_goals: {
        Row: {
          id: string;
          gym_id: string;
          member_id: string;
          title: string;
          target_value: number | null;
          current_value: number;
          goal_type: string | null;
          start_date: string | null;
          end_date: string | null;
          completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["personal_goals"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["personal_goals"]["Insert"]>;
      };
    };
  };
}
