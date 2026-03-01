"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ReminderGenerator() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleGenerate = async () => {
    const response = await fetch("/api/reminder/generate", { method: "POST" });
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error ?? "Unable to generate reminder.");
      return;
    }

    toast.success("Weekly reminder generated.");
    startTransition(() => router.refresh());
  };

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleGenerate}
      className="rounded-full bg-[#123524] px-5 py-2 text-sm font-semibold text-white"
    >
      {isPending ? "Generating..." : "Generate"}
    </button>
  );
}
