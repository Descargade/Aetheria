import { Link } from "wouter";
import { ShoppingBag, Heart, Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useSession } from "@/hooks/use-session";
import { useGetCart, useGetFavorites, getGetCartQueryKey, getGetFavoritesQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SearchBar } from "@/components/layout/SearchBar";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { sessionId } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Queries for badges
  const { data: cart } = useGetCart({ sessionId }, { query: { enabled: !!sessionId, queryKey: getGetCartQueryKey({ sessionId }) } });
  const { data: favorites } = useGetFavorites({ sessionId }, { query: { enabled: !!sessionId, queryKey: getGetFavoritesQueryKey({ sessionId }) } });

  const cartItemsCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const favoritesCount = favorites?.length || 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        
        {/* Mobile Menu & Logo */}
        <div className="flex items-center gap-4 md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-background border-r border-border">
              <div className="flex flex-col gap-6 py-6">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="font-sans font-bold text-2xl tracking-tighter text-primary">AETHERIA</span>
                </Link>
                <nav className="flex flex-col gap-4">
                  <Link href="/tienda" className="text-lg font-medium transition-colors hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                    Colección
                  </Link>
                  <Link href="/tienda?onSale=true" className="text-lg font-medium transition-colors hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                    Sale
                  </Link>
                  <Link href="/contacto" className="text-lg font-medium transition-colors hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                    Contacto
                  </Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/">
            <span className="font-sans font-bold text-xl tracking-tighter cursor-pointer hover:text-primary transition-colors">ÆTHERIA</span>
          </Link>
        </div>

        {/* Desktop Logo */}
        <Link href="/" className="hidden md:block">
          <span className="font-sans font-bold text-2xl tracking-tighter cursor-pointer hover:text-primary transition-colors">ÆTHERIA</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/tienda" className="transition-colors hover:text-primary relative group">
            <span>Colección</span>
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all group-hover:w-full"></span>
          </Link>
          <Link href="/tienda?onSale=true" className="transition-colors hover:text-primary relative group">
            <span>Sale</span>
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all group-hover:w-full"></span>
          </Link>
          <Link href="/contacto" className="transition-colors hover:text-primary relative group">
            <span>Contacto</span>
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all group-hover:w-full"></span>
          </Link>
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:block">
            <SearchBar />
          </div>

          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Link href="/favoritos">
            <Button variant="ghost" size="icon" className="relative">
              <Heart className="h-5 w-5" />
              {favoritesCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
              )}
              <span className="sr-only">Favoritos</span>
            </Button>
          </Link>

          <Link href="/carrito">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
              <span className="sr-only">Carrito</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}