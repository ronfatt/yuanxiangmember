import { NextResponse } from "next/server";
import { requireUser } from "../../../../lib/actions/session";
import { buildFrequencyReport } from "../../../../lib/metaenergy/frequency";
import { createClient } from "../../../../lib/supabase/server";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const supabase = createClient();
    const payload = await request.json().catch(() => ({}));

    const { data: profile } = await supabase
      .from("users_profile")
      .select("birthday")
      .eq("id", user.id)
      .single();

    const birthday = String(payload.birthday ?? profile?.birthday ?? "");

    if (!birthday) {
      return NextResponse.json({ ok: false, error: "Birthday is required." }, { status: 400 });
    }

    const report = buildFrequencyReport(birthday);

    const { error } = await supabase.from("frequency_reports").insert({
      user_id: user.id,
      report_json: report
    });

    if (error) throw error;

    const { error: profileError } = await supabase
      .from("users_profile")
      .update({ birthday })
      .eq("id", user.id);

    if (profileError) throw profileError;

    return NextResponse.json({ ok: true, report });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate report.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
