import { useState } from "react";
import { useGetCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, getGetCategoriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

export function AdminCategories() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", image: "", active: true });

  const { data: categories, isLoading } = useGetCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getGetCategoriesQueryKey() });

  const openCreate = () => { setForm({ name: "", slug: "", description: "", image: "", active: true }); setEditId(null); setShowForm(true); };
  const openEdit = (c: any) => { setForm({ name: c.name, slug: c.slug, description: c.description ?? "", image: c.image ?? "", active: c.active }); setEditId(c.id); setShowForm(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"), image: form.image || undefined };
    if (editId) updateCategory.mutate({ id: editId, data: payload }, { onSuccess: () => { invalidate(); setShowForm(false); } });
    else createCategory.mutate({ data: payload as any }, { onSuccess: () => { invalidate(); setShowForm(false); } });
  };

  const handleDelete = (id: number) => {
    if (!confirm("¿Eliminar categoría?")) return;
    deleteCategory.mutate({ id }, { onSuccess: invalidate });
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tighter uppercase">Categorías</h1>
          <Button onClick={openCreate} className="rounded-none font-mono uppercase text-xs tracking-widest bg-primary text-white hover:bg-primary/80 border-none h-10">
            <Plus className="h-4 w-4 mr-2" />Nueva
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="border border-primary/30 bg-card p-6 space-y-4 max-w-xl">
            <div className="flex justify-between items-center">
              <h2 className="font-mono uppercase text-sm tracking-widest">{editId ? "Editar" : "Nueva"} categoría</h2>
              <button type="button" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase mb-1 block">Nombre *</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="rounded-none h-10 font-mono text-sm bg-background border-border" />
              </div>
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase mb-1 block">Slug</label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generado" className="rounded-none h-10 font-mono text-sm bg-background border-border" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-mono text-muted-foreground uppercase mb-1 block">Descripción</label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-none h-10 font-mono text-sm bg-background border-border" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-mono text-muted-foreground uppercase mb-2 block">Imagen</label>
                <ImageUploader
                  value={form.image}
                  onChange={(path) => setForm({ ...form, image: path })}
                  onClear={() => setForm({ ...form, image: "" })}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 font-mono text-sm cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />Activa
            </label>
            <div className="flex gap-3">
              <Button type="submit" disabled={createCategory.isPending || updateCategory.isPending} className="rounded-none font-mono uppercase text-xs bg-primary text-white hover:bg-primary/80 border-none h-10">
                <Check className="h-4 w-4 mr-2" />Guardar
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-none h-10 border-border font-mono text-xs">Cancelar</Button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12"><div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
            {categories?.map((c) => (
              <div key={c.id} className="bg-card border border-card-border p-4 flex justify-between items-start gap-4">
                <div className="flex gap-3 items-start">
                  {c.image && (
                    <img src={c.image} alt={c.name} className="w-12 h-12 object-cover border border-border shrink-0" />
                  )}
                  <div>
                    <p className="font-bold font-mono text-sm uppercase tracking-wider">{c.name}</p>
                    <p className="font-mono text-xs text-muted-foreground mt-1">{c.slug}</p>
                    <span className={`inline-block mt-2 text-xs font-mono ${c.active ? "text-emerald-500" : "text-muted-foreground"}`}>{c.active ? "Activa" : "Inactiva"}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEdit(c)} className="h-8 w-8 border border-border flex items-center justify-center hover:border-primary transition-colors"><Pencil className="h-3 w-3" /></button>
                  <button onClick={() => handleDelete(c.id)} className="h-8 w-8 border border-border flex items-center justify-center hover:border-destructive hover:text-destructive transition-colors"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
