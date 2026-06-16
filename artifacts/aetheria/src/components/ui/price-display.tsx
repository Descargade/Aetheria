import { useGetPaymentMethods } from "@workspace/api-client-react";

function fmt(price: number): string {
  return `$${Math.round(price).toLocaleString("es-AR")}`;
}

function pct(original: number, sale: number): number {
  return Math.round(((original - sale) / original) * 100);
}

export function PriceDisplay({
  price,
  salePrice,
  size = "md",
  showTransfer = true,
}: {
  price: number;
  salePrice?: number | null;
  size?: "sm" | "md" | "lg";
  showTransfer?: boolean;
}) {
  const { data: paymentMethods } = useGetPaymentMethods();

  const effectivePrice = salePrice ?? price;
  const discountPct = salePrice ? pct(price, salePrice) : 0;

  const transfer = paymentMethods?.find(
    (pm) => pm.name?.toLowerCase().includes("transferencia") && pm.active && (pm.discount ?? 0) > 0,
  );
  const efectivo = paymentMethods?.find(
    (pm) => pm.name?.toLowerCase().includes("efectivo") && pm.active && (pm.discount ?? 0) > 0,
  );

  const txDisc = transfer?.discount ?? 0;
  const efDisc = efectivo?.discount ?? 0;

  const txPrice = effectivePrice * (1 - txDisc / 100);
  const efPrice = effectivePrice * (1 - efDisc / 100);

  const hasTx = txDisc > 0;
  const hasEf = efDisc > 0;
  const hasAny = hasTx || hasEf;

  const sizes = {
    sm: { sale: "text-lg md:text-xl", old: "text-[11px]", badge: "text-[10px] px-1.5 py-0.5", line: "text-[10px] md:text-[11px]", gap: "gap-0.5" },
    md: { sale: "text-2xl", old: "text-sm", badge: "text-xs px-2 py-0.5", line: "text-xs", gap: "gap-1" },
    lg: { sale: "text-3xl", old: "text-base", badge: "text-sm px-2 py-1", line: "text-sm", gap: "gap-1" },
  }[size];

  return (
    <div className={`font-mono ${sizes.gap}`}>
      {/* Original price (tachado) - smallest */}
      {salePrice && (
        <p className={`text-muted-foreground line-through ${sizes.old}`}>{fmt(price)}</p>
      )}

      {/* Sale price + OFF badge - most prominent */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`font-extrabold tracking-tight ${sizes.sale} ${salePrice ? "text-destructive" : "text-foreground"}`}>
          {fmt(effectivePrice)}
        </span>
        {salePrice && discountPct > 0 && (
          <span className={`bg-destructive text-destructive-foreground font-bold ${sizes.badge} leading-none`}>
            -{discountPct}% OFF
          </span>
        )}
      </div>

      {/* Transfer / Efectivo price */}
      {showTransfer && hasAny && (
        <p className={`text-primary font-semibold mt-0.5 ${sizes.line}`}>
          {txDisc === efDisc && txDisc > 0 ? (
            <>{fmt(txPrice)} con TRANSFERENCIA / EFECTIVO</>
          ) : (
            <>
              {hasTx && <>{fmt(txPrice)} con TRANSFERENCIA</>}
              {hasTx && hasEf && <span className="text-muted-foreground mx-1">·</span>}
              {hasEf && <>{fmt(efPrice)} con EFECTIVO</>}
            </>
          )}
        </p>
      )}
    </div>
  );
}
