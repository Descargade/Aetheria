import { useState } from "react";
import { X, Mail, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

type LoginForm = z.infer<typeof loginSchema>;

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToRegister: () => void;
}

export function LoginDialog({ open, onOpenChange, onSwitchToRegister }: LoginDialogProps) {
  const { login, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast({ title: "¡Bienvenido!", description: "Has iniciado sesión correctamente" });
      onOpenChange(false);
      form.reset();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al iniciar sesión";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-none bg-background border-border">
        <DialogHeader className="pb-4">
          <DialogTitle className="font-sans font-bold text-2xl tracking-tighter">Iniciar sesión</DialogTitle>
          <DialogDescription className="font-mono text-xs text-muted-foreground">
            Ingresá tus datos para acceder a tu cuenta
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-xs uppercase tracking-widest">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type="email"
                        className="rounded-none h-12 font-mono pl-10 bg-background border-border"
                        placeholder="tu@email.com"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-xs uppercase tracking-widest">Contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type="password"
                        className="rounded-none h-12 font-mono pl-10 bg-background border-border"
                        placeholder="••••••••"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full h-12 rounded-none font-mono uppercase tracking-widest bg-primary text-white hover:bg-primary/80 border-none" disabled={isLoading || authLoading}>
              {isLoading || authLoading ? "Ingresando..." : "Iniciar sesión"}
            </Button>
            <p className="text-center font-mono text-xs text-muted-foreground">
              ¿No tenés cuenta? <Button variant="ghost" className="text-primary hover:underline p-0" onClick={onSwitchToRegister}>Crear una</Button>
            </p>
          </form>
        </Form>
        <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="absolute top-4 right-4">
          <X className="h-4 w-4" />
        </Button>
      </DialogContent>
    </Dialog>
  );
}