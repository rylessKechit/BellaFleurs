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

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  // États
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'care'>('description');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les données du produit depuis l'API
  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.id) return;
      
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/products/${params.id}`, {
          method: 'GET',
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.product) {
            setProduct(data.data.product);
          } else {
            throw new Error('Produit non trouvé');
          }
        } else if (response.status === 404) {
          setError('Produit non trouvé');
        } else {
          throw new Error('Erreur lors du chargement du produit');
        }
      } catch (error: any) {
        console.error('Erreur chargement produit:', error);
        setError(error.message || 'Erreur lors du chargement du produit');
        toast.error('Erreur lors du chargement du produit');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  // Fonction pour ajouter au panier (sans vérification de stock)
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

  const toggleWishlist = () => {
    setIsInWishlist(!isInWishlist);
    toast.success(isInWishlist ? 'Retiré des favoris' : 'Ajouté aux favoris');
  };

  const shareProduct = async () => {
    if (!product) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Partage annulé');
      }
    } else {
      // Fallback pour copier le lien
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Lien copié dans le presse-papiers');
      } catch (error) {
        toast.error('Impossible de copier le lien');
      }
    }
  };

  const difficultyColors = {
    'facile': 'text-green-600 bg-green-50',
    'modéré': 'text-yellow-600 bg-yellow-50',
    'difficile': 'text-red-600 bg-red-50'
  };

  // États de chargement et d'erreur
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

  if (error || !product) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 pt-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Card>
              <CardContent className="text-center py-16">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {error || 'Produit non trouvé'}
                </h2>
                <p className="text-gray-600 mb-6">
                  Le produit que vous recherchez n'existe pas ou n'est plus disponible.
                </p>
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Breadcrumb */}
          <nav className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <button onClick={() => router.push('/')} className="hover:text-primary-600">
                Accueil
              </button>
              <span>/</span>
              <button onClick={() => router.push('/produits')} className="hover:text-primary-600">
                Produits
              </button>
              <span>/</span>
              <span className="text-gray-900">{product.name}</span>
            </div>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Images */}
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
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSelectedImage(prev => prev === product.images.length - 1 ? 0 : prev + 1)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Miniatures */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
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
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Informations produit */}
            <div className="space-y-6">
              
              {/* Header produit */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {product.name}
                    </h1>
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary">{product.category}</Badge>
                      {product.difficulty && (
                        <Badge className={difficultyColors[product.difficulty]}>
                          Entretien {product.difficulty}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleWishlist}
                      className={isInWishlist ? 'text-red-500 border-red-200' : ''}
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
                    </Button>
                    <Button variant="outline" size="sm" onClick={shareProduct}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Prix */}
                <div className="mb-6">
                  <div className="text-3xl font-bold text-green-600">
                    {product.price.toFixed(2)}€
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Prix TTC • Livraison incluse
                  </p>
                </div>

                {/* Toujours disponible */}
                <div className="mb-6">
                  <p className="text-sm text-green-600">
                    ✓ Création sur mesure - Toujours disponible
                  </p>
                </div>
              </div>

              {/* Sélecteur de quantité */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantité
                  </label>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="h-10 w-10"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    
                    <span className="font-medium text-lg min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
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
                    disabled={!product.isActive || isAddingToCart}
                    className="w-full h-12 text-lg"
                  >
                    {isAddingToCart ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Ajout en cours...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Ajouter au panier
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full h-12"
                    disabled={!product.isActive}
                  >
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
                    <div className="text-xs text-gray-600">Créations fraîches</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
                  <Award className="w-6 h-6 text-primary-600 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm text-gray-900">Savoir-faire</div>
                    <div className="text-xs text-gray-600">Créations d'expert</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Onglets d'informations */}
          <div className="mt-16">
            <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="care">Entretien</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-8">
                <Card>
                  <CardContent className="p-8">
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed text-lg">
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
                              <Badge key={index} variant="outline">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Informations produit supplémentaires */}
                      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Catégorie</h4>
                          <p className="text-gray-600">{product.category}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Référence</h4>
                          <p className="text-gray-600 font-mono text-sm">{product._id}</p>
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
              
              <TabsContent value="care" className="mt-8">
                <Card>
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Instructions d'entretien
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {product.entretien || product.careInstructions || 'Instructions d\'entretien spécifiques non renseignées pour ce produit.'}
                        </p>
                      </div>
                      
                      {product.difficulty && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            Niveau de difficulté
                          </h3>
                          <Badge className={difficultyColors[product.difficulty]}>
                            {product.difficulty.charAt(0).toUpperCase() + product.difficulty.slice(1)}
                          </Badge>
                        </div>
                      )}
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Conseils généraux
                        </h3>
                        <ul className="space-y-2 text-gray-700">
                          <li>• Manipulez avec précaution lors de la réception</li>
                          <li>• Respectez les conditions de conservation recommandées</li>
                          <li>• Suivez les instructions spécifiques au produit</li>
                          <li>• Contactez-nous en cas de questions</li>
                        </ul>
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