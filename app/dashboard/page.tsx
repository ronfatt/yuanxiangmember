import { format, startOfMonth, startOfWeek } from "date-fns";
import DashboardShell from "../../components/DashboardShell";
import FrequencyGenerator from "../../components/FrequencyGenerator";
import ReminderGenerator from "../../components/ReminderGenerator";
import { requireUser } from "../../lib/actions/session";
import { buildKeepAliveLabel, buildPointsHint, buildSpendSummary, buildTierHint } from "../../lib/metaenergy/dashboard";
import { formatMoney, formatPercent } from "../../lib/metaenergy/helpers";
import { createClient } from "../../lib/supabase/server";

export const dynamic = "force-dynamic";

function MetricCard({
  title,
  value,
  caption
}: {
  title: string;
  value: string;
  caption: string;
}) {
  return (
    <div className="card space-y-2">
      <p className="text-sm text-black/55">{title}</p>
      <p className="font-display text-3xl text-[#123524]">{value}</p>
      <p className="text-sm text-black/65">{caption}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = createClient();
  const monthKey = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const weekKey = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const [{ data: profile }, { data: currentMonth }, { data: latestReport }, { data: latestReminder }] =
    await Promise.all([
      supabase
        .from("users_profile")
        .select("id,name,birthday,referral_code,tier_rate,total_referred_sales,total_commission_earned,points_balance,months_under_50")
        .eq("id", user.id)
        .single(),
      supabase
        .from("monthly_stats")
        .select("personal_cash_total")
        .eq("user_id", user.id)
        .eq("month", monthKey)
        .maybeSingle(),
      supabase
        .from("frequency_reports")
        .select("report_json,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("weekly_reminders")
        .select("content")
        .eq("user_id", user.id)
        .eq("week_start", weekKey)
        .maybeSingle()
    ]);

  const frequency = latestReport?.report_json as
    | { summary?: string; strengths?: string[]; watchouts?: string[] }
    | undefined;

  return (
    <DashboardShell title={`Welcome${profile?.name ? `, ${profile.name}` : ""}`} subtitle="Referral + points overview">
      <div className="grid gap-4 lg:grid-cols-3">
        <MetricCard
          title="Referral code"
          value={profile?.referral_code ?? "-"}
          caption={`${siteUrl}/r/${profile?.referral_code ?? ""}`}
        />
        <MetricCard title="Current tier" value={formatPercent(Number(profile?.tier_rate ?? 0))} caption={buildTierHint()} />
        <MetricCard
          title="Total referred sales"
          value={formatMoney(Number(profile?.total_referred_sales ?? 0))}
          caption="Post-reset cumulative total"
        />
        <MetricCard
          title="Commission earned"
          value={formatMoney(Number(profile?.total_commission_earned ?? 0))}
          caption="Stored running total"
        />
        <MetricCard
          title="Personal spend this month"
          value={formatMoney(Number(currentMonth?.personal_cash_total ?? 0))}
          caption={buildSpendSummary(Number(currentMonth?.personal_cash_total ?? 0))}
        />
        <MetricCard
          title="Keep-alive status"
          value={`${Number(profile?.months_under_50 ?? 0)} strike`}
          caption={buildKeepAliveLabel(Number(profile?.months_under_50 ?? 0))}
        />
        <MetricCard
          title="Points balance"
          value={`${Number(profile?.points_balance ?? 0)} pts`}
          caption={buildPointsHint()}
        />
        <div className="card space-y-4 lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-black/55">Frequency report</p>
              <h2 className="font-display text-3xl text-[#123524]">Summary</h2>
            </div>
            <FrequencyGenerator birthday={profile?.birthday ?? null} />
          </div>
          <p className="text-sm text-black/70">{frequency?.summary ?? "No report generated yet."}</p>
          {frequency?.strengths?.length ? (
            <p className="text-sm text-black/60">Strengths: {frequency.strengths.join(", ")}.</p>
          ) : null}
          {frequency?.watchouts?.length ? (
            <p className="text-sm text-black/60">Watchouts: {frequency.watchouts.join(", ")}.</p>
          ) : null}
        </div>
        <div className="card space-y-4 lg:col-span-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-black/55">Weekly reminder</p>
              <h2 className="font-display text-3xl text-[#123524]">This week</h2>
            </div>
            <ReminderGenerator />
          </div>
          <p className="text-sm text-black/70">{latestReminder?.content ?? "No reminder generated for this week yet."}</p>
        </div>
      </div>
    </DashboardShell>
  );
}
