"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function CourseSessions({ sessions }: { sessions: any[] }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (sessionId: string) => {
    try {
      setLoading(sessionId);
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_session_id: sessionId })
      });
      if (!res.ok) throw new Error("Failed to start checkout");
      const { order_id } = await res.json();
      if (order_id) {
        toast.success("Order created. Upload bank-in slip in dashboard.");
        window.location.href = "/dashboard";
      }
    } catch (error) {
      toast.error("Unable to start checkout.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <div key={session.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/10 bg-white/80 p-4">
          <div>
            <p className="text-sm text-black/50">{session.start_at} - {session.end_at} ({session.timezone})</p>
            <p className="text-sm">Capacity: {session.capacity}</p>
          </div>
          <button
            onClick={() => handleCheckout(session.id)}
            disabled={loading === session.id}
            className="rounded-full bg-ink px-4 py-2 text-sm text-white"
          >
            {loading === session.id ? "Processing..." : `Reserve ${(session.price_cents / 100).toFixed(2)} ${session.currency}`}
          </button>
        </div>
      ))}
    </div>
  );
}
