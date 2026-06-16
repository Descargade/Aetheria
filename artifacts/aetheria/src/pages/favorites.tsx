import { Link } from "wouter";
import { useGetFavorites, useRemoveFavorite, getGetFavoritesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import { useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { PriceDisplay } from "@/components/ui/price-display";

export function Favorites() {
  const { sessionId } = useSession();
  const queryClient = useQueryClient();

  const { data: favorites, isLoading } = useGetFavorites({ sessionId }, { query: { enabled: !!sessionId, queryKey: getGetFavoritesQueryKey({ sessionId }) } });
  const removeFavorite = useRemoveFavorite();
  const addToCart = useAddToCart();

  const handleRemove = (id: number) => {
    removeFavorite.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetFavoritesQueryKey({ sessionId }) })
    });
  };

  const handleAddToCart = (productId: number, price: number) => {
    addToCart.mutate({ data: { sessionId, productId, quantity: 1 } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) })
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 flex justify-center">
        <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <Heart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-6" />
        <h1 className="text-4xl font-bold tracking-tighter uppercase mb-4">Favoritos</h1>
        <p className="text-muted-foreground font-mono mb-8">No guardaste ningún producto todavía.</p>
        <Link href="/tienda">
          <Button className="w-full h-14 rounded-none font-mono uppercase tracking-widest bg-primary text-white hover:bg-primary/80 border-none">
            Explorar colección
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-24">
      <div className="flex items-end justify-between mb-12">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase">Favoritos_</h1>
        <span className="font-mono text-sm text-muted-foreground">{favorites.length} {favorites.length === 1 ? "producto" : "productos"}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-px bg-border">
        {favorites.map((fav) => {
          const product = fav.product;
          if (!product) return null;
          return (
            <div key={fav.id} className="bg-background group flex flex-col" data-testid={`card-favorite-${fav.id}`}>
              <Link href={`/producto/${product.id}`}>
                <div className="relative aspect-[3/4] overflow-hidden bg-muted cursor-pointer">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">AETHERIA</span>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 flex flex-col gap-1.5">
                    {product.salePrice && (
                      <span className="bg-primary/90 text-white text-[10px] font-mono px-2 py-0.5 uppercase tracking-widest backdrop-blur-sm">OFERTA</span>
                    )}
                    {product.isNew && (
                      <span className="bg-foreground/90 text-background text-[10px] font-mono px-2 py-0.5 uppercase tracking-widest backdrop-blur-sm">NUEVO</span>
                    )}
                  </div>
                </div>
              </Link>
              <div className="p-4 flex flex-col flex-1">
                <Link href={`/producto/${product.id}`}>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-0.5">{product.categoryName}</p>
                  <h3 className="font-bold uppercase tracking-wide text-sm leading-tight hover:text-primary transition-colors mb-2">{product.name}</h3>
                </Link>
                <PriceDisplay price={product.price} salePrice={product.salePrice} size="sm" />
                <div className="flex gap-2 mt-3">
                  <Button onClick={() => handleAddToCart(product.id, product.salePrice ? Number(product.salePrice) : Number(product.price))}
                    className="flex-1 h-10 rounded-none font-mono uppercase text-xs tracking-widest bg-primary text-white hover:bg-primary/80 border-none"
                    data-testid={`button-add-to-cart-${product.id}`}>
                    <ShoppingBag className="h-3 w-3 mr-2" />Al carrito
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleRemove(fav.id)}
                    className="h-10 w-10 rounded-none border-border hover:border-destructive hover:text-destructive"
                    data-testid={`button-remove-favorite-${fav.id}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
