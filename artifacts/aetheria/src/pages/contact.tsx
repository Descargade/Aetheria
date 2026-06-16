import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle, Instagram } from "lucide-react";

export function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    window.location.href = `mailto:solsaldena@gmail.com?subject=Consulta de ${encodeURIComponent(name)}&body=${encodeURIComponent(message)}%0A%0A${encodeURIComponent(email)}`;
    setSent(true);
  };

  const handleWhatsApp = () => {
    if (!name || !message) return;
    const text = encodeURIComponent(`Hola AETHERIA! Soy ${name}.\n\n${message}`);
    window.open(`https://wa.me/5492622607729?text=${text}`, "_blank");
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-24 max-w-4xl">
      <div className="mb-16">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase mb-4">Contacto_</h1>
        <p className="font-mono text-muted-foreground">Estamos para ayudarte. Escribinos y te respondemos a la brevedad.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        {/* Form */}
        <form onSubmit={handleEmail} className="space-y-6">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Nombre</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre completo" required
              className="rounded-none h-12 font-mono bg-background border-border" data-testid="input-contact-name" />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="tu@email.com" required
              className="rounded-none h-12 font-mono bg-background border-border" data-testid="input-contact-email" />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Mensaje</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} required placeholder="Contanos en qué podemos ayudarte..."
              className="w-full font-mono text-sm bg-background border border-border px-3 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              data-testid="textarea-contact-message" />
          </div>

          {sent && <p className="text-primary font-mono text-sm">Mensaje preparado. Si no se abrió tu cliente de email, envialo manualmente a solsaldena@gmail.com</p>}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="submit" className="flex-1 h-12 rounded-none font-mono uppercase tracking-widest bg-primary text-white hover:bg-primary/80 border-none"
              data-testid="button-send-email">
              <Send className="h-4 w-4 mr-2" />Enviar por email
            </Button>
            <Button type="button" variant="outline" onClick={handleWhatsApp}
              className="flex-1 h-12 rounded-none font-mono uppercase tracking-widest border-border hover:border-[#25D366] hover:text-[#25D366]"
              data-testid="button-send-whatsapp">
              <MessageCircle className="h-4 w-4 mr-2" />WhatsApp
            </Button>
          </div>
        </form>

        {/* Info */}
        <div className="space-y-10">
          <div>
            <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4 border-b border-border pb-3">Dónde encontrarnos</h2>
            <p className="font-mono text-sm text-foreground leading-relaxed">Buenos Aires, Argentina<br />Atención online: Lun — Vie, 10 a 18hs</p>
          </div>
          <div>
            <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4 border-b border-border pb-3">Contacto directo</h2>
            <p className="font-mono text-sm text-muted-foreground">Email: solsaldena@gmail.com</p>
            <p className="font-mono text-sm text-muted-foreground mt-1">WhatsApp: +54 9 2622607729</p>
          </div>
          <div>
            <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4 border-b border-border pb-3">Redes sociales</h2>
            <a href="https://instagram.com/aetheria_arg" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 font-mono text-sm text-foreground hover:text-primary transition-colors group"
              data-testid="link-instagram">
              <div className="h-10 w-10 border border-border flex items-center justify-center group-hover:border-primary transition-colors">
                <Instagram className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold uppercase tracking-wider">Instagram</p>
                <p className="text-xs text-muted-foreground">@aetheria_arg</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
