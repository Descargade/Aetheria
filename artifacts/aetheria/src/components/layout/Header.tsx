import { Link } from "wouter";
import { ShoppingBag, Heart, Menu, Moon, Sun, ChevronDown, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useSession } from "@/hooks/use-session";
import { useAuth } from "@/hooks/use-auth";
import { useGetCart, useGetFavorites, useGetCategories, getGetCartQueryKey, getGetFavoritesQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SearchBar } from "@/components/layout/SearchBar";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { RegisterDialog } from "@/components/auth/RegisterDialog";

export function Header({ checkoutMode = false }: { checkoutMode?: boolean }) {
  const { theme, setTheme } = useTheme();
  const { sessionId } = useSession();
  const { user, logout, login, register } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const { data: cart } = useGetCart({ sessionId }, { query: { enabled: !!sessionId, queryKey: getGetCartQueryKey({ sessionId }) } });
  const { data: favorites } = useGetFavorites({ sessionId }, { query: { enabled: !!sessionId, queryKey: getGetFavoritesQueryKey({ sessionId }) } });
  const { data: categories } = useGetCategories();

  const cartItemsCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const favoritesCount = favorites?.length || 0;

  if (checkoutMode) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-center">
          <Link href="/">
            <span className="font-sans font-bold text-2xl tracking-tighter cursor-pointer hover:text-primary transition-colors">Aᴇᴛʜᴇʀɪᴀ</span>
          </Link>
        </div>
      </header>
    );
  }

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
                  <span className="font-sans font-bold text-2xl tracking-tighter text-primary">Aᴇᴛʜᴇʀɪᴀ</span>
                </Link>
                <nav className="flex flex-col gap-4">
                  <Link href="/tienda" className="text-lg font-medium transition-colors hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                    Colección
                  </Link>
                  <Link href="/tienda?onSale=true" className="text-lg font-medium transition-colors hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                    Sale
                  </Link>
                  <div>
                    <button onClick={() => setIsCategoriesOpen(!isCategoriesOpen)} className="flex items-center gap-2 text-lg font-medium transition-colors hover:text-primary w-full text-left">
                      Categorías
                      <ChevronDown className={`h-4 w-4 transition-transform ${isCategoriesOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isCategoriesOpen && categories && (
                      <div className="flex flex-col gap-2 pl-4 mt-2 border-l border-border">
                        {categories.filter((c) => c.active).map((c) => (
                          <Link key={c.id} href={`/tienda?categoryId=${c.id}`} className="text-base text-muted-foreground transition-colors hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                            {c.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                  <Link href="/contacto" className="text-lg font-medium transition-colors hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                    Contacto
                  </Link>
                  <div>
                    <button onClick={() => { setIsMobileMenuOpen(false); setShowLogin(true); }} className="text-lg font-medium transition-colors hover:text-primary w-full text-left">
                      {user ? "Mi cuenta" : "Iniciar sesión"}
                    </button>
                    {user && (
                      <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary w-full text-left mt-2">
                        Cerrar sesión
                      </button>
                    )}
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/">
            <span className="font-sans font-bold text-xl tracking-tighter cursor-pointer hover:text-primary transition-colors">Aᴇᴛʜᴇʀɪᴀ</span>
          </Link>
        </div>

        {/* Desktop Logo */}
        <Link href="/" className="hidden md:block">
          <span className="font-sans font-bold text-2xl tracking-tighter cursor-pointer hover:text-primary transition-colors">Aᴇᴛʜᴇʀɪᴀ</span>
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
          <div className="relative group">
            <span className="flex items-center gap-1 cursor-pointer transition-colors hover:text-primary">
              Categorías
              <ChevronDown className="h-3 w-3" />
            </span>
            <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[180px]">
              <div className="bg-background border border-border shadow-lg p-2 flex flex-col gap-1">
                {categories?.filter((c) => c.active).map((c) => (
                  <Link key={c.id} href={`/tienda?categoryId=${c.id}`} className="px-3 py-2 text-sm font-mono text-foreground/80 hover:text-primary hover:bg-muted transition-colors">
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <Link href="/contacto" className="transition-colors hover:text-primary relative group">
            <span>Contacto</span>
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all group-hover:w-full"></span>
          </Link>

          {/* CUENTA dropdown */}
          <div className="relative group">
            <span className="flex items-center gap-1 cursor-pointer transition-colors hover:text-primary">
              <User className="h-4 w-4" />
              <span>Cuenta</span>
              <ChevronDown className="h-3 w-3" />
            </span>
            <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[180px]">
              <div className="bg-background border border-border shadow-lg p-2 flex flex-col gap-1">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-sm font-mono text-muted-foreground border-b border-border mb-1">
                      {user.firstName ?? user.email}
                    </div>
                    <button onClick={() => { logout(); }} className="px-3 py-2 text-sm font-mono text-foreground/80 hover:text-primary hover:bg-muted transition-colors text-left flex items-center gap-2">
                      <LogOut className="h-3 w-3" /> Cerrar sesión
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setShowLogin(true)} className="px-3 py-2 text-sm font-mono text-foreground/80 hover:text-primary hover:bg-muted transition-colors text-left">
                      Iniciar sesión
                    </button>
                    <button onClick={() => setShowRegister(true)} className="px-3 py-2 text-sm font-mono text-foreground/80 hover:text-primary hover:bg-muted transition-colors text-left">
                      Crear cuenta
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
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

      <LoginDialog open={showLogin} onOpenChange={setShowLogin} onLogin={login} onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }} />
      <RegisterDialog open={showRegister} onOpenChange={setShowRegister} onRegister={register} onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }} />
    </header>
  );
}
