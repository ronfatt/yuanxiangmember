import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { createClient } from "../../lib/supabase/server";

export default async function TestimonialsPage() {
  const supabase = createClient();
  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("id,category,title,content,media_urls,is_anonymous,created_at")
    .eq("status", "APPROVED")
    .order("created_at", { ascending: false });

  const categories = Array.from(new Set(testimonials?.map((t) => t.category)));

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container py-12 space-y-6">
        <h1 className="section-title">Testimonials</h1>
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <span key={category} className="badge">{category}</span>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {testimonials?.map((testimonial) => (
            <div key={testimonial.id} className="card space-y-2">
              <p className="text-xs uppercase text-black/50">{testimonial.category}</p>
              <h2 className="font-display text-2xl">{testimonial.title}</h2>
              <p className="text-black/70">{testimonial.content}</p>
              <p className="text-xs text-black/40">
                {testimonial.is_anonymous ? "Anonymous" : "Member"}
              </p>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
