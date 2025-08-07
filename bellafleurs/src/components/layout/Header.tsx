'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingCart, User, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const navigation = [
  { name: 'Accueil', href: '/' },
  { name: 'À propos', href: '/#apropos' },
  { name: 'Savoir-faire', href: '/#savoir-faire' },
  { name: 'Galerie', href: '/#galerie' },
  { name: 'Événements', href: '/#evenements' },
  { name: 'Produits', href: '/produits' },
  { name: 'Contact', href: '/#contact' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();

  // Gestion du scroll pour l'effet de transparence
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer le menu mobile lors du changement de route
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Fermer le menu mobile en cliquant sur un lien
  const handleMobileNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-md shadow-lg border-b'
          : 'bg-background/90 backdrop-blur-sm'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 
                     bg-clip-text text-transparent hover:from-primary-700 hover:to-primary-800
                     transition-all duration-300"
          >
            Bella Fleurs
          </Link>

          {/* Navigation desktop */}
          <div className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200
                  ${
                    pathname === item.href
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-primary'
                  }
                  after:absolute after:bottom-0 after:left-0 after:h-0.5 
                  after:bg-primary after:transition-all after:duration-300
                  ${
                    pathname === item.href
                      ? 'after:w-full'
                      : 'after:w-0 hover:after:w-full'
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Actions desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Panier */}
            <Button variant="ghost" size="icon" asChild>
              <Link href="/panier" className="relative">
                <ShoppingCart className="w-5 h-5" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  0
                </Badge>
              </Link>
            </Button>

            {/* Menu utilisateur */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/mon-compte">Mon compte</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/mes-commandes">Mes commandes</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin/dashboard" className="text-primary font-medium">
                          Administration
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/signin">
                    <LogIn className="w-4 h-4 mr-2" />
                    Connexion
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/signup">S'inscrire</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Bouton menu mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleMobileNavClick}
                className={`block px-3 py-2 text-base font-medium rounded-lg transition-colors duration-200
                  ${
                    pathname === item.href
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-primary hover:bg-accent'
                  }`}
              >
                {item.name}
              </Link>
            ))}
            
            <div className="border-t pt-4 space-y-2">
              <Link
                href="/panier"
                onClick={handleMobileNavClick}
                className="flex items-center px-3 py-2 text-base font-medium 
                         text-muted-foreground hover:text-primary hover:bg-accent
                         rounded-lg transition-colors duration-200"
              >
                <ShoppingCart className="w-5 h-5 mr-3" />
                Panier (0)
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link
                    href="/mon-compte"
                    onClick={handleMobileNavClick}
                    className="flex items-center px-3 py-2 text-base font-medium 
                             text-muted-foreground hover:text-primary hover:bg-accent
                             rounded-lg transition-colors duration-200"
                  >
                    <User className="w-5 h-5 mr-3" />
                    Mon compte
                  </Link>
                  <Link
                    href="/mes-commandes"
                    onClick={handleMobileNavClick}
                    className="flex items-center px-3 py-2 text-base font-medium 
                             text-muted-foreground hover:text-primary hover:bg-accent
                             rounded-lg transition-colors duration-200"
                  >
                    Mes commandes
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      onClick={handleMobileNavClick}
                      className="flex items-center px-3 py-2 text-base font-medium 
                               text-primary hover:bg-accent rounded-lg transition-colors duration-200"
                    >
                      Administration
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => {
                      logout();
                      handleMobileNavClick();
                    }}
                    className="flex items-center w-full justify-start px-3 py-2 text-base font-medium 
                             text-destructive hover:bg-destructive/10 rounded-lg transition-colors duration-200"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Déconnexion
                  </Button>
                </>
              ) : (
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/auth/signin" onClick={handleMobileNavClick}>
                      <LogIn className="w-5 h-5 mr-3" />
                      Connexion
                    </Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link href="/auth/signup" onClick={handleMobileNavClick}>
                      S'inscrire
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}