import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { createClient } from "../../lib/supabase/server";

export default async function MentorsPage() {
  const supabase = createClient();
  const { data: mentors } = await supabase
    .from("mentors")
    .select("id,display_name,bio,specialties,avatar_url")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container py-12 space-y-6">
        <h1 className="section-title">Mentors</h1>
        <div className="grid gap-6 md:grid-cols-2">
          {mentors?.map((mentor) => (
            <Link key={mentor.id} href={`/mentors/${mentor.id}`} className="card hover:border-ink/40">
              <h2 className="font-display text-2xl">{mentor.display_name}</h2>
              <p className="text-black/70">{mentor.bio}</p>
              <p className="text-xs text-black/50">{(mentor.specialties ?? []).join(", ")}</p>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
