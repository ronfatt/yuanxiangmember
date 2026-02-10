import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="container grid gap-10 py-16 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <span className="badge">Membership MVP</span>
            <h1 className="font-display text-4xl md:text-6xl">
              A calm membership journey for growth, learning, and resonance.
            </h1>
            <p className="text-lg text-black/70">
              Join courses, book mentors, and reserve tuning rooms. Pay securely with Stripe, and manage everything in one place.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/courses" className="rounded-full bg-ink px-6 py-3 text-white">
                Explore Courses
              </Link>
              <Link href="/mentors" className="rounded-full border border-ink px-6 py-3">
                Meet Mentors
              </Link>
            </div>
          </div>
          <div className="card space-y-4">
            <h2 className="section-title">Member Highlights</h2>
            <ul className="space-y-3 text-black/70">
              <li>Magic link login with Supabase Auth.</li>
              <li>Stripe Checkout for courses, deposits, and room bookings.</li>
              <li>Admin console to manage offerings and approvals.</li>
            </ul>
          </div>
        </section>
        <section className="container grid gap-6 pb-16 md:grid-cols-3">
          {[
            { title: "Products", desc: "Curated membership tiers and benefits." },
            { title: "Courses", desc: "Structured learning with seat control." },
            { title: "Tuning Rooms", desc: "Book shared rooms with capacity tracking." }
          ].map((item) => (
            <div key={item.title} className="card">
              <h3 className="font-display text-2xl">{item.title}</h3>
              <p className="text-black/70">{item.desc}</p>
            </div>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
