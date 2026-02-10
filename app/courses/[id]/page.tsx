import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import { createClient } from "../../../lib/supabase/server";
import CourseSessions from "../../../components/CourseSessions";

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", params.id)
    .single();

  const { data: sessions } = await supabase
    .from("course_sessions")
    .select("*")
    .eq("course_id", params.id)
    .eq("status", "PUBLISHED")
    .order("start_at", { ascending: true });

  if (!course) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="container py-12">Course not found.</main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container py-12 space-y-6">
        <div className="card space-y-4">
          <h1 className="font-display text-3xl">{course.title}</h1>
          <p className="text-black/60">{course.tagline}</p>
          <p className="text-black/70">{course.description}</p>
          <div>
            <h3 className="font-medium">Highlights</h3>
            <ul className="list-disc pl-5 text-black/70">
              {(course.highlights ?? []).map((item: string) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="card space-y-4">
          <h2 className="font-display text-2xl">Upcoming Sessions</h2>
          {sessions?.length ? (
            <CourseSessions sessions={sessions} />
          ) : (
            <p className="text-black/60">No published sessions yet.</p>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
