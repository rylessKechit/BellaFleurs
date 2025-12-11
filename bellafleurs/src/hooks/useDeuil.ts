// Hook pour détecter et gérer les produits de catégorie "Deuil"
import { IProduct } from '@/types/index';
import { useMemo } from 'react';

interface CartItem {
  _id?: string;
  product: IProduct; // ✅ Ajouter le champ product
  name: string;
  price: number;
  quantity: number;
  image: string;
  addedAt: Date;
  isActive: boolean;
  variantId?: string;
  variantName?: string;
  customPrice?: number;
  freeDelivery?: boolean;
}

interface UseDeuilReturn {
  hasDeuil: boolean;
  deuilProducts: CartItem[];
  isDeuilOnly: boolean;
  hasMixedCategories: boolean;
}

export function useDeuil(cartItems: CartItem[]): UseDeuilReturn {
  return useMemo(() => {
    // Identifier les produits de catégorie "Deuil"
    const deuilProducts = cartItems.filter(item => {
        console.log('Vérification deuil pour le produit:', item);
      // Le produit peut être populé ou juste un ID
      const productCategory = typeof item.product === 'object' 
        ? item.product?.category 
        : null;

    console.log('Vérification deuil pour le produit:', item.name, 'Catégorie:', productCategory);
      
      // Vérifier aussi dans le nom du produit si la catégorie n'est pas disponible
      const nameContainsDeuil = item.name?.toLowerCase().includes('deuil') || 
                               item.name?.toLowerCase().includes('funéraire') ||
                               item.name?.toLowerCase().includes('obsèques');
      
      return productCategory === 'Deuil' || nameContainsDeuil;
    });
    
    const hasDeuil = deuilProducts.length > 0;
    const isDeuilOnly = hasDeuil && deuilProducts.length === cartItems.length;
    const hasMixedCategories = hasDeuil && deuilProducts.length < cartItems.length;
    
    return {
      hasDeuil,
      deuilProducts,
      isDeuilOnly,
      hasMixedCategories
    };
  }, [cartItems]);
}