import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useGetProducts, getGetProductsQueryKey } from "@workspace/api-client-react";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { Link, useLocation } from "wouter";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  const { data: results } = useGetProducts(
    { search: debouncedQuery },
    { query: { enabled: debouncedQuery.length >= 2, queryKey: getGetProductsQueryKey({ search: debouncedQuery }) } }
  );

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { setOpen(false); setQuery(""); }
    if (e.key === "Enter" && query.trim()) {
      navigate(`/tienda?search=${encodeURIComponent(query.trim())}`);
      setOpen(false);
      setQuery("");
    }
  };

  const handleResultClick = () => {
    setOpen(false);
    setQuery("");
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="h-9 w-9 flex items-center justify-center hover:text-primary transition-colors"
        aria-label="Buscar"
      >
        <Search className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center border border-border bg-background focus-within:border-primary transition-colors h-9">
        <Search className="h-4 w-4 ml-3 text-muted-foreground shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar productos..."
          className="flex-1 bg-transparent px-3 text-sm font-mono outline-none placeholder:text-muted-foreground w-48 md:w-64"
        />
        <button
          onClick={() => { setOpen(false); setQuery(""); }}
          className="h-9 w-9 flex items-center justify-center hover:text-primary transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {debouncedQuery.length >= 2 && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-background border border-border shadow-2xl z-50 overflow-hidden">
          {results && results.length > 0 ? (
            <>
              <div className="max-h-72 overflow-y-auto divide-y divide-border">
                {results.slice(0, 6).map((p) => (
                  <Link
                    key={p.id}
                    href={`/producto/${p.id}`}
                    onClick={handleResultClick}
                    className="flex items-center gap-3 p-3 hover:bg-muted transition-colors"
                  >
                    <div className="h-12 w-10 bg-muted overflow-hidden shrink-0 border border-border">
                      <img
                        src={p.images?.[0] || PLACEHOLDER_IMAGE}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono font-bold text-xs uppercase truncate text-foreground">{p.name}</p>
                      <p className="font-mono text-xs text-muted-foreground truncate">{p.categoryName}</p>
                    </div>
                    <div className="text-right shrink-0 font-mono">
                      <p className="font-bold text-xs text-destructive">${Number(p.salePrice ?? p.price).toLocaleString("es-AR")}</p>
                      {p.salePrice && (
                        <p className="text-[10px] text-muted-foreground line-through">${Number(p.price).toLocaleString("es-AR")}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                href={`/tienda?search=${encodeURIComponent(query)}`}
                onClick={handleResultClick}
                className="flex items-center justify-between px-4 py-3 bg-primary/5 hover:bg-primary/10 transition-colors border-t border-border"
              >
                <span className="font-mono text-xs text-primary uppercase tracking-widest">Ver todos los resultados</span>
                <span className="font-mono text-xs text-primary">→</span>
              </Link>
            </>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Sin resultados para "{debouncedQuery}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
