import { useState } from "react";
import { useGetSizeGuides, useCreateSizeGuide, useUpdateSizeGuide, useDeleteSizeGuide, getGetSizeGuidesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

type TableRow = { label: string; values: string[] };

const DEFAULT_HEADERS = ["Talle", "Pecho (cm)", "Cintura (cm)", "Cadera (cm)"];
const DEFAULT_ROWS: TableRow[] = [
  { label: "S", values: ["86-89", "71-74", "89-92"] },
  { label: "M", values: ["90-93", "75-78", "93-96"] },
  { label: "L", values: ["94-97", "79-82", "97-100"] },
  { label: "XL", values: ["98-101", "83-86", "101-104"] },
];

interface SizeGuideForm {
  name: string;
  description: string;
  instructions: string;
  imageObjectPath: string;
  active: boolean;
  headers: string[];
  rows: TableRow[];
}

const defaultForm: SizeGuideForm = {
  name: "", description: "", instructions: "", imageObjectPath: "", active: true,
  headers: DEFAULT_HEADERS, rows: DEFAULT_ROWS,
};

function TableEditor({ headers, rows, onChange }: {
  headers: string[];
  rows: TableRow[];
  onChange: (headers: string[], rows: TableRow[]) => void;
}) {
  const updateHeader = (i: number, val: string) => {
    const h = [...headers]; h[i] = val; onChange(h, rows);
  };
  const updateCell = (ri: number, ci: number, val: string) => {
    const r = rows.map((row, idx) => idx === ri ? { ...row, values: row.values.map((v, vi) => vi === ci ? val : v) } : row);
    onChange(headers, r);
  };
  const updateRowLabel = (ri: number, val: string) => {
    const r = rows.map((row, idx) => idx === ri ? { ...row, label: val } : row);
    onChange(headers, r);
  };
  const addRow = () => onChange(headers, [...rows, { label: "", values: Array(headers.length - 1).fill("") }]);
  const removeRow = (ri: number) => onChange(headers, rows.filter((_, i) => i !== ri));

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full font-mono text-xs border-collapse">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="border border-border p-1">
                  <input value={h} onChange={(e) => updateHeader(i, e.target.value)} className="w-full bg-background text-foreground text-center focus:outline-none min-w-[80px]" />
                </th>
              ))}
              <th className="border border-border p-1 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                <td className="border border-border p-1">
                  <input value={row.label} onChange={(e) => updateRowLabel(ri, e.target.value)} className="w-full bg-background text-foreground text-center focus:outline-none min-w-[40px]" />
                </td>
                {row.values.map((val, ci) => (
                  <td key={ci} className="border border-border p-1">
                    <input value={val} onChange={(e) => updateCell(ri, ci, e.target.value)} className="w-full bg-background text-foreground text-center focus:outline-none min-w-[70px]" />
                  </td>
                ))}
                <td className="border border-border p-1">
                  <button onClick={() => removeRow(ri)} className="h-5 w-5 flex items-center justify-center hover:text-destructive"><X className="h-3 w-3" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={addRow} className="flex items-center gap-2 text-xs font-mono border border-border px-3 py-1.5 hover:border-primary transition-colors">
        <Plus className="h-3 w-3" />Agregar fila
      </button>
    </div>
  );
}

export function AdminSizeGuides() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<SizeGuideForm>(defaultForm);

  const { data: guides, isLoading } = useGetSizeGuides();
  const createGuide = useCreateSizeGuide();
  const updateGuide = useUpdateSizeGuide();
  const deleteGuide = useDeleteSizeGuide();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getGetSizeGuidesQueryKey() });

  const openCreate = () => { setForm(defaultForm); setEditId(null); setShowForm(true); };
  const openEdit = (g: any) => {
    const td = g.tableData as any ?? { headers: DEFAULT_HEADERS, rows: DEFAULT_ROWS };
    setForm({
      name: g.name, description: g.description ?? "", instructions: g.instructions ?? "",
      imageObjectPath: g.imageObjectPath ?? "", active: g.active,
      headers: td.headers ?? DEFAULT_HEADERS, rows: td.rows ?? DEFAULT_ROWS,
    });
    setEditId(g.id); setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name, description: form.description || undefined,
      instructions: form.instructions || undefined,
      imageObjectPath: form.imageObjectPath || undefined,
      active: form.active,
      tableData: { headers: form.headers, rows: form.rows },
    };
    if (editId) {
      updateGuide.mutate({ id: editId, data: payload as any }, { onSuccess: () => { invalidate(); setShowForm(false); } });
    } else {
      createGuide.mutate({ data: payload as any }, { onSuccess: () => { invalidate(); setShowForm(false); } });
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm("¿Eliminar guía?")) return;
    deleteGuide.mutate({ id }, { onSuccess: invalidate });
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tighter uppercase">Guías de talles</h1>
          <Button onClick={openCreate} className="rounded-none font-mono uppercase text-xs tracking-widest bg-primary text-white hover:bg-primary/80 border-none h-10">
            <Plus className="h-4 w-4 mr-2" />Nueva guía
          </Button>
        </div>

        {showForm && (
          <div className="border border-primary/30 bg-card p-6 space-y-5 max-w-3xl">
            <div className="flex items-center justify-between">
              <h2 className="font-mono uppercase tracking-widest text-sm">{editId ? "Editar guía" : "Nueva guía de talles"}</h2>
              <button onClick={() => setShowForm(false)}><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-muted-foreground uppercase mb-1 block">Nombre *</label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="rounded-none h-10 font-mono text-sm bg-background border-border" />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <label className="flex items-center gap-2 font-mono text-sm cursor-pointer">
                    <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />Activa
                  </label>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase mb-1 block">Descripción</label>
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-none h-10 font-mono text-sm bg-background border-border" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase mb-1 block">Instrucciones (cómo medirse)</label>
                  <textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} rows={3} className="w-full font-mono text-sm bg-background border border-border px-3 py-2 text-foreground focus:outline-none resize-none" placeholder="Ej: Medite el contorno del pecho con una cinta métrica..." />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase mb-2 block">Imagen de referencia</label>
                <ImageUploader
                  value={form.imageObjectPath}
                  onChange={(path) => setForm({ ...form, imageObjectPath: path })}
                  onClear={() => setForm({ ...form, imageObjectPath: "" })}
                />
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase mb-3 block">Tabla de medidas</label>
                <TableEditor
                  headers={form.headers}
                  rows={form.rows}
                  onChange={(h, r) => setForm({ ...form, headers: h, rows: r })}
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={createGuide.isPending || updateGuide.isPending} className="rounded-none font-mono uppercase text-xs bg-primary text-white hover:bg-primary/80 border-none h-10">
                  <Check className="h-4 w-4 mr-2" />Guardar
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-none h-10 border-border font-mono text-xs">Cancelar</Button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12"><div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
            {guides?.map((g) => (
              <div key={g.id} className="bg-card border border-card-border p-4 flex justify-between items-start gap-4">
                <div>
                  <p className="font-bold font-mono text-sm uppercase tracking-wider">{g.name}</p>
                  {g.description && <p className="font-mono text-xs text-muted-foreground mt-1 line-clamp-2">{g.description}</p>}
                  <span className={`inline-block mt-2 text-xs font-mono ${g.active ? "text-emerald-500" : "text-muted-foreground"}`}>{g.active ? "Activa" : "Inactiva"}</span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEdit(g)} className="h-8 w-8 border border-border flex items-center justify-center hover:border-primary transition-colors"><Pencil className="h-3 w-3" /></button>
                  <button onClick={() => handleDelete(g.id)} className="h-8 w-8 border border-border flex items-center justify-center hover:border-destructive hover:text-destructive transition-colors"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
            ))}
            {guides?.length === 0 && (
              <p className="col-span-full text-sm font-mono text-muted-foreground py-8 text-center">Sin guías creadas todavía.</p>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
