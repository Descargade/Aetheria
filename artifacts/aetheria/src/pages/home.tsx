import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { useGetFeaturedProducts, useGetNewArrivals, useGetCategories, useGetPaymentMethods } from "@workspace/api-client-react";
import { ArrowRight } from "lucide-react";

export function Home() {
  const { data: featured } = useGetFeaturedProducts();
  const { data: newArrivals } = useGetNewArrivals();
  const { data: categories } = useGetCategories();
  const { data: paymentMethods } = useGetPaymentMethods();

  const transferDiscount = paymentMethods?.find((pm) =>
    pm.name.toLowerCase().includes("transferencia")
  )?.discount;
  const cashDiscount = paymentMethods?.find((pm) =>
    pm.name.toLowerCase().includes("efectivo")
  )?.discount;
  const discountPct = Number(transferDiscount || cashDiscount || 10);

  const calcDiscounted = (effPrice: number) => Math.round(effPrice * (1 - discountPct / 100));

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[85vh] overflow-hidden flex items-center justify-center bg-black">
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden select-none pointer-events-none">
          <span className="text-[22vw] md:text-[18vw] font-bold text-white/[0.04] tracking-tighter whitespace-nowrap
            blur-[10px] md:blur-[16px] scale-110">
            AETHERIA
          </span>
        </div>
        
        <div className="relative z-10 container px-4 md:px-8 text-center flex flex-col items-center">
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white mb-6 uppercase">
            Precisión <br/> <span className="text-primary">Quirúrgica</span>
          </h1>
          <p className="text-gray-300 font-mono text-sm md:text-base max-w-lg mb-8 uppercase tracking-widest">
            El futuro del techwear urbano está aquí. Ingeniería para la jungla de concreto.
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
      {categories && categories.length > 0 && (
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
                        src={cat.image || PLACEHOLDER_IMAGE}
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
      )}

      {/* Featured Products */}
      {featured && featured.length > 0 && (
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
              {featured.slice(0,4).map((product) => (
                <div key={product.id} className="group cursor-pointer">
                  <Link href={`/producto/${product.id}`}>
                    <div className="relative aspect-[3/4] bg-muted overflow-hidden mb-4 border border-border group-hover:border-primary/50 transition-colors">
                      <img 
                        src={product.images?.[0] || PLACEHOLDER_IMAGE}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="font-mono text-sm space-y-1">
                      <div className="flex items-center gap-1.5 min-h-[18px]">
                        {product.isNew && (
                          <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 uppercase tracking-wider leading-none">Nuevo</span>
                        )}
                        {product.salePrice && (
                          <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 uppercase tracking-wider leading-none">Sale</span>
                        )}
                      </div>
                      <h3 className="font-bold truncate uppercase text-foreground group-hover:text-primary transition-colors">{product.name}</h3>
                      <p className="text-muted-foreground text-xs truncate">{product.categoryName}</p>
                      {(() => {
                        const effPrice = Number(product.salePrice || product.price);
                        const discPrice = calcDiscounted(effPrice);
                        return (
                          <div>
                            {product.salePrice ? (
                              <div className="flex items-baseline gap-2">
                                <span className="text-destructive font-bold text-base">${Number(product.salePrice).toLocaleString('es-AR')}</span>
                                <span className="text-muted-foreground line-through font-bold text-xs">${Number(product.price).toLocaleString('es-AR')}</span>
                              </div>
                            ) : (
                              <span className="font-bold text-foreground">${Number(product.price).toLocaleString('es-AR')}</span>
                            )}
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                              <span>Transf. <span className="text-primary font-semibold">${discPrice.toLocaleString('es-AR')}</span></span>
                              <span className="text-muted-foreground/40">/</span>
                              <span>Efect. <span className="font-semibold text-foreground">${effPrice.toLocaleString('es-AR')}</span></span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
                        src={product.images?.[0] || PLACEHOLDER_IMAGE}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="font-mono text-sm space-y-1">
                      <div className="flex items-center gap-1.5 min-h-[18px]">
                        <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 uppercase tracking-wider leading-none">Nuevo</span>
                        {product.salePrice && (
                          <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 uppercase tracking-wider leading-none">Sale</span>
                        )}
                      </div>
                      <h3 className="font-bold truncate uppercase text-foreground group-hover:text-primary transition-colors">{product.name}</h3>
                      <p className="text-muted-foreground text-xs truncate">{product.categoryName}</p>
                      {(() => {
                        const effPrice = Number(product.salePrice || product.price);
                        const discPrice = calcDiscounted(effPrice);
                        return (
                          <div>
                            {product.salePrice ? (
                              <div className="flex items-baseline gap-2">
                                <span className="text-destructive font-bold text-base">${Number(product.salePrice).toLocaleString('es-AR')}</span>
                                <span className="text-muted-foreground line-through font-bold text-xs">${Number(product.price).toLocaleString('es-AR')}</span>
                              </div>
                            ) : (
                              <span className="font-bold text-foreground">${Number(product.price).toLocaleString('es-AR')}</span>
                            )}
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                              <span>Transf. <span className="text-primary font-semibold">${discPrice.toLocaleString('es-AR')}</span></span>
                              <span className="text-muted-foreground/40">/</span>
                              <span>Efect. <span className="font-semibold text-foreground">${effPrice.toLocaleString('es-AR')}</span></span>
                            </div>
                          </div>
                        );
                      })()}
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