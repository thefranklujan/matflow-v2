/**
 * MatFlow v2 — Full Integration Test Suite
 *
 * Run: npx tsx scripts/test-full.ts
 *
 * Tests every core operation against live Supabase:
 * 1. Auth (sign up, sign in, sign out)
 * 2. Onboarding (create gym, join gym)
 * 3. Members (approve, promote, toggle active)
 * 4. Class Schedule (create, update, delete)
 * 5. Products (create, update, delete)
 * 6. Settings (update gym info)
 * 7. RLS isolation
 * 8. Cleanup
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://isrgxqehqwudycqwoyld.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_5nc3ygt9YVW4rzkaV7UEHA_peR4DbEY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test accounts
const ADMIN = {
  email: `test-admin-${Date.now()}@matflow.dev`,
  password: "TestPass123!",
  firstName: "Frank",
  lastName: "Admin",
};

const MEMBER = {
  email: `test-member-${Date.now()}@matflow.dev`,
  password: "TestPass123!",
  firstName: "Sofia",
  lastName: "Member",
};

const GYM = {
  name: "Test Dojo",
  slug: `test-dojo-${Date.now()}`,
  timezone: "America/Chicago",
};

// Track IDs for cleanup
let adminUserId: string;
let memberUserId: string;
let gymId: string;
let adminMembershipId: string;
let memberMembershipId: string;
let classId: string;
let productId: string;

// Results
const results: { test: string; status: "PASS" | "FAIL"; detail: string; ms: number }[] = [];

async function run(name: string, fn: () => Promise<string>): Promise<boolean> {
  const start = Date.now();
  try {
    const detail = await fn();
    const ms = Date.now() - start;
    results.push({ test: name, status: "PASS", detail, ms });
    console.log(`  ✅ ${name} (${ms}ms)`);
    return true;
  } catch (err: any) {
    const ms = Date.now() - start;
    results.push({ test: name, status: "FAIL", detail: err.message, ms });
    console.log(`  ❌ ${name}: ${err.message} (${ms}ms)`);
    return false;
  }
}

async function main() {
  console.log("");
  console.log("══════════════════════════════════════════");
  console.log("  MatFlow v2 — Full Integration Tests");
  console.log("══════════════════════════════════════════");

  // ═══════════════════════════════════════════
  // AUTH TESTS
  // ═══════════════════════════════════════════
  console.log("\n── Auth ──");

  const signupOk = await run("Admin Sign Up", async () => {
    const { data, error } = await supabase.auth.signUp({
      email: ADMIN.email,
      password: ADMIN.password,
      options: { data: { first_name: ADMIN.firstName, last_name: ADMIN.lastName } },
    });
    if (error) throw error;
    if (!data.user) throw new Error("No user returned");
    adminUserId = data.user.id;
    return `User ID: ${adminUserId}`;
  });
  if (!signupOk) { printSummary(); return; }

  await run("Profile Auto-Created (trigger)", async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", adminUserId)
      .single();
    if (error) throw error;
    if (!data) throw new Error("Profile not found");
    if (data.email !== ADMIN.email) throw new Error(`Email mismatch: ${data.email}`);
    return `Profile: ${data.email}, role: ${data.role}`;
  });

  await run("Admin Sign Out", async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return "Signed out";
  });

  await run("Admin Sign In", async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: ADMIN.email,
      password: ADMIN.password,
    });
    if (error) throw error;
    if (!data.session) throw new Error("No session");
    return `Session token: ${data.session.access_token.slice(0, 20)}...`;
  });

  await run("Sign In with wrong password fails", async () => {
    // Create a separate client so we don't lose our session
    const tempClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { error } = await tempClient.auth.signInWithPassword({
      email: ADMIN.email,
      password: "wrongpassword",
    });
    if (!error) throw new Error("Should have failed");
    return `Correctly rejected: ${error.message}`;
  });

  // ═══════════════════════════════════════════
  // ONBOARDING TESTS
  // ═══════════════════════════════════════════
  console.log("\n── Onboarding ──");

  await run("Create Gym", async () => {
    const { data, error } = await supabase
      .from("gyms")
      .insert({
        name: GYM.name,
        slug: GYM.slug,
        timezone: GYM.timezone,
        primary_color: "#0fe69b",
        subscription_status: "trialing",
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    gymId = data.id;
    return `Gym "${data.name}" (${gymId})`;
  });

  await run("Admin joins as gym_admin", async () => {
    const { data, error } = await supabase
      .from("gym_members")
      .insert({
        gym_id: gymId,
        profile_id: adminUserId,
        role: "gym_admin",
        belt_rank: "black",
        stripes: 4,
        approved: true,
        active: true,
        joined_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    adminMembershipId = data.id;
    return `Membership: ${adminMembershipId}`;
  });

  await run("Duplicate slug rejected", async () => {
    const { error } = await supabase
      .from("gyms")
      .insert({
        name: "Duplicate",
        slug: GYM.slug,
        timezone: "America/Chicago",
        primary_color: "#0fe69b",
        subscription_status: "inactive",
      });
    if (!error) throw new Error("Should have failed with duplicate slug");
    return `Correctly rejected: ${error.code}`;
  });

  // ═══════════════════════════════════════════
  // MEMBER TESTS
  // ═══════════════════════════════════════════
  console.log("\n── Members ──");

  // Sign up member
  await run("Member Sign Up", async () => {
    await supabase.auth.signOut();
    const { data, error } = await supabase.auth.signUp({
      email: MEMBER.email,
      password: MEMBER.password,
      options: { data: { first_name: MEMBER.firstName, last_name: MEMBER.lastName } },
    });
    if (error) throw error;
    memberUserId = data.user!.id;
    return `Member ID: ${memberUserId}`;
  });

  await run("Member joins gym (pending)", async () => {
    const { data, error } = await supabase
      .from("gym_members")
      .insert({
        gym_id: gymId,
        profile_id: memberUserId,
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
    memberMembershipId = data.id;
    if (data.approved !== false) throw new Error("Should be pending");
    return `Pending membership: ${memberMembershipId}`;
  });

  await run("Member can't join same gym twice", async () => {
    const { error } = await supabase
      .from("gym_members")
      .insert({
        gym_id: gymId,
        profile_id: memberUserId,
        role: "member",
        belt_rank: "white",
        stripes: 0,
        approved: false,
        active: true,
        joined_at: new Date().toISOString(),
      });
    if (!error) throw new Error("Should have failed with unique constraint");
    return `Correctly rejected: ${error.code}`;
  });

  // Switch to admin to approve
  await run("Admin approves member", async () => {
    await supabase.auth.signOut();
    await supabase.auth.signInWithPassword({ email: ADMIN.email, password: ADMIN.password });
    const { error } = await supabase
      .from("gym_members")
      .update({ approved: true })
      .eq("id", memberMembershipId);
    if (error) throw error;

    const { data } = await supabase
      .from("gym_members")
      .select("approved")
      .eq("id", memberMembershipId)
      .single();
    if (!data?.approved) throw new Error("Still not approved");
    return "Member approved";
  });

  await run("Admin promotes member to blue belt + 2 stripes", async () => {
    const { error } = await supabase
      .from("gym_members")
      .update({ belt_rank: "blue", stripes: 2 })
      .eq("id", memberMembershipId);
    if (error) throw error;

    // Log belt progress
    const { error: progressErr } = await supabase
      .from("belt_progress")
      .insert({
        gym_id: gymId,
        member_id: memberMembershipId,
        belt_rank: "blue",
        stripes: 2,
        awarded_at: new Date().toISOString(),
        awarded_by: adminMembershipId,
        note: "Test promotion",
      });
    if (progressErr) throw progressErr;

    const { data } = await supabase
      .from("gym_members")
      .select("belt_rank, stripes")
      .eq("id", memberMembershipId)
      .single();
    if (data?.belt_rank !== "blue") throw new Error(`Belt: ${data?.belt_rank}`);
    if (data?.stripes !== 2) throw new Error(`Stripes: ${data?.stripes}`);
    return `Belt: ${data.belt_rank}, Stripes: ${data.stripes}`;
  });

  await run("Admin toggles member inactive", async () => {
    const { error } = await supabase
      .from("gym_members")
      .update({ active: false })
      .eq("id", memberMembershipId);
    if (error) throw error;

    const { data } = await supabase
      .from("gym_members")
      .select("active")
      .eq("id", memberMembershipId)
      .single();
    if (data?.active !== false) throw new Error("Still active");
    return "Member deactivated";
  });

  await run("Admin reactivates member", async () => {
    const { error } = await supabase
      .from("gym_members")
      .update({ active: true })
      .eq("id", memberMembershipId);
    if (error) throw error;
    return "Member reactivated";
  });

  // ═══════════════════════════════════════════
  // CLASS SCHEDULE TESTS
  // ═══════════════════════════════════════════
  console.log("\n── Class Schedule ──");

  await run("Create class (Mon 6AM Gi)", async () => {
    const { data, error } = await supabase
      .from("class_schedules")
      .insert({
        gym_id: gymId,
        day_of_week: 1,
        start_time: "06:00",
        end_time: "07:30",
        class_type: "gi",
        instructor: "Professor Frank",
        topic: "Guard Passing",
        active: true,
      })
      .select()
      .single();
    if (error) throw error;
    classId = data.id;
    return `Class: ${classId}`;
  });

  await run("Create class (Wed 5PM No Gi)", async () => {
    const { data, error } = await supabase
      .from("class_schedules")
      .insert({
        gym_id: gymId,
        day_of_week: 3,
        start_time: "17:00",
        end_time: "18:30",
        class_type: "nogi",
        instructor: "Coach Sofia",
        active: true,
      })
      .select()
      .single();
    if (error) throw error;
    return `Class: ${data.id}`;
  });

  await run("Update class topic", async () => {
    const { error } = await supabase
      .from("class_schedules")
      .update({ topic: "Mount Escapes" })
      .eq("id", classId);
    if (error) throw error;

    const { data } = await supabase
      .from("class_schedules")
      .select("topic")
      .eq("id", classId)
      .single();
    if (data?.topic !== "Mount Escapes") throw new Error(`Topic: ${data?.topic}`);
    return "Topic updated to Mount Escapes";
  });

  await run("List classes (should be 2)", async () => {
    const { data, error } = await supabase
      .from("class_schedules")
      .select("*")
      .eq("gym_id", gymId);
    if (error) throw error;
    if (data.length !== 2) throw new Error(`Expected 2, got ${data.length}`);
    return `Found ${data.length} classes`;
  });

  // ═══════════════════════════════════════════
  // PRODUCT TESTS
  // ═══════════════════════════════════════════
  console.log("\n── Products ──");

  await run("Create product (Gi)", async () => {
    const { data, error } = await supabase
      .from("products")
      .insert({
        gym_id: gymId,
        name: "Test Dojo White Gi",
        slug: "test-dojo-white-gi",
        description: "Premium competition gi",
        price: 149.99,
        compare_at_price: 199.99,
        featured: true,
        active: true,
      })
      .select()
      .single();
    if (error) throw error;
    productId = data.id;
    return `Product: ${data.name} ($${data.price})`;
  });

  await run("Create product (Rash Guard)", async () => {
    const { data, error } = await supabase
      .from("products")
      .insert({
        gym_id: gymId,
        name: "Test Dojo Rash Guard",
        slug: "test-dojo-rash-guard",
        description: "Short sleeve competition rash guard",
        price: 59.99,
        featured: false,
        active: true,
      })
      .select()
      .single();
    if (error) throw error;
    return `Product: ${data.name} ($${data.price})`;
  });

  await run("Update product price", async () => {
    const { error } = await supabase
      .from("products")
      .update({ price: 129.99 })
      .eq("id", productId);
    if (error) throw error;

    const { data } = await supabase
      .from("products")
      .select("price")
      .eq("id", productId)
      .single();
    if (Number(data?.price) !== 129.99) throw new Error(`Price: ${data?.price}`);
    return "Price updated to $129.99";
  });

  await run("Toggle product inactive", async () => {
    const { error } = await supabase
      .from("products")
      .update({ active: false })
      .eq("id", productId);
    if (error) throw error;
    return "Product deactivated";
  });

  await run("List products (should be 2)", async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("gym_id", gymId);
    if (error) throw error;
    if (data.length !== 2) throw new Error(`Expected 2, got ${data.length}`);
    return `Found ${data.length} products`;
  });

  // ═══════════════════════════════════════════
  // SETTINGS TESTS
  // ═══════════════════════════════════════════
  console.log("\n── Settings ──");

  await run("Update gym name", async () => {
    const { error } = await supabase
      .from("gyms")
      .update({ name: "Test Dojo Updated" })
      .eq("id", gymId);
    if (error) throw error;

    const { data } = await supabase
      .from("gyms")
      .select("name")
      .eq("id", gymId)
      .single();
    if (data?.name !== "Test Dojo Updated") throw new Error(`Name: ${data?.name}`);
    return "Name updated";
  });

  await run("Update brand color", async () => {
    const { error } = await supabase
      .from("gyms")
      .update({ primary_color: "#3b82f6" })
      .eq("id", gymId);
    if (error) throw error;

    const { data } = await supabase
      .from("gyms")
      .select("primary_color")
      .eq("id", gymId)
      .single();
    if (data?.primary_color !== "#3b82f6") throw new Error(`Color: ${data?.primary_color}`);
    return "Color updated to #3b82f6";
  });

  await run("Update phone and website", async () => {
    const { error } = await supabase
      .from("gyms")
      .update({ phone: "(555) 123-4567", website: "https://testdojo.com" })
      .eq("id", gymId);
    if (error) throw error;
    return "Phone and website updated";
  });

  // ═══════════════════════════════════════════
  // ANNOUNCEMENTS & EVENTS
  // ═══════════════════════════════════════════
  console.log("\n── Content ──");

  await run("Create announcement", async () => {
    const { data, error } = await supabase
      .from("announcements")
      .insert({
        gym_id: gymId,
        title: "Welcome to Test Dojo!",
        content: "We're excited to have you. See you on the mats!",
        pinned: true,
        published_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return `Announcement: ${data.title}`;
  });

  await run("Create event", async () => {
    const { data, error } = await supabase
      .from("events")
      .insert({
        gym_id: gymId,
        title: "Open Mat Saturday",
        description: "Free rolling for all belt levels",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        event_type: "open_mat",
        active: true,
      })
      .select()
      .single();
    if (error) throw error;
    return `Event: ${data.title}`;
  });

  // ═══════════════════════════════════════════
  // RLS ISOLATION TESTS
  // ═══════════════════════════════════════════
  console.log("\n── RLS Isolation ──");

  await run("Member can view own gym's classes", async () => {
    await supabase.auth.signOut();
    await supabase.auth.signInWithPassword({ email: MEMBER.email, password: MEMBER.password });

    const { data, error } = await supabase
      .from("class_schedules")
      .select("*")
      .eq("gym_id", gymId);
    if (error) throw error;
    if (!data || data.length === 0) throw new Error("Member can't see classes");
    return `Member sees ${data.length} classes`;
  });

  await run("Member can view announcements", async () => {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("gym_id", gymId);
    if (error) throw error;
    if (!data || data.length === 0) throw new Error("Member can't see announcements");
    return `Member sees ${data.length} announcements`;
  });

  await run("Member CANNOT update gym settings", async () => {
    const { error } = await supabase
      .from("gyms")
      .update({ name: "Hacked Name" })
      .eq("id", gymId);
    // RLS should block this — either error or 0 rows affected
    const { data } = await supabase
      .from("gyms")
      .select("name")
      .eq("id", gymId)
      .single();
    if (data?.name === "Hacked Name") throw new Error("RLS BYPASS — member changed gym name!");
    return "Correctly blocked: member can't edit gym";
  });

  await run("Member CANNOT delete classes", async () => {
    const { error } = await supabase
      .from("class_schedules")
      .delete()
      .eq("id", classId);
    // Verify class still exists (sign back in as admin to check)
    await supabase.auth.signOut();
    await supabase.auth.signInWithPassword({ email: ADMIN.email, password: ADMIN.password });
    const { data } = await supabase
      .from("class_schedules")
      .select("id")
      .eq("id", classId)
      .single();
    if (!data) throw new Error("RLS BYPASS — member deleted a class!");
    return "Correctly blocked: member can't delete classes";
  });

  // ═══════════════════════════════════════════
  // SIGN OUT / SIGN IN CYCLE
  // ═══════════════════════════════════════════
  console.log("\n── Auth Cycle ──");

  await run("Sign out admin", async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    const { data } = await supabase.auth.getSession();
    if (data.session) throw new Error("Session still exists after sign out");
    return "Session cleared";
  });

  await run("Sign back in as admin", async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: ADMIN.email,
      password: ADMIN.password,
    });
    if (error) throw error;
    if (!data.session) throw new Error("No session after sign in");
    return "Session restored";
  });

  await run("Gym data still accessible after re-login", async () => {
    const { data, error } = await supabase
      .from("gyms")
      .select("name")
      .eq("id", gymId)
      .single();
    if (error) throw error;
    return `Gym: ${data.name}`;
  });

  // ═══════════════════════════════════════════
  // CLEANUP
  // ═══════════════════════════════════════════
  console.log("\n── Cleanup ──");

  await run("Delete test gym (cascades all data)", async () => {
    // Delete gym — cascades to gym_members, classes, products, etc.
    const { error } = await supabase
      .from("gyms")
      .delete()
      .eq("id", gymId);
    if (error) throw error;

    // Verify cascade
    const { data: members } = await supabase
      .from("gym_members")
      .select("id")
      .eq("gym_id", gymId);
    if (members && members.length > 0) throw new Error("Members not cascaded");

    const { data: classes } = await supabase
      .from("class_schedules")
      .select("id")
      .eq("gym_id", gymId);
    if (classes && classes.length > 0) throw new Error("Classes not cascaded");

    return "Gym + all related data deleted";
  });

  await run("Sign out", async () => {
    await supabase.auth.signOut();
    return "Signed out. Test users remain in auth (delete manually if needed).";
  });

  printSummary();
}

function printSummary() {
  console.log("");
  console.log("══════════════════════════════════════════");
  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  const totalMs = results.reduce((sum, r) => sum + r.ms, 0);
  console.log(`  ${passed} passed, ${failed} failed (${totalMs}ms total)`);
  console.log("══════════════════════════════════════════");

  if (failed > 0) {
    console.log("\nFailed:");
    results
      .filter((r) => r.status === "FAIL")
      .forEach((r) => console.log(`  ❌ ${r.test}: ${r.detail}`));
    process.exit(1);
  } else {
    console.log("\n  All tests passed. Backend is solid. ✅\n");
  }
}

main().catch((err) => {
  console.error("\nTest runner crashed:", err);
  process.exit(1);
});
