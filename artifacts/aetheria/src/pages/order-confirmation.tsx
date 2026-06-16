import { useState } from "react";
import { useLocation, useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Copy, ChevronRight } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BankData {
  alias: string | null;
  cvu: string | null;
  titular: string | null;
  cuit: string | null;
}

export function OrderConfirmation() {
  const params = useParams<{ orderId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [creatingAccount, setCreatingAccount] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", params.orderId],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${params.orderId}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const { data: bankData } = useQuery({
    queryKey: ["bankData"],
    queryFn: async (): Promise<BankData> => {
      const res = await fetch("/api/store-config/bank-data");
      if (!res.ok) return { alias: null, cvu: null, titular: null, cuit: null };
      return res.json();
    },
  });

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `"${label}" copiado` });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 min-h-[50vh] flex items-center justify-center">
        <div className="h-12 w-12 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold tracking-tighter uppercase mb-4">Pedido no encontrado</h1>
        <Button onClick={() => setLocation("/")} className="rounded-none font-mono uppercase tracking-widest bg-primary text-white hover:bg-primary/80 border-none h-12">
          Volver al inicio
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-20 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <span className="font-sans font-bold text-xl tracking-tighter text-primary">AETHERIA</span>
        <Link href="/tienda" className="font-mono text-xs text-primary hover:underline uppercase tracking-widest">
          Seguir comprando →
        </Link>
      </div>

      {/* Badge */}
      <div className="inline-block border border-primary/30 bg-primary/5 px-3 py-1 font-mono text-xs uppercase tracking-widest text-primary mb-6">
        Pedido
      </div>

      {/* Message */}
      <h1 className="text-2xl md:text-3xl font-bold tracking-tighter mb-3 leading-tight">
        Un paso más, <span className="text-primary">{order.firstName}</span>.<br />
        Tu orden <span className="text-primary">#{order.displayNumber ?? order.id}</span> fue procesada.
      </h1>
      <p className="text-muted-foreground font-mono text-sm mb-8">
        Te enviamos un mail a <strong className="text-foreground">{order.email}</strong> con el link a esta página.
      </p>

      {/* Transfer data */}
      {(bankData?.alias || bankData?.cvu) && (
        <div className="bg-primary/5 border border-primary/20 p-6 mb-8">
          <h3 className="font-mono text-xs uppercase tracking-widest text-primary font-bold mb-4">Datos para transferencia</h3>
          <div className="space-y-3 font-mono text-sm">
            {bankData.alias && (
              <div className="flex items-center justify-between bg-background border border-border p-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Alias</p>
                  <p className="font-bold">{bankData.alias}</p>
                </div>
                <button onClick={() => handleCopy(bankData.alias!, "Alias")} className="text-primary hover:underline text-xs flex items-center gap-1">
                  <Copy className="h-3 w-3" /> Copiar
                </button>
              </div>
            )}
            {bankData.cvu && (
              <div className="flex items-center justify-between bg-background border border-border p-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">CVU</p>
                  <p className="font-bold text-xs">{bankData.cvu}</p>
                </div>
                <button onClick={() => handleCopy(bankData.cvu!, "CVU")} className="text-primary hover:underline text-xs flex items-center gap-1">
                  <Copy className="h-3 w-3" /> Copiar
                </button>
              </div>
            )}
            {bankData.titular && (
              <div className="flex items-center justify-between bg-background border border-border p-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Titular</p>
                  <p className="font-bold">{bankData.titular}</p>
                </div>
              </div>
            )}
            {bankData.cuit && (
              <div className="flex items-center justify-between bg-background border border-border p-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">CUIT</p>
                  <p className="font-bold">{bankData.cuit}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order info */}
      <div className="border border-border divide-y divide-border mb-8">
        <div className="flex items-center justify-between p-4">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Método de envío</span>
          <span className="font-mono text-sm font-bold">{order.shippingMethodName ?? "—"}</span>
        </div>
        <div className="flex items-center justify-between p-4">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Estado</span>
          <span className="font-mono text-sm font-bold capitalize text-yellow-500">{order.status}</span>
        </div>
        <div className="flex items-center justify-between p-4">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Destino</span>
          <span className="font-mono text-sm font-bold">{order.city}, {order.province}</span>
        </div>
        <div className="flex items-center justify-between p-4">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Domicilio</span>
          <span className="font-mono text-sm font-bold">{order.address}</span>
        </div>
        <div className="flex items-center justify-between p-4">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Método de pago</span>
          <span className="font-mono text-sm font-bold">{order.paymentMethodName ?? "—"}</span>
        </div>
        <div className="flex items-center justify-between p-4">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Total</span>
          <span className="font-mono text-lg font-bold">${Number(order.total).toLocaleString("es-AR")}</span>
        </div>
      </div>

      {/* Product list */}
      <div className="border border-border p-4 mb-8">
        <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">Productos</h3>
        <div className="space-y-2">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex justify-between font-mono text-sm py-1">
              <span>{item.quantity}x {item.productName} {item.selectedSize ? `(${item.selectedSize})` : ""}</span>
              <span>${Number(item.price).toLocaleString("es-AR")}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Optional account creation */}
      <div className="bg-muted/20 border border-border p-6 mb-8">
        <h3 className="font-mono text-xs uppercase tracking-widest mb-1">Creá una cuenta para comprar más rápido</h3>
        <p className="font-mono text-[10px] text-muted-foreground mb-3">Guardá tus datos para futuras compras (opcional)</p>
        <div className="flex gap-2">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Creá una contraseña"
            className="rounded-none h-12 font-mono bg-background border-border flex-1"
          />
          <Button
            disabled={!password || creatingAccount}
            onClick={async () => {
              setCreatingAccount(true);
              try {
                const res = await fetch("/api/auth/register", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: order.email, password, firstName: order.firstName, lastName: order.lastName, phone: order.phone }),
                });
                const data = await res.json();
                if (data.success) {
                  localStorage.setItem("aetheria_auth_token", data.token);
                  toast({ title: "Cuenta creada", description: "Ya podés comprar más rápido" });
                } else {
                  toast({ title: "Error", description: data.message, variant: "destructive" });
                }
              } catch {
                toast({ title: "Error", description: "No se pudo crear la cuenta", variant: "destructive" });
              } finally {
                setCreatingAccount(false);
              }
            }}
            className="rounded-none font-mono uppercase text-xs h-12 bg-primary text-white hover:bg-primary/80 border-none shrink-0"
          >
            {creatingAccount ? "Creando..." : "Crear cuenta"}
          </Button>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground/50 mt-2">* No es obligatorio tener cuenta para comprar</p>
      </div>

      <Button onClick={() => setLocation("/")} className="w-full h-14 rounded-none font-mono uppercase tracking-widest bg-primary text-white hover:bg-primary/80 border-none">
        Volver al inicio
      </Button>
    </div>
  );
}