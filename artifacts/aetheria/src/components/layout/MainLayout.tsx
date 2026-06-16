import { useLocation } from "wouter";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { AnnouncementBar } from "./AnnouncementBar";

const HIDE_ANNOUNCEMENT_ROUTES = ["/checkout", "/pedido-confirmado"];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isCheckout = location.startsWith("/checkout") || location.startsWith("/pedido-confirmado");

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground font-sans">
      {!isCheckout && <AnnouncementBar />}
      <Header checkoutMode={isCheckout} />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
}
