"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function FrequencyGenerator({ birthday }: { birthday: string | null }) {
  const router = useRouter();
  const [value, setValue] = useState(birthday ?? "");
  const [isPending, startTransition] = useTransition();

  const handleGenerate = async () => {
    const response = await fetch("/api/frequency/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ birthday: value })
    });

    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error ?? "Unable to generate report.");
      return;
    }

    toast.success("Frequency report updated.");
    startTransition(() => router.refresh());
  };

  return (
    <div className="space-y-3">
      <input
        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
        type="date"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <button
        type="button"
        disabled={isPending}
        onClick={handleGenerate}
        className="rounded-full bg-[#123524] px-5 py-2 text-sm font-semibold text-white"
      >
        {isPending ? "Generating..." : "Generate / Update"}
      </button>
    </div>
  );
}
