import { Link } from "wouter";
import { Mail, Truck, CreditCard, Building2, Banknote } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
        <div className="flex flex-col gap-4">
          <Link href="/">
            <span className="font-sans font-bold text-3xl tracking-tighter">Aᴇᴛʜᴇʀɪᴀ</span>
          </Link>
          <p className="text-muted-foreground text-sm font-mono mt-2">
            Futuristic minimalism. Dark aesthetic. Electric precision.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-semibold text-sm tracking-widest uppercase text-foreground">Explorar</h4>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            <li><Link href="/tienda" className="hover:text-primary transition-colors">Colección Completa</Link></li>
            <li><Link href="/tienda?isNew=true" className="hover:text-primary transition-colors">Nuevos Ingresos</Link></li>
            <li><Link href="/tienda?onSale=true" className="hover:text-primary transition-colors">Sale</Link></li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-semibold text-sm tracking-widest uppercase text-foreground">Contacto</h4>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Mail className="h-3 w-3" /> solsaldena@gmail.com</li>
            <li><Link href="/contacto" className="hover:text-primary transition-colors">Formulario de contacto</Link></li>
          </ul>
          <h4 className="font-semibold text-sm tracking-widest uppercase text-foreground mt-2">Medios de pago</h4>
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1 bg-muted/50 border border-border px-2 py-1 text-xs font-mono"><CreditCard className="h-3 w-3" /> Visa</span>
            <span className="flex items-center gap-1 bg-muted/50 border border-border px-2 py-1 text-xs font-mono"><CreditCard className="h-3 w-3" /> Mastercard</span>
            <span className="flex items-center gap-1 bg-muted/50 border border-border px-2 py-1 text-xs font-mono"><Banknote className="h-3 w-3" /> MP</span>
            <span className="flex items-center gap-1 bg-muted/50 border border-border px-2 py-1 text-xs font-mono"><Building2 className="h-3 w-3" /> Transferencia</span>
          </div>
          <h4 className="font-semibold text-sm tracking-widest uppercase text-foreground mt-2">Medios de envío</h4>
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1 bg-muted/50 border border-border px-2 py-1 text-xs font-mono"><Truck className="h-3 w-3" /> Correo Argentino</span>
            <span className="flex items-center gap-1 bg-muted/50 border border-border px-2 py-1 text-xs font-mono"><Truck className="h-3 w-3" /> Andreani</span>
            <span className="flex items-center gap-1 bg-muted/50 border border-border px-2 py-1 text-xs font-mono"><Truck className="h-3 w-3" /> OCA</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-semibold text-sm tracking-widest uppercase text-foreground">Legal</h4>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            <li><span className="cursor-pointer hover:text-primary transition-colors">Términos y Condiciones</span></li>
            <li><span className="cursor-pointer hover:text-primary transition-colors">Política de Privacidad</span></li>
            <li><span className="cursor-pointer hover:text-primary transition-colors">Botón de arrepentimiento</span></li>
            <li><span className="cursor-pointer hover:text-primary transition-colors">Guía de Talles</span></li>
          </ul>
          <h4 className="font-semibold text-sm tracking-widest uppercase text-foreground mt-2">Social</h4>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            <li><a href="https://instagram.com/aetheria_arg" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">@aetheria_arg</a></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 md:px-8 mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-mono">
        <p>© {new Date().getFullYear()} Aᴇᴛʜᴇʀɪᴀ. Todos los derechos reservados.</p>
        <p className="text-[10px] text-muted-foreground/50">Tienda creada con ❤️</p>
      </div>
    </footer>
  );
}