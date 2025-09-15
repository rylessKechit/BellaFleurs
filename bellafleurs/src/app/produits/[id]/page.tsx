'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Star, 
  Plus, 
  Minus,
  Truck,
  Shield,
  Award,
  ChevronLeft,
  ChevronRight,
  Package,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  isActive: boolean;
  tags: string[];
  slug?: string;
  careInstructions?: string;
  difficulty?: 'facile' | 'modéré' | 'difficile';
  composition?: string;
  entretien?: string;
  averageRating?: number;
  reviewsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

const difficultyColors = {
  facile: 'bg-green-100 text-green-700',
  modéré: 'bg-yellow-100 text-yellow-700',
  difficile: 'bg-red-100 text-red-700'
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id]);

  const fetchProduct = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/products/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        setProduct(data.data.product);
      } else if (response.status === 404) {
        router.push('/404');
      } else {
        throw new Error('Erreur lors du chargement du produit');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement du produit');
    } finally {
      setIsLoading(false);
    }
  };

  const { incrementCartCount } = useCart();

  // Fonction pour ajouter au panier (implémentation originale)
  const addToCart = async () => {
    if (!product || isAddingToCart) return;
    
    try {
      setIsAddingToCart(true);

      // Appel API pour ajouter au panier
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          productId: product._id,
          quantity: quantity
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || 'Produit ajouté au panier');
        incrementCartCount(1);
        
        // Réinitialiser la quantité à 1
        setQuantity(1);
        
      } else {
        throw new Error(data.error?.message || 'Erreur lors de l\'ajout au panier');
      }

    } catch (error: any) {
      console.error('Erreur addToCart:', error);
      toast.error(error.message || 'Erreur lors de l\'ajout au panier');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToCart = async () => {
    await addToCart();
  };

  const toggleWishlist = () => {
    setIsInWishlist(!isInWishlist);
    toast.success(isInWishlist ? 'Retiré des favoris' : 'Ajouté aux favoris');
  };

  const shareProduct = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback: copier l'URL
        navigator.clipboard.writeText(window.location.href);
        toast.success('Lien copié dans le presse-papiers');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papiers');
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du produit...</p>
          </div>
        </main>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Card>
              <CardContent className="text-center py-16">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Produit introuvable</h1>
                <p className="text-gray-600 mb-6">Le produit que vous recherchez n'existe pas ou n'est plus disponible.</p>
                <div className="space-x-4">
                  <Button onClick={() => router.back()} variant="outline">
                    Retour
                  </Button>
                  <Button onClick={() => router.push('/produits')}>
                    Voir tous les produits
                  </Button>
                </div>
              </CardContent>
            </Card>
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
          
          {/* Breadcrumb responsive */}
          <nav className="mb-6 sm:mb-8">
            <div className="flex items-center space-x-2 text-sm text-gray-600 overflow-x-auto">
              <button onClick={() => router.push('/')} className="hover:text-primary-600 whitespace-nowrap">
                Accueil
              </button>
              <span>/</span>
              <button onClick={() => router.push('/produits')} className="hover:text-primary-600 whitespace-nowrap">
                Produits
              </button>
              <span>/</span>
              <span className="text-gray-900 truncate">{product.name}</span>
            </div>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Section Images - Responsive améliorée */}
            <div className="space-y-4">
              {/* Image principale */}
              <div className="aspect-square bg-white rounded-2xl shadow-lg overflow-hidden relative">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[selectedImage] || '/placeholder-product.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-100 to-pink-100 flex items-center justify-center">
                    <Package className="w-24 h-24 text-primary-300" />
                  </div>
                )}
                
                {/* Navigation images */}
                {product.images && product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage(prev => prev === 0 ? product.images.length - 1 : prev - 1)}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 sm:p-2 shadow-lg transition-all"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      onClick={() => setSelectedImage(prev => prev === product.images.length - 1 ? 0 : prev + 1)}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 sm:p-2 shadow-lg transition-all"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Miniatures - Responsive */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index 
                          ? 'border-primary-500 ring-2 ring-primary-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} - vue ${index + 1}`}
                        width={100}
                        height={100}
                        className="w-full h-full object-cover"
                        sizes="(max-width: 640px) 20vw, 15vw"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Informations produit - Responsive améliorée */}
            <div className="space-y-6">
              
              {/* Header produit */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                      {product.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                      <Badge variant="secondary" className="text-xs sm:text-sm">{product.category}</Badge>
                      {product.difficulty && (
                        <Badge className={`text-xs sm:text-sm ${difficultyColors[product.difficulty]}`}>
                          Entretien {product.difficulty}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleWishlist}
                      className={`p-2 sm:p-3 ${isInWishlist ? 'bg-red-50 border-red-200 text-red-600' : ''}`}
                    >
                      <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                    </Button>
                    <Button variant="outline" size="sm" onClick={shareProduct} className="p-2 sm:p-3">
                      <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </div>
                </div>

                {/* Prix et évaluations */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-3xl sm:text-4xl font-bold text-green-600">
                    {product.price.toFixed(2)} €
                  </div>
                  
                  {product.averageRating && (
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 sm:w-5 sm:h-5 ${
                              i < Math.floor(product.averageRating!) 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        ({product.reviewsCount || 0} avis)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sélecteur de quantité et ajout panier */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantité
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="px-2 sm:px-3"
                      >
                        <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <span className="px-3 sm:px-4 py-2 text-center min-w-[3rem] text-sm sm:text-base">
                        {quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-2 sm:px-3"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className="w-full py-3 sm:py-4 text-base sm:text-lg font-semibold"
                  size="lg"
                >
                  {isAddingToCart ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Ajout en cours...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                      Ajouter au panier - {(product.price * quantity).toFixed(2)} €
                    </div>
                  )}
                </Button>
              </div>

              {/* Avantages - Responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 py-4 sm:py-6 border-t border-gray-200">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-900">Livraison 24-48h</p>
                    <p className="text-xs text-gray-600">En région parisienne</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-900">Fraîcheur garantie</p>
                    <p className="text-xs text-gray-600">Fleurs du jour</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-900">Fait main</p>
                    <p className="text-xs text-gray-600">Par nos artisans</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs responsive */}
          <div className="mt-8 sm:mt-12">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-auto p-1">
                <TabsTrigger value="description" className="text-xs sm:text-sm py-2 sm:py-3">
                  Description
                </TabsTrigger>
                <TabsTrigger value="care" className="text-xs sm:text-sm py-2 sm:py-3">
                  Entretien
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-6 sm:mt-8">
                <Card>
                  <CardContent className="p-4 sm:p-6 lg:p-8">
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
                        {product.description}
                      </p>
                      
                      {product.composition && (
                        <div className="mt-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Composition</h3>
                          <p className="text-gray-700">{product.composition}</p>
                        </div>
                      )}

                      {product.tags && product.tags.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                          <div className="flex flex-wrap gap-2">
                            {product.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs sm:text-sm">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Informations produit supplémentaires - Responsive */}
                      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-6 border-t border-gray-200">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Catégorie</h4>
                          <p className="text-gray-600">{product.category}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Référence</h4>
                          <p className="text-gray-600 font-mono text-sm break-all">{product._id}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Disponibilité</h4>
                          <p className="text-gray-600">Création sur mesure</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Délai</h4>
                          <p className="text-gray-600">24-48h</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="care" className="mt-6 sm:mt-8">
                <Card>
                  <CardContent className="p-4 sm:p-6 lg:p-8">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Instructions d'entretien
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {product.entretien || product.careInstructions || 'Instructions d\'entretien spécifiques non renseignées pour ce produit.'}
                        </p>
                      </div>

                      {/* Conseils généraux responsive */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-6 border-t border-gray-200">
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900">Conseils généraux</h4>
                          <ul className="text-sm text-gray-600 space-y-2">
                            <li>• Changez l'eau tous les 2-3 jours</li>
                            <li>• Coupez les tiges en biais</li>
                            <li>• Évitez l'exposition directe au soleil</li>
                            <li>• Retirez les fleurs fanées</li>
                          </ul>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900">Durée de vie</h4>
                          <p className="text-sm text-gray-600">
                            Avec un entretien approprié, vos fleurs peuvent durer entre 7 à 14 jours selon la variété.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}