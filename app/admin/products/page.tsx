import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "../../../lib/supabase/admin";

async function createProduct(formData: FormData) {
  "use server";
  const admin = supabaseAdmin();
  const title = String(formData.get("title") || "");
  const subtitle = String(formData.get("subtitle") || "");
  const description = String(formData.get("description") || "");
  await admin.from("products").insert({
    title,
    subtitle,
    description,
    benefits: [],
    faq: [],
    images: [],
    is_published: false
  });
  revalidatePath("/admin/products");
}

async function togglePublish(formData: FormData) {
  "use server";
  const admin = supabaseAdmin();
  const id = String(formData.get("id"));
  const is_published = formData.get("is_published") === "true";
  await admin.from("products").update({ is_published }).eq("id", id);
  revalidatePath("/admin/products");
}

export default async function AdminProductsPage() {
  const admin = supabaseAdmin();
  const { data: products } = await admin.from("products").select("*").order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <section className="card space-y-3">
        <h2 className="font-display text-2xl">Create Product</h2>
        <form action={createProduct} className="grid gap-3">
          <input className="rounded border p-2" name="title" placeholder="Title" required />
          <input className="rounded border p-2" name="subtitle" placeholder="Subtitle" />
          <textarea className="rounded border p-2" name="description" placeholder="Description" />
          <button className="rounded-full bg-ink px-4 py-2 text-white">Create</button>
        </form>
      </section>
      <section className="card space-y-3">
        <h2 className="font-display text-2xl">Products</h2>
        <div className="space-y-3">
          {products?.map((product) => (
            <form key={product.id} action={togglePublish} className="flex items-center justify-between gap-3 border-b pb-2">
              <div>
                <p className="font-medium">{product.title}</p>
                <p className="text-xs text-black/50">{product.subtitle}</p>
              </div>
              <input type="hidden" name="id" value={product.id} />
              <select name="is_published" defaultValue={String(product.is_published)} className="rounded border p-2 text-sm">
                <option value="true">Published</option>
                <option value="false">Draft</option>
              </select>
              <button className="rounded-full bg-ink px-3 py-1 text-xs text-white">Update</button>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}
