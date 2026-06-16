import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useGetFeaturedProducts, useGetNewArrivals, useGetCategories } from "@workspace/api-client-react";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { TrustBanner } from "@/components/home/TrustBanner";
import { PaymentMethods } from "@/components/home/PaymentMethods";
import { ShippingMethods } from "@/components/home/ShippingMethods";

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
      <section className="relative w-full min-h-[35vh] md:min-h-[40vh] py-10 md:py-12 overflow-hidden flex items-center justify-center bg-background">
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="text-[18vw] md:text-[14vw] font-bold text-foreground/[0.04] tracking-tighter whitespace-nowrap select-none">
            AETHERIA
          </span>
        </div>

        <div className="relative z-10 container px-4 md:px-8 text-center flex flex-col items-center">
          <p className="text-[9px] md:text-[11px] font-mono text-primary uppercase tracking-[0.25em] mb-2 md:mb-3">
            Nueva colección
          </p>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tighter text-foreground mb-2 md:mb-3 leading-[1.1]">
            ELEVATE<br/>YOUR STYLE
          </h1>
          <p className="text-muted-foreground font-mono text-[11px] md:text-[13px] max-w-md mb-4 md:mb-6 leading-relaxed">
            Descubrí prendas/accesorios seleccionados para acompañarte con estilo, calidad y personalidad.
          </p>
          <Link href="/tienda">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/80 font-mono rounded-none tracking-widest uppercase h-9 md:h-10 px-5 md:px-7 border-none text-[11px] md:text-xs">
              Ver colección
            </Button>
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-10 md:py-16 bg-background">
        <div className="container px-4 md:px-8">
          <div className="flex items-end justify-between mb-6 md:mb-10 border-b border-border pb-3 md:pb-4">
            <div>
              <h2 className="text-xl md:text-3xl font-bold tracking-tighter uppercase">Categorías</h2>
              <p className="text-muted-foreground font-mono text-[10px] md:text-sm mt-1 md:mt-2">Explora por estilo</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3 max-w-5xl mx-auto">
            {categories?.map((cat) => (
              <Link key={cat.id} href={`/tienda?categoryId=${cat.id}`}>
                <div className="group cursor-pointer">
                  <div className="relative aspect-square bg-muted overflow-hidden border border-border group-hover:border-primary/70 transition-colors mb-3">
                    <img
                      src={cat.image || CATEGORY_IMAGES[cat.name] || "/images/products/jacket-1.png"}
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
      <section className="py-12 md:py-20 bg-secondary">
        <div className="container px-4 md:px-8">
          <div className="flex items-end justify-between mb-6 md:mb-10 border-b border-border pb-3 md:pb-4">
            <div>
              <h2 className="text-xl md:text-3xl font-bold tracking-tighter uppercase">Destacados</h2>
              <p className="text-muted-foreground font-mono text-[10px] md:text-sm mt-1 md:mt-2">Signature pieces</p>
            </div>
            <Link href="/tienda" className="text-primary font-mono text-xs md:text-sm hover:underline hidden sm:flex items-center gap-1 uppercase tracking-widest group">
              Ver todos <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {featured?.slice(0,4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals && newArrivals.length > 0 && (
        <section className="py-12 md:py-20 bg-background">
          <div className="container px-4 md:px-8">
            <div className="flex items-end justify-between mb-6 md:mb-10 border-b border-border pb-3 md:pb-4">
              <div>
                <h2 className="text-xl md:text-3xl font-bold tracking-tighter uppercase">Nuevos Ingresos</h2>
                <p className="text-muted-foreground font-mono text-[10px] md:text-sm mt-1 md:mt-2">Últimas llegadas</p>
              </div>
              <Link href="/tienda?isNew=true" className="text-primary font-mono text-xs md:text-sm hover:underline hidden sm:flex items-center gap-1 uppercase tracking-widest group">
                Ver todos <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {newArrivals.slice(0,4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust Banner */}
      <TrustBanner />

      {/* Payment & Shipping */}
      <section className="py-10 md:py-14 bg-background">
        <div className="container px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <PaymentMethods />
            <ShippingMethods />
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 md:py-20 bg-primary">
        <div className="container px-4 md:px-8 text-center">
          <p className="font-mono text-primary-foreground/70 text-[10px] md:text-xs uppercase tracking-[0.3em] mb-3 md:mb-4">Nueva colección</p>
          <h2 className="text-2xl md:text-5xl font-bold tracking-tighter text-primary-foreground uppercase mb-4 md:mb-6">
            Descubrí tu<br/>próximo look
          </h2>
          <Link href="/tienda">
            <Button
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary font-mono rounded-none tracking-widest uppercase h-10 md:h-12 px-6 md:px-8 text-xs md:text-sm"
            >
              Explorar colección
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
