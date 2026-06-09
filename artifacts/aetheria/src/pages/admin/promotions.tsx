import { useState } from "react";
import { useGetPromotions, useGetCoupons, useCreatePromotion, useUpdatePromotion, useDeletePromotion, useCreateCoupon, useUpdateCoupon, useDeleteCoupon, getGetPromotionsQueryKey, getGetCouponsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

export function AdminPromotions() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"promotions" | "coupons">("promotions");
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [editPromoId, setEditPromoId] = useState<number | null>(null);
  const [promoForm, setPromoForm] = useState({ title: "", description: "", discountType: "percentage", discountValue: "", active: true, badge: "", startDate: "", endDate: "" });
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [editCouponId, setEditCouponId] = useState<number | null>(null);
  const [couponForm, setCouponForm] = useState({ code: "", description: "", discountType: "percentage", discountValue: "", active: true, startDate: "", endDate: "", usageLimit: "" });

  const { data: promotions } = useGetPromotions();
  const { data: coupons } = useGetCoupons();
  const createPromo = useCreatePromotion();
  const updatePromo = useUpdatePromotion();
  const deletePromo = useDeletePromotion();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...promoForm, discountValue: promoForm.discountValue };
    if (editPromoId) updatePromo.mutate({ id: editPromoId, data: payload as any }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetPromotionsQueryKey() }); setShowPromoForm(false); } });
    else createPromo.mutate({ data: payload as any }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetPromotionsQueryKey() }); setShowPromoForm(false); } });
  };

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...couponForm, usageLimit: couponForm.usageLimit ? Number(couponForm.usageLimit) : undefined };
    if (editCouponId) updateCoupon.mutate({ id: editCouponId, data: payload as any }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetCouponsQueryKey() }); setShowCouponForm(false); } });
    else createCoupon.mutate({ data: payload as any }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetCouponsQueryKey() }); setShowCouponForm(false); } });
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-6">
        <h1 className="text-2xl font-bold tracking-tighter uppercase">Promociones y Cupones</h1>

        <div className="flex border-b border-border">
          {(["promotions","coupons"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-6 py-3 font-mono text-xs uppercase tracking-widest border-b-2 transition-colors ${tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {t === "promotions" ? "Promociones" : "Cupones"}
            </button>
          ))}
        </div>

        {tab === "promotions" && (
          <div className="space-y-4">
            <Button onClick={() => { setPromoForm({ title: "", description: "", discountType: "percentage", discountValue: "", active: true, badge: "", startDate: "", endDate: "" }); setEditPromoId(null); setShowPromoForm(true); }} className="rounded-none font-mono uppercase text-xs tracking-widest bg-primary text-white hover:bg-primary/80 border-none h-10">
              <Plus className="h-4 w-4 mr-2" />Nueva promoción
            </Button>
            {showPromoForm && (
              <form onSubmit={handlePromoSubmit} className="border border-primary/30 bg-card p-6 space-y-4">
                <div className="flex justify-between items-center"><h3 className="font-mono uppercase text-sm tracking-widest">{editPromoId ? "Editar" : "Nueva"} Promoción</h3><button type="button" onClick={() => setShowPromoForm(false)}><X className="h-4 w-4" /></button></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="text-xs font-mono text-muted-foreground uppercase mb-1 block">Título *</label><Input value={promoForm.title} onChange={(e) => setPromoForm({ ...promoForm, title: e.target.value })} required className="rounded-none h-10 font-mono text-sm bg-background border-border" /></div>
                  <div><label className="text-xs font-mono text-muted-foreground uppercase mb-1 block">Badge</label><Input value={promoForm.badge} onChange={(e) => setPromoForm({ ...promoForm, badge: e.target.value })} placeholder="30% OFF" className="rounded-none h-10 font-mono text-sm bg-background border-border" /></div>
                  <div><label className="text-xs font-mono text-muted-foreground uppercase mb-1 block">Tipo</label>
                    <select value={promoForm.discountType} onChange={(e) => setPromoForm({ ...promoForm, discountType: e.target.value })} className="w-full h-10 font-mono text-sm bg-background border border-border px-3 text-foreground focus:outline-none">
                      <option value="percentage">Porcentaje (%)</option><option value="fixed">Monto fijo ($)</option>
                    </select>
                  </div>
                  <div><label className="text-xs font-mono text-muted-foreground uppercase mb-1 block">Valor</label><Input value={promoForm.discountValue} onChange={(e) => setPromoForm({ ...promoForm, discountValue: e.target.value })} required type="number" className="rounded-none h-10 font-mono text-sm bg-background border-border" /></div>
                  <div><label className="text-xs font-mono text-muted-foreground uppercase mb-1 block">Fecha inicio</label><Input value={promoForm.startDate} onChange={(e) => setPromoForm({ ...promoForm, startDate: e.target.value })} type="date" className="rounded-none h-10 font-mono text-sm bg-background border-border" /></div>
                  <div><label className="text-xs font-mono text-muted-foreground uppercase mb-1 block">Fecha fin</label><Input value={promoForm.endDate} onChange={(e) => setPromoForm({ ...promoForm, endDate: e.target.value })} type="date" className="rounded-none h-10 font-mono text-sm bg-background border-border" /></div>
                </div>
                <label className="flex items-center gap-2 font-mono text-sm cursor-pointer"><input type="checkbox" checked={promoForm.active} onChange={(e) => setPromoForm({ ...promoForm, active: e.target.checked })} />Activa</label>
                <div className="flex gap-3"><Button type="submit" className="rounded-none font-mono uppercase text-xs bg-primary text-white hover:bg-primary/80 border-none h-10"><Check className="h-4 w-4 mr-2" />Guardar</Button><Button type="button" variant="outline" onClick={() => setShowPromoForm(false)} className="rounded-none h-10 border-border font-mono text-xs">Cancelar</Button></div>
              </form>
            )}
            <div className="border border-border">
              {promotions?.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0 gap-4">
                  <div>
                    <p className="font-mono font-bold text-sm">{p.title}</p>
                    <p className="font-mono text-xs text-muted-foreground">{p.discountType === "percentage" ? `${p.discountValue}% OFF` : `$${Number(p.discountValue).toLocaleString("es-AR")} OFF`} · {p.active ? <span className="text-emerald-500">Activa</span> : <span className="text-muted-foreground">Inactiva</span>}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => { setPromoForm({ title: p.title, description: p.description ?? "", discountType: p.discountType, discountValue: String(p.discountValue), active: p.active ?? true, badge: p.badge ?? "", startDate: p.startDate ?? "", endDate: p.endDate ?? "" }); setEditPromoId(p.id); setShowPromoForm(true); }} className="h-8 w-8 border border-border flex items-center justify-center hover:border-primary"><Pencil className="h-3 w-3" /></button>
                    <button onClick={() => { if (confirm("¿Eliminar?")) deletePromo.mutate({ id: p.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetPromotionsQueryKey() }) }); }} className="h-8 w-8 border border-border flex items-center justify-center hover:border-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "coupons" && (
          <div className="space-y-4">
            <Button onClick={() => { setCouponForm({ code: "", description: "", discountType: "percentage", discountValue: "", active: true, startDate: "", endDate: "", usageLimit: "" }); setEditCouponId(null); setShowCouponForm(true); }} className="rounded-none font-mono uppercase text-xs tracking-widest bg-primary text-white hover:bg-primary/80 border-none h-10">
              <Plus className="h-4 w-4 mr-2" />Nuevo cupón
            </Button>
            {showCouponForm && (
              <form onSubmit={handleCouponSubmit} className="border border-primary/30 bg-card p-6 space-y-4">
                <div className="flex justify-between items-center"><h3 className="font-mono uppercase text-sm tracking-widest">{editCouponId ? "Editar" : "Nuevo"} Cupón</h3><button type="button" onClick={() => setShowCouponForm(false)}><X className="h-4 w-4" /></button></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="text-xs font-mono text-muted-foreground uppercase mb-1 block">Código *</label><Input value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} required className="rounded-none h-10 font-mono text-sm bg-background border-border" /></div>
                  <div><label className="text-xs font-mono text-muted-foreground uppercase mb-1 block">Tipo</label>
                    <select value={couponForm.discountType} onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })} className="w-full h-10 font-mono text-sm bg-background border border-border px-3 text-foreground focus:outline-none">
                      <option value="percentage">Porcentaje (%)</option><option value="fixed">Monto fijo ($)</option>
                    </select>
                  </div>
                  <div><label className="text-xs font-mono text-muted-foreground uppercase mb-1 block">Valor *</label><Input value={couponForm.discountValue} onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })} required type="number" className="rounded-none h-10 font-mono text-sm bg-background border-border" /></div>
                  <div><label className="text-xs font-mono text-muted-foreground uppercase mb-1 block">Límite de usos</label><Input value={couponForm.usageLimit} onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })} type="number" placeholder="Sin límite" className="rounded-none h-10 font-mono text-sm bg-background border-border" /></div>
                  <div><label className="text-xs font-mono text-muted-foreground uppercase mb-1 block">Vigencia desde</label><Input value={couponForm.startDate} onChange={(e) => setCouponForm({ ...couponForm, startDate: e.target.value })} type="date" className="rounded-none h-10 font-mono text-sm bg-background border-border" /></div>
                  <div><label className="text-xs font-mono text-muted-foreground uppercase mb-1 block">Vigencia hasta</label><Input value={couponForm.endDate} onChange={(e) => setCouponForm({ ...couponForm, endDate: e.target.value })} type="date" className="rounded-none h-10 font-mono text-sm bg-background border-border" /></div>
                </div>
                <label className="flex items-center gap-2 font-mono text-sm cursor-pointer"><input type="checkbox" checked={couponForm.active} onChange={(e) => setCouponForm({ ...couponForm, active: e.target.checked })} />Activo</label>
                <div className="flex gap-3"><Button type="submit" className="rounded-none font-mono uppercase text-xs bg-primary text-white hover:bg-primary/80 border-none h-10"><Check className="h-4 w-4 mr-2" />Guardar</Button><Button type="button" variant="outline" onClick={() => setShowCouponForm(false)} className="rounded-none h-10 border-border font-mono text-xs">Cancelar</Button></div>
              </form>
            )}
            <div className="border border-border">
              {coupons?.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0 gap-4">
                  <div>
                    <p className="font-mono font-bold text-sm">{c.code}</p>
                    <p className="font-mono text-xs text-muted-foreground">{c.discountType === "percentage" ? `${c.discountValue}%` : `$${Number(c.discountValue).toLocaleString("es-AR")}`} · Usos: {c.usageCount}{c.usageLimit ? `/${c.usageLimit}` : ""} · {c.active ? <span className="text-emerald-500">Activo</span> : <span className="text-muted-foreground">Inactivo</span>}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => { setCouponForm({ code: c.code, description: c.description ?? "", discountType: c.discountType, discountValue: String(c.discountValue), active: c.active ?? true, startDate: c.startDate ?? "", endDate: c.endDate ?? "", usageLimit: c.usageLimit ? String(c.usageLimit) : "" }); setEditCouponId(c.id); setShowCouponForm(true); }} className="h-8 w-8 border border-border flex items-center justify-center hover:border-primary"><Pencil className="h-3 w-3" /></button>
                    <button onClick={() => { if (confirm("¿Eliminar?")) deleteCoupon.mutate({ id: c.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCouponsQueryKey() }) }); }} className="h-8 w-8 border border-border flex items-center justify-center hover:border-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
