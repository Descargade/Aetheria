import React from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";

// Layouts
import { MainLayout } from "@/components/layout/MainLayout";

// Public Pages
import { Home } from "@/pages/home";
import { Shop } from "@/pages/shop";
import { ProductDetail } from "@/pages/product-detail";
import { Cart } from "@/pages/cart";
import { Checkout } from "@/pages/checkout";
import { Favorites } from "@/pages/favorites";
import { Contact } from "@/pages/contact";

// Admin Pages
import { AdminLogin } from "@/pages/admin/login";
import { AdminDashboard } from "@/pages/admin/dashboard";
import { AdminOrders } from "@/pages/admin/orders";
import { AdminProducts } from "@/pages/admin/products";
import { AdminCategories } from "@/pages/admin/categories";
import { AdminPromotions } from "@/pages/admin/promotions";
import { AdminConfig } from "@/pages/admin/config";
import { AdminSizeGuides } from "@/pages/admin/size-guides";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AdminGuard({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("aetheria_admin_token");
  if (!token) {
    window.location.replace(import.meta.env.BASE_URL.replace(/\/$/, "") + "/admin");
    return null;
  }
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/">
        <MainLayout><Home /></MainLayout>
      </Route>
      <Route path="/tienda">
        <MainLayout><Shop /></MainLayout>
      </Route>
      <Route path="/producto/:id">
        <MainLayout><ProductDetail /></MainLayout>
      </Route>
      <Route path="/carrito">
        <MainLayout><Cart /></MainLayout>
      </Route>
      <Route path="/checkout">
        <MainLayout><Checkout /></MainLayout>
      </Route>
      <Route path="/favoritos">
        <MainLayout><Favorites /></MainLayout>
      </Route>
      <Route path="/contacto">
        <MainLayout><Contact /></MainLayout>
      </Route>

      {/* Admin Routes */}
      <Route path="/admin">
        <AdminLogin />
      </Route>
      <Route path="/admin/dashboard">
        <AdminGuard><AdminDashboard /></AdminGuard>
      </Route>
      <Route path="/admin/pedidos">
        <AdminGuard><AdminOrders /></AdminGuard>
      </Route>
      <Route path="/admin/productos">
        <AdminGuard><AdminProducts /></AdminGuard>
      </Route>
      <Route path="/admin/categorias">
        <AdminGuard><AdminCategories /></AdminGuard>
      </Route>
      <Route path="/admin/promociones">
        <AdminGuard><AdminPromotions /></AdminGuard>
      </Route>
      <Route path="/admin/configuracion">
        <AdminGuard><AdminConfig /></AdminGuard>
      </Route>
      <Route path="/admin/guias-talles">
        <AdminGuard><AdminSizeGuides /></AdminGuard>
      </Route>

      {/* Catch all */}
      <Route>
        <MainLayout><NotFound /></MainLayout>
      </Route>
    </Switch>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state: { hasError: boolean; error: Error | null } = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white font-mono p-8 text-center">
          <h1 className="text-4xl font-bold tracking-tighter uppercase mb-4">Error</h1>
          <p className="text-white/60 mb-2 text-sm">Algo salió mal. Recargá la página o intentá de nuevo.</p>
          <p className="text-red-400 mb-8 text-xs max-w-lg break-all">{(this.state.error?.message || "") + (this.state.error?.stack?.split("\n").slice(0, 3).join(" · ") || "")}</p>
          <button
            onClick={() => window.location.reload()}
            className="h-12 px-6 bg-white text-black font-mono uppercase tracking-widest border-none cursor-pointer"
          >
            Recargar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const baseUrl = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="aetheria-theme">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <WouterRouter base={baseUrl}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
