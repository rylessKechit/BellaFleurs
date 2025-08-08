// src/app/panier/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Truck, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
  category: string;
}

// Mock data
const initialCartItems: CartItem[] = [
  {
    _id: '1',
    name: 'Bouquet Romantique Éternel',
    price: 45.90,
    image: '/api/placeholder/150/150',
    quantity: 2,
    stock: 8,
    category: 'bouquets'
  },
  {
    _id: '2',
    name: 'Composition Zen Moderne',
    price: 65.00,
    image: '/api/placeholder/150/150',
    quantity: 1,
    stock: 5,
    category: 'compositions'
  },
  {
    _id: '3',
    name: 'Orchidée Blanche Premium',
    price: 29.90,
    image: '/api/placeholder/150/150',
    quantity: 1,
    stock: 12,
    category: 'plantes'
  }
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [isPromoApplied, setIsPromoApplied] = useState(false);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCartItems(items =>
      items.map(item => {
        if (item._id === id) {
          return { ...item, quantity: Math.min(newQuantity, item.stock) };
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item._id !== id));
  };

  const applyPromoCode = () => {
    // Mock promo codes
    const promoCodes: { [key: string]: number } = {
      'WELCOME10': 10,
      'SPRING15': 15,
      'LOVE20': 20
    };

    if (promoCodes[promoCode.toUpperCase()]) {
      setPromoDiscount(promoCodes[promoCode.toUpperCase()]);
      setIsPromoApplied(true);
    } else {
      // Show error
      alert('Code promo invalide');
    }
  };

  const removePromoCode = () => {
    setPromoCode('');
    setPromoDiscount(0);
    setIsPromoApplied(false);
  };

  // Calculs
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = (subtotal * promoDiscount) / 100;
  const deliveryFee = subtotal >= 50 ? 0 : 8.90;
  const total = subtotal - discountAmount + deliveryFee;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 pt-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-md mx-auto text-center">
              <div className="mb-8">
                <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Votre panier est vide
                </h1>
                <p className="text-gray-600 mb-8">
                  Découvrez nos créations florales et ajoutez vos coups de cœur !
                </p>
                <Button asChild size="lg" className="px-8">
                  <Link href="/produits">
                    Découvrir nos créations
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
              <Link href="/" className="hover:text-primary-600">Accueil</Link>
              <span>/</span>
              <span className="text-gray-900">Panier</span>
            </nav>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Votre panier
            </h1>
            <p className="text-gray-600">
              {totalItems} article{totalItems > 1 ? 's' : ''} dans votre panier
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Liste des articles */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item._id} className="p-6">
                  <div className="flex items-center space-x-4">
                    
                    {/* Image */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-pink-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">🌸</span>
                      </div>
                    </div>

                    {/* Détails */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {item.category}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Stock: {item.stock}
                        </span>
                      </div>
                      <div className="text-lg font-bold text-primary-600 mt-2">
                        {item.price.toFixed(2)}€
                      </div>
                    </div>

                    {/* Contrôles */}
                    <div className="flex flex-col items-end space-y-3">
                      
                      {/* Quantité */}
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="h-8 w-8"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="px-3 py-1 text-center min-w-[3rem] text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="h-8 w-8"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>

                      {/* Prix total de l'article */}
                      <div className="text-lg font-bold text-gray-900">
                        {(item.price * item.quantity).toFixed(2)}€
                      </div>

                      {/* Supprimer */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Résumé */}
            <div className="space-y-6">
              
              {/* Code promo */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  Code promo
                </h3>
                
                {!isPromoApplied ? (
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Entrez votre code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={applyPromoCode}
                      disabled={!promoCode.trim()}
                      variant="outline"
                    >
                      Appliquer
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-green-700 font-medium">
                        {promoCode.toUpperCase()}
                      </span>
                      <Badge className="ml-2 bg-green-100 text-green-700">
                        -{promoDiscount}%
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removePromoCode}
                      className="text-green-700 hover:text-green-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                
                {/* Suggestions de codes */}
                <div className="mt-3 text-sm text-gray-600">
                  <p className="mb-1">Codes disponibles:</p>
                  <div className="space-x-2">
                    <code className="px-2 py-1 bg-gray-100 rounded text-xs">WELCOME10</code>
                    <code className="px-2 py-1 bg-gray-100 rounded text-xs">SPRING15</code>
                  </div>
                </div>
              </Card>

              {/* Résumé de la commande */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Résumé de la commande
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sous-total</span>
                    <span className="font-medium">{subtotal.toFixed(2)}€</span>
                  </div>
                  
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Réduction ({promoDiscount}%)</span>
                      <span className="font-medium">-{discountAmount.toFixed(2)}€</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center">
                      <Truck className="w-4 h-4 mr-1" />
                      Livraison
                    </span>
                    <span className="font-medium">
                      {deliveryFee === 0 ? (
                        <span className="text-green-600">Gratuite</span>
                      ) : (
                        `${deliveryFee.toFixed(2)}€`
                      )}
                    </span>
                  </div>
                  
                  {subtotal < 50 && (
                    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center">
                        <Gift className="w-4 h-4 mr-2 text-blue-600" />
                        <span>
                          Ajoutez {(50 - subtotal).toFixed(2)}€ pour la livraison gratuite
                        </span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(subtotal / 50) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-primary-600">
                        {total.toFixed(2)}€
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bouton commander */}
                <Button asChild className="w-full mt-6 h-12 text-lg">
                  <Link href="/checkout">
                    Passer la commande
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                
                {/* Continuer les achats */}
                <Button variant="outline" asChild className="w-full mt-3">
                  <Link href="/produits">
                    Continuer mes achats
                  </Link>
                </Button>
              </Card>

              {/* Informations de livraison */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Informations de livraison
                </h3>
                
                <div className="space-y-4 text-sm">
                  <div className="flex items-start space-x-3">
                    <Truck className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">Livraison standard</div>
                      <div className="text-gray-600">24-48h en région parisienne</div>
                      <div className="text-gray-600">Gratuite dès 50€ d'achat</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Gift className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">Retrait en boutique</div>
                      <div className="text-gray-600">Gratuit - Prêt en 2h</div>
                      <div className="text-gray-600">123 Avenue des Fleurs, Paris 15ème</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Sécurité */}
              <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <div className="text-center">
                  <div className="flex justify-center space-x-4 mb-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                        <span className="text-green-600 text-sm">🔒</span>
                      </div>
                      <span className="text-sm font-medium text-green-800">Paiement sécurisé</span>
                    </div>
                  </div>
                  <p className="text-xs text-green-700">
                    Vos données sont protégées par cryptage SSL
                  </p>
                </div>
              </Card>
            </div>
          </div>

          {/* Produits recommandés */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Complétez votre commande
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'Vase en céramique blanc', price: 24.90, category: 'Accessoires' },
                { name: 'Nourriture pour fleurs', price: 8.50, category: 'Entretien' },
                { name: 'Petit bouquet champêtre', price: 19.90, category: 'Bouquets' },
                { name: 'Carte de vœux artisanale', price: 3.50, category: 'Cartes' }
              ].map((product, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                  <div className="aspect-square bg-gradient-to-br from-primary-100 to-pink-100 flex items-center justify-center">
                    <span className="text-4xl opacity-40">
                      {index === 0 ? '🏺' : index === 1 ? '💧' : index === 2 ? '🌼' : '💌'}
                    </span>
                  </div>
                  <CardContent className="p-4">
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {product.category}
                    </Badge>
                    <h3 className="font-medium text-gray-900 mb-2 text-sm">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary-600">
                        {product.price.toFixed(2)}€
                      </span>
                      <Button size="sm" variant="outline" className="text-xs">
                        Ajouter
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Avantages */}
          <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Pourquoi choisir Bella Fleurs ?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌸</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Fraîcheur garantie</h3>
                <p className="text-sm text-gray-600">
                  Fleurs sélectionnées le matin même chez nos producteurs locaux
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚚</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Livraison rapide</h3>
                <p className="text-sm text-gray-600">
                  Livraison en 24-48h en région parisienne avec soin particulier
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👩‍🎨</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Savoir-faire artisanal</h3>
                <p className="text-sm text-gray-600">
                  Créations uniques réalisées par notre fleuriste experte
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}