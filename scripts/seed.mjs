import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing env vars for seeding");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

const run = async () => {
  await supabase.from("products").insert([
    { title: "Harmony Membership", subtitle: "Monthly access", description: "Access to rooms and discounts", benefits: ["Priority booking", "Community events"], is_published: true },
    { title: "Mentor Circle", subtitle: "1:1 mentoring", description: "Dedicated mentor support", benefits: ["Monthly session", "Progress plan"], is_published: true }
  ]);

  const { data: courses } = await supabase.from("courses").insert([
    { title: "Resonance Basics", tagline: "Start your journey", description: "Foundations of resonance", highlights: ["Breath", "Tone", "Alignment"], duration_text: "4 weeks", level: "Beginner", location_text: "Kuala Lumpur", is_published: true },
    { title: "Deep Listening", tagline: "Advanced practice", description: "Deepen sensory awareness", highlights: ["Presence", "Integration"], duration_text: "2 days", level: "Advanced", location_text: "Kuala Lumpur", is_published: true }
  ]).select("id");

  if (courses?.length) {
    await supabase.from("course_sessions").insert([
      { course_id: courses[0].id, start_at: new Date().toISOString(), end_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), capacity: 20, price_cents: 12000, currency: "MYR", status: "PUBLISHED" }
    ]);
  }

  await supabase.from("mentors").insert([
    { display_name: "Li Wei", bio: "Sound healer and guide", specialties: ["Breath", "Tone"], is_active: true, sort_order: 1 },
    { display_name: "Amira Noor", bio: "Somatic mentor", specialties: ["Grounding"], is_active: true, sort_order: 2 }
  ]);

  await supabase.from("rooms").insert([
    { name: "合之频率", capacity: 7, open_time: "11:00", close_time: "17:00", timezone: "Asia/Kuala_Lumpur" },
    { name: "元之频率VIP", capacity: 2, open_time: "11:00", close_time: "17:00", timezone: "Asia/Kuala_Lumpur" }
  ]);

  await supabase.rpc("generate_room_slots", { days_ahead: 60 });

  console.log("Seed complete");
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
