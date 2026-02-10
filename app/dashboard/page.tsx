import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { createClient } from "../../lib/supabase/server";
import { requireUser } from "../../lib/actions/session";
import TestimonialForm from "../../components/TestimonialForm";
import RoomBookingsList from "../../components/RoomBookingsList";
import OrderSlipUpload from "../../components/OrderSlipUpload";

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("users")
    .select("name,email,phone,member_tier,status")
    .eq("id", user.id)
    .single();

  const { data: enrollments } = await supabase
    .from("orders")
    .select("id,amount_cents,currency,payment_status,course_session_id,created_at,slip_url")
    .eq("user_id", user.id)
    .eq("order_type", "COURSE")
    .order("created_at", { ascending: false });

  const { data: orders } = await supabase
    .from("orders")
    .select("id,order_type,amount_cents,currency,payment_status,slip_url,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id,booking_status,start_at,end_at,location_text")
    .eq("user_id", user.id)
    .order("start_at", { ascending: true });

  const { data: roomBookings } = await supabase
    .from("room_bookings")
    .select("id,status,party_size,room_slot_id,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container py-12 space-y-6">
        <h1 className="section-title">Member Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card space-y-2">
            <h2 className="font-display text-2xl">Profile</h2>
            <p>{profile?.name ?? "Member"}</p>
            <p className="text-black/60">{profile?.email ?? user.email}</p>
            <p className="text-black/60">Tier: {profile?.member_tier ?? "Standard"}</p>
            <p className="text-black/60">Status: {profile?.status ?? "ACTIVE"}</p>
          </div>
          <div className="card space-y-2">
            <h2 className="font-display text-2xl">Upcoming Mentor Bookings</h2>
            {bookings?.length ? (
              bookings.map((booking) => (
                <div key={booking.id} className="text-sm text-black/70">
                  {booking.start_at} - {booking.end_at} ({booking.booking_status})
                </div>
              ))
            ) : (
              <p className="text-black/60">No bookings yet.</p>
            )}
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card space-y-2">
            <h2 className="font-display text-2xl">Course Enrollments</h2>
            {enrollments?.length ? (
              enrollments.map((order) => (
                <div key={order.id} className="text-sm text-black/70">
                  {order.payment_status} - {order.amount_cents / 100} {order.currency}
                </div>
              ))
            ) : (
              <p className="text-black/60">No enrollments yet.</p>
            )}
          </div>
          <div className="card space-y-2">
            <h2 className="font-display text-2xl">Room Bookings</h2>
            <RoomBookingsList initial={roomBookings ?? []} />
          </div>
        </div>
        <div className="card space-y-3">
          <h2 className="font-display text-2xl">Submit a Testimonial</h2>
          <TestimonialForm />
        </div>
        <div className="card space-y-3">
          <h2 className="font-display text-2xl">Upload Bank-In Slip</h2>
          <OrderSlipUpload orders={orders ?? []} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
