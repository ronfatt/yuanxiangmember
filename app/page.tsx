import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export default function HomePage() {
  const coreBlocks = [
    {
      headline: "Referral engine",
      solution: "Lifetime cumulative referral sales unlock 15%, 20%, and 25% commission tiers."
    },
    {
      headline: "Keep-alive control",
      solution: "Two consecutive months below RM50 personal cash spend reset referral progress."
    },
    {
      headline: "Points model",
      solution: "Every RM100 cash paid earns 10 points, with redemptions capped at 50% of any purchase."
    }
  ];

  const phases = [
    "Phase 1: Auth, referral links, order entry, commissions, and dashboard reporting.",
    "Phase 2: Frequency reports, weekly reminders, points balance, and redeem simulator.",
    "Phase 3: Monthly keep-alive cron, RLS hardening, and auditability."
  ];

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden border-b border-black/10 bg-[radial-gradient(circle_at_top_left,_rgba(151,194,160,0.45),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(196,167,94,0.2),_transparent_25%),linear-gradient(180deg,_#f3eee3_0%,_#ffffff_100%)]">
          <div className="absolute -left-20 -top-12 h-64 w-64 rounded-full bg-[#d8ead8]/70 blur-3xl" />
          <div className="absolute -right-24 bottom-4 h-64 w-64 rounded-full bg-[#c9a227]/10 blur-3xl" />
          <div className="container relative grid gap-10 py-16 md:grid-cols-2 md:items-center">
            <div className="space-y-6">
              <span className="inline-flex rounded-full border border-jade/20 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-wide text-jade">
                MetaEnergy MVP
              </span>
              <h1 className="font-display text-4xl leading-tight text-[#123524] md:text-6xl">
                Membership, referrals, points, and retention controls in one clean cashflow dashboard.
              </h1>
              <p className="max-w-xl text-lg text-black/70">
                This build is shaped around strict non-retroactive commissions, monthly keep-alive enforcement, and a
                simple member experience that can ship fast on Next.js, Supabase, and Vercel.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/register" className="rounded-full bg-[#123524] px-6 py-3 text-white">
                  Start membership
                </Link>
                <Link href="/dashboard" className="rounded-full border border-[#123524] px-6 py-3 text-[#123524]">
                  View dashboard
                </Link>
              </div>
            </div>
            <div className="card border-jade/15 bg-white/90">
              <h2 className="section-title text-[#123524]">Core operating rules</h2>
              <ul className="mt-4 space-y-3 text-black/75">
                <li>Commission unlocks only after cumulative referred sales cross RM1,000, RM3,000, and RM10,000.</li>
                <li>The order that crosses a threshold still uses the previous tier rate.</li>
                <li>Two sub-RM50 months in a row reset tier progress and referred sales back to zero.</li>
                <li>Points can only offset up to 50% of each purchase and are never cashable.</li>
              </ul>
              <div className="mt-6 rounded-xl bg-jade/5 p-4 text-sm text-[#123524]">
                Admin order entry is the primary cashflow control in this MVP.
              </div>
            </div>
          </div>
        </section>

        <section className="container py-16">
          <div className="mb-8">
            <h2 className="section-title text-[#123524]">What ships in the MVP</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {coreBlocks.map((item) => (
              <div key={item.headline} className="card border-black/5 bg-white">
                <h3 className="font-display text-2xl text-[#123524]">{item.headline}</h3>
                <p className="mt-2 text-black/70">{item.solution}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-black/10 bg-[#f8f6f2]">
          <div className="container py-16">
            <div className="mb-8">
              <h2 className="section-title text-[#123524]">Build phases</h2>
            </div>
            <div className="card border-jade/10 bg-white">
              <ul className="space-y-3 text-black/75">
                {phases.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
