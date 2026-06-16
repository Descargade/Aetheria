import { useLocation } from "wouter";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { AnnouncementBar } from "./AnnouncementBar";

const HIDE_HEADER_ROUTES = ["/checkout", "/pedido-confirmado"];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const hideHeader = HIDE_HEADER_ROUTES.some((r) => location.startsWith(r));

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground font-sans">
      {!hideHeader && <AnnouncementBar />}
      {!hideHeader && <Header />}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
}
