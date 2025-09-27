// src/contexts/CartContext.tsx - Fichier complet
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface CartContextType {
  cartCount: number;
  isLoading: boolean;
  incrementCartCount: (quantity?: number) => void;
  decrementCartCount: (quantity?: number) => void;
  setCartCount: (count: number) => void;
  setCartCountFromAPI: (count: number) => void;
  clearCartCount: () => void;
  updateCartCount: (silent?: boolean) => Promise<void>;
  forceRefresh: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartCount, setCartCountState] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fonction pour récupérer le nombre d'articles dans le panier
  const updateCartCount = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      
      const response = await fetch('/api/cart', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        
        // Calculer le nombre total d'articles
        let totalItems = 0;
        if (data.success && data.data && data.data.cart && Array.isArray(data.data.cart.items)) {
          totalItems = data.data.cart.items.reduce((sum: number, item: any) => {
            const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
            return sum + quantity;
          }, 0);
        }
        
        setCartCountState(Math.max(0, totalItems));
        console.log('🛒 Cart count updated from API:', totalItems);
        
      } else if (response.status === 404) {
        setCartCountState(0);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du panier:', error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  // Version avec refresh forcé
  const forceRefresh = useCallback(async () => {
    await updateCartCount(false);
  }, [updateCartCount]);

  // ✅ Incrémentation optimiste immédiate
  const incrementCartCount = useCallback((quantity: number = 1) => {
    setCartCountState(prev => {
      const newCount = Math.max(0, prev + quantity);
      console.log('🛒 Cart count incremented (optimistic):', prev, '→', newCount);
      return newCount;
    });
  }, []);

  // ✅ Décrémentation optimiste immédiate
  const decrementCartCount = useCallback((quantity: number = 1) => {
    setCartCountState(prev => {
      const newCount = Math.max(0, prev - quantity);
      console.log('🛒 Cart count decremented (optimistic):', prev, '→', newCount);
      return newCount;
    });
  }, []);

  // ✅ Setter direct pour mise à jour manuelle
  const setCartCount = useCallback((count: number) => {
    setCartCountState(Math.max(0, count));
    console.log('🛒 Cart count set manually:', count);
  }, []);

  // ✅ Setter spécifique pour les retours API
  const setCartCountFromAPI = useCallback((count: number) => {
    const finalCount = Math.max(0, count);
    console.log('🛒 Setting cart count from API:', finalCount);
    setCartCountState(finalCount);
  }, []);

  // Vider le compteur
  const clearCartCount = useCallback(() => {
    setCartCountState(0);
    console.log('🛒 Cart cleared');
  }, []);

  // Synchronisation périodique (moins fréquente)
  useEffect(() => {
    const interval = setInterval(() => {
      updateCartCount(true); // Silent sync toutes les 60 secondes
    }, 60000);

    return () => clearInterval(interval);
  }, [updateCartCount]);

  // Sync quand l'onglet redevient actif
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateCartCount(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [updateCartCount]);

  // Charger le panier au montage
  useEffect(() => {
    updateCartCount(true); // Silent au démarrage
  }, [updateCartCount]);

  return (
    <CartContext.Provider value={{
      cartCount,
      isLoading,
      incrementCartCount,
      decrementCartCount,
      setCartCount,
      setCartCountFromAPI,
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