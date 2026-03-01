"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type UserOption = {
  id: string;
  name: string | null;
  referral_code: string;
};

export default function AdminOrderForm({ users }: { users: UserOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [userId, setUserId] = useState(users[0]?.id ?? "");
  const [amountTotal, setAmountTotal] = useState("100");
  const [pointsRedeemed, setPointsRedeemed] = useState("0");
  const [orderType, setOrderType] = useState<"personal" | "service" | "product">("product");
  const [source, setSource] = useState<"personal" | "referred">("personal");
  const [referrerId, setReferrerId] = useState("");

  const handleSubmit = async () => {
    const payload = {
      userId,
      amountTotal: Number(amountTotal),
      pointsRedeemed: Number(pointsRedeemed),
      orderType,
      referrerId: source === "referred" ? referrerId : null,
      referredUserId: source === "referred" ? userId : null
    };

    const response = await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error ?? "Unable to create order.");
      return;
    }

    toast.success("Order created.");
    startTransition(() => router.refresh());
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-2">
        <select
          className="rounded-2xl border border-black/10 bg-white px-4 py-3"
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name ?? "Member"} ({user.referral_code})
            </option>
          ))}
        </select>
        <input
          className="rounded-2xl border border-black/10 bg-white px-4 py-3"
          type="number"
          min="0"
          step="0.01"
          value={amountTotal}
          onChange={(event) => setAmountTotal(event.target.value)}
          placeholder="Amount total"
        />
        <input
          className="rounded-2xl border border-black/10 bg-white px-4 py-3"
          type="number"
          min="0"
          value={pointsRedeemed}
          onChange={(event) => setPointsRedeemed(event.target.value)}
          placeholder="Points redeemed"
        />
        <select
          className="rounded-2xl border border-black/10 bg-white px-4 py-3"
          value={orderType}
          onChange={(event) => setOrderType(event.target.value as "personal" | "service" | "product")}
        >
          <option value="personal">personal</option>
          <option value="service">service</option>
          <option value="product">product</option>
        </select>
        <select
          className="rounded-2xl border border-black/10 bg-white px-4 py-3"
          value={source}
          onChange={(event) => setSource(event.target.value as "personal" | "referred")}
        >
          <option value="personal">personal</option>
          <option value="referred">referred</option>
        </select>
        {source === "referred" ? (
          <select
            className="rounded-2xl border border-black/10 bg-white px-4 py-3"
            value={referrerId}
            onChange={(event) => setReferrerId(event.target.value)}
          >
            <option value="">Select referrer</option>
            {users
              .filter((user) => user.id !== userId)
              .map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name ?? "Member"} ({user.referral_code})
                </option>
              ))}
          </select>
        ) : null}
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={handleSubmit}
        className="rounded-full bg-[#123524] px-5 py-2 text-sm font-semibold text-white"
      >
        {isPending ? "Submitting..." : "Create order"}
      </button>
    </div>
  );
}
