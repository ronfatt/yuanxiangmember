import { supabaseAdmin } from "../../../lib/supabase/admin";

export default async function AdminBookingsPage({ searchParams }: { searchParams: { status?: string } }) {
  const admin = supabaseAdmin();
  const bookingsQuery = admin.from("bookings").select("*").order("created_at", { ascending: false });
  if (searchParams.status) bookingsQuery.eq("booking_status", searchParams.status);
  const { data: bookings } = await bookingsQuery;

  const roomQuery = admin.from("room_bookings").select("*").order("created_at", { ascending: false });
  const { data: roomBookings } = await roomQuery;

  return (
    <div className="space-y-6">
      <section className="card space-y-3">
        <h2 className="font-display text-2xl">Mentor Bookings</h2>
        {bookings?.map((booking) => (
          <div key={booking.id} className="border-b pb-2 text-sm">
            {booking.booking_status} - {booking.start_at} - {booking.location_text}
          </div>
        ))}
      </section>
      <section className="card space-y-3">
        <h2 className="font-display text-2xl">Room Bookings</h2>
        {roomBookings?.map((booking) => (
          <div key={booking.id} className="border-b pb-2 text-sm">
            {booking.status} - slot {booking.room_slot_id} - party {booking.party_size}
          </div>
        ))}
      </section>
    </div>
  );
}
