import { useState } from "react";
import { X, Mail, Lock, User, Phone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

interface RegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin: () => void;
}

export function RegisterDialog({ open, onOpenChange, onSwitchToLogin }: RegisterDialogProps) {
  const { register: userRegister, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", firstName: "", lastName: "", phone: "" },
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await userRegister(data);
      toast({ title: "¡Cuenta creada!", description: "Tu cuenta fue creada correctamente" });
      onOpenChange(false);
      form.reset();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al registrarse";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-none bg-background border-border">
        <DialogHeader className="pb-4">
          <DialogTitle className="font-sans font-bold text-2xl tracking-tighter">Crear cuenta</DialogTitle>
          <DialogDescription className="font-mono text-xs text-muted-foreground">
            Completá tus datos para registrarte (opcional para comprar)
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem><FormLabel className="font-mono text-xs uppercase tracking-widest">Nombre</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input {...field} className="rounded-none h-12 font-mono pl-10 bg-background border-border" placeholder="Nombre" />
                    </div>
                  </FormControl><FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem><FormLabel className="font-mono text-xs uppercase tracking-widest">Apellido</FormLabel>
                  <FormControl><Input {...field} className="rounded-none h-12 font-mono bg-background border-border" placeholder="Apellido" /></FormControl><FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem><FormLabel className="font-mono text-xs uppercase tracking-widest">Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input {...field} type="email" className="rounded-none h-12 font-mono pl-10 bg-background border-border" placeholder="tu@email.com" />
                  </div>
                </FormControl><FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem><FormLabel className="font-mono text-xs uppercase tracking-widest">Contraseña</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input {...field} type="password" className="rounded-none h-12 font-mono pl-10 bg-background border-border" placeholder="Mínimo 6 caracteres" />
                  </div>
                </FormControl><FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem><FormLabel className="font-mono text-xs uppercase tracking-widest">Teléfono</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input {...field} className="rounded-none h-12 font-mono pl-10 bg-background border-border" placeholder="+54 11 1234-5678" />
                  </div>
                </FormControl><FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full h-12 rounded-none font-mono uppercase tracking-widest bg-primary text-white hover:bg-primary/80 border-none" disabled={isLoading || authLoading}>
              {isLoading || authLoading ? "Creando..." : "Crear cuenta"}
            </Button>
            <p className="text-center font-mono text-xs text-muted-foreground">
              ¿Ya tenés cuenta? <Button variant="ghost" className="text-primary hover:underline p-0" onClick={onSwitchToLogin}>Iniciar sesión</Button>
            </p>
            <p className="text-center font-mono text-[10px] text-muted-foreground/50">
              No es obligatorio tener cuenta para comprar
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