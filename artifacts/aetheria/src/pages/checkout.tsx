import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetCart, useGetShippingMethods, useGetPaymentMethods, useCreateOrder, useApplyCoupon, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { CheckCircle, ArrowRight, ArrowLeft, Tag, Loader2, Truck, CreditCard, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const shippingSchema = z.object({
  email: z.string().email("Email inválido"),
  firstName: z.string().min(1, "Requerido"),
  lastName: z.string().min(1, "Requerido"),
  phone: z.string().min(6, "Requerido"),
  address: z.string().min(1, "Requerido"),
  addressNumber: z.string().min(1, "Requerido"),
  floor: z.string().optional(),
  city: z.string().min(1, "Requerido"),
  province: z.string().min(1, "Requerido"),
  postalCode: z.string().min(1, "Requerido"),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

const PROVINCES = ["Buenos Aires","CABA","Catamarca","Chaco","Chubut","Córdoba","Corrientes","Entre Ríos","Formosa","Jujuy","La Pampa","La Rioja","Mendoza","Misiones","Neuquén","Río Negro","Salta","San Juan","San Luis","Santa Cruz","Santa Fe","Santiago del Estero","Tierra del Fuego","Tucumán"];

interface ShipQuote {
  price: number;
  estimatedDays: string;
  provider: string;
  methodName: string;
}

export function Checkout() {
  const { sessionId } = useSession();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [step, setStep] = useState<"shipping" | "payment">("shipping");
  const [selectedShipping, setSelectedShipping] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [notes, setNotes] = useState("");

  const { data: cart } = useGetCart({ sessionId }, { query: { enabled: !!sessionId, queryKey: getGetCartQueryKey({ sessionId }) } });
  const { data: shippingMethods } = useGetShippingMethods();
  const { data: paymentMethods } = useGetPaymentMethods();
  const createOrder = useCreateOrder();
  const applyCouponMutation = useApplyCoupon();

  const form = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: { email: "", firstName: "", lastName: "", phone: "", address: "", addressNumber: "", floor: "", city: "", province: "", postalCode: "" },
  });

  const postalCode = form.watch("postalCode");
  const province = form.watch("province");

  useEffect(() => {
    if (!selectedShipping || !postalCode || !province) {
      setQuote(null);
      return;
    }
    const method = shippingMethods?.find((s) => s.id === selectedShipping);
    if (!method) return;

    let cancelled = false;
    setQuoteLoading(true);

    fetch("/api/shipping/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shippingMethodId: selectedShipping, postalCode, province, subtotal: cart?.subtotal ?? 0 }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) { setQuote(data); setQuoteLoading(false); }
      })
      .catch(() => { if (!cancelled) setQuoteLoading(false); });

    return () => { cancelled = true; };
  }, [selectedShipping, postalCode, province, shippingMethods, cart?.subtotal]);

  const activeShipping = shippingMethods?.find((s) => s.id === selectedShipping);
  const activePayment = paymentMethods?.find((p) => p.id === selectedPayment);
  const shippingCost = quote?.price ?? (activeShipping ? activeShipping.price : 0);
  const paymentDiscount = activePayment ? (cart?.subtotal ?? 0) * ((activePayment.discount ?? 0) / 100) : 0;
  const couponDiscount = cart?.discount ?? 0;
  const total = (cart?.subtotal ?? 0) - couponDiscount - paymentDiscount + shippingCost;

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    applyCouponMutation.mutate({ data: { sessionId, code: couponCode } }, {
      onSuccess: (result: any) => {
        if (result.valid) { setAppliedCoupon(couponCode); setCouponMsg("Cupón aplicado con éxito"); queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) }); }
        else { setCouponMsg(result.message ?? "Cupón inválido"); }
      }
    });
  };

  const handleShippingSubmit = (data: ShippingFormData) => {
    if (!selectedShipping) {
      toast({ title: "Seleccioná un método de envío", variant: "destructive" });
      return;
    }
    setStep("payment");
  };

  const handlePaymentSubmit = () => {
    if (!selectedPayment) {
      toast({ title: "Seleccioná un método de pago", variant: "destructive" });
      return;
    }
    const data = form.getValues();
    const address = `${data.address} ${data.addressNumber}${data.floor ? `, ${data.floor}` : ""}`;

    createOrder.mutate({
      data: {
        sessionId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        paymentMethodId: selectedPayment,
        shippingMethodId: selectedShipping!,
        couponCode: appliedCoupon ?? undefined,
        notes: notes || undefined,
      }
    }, {
      onSuccess: (order: any) => {
        setLocation(`/pedido-confirmado/${order.id}`);
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) });
      },
      onError: () => {
        toast({ title: "Error al crear pedido", description: "Intentá de nuevo", variant: "destructive" });
      }
    });
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-24">
      <div className="flex items-center gap-3 mb-8">
        <div className={`h-8 w-8 flex items-center justify-center font-mono text-xs font-bold border ${step === "shipping" ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}>1</div>
        <span className={`font-mono text-xs uppercase tracking-widest ${step === "shipping" ? "text-foreground" : "text-muted-foreground"}`}>Envío</span>
        <div className="h-px flex-1 bg-border mx-2" />
        <div className={`h-8 w-8 flex items-center justify-center font-mono text-xs font-bold border ${step === "payment" ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}>2</div>
        <span className={`font-mono text-xs uppercase tracking-widest ${step === "payment" ? "text-foreground" : "text-muted-foreground"}`}>Pago</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
        <div className="flex-1">
          <Form {...form}>
            <form onSubmit={step === "shipping" ? form.handleSubmit(handleShippingSubmit) : (e) => { e.preventDefault(); handlePaymentSubmit(); }}>
              {step === "shipping" ? (
                <div className="space-y-8">
                  {/* Contact */}
                  <section>
                    <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">Contacto</h2>
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel className="font-mono text-[10px] uppercase tracking-widest">Email</FormLabel>
                        <FormControl><Input {...field} type="email" className="rounded-none h-12 font-mono bg-background border-border" placeholder="tu@email.com" /></FormControl><FormMessage />
                      </FormItem>
                    )} />
                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                      <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} className="accent-primary" />
                      <span className="font-mono text-[10px] text-muted-foreground">Recibir novedades y ofertas</span>
                    </label>
                  </section>

                  {/* Shipping method */}
                  <section>
                    <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">Método de envío</h2>
                    <div className="space-y-2">
                      {shippingMethods?.filter((s: any) => s.active).map((method: any) => (
                        <button type="button" key={method.id} onClick={() => setSelectedShipping(method.id)}
                          className={`w-full flex justify-between items-center p-4 border transition-colors text-left font-mono text-sm ${selectedShipping === method.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                          <div className="flex items-center gap-3">
                            <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${selectedShipping === method.id ? "border-primary" : "border-border"}`}>
                              {selectedShipping === method.id && <div className="h-2 w-2 rounded-full bg-primary" />}
                            </div>
                            <div>
                              <p className="font-bold text-foreground uppercase tracking-wider text-xs">{method.name}</p>
                              {quoteLoading && selectedShipping === method.id ? (
                                <span className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" />Cotizando...</span>
                              ) : selectedShipping === method.id && quote ? (
                                <p className="text-xs text-muted-foreground mt-0.5">{quote.estimatedDays} · {quote.provider}</p>
                              ) : (
                                <p className="text-xs text-muted-foreground mt-0.5">{method.estimatedDays}</p>
                              )}
                            </div>
                          </div>
                          <span className="font-bold text-foreground text-xs">
                            {selectedShipping === method.id && quote && !quoteLoading
                              ? (quote.price === 0 ? "Gratis" : `$${quote.price.toLocaleString("es-AR")}`)
                              : (method.price === 0 ? "Gratis" : `$${Number(method.price).toLocaleString("es-AR")}`)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Recipient data */}
                  <section>
                    <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">Datos del destinatario</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="firstName" render={({ field }) => (
                        <FormItem><FormLabel className="font-mono text-[10px] uppercase tracking-widest">Nombre</FormLabel>
                          <FormControl><Input {...field} className="rounded-none h-12 font-mono bg-background border-border" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="lastName" render={({ field }) => (
                        <FormItem><FormLabel className="font-mono text-[10px] uppercase tracking-widest">Apellido</FormLabel>
                          <FormControl><Input {...field} className="rounded-none h-12 font-mono bg-background border-border" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem><FormLabel className="font-mono text-[10px] uppercase tracking-widest">Teléfono</FormLabel>
                          <FormControl><Input {...field} className="rounded-none h-12 font-mono bg-background border-border" placeholder="+54 11 1234-5678" /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                  </section>

                  {/* Address */}
                  <section>
                    <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">Domicilio</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem><FormLabel className="font-mono text-[10px] uppercase tracking-widest">Calle</FormLabel>
                          <FormControl><Input {...field} className="rounded-none h-12 font-mono bg-background border-border" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="addressNumber" render={({ field }) => (
                        <FormItem><FormLabel className="font-mono text-[10px] uppercase tracking-widest">Número</FormLabel>
                          <FormControl><Input {...field} className="rounded-none h-12 font-mono bg-background border-border" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="floor" render={({ field }) => (
                        <FormItem><FormLabel className="font-mono text-[10px] uppercase tracking-widest">Piso / Depto</FormLabel>
                          <FormControl><Input {...field} className="rounded-none h-12 font-mono bg-background border-border" placeholder="Opcional" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem><FormLabel className="font-mono text-[10px] uppercase tracking-widest">Ciudad</FormLabel>
                          <FormControl><Input {...field} className="rounded-none h-12 font-mono bg-background border-border" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="postalCode" render={({ field }) => (
                        <FormItem><FormLabel className="font-mono text-[10px] uppercase tracking-widest">Código postal</FormLabel>
                          <FormControl><Input {...field} className="rounded-none h-12 font-mono bg-background border-border" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="province" render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel className="font-mono text-[10px] uppercase tracking-widest">Provincia</FormLabel>
                          <FormControl>
                            <select {...field} className="w-full h-12 font-mono text-sm bg-background border border-border px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary rounded-none">
                              <option value="">Seleccioná una provincia</option>
                              {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                            </select>
                          </FormControl><FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </section>

                  <Button type="submit" disabled={!selectedShipping} className="w-full h-14 rounded-none font-mono uppercase tracking-widest bg-primary text-white hover:bg-primary/80 border-none">
                    Continuar al pago <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Payment method */}
                  <section>
                    <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">Método de pago</h2>
                    <div className="space-y-2">
                      {paymentMethods?.filter((p: any) => p.active).map((method: any) => {
                        const showDiscount = (method.discount ?? 0) > 0;
                        return (
                          <button type="button" key={method.id} onClick={() => setSelectedPayment(method.id)}
                            className={`w-full flex items-center justify-between p-4 border transition-colors text-left font-mono text-sm ${selectedPayment === method.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                            <div className="flex items-center gap-3">
                              <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${selectedPayment === method.id ? "border-primary" : "border-border"}`}>
                                {selectedPayment === method.id && <div className="h-2 w-2 rounded-full bg-primary" />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-foreground uppercase tracking-wider text-xs">{method.name}</p>
                                  {showDiscount && <span className="bg-primary/10 text-primary font-mono text-[10px] font-bold px-1.5 py-0.5">{method.discount}% OFF</span>}
                                </div>
                                {selectedPayment === method.id && method.instructions && (
                                  <p className="text-xs text-muted-foreground mt-1.5 max-w-md">{method.instructions}</p>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  {/* Billing data */}
                  <section>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={useBillingData} onChange={(e) => setUseBillingData(e.target.checked)} className="accent-primary" />
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Usar datos de envío como facturación</span>
                    </label>
                  </section>

                  {/* Notes */}
                  <section>
                    <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">Notas del pedido</h2>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                      className="w-full h-24 font-mono text-sm bg-background border border-border px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                      placeholder="Alguna nota para tu pedido..." />
                  </section>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep("shipping")} className="rounded-none font-mono uppercase text-xs h-12 border-border flex-1">
                      <ArrowLeft className="h-4 w-4 mr-2" /> Volver
                    </Button>
                    <Button type="submit" disabled={!selectedPayment || createOrder.isPending} className="flex-1 h-12 rounded-none font-mono uppercase tracking-widest bg-primary text-white hover:bg-primary/80 border-none">
                      {createOrder.isPending ? "Procesando..." : "Confirmar pedido"}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </div>

        {/* Right Summary */}
        <div className="w-full lg:w-[380px] shrink-0">
          <div className="bg-muted/20 border border-border p-6 sticky top-24 space-y-6">
            <h2 className="font-mono text-xs uppercase tracking-widest border-b border-border pb-4">Resumen del pedido</h2>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {cart?.items.map((item: any) => (
                <div key={item.id} className="flex gap-2 font-mono text-xs">
                  <div className="w-12 h-14 bg-muted border border-border shrink-0 overflow-hidden">
                    {item.product?.images?.[0] && <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <p className="font-bold uppercase tracking-wide truncate text-foreground">{item.product?.name}</p>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {item.selectedSize && <span>T: {item.selectedSize}</span>}
                      <span>Cant: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="shrink-0 font-bold text-right whitespace-nowrap">${(item.price * item.quantity).toLocaleString("es-AR")}</span>
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
              <div className="flex justify-between text-muted-foreground">
                <span>Envío</span>
                <span>{quoteLoading ? <Loader2 className="h-3 w-3 animate-spin inline" /> : selectedShipping ? (shippingCost === 0 ? "Gratis" : `$${Math.round(shippingCost).toLocaleString("es-AR")}`) : "—"}</span>
              </div>
            </div>

            <div className="flex justify-between font-bold font-mono text-lg border-t border-border pt-4">
              <span className="uppercase tracking-widest">Total</span>
              <span>${Math.round(total).toLocaleString("es-AR")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}