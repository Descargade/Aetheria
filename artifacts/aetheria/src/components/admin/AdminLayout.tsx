import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, Tag, ShoppingBag, Settings, LogOut, Ruler } from "lucide-react";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/categorias", label: "Categorías", icon: Tag },
  { href: "/admin/promociones", label: "Promociones", icon: Tag },
  { href: "/admin/guias-talles", label: "Guías de talles", icon: Ruler },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("aetheria_admin_token");
    localStorage.removeItem("aetheria_admin_user");
    setLocation("/admin");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-border flex flex-col bg-sidebar hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <Link href="/admin/dashboard">
            <span className="font-bold tracking-tighter uppercase text-sidebar-foreground text-lg">AETHERIA</span>
          </Link>
        </div>
        <nav className="flex-1 py-4 px-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = location === href || location.startsWith(href + "/");
            return (
              <Link key={href} href={href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 mb-1 text-sm font-mono uppercase tracking-wider transition-colors cursor-pointer ${active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"}`}
                  data-testid={`nav-admin-${label.toLowerCase()}`}>
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-mono uppercase tracking-wider text-sidebar-foreground/60 hover:text-destructive transition-colors">
            <LogOut className="h-4 w-4" /><span>Salir</span>
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4">
        <span className="font-bold tracking-tighter uppercase text-sidebar-foreground">AETHERIA Admin</span>
        <button onClick={handleLogout} className="text-sidebar-foreground/60 hover:text-destructive">
          <LogOut className="h-5 w-5" />
        </button>
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-auto md:pt-0 pt-14">
        {children}
      </main>
    </div>
  );
}
