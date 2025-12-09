'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingCart, LogIn, User, LogOut, Package, Settings, BarChart3 } from 'lucide-react';
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
import { useCart } from '@/contexts/CartContext';

// 🎄 Bannière de Noël avec bouton fermeture unique
function ChristmasHeaderNotice() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="
      bg-gradient-to-r from-emerald-500 via-red-400 to-emerald-500
      text-white
      px-4 py-3 text-center
      shadow-md relative overflow-hidden
    ">
      {/* Plus de flocons et emojis de Noël */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Flocons plus nombreux et plus gros */}
        <div className="absolute top-0.5 left-8 text-white opacity-60 text-lg animate-pulse">❄</div>
        <div className="absolute top-2 left-16 text-white opacity-50 text-base animate-pulse" style={{ animationDelay: '0.5s' }}>❄</div>
        <div className="absolute top-1 left-24 text-white opacity-70 text-lg animate-pulse" style={{ animationDelay: '1s' }}>❄</div>
        <div className="absolute top-2.5 left-32 text-white opacity-40 text-sm animate-pulse" style={{ animationDelay: '1.5s' }}>❄</div>
        <div className="absolute top-0.5 left-40 text-white opacity-60 text-base animate-pulse" style={{ animationDelay: '2s' }}>❄</div>
        
        <div className="absolute top-1 right-8 text-white opacity-60 text-lg animate-pulse" style={{ animationDelay: '0.3s' }}>❄</div>
        <div className="absolute top-2 right-16 text-white opacity-50 text-base animate-pulse" style={{ animationDelay: '0.8s' }}>❄</div>
        <div className="absolute top-0.5 right-24 text-white opacity-70 text-lg animate-pulse" style={{ animationDelay: '1.3s' }}>❄</div>
        <div className="absolute top-2.5 right-32 text-white opacity-40 text-sm animate-pulse" style={{ animationDelay: '1.8s' }}>❄</div>
        <div className="absolute top-1 right-40 text-white opacity-60 text-base animate-pulse" style={{ animationDelay: '2.3s' }}>❄</div>
        
        {/* Flocons centraux */}
        <div className="absolute top-0.5 left-1/3 text-white opacity-50 text-base animate-pulse" style={{ animationDelay: '2.5s' }}>❄</div>
        <div className="absolute top-2 left-2/3 text-white opacity-60 text-lg animate-pulse" style={{ animationDelay: '3s' }}>❄</div>
        
        {/* Emojis de Noël supplémentaires */}
        <div className="absolute top-1 left-6 text-yellow-200 opacity-70 text-sm animate-pulse" style={{ animationDelay: '3.5s' }}>⭐</div>
        <div className="absolute top-2.5 right-6 text-yellow-200 opacity-70 text-sm animate-pulse" style={{ animationDelay: '4s' }}>⭐</div>
        <div className="absolute top-1.5 left-1/4 text-red-200 opacity-60 text-xs animate-pulse" style={{ animationDelay: '4.5s' }}>🎀</div>
        <div className="absolute top-1.5 right-1/4 text-red-200 opacity-60 text-xs animate-pulse" style={{ animationDelay: '5s' }}>🎀</div>
      </div>

      {/* Contenu centré comme le header */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative">
          {/* Version desktop */}
          <div className="hidden sm:flex items-center justify-center space-x-4">
            <span className="text-yellow-100 text-base">🎄</span>
            
            <div className="text-center">
              <span className="font-semibold text-base">
                <span className="text-yellow-50">Notre selection pour Nöel</span>
                <span className="mx-2">•</span>
                <span className="text-green-50">Livraison gratuite</span>
              </span>
              <div className="text-sm text-green-50 opacity-90">
                jusqu'au 31 décembre
              </div>
            </div>
            
            <a 
              href="/produits?category=Nöel"
              className="
                px-4 py-2 
                bg-white bg-opacity-15 hover:bg-opacity-25 
                text-white font-semibold rounded-full
                border border-white border-opacity-30
                hover:scale-105 transition-all duration-200
                backdrop-blur-sm
                text-sm
              "
            >
              🎁 Découvrir
            </a>
            
            <span className="text-yellow-100 text-base">🔔</span>
          </div>

          {/* Version mobile */}
          <div className="sm:hidden flex items-center justify-between">
            <span className="text-yellow-100 text-sm">🎄</span>
            
            <div className="flex-1 text-center">
              <div className="font-semibold text-sm">
                <span className="text-yellow-50">Notre sélection Nöel</span>
              </div>
              <div className="text-xs text-green-50 opacity-90">
                Livraison gratuite
              </div>
            </div>
            
            <a 
              href="/produits"
              className="
                px-3 py-1.5 
                bg-white bg-opacity-15 
                text-white font-semibold rounded-full
                text-xs
              "
            >
              🎁
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook pour vérifier le statut du shop
function useShopStatus() {
  const [status, setStatus] = useState({
    isOpen: true,
    isClosed: false,
    reason: '',
    message: '',
    startDate: '',
    endDate: '',
    loading: true
  });

  useEffect(() => {
    async function checkStatus() {
      try {
        const response = await fetch('/api/shop/status');
        const result = await response.json();
        
        if (result.success) {
          setStatus({
            ...result.data,
            loading: false
          });
        } else {
          setStatus({
            isOpen: true,
            loading: false,
            isClosed: false,
            reason: '',
            message: '',
            startDate: '',
            endDate: ''
          });
        }
      } catch (error) {
        console.error('Erreur vérification statut:', error);
        setStatus({
          isOpen: true,
          loading: false,
          isClosed: false,
          reason: '',
          message: '',
          startDate: '',
          endDate: ''
        });
      }
    }

    checkStatus();
  }, []);

  return status;
}

const navigation = [
  { name: 'Accueil', href: '/' },
  { name: 'À propos', href: '/a-propos' },
  { name: 'Savoir-faire', href: '/savoir-faire' },
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
  const shopStatus = useShopStatus();

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

  // Composant Avatar utilisateur - AVEC LOGIQUE ADMIN AJOUTÉE
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
            {/* Masquer le texte sur très petits écrans (< 400px) pour éviter la superposition */}
            {isMobile && <span className="ml-2 hidden xs:inline">Se connecter</span>}
          </Link>
        </Button>
      );
    }

    const initials = getInitials(user.name);
    const isAdmin = user.role === 'admin';

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={`relative ${isMobile ? 'justify-start w-full h-10' : 'w-10 h-10'} rounded-full p-0`}
          >
            <div className={`${isMobile ? 'w-8 h-8 mr-2' : 'w-8 h-8'} ${isAdmin ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700'} rounded-full flex items-center justify-center text-sm font-medium`}>
              {isAdmin ? <Settings className="w-4 h-4" /> : initials}
            </div>
            {/* Masquer le nom d'utilisateur sur très petits écrans */}
            {isMobile && <span className="ml-1 hidden xs:inline">{user.name}</span>}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              {isAdmin && <p className="text-xs leading-none text-green-600">Administrateur</p>}
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          {/* MENU ADMIN */}
          {isAdmin ? (
            <>
              <DropdownMenuItem asChild>
                <Link href="/admin/dashboard" className="flex items-center">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Dashboard Admin
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href="/admin/produits" className="flex items-center">
                  <Package className="mr-2 h-4 w-4" />
                  Gestion Produits
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href="/admin/commandes" className="flex items-center">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Gestion Commandes
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem asChild>
                <Link href="/" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Voir le site client
                </Link>
              </DropdownMenuItem>
            </>
          ) : (
            /* MENU CLIENT */
            <>
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
            </>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={logout} className="flex items-center text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            Se déconnecter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const { cartCount } = useCart();

  return (
    <>
      <div className="fixed top-0 w-full z-50">
        {/* 🎄 Bannière de Noël avec bouton unique */}
        <ChristmasHeaderNotice />

        {/* Bannière de fermeture si nécessaire */}
        {!shopStatus.loading && shopStatus.isClosed && (
          <div className="bg-orange-500 text-white text-center py-2 px-4 text-sm font-medium">
            <span className="inline-block mr-2">🏪</span>
            Boutique fermée jusqu'au {new Date(shopStatus.endDate!).toLocaleDateString('fr-FR')} - {shopStatus.reason}
          </div>
        )}

        {/* Header principal */}
        <header
          className={`w-full transition-all duration-300 ${
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

              <div className="absolute left-1/2 transform -translate-x-1/2">
                <Link
                  href="/"
                  className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent hover:from-green-700 hover:to-green-800 transition-all duration-300 whitespace-nowrap"
                  style={{ fontFamily: "'Lucida Calligraphy', cursive" }}
                >
                  BellaFleurs
                </Link>
              </div>

              {/* DIV 3: Actions à DROITE */}
              <div className="flex items-center space-x-3">
                {/* Panier - toujours visible SAUF pour les admins */}
                {user?.role !== 'admin' && (
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/panier" className="relative">
                      <ShoppingCart className="w-5 h-5" />
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-green-500 text-white">
                        {cartCount}
                      </Badge>
                    </Link>
                  </Button>
                )}

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
      </div>
      <div className="h-24" />
    </>
  );
}