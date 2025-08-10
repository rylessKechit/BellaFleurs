'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingCart, LogIn, User, LogOut, Package, Settings } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const { isAuthenticated, user, logout } = useAuth();

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
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Fonction pour obtenir les initiales
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  // Composant Avatar utilisateur
  const UserAvatar = ({ isMobile = false }: { isMobile?: boolean }) => {
    if (!isAuthenticated || !user) {
      return (
        <Button
          variant="ghost"
          size={isMobile ? "sm" : "icon"}
          asChild
          className={isMobile ? "justify-start" : ""}
        >
          <Link href="/auth/signin" className="flex items-center">
            <User className="w-5 h-5" />
            {isMobile && <span className="ml-2">Se connecter</span>}
          </Link>
        </Button>
      );
    }

    const initials = getInitials(user.name);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={`relative ${isMobile ? 'justify-start w-full h-10' : 'w-10 h-10'} rounded-full p-0`}
          >
            <div className={`${isMobile ? 'w-8 h-8 mr-2' : 'w-8 h-8'} bg-green-100 rounded-full flex items-center justify-center text-green-700 text-sm font-medium`}>
              {initials}
            </div>
            {isMobile && <span className="ml-1">{user.name}</span>}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild>
            <Link href="/mon-compte" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              Mon compte
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/mes-commandes" className="flex items-center">
              <Package className="mr-2 h-4 w-4" />
              Mes commandes
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={logout} className="flex items-center text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            Se déconnecter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b'
          : 'bg-white/90 backdrop-blur-sm'
      }`}
    >
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

          {/* DIV 2: Logo CENTRÉ */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent hover:from-green-700 hover:to-green-800 transition-all duration-300 whitespace-nowrap"
            >
              Bella Fleurs
            </Link>
          </div>

          {/* DIV 3: Actions à DROITE */}
          <div className="flex items-center space-x-3">
            {/* Panier - toujours visible */}
            <Button variant="ghost" size="icon" asChild>
              <Link href="/panier" className="relative">
                <ShoppingCart className="w-5 h-5" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-green-500 text-white">
                  0
                </Badge>
              </Link>
            </Button>

            {/* Menu utilisateur - Desktop & Mobile */}
            <div className="hidden sm:block">
              <UserAvatar />
            </div>

            {/* Menu utilisateur mobile - affiché seulement sur mobile */}
            <div className="sm:hidden">
              <UserAvatar isMobile />
            </div>

            {/* Authentification desktop - affichée seulement si écran >= 1920px ET non connecté */}
            {isLargeScreen && !isAuthenticated && (
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
              {/* Navigation links */}
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
              
              {/* Auth mobile - seulement si non connecté */}
              {!isAuthenticated && (
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
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}