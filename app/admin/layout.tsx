import Link from "next/link";
import { requireAdmin } from "../../lib/actions/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-sand">
      <header className="border-b border-black/10 bg-white/90">
        <div className="container flex items-center justify-between py-4">
          <h1 className="font-display text-2xl">Admin Console</h1>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin/products">Products</Link>
            <Link href="/admin/courses">Courses</Link>
            <Link href="/admin/mentors">Mentors</Link>
            <Link href="/admin/testimonials">Testimonials</Link>
            <Link href="/admin/orders">Orders</Link>
            <Link href="/admin/bookings">Bookings</Link>
            <Link href="/admin/rooms">Rooms</Link>
          </nav>
        </div>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
}
