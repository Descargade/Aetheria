import { useGetDashboardMetrics, useGetTopProducts, useGetSalesByDay, useGetLowStockProducts } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, ResponsiveContainer } from "recharts";
import { TrendingUp, ShoppingBag, Package, Users, AlertTriangle, DollarSign, Trash2 } from "lucide-react";

function MetricCard({ label, value, icon: Icon, sub }: { label: string; value: string; icon: React.ElementType; sub?: string }) {
  return (
    <div className="bg-card border border-card-border p-6" data-testid={`metric-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="text-2xl font-bold font-mono">{value}</p>
      {sub && <p className="text-xs text-muted-foreground font-mono mt-1">{sub}</p>}
    </div>
  );
}

export function AdminDashboard() {
  const { data: metrics, isLoading } = useGetDashboardMetrics();
  const { data: topProducts } = useGetTopProducts();
  const { data: salesByDay } = useGetSalesByDay();
  const { data: lowStock } = useGetLowStockProducts();
  const queryClient = useQueryClient();
  const [clearing, setClearing] = useState(false);

  const chartData = (salesByDay ?? []).slice(-14).map((d) => ({
    date: d.date.slice(5),
    ventas: d.total,
    pedidos: d.orders,
  }));

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tighter uppercase">Dashboard</h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">Resumen general del negocio</p>
        </div>

        {/* Clear Orders */}
        <div className="flex justify-end">
          <button
            onClick={async () => {
              setClearing(true);
              try {
                const res = await fetch("/api/admin/orders", {
                  method: "DELETE",
                  headers: { Authorization: "Bearer aetheria-admin-token-secret" },
                });
                const data = await res.json();
                alert(data.message);
                queryClient.invalidateQueries({ queryKey: ["dashboard"] });
              } finally {
                setClearing(false);
              }
            }}
            disabled={clearing}
            className="flex items-center gap-2 h-9 px-4 border border-destructive/50 text-destructive font-mono text-xs uppercase tracking-widest hover:bg-destructive/10 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {clearing ? "Limpiando..." : "Limpiar pedidos de prueba"}
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="bg-muted/30 border border-border h-28 animate-pulse" />)}
          </div>
        ) : metrics ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Ventas hoy" value={`$${Math.round(metrics.dailySales).toLocaleString("es-AR")}`} icon={DollarSign} />
            <MetricCard label="Ventas del mes" value={`$${Math.round(metrics.monthlySales).toLocaleString("es-AR")}`} icon={TrendingUp} />
            <MetricCard label="Ingresos totales" value={`$${Math.round(metrics.totalRevenue).toLocaleString("es-AR")}`} icon={DollarSign} sub={`${metrics.totalOrders} pedidos`} />
            <MetricCard label="Pedidos pendientes" value={String(metrics.pendingOrders)} icon={ShoppingBag} sub="Sin confirmar" />
            <MetricCard label="Total productos" value={String(metrics.totalProducts)} icon={Package} sub={`${metrics.lowStockCount} con stock bajo`} />
            <MetricCard label="Clientes" value={String(metrics.totalCustomers)} icon={Users} />
            <MetricCard label="Ticket promedio" value={`$${Math.round(metrics.averageOrderValue).toLocaleString("es-AR")}`} icon={TrendingUp} />
            <MetricCard label="Conversión" value={`${metrics.conversionRate.toFixed(1)}%`} icon={TrendingUp} sub="Pagados / total" />
          </div>
        ) : null}

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-card border border-card-border p-6">
            <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-6">Ventas — últimos 14 días</h2>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(340 80% 60%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(340 80% 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 15%)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: "Space Mono", fill: "hsl(0 0% 45%)" }} />
                <YAxis tick={{ fontSize: 10, fontFamily: "Space Mono", fill: "hsl(0 0% 45%)" }} />
                <Tooltip contentStyle={{ background: "hsl(0 0% 8%)", border: "1px solid hsl(0 0% 15%)", borderRadius: 0, fontFamily: "Space Mono", fontSize: 11 }} />
                <Area type="monotone" dataKey="ventas" stroke="hsl(340 80% 60%)" strokeWidth={2} fill="url(#colorVentas)" name="Ventas ($)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-card-border p-6">
            <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-6">Productos más vendidos</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={(topProducts ?? []).slice(0, 6).map((p) => ({ name: p.name.slice(0, 12) + "...", vendidos: p.totalSold }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 15%)" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fontFamily: "Space Mono", fill: "hsl(0 0% 45%)" }} />
                <YAxis tick={{ fontSize: 10, fontFamily: "Space Mono", fill: "hsl(0 0% 45%)" }} />
                <Tooltip contentStyle={{ background: "hsl(0 0% 8%)", border: "1px solid hsl(0 0% 15%)", borderRadius: 0, fontFamily: "Space Mono", fontSize: 11 }} />
                <Bar dataKey="vendidos" fill="hsl(340 80% 60%)" name="Vendidos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low stock */}
        {lowStock && lowStock.length > 0 && (
          <div className="bg-card border border-card-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">Stock bajo</h2>
            </div>
            <div className="space-y-2">
              {lowStock.slice(0, 5).map((p) => (
                <div key={p.id} className="flex justify-between items-center py-2 border-b border-border last:border-0 font-mono text-sm">
                  <span className="font-medium">{p.name}</span>
                  <span className={`px-2 py-0.5 text-xs font-bold uppercase ${p.stock === 0 ? "bg-destructive/20 text-destructive" : "bg-yellow-500/20 text-yellow-500"}`}>
                    {p.stock === 0 ? "Agotado" : `${p.stock} u.`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
