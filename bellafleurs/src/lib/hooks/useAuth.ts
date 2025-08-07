'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'admin';
  image?: string;
}

export interface UseAuthReturn {
  // État de l'authentification
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isClient: boolean;
  
  // Actions d'authentification
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<boolean>;
  
  // Navigation protégée
  requireAuth: (callback?: () => void) => void;
  requireAdmin: (callback?: () => void) => void;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
}

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = session?.user || null;
  const isLoading = status === 'loading' || isSubmitting;
  const isAuthenticated = !!session && !!user;
  const isAdmin = user?.role === 'admin';
  const isClient = user?.role === 'client';

  // Connexion
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsSubmitting(true);
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        toast.error('Email ou mot de passe incorrect');
        return false;
      }

      if (result?.ok) {
        toast.success('Connexion réussie !');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Erreur lors de la connexion');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Déconnexion
  const logout = async (): Promise<void> => {
    try {
      await signOut({ 
        redirect: true,
        callbackUrl: '/'
      });
      toast.success('Déconnexion réussie');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  // Inscription
  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          // Afficher les erreurs de validation
          data.errors.forEach((error: any) => {
            toast.error(`${error.field}: ${error.message}`);
          });
        } else {
          toast.error(data.error?.message || 'Erreur lors de la création du compte');
        }
        return false;
      }

      toast.success(data.data.message || 'Compte créé avec succès !');
      return true;

    } catch (error) {
      console.error('Register error:', error);
      toast.error('Erreur lors de la création du compte');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Vérifier l'authentification avant d'exécuter une action
  const requireAuth = (callback?: () => void) => {
    if (!isAuthenticated) {
      toast.error('Vous devez être connecté pour effectuer cette action');
      router.push('/auth/signin');
      return;
    }
    
    if (callback) {
      callback();
    }
  };

  // Vérifier les droits admin avant d'exécuter une action
  const requireAdmin = (callback?: () => void) => {
    if (!isAuthenticated) {
      toast.error('Vous devez être connecté');
      router.push('/auth/signin');
      return;
    }
    
    if (!isAdmin) {
      toast.error('Accès refusé - Droits administrateur requis');
      router.push('/');
      return;
    }
    
    if (callback) {
      callback();
    }
  };

  return {
    // État
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    isClient,
    
    // Actions
    login,
    logout,
    register,
    
    // Helpers
    requireAuth,
    requireAdmin,
  };
}

// Hook pour récupérer uniquement l'utilisateur
export function useUser() {
  const { user, isLoading } = useAuth();
  return { user, isLoading };
}

// Hook pour les actions admin
export function useAdminAuth() {
  const { isAdmin, isLoading, requireAdmin } = useAuth();
  return { isAdmin, isLoading, requireAdmin };
}