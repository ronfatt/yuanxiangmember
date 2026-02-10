import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import { createClient } from "../../../lib/supabase/server";
import MentorBookingForm from "../../../components/MentorBookingForm";

export default async function MentorDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: mentor } = await supabase
    .from("mentors")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!mentor) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="container py-12">Mentor not found.</main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container py-12 space-y-6">
        <div className="card space-y-3">
          <h1 className="font-display text-3xl">{mentor.display_name}</h1>
          <p className="text-black/70">{mentor.bio}</p>
          <p className="text-xs text-black/50">{(mentor.specialties ?? []).join(", ")}</p>
        </div>
        <div className="card space-y-4">
          <h2 className="font-display text-2xl">Request a 1:1 Session</h2>
          <MentorBookingForm mentorId={mentor.id} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
