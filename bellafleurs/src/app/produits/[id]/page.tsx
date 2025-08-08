// src/app/produits/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Minus, 
  Plus, 
  Truck, 
  Shield, 
  Award,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  images: string[];
  stock: number;
  isActive: boolean;
  tags: string[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  dimensions?: {
    height: number;
    width: number;
    depth: number;
  };
  care?: {
    difficulty: 'facile' | 'modéré' | 'difficile';
    watering: string;
    light: string;
    temperature: string;
  };
  averageRating?: number;
  reviewCount?: number;
}

interface Review {
  _id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

// Mock data
const mockProduct: Product = {
  _id: '1',
  name: 'Bouquet Romantique Éternel',
  description: 'Un magnifique bouquet composé de roses rouges premium, de roses blanches délicates et de verdure fraîche. Parfait pour exprimer vos sentiments les plus profonds. Chaque rose est soigneusement sélectionnée pour sa beauté et sa fraîcheur exceptionnelle.',
  price: 45.90,
  category: 'bouquets',
  subcategory: 'romantique',
  images: [
    '/api/placeholder/600/400',
    '/api/placeholder/600/400',
    '/api/placeholder/600/400',
    '/api/placeholder/600/400'
  ],
  stock: 8,
  isActive: true,
  tags: ['roses', 'romantique', 'rouge', 'blanc', 'saint-valentin'],
  seo: {
    title: 'Bouquet Romantique Éternel - Roses Premium',
    description: 'Bouquet de roses rouges et blanches pour vos moments romantiques',
    keywords: ['bouquet', 'roses', 'romantique', 'saint-valentin', 'amour']
  },
  dimensions: {
    height: 35,
    width: 25,
    depth: 25
  },
  care: {
    difficulty: 'facile',
    watering: 'Changer l\'eau tous les 2-3 jours',
    light: 'Éviter la lumière directe du soleil',
    temperature: 'Conserver à température ambiante (18-22°C)'
  },
  averageRating: 4.8,
  reviewCount: 23
};

const mockReviews: Review[] = [
  {
    _id: '1',
    author: 'Marie L.',
    rating: 5,
    comment: 'Absolument magnifique ! Les roses étaient fraîches et le bouquet parfaitement arrangé. Ma femme était aux anges.',
    date: '2024-01-15',
    verified: true
  },
  {
    _id: '2',
    author: 'Pierre M.',
    rating: 4,
    comment: 'Très beau bouquet, livraison rapide. Une rose avait quelques pétales abîmés mais l\'ensemble était très bien.',
    date: '2024-01-10',
    verified: true
  },
  {
    _id: '3',
    author: 'Sophie R.',
    rating: 5,
    comment: 'Service impeccable ! Le bouquet a duré plus d\'une semaine en suivant les conseils d\'entretien.',
    date: '2024-01-08',
    verified: false
  }
];

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product>(mockProduct);
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'care' | 'reviews'>('description');

  const addToCart = () => {
    // Logic to add to cart
    console.log(`Added ${quantity} x ${product.name} to cart`);
  };

  const toggleWishlist = () => {
    setIsInWishlist(!isInWishlist);
  };

  const shareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      // Fallback pour copier le lien
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const difficultyColors = {
    'facile': 'text-green-600 bg-green-50',
    'modéré': 'text-yellow-600 bg-yellow-50',
    'difficile': 'text-red-600 bg-red-50'
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Breadcrumb */}
          <nav className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <a href="/" className="hover:text-primary-600">Accueil</a>
              <span>/</span>
              <a href="/produits" className="hover:text-primary-600">Produits</a>
              <span>/</span>
              <span className="text-gray-900">{product.name}</span>
            </div>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Images */}
            <div className="space-y-4">
              {/* Image principale */}
              <div className="aspect-square bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-primary-100 to-pink-100 flex items-center justify-center">
                  <span className="text-8xl opacity-40">🌹</span>
                </div>
              </div>
              
              {/* Miniatures */}
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index 
                        ? 'border-primary-500 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-primary-100 to-pink-100 flex items-center justify-center">
                      <span className="text-2xl opacity-60">🌹</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Informations produit */}
            <div className="space-y-6">
              
              {/* En-tête */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {product.name}
                    </h1>
                    
                    {/* Rating */}
                    {product.averageRating && (
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-5 h-5 ${i < Math.floor(product.averageRating!) ? 'fill-current' : ''}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {product.averageRating} ({product.reviewCount} avis)
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions rapides */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleWishlist}
                      className={isInWishlist ? 'text-red-500 border-red-200' : ''}
                    >
                      <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                    </Button>
                    <Button variant="outline" size="icon" onClick={shareProduct}>
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Prix */}
                <div className="flex items-baseline space-x-2 mb-4">
                  <span className="text-4xl font-bold text-primary-600">
                    {product.price.toFixed(2)}€
                  </span>
                  <span className="text-lg text-gray-500">TTC</span>
                </div>

                {/* Stock */}
                <div className="flex items-center space-x-2 mb-6">
                  {product.stock > 0 ? (
                    <>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-700 font-medium">
                        En stock ({product.stock} disponibles)
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-red-700 font-medium">
                        Rupture de stock
                      </span>
                    </>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {product.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Sélection quantité */}
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-gray-700">Quantité</label>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="h-10 w-10"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="px-4 py-2 text-center min-w-[3rem]">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="h-10 w-10"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="space-y-3">
                  <Button 
                    onClick={addToCart} 
                    disabled={product.stock === 0}
                    className="w-full h-12 text-lg"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Ajouter au panier
                  </Button>
                  
                  <Button variant="outline" className="w-full h-12">
                    Acheter maintenant
                  </Button>
                </div>

                {/* Prix total */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total</span>
                    <span className="text-xl font-bold text-gray-900">
                      {(product.price * quantity).toFixed(2)}€
                    </span>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
                  <Truck className="w-6 h-6 text-primary-600 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm text-gray-900">Livraison rapide</div>
                    <div className="text-xs text-gray-600">24-48h en région parisienne</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
                  <Shield className="w-6 h-6 text-primary-600 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm text-gray-900">Fraîcheur garantie</div>
                    <div className="text-xs text-gray-600">Fleurs du jour</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
                  <Award className="w-6 h-6 text-primary-600 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm text-gray-900">Savoir-faire</div>
                    <div className="text-xs text-gray-600">Artisan fleuriste</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Onglets détails */}
          <div className="mt-16">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              
              {/* Navigation onglets */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'description', label: 'Description', icon: Info },
                    { id: 'care', label: 'Entretien', icon: Heart },
                    { id: 'reviews', label: 'Avis clients', icon: Star }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                        {tab.id === 'reviews' && (
                          <Badge variant="secondary" className="ml-1">
                            {product.reviewCount}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Contenu onglets */}
              <div className="p-6">
                {activeTab === 'description' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
                      <p className="text-gray-600 leading-relaxed text-lg">
                        {product.description}
                      </p>
                    </div>

                    {product.dimensions && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Dimensions</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-primary-600">
                              {product.dimensions.height}cm
                            </div>
                            <div className="text-sm text-gray-600">Hauteur</div>
                          </div>
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-primary-600">
                              {product.dimensions.width}cm
                            </div>
                            <div className="text-sm text-gray-600">Largeur</div>
                          </div>
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-primary-600">
                              {product.dimensions.depth}cm
                            </div>
                            <div className="text-sm text-gray-600">Profondeur</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'care' && product.care && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        Conseils d'entretien
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">💧</span>
                            <div>
                              <h4 className="font-medium text-gray-900">Arrosage</h4>
                              <p className="text-sm text-gray-600">{product.care.watering}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">☀️</span>
                            <div>
                              <h4 className="font-medium text-gray-900">Exposition</h4>
                              <p className="text-sm text-gray-600">{product.care.light}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">🌡️</span>
                            <div>
                              <h4 className="font-medium text-gray-900">Température</h4>
                              <p className="text-sm text-gray-600">{product.care.temperature}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">📊</span>
                            <div>
                              <h4 className="font-medium text-gray-900">Difficulté</h4>
                              <Badge className={difficultyColors[product.care.difficulty]}>
                                {product.care.difficulty}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Avis clients ({reviews.length})
                      </h3>
                      <Button variant="outline" size="sm">
                        Écrire un avis
                      </Button>
                    </div>

                    {/* Résumé des notes */}
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-900">
                            {product.averageRating}
                          </div>
                          <div className="flex text-yellow-400 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < Math.floor(product.averageRating!) ? 'fill-current' : ''}`}
                              />
                            ))}
                          </div>
                          <div className="text-sm text-gray-600">
                            {product.reviewCount} avis
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          {[5, 4, 3, 2, 1].map((rating) => {
                            const count = reviews.filter(r => Math.floor(r.rating) === rating).length;
                            const percentage = (count / reviews.length) * 100;
                            
                            return (
                              <div key={rating} className="flex items-center space-x-3 mb-1">
                                <span className="text-sm text-gray-600 w-6">{rating}</span>
                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-yellow-400 h-2 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-600 w-8">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Liste des avis */}
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-gray-900">
                                  {review.author}
                                </span>
                                {review.verified && (
                                  <Badge variant="secondary" className="text-xs">
                                    ✓ Achat vérifié
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="flex text-yellow-400">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`w-4 h-4 ${i < review.rating ? 'fill-current' : ''}`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500">
                                  {new Date(review.date).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-600 leading-relaxed">
                            {review.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Produits similaires */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Vous pourriez aussi aimer
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Mock related products */}
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="group hover:shadow-lg transition-all duration-300">
                  <div className="aspect-square bg-gradient-to-br from-primary-100 to-pink-100 flex items-center justify-center">
                    <span className="text-4xl opacity-40">🌺</span>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Composition {i}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary-600">
                        {(29.90 + i * 10).toFixed(2)}€
                      </span>
                      <Button size="sm" variant="outline">
                        Voir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}