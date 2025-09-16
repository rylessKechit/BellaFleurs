// src/contexts/CartContext.tsx - Version améliorée
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface CartContextType {
  cartCount: number;
  isLoading: boolean;
  incrementCartCount: (quantity?: number) => void;
  decrementCartCount: (quantity?: number) => void;
  clearCartCount: () => void;
  updateCartCount: () => Promise<void>;
  forceRefresh: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fonction pour récupérer le nombre d'articles dans le panier
  const updateCartCount = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      
      const response = await fetch('/api/cart', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store' // Force le refresh
      });

      if (response.ok) {
        const data = await response.json();
        
        // Calculer le nombre total d'articles
        let totalItems = 0;
        if (data.success && data.data && data.data.items && Array.isArray(data.data.items)) {
          totalItems = data.data.items.reduce((sum: number, item: any) => {
            // S'assurer que quantity est un nombre valide
            const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
            return sum + quantity;
          }, 0);
        }
        
        // Mettre à jour le compteur
        setCartCount(Math.max(0, totalItems));
        
        console.log('🛒 Cart count updated:', totalItems);
        
      } else if (response.status === 404) {
        // Panier non trouvé = panier vide
        setCartCount(0);
      } else {
        console.warn('Erreur lors de la récupération du panier:', response.status);
        // En cas d'erreur, ne pas modifier le compteur existant
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du panier:', error);
      // En cas d'erreur réseau, garder le compteur actuel
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  // Version avec refresh forcé
  const forceRefresh = useCallback(async () => {
    await updateCartCount(false);
  }, [updateCartCount]);

  // Incrémenter le compteur localement (optimiste)
  const incrementCartCount = useCallback((quantity: number = 1) => {
    setCartCount(prev => {
      const newCount = Math.max(0, prev + quantity);
      console.log('🛒 Cart count incremented:', prev, '→', newCount);
      return newCount;
    });
  }, []);

  // Décrémenter le compteur localement (optimiste)
  const decrementCartCount = useCallback((quantity: number = 1) => {
    setCartCount(prev => {
      const newCount = Math.max(0, prev - quantity);
      console.log('🛒 Cart count decremented:', prev, '→', newCount);
      return newCount;
    });
  }, []);

  // Vider le compteur
  const clearCartCount = useCallback(() => {
    setCartCount(0);
    console.log('🛒 Cart cleared');
  }, []);

  // Synchroniser périodiquement (toutes les 30 secondes)
  useEffect(() => {
    const interval = setInterval(() => {
      updateCartCount(true); // Silent refresh
    }, 30000);

    return () => clearInterval(interval);
  }, [updateCartCount]);

  // Synchroniser quand l'onglet redevient actif
  useEffect(() => {
    const handleFocus = () => {
      updateCartCount(true);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateCartCount(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [updateCartCount]);

  // Charger le panier au montage
  useEffect(() => {
    updateCartCount();
  }, [updateCartCount]);

  return (
    <CartContext.Provider value={{
      cartCount,
      isLoading,
      incrementCartCount,
      decrementCartCount,
      clearCartCount,
      updateCartCount,
      forceRefresh
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}