import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import LoginForm from "../../components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(203,230,210,0.55),_transparent_28%),linear-gradient(180deg,_#f5f1e8_0%,_#ffffff_100%)]">
      <SiteHeader />
      <main className="container py-12">
        <LoginForm />
      </main>
      <SiteFooter />
    </div>
  );
}
