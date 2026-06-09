import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useGetFeaturedProducts, useGetNewArrivals, useGetCategories } from "@workspace/api-client-react";

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

      {/* Featured Products */}
      <section className="py-24 bg-background">
        <div className="container px-4 md:px-8">
          <div className="flex items-end justify-between mb-12 border-b border-border pb-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tighter uppercase">Destacados</h2>
              <p className="text-muted-foreground font-mono text-sm mt-2">Signature pieces</p>
            </div>
            <Link href="/tienda?featured=true" className="text-primary font-mono text-sm hover:underline hidden sm:block uppercase tracking-widest">
              Ver todos [→]
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
                      <h3 className="font-bold truncate max-w-[200px] uppercase text-foreground">{product.name}</h3>
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Placeholder for other sections */}
      <section className="py-24 bg-secondary">
         <div className="container px-4 md:px-8 text-center">
            <h2 className="text-2xl font-bold tracking-widest uppercase mb-4 text-foreground">Welcome to the void</h2>
            <p className="text-muted-foreground font-mono max-w-xl mx-auto">This UI is a placeholder scaffold generated by the Replit Agent. A complete implementation would include full filtering, carts, checkouts, and an admin panel.</p>
         </div>
      </section>
    </div>
  );
}