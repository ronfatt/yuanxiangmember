"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createClient } from "../lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mx-auto max-w-lg space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-jade">Member access</p>
        <h1 className="font-display text-4xl text-[#123524]">Login</h1>
        <p className="text-sm text-black/65">Email and password via Supabase Auth.</p>
      </div>
      <div className="space-y-3">
        <input
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      <button
        type="button"
        disabled={loading}
        onClick={handleSubmit}
        className="rounded-full bg-[#123524] px-6 py-3 text-sm font-semibold text-white"
      >
        {loading ? "Signing in..." : "Login"}
      </button>
      <p className="text-sm text-black/60">
        Need an account?{" "}
        <Link href="/register" className="text-jade underline">
          Register here
        </Link>
      </p>
    </div>
  );
}
