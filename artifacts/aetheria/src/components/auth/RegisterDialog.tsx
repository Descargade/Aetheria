import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface RegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegister: (payload: { email: string; password: string; firstName?: string; lastName?: string; phone?: string }) => Promise<void>;
  onSwitchToLogin: () => void;
}

export function RegisterDialog({ open, onOpenChange, onRegister, onSwitchToLogin }: RegisterDialogProps) {
  const [form, setForm] = useState({ email: "", password: "", firstName: "", lastName: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onRegister({
        email: form.email,
        password: form.password,
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
        phone: form.phone || undefined,
      });
      setForm({ email: "", password: "", firstName: "", lastName: "", phone: "" });
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-none border-border">
        <DialogHeader>
          <DialogTitle className="font-mono uppercase tracking-widest text-lg">Crear Cuenta</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="font-mono text-xs uppercase tracking-widest">Nombre</Label>
              <Input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="rounded-none h-11 font-mono bg-background border-border"
                placeholder="Tu nombre"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-mono text-xs uppercase tracking-widest">Apellido</Label>
              <Input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="rounded-none h-11 font-mono bg-background border-border"
                placeholder="Tu apellido"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-mono text-xs uppercase tracking-widest">Email *</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="rounded-none h-11 font-mono bg-background border-border"
              placeholder="tu@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-mono text-xs uppercase tracking-widest">Contraseña *</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
              className="rounded-none h-11 font-mono bg-background border-border"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-mono text-xs uppercase tracking-widest">Teléfono</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="rounded-none h-11 font-mono bg-background border-border"
              placeholder="Tu teléfono"
            />
          </div>
          {error && <p className="text-destructive font-mono text-xs">{error}</p>}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-none font-mono uppercase tracking-widest bg-primary text-white hover:bg-primary/80 border-none"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear Cuenta"}
          </Button>
          <p className="text-center text-sm font-mono text-muted-foreground">
            ¿Ya tenés cuenta?{" "}
            <button type="button" onClick={onSwitchToLogin} className="text-primary hover:underline">
              Iniciar sesión
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
