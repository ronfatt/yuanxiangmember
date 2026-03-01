import DashboardShell from "../../../components/DashboardShell";
import FrequencyGenerator from "../../../components/FrequencyGenerator";
import ReminderGenerator from "../../../components/ReminderGenerator";
import { requireUser } from "../../../lib/actions/session";
import { createClient } from "../../../lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function FrequencyDashboardPage() {
  const user = await requireUser();
  const supabase = createClient();

  const [{ data: profile }, { data: report }, { data: reminders }] = await Promise.all([
    supabase.from("users_profile").select("birthday").eq("id", user.id).single(),
    supabase
      .from("frequency_reports")
      .select("report_json,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("weekly_reminders")
      .select("id,week_start,content")
      .eq("user_id", user.id)
      .order("week_start", { ascending: false })
      .limit(8)
  ]);

  const frequency = report?.report_json as
    | { birthday?: string; lifePath?: number; focus?: number; summary?: string; strengths?: string[]; watchouts?: string[] }
    | undefined;

  return (
    <DashboardShell title="Frequency tools" subtitle="Birthday-based report and weekly guidance">
      <div className="grid gap-4 lg:grid-cols-[1.15fr,1fr]">
        <div className="card space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-black/55">Latest report</p>
              <h2 className="font-display text-3xl text-[#123524]">Frequency profile</h2>
            </div>
            <FrequencyGenerator birthday={profile?.birthday ?? null} />
          </div>
          <p className="text-sm text-black/70">{frequency?.summary ?? "Generate a report to populate this card."}</p>
          <p className="text-sm text-black/60">Life path: {frequency?.lifePath ?? "-"} | Focus: {frequency?.focus ?? "-"}</p>
          {frequency?.strengths?.length ? <p className="text-sm text-black/60">Strengths: {frequency.strengths.join(", ")}.</p> : null}
          {frequency?.watchouts?.length ? <p className="text-sm text-black/60">Watchouts: {frequency.watchouts.join(", ")}.</p> : null}
        </div>
        <div className="card space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-black/55">Weekly reminders</p>
              <h2 className="font-display text-3xl text-[#123524]">Generator</h2>
            </div>
            <ReminderGenerator />
          </div>
          {reminders?.length ? (
            reminders.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black/70">
                <p className="font-medium text-[#123524]">{entry.week_start}</p>
                <p className="mt-1">{entry.content}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-black/60">No reminders stored yet.</p>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
