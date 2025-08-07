'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingCart, LogIn } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const navigation = [
  { name: 'Accueil', href: '/' },
  { name: 'À propos', href: '/#apropos' },
  { name: 'Savoir-faire', href: '/#savoir-faire' },
  { name: 'Mes créations', href: '/produits' },
  { name: 'Événements', href: '/#evenements' },
  { name: 'Abonnement', href: '/abonnement' },
  { name: 'Contact', href: '/#contact' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Gestion du breakpoint 1920px
  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1920);
    };
    
    // Check initial
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b'
          : 'bg-white/90 backdrop-blur-sm'
      }`}
    >
      {/* Container principal avec largeur maximale */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 w-full">
          
          {/* DIV 1: Navigation à GAUCHE */}
          <div className="flex items-center">
            {/* Menu hamburger - affiché quand écran < 1920px */}
            {!isLargeScreen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            )}

            {/* Navigation desktop - affichée seulement si écran >= 1920px */}
            {isLargeScreen && (
              <nav className="flex items-center space-x-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative px-2 py-1 text-sm font-medium transition-colors duration-200 ${
                      pathname === item.href
                        ? 'text-green-600'
                        : 'text-gray-700 hover:text-green-600'
                    } after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-green-600 after:transition-all after:duration-300 ${
                      pathname === item.href ? 'after:w-full' : 'after:w-0 hover:after:w-full'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            )}
          </div>

          {/* DIV 2: Logo CENTRÉ - Position absolue pour rester au centre */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent hover:from-green-700 hover:to-green-800 transition-all duration-300 whitespace-nowrap"
            >
              Bella Fleurs
            </Link>
          </div>

          {/* DIV 3: Actions à DROITE */}
          <div className="flex items-center space-x-4">
            {/* Panier - toujours visible */}
            <Button variant="ghost" size="icon" asChild>
              <Link href="/panier" className="relative">
                <ShoppingCart className="w-5 h-5" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-green-500 text-white">
                  0
                </Badge>
              </Link>
            </Button>

            {/* Authentification - affichée seulement si écran >= 1920px */}
            {isLargeScreen && (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/signin" className="flex items-center">
                    <LogIn className="w-4 h-4 mr-2" />
                    Connexion
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/signup">
                    S'inscrire
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Menu mobile - visible si écran < 1920px */}
        {!isLargeScreen && mobileMenuOpen && (
          <div className="border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 text-base font-medium rounded-lg transition-colors duration-200 ${
                    pathname === item.href
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Auth mobile */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                    <LogIn className="w-5 h-5 mr-3" />
                    Connexion
                  </Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                    S'inscrire
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}