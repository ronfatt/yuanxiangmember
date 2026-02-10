import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { createClient } from "../../lib/supabase/server";
import RoomSlots from "../../components/RoomSlots";

export default async function RoomsPage() {
  const supabase = createClient();
  const { data: slots } = await supabase
    .from("room_slots_view")
    .select("id,start_at,end_at,room_name,remaining_capacity,total_capacity,status")
    .eq("status", "OPEN")
    .order("start_at", { ascending: true })
    .limit(30);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container py-12 space-y-6">
        <h1 className="section-title">Tuning Rooms</h1>
        <p className="text-black/70">Operating hours 11:00-17:00 Asia/Kuala_Lumpur. Each slot is 60 minutes.</p>
        {slots?.length ? (
          <RoomSlots slots={slots as any} />
        ) : (
          <p className="text-black/60">No slots available.</p>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
