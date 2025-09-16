// src/app/panier/page.tsx - Page panier optimisée responsive
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight,
  ArrowLeft,
  Truck,
  Gift,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  isActive: boolean;
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<string[]>([]);

  // Charger le panier
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.data.items || []);
      } else {
        throw new Error('Erreur lors du chargement du panier');
      }
    } catch (error) {
      console.error('Erreur panier:', error);
      toast.error('Erreur lors du chargement du panier');
    } finally {
      setIsLoading(false);
    }
  };

  const { decrementCartCount, clearCartCount } = useCart();

  // Mettre à jour la quantité
  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdatingItems(prev => [...prev, productId]);

    try {
      const response = await fetch(`/api/cart/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (response.ok) {
        setCartItems(prev => 
          prev.map(item => 
            item._id === productId 
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
        toast.success('Quantité mise à jour');
      } else {
        const data = await response.json();
        throw new Error(data.error?.message || 'Erreur lors de la mise à jour');
      }
    } catch (error: any) {
      console.error('Erreur mise à jour:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour');
    } finally {
      setUpdatingItems(prev => prev.filter(id => id !== productId));
    }
  };

  // Supprimer un produit
  const removeItem = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;

    setUpdatingItems(prev => [...prev, productId]);

    try {
      const response = await fetch(`/api/cart/${productId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setCartItems(prev => prev.filter(item => item._id !== productId));
        decrementCartCount();
        toast.success('Article supprimé du panier');
      } else {
        const data = await response.json();
        throw new Error(data.error?.message || 'Erreur lors de la suppression');
      }
    } catch (error: any) {
      console.error('Erreur suppression:', error);
      toast.error(error.message || 'Erreur lors de la suppression');
    } finally {
      setUpdatingItems(prev => prev.filter(id => id !== productId));
    }
  };

  // Vider le panier
  const clearCart = async () => {
    if (!confirm('Êtes-vous sûr de vouloir vider votre panier ?')) return;

    try {
      const response = await fetch('/api/cart/clear', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        setCartItems([]);
        clearCartCount();
        toast.success('Panier vidé');
      } else {
        throw new Error('Erreur lors du vidage du panier');
      }
    } catch (error) {
      console.error('Erreur vidage panier:', error);
      toast.error('Erreur lors du vidage du panier');
    }
  };

  // Calculs
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 50 ? 0 : 10;
  const total = subtotal + shipping;

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du panier...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {/* Header responsive */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mon panier</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                {totalItems > 0 
                  ? `${totalItems} article${totalItems > 1 ? 's' : ''} dans votre panier`
                  : 'Votre panier est vide'
                }
              </p>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => router.push('/produits')}
              className="flex items-center w-full sm:w-auto justify-center sm:justify-start"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continuer les achats
            </Button>
          </div>

          {cartItems.length === 0 ? (
            // Panier vide
            <Card className="text-center py-12 sm:py-16">
              <CardContent>
                <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Votre panier est vide
                </h2>
                <p className="text-gray-600 mb-6">
                  Découvrez nos magnifiques créations florales
                </p>
                <Button onClick={() => router.push('/produits')} size="lg">
                  Découvrir nos produits
                </Button>
              </CardContent>
            </Card>
          ) : (
            // Panier avec articles
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              
              {/* Articles du panier */}
              <div className="lg:col-span-2 space-y-4">
                
                {/* Action vider panier */}
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Vider le panier
                  </Button>
                </div>

                {cartItems.map((item) => (
                  <Card key={item._id}>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row gap-4">
                        
                        {/* Image produit */}
                        <div className="flex-shrink-0 mx-auto sm:mx-0">
                          <Image
                            src={item.image || '/placeholder-product.jpg'}
                            alt={item.name}
                            width={120}
                            height={120}
                            className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 object-cover rounded-lg"
                            sizes="(max-width: 640px) 80px, (max-width: 1024px) 96px, 112px"
                          />
                        </div>

                        {/* Informations produit */}
                        <div className="flex-1 min-w-0 text-center sm:text-left">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                            {item.name}
                          </h3>
                          <p className="text-lg font-bold text-green-600 mb-3">
                            {item.price.toFixed(2)} € <span className="text-sm font-normal text-gray-500">/ unité</span>
                          </p>
                          
                          {/* Stock warning */}
                          {!item.isActive && (
                            <div className="flex items-center gap-2 text-orange-600 mb-3 justify-center sm:justify-start">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="text-sm">Produit plus disponible</span>
                            </div>
                          )}

                          {/* Contrôles quantité et suppression */}
                          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                            {/* Sélecteur quantité */}
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                disabled={item.quantity <= 1 || updatingItems.includes(item._id)}
                                className="px-2 sm:px-3"
                              >
                                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              <span className="px-3 sm:px-4 py-2 text-center min-w-[3rem] text-sm sm:text-base">
                                {updatingItems.includes(item._id) ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mx-auto" />
                                ) : (
                                  item.quantity
                                )}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                disabled={updatingItems.includes(item._id)}
                                className="px-2 sm:px-3"
                              >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </div>

                            {/* Prix total et suppression */}
                            <div className="flex items-center gap-3 sm:gap-4">
                              <p className="font-bold text-gray-900 text-base sm:text-lg">
                                {(item.price * item.quantity).toFixed(2)} €
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeItem(item._id)}
                                disabled={updatingItems.includes(item._id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Récapitulatif commande - Sticky sur desktop */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-24">
                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
                        Récapitulatif
                      </h2>
                      
                      <div className="space-y-3 sm:space-y-4">
                        {/* Sous-total */}
                        <div className="flex justify-between text-sm sm:text-base">
                          <span className="text-gray-600">
                            Sous-total ({totalItems} article{totalItems > 1 ? 's' : ''})
                          </span>
                          <span className="font-medium">{subtotal.toFixed(2)} €</span>
                        </div>
                        
                        {/* Livraison */}
                        <div className="flex justify-between text-sm sm:text-base">
                          <span className="text-gray-600">Livraison</span>
                          <span className="font-medium">
                            {shipping === 0 ? (
                              <span className="text-green-600">Gratuite</span>
                            ) : (
                              `${shipping.toFixed(2)} €`
                            )}
                          </span>
                        </div>
                        
                        {/* Message livraison gratuite */}
                        {shipping > 0 && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-start gap-2">
                              <Truck className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <p className="text-xs sm:text-sm text-blue-700">
                                Plus que <strong>{(50 - subtotal).toFixed(2)} €</strong> pour la livraison gratuite
                              </p>
                            </div>
                          </div>
                        )}
                        
                        <hr className="border-gray-200" />
                        
                        {/* Total */}
                        <div className="flex justify-between text-lg sm:text-xl font-bold">
                          <span>Total</span>
                          <span className="text-green-600">{total.toFixed(2)} €</span>
                        </div>
                      </div>
                      
                      {/* Bouton commander */}
                      <Button 
                        onClick={() => router.push('/checkout')}
                        className="w-full mt-6 py-3 sm:py-4 text-base sm:text-lg font-semibold"
                        size="lg"
                      >
                        <div className="flex items-center justify-center gap-2">
                          Passer commande
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                      </Button>
                      
                      {/* Avantages */}
                      <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                          <Truck className="w-4 h-4 text-green-600" />
                          <span>Livraison 24-48h en région parisienne</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                          <Gift className="w-4 h-4 text-green-600" />
                          <span>Emballage soigné inclus</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}