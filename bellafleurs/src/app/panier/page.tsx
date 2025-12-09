// ================================
// CORRIGER src/app/panier/page.tsx
// ================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

interface CartItem {
  _id?: string;
  product: string | { _id: string }; // ✅ CORRECTION : Peut être string ou objet
  name: string;
  price: number;
  quantity: number;
  image: string;
  addedAt: Date;
  variantId?: string;
  variantName?: string;
  customPrice?: number;
  freeDelivery?: boolean; // ← AJOUT POUR LIVRAISON GRATUITE
}

interface Cart {
  _id: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

export default function CartPage() {
  const router = useRouter();
  const { setCartCountFromAPI } = useCart();
  
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCart();
  }, []);

  // ✅ NOUVELLE FONCTION : Extraire l'ID du produit de manière sécurisée
  const getProductId = (product: string | { _id: string }): string => {
    if (typeof product === 'string') {
      return product;
    } else if (product && typeof product === 'object' && product._id) {
      return product._id;
    } else {
      console.error('❌ Invalid product format:', product);
      return '';
    }
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cart', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setCart(data.data.cart);
        if (data.data.cart) {
          setCartCountFromAPI(data.data.cart.totalItems || 0);
        }
      } else {
        console.error('Erreur chargement panier');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement du panier');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productItem: string | { _id: string }, newQuantity: number, variantId?: string) => {
    // ✅ CORRECTION : Extraire l'ID du produit
    const productId = getProductId(productItem);
    const itemKey = variantId ? `${productId}_${variantId}` : productId;
    
    if (newQuantity < 1 || newQuantity > 50) return;
    
    setUpdatingItems(prev => new Set(prev).add(itemKey));
    
    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productId, // ✅ MAINTENANT C'EST UN STRING
          quantity: newQuantity,
          variantId
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        setCart(data.data.cart);
        
        // ✅ CORRECTION : Vérifier et utiliser cartItemsCount de l'API
        if (data.data?.cartItemsCount !== undefined) {
          setCartCountFromAPI(data.data.cartItemsCount);
        } else if (data.data?.cart) {
          // ✅ FALLBACK : Calculer depuis le cart si cartItemsCount manque
          setCartCountFromAPI(data.data.cart.totalItems || 0);
        }
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setUpdatingItems(prev => {
        const updated = new Set(prev);
        updated.delete(itemKey);
        return updated;
      });
    }
  };

  const removeItem = async (productItem: string | { _id: string }, variantId?: string) => {
    // ✅ CORRECTION : Extraire l'ID du produit
    const productId = getProductId(productItem);
    const itemKey = variantId ? `${productId}_${variantId}` : productId;
    
    setUpdatingItems(prev => new Set(prev).add(itemKey));
    
    try {
      const params = new URLSearchParams({ productId }); // ✅ MAINTENANT C'EST UN STRING
      if (variantId) params.append('variantId', variantId);
      
      const response = await fetch(`/api/cart?${params}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        
        setCart(data.data.cart);
        
        if (data.data.cartItemsCount !== undefined) {
          setCartCountFromAPI(data.data.cartItemsCount);
        }
        
        toast.success('Produit supprimé du panier');
      } else {
        const errorData = await response.json();
        console.error('❌ Frontend: Error response:', errorData);
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('❌ Frontend: Network error:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setUpdatingItems(prev => {
        const updated = new Set(prev);
        updated.delete(itemKey);
        return updated;
      });
    }
  };

  const clearCart = async () => {
    try {
      const response = await fetch('/api/cart?clearAll=true', {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data.data.cart);
        setCartCountFromAPI(0);
        toast.success('Panier vidé');
      } else {
        toast.error('Erreur lors du vidage du panier');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du vidage du panier');
    }
  };

  // ✅ MODIFICATION : Calcul des frais avec prise en compte de freeDelivery
  const hasFreeDeliveryItem = cart?.items.some(item => item.freeDelivery) || false;
  const deliveryFee = (hasFreeDeliveryItem || (cart && cart.totalAmount >= 50)) ? 0 : 5.00;
  const finalTotal = cart ? cart.totalAmount + deliveryFee : 0;
  const isUpdating = updatingItems.size > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p>Chargement du panier...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary-600">
                Accueil
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                </svg>
                <span className="text-sm font-medium text-gray-500">Panier</span>
              </div>
            </li>
          </ol>
        </nav>

        {cart && cart.items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Votre panier ({cart.totalItems} article{cart.totalItems > 1 ? 's' : ''})</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearCart}
                    disabled={isUpdating}
                  >
                    Vider le panier
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {cart.items.map((item, index) => {
                    // ✅ CORRECTION : Extraire l'ID du produit pour la clé
                    const productId = getProductId(item.product);
                    const itemKey = item.variantId ? `${productId}_${item.variantId}` : productId;
                    const isItemUpdating = updatingItems.has(itemKey);
                    
                    return (
                      <div key={itemKey}>
                        <div className="flex items-start space-x-4">
                          <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                              src={item.image || '/api/placeholder/80/80'}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-900">{item.name}</h3>
                                {item.variantName && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    Taille: {item.variantName}
                                  </p>
                                )}
                                {/* ✅ AJOUT : Badge livraison gratuite */}
                                {item.freeDelivery && (
                                  <div className="mt-2">
                                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                                      🚚 Livraison gratuite
                                    </Badge>
                                  </div>
                                )}
                                <p className="text-lg font-semibold text-primary-600 mt-2">
                                  {item.price.toFixed(2)} € <span className="text-sm text-gray-500">/ unité</span>
                                </p>
                              </div>

                              <div className="flex flex-col sm:items-end gap-3">
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateQuantity(item.product, item.quantity - 1, item.variantId)}
                                    disabled={item.quantity <= 1 || isItemUpdating}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  
                                  <span className="w-12 text-center font-medium">
                                    {isItemUpdating ? '...' : item.quantity}
                                  </span>
                                  
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateQuantity(item.product, item.quantity + 1, item.variantId)}
                                    disabled={item.quantity >= 50 || isItemUpdating}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>

                                <div className="flex items-center gap-4">
                                  <p className="font-semibold text-lg">
                                    {(item.price * item.quantity).toFixed(2)} €
                                  </p>
                                  
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeItem(item.product, item.variantId)}
                                    disabled={isItemUpdating}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {index < cart.items.length - 1 && <Separator className="mt-6" />}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Résumé de la commande</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Sous-total</span>
                      <span>{cart.totalAmount.toFixed(2)} €</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Livraison</span>
                      <span>
                        {deliveryFee === 0 ? (
                          <Badge variant="secondary">Gratuite</Badge>
                        ) : (
                          `${deliveryFee.toFixed(2)} €`
                        )}
                      </span>
                    </div>
                    
                    {/* ✅ MODIFICATION : Message pour livraison gratuite */}
                    {deliveryFee === 0 ? (
                      hasFreeDeliveryItem ? (
                        <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                          <Truck className="w-4 h-4 inline mr-2" />
                          Livraison gratuite grâce à un produit éligible dans votre panier
                        </div>
                      ) : (
                        <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                          <Truck className="w-4 h-4 inline mr-2" />
                          Livraison gratuite (commande ≥ 50€)
                        </div>
                      )
                    ) : (
                      <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                        <Truck className="w-4 h-4 inline mr-2" />
                        Livraison gratuite dès 50€ d'achat
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-primary-600">{finalTotal.toFixed(2)} €</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => router.push('/checkout')}
                    disabled={isUpdating}
                  >
                    Passer la commande
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Votre panier est vide
            </h2>
            <p className="text-gray-600 mb-6">
              Découvrez nos magnifiques créations florales
            </p>
            <Button asChild>
              <Link href="/produits">
                Voir nos produits
              </Link>
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}