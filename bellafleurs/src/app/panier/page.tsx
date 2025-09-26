'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Truck } from 'lucide-react';
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
  product: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  addedAt: Date;
  variantId?: string;
  variantName?: string;
  customPrice?: number;
}

interface Cart {
  _id: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

export default function CartPage() {
  const router = useRouter();
  const { incrementCartCount } = useCart();
  
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  // Charger le panier
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cart', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setCart(data.data.cart);
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

  // Mettre à jour la quantité
  const updateQuantity = async (productId: string, newQuantity: number, variantId?: string) => {
    const itemKey = variantId ? `${productId}_${variantId}` : productId;
    
    if (newQuantity < 1 || newQuantity > 50) return;
    
    setUpdatingItems(prev => new Set(prev).add(itemKey));
    
    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productId,
          quantity: newQuantity,
          variantId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data.data.cart);
        incrementCartCount();
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

  // Supprimer un item
  const removeItem = async (productId: string, variantId?: string) => {
    const itemKey = variantId ? `${productId}_${variantId}` : productId;
    setUpdatingItems(prev => new Set(prev).add(itemKey));
    
    try {
      const params = new URLSearchParams({ productId });
      if (variantId) params.append('variantId', variantId);
      
      const response = await fetch(`/api/cart?${params}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data.data.cart);
        incrementCartCount();
        toast.success('Produit supprimé du panier');
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setUpdatingItems(prev => {
        const updated = new Set(prev);
        updated.delete(itemKey);
        return updated;
      });
    }
  };

  // Vider le panier
  const clearCart = async () => {
    try {
      const response = await fetch('/api/cart?clearAll=true', {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data.data.cart);
        incrementCartCount();
        toast.success('Panier vidé');
      } else {
        toast.error('Erreur lors du vidage du panier');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du vidage du panier');
    }
  };

  // Calculer les frais de livraison
  const deliveryFee = cart && cart.totalAmount >= 50 ? 0 : 5.99;
  const finalTotal = cart ? cart.totalAmount + deliveryFee : 0;

  // Loading state
  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du panier...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* En-tête */}
          <div className="mb-8">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continuer mes achats
            </Button>
            
            <h1 className="text-3xl font-bold text-gray-900">Mon panier</h1>
            {cart && cart.items.length > 0 && (
              <p className="text-gray-600 mt-2">
                {cart.totalItems} article{cart.totalItems > 1 ? 's' : ''} dans votre panier
              </p>
            )}
          </div>

          {/* Contenu du panier */}
          {!cart || cart.items.length === 0 ? (
            // Panier vide
            <div className="text-center py-16">
              <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Votre panier est vide</h2>
              <p className="text-gray-600 mb-8">
                Découvrez nos magnifiques créations florales et ajoutez-les à votre panier
              </p>
              <Button asChild size="lg">
                <Link href="/produits">
                  Découvrir nos produits
                </Link>
              </Button>
            </div>
          ) : (
            // Panier avec articles
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Liste des articles - 2/3 */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Articles ({cart.totalItems})</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={clearCart}
                      className="text-red-600 hover:text-red-700"
                    >
                      Vider le panier
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {cart.items.map((item, index) => {
                      const itemKey = item.variantId ? `${item.product}_${item.variantId}` : item.product;
                      const isUpdating = updatingItems.has(itemKey);
                      
                      return (
                        <div key={index}>
                          <div className="flex gap-4">
                            {/* Image */}
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={item.image || '/api/placeholder/100/100'}
                                alt={item.name}
                                width={100}
                                height={100}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/api/placeholder/100/100';
                                }}
                              />
                            </div>

                            {/* Informations */}
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                              {item.variantName && (
                                <p className="text-sm text-gray-600 mt-1">Taille: {item.variantName}</p>
                              )}
                              {item.customPrice && (
                                <p className="text-sm text-green-600 mt-1 font-medium">Budget personnalisé</p>
                              )}
                              <p className="text-sm text-gray-500 mt-2">
                                Prix unitaire: {item.price.toFixed(2)} €
                              </p>

                              {/* Contrôles quantité - Mobile et Desktop */}
                              <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateQuantity(item.product, item.quantity - 1, item.variantId)}
                                    disabled={item.quantity <= 1 || isUpdating}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  
                                  <span className="font-medium min-w-[3rem] text-center">
                                    {isUpdating ? '...' : item.quantity}
                                  </span>
                                  
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateQuantity(item.product, item.quantity + 1, item.variantId)}
                                    disabled={item.quantity >= 50 || isUpdating}
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
                                    disabled={isUpdating}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
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

              {/* Résumé - 1/3 */}
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
                            <span className="text-green-600 font-medium">Gratuite</span>
                          ) : (
                            `${deliveryFee.toFixed(2)} €`
                          )}
                        </span>
                      </div>
                      
                      {deliveryFee === 0 && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <Truck className="w-4 h-4" />
                          <span>Livraison gratuite dès 50€</span>
                        </div>
                      )}
                      
                      {cart.totalAmount < 50 && (
                        <div className="text-sm text-gray-600">
                          Encore {(50 - cart.totalAmount).toFixed(2)} € pour la livraison gratuite
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{finalTotal.toFixed(2)} €</span>
                    </div>

                    <Button 
                      asChild 
                      size="lg" 
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Link href="/checkout">
                        Procéder au paiement
                      </Link>
                    </Button>

                    <div className="text-center">
                      <Button variant="link" asChild>
                        <Link href="/produits">
                          Continuer mes achats
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Informations livraison */}
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Truck className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-sm">Livraison</p>
                          <p className="text-xs text-gray-600">
                            {deliveryFee === 0 ? 'Gratuite' : 'À partir de 5,99€'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-600">
                        <p>• Livraison en région parisienne</p>
                        <p>• Fraîcheur garantie 48h</p>
                        <p>• Livraison gratuite dès 50€</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Produits recommandés */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Vous pourriez aussi aimer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-600 mb-4">
                        Découvrez nos autres créations florales
                      </p>
                      <Button variant="outline" asChild size="sm">
                        <Link href="/produits">
                          Voir tous nos produits
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}