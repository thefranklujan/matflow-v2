/**
 * MatFlow v2 — Automated Test Flow
 *
 * Run: npx ts-node scripts/test-flow.ts
 *
 * Tests the full onboarding flow:
 * 1. Creates a test admin account
 * 2. Creates a gym (academy)
 * 3. Verifies gym data
 * 4. Creates a test member account
 * 5. Joins the gym as a member
 * 6. Verifies membership
 * 7. Cleans up test data
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://isrgxqehqwudycqwoyld.supabase.co";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_5nc3ygt9YVW4rzkaV7UEHA_peR4DbEY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TEST_ADMIN = {
  email: "test-admin@matflow.dev",
  password: "testpass123!",
  firstName: "Test",
  lastName: "Admin",
};

const TEST_MEMBER = {
  email: "test-member@matflow.dev",
  password: "testpass123!",
  firstName: "Test",
  lastName: "Member",
};

const TEST_GYM = {
  name: "Test Academy",
  slug: `test-academy-${Date.now()}`,
  timezone: "America/Chicago",
};

let adminUserId: string | null = null;
let memberUserId: string | null = null;
let gymId: string | null = null;
let adminMembershipId: string | null = null;
let memberMembershipId: string | null = null;

const results: { step: string; status: "PASS" | "FAIL"; detail: string }[] = [];

function log(step: string, status: "PASS" | "FAIL", detail: string) {
  const icon = status === "PASS" ? "✅" : "❌";
  console.log(`${icon} [${step}] ${detail}`);
  results.push({ step, status, detail });
}

async function cleanup() {
  console.log("\n🧹 Cleaning up test data...\n");

  // Sign in as admin to delete gym (cascades to memberships)
  if (gymId) {
    const { error } = await supabase.auth.signInWithPassword({
      email: TEST_ADMIN.email,
      password: TEST_ADMIN.password,
    });
    if (!error) {
      await supabase.from("gym_members").delete().eq("gym_id", gymId);
      await supabase.from("gyms").delete().eq("id", gymId);
      console.log("  Deleted test gym and memberships");
    }
  }

  // Delete test users via admin API (need service role for this)
  // For now just sign them out
  await supabase.auth.signOut();
  console.log("  Signed out all test sessions");
  console.log("  Note: Test auth users remain in Supabase (delete manually if needed)");
}

async function runTests() {
  console.log("");
  console.log("==========================================");
  console.log("  MatFlow v2 — Onboarding Test Flow");
  console.log("==========================================");
  console.log("");

  // ── Step 1: Create Admin Account ──
  try {
    const { data, error } = await supabase.auth.signUp({
      email: TEST_ADMIN.email,
      password: TEST_ADMIN.password,
      options: {
        data: {
          first_name: TEST_ADMIN.firstName,
          last_name: TEST_ADMIN.lastName,
        },
      },
    });

    if (error) {
      // User might already exist, try signing in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: TEST_ADMIN.email,
        password: TEST_ADMIN.password,
      });
      if (signInError) throw signInError;
      adminUserId = signInData.user?.id || null;
      log("1. Create Admin", "PASS", `Existing admin signed in: ${adminUserId}`);
    } else {
      adminUserId = data.user?.id || null;
      log("1. Create Admin", "PASS", `Admin created: ${adminUserId}`);
    }
  } catch (err: any) {
    log("1. Create Admin", "FAIL", err.message);
    return;
  }

  // ── Step 2: Verify Profile Auto-Created ──
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", adminUserId!)
      .single();

    if (error) throw error;
    if (!profile) throw new Error("No profile found");

    log("2. Profile Trigger", "PASS", `Profile exists: ${profile.email}, role: ${profile.role}`);
  } catch (err: any) {
    log("2. Profile Trigger", "FAIL", err.message);
  }

  // ── Step 3: Create Gym ──
  try {
    const { data: gym, error } = await supabase
      .from("gyms")
      .insert({
        name: TEST_GYM.name,
        slug: TEST_GYM.slug,
        timezone: TEST_GYM.timezone,
        primary_color: "#0fe69b",
        subscription_status: "trialing",
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    gymId = gym.id;
    log("3. Create Gym", "PASS", `Gym "${gym.name}" created: ${gymId}`);
  } catch (err: any) {
    log("3. Create Gym", "FAIL", err.message);
    return;
  }

  // ── Step 4: Add Admin as Gym Member ──
  try {
    const { data: membership, error } = await supabase
      .from("gym_members")
      .insert({
        gym_id: gymId!,
        profile_id: adminUserId!,
        role: "gym_admin",
        belt_rank: "black",
        stripes: 0,
        approved: true,
        active: true,
        joined_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    adminMembershipId = membership.id;
    log("4. Admin Membership", "PASS", `Admin is gym_admin: ${adminMembershipId}`);
  } catch (err: any) {
    log("4. Admin Membership", "FAIL", err.message);
  }

  // ── Step 5: Verify Gym Data ──
  try {
    const { data: gym, error } = await supabase
      .from("gyms")
      .select("*")
      .eq("id", gymId!)
      .single();

    if (error) throw error;
    if (gym.name !== TEST_GYM.name) throw new Error(`Name mismatch: ${gym.name}`);
    if (gym.subscription_status !== "trialing") throw new Error(`Status: ${gym.subscription_status}`);

    log("5. Verify Gym", "PASS", `Name: ${gym.name}, Status: ${gym.subscription_status}, Slug: ${gym.slug}`);
  } catch (err: any) {
    log("5. Verify Gym", "FAIL", err.message);
  }

  // ── Step 6: Sign Out Admin ──
  await supabase.auth.signOut();
  log("6. Admin Sign Out", "PASS", "Signed out admin");

  // ── Step 7: Create Member Account ──
  try {
    const { data, error } = await supabase.auth.signUp({
      email: TEST_MEMBER.email,
      password: TEST_MEMBER.password,
      options: {
        data: {
          first_name: TEST_MEMBER.firstName,
          last_name: TEST_MEMBER.lastName,
        },
      },
    });

    if (error) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: TEST_MEMBER.email,
        password: TEST_MEMBER.password,
      });
      if (signInError) throw signInError;
      memberUserId = signInData.user?.id || null;
      log("7. Create Member", "PASS", `Existing member signed in: ${memberUserId}`);
    } else {
      memberUserId = data.user?.id || null;
      log("7. Create Member", "PASS", `Member created: ${memberUserId}`);
    }
  } catch (err: any) {
    log("7. Create Member", "FAIL", err.message);
    return;
  }

  // ── Step 8: Member Joins Gym ──
  try {
    const { data: membership, error } = await supabase
      .from("gym_members")
      .insert({
        gym_id: gymId!,
        profile_id: memberUserId!,
        role: "member",
        belt_rank: "white",
        stripes: 0,
        approved: false,
        active: true,
        joined_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    memberMembershipId = membership.id;
    log("8. Member Join", "PASS", `Member joined as pending: ${memberMembershipId}`);
  } catch (err: any) {
    log("8. Member Join", "FAIL", err.message);
  }

  // ── Step 9: Verify Member is Pending ──
  try {
    const { data: member, error } = await supabase
      .from("gym_members")
      .select("*")
      .eq("id", memberMembershipId!)
      .single();

    if (error) throw error;
    if (member.approved !== false) throw new Error("Member should be pending approval");
    if (member.belt_rank !== "white") throw new Error(`Belt should be white, got ${member.belt_rank}`);

    log("9. Verify Member", "PASS", `Approved: ${member.approved}, Belt: ${member.belt_rank}, Stripes: ${member.stripes}`);
  } catch (err: any) {
    log("9. Verify Member", "FAIL", err.message);
  }

  // ── Step 10: Admin Approves Member ──
  try {
    await supabase.auth.signOut();
    await supabase.auth.signInWithPassword({
      email: TEST_ADMIN.email,
      password: TEST_ADMIN.password,
    });

    const { error } = await supabase
      .from("gym_members")
      .update({ approved: true })
      .eq("id", memberMembershipId!);

    if (error) throw error;
    log("10. Approve Member", "PASS", "Admin approved the member");
  } catch (err: any) {
    log("10. Approve Member", "FAIL", err.message);
  }

  // ── Step 11: RLS Check — Member Can't See Other Gyms ──
  try {
    await supabase.auth.signOut();
    await supabase.auth.signInWithPassword({
      email: TEST_MEMBER.email,
      password: TEST_MEMBER.password,
    });

    const { data: gyms } = await supabase.from("gyms").select("id");
    const memberGymIds = (gyms || []).map((g) => g.id);

    if (memberGymIds.length > 1) {
      log("11. RLS Isolation", "FAIL", `Member sees ${memberGymIds.length} gyms (should see 1)`);
    } else {
      log("11. RLS Isolation", "PASS", `Member sees ${memberGymIds.length} gym(s) — data isolated`);
    }
  } catch (err: any) {
    log("11. RLS Isolation", "FAIL", err.message);
  }

  // ── Cleanup ──
  await cleanup();

  // ── Summary ──
  console.log("");
  console.log("==========================================");
  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  console.log(`  Results: ${passed} passed, ${failed} failed out of ${results.length}`);
  console.log("==========================================");
  console.log("");

  if (failed > 0) {
    console.log("Failed tests:");
    results.filter((r) => r.status === "FAIL").forEach((r) => {
      console.log(`  ❌ ${r.step}: ${r.detail}`);
    });
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test runner crashed:", err);
  process.exit(1);
});
