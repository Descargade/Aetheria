import { useState } from "react";
import { useParams, Link } from "wouter";
import {
  useGetProduct, useAddToCart, getGetCartQueryKey, useAddFavorite, useRemoveFavorite,
  useGetFavorites, getGetFavoritesQueryKey, getGetProductQueryKey,
  useGetProductVariants, getGetProductVariantsQueryKey,
  useGetPaymentMethods, useGetSizeGuides,
  type Variant,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { useToast } from "@/hooks/use-toast";
import { Heart, ChevronRight, ShoppingBag, Ruler } from "lucide-react";
import { objectUrl } from "@/lib/storage-utils";
import { PriceDisplay } from "@/components/ui/price-display";

function SizeGuideModal({ onClose, categoryId }: { onClose: () => void; categoryId?: number }) {
  const { data: sizeGuides } = useGetSizeGuides();

  const guide = categoryId
    ? sizeGuides?.find((sg) => sg.categoryId === categoryId)
    : sizeGuides?.[0];

  const headers = guide?.sizes && guide.sizes.length > 0
    ? Object.keys(guide.sizes[0] as object)
    : ["Talle", "Pecho (cm)", "Cintura (cm)", "Cadera (cm)"];

  const rows = guide?.sizes && guide.sizes.length > 0
    ? guide.sizes.map((s: Record<string, string>) => headers.map((h) => s[h] ?? "-"))
    : [["XS","82-85","66-69","88-91"],["S","86-89","70-73","92-95"],["M","90-93","74-77","96-99"],["L","94-97","78-81","100-103"],["XL","98-101","82-85","104-107"],["XXL","102-105","86-89","108-111"]];

  const instructions = guide?.instructions || "Medite el contorno del pecho con una cinta métrica, colocándola horizontalmente bajo las axilas. Consulte la tabla para encontrar su talle.";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background border border-border w-full max-w-lg p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-mono font-bold uppercase tracking-widest text-sm">Guía de talles</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg font-bold leading-none">&times;</button>
        </div>
        <p className="font-mono text-xs text-muted-foreground">{instructions}</p>
        <table className="w-full font-mono text-xs border-collapse">
          <thead>
            <tr className="bg-muted/30">
              {headers.map(h => (
                <th key={h} className="border border-border px-3 py-2 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row[0]} className="hover:bg-muted/10">
                {row.map((cell, i) => <td key={i} className="border border-border px-3 py-2">{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ProductDetail() {
  const { id } = useParams();
  const productId = Number(id);
  const { sessionId } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useGetProduct(productId, {
    query: { enabled: !!productId, queryKey: getGetProductQueryKey(productId) },
  });
  const { data: favorites } = useGetFavorites({ sessionId }, {
    query: { enabled: !!sessionId, queryKey: getGetFavoritesQueryKey({ sessionId }) },
  });
  const { data: variants } = useGetProductVariants(productId, {
    query: { enabled: !!productId, queryKey: getGetProductVariantsQueryKey(productId) },
  });
  const { data: paymentMethods } = useGetPaymentMethods();

  const transferDiscount = paymentMethods?.find((pm) =>
    pm.name.toLowerCase().includes("transferencia")
  )?.discount;
  const cashDiscount = paymentMethods?.find((pm) =>
    pm.name.toLowerCase().includes("efectivo")
  )?.discount;
  const discountPct = Number(transferDiscount || cashDiscount || 10);
  const calcDiscounted = (effPrice: number) => Math.round(effPrice * (1 - discountPct / 100));

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [activeImage, setActiveImage] = useState<number>(0);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const addToCart = useAddToCart();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const isFavorite = favorites?.some((f) => f.productId === productId);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-12 md:py-24 min-h-[70vh] flex items-center justify-center">
        <div className="h-12 w-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-12 md:py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tighter uppercase mb-4">Producto no encontrado</h1>
        <Link href="/tienda">
          <Button variant="outline" className="font-mono rounded-none uppercase tracking-widest">Volver a la tienda</Button>
        </Link>
      </div>
    );
  }

  const activeVariants = variants?.filter((v) => v.active) ?? [];
  const currentVariant = selectedVariant ?? activeVariants[0] ?? null;

  const variantImages = currentVariant?.images?.map((img) => objectUrl(img.objectPath)).filter(Boolean) as string[] ?? [];
  const fallback = product.images?.length ? product.images : [PLACEHOLDER_IMAGE];
  const images = variantImages.length > 0 ? variantImages : fallback;

  const availableSizes = currentVariant?.sizes?.filter((s) => s.active && s.stock > 0) ?? [];

  const handleSelectVariant = (v: Variant) => {
    setSelectedVariant(v);
    setSelectedSize("");
    setActiveImage(0);
  };

  const handleAddToCart = () => {
    if (availableSizes.length > 0 && !selectedSize) {
      toast({ title: "Selecciona un talle", variant: "destructive" });
      return;
    }
    addToCart.mutate({
      data: {
        sessionId,
        productId,
        quantity: 1,
        selectedSize: selectedSize || null,
        selectedColor: currentVariant?.colorName ?? null,
      },
    }, {
      onSuccess: () => {
        toast({ title: "Agregado al carrito", description: `${product.name} ha sido agregado exitosamente.` });
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) });
      },
    });
  };

  const toggleFavorite = () => {
    if (!sessionId) return;
    if (isFavorite) {
      const fav = favorites?.find((f) => f.productId === productId);
      if (fav) removeFavorite.mutate({ id: fav.id }, { onSuccess: () => toast({ title: "Removido de favoritos" }) });
    } else {
      addFavorite.mutate({ data: { productId, sessionId } }, { onSuccess: () => toast({ title: "Agregado a favoritos" }) });
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 md:px-8 py-8 md:py-16">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Inicio</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/tienda" className="hover:text-primary transition-colors">Colección</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          {/* Images */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-[3/4] bg-muted border border-border overflow-hidden">
              <img src={images[activeImage] ?? ""} alt={product.name} className="w-full h-full object-cover" />
              {product.isNew && (
                <div className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-mono font-bold px-3 py-1.5 uppercase tracking-wider">Nuevo</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)} className={`relative w-24 aspect-[3/4] border shrink-0 transition-colors ${activeImage === i ? "border-primary" : "border-border hover:border-muted-foreground"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="mb-8">
              <p className="text-primary font-mono text-sm uppercase tracking-widest mb-2">{product.categoryName}</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-4">{product.name}</h1>
              <PriceDisplay price={product.price} salePrice={product.salePrice} size="lg" />
            </div>

            <div className="h-px bg-border w-full mb-8" />

            <div className="flex flex-col gap-8 mb-12">
              {/* Color selector from variants */}
              {activeVariants.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-mono text-sm font-bold uppercase tracking-widest">Color</h3>
                    <span className="text-xs font-mono text-muted-foreground">{currentVariant?.colorName ?? "Seleccionar"}</span>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {activeVariants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => handleSelectVariant(v)}
                        title={v.colorName}
                        className={`w-10 h-10 border-2 transition-all ${currentVariant?.id === v.id ? "border-primary scale-110" : "border-border hover:border-primary/60"}`}
                        style={{ backgroundColor: v.colorHex }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size selector */}
              {(availableSizes.length > 0 || (product.sizes && product.sizes.length > 0)) && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-mono text-sm font-bold uppercase tracking-widest">Talle</h3>
                    <button
                      onClick={() => setShowSizeGuide(true)}
                      className="flex items-center gap-1 text-xs font-mono text-primary hover:underline"
                    >
                      <Ruler className="h-3 w-3" />Guía de talles
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {(availableSizes.length > 0 ? availableSizes.map((s) => s.size) : (product.sizes ?? [])).map((size) => {
                      const sizeData = availableSizes.find((s) => s.size === size);
                      const lowStock = sizeData && sizeData.stock <= 3;
                      return (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`h-12 min-w-[3rem] px-4 font-mono text-sm border transition-all relative ${selectedSize === size ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-foreground border-border hover:border-primary/50"}`}
                        >
                          {size}
                          {lowStock && <span className="absolute -top-1.5 -right-1.5 bg-yellow-500 text-black text-[8px] font-bold px-1 rounded-none leading-tight">!</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-12">
              <Button
                size="lg"
                className="flex-1 h-14 bg-primary text-white hover:bg-primary/80 font-mono rounded-none tracking-widest uppercase border-none"
                onClick={handleAddToCart}
                disabled={addToCart.isPending}
              >
                {addToCart.isPending ? "Agregando..." : <><ShoppingBag className="mr-2 h-5 w-5" /> Agregar al carrito</>}
              </Button>
              <Button
                size="icon"
                variant="outline"
                className={`h-14 w-14 rounded-none border-border hover:bg-secondary transition-colors ${isFavorite ? "text-primary border-primary" : ""}`}
                onClick={toggleFavorite}
              >
                <Heart className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
              </Button>
            </div>

            <div className="h-px bg-border w-full mb-8" />

            <div className="prose prose-sm dark:prose-invert max-w-none font-mono text-muted-foreground leading-relaxed">
              {product.description && <p>{product.description}</p>}
            </div>
          </div>
        </div>
      </div>

      {showSizeGuide && <SizeGuideModal onClose={() => setShowSizeGuide(false)} categoryId={product.categoryId} />}
    </>
  );
}
