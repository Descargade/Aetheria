import { Link } from "wouter";
import { useGetCart, useRemoveFromCart, useUpdateCartItem, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Cart() {
  const { sessionId } = useSession();
  const queryClient = useQueryClient();

  const { data: cart, isLoading } = useGetCart({ sessionId }, { query: { enabled: !!sessionId, queryKey: getGetCartQueryKey({ sessionId }) } });
  
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateItem.mutate({ itemId, data: { quantity: newQuantity } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) });
      }
    });
  };

  const handleRemove = (itemId: number) => {
    removeItem.mutate({ itemId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) });
      }
    });
  };

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
        <h1 className="text-4xl font-bold tracking-tighter uppercase mb-6">Tu Carrito</h1>
        <p className="text-muted-foreground font-mono mb-8">El vacío. No has agregado productos a tu orden todavía.</p>
        <Link href="/tienda">
          <Button size="lg" className="w-full h-14 bg-primary text-white hover:bg-primary/80 font-mono rounded-none tracking-widest uppercase border-none">
            Explorar Colección
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-24">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase mb-12">Checkout_</h1>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
        {/* Cart Items */}
        <div className="flex-1 flex flex-col gap-8">
          <div className="flex justify-between items-end border-b border-border pb-4 hidden md:flex font-mono text-sm tracking-widest uppercase text-muted-foreground">
            <span className="w-1/2">Producto</span>
            <span className="w-1/6 text-center">Cant.</span>
            <span className="w-1/6 text-right">Precio</span>
            <span className="w-1/6 text-right">Subtotal</span>
          </div>

          {cart.items.map((item) => (
            <div key={item.id} className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-8 border-b border-border">
              {/* Product Info */}
              <div className="w-full md:w-1/2 flex gap-4">
                <Link href={`/producto/${item.productId}`}>
                  <div className="w-24 aspect-[3/4] bg-muted border border-border shrink-0 cursor-pointer hover:border-primary transition-colors">
                    <img src={item.product?.images?.[0] || PLACEHOLDER_IMAGE} alt={item.product?.name} className="w-full h-full object-cover" />
                  </div>
                </Link>
                <div className="flex flex-col py-1">
                  <Link href={`/producto/${item.productId}`}>
                    <h3 className="font-bold font-mono uppercase tracking-wider text-sm md:text-base hover:text-primary transition-colors line-clamp-2">{item.product?.name}</h3>
                  </Link>
                  <div className="text-xs font-mono text-muted-foreground mt-2 space-y-1">
                    {item.selectedSize && <p>Talle: {item.selectedSize}</p>}
                    {item.selectedColor && <p>Color: {item.selectedColor}</p>}
                  </div>
                  <button 
                    onClick={() => handleRemove(item.id)}
                    className="flex items-center gap-1 text-xs font-mono text-destructive mt-auto pt-2 hover:underline w-max"
                  >
                    <Trash2 className="h-3 w-3" /> Eliminar
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div className="w-full md:w-1/6 flex justify-between md:justify-center items-center font-mono">
                <span className="md:hidden text-muted-foreground text-xs uppercase tracking-widest">Cantidad</span>
                <div className="flex items-center border border-border h-10 w-24">
                  <button className="flex-1 flex justify-center items-center hover:bg-muted transition-colors text-foreground" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="flex-1 text-center text-sm">{item.quantity}</span>
                  <button className="flex-1 flex justify-center items-center hover:bg-muted transition-colors text-foreground" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="w-full md:w-1/6 flex justify-between md:justify-end items-center font-mono">
                <span className="md:hidden text-muted-foreground text-xs uppercase tracking-widest">Precio</span>
                <span className="text-sm">${item.price.toLocaleString('es-AR')}</span>
              </div>

              {/* Total */}
              <div className="w-full md:w-1/6 flex justify-between md:justify-end items-center font-mono font-bold text-foreground">
                <span className="md:hidden text-muted-foreground text-xs font-normal uppercase tracking-widest">Total</span>
                <span>${(item.price * item.quantity).toLocaleString('es-AR')}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-[400px] shrink-0">
          <div className="bg-muted/30 border border-border p-6 md:p-8 sticky top-24">
            <h2 className="text-xl font-bold tracking-widest uppercase mb-6 text-foreground border-b border-border pb-4">Resumen</h2>
            
            <div className="flex flex-col gap-4 font-mono text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${cart.subtotal.toLocaleString('es-AR')}</span>
              </div>
              {cart.discount ? (
                <div className="flex justify-between text-primary">
                  <span>Descuento</span>
                  <span>-${cart.discount.toLocaleString('es-AR')}</span>
                </div>
              ) : null}
              {cart.shippingCost !== undefined ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envío</span>
                  <span>${cart.shippingCost.toLocaleString('es-AR')}</span>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envío</span>
                  <span className="text-xs">Calculado en el checkout</span>
                </div>
              )}
            </div>

            <div className="h-px bg-border w-full mb-6" />

            <div className="flex justify-between items-end font-mono mb-8">
              <span className="uppercase tracking-widest font-bold">Total</span>
              <span className="text-2xl font-bold text-foreground">${cart.total.toLocaleString('es-AR')}</span>
            </div>

            <Link href="/checkout">
              <Button size="lg" className="w-full h-14 bg-primary text-white hover:bg-primary/80 font-mono rounded-none tracking-widest uppercase border-none flex justify-between px-6">
                <span>Continuar</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>

            {/* Coupon - simple visual representation for now */}
            <div className="mt-8">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Código de descuento</p>
              <div className="flex gap-2">
                <Input placeholder="Ingresar código" className="font-mono rounded-none bg-background border-border h-10" />
                <Button variant="outline" className="rounded-none font-mono uppercase h-10 border-border">Aplicar</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}