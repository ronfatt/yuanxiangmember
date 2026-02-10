import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "../../../lib/supabase/admin";

async function updateStatus(formData: FormData) {
  "use server";
  const admin = supabaseAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  await admin.from("testimonials").update({ status, approved_at: status === "APPROVED" ? new Date().toISOString() : null }).eq("id", id);
  revalidatePath("/admin/testimonials");
}

export default async function AdminTestimonialsPage() {
  const admin = supabaseAdmin();
  const { data: testimonials } = await admin.from("testimonials").select("*").order("created_at", { ascending: false });

  return (
    <div className="card space-y-3">
      <h2 className="font-display text-2xl">Testimonials</h2>
      {testimonials?.map((item) => (
        <form key={item.id} action={updateStatus} className="flex items-center justify-between gap-3 border-b pb-2">
          <div>
            <p className="font-medium">{item.title}</p>
            <p className="text-xs text-black/50">{item.content}</p>
          </div>
          <input type="hidden" name="id" value={item.id} />
          <select name="status" defaultValue={item.status} className="rounded border p-2 text-sm">
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
          <button className="rounded-full bg-ink px-3 py-1 text-xs text-white">Update</button>
        </form>
      ))}
    </div>
  );
}
