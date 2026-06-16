import { Link } from "wouter";
import { Heart } from "lucide-react";
import { PriceDisplay } from "@/components/ui/price-display";
import type { Product } from "@workspace/api-client-react";

export function ProductCard({
  product,
  isFavorite,
  onToggleFavorite,
  showFavorite = false,
}: {
  product: Product;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent, productId: number) => void;
  showFavorite?: boolean;
}) {
  const isOutOfStock = (product as any).stock !== undefined && Number((product as any).stock) === 0;

  return (
    <div className="group cursor-pointer relative">
      <Link href={`/producto/${product.id}`}>
        <div className="relative aspect-[3/4] bg-muted overflow-hidden mb-4 border border-border group-hover:border-primary/50 transition-colors">
          <img
            src={product.images?.[0] || "/images/products/jacket-1.png"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute bottom-3 left-3 flex flex-col gap-1.5">
            {isOutOfStock && (
              <span className="bg-black/80 text-white text-[10px] font-mono font-bold px-2 py-1 uppercase tracking-wider">
                Sin stock
              </span>
            )}
            {product.isNew && !isOutOfStock && (
              <span className="bg-primary/90 text-primary-foreground text-[10px] font-mono font-bold px-2 py-0.5 uppercase tracking-wider backdrop-blur-sm">
                Nuevo
              </span>
            )}
            {product.salePrice && !isOutOfStock && (
              <span className="bg-destructive/90 text-destructive-foreground text-[10px] font-mono font-bold px-2 py-0.5 uppercase tracking-wider backdrop-blur-sm">
                Sale
              </span>
            )}
          </div>
        </div>
        <div className="font-mono text-sm">
          <h3 className="font-bold truncate uppercase text-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {product.categoryName && (
            <p className="text-muted-foreground text-[10px] mt-0.5 uppercase tracking-wider">
              {product.categoryName}
            </p>
          )}
          <div className="mt-2">
            <PriceDisplay price={product.price} salePrice={product.salePrice} size="sm" />
          </div>
        </div>
      </Link>
      {showFavorite && onToggleFavorite && (
        <button
          className={`absolute top-4 right-4 h-8 w-8 flex items-center justify-center bg-background/60 backdrop-blur border border-border/50 hover:border-primary/60 transition-colors z-10 ${isFavorite ? "text-primary border-primary/40" : "text-foreground"}`}
          onClick={(e) => onToggleFavorite(e, product.id)}
        >
          <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
        </button>
      )}
    </div>
  );
}
