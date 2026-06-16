import { Truck, Package, Store } from "lucide-react";

export function ShippingMethods() {
  const methods = [
    { icon: Truck, name: "Correo Argentino" },
    { icon: Package, name: "Andreani" },
    { icon: Store, name: "OCA" },
  ];

  return (
    <div>
      <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">Medios de envío</h3>
      <div className="flex flex-wrap gap-3">
        {methods.map((m) => (
          <div key={m.name} className="flex items-center gap-2 bg-background border border-border px-3 py-2">
            <m.icon className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-xs text-foreground">{m.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
