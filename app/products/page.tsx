import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { createClient } from "../../lib/supabase/server";

export default async function ProductsPage() {
  const supabase = createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id,title,subtitle,description,benefits,is_published")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container py-12 space-y-6">
        <h1 className="section-title">Products</h1>
        <div className="grid gap-6 md:grid-cols-2">
          {products?.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`} className="card hover:border-ink/40">
              <h2 className="font-display text-2xl">{product.title}</h2>
              <p className="text-black/60">{product.subtitle}</p>
              <p className="mt-3 text-sm text-black/70">{product.description}</p>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
