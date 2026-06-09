import { useState } from "react";
import { useParams, Link } from "wouter";
import { useGetProduct, useAddToCart, getGetCartQueryKey, useAddFavorite, useRemoveFavorite, useGetFavorites, getGetFavoritesQueryKey, getGetProductQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { useToast } from "@/hooks/use-toast";
import { Heart, ChevronRight, ShoppingBag } from "lucide-react";

export function ProductDetail() {
  const { id } = useParams();
  const productId = Number(id);
  const { sessionId } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useGetProduct(productId, { query: { enabled: !!productId, queryKey: getGetProductQueryKey(productId) } });
  const { data: favorites } = useGetFavorites({ sessionId }, { query: { enabled: !!sessionId, queryKey: getGetFavoritesQueryKey({ sessionId }) } });

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [activeImage, setActiveImage] = useState<number>(0);

  const addToCart = useAddToCart();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const isFavorite = favorites?.some(f => f.productId === productId);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-12 md:py-24 min-h-[70vh] flex items-center justify-center">
        <div className="h-12 w-12 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
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

  const handleAddToCart = () => {
    if (product.sizes?.length && !selectedSize) {
      toast({ title: "Selecciona un talle", variant: "destructive" });
      return;
    }
    if (product.colors?.length && !selectedColor) {
      toast({ title: "Selecciona un color", variant: "destructive" });
      return;
    }

    addToCart.mutate({
      data: {
        sessionId,
        productId,
        quantity: 1,
        selectedSize: selectedSize || null,
        selectedColor: selectedColor || null,
      }
    }, {
      onSuccess: () => {
        toast({ title: "Agregado al carrito", description: `${product.name} ha sido agregado exitosamente.` });
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) });
      }
    });
  };

  const toggleFavorite = () => {
    if (!sessionId) return;
    
    if (isFavorite) {
      const fav = favorites?.find(f => f.productId === productId);
      if (fav) {
        removeFavorite.mutate({ id: fav.id }, {
          onSuccess: () => {
            toast({ title: "Removido de favoritos", description: "El producto ha sido eliminado de tu lista." });
          }
        });
      }
    } else {
      addFavorite.mutate({ data: { productId, sessionId } }, {
        onSuccess: () => {
          toast({ title: "Agregado a favoritos", description: "El producto ha sido guardado." });
        }
      });
    }
  };

  const images = product.images?.length ? product.images : ['/images/products/jacket-1.png'];

  return (
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
            <img 
              src={images[activeImage]} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.isNew && (
              <div className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-mono font-bold px-3 py-1.5 uppercase tracking-wider">
                Nuevo
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(i)}
                  className={`relative w-24 aspect-[3/4] border shrink-0 transition-colors ${activeImage === i ? 'border-primary' : 'border-border hover:border-muted-foreground'}`}
                >
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
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-4 text-foreground">{product.name}</h1>
            
            <div className="flex items-center gap-4 text-2xl font-mono">
              {product.salePrice ? (
                <>
                  <span className="text-destructive font-bold">${product.salePrice.toLocaleString('es-AR')}</span>
                  <span className="text-muted-foreground line-through text-lg">${product.price.toLocaleString('es-AR')}</span>
                </>
              ) : (
                <span className="font-bold text-foreground">${product.price.toLocaleString('es-AR')}</span>
              )}
            </div>
          </div>

          <div className="h-px bg-border w-full mb-8" />

          {/* Selections */}
          <div className="flex flex-col gap-8 mb-12">
            {product.colors && product.colors.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-foreground">Color</h3>
                  <span className="text-xs font-mono text-muted-foreground">{selectedColor || "Seleccionar"}</span>
                </div>
                <div className="flex gap-3">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-12 h-12 rounded-full border-2 transition-all ${selectedColor === color ? 'border-primary' : 'border-transparent ring-1 ring-border'}`}
                      style={{ backgroundColor: color.toLowerCase() }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-foreground">Talle</h3>
                  <span className="text-xs font-mono text-primary cursor-pointer hover:underline">Guía de talles</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-12 min-w-[3rem] px-4 font-mono text-sm border transition-all ${selectedSize === size ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent text-foreground border-border hover:border-primary/50'}`}
                    >
                      {size}
                    </button>
                  ))}
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
              {addToCart.isPending ? "Agregando..." : (
                <><ShoppingBag className="mr-2 h-5 w-5" /> Agregar al carrito</>
              )}
            </Button>
            <Button 
              size="icon" 
              variant="outline" 
              className={`h-14 w-14 rounded-none border-border hover:bg-secondary transition-colors ${isFavorite ? 'text-primary border-primary' : 'text-foreground'}`}
              onClick={toggleFavorite}
            >
              <Heart className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
            </Button>
          </div>

          <div className="h-px bg-border w-full mb-8" />

          {/* Description */}
          <div className="prose prose-sm dark:prose-invert max-w-none font-mono text-muted-foreground leading-relaxed">
            {product.description ? (
              <p>{product.description}</p>
            ) : (
              <p>Diseño futurista y minimalista con precisión quirúrgica. Desarrollado con materiales de alta tecnología para el máximo confort y durabilidad en entornos urbanos.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}