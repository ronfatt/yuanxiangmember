"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createClient } from "../lib/supabase/client";

function getReferralCodeFromCookie() {
  if (typeof document === "undefined") return "";

  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith("ref_code="));

  return cookie ? decodeURIComponent(cookie.split("=")[1] ?? "") : "";
}

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setReferralCode((params.get("ref") ?? getReferralCodeFromCookie() ?? "").toUpperCase());
  }, []);

  const handleRegister = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            birthday,
            referred_code: referralCode || null
          }
        }
      });

      if (error) throw error;

      toast.success("Account created.");
      if (data.session) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Register failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mx-auto max-w-lg space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-jade">MVP registration</p>
        <h1 className="font-display text-4xl text-[#123524]">Create account</h1>
        <p className="text-sm text-black/65">Referral linking happens automatically if a referral cookie is present.</p>
      </div>
      {referralCode ? (
        <div className="rounded-2xl border border-jade/20 bg-jade/5 px-4 py-3 text-sm text-[#123524]">
          Referred by code <span className="font-semibold">{referralCode}</span>
        </div>
      ) : null}
      <div className="grid gap-3">
        <input
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <input
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
          type="date"
          value={birthday}
          onChange={(event) => setBirthday(event.target.value)}
        />
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
        onClick={handleRegister}
        className="rounded-full bg-[#123524] px-6 py-3 text-sm font-semibold text-white"
      >
        {loading ? "Creating..." : "Register"}
      </button>
      <p className="text-sm text-black/60">
        Already registered?{" "}
        <Link href="/login" className="text-jade underline">
          Login
        </Link>
      </p>
    </div>
  );
}
