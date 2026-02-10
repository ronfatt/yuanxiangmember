import Link from "next/link";

const links = [
  { href: "/products", label: "Products" },
  { href: "/courses", label: "Courses" },
  { href: "/mentors", label: "Mentors" },
  { href: "/testimonials", label: "Testimonials" },
];

export default function SiteHeader() {
  return (
    <header className="border-b border-black/10 bg-white/80 backdrop-blur">
      <div className="container flex items-center justify-between py-5">
        <Link href="/" className="font-display text-2xl">
          元像
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-jade">
              {link.label}
            </Link>
          ))}
          <Link href="/login" className="rounded-full bg-ink px-4 py-2 text-white">
            Member Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
