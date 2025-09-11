// src/app/panier/page.tsx - Page panier complète
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
  Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { toast } from 'sonner';

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
        toast.success('Panier vidé');
      } else {
        throw new Error('Erreur lors du vidage du panier');
      }
    } catch (error: any) {
      console.error('Erreur vidage:', error);
      toast.error('Erreur lors du vidage du panier');
    }
  };

  // Calculs
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = subtotal >= 50 ? 0 : 8.90;
  const total = subtotal + deliveryFee;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de votre panier...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Breadcrumb */}
          <nav className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <button onClick={() => router.push('/')} className="hover:text-green-600">
                Accueil
              </button>
              <span>/</span>
              <span className="text-gray-900">Panier</span>
            </div>
          </nav>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Votre Panier</h1>
              <p className="text-gray-600 mt-1">
                {totalItems > 0 
                  ? `${totalItems} article${totalItems > 1 ? 's' : ''} dans votre panier`
                  : 'Votre panier est vide'
                }
              </p>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => router.push('/produits')}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continuer les achats
            </Button>
          </div>

          {cartItems.length === 0 ? (
            // Panier vide
            <Card className="text-center py-16">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Articles du panier */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <Card key={item._id}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        
                        {/* Image produit */}
                        <div className="flex-shrink-0">
                          <Image
                            src={item.image || '/placeholder-product.jpg'}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        </div>

                        {/* Informations produit */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {item.name}
                          </h3>
                          <p className="text-lg font-bold text-green-600">
                            {item.price.toFixed(2)} €
                          </p>
                          
                          {/* Stock warning */}
                          {!item.isActive && (
                            <p className="text-sm text-red-600 mt-1">
                              ⚠️ Produit plus disponible
                            </p>
                          )}
                        </div>

                        {/* Contrôles quantité */}
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || updatingItems.includes(item._id)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-12 text-center font-medium">
                              {updatingItems.includes(item._id) ? '...' : item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              disabled={
                                item.quantity >= 50 || 
                                updatingItems.includes(item._id) ||
                                !item.isActive
                              }
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Bouton supprimer */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item._id)}
                            disabled={updatingItems.includes(item._id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Prix total pour cet article */}
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {(item.price * item.quantity).toFixed(2)} €
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Actions panier */}
                <div className="flex justify-between items-center pt-4">
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Vider le panier
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={fetchCart}
                    disabled={updatingItems.length > 0}
                  >
                    Actualiser le panier
                  </Button>
                </div>
              </div>

              {/* Résumé de commande */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Résumé de commande</h2>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sous-total ({totalItems} articles)</span>
                        <span className="font-medium">{subtotal.toFixed(2)} €</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Livraison</span>
                        <span className="font-medium">
                          {deliveryFee === 0 ? (
                            <span className="text-green-600">Gratuite</span>
                          ) : (
                            `${deliveryFee.toFixed(2)} €`
                          )}
                        </span>
                      </div>
                      
                      {subtotal < 50 && subtotal > 0 && (
                        <div className="flex items-center text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                          <Gift className="w-4 h-4 mr-2" />
                          <span>
                            Livraison gratuite à partir de 50€ 
                            (il vous manque {(50 - subtotal).toFixed(2)} €)
                          </span>
                        </div>
                      )}
                      
                      <hr />
                      
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-green-600">{total.toFixed(2)} €</span>
                      </div>
                    </div>

                    {/* Informations livraison */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Truck className="w-4 h-4 mr-2 text-green-600" />
                        <span>Livraison sous 24-48h</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Gift className="w-4 h-4 mr-2 text-green-600" />
                        <span>Fraîcheur garantie 7 jours</span>
                      </div>
                    </div>

                    {/* Bouton commander */}
                    <Button
                      onClick={() => router.push('/checkout')}
                      className="w-full h-12 text-lg"
                      size="lg"
                      disabled={cartItems.length === 0 || cartItems.some(item => !item.isActive)}
                    >
                      <div className="flex items-center">
                        <span>Procéder au paiement</span>
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </div>
                    </Button>

                    {cartItems.some(item => !item.isActive) && (
                      <p className="text-sm text-red-600 text-center mt-2">
                        Certains articles ne sont plus disponibles
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}