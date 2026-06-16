import { useState } from "react";
import { useGetOrders, useUpdateOrderStatus, getGetOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, Trash2 } from "lucide-react";

const STATUSES = ["pendiente","confirmado","pagado","enviado","entregado","cancelado"];
const STATUS_COLORS: Record<string, string> = {
  pendiente: "bg-yellow-500/20 text-yellow-500",
  confirmado: "bg-blue-500/20 text-blue-500",
  pagado: "bg-green-500/20 text-green-500",
  enviado: "bg-pink-400/20 text-pink-400",
  entregado: "bg-emerald-500/20 text-emerald-500",
  cancelado: "bg-destructive/20 text-destructive",
};

export function AdminOrders() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: orders, isLoading } = useGetOrders({ search: search || undefined, status: statusFilter || undefined });
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = (orderId: number, status: string) => {
    updateStatus.mutate({ id: orderId, data: { status: status as any } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetOrdersQueryKey() })
    });
  };

  const handleDelete = async (orderId: number) => {
    if (!confirm("¿Eliminar pedido cancelado?")) return;
    await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
    queryClient.invalidateQueries({ queryKey: getGetOrdersQueryKey() });
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-6">
        <h1 className="text-2xl font-bold tracking-tighter uppercase">Pedidos</h1>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre, email..." className="pl-9 rounded-none h-10 font-mono text-sm bg-background border-border" data-testid="input-search-orders" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 font-mono text-sm bg-background border border-border px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-w-[160px]">
            <option value="">Todos los estados</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>

        {isLoading ? (
          <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="bg-muted/30 h-16 animate-pulse border border-border" />)}</div>
        ) : (
          <div className="border border-border">
            <div className="hidden md:grid grid-cols-[80px_1fr_1fr_140px_140px_120px] gap-4 px-4 py-3 border-b border-border bg-muted/20 text-xs font-mono uppercase tracking-widest text-muted-foreground">
              <span>#</span><span>Cliente</span><span>Email</span><span>Total</span><span>Estado</span><span>Fecha</span>
            </div>
            {orders?.length === 0 && <p className="text-center text-muted-foreground font-mono text-sm py-12">No hay pedidos</p>}
            {orders?.map((order) => (
              <div key={order.id} data-testid={`row-order-${order.id}`}>
                <div
                  className="grid grid-cols-2 md:grid-cols-[80px_1fr_1fr_140px_140px_120px] gap-4 px-4 py-4 border-b border-border last:border-0 cursor-pointer hover:bg-muted/10 transition-colors items-center"
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                >
                  <span className="font-mono font-bold text-sm">#{order.id}</span>
                  <span className="font-mono text-sm font-medium">{order.firstName} {order.lastName}</span>
                  <span className="font-mono text-sm text-muted-foreground truncate hidden md:block">{order.email}</span>
                  <span className="font-mono font-bold text-sm">${Number(order.total).toLocaleString("es-AR")}</span>
                  <div onClick={(e) => e.stopPropagation()}>
                    <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`font-mono text-xs px-2 py-1 border-0 focus:outline-none cursor-pointer rounded-none ${STATUS_COLORS[order.status] ?? ""}`}
                      data-testid={`select-order-status-${order.id}`}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  {order.status === "cancelado" && (
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(order.id); }} title="Eliminar" className="h-7 w-7 border border-border flex items-center justify-center hover:border-destructive hover:text-destructive transition-colors ml-2">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                  <span className="font-mono text-xs text-muted-foreground hidden md:block">{new Date(order.createdAt).toLocaleDateString("es-AR")}</span>
                </div>
                {expandedId === order.id && (
                  <div className="bg-muted/10 px-6 py-4 border-b border-border text-xs font-mono space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div><p className="text-muted-foreground uppercase tracking-widest mb-1">Teléfono</p><p>{order.phone}</p></div>
                      <div><p className="text-muted-foreground uppercase tracking-widest mb-1">Dirección</p><p>{order.address}, {order.city}</p></div>
                      <div><p className="text-muted-foreground uppercase tracking-widest mb-1">Envío</p><p>{order.shippingMethodName ?? "—"}</p></div>
                      <div><p className="text-muted-foreground uppercase tracking-widest mb-1">Pago</p><p>{order.paymentMethodName ?? "—"}</p></div>
                    </div>
                    <div>
                      <p className="text-muted-foreground uppercase tracking-widest mb-2">Productos</p>
                      <div className="space-y-1">
                        {order.items?.map((item) => (
                          <div key={item.id} className="flex gap-4 justify-between">
                            <span>{item.quantity}x {item.productName}</span>
                            <span>${Number(item.price).toLocaleString("es-AR")}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
