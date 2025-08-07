'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingCart, User, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

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
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-white/90 backdrop-blur-sm'
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
                      ? 'text-primary-600'
                      : 'text-gray-700 hover:text-primary-600'
                  }
                  after:absolute after:bottom-0 after:left-0 after:h-0.5 
                  after:bg-gradient-to-r after:from-primary-600 after:to-primary-700
                  after:transition-all after:duration-300
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
            <Link
              href="/panier"
              className="relative p-2 text-gray-700 hover:text-primary-600 
                       transition-colors duration-200"
            >
              <ShoppingCart className="w-6 h-6" />
              {/* Badge du panier (à implémenter avec le contexte panier) */}
              <span className="absolute -top-1 -right-1 bg-primary-600 text-white 
                             text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </Link>

            {/* Menu utilisateur */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 rounded-lg 
                                 text-gray-700 hover:text-primary-600 hover:bg-primary-50
                                 transition-all duration-200">
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium">{user?.name}</span>
                </button>
                
                {/* Menu déroulant */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg 
                              border border-gray-200 opacity-0 invisible group-hover:opacity-100 
                              group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <Link
                      href="/mon-compte"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 
                               hover:text-primary-600 transition-colors duration-200"
                    >
                      Mon compte
                    </Link>
                    <Link
                      href="/mes-commandes"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 
                               hover:text-primary-600 transition-colors duration-200"
                    >
                      Mes commandes
                    </Link>
                    {isAdmin && (
                      <>
                        <div className="border-t border-gray-200 my-1"></div>
                        <Link
                          href="/admin/dashboard"
                          className="block px-4 py-2 text-sm text-primary-600 hover:bg-primary-50
                                   font-medium transition-colors duration-200"
                        >
                          Administration
                        </Link>
                      </>
                    )}
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 
                               hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4 inline-block mr-2" />
                      Déconnexion
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/signin"
                  className="btn btn-ghost btn-sm"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Connexion
                </Link>
                <Link
                  href="/auth/signup"
                  className="btn btn-primary btn-sm"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>

          {/* Bouton menu mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-primary-600 
                     transition-colors duration-200"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleMobileNavClick}
                className={`block px-3 py-2 text-base font-medium rounded-lg transition-colors duration-200
                  ${
                    pathname === item.href
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                  }`}
              >
                {item.name}
              </Link>
            ))}
            
            <div className="border-t border-gray-200 mt-4 pt-4">
              <Link
                href="/panier"
                onClick={handleMobileNavClick}
                className="flex items-center px-3 py-2 text-base font-medium 
                         text-gray-700 hover:text-primary-600 hover:bg-primary-50
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
                             text-gray-700 hover:text-primary-600 hover:bg-primary-50
                             rounded-lg transition-colors duration-200"
                  >
                    <User className="w-5 h-5 mr-3" />
                    Mon compte
                  </Link>
                  <Link
                    href="/mes-commandes"
                    onClick={handleMobileNavClick}
                    className="flex items-center px-3 py-2 text-base font-medium 
                             text-gray-700 hover:text-primary-600 hover:bg-primary-50
                             rounded-lg transition-colors duration-200"
                  >
                    Mes commandes
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      onClick={handleMobileNavClick}
                      className="flex items-center px-3 py-2 text-base font-medium 
                               text-primary-600 hover:bg-primary-50
                               rounded-lg transition-colors duration-200"
                    >
                      Administration
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      handleMobileNavClick();
                    }}
                    className="flex items-center w-full px-3 py-2 text-base font-medium 
                             text-gray-700 hover:text-red-600 hover:bg-red-50
                             rounded-lg transition-colors duration-200"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Déconnexion
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/auth/signin"
                    onClick={handleMobileNavClick}
                    className="flex items-center px-3 py-2 text-base font-medium 
                             text-gray-700 hover:text-primary-600 hover:bg-primary-50
                             rounded-lg transition-colors duration-200"
                  >
                    <LogIn className="w-5 h-5 mr-3" />
                    Connexion
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={handleMobileNavClick}
                    className="block px-3 py-2 text-base font-medium text-center
                             bg-gradient-to-r from-primary-600 to-primary-700 
                             text-white rounded-lg hover:from-primary-700 hover:to-primary-800
                             transition-all duration-200"
                  >
                    S'inscrire
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}