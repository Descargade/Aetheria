import { Link, useLocation } from "wouter";
import { useGetCart, useRemoveFromCart, useUpdateCartItem, useApplyCoupon, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/hooks/use-session";
import { Trash2, Plus, Minus, Tag, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function Cart() {
  const { sessionId } = useSession();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponMsg, setCouponMsg] = useState("");

  const { data: cart, isLoading } = useGetCart({ sessionId, couponCode: appliedCoupon ?? undefined }, { query: { enabled: !!sessionId, queryKey: getGetCartQueryKey({ sessionId, couponCode: appliedCoupon ?? undefined }) } });

  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();
  const applyCouponMutation = useApplyCoupon();

  const handleUpdateQuantity = (itemId: number, newQuantity: number, availableStock: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > availableStock) {
      toast({ title: "Stock insuficiente", description: `Solo hay ${availableStock} unidades disponibles`, variant: "destructive" });
      return;
    }
    updateItem.mutate({ itemId, data: { quantity: newQuantity, couponCode: appliedCoupon ?? undefined } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId, couponCode: appliedCoupon ?? undefined }) }),
    });
  };

  const handleRemove = (itemId: number) => {
    removeItem.mutate({ itemId, params: { couponCode: appliedCoupon ?? undefined } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId, couponCode: appliedCoupon ?? undefined }) }),
    });
  };

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    setCouponMsg("");
    applyCouponMutation.mutate({ data: { sessionId, code: couponInput } }, {
      onSuccess: (result: any) => {
        if (result.valid) {
          setAppliedCoupon(couponInput);
          setCouponMsg("Cupón aplicado");
        } else {
          setCouponMsg(result.message ?? "Cupón inválido");
        }
      },
    });
  };

  const couponDiscount = cart?.discount ?? 0;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-12 md:py-24 min-h-[50vh] flex items-center justify-center">
        <div className="h-12 w-12 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-24 text-center max-w-lg">
        <h1 className="text-3xl font-bold tracking-tighter uppercase mb-4">Mi carrito</h1>
        <p className="text-muted-foreground font-mono text-sm mb-8">Tu carrito está vacío</p>
        <Link href="/tienda">
          <Button className="w-full h-14 rounded-none font-mono uppercase tracking-widest bg-primary text-white hover:bg-primary/80 border-none">
            Explorar colección
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-24">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase mb-10">Mi carrito</h1>

      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
        {/* Left: Cart Items */}
        <div className="flex-1 flex flex-col gap-6">
          {cart.items.map((item: any) => {
            const availableStock = item.availableStock ?? 999;
            const isOutOfStock = availableStock <= 0;
            return (
              <div key={item.id} className="flex flex-col sm:flex-row gap-4 pb-6 border-b border-border">
                <div className="w-24 aspect-[3/4] bg-muted border border-border shrink-0">
                  <img src={item.product?.images?.[0] || "/images/products/jacket-1.png"} alt={item.product?.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <Link href={`/producto/${item.productId}`}>
                      <h3 className="font-bold font-mono uppercase tracking-wider text-sm hover:text-primary transition-colors">{item.product?.name}</h3>
                    </Link>
                    <div className="text-xs font-mono text-muted-foreground mt-1 space-y-0.5">
                      {item.selectedSize && <p>Talle: {item.selectedSize}</p>}
                      {item.selectedColor && <p>Color: {item.selectedColor}</p>}
                    </div>
                    <p className="font-mono font-bold text-sm mt-2">${Number(item.price).toLocaleString("es-AR")}</p>
                    {isOutOfStock && <p className="text-destructive font-mono text-xs mt-1">Sin stock</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-border h-9">
                      <button
                        className="px-2 h-full flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, availableStock)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-3 font-mono text-sm min-w-[24px] text-center">{item.quantity}</span>
                      <button
                        className="px-2 h-full flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, availableStock)}
                        disabled={item.quantity >= availableStock}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="font-mono font-bold text-sm min-w-[80px] text-right">${(Number(item.price) * item.quantity).toLocaleString("es-AR")}</p>
                    <button onClick={() => handleRemove(item.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          <Link href="/tienda" className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest mt-2">
            ← Seguir comprando
          </Link>
        </div>

        {/* Right: Summary */}
        <div className="w-full lg:w-[380px] shrink-0">
          <div className="bg-muted/20 border border-border p-6 sticky top-24 space-y-6">
            <h2 className="font-mono text-xs uppercase tracking-widest border-b border-border pb-4">Resumen del pedido</h2>

            <div className="space-y-3 font-mono text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({cart.items.reduce((s: number, i: any) => s + i.quantity, 0)} productos)</span>
                <span className="text-foreground font-bold">${cart.subtotal.toLocaleString("es-AR")}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Descuento</span>
                  <span>-${couponDiscount.toLocaleString("es-AR")}</span>
                </div>
              )}

              {/* Discount code */}
              <div className="border-t border-border pt-3">
                <div className="flex gap-2">
                  <Input value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="Código de descuento"
                    className="rounded-none h-10 font-mono text-sm bg-background border-border"
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()} />
                  <Button variant="outline" onClick={handleApplyCoupon} disabled={applyCouponMutation.isPending}
                    className="rounded-none font-mono uppercase text-xs h-10 border-border shrink-0">
                    {applyCouponMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "APLICAR"}
                  </Button>
                </div>
                {couponMsg && <p className={`text-xs font-mono mt-1 ${appliedCoupon ? "text-primary" : "text-destructive"}`}>{couponMsg}</p>}
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-end font-mono mb-6">
                <span className="uppercase tracking-widest font-bold text-sm">Total</span>
                <span className="text-2xl font-bold">${cart.total.toLocaleString("es-AR")}</span>
              </div>
              <Button
                onClick={() => setLocation("/checkout")}
                className="w-full h-14 rounded-none font-mono uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/80 border-none text-sm"
              >
                INICIAR COMPRA <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
