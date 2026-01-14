// src/components/layout/UserAvatarCorporate.tsx - Menu adapté pour les comptes corporate
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  LogOut, 
  LogIn,
  Settings,
  Package,
  BarChart3,
  ShoppingCart,
  Building2,
  FileText,
  Euro
} from 'lucide-react';
import { toast } from 'sonner';

interface UserAvatarProps {
  isMobile?: boolean;
}

export default function UserAvatarCorporate({ isMobile = false }: UserAvatarProps) {
  const { data: session, status } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ redirect: true, callbackUrl: '/' });
      toast.success('Déconnexion réussie');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  // Si pas connecté
  if (status === 'loading') {
    return (
      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
    );
  }

  if (!session?.user) {
    return (
      <Button
        variant="ghost"
        size={isMobile ? "sm" : "icon"}
        asChild
        className={isMobile ? "justify-start w-full" : ""}
      >
        <Link href="/auth/signin" className="flex items-center">
          <User className="w-4 h-4" />
          {isMobile && <span className="ml-2">Connexion</span>}
        </Link>
      </Button>
    );
  }

  const user = session.user;
  const isCorporate = user.accountType === 'corporate';
  const isAdmin = user.role === 'admin';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-full border-2 border-gray-200 hover:border-green-300 transition-colors"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || undefined} alt={user.name} />
            <AvatarFallback className="bg-green-100 text-green-700 text-sm font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            
            {/* Badge pour identifier le type de compte */}
            <div className="flex items-center space-x-2 mt-2">
              {isCorporate && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                  <Building2 className="w-3 h-3" />
                  <span>{user.company?.name}</span>
                </div>
              )}
              {isAdmin && (
                <div className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium">
                  Admin
                </div>
              )}
            </div>
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
        ) : isCorporate ? (
          /* MENU CORPORATE */
          <>
            <DropdownMenuItem asChild>
              <Link href="/corporate/dashboard" className="flex items-center">
                <BarChart3 className="mr-2 h-4 w-4" />
                Dashboard Corporate
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link href="/corporate/orders" className="flex items-center">
                <Package className="mr-2 h-4 w-4" />
                Mes commandes
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link href="/corporate/invoices" className="flex items-center">
                <Euro className="mr-2 h-4 w-4" />
                Mes factures
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link href="/corporate/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </Link>
            </DropdownMenuItem>
          </>
        ) : (
          /* MENU CLIENT INDIVIDUEL */
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
        
        <DropdownMenuItem 
          onClick={handleLogout} 
          disabled={isLoggingOut}
          className="flex items-center text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isLoggingOut ? 'Déconnexion...' : 'Se déconnecter'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}