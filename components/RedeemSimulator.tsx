"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { formatMoney } from "../lib/metaenergy/helpers";

export default function RedeemSimulator({ pointsBalance }: { pointsBalance: number }) {
  const [amountTotal, setAmountTotal] = useState("100");
  const [pointsRedeemed, setPointsRedeemed] = useState("");
  const [result, setResult] = useState<null | {
    maxRedeemablePoints: number;
    appliedPoints: number;
    cashRequired: number;
  }>(null);

  const handleRun = async () => {
    const response = await fetch("/api/points/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amountTotal: Number(amountTotal),
        pointsRedeemed: Number(pointsRedeemed || 0)
      })
    });

    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error ?? "Unable to calculate.");
      return;
    }

    setResult(data);
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
          type="number"
          min="0"
          step="0.01"
          value={amountTotal}
          onChange={(event) => setAmountTotal(event.target.value)}
          placeholder="Order price"
        />
        <input
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
          type="number"
          min="0"
          value={pointsRedeemed}
          onChange={(event) => setPointsRedeemed(event.target.value)}
          placeholder={`Points to use (balance ${pointsBalance})`}
        />
      </div>
      <button
        type="button"
        onClick={handleRun}
        className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-semibold text-[#123524]"
      >
        Simulate redemption
      </button>
      {result ? (
        <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black/70">
          Max redeemable: {result.maxRedeemablePoints} points. Applied: {result.appliedPoints} points. Cash required:{" "}
          {formatMoney(result.cashRequired)}.
        </div>
      ) : null}
    </div>
  );
}
