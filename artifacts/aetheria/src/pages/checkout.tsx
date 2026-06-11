import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useGetCart, useGetShippingMethods, useGetPaymentMethods,
  useCreateOrder, useApplyCoupon, getGetCartQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CheckCircle, ArrowRight, Tag } from "lucide-react";

const checkoutSchema = z.object({
  firstName: z.string().min(1, "Requerido"),
  lastName: z.string().min(1, "Requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(6, "Requerido"),
  address: z.string().min(1, "Requerido"),
  city: z.string().min(1, "Requerido"),
  province: z.string().min(1, "Requerido"),
  postalCode: z.string().min(1, "Requerido"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const PROVINCES = ["Buenos Aires","CABA","Catamarca","Chaco","Chubut","Córdoba","Corrientes","Entre Ríos","Formosa","Jujuy","La Pampa","La Rioja","Mendoza","Misiones","Neuquén","Río Negro","Salta","San Juan","San Luis","Santa Cruz","Santa Fe","Santiago del Estero","Tierra del Fuego","Tucumán"];

export function Checkout() {
  const { sessionId } = useSession();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [selectedShipping, setSelectedShipping] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [orderDone, setOrderDone] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  const { data: cart } = useGetCart({ sessionId }, { query: { enabled: !!sessionId, queryKey: getGetCartQueryKey({ sessionId }) } });
  const { data: shippingMethods } = useGetShippingMethods();
  const { data: paymentMethods } = useGetPaymentMethods();
  const createOrder = useCreateOrder();
  const applyCouponMutation = useApplyCoupon();

  const form = useForm<CheckoutFormData>({ resolver: zodResolver(checkoutSchema), defaultValues: { firstName: "", lastName: "", email: "", phone: "", address: "", city: "", province: "", postalCode: "" } });

  const activeShipping = shippingMethods?.find((s) => s.id === selectedShipping);
  const activePayment = paymentMethods?.find((p) => p.id === selectedPayment);
  const shippingCost = activeShipping ? activeShipping.price : 0;
  const paymentDiscount = activePayment ? (cart?.subtotal ?? 0) * ((activePayment.discount ?? 0) / 100) : 0;
  const couponDiscount = cart?.discount ?? 0;
  const total = (cart?.subtotal ?? 0) - couponDiscount - paymentDiscount + shippingCost;

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    applyCouponMutation.mutate({ data: { sessionId, code: couponCode } }, {
      onSuccess: (result) => {
        if (result.valid) { setAppliedCoupon(couponCode); setCouponMsg("Cupón aplicado con éxito"); queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) }); }
        else { setCouponMsg(result.message ?? "Cupón inválido"); }
      }
    });
  };

  const onSubmit = (data: CheckoutFormData) => {
    if (!selectedShipping || !selectedPayment) return;
    createOrder.mutate({
      data: { ...data, sessionId, paymentMethodId: selectedPayment, shippingMethodId: selectedShipping, couponCode: appliedCoupon ?? undefined }
    }, {
      onSuccess: (order) => {
        setOrderId(order.id);
        setOrderDone(true);
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) });
      }
    });
  };

  if (orderDone) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-lg text-center">
        <div className="flex justify-center mb-6"><CheckCircle className="h-16 w-16 text-primary" /></div>
        <h1 className="text-4xl font-bold tracking-tighter uppercase mb-4">Pedido Confirmado</h1>
        <p className="text-muted-foreground font-mono mb-2">N° de pedido: <span className="text-foreground font-bold">#{orderId}</span></p>
        <p className="text-muted-foreground font-mono mb-8 text-sm">Te contactaremos pronto para coordinar el pago y el envío.</p>
        <Button onClick={() => setLocation("/")} className="w-full h-14 rounded-none font-mono uppercase tracking-widest bg-primary text-white hover:bg-primary/80 border-none">
          Volver al inicio
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-24">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase mb-12">Checkout_</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            {/* Left: Form */}
            <div className="flex-1 space-y-10">
              {/* Personal data */}
              <section>
                <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-6 border-b border-border pb-3">01. Datos personales</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="firstName" render={({ field }) => (
                    <FormItem><FormLabel className="font-mono text-xs uppercase tracking-widest">Nombre</FormLabel><FormControl><Input {...field} className="rounded-none h-12 font-mono bg-background border-border" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="lastName" render={({ field }) => (
                    <FormItem><FormLabel className="font-mono text-xs uppercase tracking-widest">Apellido</FormLabel><FormControl><Input {...field} className="rounded-none h-12 font-mono bg-background border-border" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel className="font-mono text-xs uppercase tracking-widest">Email</FormLabel><FormControl><Input {...field} type="email" className="rounded-none h-12 font-mono bg-background border-border" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem><FormLabel className="font-mono text-xs uppercase tracking-widest">Teléfono</FormLabel><FormControl><Input {...field} className="rounded-none h-12 font-mono bg-background border-border" /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </section>

              {/* Address */}
              <section>
                <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-6 border-b border-border pb-3">02. Dirección de envío</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem className="sm:col-span-2"><FormLabel className="font-mono text-xs uppercase tracking-widest">Dirección</FormLabel><FormControl><Input {...field} className="rounded-none h-12 font-mono bg-background border-border" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem><FormLabel className="font-mono text-xs uppercase tracking-widest">Ciudad</FormLabel><FormControl><Input {...field} className="rounded-none h-12 font-mono bg-background border-border" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="postalCode" render={({ field }) => (
                    <FormItem><FormLabel className="font-mono text-xs uppercase tracking-widest">Código postal</FormLabel><FormControl><Input {...field} className="rounded-none h-12 font-mono bg-background border-border" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="province" render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel className="font-mono text-xs uppercase tracking-widest">Provincia</FormLabel>
                      <FormControl>
                        <select {...field} className="w-full h-12 font-mono text-sm bg-background border border-border px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                          <option value="">Seleccioná una provincia</option>
                          {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </section>

              {/* Shipping */}
              <section>
                <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-6 border-b border-border pb-3">03. Método de envío</h2>
                <div className="space-y-3">
                  {shippingMethods?.filter((s) => s.active).map((method) => (
                    <button type="button" key={method.id} onClick={() => setSelectedShipping(method.id)}
                      className={`w-full flex justify-between items-center p-4 border transition-colors text-left font-mono text-sm ${selectedShipping === method.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                      data-testid={`shipping-method-${method.id}`}>
                      <div>
                        <p className="font-bold text-foreground uppercase tracking-wider">{method.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{method.estimatedDays}</p>
                      </div>
                      <span className="font-bold text-foreground">{method.price === 0 ? "Gratis" : `$${Number(method.price).toLocaleString("es-AR")}`}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Payment */}
              <section>
                <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-6 border-b border-border pb-3">04. Método de pago</h2>
                <div className="space-y-3">
                  {paymentMethods?.filter((p) => p.active).map((method) => (
                    <button type="button" key={method.id} onClick={() => setSelectedPayment(method.id)}
                      className={`w-full flex justify-between items-center p-4 border transition-colors text-left font-mono text-sm ${selectedPayment === method.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                      data-testid={`payment-method-${method.id}`}>
                      <div>
                        <p className="font-bold text-foreground uppercase tracking-wider">{method.name}</p>
                        {(method.discount ?? 0) > 0 && <p className="text-xs text-primary mt-0.5">{method.discount}% de descuento</p>}
                        {selectedPayment === method.id && method.instructions && (
                          <p className="text-xs text-muted-foreground mt-2 max-w-sm">{method.instructions}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* Right: Summary */}
            <div className="w-full lg:w-[380px] shrink-0">
              <div className="bg-muted/20 border border-border p-6 lg:sticky top-24 space-y-6">
                <h2 className="text-sm font-mono uppercase tracking-widest border-b border-border pb-4">Resumen del pedido</h2>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {cart?.items.map((item) => (
                    <div key={item.id} className="flex gap-3 font-mono text-xs">
                      <div className="w-12 h-14 bg-muted border border-border shrink-0 overflow-hidden">
                        {item.product?.images?.[0] && <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold uppercase tracking-wide truncate">{item.product?.name}</p>
                        {item.selectedSize && <p className="text-muted-foreground">T: {item.selectedSize}</p>}
                        <p className="text-muted-foreground">x{item.quantity}</p>
                      </div>
                      <span className="shrink-0 font-bold">${(item.price * item.quantity).toLocaleString("es-AR")}</span>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Cupón de descuento</p>
                  <div className="flex gap-2">
                    <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Código" className="font-mono rounded-none h-10 bg-background border-border text-sm" />
                    <Button type="button" variant="outline" onClick={handleApplyCoupon} className="rounded-none font-mono uppercase h-10 border-border text-xs shrink-0">
                      <Tag className="h-3 w-3 mr-1" />Aplicar
                    </Button>
                  </div>
                  {couponMsg && <p className={`text-xs font-mono mt-1 ${appliedCoupon ? "text-primary" : "text-destructive"}`}>{couponMsg}</p>}
                </div>

                <div className="border-t border-border pt-4 space-y-2 font-mono text-sm">
                  <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>${(cart?.subtotal ?? 0).toLocaleString("es-AR")}</span></div>
                  {couponDiscount > 0 && <div className="flex justify-between text-primary"><span>Cupón</span><span>-${couponDiscount.toLocaleString("es-AR")}</span></div>}
                  {paymentDiscount > 0 && <div className="flex justify-between text-primary"><span>Desc. pago</span><span>-${Math.round(paymentDiscount).toLocaleString("es-AR")}</span></div>}
                  <div className="flex justify-between text-muted-foreground"><span>Envío</span><span>{selectedShipping ? (shippingCost === 0 ? "Gratis" : `$${Number(shippingCost).toLocaleString("es-AR")}`) : "—"}</span></div>
                </div>

                <div className="flex justify-between font-bold font-mono text-lg border-t border-border pt-4">
                  <span className="uppercase tracking-widest">Total</span>
                  <span>${Math.round(total).toLocaleString("es-AR")}</span>
                </div>

                <Button type="submit" disabled={!selectedShipping || !selectedPayment || createOrder.isPending} className="w-full h-14 rounded-none font-mono uppercase tracking-widest bg-primary text-white hover:bg-primary/80 border-none flex justify-between px-6" data-testid="button-submit-order">
                  <span>{createOrder.isPending ? "Procesando..." : "Confirmar pedido"}</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
                {(!selectedShipping || !selectedPayment) && <p className="text-xs text-muted-foreground font-mono text-center">Seleccioná envío y método de pago</p>}
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
