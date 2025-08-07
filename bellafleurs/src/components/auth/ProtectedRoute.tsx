'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  fallback?: ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requireAuth = false,
  requireAdmin = false,
  fallback = <div>Chargement...</div>,
  redirectTo
}: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  // Affichage du loading
  if (isLoading) {
    return <>{fallback}</>;
  }

  // Vérification de l'authentification
  if (requireAuth && !isAuthenticated) {
    const redirectUrl = redirectTo || '/auth/signin';
    router.push(redirectUrl);
    return <>{fallback}</>;
  }

  // Vérification des droits admin
  if (requireAdmin && (!isAuthenticated || !isAdmin)) {
    const redirectUrl = redirectTo || '/auth/signin?error=AccessDenied';
    router.push(redirectUrl);
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Composant spécialisé pour les routes admin
export function AdminRoute({ 
  children, 
  fallback = <div>Vérification des permissions...</div> 
}: { 
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <ProtectedRoute 
      requireAdmin 
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
}

// Composant spécialisé pour les routes utilisateur
export function AuthRoute({ 
  children, 
  fallback = <div>Connexion en cours...</div> 
}: { 
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <ProtectedRoute 
      requireAuth 
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
}