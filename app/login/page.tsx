"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { createClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      if (email) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` }
        });
        if (error) throw error;
        toast.success("Magic link sent.");
        return;
      }
      if (phone) {
        const { error } = await supabase.auth.signInWithOtp({ phone });
        if (error) throw error;
        toast.success("OTP sent.");
        return;
      }
      toast.error("Enter email or phone.");
    } catch (error) {
      toast.error("Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container py-12">
        <div className="card mx-auto max-w-lg space-y-4">
          <h1 className="font-display text-3xl">Member Login</h1>
          <p className="text-black/70">Use magic link or phone OTP. No password required.</p>
          <div className="space-y-3">
            <input
              className="w-full rounded-lg border p-3"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full rounded-lg border p-3"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <button onClick={handleLogin} disabled={loading} className="rounded-full bg-ink px-6 py-3 text-white">
            {loading ? "Sending..." : "Send magic link / OTP"}
          </button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
