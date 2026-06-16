import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, AlertTriangle } from "lucide-react";

export function Arrepentimiento() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    numeroPedido: "",
    motivo: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.numeroPedido || !form.motivo) {
      toast({ title: "Campos requeridos", description: "Completá todos los campos obligatorios", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/cancellations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Error al enviar");
      setSubmitted(true);
    } catch {
      toast({ title: "Error", description: "No se pudo enviar el formulario. Intentá de nuevo.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 md:py-20">
      <h1 className="text-3xl font-bold tracking-tighter uppercase mb-2">Botón de Arrepentimiento</h1>
      <p className="text-muted-foreground text-sm font-mono mb-8">
        Según la Ley N° 24.240 de Defensa del Consumidor, podés solicitar la cancelación de tu compra dentro de los 10 días hábiles posteriores a la recepción del producto.
      </p>

      {submitted ? (
        <div className="border border-border bg-card p-8 text-center">
          <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Solicitud enviada</h2>
          <p className="text-muted-foreground text-sm font-mono">
            Recibimos tu solicitud de cancelación. Te contactaremos a la brevedad al email proporcionado.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border border-border bg-card p-6 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
            <div className="text-sm text-muted-foreground font-mono">
              <p><strong className="text-foreground">Plazo:</strong> 10 días hábiles desde la recepción del producto.</p>
              <p><strong className="text-foreground">Requisito:</strong> El producto debe estar en las mismas condiciones en que fue recibido.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest block mb-1">Nombre completo *</label>
              <Input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="rounded-none h-10 font-mono text-sm bg-background border-border" />
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest block mb-1">Email *</label>
              <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-none h-10 font-mono text-sm bg-background border-border" />
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest block mb-1">Teléfono</label>
              <Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="rounded-none h-10 font-mono text-sm bg-background border-border" />
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest block mb-1">Número de pedido *</label>
              <Input required value={form.numeroPedido} onChange={(e) => setForm({ ...form, numeroPedido: e.target.value })} className="rounded-none h-10 font-mono text-sm bg-background border-border" placeholder="Ej: 123" />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest block mb-1">Motivo de la cancelación *</label>
            <Textarea required value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} className="rounded-none font-mono text-sm bg-background border-border min-h-[120px]" placeholder="Describí el motivo de tu solicitud..." />
          </div>

          <Button type="submit" disabled={loading} className="rounded-none font-mono uppercase text-xs tracking-widest bg-primary text-white hover:bg-primary/80 border-none h-12 px-8 w-full">
            {loading ? "Enviando..." : "Enviar solicitud"}
          </Button>
        </form>
      )}
    </div>
  );
}
