// src/components/admin/AdminLayout.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Bell,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/hooks/useAuth';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: BarChart3,
    current: false,
  },
  {
    name: 'Produits',
    href: '/admin/produits',
    icon: Package,
    current: false,
    badge: '45'
  },
  {
    name: 'Commandes',
    href: '/admin/commandes',
    icon: ShoppingCart,
    current: false,
    badge: '12'
  },
  {
    name: 'Clients',
    href: '/admin/clients',
    icon: Users,
    current: false,
  },
  {
    name: 'Paramètres',
    href: '/admin/parametres',
    icon: Settings,
    current: false,
  }
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Mettre à jour l'état current des liens de navigation
  const navigationWithCurrent = navigation.map(item => ({
    ...item,
    current: pathname === item.href
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Sidebar mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
            <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-gray-200">
              <Link href="/admin/dashboard" className="text-xl font-bold text-primary-600">
                Bella Fleurs Admin
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <nav className="flex flex-1 flex-col p-4">
              <ul className="space-y-1">
                {navigationWithCurrent.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          item.current
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <div className="flex items-center">
                          <Icon className="mr-3 h-5 w-5" />
                          {item.name}
                        </div>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              
              {/* Lien retour au site */}
              <div className="mt-auto pt-4 border-t border-gray-200">
                <Link
                  href="/"
                  className="group flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  <Home className="mr-3 h-5 w-5" />
                  Retour au site
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Sidebar desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6">
          
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <Link href="/admin/dashboard" className="text-xl font-bold text-primary-600">
              Bella Fleurs Admin
            </Link>
          </div>
          
          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="space-y-1">
                  {navigationWithCurrent.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            item.current
                              ? 'bg-primary-100 text-primary-700'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <div className="flex items-center">
                            <Icon className="mr-3 h-5 w-5" />
                            {item.name}
                          </div>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
              
              {/* Section du bas */}
              <li className="mt-auto border-t border-gray-200 pt-4">
                <Link
                  href="/"
                  className="group flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  <Home className="mr-3 h-5 w-5" />
                  Retour au site
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="lg:pl-72">
        
        {/* Header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          
          {/* Bouton menu mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Séparateur */}
          <div className="h-6 w-px bg-gray-200 lg:hidden" />

          {/* Barre de recherche */}
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1 items-center">
              <Search className="pointer-events-none absolute left-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher produits, commandes, clients..."
                className="pl-10 w-full max-w-lg"
              />
            </div>
          </div>

          {/* Actions header */}
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500">
                3
              </Badge>
            </Button>

            {/* Séparateur */}
            <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />

            {/* Profil utilisateur */}
            <div className="flex items-center space-x-3">
              <div className="hidden lg:block text-right">
                <div className="text-sm font-medium text-gray-900">
                  {user?.name || 'Admin'}
                </div>
                <div className="text-xs text-gray-500">
                  Administrateur
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-700">
                    {user?.name?.charAt(0) || 'A'}
                  </span>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={logout}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu de la page */}
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}