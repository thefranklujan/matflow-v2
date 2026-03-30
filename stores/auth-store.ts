import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { UserRole } from "@/types/database";
import type { Session, User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: UserRole;
}

interface GymMembership {
  id: string;
  gym_id: string;
  role: UserRole;
  belt_rank: string;
  stripes: number;
  gym: {
    id: string;
    name: string;
    slug: string;
    primary_color: string;
    logo_url: string | null;
  };
}

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  memberships: GymMembership[];
  activeGymId: string | null;
  activeMembership: GymMembership | null;
  isLoading: boolean;
  isOnboarded: boolean;

  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setMemberships: (memberships: GymMembership[]) => void;
  setActiveGym: (gymId: string) => void;
  setLoading: (loading: boolean) => void;
  setOnboarded: (onboarded: boolean) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  memberships: [],
  activeGymId: null,
  activeMembership: null,
  isLoading: true,
  isOnboarded: false,

  setSession: (session) =>
    set({ session, user: session?.user ?? null }),

  setProfile: (profile) => set({ profile }),

  setMemberships: (memberships) => {
    const { activeGymId } = get();
    const activeMembership =
      memberships.find((m) => m.gym_id === activeGymId) ??
      memberships[0] ??
      null;
    set({
      memberships,
      activeMembership,
      activeGymId: activeMembership?.gym_id ?? null,
    });
  },

  setActiveGym: (gymId) => {
    const { memberships } = get();
    const activeMembership =
      memberships.find((m) => m.gym_id === gymId) ?? null;
    set({ activeGymId: gymId, activeMembership });
  },

  setLoading: (isLoading) => set({ isLoading }),

  setOnboarded: (isOnboarded) => set({ isOnboarded }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({
      session: null,
      user: null,
      profile: null,
      memberships: [],
      activeGymId: null,
      activeMembership: null,
      isOnboarded: false,
    });
  },

  initialize: async () => {
    try {
      set({ isLoading: true });

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        set({ isLoading: false });
        return;
      }

      set({ session, user: session.user });

      // Fetch profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      // Fetch gym memberships
      const { data: memberships } = await supabase
        .from("gym_members")
        .select(
          `
          id,
          gym_id,
          role,
          belt_rank,
          stripes,
          gym:gyms (id, name, slug, primary_color, logo_url)
        `
        )
        .eq("profile_id", session.user.id)
        .eq("active", true);

      const formattedMemberships = (memberships ?? []).map((m: any) => ({
        ...m,
        gym: m.gym,
      }));

      set({ profile: profile ?? null });
      get().setMemberships(formattedMemberships);
      set({
        isOnboarded: formattedMemberships.length > 0,
        isLoading: false,
      });
    } catch (error) {
      console.error("Auth init error:", error);
      set({ isLoading: false });
    }
  },
}));
