import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useAdminLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    login.mutate({ data: { username, password } }, {
      onSuccess: (result) => {
        if (result.success) {
          localStorage.setItem("aetheria_admin_token", result.token);
          localStorage.setItem("aetheria_admin_user", result.username ?? "admin");
          setLocation("/admin/dashboard");
        } else {
          setError("Credenciales inválidas");
        }
      },
      onError: () => setError("Credenciales inválidas"),
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tighter uppercase mb-2">AETHERIA</h1>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Panel de administración</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Usuario</label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" required
              className="rounded-none h-12 font-mono bg-background border-border" data-testid="input-admin-username" />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Contraseña</label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" required
              className="rounded-none h-12 font-mono bg-background border-border" data-testid="input-admin-password" />
          </div>
          {error && <p className="text-destructive font-mono text-xs">{error}</p>}
          <Button type="submit" disabled={login.isPending} className="w-full h-12 rounded-none font-mono uppercase tracking-widest bg-primary text-white hover:bg-primary/80 border-none mt-2" data-testid="button-admin-login">
            {login.isPending ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
        <p className="text-center text-xs font-mono text-muted-foreground mt-8">Usuario: admin / Contraseña: aetheria2024</p>
      </div>
    </div>
  );
}
