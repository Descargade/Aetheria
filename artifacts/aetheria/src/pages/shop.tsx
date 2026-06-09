import { useState } from "react";
import { Link, useSearch } from "wouter";
import { useGetProducts, useGetCategories, useAddFavorite, useRemoveFavorite, useGetFavorites, getGetFavoritesQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Filter, Heart } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { useToast } from "@/hooks/use-toast";

export function Shop() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const { sessionId } = useSession();
  const { toast } = useToast();

  const [categoryId, setCategoryId] = useState<number | null>(searchParams.get("categoryId") ? Number(searchParams.get("categoryId")) : null);
  const [onSale, setOnSale] = useState<boolean>(searchParams.get("onSale") === "true");
  const [isNew, setIsNew] = useState<boolean>(searchParams.get("isNew") === "true");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);

  const { data: products, isLoading } = useGetProducts({
    categoryId: categoryId,
    onSale: onSale ? true : undefined,
    isNew: isNew ? true : undefined,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 500000 ? priceRange[1] : undefined,
  });

  const { data: categories } = useGetCategories();
  const { data: favorites } = useGetFavorites({ sessionId }, { query: { enabled: !!sessionId, queryKey: getGetFavoritesQueryKey({ sessionId }) } });

  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const toggleFavorite = (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!sessionId) return;
    
    const fav = favorites?.find(f => f.productId === productId);
    if (fav) {
      removeFavorite.mutate({ id: fav.id }, {
        onSuccess: () => {
          toast({ title: "Removido de favoritos", description: "El producto ha sido eliminado de tu lista." });
        }
      });
    } else {
      addFavorite.mutate({ data: { productId, sessionId } }, {
        onSuccess: () => {
          toast({ title: "Agregado a favoritos", description: "El producto ha sido guardado." });
        }
      });
    }
  };

  const FilterContent = () => (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="text-lg font-bold tracking-widest uppercase mb-4 text-foreground">Categorías</h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="cat-all" checked={categoryId === null} onCheckedChange={() => setCategoryId(null)} />
            <Label htmlFor="cat-all" className="font-mono cursor-pointer hover:text-primary transition-colors">Todas</Label>
          </div>
          {categories?.map(cat => (
            <div key={cat.id} className="flex items-center space-x-2">
              <Checkbox id={`cat-${cat.id}`} checked={categoryId === cat.id} onCheckedChange={() => setCategoryId(cat.id)} />
              <Label htmlFor={`cat-${cat.id}`} className="font-mono cursor-pointer hover:text-primary transition-colors">{cat.name}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-border w-full" />

      <div>
        <h3 className="text-lg font-bold tracking-widest uppercase mb-4 text-foreground">Filtros</h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="filter-sale" checked={onSale} onCheckedChange={(checked) => setOnSale(!!checked)} />
            <Label htmlFor="filter-sale" className="font-mono cursor-pointer hover:text-primary transition-colors">En Oferta</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="filter-new" checked={isNew} onCheckedChange={(checked) => setIsNew(!!checked)} />
            <Label htmlFor="filter-new" className="font-mono cursor-pointer hover:text-primary transition-colors">Nuevos Ingresos</Label>
          </div>
        </div>
      </div>

      <div className="h-px bg-border w-full" />

      <div>
        <h3 className="text-lg font-bold tracking-widest uppercase mb-4 text-foreground">Precio</h3>
        <Slider 
          defaultValue={[0, 500000]} 
          max={500000} 
          step={5000}
          value={[priceRange[0], priceRange[1]]}
          onValueChange={(val) => setPriceRange([val[0], val[1]])}
          className="mb-4"
        />
        <div className="flex justify-between text-xs font-mono text-muted-foreground">
          <span>${priceRange[0].toLocaleString('es-AR')}</span>
          <span>${priceRange[1].toLocaleString('es-AR')}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-24">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase">Colección</h1>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="md:hidden font-mono uppercase tracking-widest rounded-none border-border hover:bg-primary/10">
              <Filter className="mr-2 h-4 w-4" /> Filtros
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background border-l border-border">
            <div className="py-6 h-full overflow-y-auto">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 shrink-0 sticky top-24 h-max">
          <FilterContent />
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="aspect-[3/4] bg-muted animate-pulse border border-border" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const isFavorite = favorites?.some(f => f.productId === product.id);
                return (
                  <div key={product.id} className="group cursor-pointer relative">
                    <Link href={`/producto/${product.id}`}>
                      <div className="relative aspect-[3/4] bg-muted overflow-hidden mb-4 border border-border group-hover:border-primary/50 transition-colors">
                        <img 
                          src={product.images?.[0] || '/images/products/jacket-1.png'} 
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {product.isNew && (
                          <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-mono font-bold px-2 py-1 uppercase tracking-wider">
                            Nuevo
                          </div>
                        )}
                        {product.salePrice && (
                          <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs font-mono font-bold px-2 py-1 uppercase tracking-wider">
                            Sale
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-start font-mono text-sm">
                        <div>
                          <h3 className="font-bold truncate max-w-[200px] uppercase text-foreground group-hover:text-primary transition-colors">{product.name}</h3>
                          <p className="text-muted-foreground text-xs mt-1 truncate max-w-[200px]">{product.categoryName}</p>
                        </div>
                        <div className="text-right">
                          {product.salePrice ? (
                            <>
                              <p className="text-destructive font-bold">${product.salePrice.toLocaleString('es-AR')}</p>
                              <p className="text-muted-foreground line-through text-xs">${product.price.toLocaleString('es-AR')}</p>
                            </>
                          ) : (
                            <p className="font-bold text-foreground">${product.price.toLocaleString('es-AR')}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`absolute top-4 right-4 h-8 w-8 rounded-full bg-background/50 backdrop-blur border-none hover:bg-background/80 transition-colors z-10 ${isFavorite ? 'text-primary' : 'text-foreground'}`}
                      onClick={(e) => toggleFavorite(e, product.id)}
                    >
                      <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-24 text-center">
              <p className="text-xl font-mono text-muted-foreground uppercase tracking-widest">No se encontraron productos.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}