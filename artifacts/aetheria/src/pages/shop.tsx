import { useState, useEffect } from "react";
import { Link, useSearch, useLocation } from "wouter";
import { useGetProducts, useGetCategories, useAddFavorite, useRemoveFavorite, useGetFavorites, getGetFavoritesQueryKey, useGetPaymentMethods } from "@workspace/api-client-react";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Filter, Search, X } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { useToast } from "@/hooks/use-toast";
import { ProductCard } from "@/components/product/ProductCard";

export function Shop() {
  const searchString = useSearch();
  const [, navigate] = useLocation();
  const { sessionId } = useSession();
  const { toast } = useToast();

  const parseParams = () => {
    const p = new URLSearchParams(searchString);
    return {
      categoryId: p.get("categoryId") ? Number(p.get("categoryId")) : null,
      onSale: p.get("onSale") === "true",
      isNew: p.get("isNew") === "true",
      search: p.get("search") || "",
    };
  };

  const [categoryId, setCategoryId] = useState<number | null>(parseParams().categoryId);
  const [onSale, setOnSale] = useState<boolean>(parseParams().onSale);
  const [isNew, setIsNew] = useState<boolean>(parseParams().isNew);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [searchText, setSearchText] = useState<string>(parseParams().search);
  const [searchInput, setSearchInput] = useState<string>(parseParams().search);

  useEffect(() => {
    const parsed = parseParams();
    setCategoryId(parsed.categoryId);
    setOnSale(parsed.onSale);
    setIsNew(parsed.isNew);
    setSearchText(parsed.search);
    setSearchInput(parsed.search);
  }, [searchString]);

  const { data: products, isLoading } = useGetProducts({
    categoryId: categoryId ?? undefined,
    onSale: onSale ? true : undefined,
    isNew: isNew ? true : undefined,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 500000 ? priceRange[1] : undefined,
    search: searchText.length > 0 ? searchText : undefined,
  });

  const { data: categories } = useGetCategories();
  const { data: favorites } = useGetFavorites({ sessionId }, { query: { enabled: !!sessionId, queryKey: getGetFavoritesQueryKey({ sessionId }) } });
  const { data: paymentMethods } = useGetPaymentMethods();

  const transferDiscount = paymentMethods?.find((pm) =>
    pm.name.toLowerCase().includes("transferencia")
  )?.discount;
  const cashDiscount = paymentMethods?.find((pm) =>
    pm.name.toLowerCase().includes("efectivo")
  )?.discount;
  const discountPct = Number(transferDiscount || cashDiscount || 10);
  const calcDiscounted = (effPrice: number) => Math.round(effPrice * (1 - discountPct / 100));

  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const toggleFavorite = (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!sessionId) return;
    const fav = favorites?.find(f => f.productId === productId);
    if (fav) {
      removeFavorite.mutate({ id: fav.id }, {
        onSuccess: () => toast({ title: "Removido de favoritos" })
      });
    } else {
      addFavorite.mutate({ data: { productId, sessionId } }, {
        onSuccess: () => toast({ title: "Agregado a favoritos" })
      });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchText(searchInput);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchText("");
  };

  const activeCategoryName = categories?.find(c => c.id === categoryId)?.name;

  const activeFiltersCount = [
    categoryId !== null,
    onSale,
    isNew,
    priceRange[0] > 0 || priceRange[1] < 500000,
    searchText.length > 0,
  ].filter(Boolean).length;

  const FilterContent = () => (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="text-sm font-bold tracking-widest uppercase mb-4 text-foreground font-mono">Categorías</h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="cat-all" checked={categoryId === null} onCheckedChange={() => setCategoryId(null)} />
            <Label htmlFor="cat-all" className="font-mono text-sm cursor-pointer hover:text-primary transition-colors">Todas</Label>
          </div>
          {categories?.map(cat => (
            <div key={cat.id} className="flex items-center space-x-2">
              <Checkbox
                id={`cat-${cat.id}`}
                checked={categoryId === cat.id}
                onCheckedChange={() => setCategoryId(categoryId === cat.id ? null : cat.id)}
              />
              <Label htmlFor={`cat-${cat.id}`} className="font-mono text-sm cursor-pointer hover:text-primary transition-colors">{cat.name}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-border w-full" />

      <div>
        <h3 className="text-sm font-bold tracking-widest uppercase mb-4 text-foreground font-mono">Filtros</h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="filter-sale" checked={onSale} onCheckedChange={(checked) => setOnSale(!!checked)} />
            <Label htmlFor="filter-sale" className="font-mono text-sm cursor-pointer hover:text-primary transition-colors">En Oferta</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="filter-new" checked={isNew} onCheckedChange={(checked) => setIsNew(!!checked)} />
            <Label htmlFor="filter-new" className="font-mono text-sm cursor-pointer hover:text-primary transition-colors">Nuevos Ingresos</Label>
          </div>
        </div>
      </div>

      <div className="h-px bg-border w-full" />

      <div>
        <h3 className="text-sm font-bold tracking-widest uppercase mb-2 text-foreground font-mono">Precio</h3>
        <Slider
          defaultValue={[0, 500000]}
          max={500000}
          step={5000}
          value={[priceRange[0], priceRange[1]]}
          onValueChange={(val) => setPriceRange([val[0], val[1]])}
          className="mb-3"
        />
        <div className="flex justify-between text-xs font-mono text-muted-foreground">
          <span>${priceRange[0].toLocaleString('es-AR')}</span>
          <span>${priceRange[1].toLocaleString('es-AR')}</span>
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <>
          <div className="h-px bg-border w-full" />
          <button
            onClick={() => {
              setCategoryId(null);
              setOnSale(false);
              setIsNew(false);
              setPriceRange([0, 500000]);
              clearSearch();
            }}
            className="font-mono text-xs text-destructive uppercase tracking-widest hover:opacity-70 transition-opacity text-left"
          >
            Limpiar filtros
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-24">
      {/* Header row */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase">
            {activeCategoryName || "Colección"}
          </h1>
          {isLoading ? null : (
            <p className="font-mono text-xs text-muted-foreground mt-2 uppercase tracking-widest">
              {products?.length ?? 0} productos
              {activeFiltersCount > 0 && ` · ${activeFiltersCount} filtro${activeFiltersCount > 1 ? "s" : ""} activo${activeFiltersCount > 1 ? "s" : ""}`}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Search box */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center border border-border bg-background focus-within:border-primary transition-colors h-9 flex-1 sm:flex-initial max-w-xs">
            <Search className="h-4 w-4 ml-3 text-muted-foreground shrink-0" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar..."
              className="bg-transparent px-2 sm:px-3 text-sm font-mono outline-none placeholder:text-muted-foreground w-full min-w-0"
            />
            {searchInput && (
              <button type="button" onClick={clearSearch} className="h-9 w-8 flex items-center justify-center hover:text-primary">
                <X className="h-3 w-3" />
              </button>
            )}
          </form>

          {/* Mobile filters sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden font-mono uppercase tracking-widest rounded-none border-border hover:bg-primary/10 h-9 relative">
                <Filter className="mr-2 h-4 w-4" /> Filtros
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[360px] bg-background border-l border-border">
              <div className="py-6 h-full overflow-y-auto">
                <h2 className="font-bold text-lg uppercase tracking-widest mb-6 font-mono">Filtros</h2>
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Active filter tags */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {categoryId !== null && activeCategoryName && (
            <button
              onClick={() => setCategoryId(null)}
              className="flex items-center gap-1.5 h-7 px-3 border border-primary/50 bg-primary/5 font-mono text-xs text-primary uppercase tracking-wider hover:bg-primary/10 transition-colors"
            >
              {activeCategoryName} <X className="h-3 w-3" />
            </button>
          )}
          {onSale && (
            <button onClick={() => setOnSale(false)} className="flex items-center gap-1.5 h-7 px-3 border border-primary/50 bg-primary/5 font-mono text-xs text-primary uppercase tracking-wider hover:bg-primary/10 transition-colors">
              En Oferta <X className="h-3 w-3" />
            </button>
          )}
          {isNew && (
            <button onClick={() => setIsNew(false)} className="flex items-center gap-1.5 h-7 px-3 border border-primary/50 bg-primary/5 font-mono text-xs text-primary uppercase tracking-wider hover:bg-primary/10 transition-colors">
              Nuevos <X className="h-3 w-3" />
            </button>
          )}
          {searchText && (
            <button onClick={clearSearch} className="flex items-center gap-1.5 h-7 px-3 border border-primary/50 bg-primary/5 font-mono text-xs text-primary uppercase tracking-wider hover:bg-primary/10 transition-colors">
              "{searchText}" <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-12">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-56 shrink-0 sticky top-24 h-max">
          <FilterContent />
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="aspect-[3/4] bg-muted animate-pulse border border-border" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {products.map((product) => {
                const isFavorite = favorites?.some(f => f.productId === product.id);
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    showFavorite
                    isFavorite={isFavorite}
                    onToggleFavorite={toggleFavorite}
                  />
                );
              })}
            </div>
          ) : (
            <div className="py-24 text-center">
              <p className="text-xl font-mono text-muted-foreground uppercase tracking-widest mb-4">Sin resultados</p>
              <p className="font-mono text-xs text-muted-foreground">Probá con otros filtros o buscá algo diferente.</p>
              {activeFiltersCount > 0 && (
                <button
                  onClick={() => {
                    setCategoryId(null);
                    setOnSale(false);
                    setIsNew(false);
                    setPriceRange([0, 500000]);
                    clearSearch();
                  }}
                  className="mt-6 font-mono text-xs text-primary uppercase tracking-widest hover:underline"
                >
                  Limpiar todos los filtros
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
