import { Truck, CreditCard, ShieldCheck } from "lucide-react";

export function TrustBanner() {
  return (
    <section className="py-10 md:py-14 bg-primary/5 border-y border-primary/10">
      <div className="container px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="flex items-center gap-4 p-4">
            <div className="h-12 w-12 shrink-0 bg-primary/10 flex items-center justify-center">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-mono font-bold text-xs uppercase tracking-widest text-foreground">Envíos a todo el país</p>
              <p className="font-mono text-[10px] text-muted-foreground mt-0.5">Comprá sin salir de tu casa</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4">
            <div className="h-12 w-12 shrink-0 bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-mono font-bold text-xs uppercase tracking-widest text-foreground">Transferencias</p>
              <p className="font-mono text-[10px] text-muted-foreground mt-0.5">20% de descuento por transferencia</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4">
            <div className="h-12 w-12 shrink-0 bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-mono font-bold text-xs uppercase tracking-widest text-foreground">Compra segura</p>
              <p className="font-mono text-[10px] text-muted-foreground mt-0.5">Protegemos tus datos</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}