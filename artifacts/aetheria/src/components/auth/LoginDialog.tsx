import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onSwitchToRegister: () => void;
}

export function LoginDialog({ open, onOpenChange, onLogin, onSwitchToRegister }: LoginDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onLogin(email, password);
      setEmail("");
      setPassword("");
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-none border-border">
        <DialogHeader>
          <DialogTitle className="font-mono uppercase tracking-widest text-lg">Iniciar Sesión</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="font-mono text-xs uppercase tracking-widest">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-none h-11 font-mono bg-background border-border"
              placeholder="tu@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-mono text-xs uppercase tracking-widest">Contraseña</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-none h-11 font-mono bg-background border-border"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-destructive font-mono text-xs">{error}</p>}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-none font-mono uppercase tracking-widest bg-primary text-white hover:bg-primary/80 border-none"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Iniciar Sesión"}
          </Button>
          <p className="text-center text-sm font-mono text-muted-foreground">
            ¿No tenés cuenta?{" "}
            <button type="button" onClick={onSwitchToRegister} className="text-primary hover:underline">
              Crear cuenta
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
