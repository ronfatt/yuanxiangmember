"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type Booking = { id: string; status: string; party_size: number; room_slot_id: string };

export default function RoomBookingsList({ initial }: { initial: Booking[] }) {
  const [bookings, setBookings] = useState(initial);

  const cancel = async (id: string) => {
    try {
      const res = await fetch("/api/bookings/room/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (!res.ok) throw new Error("Failed");
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "CANCELLED" } : b)));
      toast.success("Booking cancelled.");
    } catch (error) {
      toast.error("Unable to cancel booking.");
    }
  };

  return (
    <div className="space-y-2">
      {bookings.length ? (
        bookings.map((booking) => (
          <div key={booking.id} className="flex items-center justify-between text-sm text-black/70">
            <span>{booking.room_slot_id} - {booking.status} ({booking.party_size})</span>
            {booking.status === "CONFIRMED" && (
              <button onClick={() => cancel(booking.id)} className="text-xs text-red-600">Cancel</button>
            )}
          </div>
        ))
      ) : (
        <p className="text-black/60">No room bookings yet.</p>
      )}
    </div>
  );
}
