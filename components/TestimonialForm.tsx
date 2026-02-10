"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function TestimonialForm() {
  const [form, setForm] = useState({
    category: "General",
    title: "",
    content: "",
    media_urls: "",
    is_anonymous: false,
    consent_public: true
  });

  const submit = async () => {
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: form.category,
          title: form.title,
          content: form.content,
          media_urls: form.media_urls ? form.media_urls.split(",").map((u) => u.trim()) : [],
          is_anonymous: form.is_anonymous,
          consent_public: form.consent_public
        })
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Testimonial submitted.");
      setForm({ ...form, title: "", content: "", media_urls: "" });
    } catch (error) {
      toast.error("Unable to submit testimonial.");
    }
  };

  return (
    <div className="space-y-3">
      <input className="w-full rounded border p-2" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
      <input className="w-full rounded border p-2" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <textarea className="w-full rounded border p-2" placeholder="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
      <input className="w-full rounded border p-2" placeholder="Media URLs (comma separated)" value={form.media_urls} onChange={(e) => setForm({ ...form, media_urls: e.target.value })} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.is_anonymous} onChange={(e) => setForm({ ...form, is_anonymous: e.target.checked })} />
        Submit anonymously
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.consent_public} onChange={(e) => setForm({ ...form, consent_public: e.target.checked })} />
        Consent to public display
      </label>
      <button onClick={submit} className="rounded-full bg-ink px-4 py-2 text-white">Submit</button>
    </div>
  );
}
