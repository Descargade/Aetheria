import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetProductVariants, useCreateVariant, useUpdateVariant, useDeleteVariant,
  useAddVariantImage, useDeleteVariantImage, useUpsertVariantSizes,
  getGetProductVariantsQueryKey,
  type Variant, type VariantSize, type VariantImage,
} from "@workspace/api-client-react";
import { useUpload } from "@workspace/object-storage-web";
import { objectUrl } from "@/lib/storage-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Trash2, Upload, ChevronDown, ChevronRight, Check } from "lucide-react";

interface VariantManagerProps {
  productId: number;
  productName: string;
  onClose: () => void;
}

const SIZES_PRESET = ["XS", "S", "M", "L", "XL", "XXL"];

type SizeRow = { size: string; stock: number };

function VariantRow({ variant, productId }: { variant: Variant; productId: number }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [sizes, setSizes] = useState<SizeRow[]>(variant.sizes?.map(s => ({ size: s.size, stock: s.stock })) ?? []);
  const [addingImage, setAddingImage] = useState(false);
  const invalidate = () => queryClient.invalidateQueries({ queryKey: getGetProductVariantsQueryKey(productId) });

  const updateVariant = useUpdateVariant();
  const deleteVariant = useDeleteVariant();
  const addImage = useAddVariantImage();
  const deleteImage = useDeleteVariantImage();
  const upsertSizes = useUpsertVariantSizes();

  const { uploadFile, isUploading } = useUpload({
    onSuccess: async (res) => {
      await addImage.mutateAsync({ id: variant.id, data: { objectPath: res.objectPath } });
      invalidate();
      setAddingImage(false);
    },
  });

  const handleSaveSizes = () => {
    upsertSizes.mutate(
      { id: variant.id, data: sizes.filter(s => s.size.trim()) },
      { onSuccess: invalidate }
    );
  };

  const addSizeRow = () => setSizes([...sizes, { size: "", stock: 0 }]);
  const removeSizeRow = (i: number) => setSizes(sizes.filter((_, idx) => idx !== i));
  const updateSize = (i: number, field: keyof SizeRow, val: string | number) =>
    setSizes(sizes.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

  const handleDeleteVariant = () => {
    if (!confirm(`¿Eliminar color "${variant.colorName}"?`)) return;
    deleteVariant.mutate({ id: variant.id }, { onSuccess: invalidate });
  };

  const handleToggleActive = () => {
    updateVariant.mutate({ id: variant.id, data: { active: !variant.active } }, { onSuccess: invalidate });
  };

  return (
    <div className="border border-border">
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-3 flex-1 text-left">
          <div className="w-7 h-7 border border-border shrink-0" style={{ backgroundColor: variant.colorHex }} />
          <div>
            <p className="font-mono text-sm font-bold">{variant.colorName}</p>
            <p className="font-mono text-xs text-muted-foreground">{variant.colorHex}</p>
          </div>
          <span className={`ml-2 text-xs font-mono ${variant.active ? "text-emerald-500" : "text-muted-foreground"}`}>
            {variant.active ? "Activo" : "Inactivo"}
          </span>
          {expanded ? <ChevronDown className="h-4 w-4 ml-auto text-muted-foreground" /> : <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />}
        </button>
        <button onClick={handleToggleActive} className="text-xs font-mono border border-border px-2 py-1 hover:border-primary transition-colors">
          {variant.active ? "Desactivar" : "Activar"}
        </button>
        <button onClick={handleDeleteVariant} className="h-8 w-8 border border-border flex items-center justify-center hover:border-destructive hover:text-destructive transition-colors">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-border px-4 py-4 space-y-6 bg-muted/10">
          {/* Images */}
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">Imágenes</p>
            <div className="flex flex-wrap gap-3 mb-3">
              {variant.images?.map((img: VariantImage) => (
                <div key={img.id} className="relative w-20 h-20 border border-border bg-muted">
                  <img src={objectUrl(img.objectPath) ?? ""} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => deleteImage.mutate({ id: variant.id, imageId: img.id }, { onSuccess: invalidate })}
                    className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full w-4 h-4 flex items-center justify-center"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}
              <label className={`w-20 h-20 border border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors ${isUploading ? "opacity-50 pointer-events-none" : ""}`}>
                <Upload className="h-4 w-4 text-muted-foreground mb-1" />
                <span className="text-xs font-mono text-muted-foreground">{isUploading ? "..." : "Subir"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUploading}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }}
                />
              </label>
            </div>
          </div>

          {/* Sizes */}
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">Talles y stock</p>
            <div className="space-y-2 mb-3">
              {sizes.map((row, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <select
                    value={row.size}
                    onChange={(e) => updateSize(i, "size", e.target.value)}
                    className="w-28 h-9 font-mono text-sm bg-background border border-border px-2 text-foreground focus:outline-none"
                  >
                    <option value="">Talle...</option>
                    {SIZES_PRESET.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <Input
                    type="number"
                    min={0}
                    value={row.stock}
                    onChange={(e) => updateSize(i, "stock", Number(e.target.value))}
                    className="w-24 h-9 rounded-none font-mono text-sm bg-background border-border"
                    placeholder="Stock"
                  />
                  <button onClick={() => removeSizeRow(i)} className="h-9 w-9 border border-border flex items-center justify-center hover:border-destructive hover:text-destructive transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={addSizeRow} className="flex items-center gap-2 text-xs font-mono border border-border px-3 py-1.5 hover:border-primary transition-colors">
                <Plus className="h-3 w-3" />Agregar talle
              </button>
              <button
                onClick={handleSaveSizes}
                disabled={upsertSizes.isPending}
                className="flex items-center gap-2 text-xs font-mono bg-primary text-white px-3 py-1.5 hover:bg-primary/80 disabled:opacity-50 transition-colors"
              >
                <Check className="h-3 w-3" />Guardar talles
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function VariantManager({ productId, productName, onClose }: VariantManagerProps) {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newColor, setNewColor] = useState({ colorName: "", colorHex: "#000000" });

  const { data: variants, isLoading } = useGetProductVariants(productId, {
    query: { queryKey: getGetProductVariantsQueryKey(productId), enabled: !!productId },
  });
  const createVariant = useCreateVariant();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getGetProductVariantsQueryKey(productId) });

  const handleAddVariant = () => {
    if (!newColor.colorName.trim()) return;
    createVariant.mutate(
      { id: productId, data: { colorName: newColor.colorName, colorHex: newColor.colorHex } },
      {
        onSuccess: () => {
          invalidate();
          setShowAddForm(false);
          setNewColor({ colorName: "", colorHex: "#000000" });
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-start justify-end">
      <div className="h-full w-full max-w-xl bg-background border-l border-border flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Variantes</p>
            <h2 className="font-bold tracking-tighter text-lg uppercase">{productName}</h2>
          </div>
          <button onClick={onClose} className="h-8 w-8 border border-border flex items-center justify-center hover:border-primary transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {isLoading && <div className="flex justify-center py-8"><div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}
          {!isLoading && (!variants || variants.length === 0) && (
            <p className="text-center text-sm font-mono text-muted-foreground py-8">Sin variantes. Agregá el primer color.</p>
          )}
          {variants?.map((v) => (
            <VariantRow key={v.id} variant={v} productId={productId} />
          ))}
        </div>

        <div className="border-t border-border px-6 py-4 shrink-0">
          {!showAddForm ? (
            <Button
              onClick={() => setShowAddForm(true)}
              className="w-full rounded-none font-mono uppercase text-xs tracking-widest bg-primary text-white hover:bg-primary/80 border-none h-10"
            >
              <Plus className="h-4 w-4 mr-2" />Agregar color
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Nuevo color</p>
              <div className="flex gap-3">
                <Input
                  value={newColor.colorName}
                  onChange={(e) => setNewColor({ ...newColor, colorName: e.target.value })}
                  placeholder="Nombre del color"
                  className="flex-1 rounded-none h-10 font-mono text-sm bg-background border-border"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newColor.colorHex}
                    onChange={(e) => setNewColor({ ...newColor, colorHex: e.target.value })}
                    className="w-10 h-10 border border-border cursor-pointer bg-transparent p-0.5"
                  />
                  <Input
                    value={newColor.colorHex}
                    onChange={(e) => setNewColor({ ...newColor, colorHex: e.target.value })}
                    className="w-28 rounded-none h-10 font-mono text-sm bg-background border-border"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddVariant} disabled={createVariant.isPending || !newColor.colorName.trim()} className="rounded-none font-mono uppercase text-xs bg-primary text-white hover:bg-primary/80 border-none h-9">
                  <Check className="h-3 w-3 mr-2" />Crear
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)} className="rounded-none border-border font-mono text-xs h-9">Cancelar</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
