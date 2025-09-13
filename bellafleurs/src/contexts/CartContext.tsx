'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartContextType {
  cartCount: number;
  incrementCartCount: (quantity?: number) => void;
  decrementCartCount: (quantity?: number) => void;
  clearCartCount: () => void;
  updateCartCount: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartCount, setCartCount] = useState(0);

  // Récupérer le nombre d'articles dans le panier
  const updateCartCount = async () => {
    try {
      const response = await fetch('/api/cart', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const totalItems = data.data.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
        setCartCount(totalItems);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du panier:', error);
    }
  };

  // Incrémenter le compteur localement
  const incrementCartCount = (quantity: number = 1) => {
    setCartCount(prev => prev + quantity);
  };

  // Décrémenter le compteur localement
  const decrementCartCount = (quantity: number = 1) => {
    setCartCount(prev => Math.max(0, prev - quantity));
  };

  // Vider le compteur
  const clearCartCount = () => {
    setCartCount(0);
  };

  // Charger le panier au montage
  useEffect(() => {
    updateCartCount();
  }, []);

  return (
    <CartContext.Provider value={{
      cartCount,
      incrementCartCount,
      decrementCartCount,
      clearCartCount,
      updateCartCount
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