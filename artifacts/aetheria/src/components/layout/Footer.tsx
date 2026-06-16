import { Link } from "wouter";

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
          <h4 className="font-semibold text-sm tracking-widest uppercase text-foreground">Soporte</h4>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            <li><Link href="/contacto" className="hover:text-primary transition-colors">Contacto</Link></li>
            <li><span className="cursor-pointer hover:text-primary transition-colors">Envíos y Devoluciones</span></li>
            <li><span className="cursor-pointer hover:text-primary transition-colors">Guía de Talles</span></li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-semibold text-sm tracking-widest uppercase text-foreground">Social</h4>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            <li><a href="https://instagram.com/aetheria_arg" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">@aetheria_arg</a></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 md:px-8 mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-mono">
        <p>© {new Date().getFullYear()} Aᴇᴛʜᴇʀɪᴀ. Todos los derechos reservados.</p>
        <div className="flex gap-4">
          <span className="cursor-pointer hover:text-foreground transition-colors">Términos</span>
          <span className="cursor-pointer hover:text-foreground transition-colors">Privacidad</span>
        </div>
      </div>
    </footer>
  );
}