import { CreditCard, Banknote, Building2 } from "lucide-react";

export function PaymentMethods() {
  const methods = [
    { icon: CreditCard, name: "Visa" },
    { icon: CreditCard, name: "Mastercard" },
    { icon: Banknote, name: "Mercado Pago" },
    { icon: Building2, name: "Transferencia" },
  ];

  return (
    <div>
      <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">Medios de pago</h3>
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
