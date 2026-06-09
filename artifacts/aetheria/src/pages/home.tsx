import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useGetFeaturedProducts, useGetNewArrivals, useGetCategories } from "@workspace/api-client-react";
import { ArrowRight } from "lucide-react";

const CATEGORY_IMAGES: Record<string, string> = {
  "Chaquetas": "/images/products/jacket-1.png",
  "Hoodies": "/images/products/hoodie-1.png",
  "Pantalones": "/images/products/pants-1.png",
  "Accesorios": "/images/products/acc-1.png",
  "Camisetas": "/images/products/hoodie-1.png",
  "Calzado": "/images/products/acc-1.png",
};

export function Home() {
  const { data: featured } = useGetFeaturedProducts();
  const { data: newArrivals } = useGetNewArrivals();
  const { data: categories } = useGetCategories();

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[85vh] overflow-hidden flex items-center justify-center bg-black">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero.png" 
            alt="Aetheria Hero Campaign" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        </div>
        
        <div className="relative z-10 container px-4 md:px-8 text-center flex flex-col items-center">
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white mb-6 uppercase">
            Surgical <br/> <span className="text-primary">Precision</span>
          </h1>
          <p className="text-gray-300 font-mono text-sm md:text-base max-w-lg mb-8 uppercase tracking-widest">
            The future of urban techwear is here. Engineered for the concrete jungle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/tienda">
              <Button size="lg" className="bg-primary text-white hover:bg-primary/80 font-mono rounded-none tracking-widest uppercase h-14 px-8 border-none">
                Explorar Colección
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-background">
        <div className="container px-4 md:px-8">
          <div className="flex items-end justify-between mb-12 border-b border-border pb-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tighter uppercase">Categorías</h2>
              <p className="text-muted-foreground font-mono text-sm mt-2">Explora por estilo</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories?.map((cat) => (
              <Link key={cat.id} href={`/tienda?categoryId=${cat.id}`}>
                <div className="group cursor-pointer">
                  <div className="relative aspect-square bg-muted overflow-hidden border border-border group-hover:border-primary/70 transition-colors mb-3">
                    <img
                      src={CATEGORY_IMAGES[cat.name] || "/images/products/jacket-1.png"}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute inset-0 flex items-end p-3">
                      <div>
                        <p className="font-mono font-bold text-white text-xs uppercase tracking-widest">{cat.name}</p>
                        {cat.description && (
                          <p className="font-mono text-white/60 text-[10px] mt-0.5 line-clamp-1">{cat.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-secondary">
        <div className="container px-4 md:px-8">
          <div className="flex items-end justify-between mb-12 border-b border-border pb-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tighter uppercase">Destacados</h2>
              <p className="text-muted-foreground font-mono text-sm mt-2">Signature pieces</p>
            </div>
            <Link href="/tienda" className="text-primary font-mono text-sm hover:underline hidden sm:flex items-center gap-1 uppercase tracking-widest group">
              Ver todos <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured?.slice(0,4).map((product) => (
              <div key={product.id} className="group cursor-pointer">
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
                          <p className="text-destructive font-bold">${Number(product.salePrice).toLocaleString('es-AR')}</p>
                          <p className="text-muted-foreground line-through text-xs">${Number(product.price).toLocaleString('es-AR')}</p>
                        </>
                      ) : (
                        <p className="font-bold text-foreground">${Number(product.price).toLocaleString('es-AR')}</p>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals && newArrivals.length > 0 && (
        <section className="py-24 bg-background">
          <div className="container px-4 md:px-8">
            <div className="flex items-end justify-between mb-12 border-b border-border pb-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tighter uppercase">Nuevos Ingresos</h2>
                <p className="text-muted-foreground font-mono text-sm mt-2">Últimas llegadas</p>
              </div>
              <Link href="/tienda?isNew=true" className="text-primary font-mono text-sm hover:underline hidden sm:flex items-center gap-1 uppercase tracking-widest group">
                Ver todos <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.slice(0,4).map((product) => (
                <div key={product.id} className="group cursor-pointer">
                  <Link href={`/producto/${product.id}`}>
                    <div className="relative aspect-[3/4] bg-muted overflow-hidden mb-4 border border-border group-hover:border-primary/50 transition-colors">
                      <img
                        src={product.images?.[0] || '/images/products/jacket-1.png'}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-mono font-bold px-2 py-1 uppercase tracking-wider">
                        Nuevo
                      </div>
                    </div>
                    <div className="flex justify-between items-start font-mono text-sm">
                      <div>
                        <h3 className="font-bold truncate max-w-[200px] uppercase text-foreground group-hover:text-primary transition-colors">{product.name}</h3>
                        <p className="text-muted-foreground text-xs mt-1 truncate max-w-[200px]">{product.categoryName}</p>
                      </div>
                      <div className="text-right">
                        {product.salePrice ? (
                          <>
                            <p className="text-destructive font-bold">${Number(product.salePrice).toLocaleString('es-AR')}</p>
                            <p className="text-muted-foreground line-through text-xs">${Number(product.price).toLocaleString('es-AR')}</p>
                          </>
                        ) : (
                          <p className="font-bold text-foreground">${Number(product.price).toLocaleString('es-AR')}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="py-24 bg-primary">
        <div className="container px-4 md:px-8 text-center">
          <p className="font-mono text-primary-foreground/70 text-xs uppercase tracking-[0.3em] mb-4">Nueva colección</p>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-primary-foreground uppercase mb-6">
            Viste el futuro.<br/>Hoy.
          </h2>
          <Link href="/tienda">
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary font-mono rounded-none tracking-widest uppercase h-14 px-8"
            >
              Comprar Ahora
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
