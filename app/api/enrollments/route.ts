import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { supabaseAdmin } from "../../../lib/supabase/admin";
import { enrollmentSchema } from "../../../lib/zod";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = enrollmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = supabaseAdmin();
  const { data: session } = await admin
    .from("course_sessions")
    .select("id,price_cents,currency")
    .eq("id", parsed.data.course_session_id)
    .single();

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const { data: order } = await admin.from("orders").insert({
    user_id: auth.user.id,
    order_type: "COURSE",
    course_session_id: session.id,
    amount_cents: session.price_cents,
    currency: session.currency,
    payment_provider: "BANK_TRANSFER",
    payment_status: "PENDING"
  }).select("id").single();
  return NextResponse.json({ order_id: order?.id });
}
