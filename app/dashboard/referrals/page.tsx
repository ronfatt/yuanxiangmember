import DashboardShell from "../../../components/DashboardShell";
import { requireUser } from "../../../lib/actions/session";
import { formatMoney, formatPercent } from "../../../lib/metaenergy/helpers";
import { createClient } from "../../../lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ReferralDashboardPage() {
  const user = await requireUser();
  const supabase = createClient();

  const [{ data: profile }, { data: referralOrders }] = await Promise.all([
    supabase
      .from("users_profile")
      .select("referral_code,tier_rate,total_referred_sales,total_commission_earned")
      .eq("id", user.id)
      .single(),
    supabase
      .from("referral_orders")
      .select("id,commission_rate,commission_amount,created_at,referred_user_id")
      .eq("referrer_id", user.id)
      .order("created_at", { ascending: false })
  ]);

  return (
    <DashboardShell title="Referral performance" subtitle="Tier progress and credited referred orders">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card">
          <p className="text-sm text-black/55">Share code</p>
          <p className="font-display text-3xl text-[#123524]">{profile?.referral_code ?? "-"}</p>
        </div>
        <div className="card">
          <p className="text-sm text-black/55">Current tier</p>
          <p className="font-display text-3xl text-[#123524]">{formatPercent(Number(profile?.tier_rate ?? 0))}</p>
        </div>
        <div className="card">
          <p className="text-sm text-black/55">Referred sales</p>
          <p className="font-display text-3xl text-[#123524]">{formatMoney(Number(profile?.total_referred_sales ?? 0))}</p>
        </div>
      </div>
      <div className="card mt-4 space-y-4">
        <h2 className="font-display text-3xl text-[#123524]">Referral order history</h2>
        {referralOrders?.length ? (
          <div className="space-y-3">
            {referralOrders.map((order) => (
              <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">Referred member: {order.referred_user_id}</p>
                  <p className="text-black/55">{new Date(order.created_at).toLocaleString("en-MY")}</p>
                </div>
                <div className="text-right">
                  <p>{formatPercent(Number(order.commission_rate))}</p>
                  <p className="font-medium text-[#123524]">{formatMoney(Number(order.commission_amount))}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-black/60">No referred orders credited yet.</p>
        )}
      </div>
    </DashboardShell>
  );
}
