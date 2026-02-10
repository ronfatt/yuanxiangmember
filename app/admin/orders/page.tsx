import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "../../../lib/supabase/admin";

async function updateOrderStatus(formData: FormData) {
  "use server";
  const admin = supabaseAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("payment_status"));
  if (status === "PAID") {
    await admin.rpc("process_paid_order", { order_id_input: id, payment_intent_input: "" });
  } else {
    await admin.from("orders").update({ payment_status: status, updated_at: new Date().toISOString() }).eq("id", id);
  }
  revalidatePath("/admin/orders");
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: { status?: string } }) {
  const admin = supabaseAdmin();
  const query = admin.from("orders").select("*").order("created_at", { ascending: false });
  if (searchParams.status) query.eq("payment_status", searchParams.status);
  const { data: orders } = await query;

  return (
    <div className="card space-y-3">
      <h2 className="font-display text-2xl">Orders</h2>
      <p className="text-xs text-black/50">Filter with ?status=PAID</p>
      {orders?.map((order) => (
        <form key={order.id} action={updateOrderStatus} className="flex items-center justify-between gap-3 border-b pb-2 text-sm">
          <div>
            <p className="font-medium">{order.order_type}</p>
            <p className="text-xs text-black/50">{order.amount_cents / 100} {order.currency}</p>
            {order.slip_url && (
              <a href={order.slip_url} target="_blank" className="text-xs text-jade" rel="noreferrer">View slip</a>
            )}
          </div>
          <input type="hidden" name="id" value={order.id} />
          <select name="payment_status" defaultValue={order.payment_status} className="rounded border p-2 text-xs">
            <option value="PENDING">PENDING</option>
            <option value="PAID">PAID</option>
            <option value="FAILED">FAILED</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>
          <button className="rounded-full bg-ink px-3 py-1 text-xs text-white">Update</button>
        </form>
      ))}
    </div>
  );
}
