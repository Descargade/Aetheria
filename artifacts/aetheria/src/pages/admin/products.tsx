import { useState } from "react";
import { useGetProducts, useGetCategories, useCreateProduct, useUpdateProduct, useDeleteProduct, getGetProductsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Search, X, Check } from "lucide-react";

type ProductForm = { name: string; sku: string; shortDescription: string; description: string; categoryId: number; price: string; salePrice: string; sizes: string; colors: string; stock: number; featured: boolean; isNew: boolean; active: boolean; };

const defaultForm: ProductForm = { name: "", sku: "", shortDescription: "", description: "", categoryId: 0, price: "", salePrice: "", sizes: "", colors: "", stock: 0, featured: false, isNew: false, active: true };

export function AdminProducts() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(defaultForm);

  const { data: products, isLoading } = useGetProducts({ search: search || undefined });
  const { data: categories } = useGetCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getGetProductsQueryKey() });

  const openCreate = () => { setForm(defaultForm); setEditId(null); setShowForm(true); };
  const openEdit = (p: any) => {
    setForm({ name: p.name, sku: p.sku ?? "", shortDescription: p.shortDescription ?? "", description: p.description ?? "", categoryId: p.categoryId, price: String(p.price), salePrice: p.salePrice ? String(p.salePrice) : "", sizes: (p.sizes ?? []).join(", "), colors: (p.colors ?? []).join(", "), stock: p.stock, featured: p.featured, isNew: p.isNew, active: p.active });
    setEditId(p.id); setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, categoryId: Number(form.categoryId), price: form.price, salePrice: form.salePrice || undefined, stock: Number(form.stock), sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean), colors: form.colors.split(",").map((c) => c.trim()).filter(Boolean) };
    if (editId) {
      updateProduct.mutate({ id: editId, data: payload as any }, { onSuccess: () => { invalidate(); setShowForm(false); } });
    } else {
      createProduct.mutate({ data: payload as any }, { onSuccess: () => { invalidate(); setShowForm(false); } });
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm("¿Eliminar producto?")) return;
    deleteProduct.mutate({ id }, { onSuccess: invalidate });
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tighter uppercase">Productos</h1>
          <Button onClick={openCreate} className="rounded-none font-mono uppercase text-xs tracking-widest bg-primary text-white hover:bg-primary/80 border-none h-10" data-testid="button-create-product">
            <Plus className="h-4 w-4 mr-2" />Nuevo
          </Button>
        </div>

        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar productos..." className="pl-9 rounded-none h-10 font-mono text-sm bg-background border-border" />
        </div>

        {/* Form */}
        {showForm && (
          <div className="border border-primary/30 bg-card p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-mono uppercase tracking-widest text-sm">{editId ? "Editar producto" : "Nuevo producto"}</h2>
              <button onClick={() => setShowForm(false)}><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="text-xs font-mono text-muted-foreground uppercase tracking-widest block mb-1">Nombre *</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="rounded-none h-10 font-mono text-sm bg-background border-border" /></div>
                <div><label className="text-xs font-mono text-muted-foreground uppercase tracking-widest block mb-1">SKU</label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="rounded-none h-10 font-mono text-sm bg-background border-border" /></div>
                <div><label className="text-xs font-mono text-muted-foreground uppercase tracking-widest block mb-1">Categoría *</label>
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })} required className="w-full h-10 font-mono text-sm bg-background border border-border px-3 text-foreground focus:outline-none">
                    <option value={0}>Seleccionar...</option>
                    {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-mono text-muted-foreground uppercase tracking-widest block mb-1">Stock</label><Input value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} type="number" min={0} className="rounded-none h-10 font-mono text-sm bg-background border-border" /></div>
                <div><label className="text-xs font-mono text-muted-foreground uppercase tracking-widest block mb-1">Precio *</label><Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required placeholder="15900" className="rounded-none h-10 font-mono text-sm bg-background border-border" /></div>
                <div><label className="text-xs font-mono text-muted-foreground uppercase tracking-widest block mb-1">Precio oferta</label><Input value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} placeholder="12900" className="rounded-none h-10 font-mono text-sm bg-background border-border" /></div>
                <div><label className="text-xs font-mono text-muted-foreground uppercase tracking-widest block mb-1">Talles (separados por coma)</label><Input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} placeholder="S, M, L, XL" className="rounded-none h-10 font-mono text-sm bg-background border-border" /></div>
                <div><label className="text-xs font-mono text-muted-foreground uppercase tracking-widest block mb-1">Colores (separados por coma)</label><Input value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} placeholder="Negro, Blanco" className="rounded-none h-10 font-mono text-sm bg-background border-border" /></div>
                <div className="sm:col-span-2"><label className="text-xs font-mono text-muted-foreground uppercase tracking-widest block mb-1">Descripción corta</label><Input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} className="rounded-none h-10 font-mono text-sm bg-background border-border" /></div>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 font-mono text-sm cursor-pointer"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />Destacado</label>
                <label className="flex items-center gap-2 font-mono text-sm cursor-pointer"><input type="checkbox" checked={form.isNew} onChange={(e) => setForm({ ...form, isNew: e.target.checked })} />Nuevo</label>
                <label className="flex items-center gap-2 font-mono text-sm cursor-pointer"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />Activo</label>
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending} className="rounded-none font-mono uppercase text-xs tracking-widest bg-primary text-white hover:bg-primary/80 border-none h-10">
                  <Check className="h-4 w-4 mr-2" />{editId ? "Guardar cambios" : "Crear producto"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-none font-mono uppercase text-xs h-10 border-border">Cancelar</Button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="border border-border">
          <div className="hidden md:grid grid-cols-[2fr_1fr_100px_100px_100px_80px] gap-4 px-4 py-3 border-b border-border bg-muted/20 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            <span>Nombre</span><span>Categoría</span><span>Precio</span><span>Stock</span><span>Estado</span><span></span>
          </div>
          {isLoading && <div className="p-8 text-center"><div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>}
          {products?.map((p) => (
            <div key={p.id} className="grid grid-cols-2 md:grid-cols-[2fr_1fr_100px_100px_100px_80px] gap-4 px-4 py-3 border-b border-border last:border-0 items-center" data-testid={`row-product-${p.id}`}>
              <div>
                <p className="font-mono font-bold text-sm">{p.name}</p>
                <p className="font-mono text-xs text-muted-foreground">{p.sku}</p>
              </div>
              <span className="font-mono text-sm text-muted-foreground hidden md:block">{p.categoryName}</span>
              <div className="font-mono text-sm hidden md:block">
                <p className="font-bold">${Number(p.price).toLocaleString("es-AR")}</p>
                {p.salePrice && <p className="text-primary text-xs">${Number(p.salePrice).toLocaleString("es-AR")}</p>}
              </div>
              <span className={`font-mono text-xs font-bold hidden md:block ${(p.stock ?? 0) === 0 ? "text-destructive" : (p.stock ?? 0) <= 5 ? "text-yellow-500" : "text-foreground"}`}>{p.stock ?? 0} u.</span>
              <span className={`font-mono text-xs hidden md:block ${p.active ? "text-emerald-500" : "text-muted-foreground"}`}>{p.active ? "Activo" : "Inactivo"}</span>
              <div className="flex gap-2 justify-end">
                <button onClick={() => openEdit(p)} className="h-8 w-8 border border-border flex items-center justify-center hover:border-primary transition-colors" data-testid={`button-edit-product-${p.id}`}><Pencil className="h-3 w-3" /></button>
                <button onClick={() => handleDelete(p.id)} className="h-8 w-8 border border-border flex items-center justify-center hover:border-destructive hover:text-destructive transition-colors" data-testid={`button-delete-product-${p.id}`}><Trash2 className="h-3 w-3" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
