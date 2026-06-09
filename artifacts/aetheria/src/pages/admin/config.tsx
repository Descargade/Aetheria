import { useState } from "react";
import { useGetShippingMethods, useGetPaymentMethods, useCreateShippingMethod, useUpdateShippingMethod, useDeleteShippingMethod, useCreatePaymentMethod, useUpdatePaymentMethod, useDeletePaymentMethod, useBulkPriceUpdate, getGetShippingMethodsQueryKey, getGetPaymentMethodsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AdminConfig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [tab, setTab] = useState<"shipping" | "payment" | "prices">("shipping");
  const [bulkType, setBulkType] = useState("increase_percentage");
  const [bulkValue, setBulkValue] = useState("");

  const { data: shippingMethods } = useGetShippingMethods();
  const { data: paymentMethods } = useGetPaymentMethods();
  const createShipping = useCreateShippingMethod();
  const updateShipping = useUpdateShippingMethod();
  const deleteShipping = useDeleteShippingMethod();
  const createPayment = useCreatePaymentMethod();
  const updatePayment = useUpdatePaymentMethod();
  const deletePayment = useDeletePaymentMethod();
  const bulkPrice = useBulkPriceUpdate();

  const [shippingEdit, setShippingEdit] = useState<any | null>(null);
  const [paymentEdit, setPaymentEdit] = useState<any | null>(null);

  const handleBulkUpdate = () => {
    if (!bulkValue) return;
    bulkPrice.mutate({ data: { type: bulkType as any, value: Number(bulkValue) } }, {
      onSuccess: (r) => toast({ title: r.message, description: `${r.updated} productos actualizados` })
    });
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-6">
        <h1 className="text-2xl font-bold tracking-tighter uppercase">Configuración</h1>

        <div className="flex border-b border-border">
          {(["shipping","payment","prices"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-6 py-3 font-mono text-xs uppercase tracking-widest border-b-2 transition-colors ${tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {t === "shipping" ? "Métodos de envío" : t === "payment" ? "Métodos de pago" : "Precios masivos"}
            </button>
          ))}
        </div>

        {tab === "shipping" && (
          <div className="space-y-4 max-w-2xl">
            <Button onClick={() => setShippingEdit({ id: null, name: "", description: "", price: "", estimatedDays: "", active: true })} className="rounded-none font-mono uppercase text-xs tracking-widest bg-primary text-white hover:bg-primary/80 border-none h-10">
              <Plus className="h-4 w-4 mr-2" />Nuevo método de envío
            </Button>
            {shippingEdit && (
              <div className="border border-primary/30 bg-card p-6 space-y-4">
                <div className="flex justify-between"><h3 className="font-mono uppercase text-sm tracking-widest">Método de envío</h3><button onClick={() => setShippingEdit(null)}><X className="h-4 w-4" /></button></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs font-mono text-muted-foreground uppercase mb-1 block">Nombre *</label><Input value={shippingEdit.name} onChange={(e) => setShippingEdit({ ...shippingEdit, name: e.target.value })} className="rounded-none h-10 font-mono text-sm bg-background border-border" /></div>
                  <div><label className="text-xs font-mono text-muted-foreground uppercase mb-1 block">Precio ($)</label><Input value={shippingEdit.price} onChange={(e) => setShippingEdit({ ...shippingEdit, price: e.target.value })} type="number" className="rounded-none h-10 font-mono text-sm bg-background border-border" /></div>
                  <div><label className="text-xs font-mono text-muted-foreground uppercase mb-1 block">Días estimados</label><Input value={shippingEdit.estimatedDays} onChange={(e) => setShippingEdit({ ...shippingEdit, estimatedDays: e.target.value })} placeholder="2-3 días hábiles" className="rounded-none h-10 font-mono text-sm bg-background border-border" /></div>
                  <div><label className="text-xs font-mono text-muted-foreground uppercase mb-1 block">Descripción</label><Input value={shippingEdit.description} onChange={(e) => setShippingEdit({ ...shippingEdit, description: e.target.value })} className="rounded-none h-10 font-mono text-sm bg-background border-border" /></div>
                </div>
                <label className="flex items-center gap-2 font-mono text-sm cursor-pointer"><input type="checkbox" checked={shippingEdit.active} onChange={(e) => setShippingEdit({ ...shippingEdit, active: e.target.checked })} />Activo</label>
                <div className="flex gap-3">
                  <Button onClick={() => {
                    const payload = { name: shippingEdit.name, description: shippingEdit.description, price: shippingEdit.price, estimatedDays: shippingEdit.estimatedDays, active: shippingEdit.active };
                    if (shippingEdit.id) updateShipping.mutate({ id: shippingEdit.id, data: payload as any }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetShippingMethodsQueryKey() }); setShippingEdit(null); } });
                    else createShipping.mutate({ data: payload as any }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetShippingMethodsQueryKey() }); setShippingEdit(null); } });
                  }} className="rounded-none font-mono uppercase text-xs bg-primary text-white hover:bg-primary/80 border-none h-10"><Check className="h-4 w-4 mr-2" />Guardar</Button>
                  <Button variant="outline" onClick={() => setShippingEdit(null)} className="rounded-none font-mono text-xs h-10 border-border">Cancelar</Button>
                </div>
              </div>
            )}
            <div className="border border-border">
              {shippingMethods?.map((s) => (
                <div key={s.id} className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0 gap-4">
                  <div><p className="font-mono font-bold text-sm">{s.name}</p><p className="font-mono text-xs text-muted-foreground">${Number(s.price).toLocaleString("es-AR")} · {s.estimatedDays}</p></div>
                  <div className="flex gap-2">
                    <button onClick={() => setShippingEdit({ ...s })} className="h-8 w-8 border border-border flex items-center justify-center hover:border-primary"><Pencil className="h-3 w-3" /></button>
                    <button onClick={() => { if (confirm("¿Eliminar?")) deleteShipping.mutate({ id: s.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetShippingMethodsQueryKey() }) }); }} className="h-8 w-8 border border-border flex items-center justify-center hover:border-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "payment" && (
          <div className="space-y-4 max-w-2xl">
            <Button onClick={() => setPaymentEdit({ id: null, name: "", description: "", discount: "0", active: true, instructions: "" })} className="rounded-none font-mono uppercase text-xs tracking-widest bg-primary text-white hover:bg-primary/80 border-none h-10">
              <Plus className="h-4 w-4 mr-2" />Nuevo método de pago
            </Button>
            {paymentEdit && (
              <div className="border border-primary/30 bg-card p-6 space-y-4">
                <div className="flex justify-between"><h3 className="font-mono uppercase text-sm tracking-widest">Método de pago</h3><button onClick={() => setPaymentEdit(null)}><X className="h-4 w-4" /></button></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs font-mono text-muted-foreground uppercase mb-1 block">Nombre *</label><Input value={paymentEdit.name} onChange={(e) => setPaymentEdit({ ...paymentEdit, name: e.target.value })} className="rounded-none h-10 font-mono text-sm bg-background border-border" /></div>
                  <div><label className="text-xs font-mono text-muted-foreground uppercase mb-1 block">Descuento (%)</label><Input value={paymentEdit.discount} onChange={(e) => setPaymentEdit({ ...paymentEdit, discount: e.target.value })} type="number" min={0} max={100} className="rounded-none h-10 font-mono text-sm bg-background border-border" /></div>
                  <div className="col-span-2"><label className="text-xs font-mono text-muted-foreground uppercase mb-1 block">Instrucciones de pago</label><Input value={paymentEdit.instructions} onChange={(e) => setPaymentEdit({ ...paymentEdit, instructions: e.target.value })} placeholder="CBU / Alias / etc." className="rounded-none h-10 font-mono text-sm bg-background border-border" /></div>
                </div>
                <label className="flex items-center gap-2 font-mono text-sm cursor-pointer"><input type="checkbox" checked={paymentEdit.active} onChange={(e) => setPaymentEdit({ ...paymentEdit, active: e.target.checked })} />Activo</label>
                <div className="flex gap-3">
                  <Button onClick={() => {
                    const payload = { name: paymentEdit.name, description: paymentEdit.description, discount: paymentEdit.discount, active: paymentEdit.active, instructions: paymentEdit.instructions };
                    if (paymentEdit.id) updatePayment.mutate({ id: paymentEdit.id, data: payload as any }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetPaymentMethodsQueryKey() }); setPaymentEdit(null); } });
                    else createPayment.mutate({ data: payload as any }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetPaymentMethodsQueryKey() }); setPaymentEdit(null); } });
                  }} className="rounded-none font-mono uppercase text-xs bg-primary text-white hover:bg-primary/80 border-none h-10"><Check className="h-4 w-4 mr-2" />Guardar</Button>
                  <Button variant="outline" onClick={() => setPaymentEdit(null)} className="rounded-none font-mono text-xs h-10 border-border">Cancelar</Button>
                </div>
              </div>
            )}
            <div className="border border-border">
              {paymentMethods?.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0 gap-4">
                  <div><p className="font-mono font-bold text-sm">{p.name}</p><p className="font-mono text-xs text-muted-foreground">{p.discount}% descuento · {p.active ? <span className="text-emerald-500">Activo</span> : <span>Inactivo</span>}</p></div>
                  <div className="flex gap-2">
                    <button onClick={() => setPaymentEdit({ ...p, discount: String(p.discount) })} className="h-8 w-8 border border-border flex items-center justify-center hover:border-primary"><Pencil className="h-3 w-3" /></button>
                    <button onClick={() => { if (confirm("¿Eliminar?")) deletePayment.mutate({ id: p.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetPaymentMethodsQueryKey() }) }); }} className="h-8 w-8 border border-border flex items-center justify-center hover:border-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "prices" && (
          <div className="max-w-md space-y-6">
            <p className="font-mono text-sm text-muted-foreground">Aplicá un cambio de precio a todos los productos o a una categoría específica.</p>
            <div className="space-y-4">
              <div><label className="text-xs font-mono text-muted-foreground uppercase mb-1 block">Tipo de ajuste</label>
                <select value={bulkType} onChange={(e) => setBulkType(e.target.value)} className="w-full h-10 font-mono text-sm bg-background border border-border px-3 text-foreground focus:outline-none">
                  <option value="increase_percentage">Aumentar %</option>
                  <option value="decrease_percentage">Reducir %</option>
                  <option value="increase_fixed">Aumentar monto fijo</option>
                  <option value="decrease_fixed">Reducir monto fijo</option>
                </select>
              </div>
              <div><label className="text-xs font-mono text-muted-foreground uppercase mb-1 block">Valor</label>
                <Input value={bulkValue} onChange={(e) => setBulkValue(e.target.value)} type="number" min={0} placeholder={bulkType.includes("percentage") ? "10 (= 10%)" : "1000 (= $1000)"} className="rounded-none h-10 font-mono text-sm bg-background border-border" />
              </div>
              <Button onClick={handleBulkUpdate} disabled={!bulkValue || bulkPrice.isPending} className="w-full h-12 rounded-none font-mono uppercase tracking-widest bg-primary text-white hover:bg-primary/80 border-none">
                {bulkPrice.isPending ? "Actualizando..." : "Aplicar ajuste de precios"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
