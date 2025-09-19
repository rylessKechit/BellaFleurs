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
  ChevronRight,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';

interface ProductVariant {
  name: string;
  price: number;
  description?: string;
  image?: string;
  isActive: boolean;
  order: number;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price?: number;
  hasVariants: boolean;
  variants: ProductVariant[];
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
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { incrementCartCount } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataReady, setDataReady] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  const difficultyColors = {
    'facile': 'bg-green-100 text-green-800',
    'modéré': 'bg-yellow-100 text-yellow-800',
    'difficile': 'bg-red-100 text-red-800'
  };

  // Charger le produit
  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.id) return;

      try {
        setLoading(true);
        setDataReady(false);
        
        const response = await fetch(`/api/products/${params.id}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          console.log('Données reçues de l\'API:', JSON.stringify(data.data, null, 2));
          
          // CORRECTION : Forcer la détection des variants même si hasVariants est undefined
          const productData = { ...data.data };
          
          // Si variants existe et a du contenu, forcer hasVariants à true
          if (productData.variants && Array.isArray(productData.variants) && productData.variants.length > 0) {
            productData.hasVariants = true;
            console.log('FORCE hasVariants = true car variants détectés:', productData.variants);
          }
          
          setProduct(productData);
          
          // Initialiser avec la première variante si variants
          if (productData.variants && productData.variants.length > 0) {
            console.log('Initialisation variants:', productData.variants);
            const firstActiveIndex = productData.variants.findIndex((v: any) => v.isActive !== false);
            const indexToUse = firstActiveIndex >= 0 ? firstActiveIndex : 0;
            console.log('Index variant sélectionné:', indexToUse);
            setSelectedVariantIndex(indexToUse);
          }
          
          // Marquer les données comme prêtes APRÈS avoir tout initialisé
          setDataReady(true);
        } else {
          throw new Error('Produit non trouvé');
        }
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Produit introuvable');
        router.push('/produits');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id, router]);

  // Helpers
  const getSelectedVariant = () => {
    if (!product || !product.variants || product.variants.length === 0) return null;
    return product.variants[selectedVariantIndex] || null;
  };

  const getCurrentPrice = () => {
    if (!product) return 0;
    
    // Vérification explicite de hasVariants
    const hasVariants = product.hasVariants === true;
    
    if (hasVariants && product.variants && product.variants.length > 0) {
      const variant = getSelectedVariant();
      console.log('Variant sélectionné:', variant);
      return variant?.price || 0;
    }
    return product.price || 0;
  };

  const getCurrentImage = () => {
    if (!product?.images?.length) return '/api/placeholder/600/600';
    return product.images[selectedImageIndex] || product.images[0];
  };

  const isAvailable = () => {
    // Toujours disponible pour les produits à la demande
    if (!product) return false;
    if (!product.isActive) return false;
    
    const hasVariants = product.hasVariants === true;
    
    // Si pas de variants, toujours dispo
    if (!hasVariants) return true;
    
    // Si variants, vérifier la variante sélectionnée
    const variant = getSelectedVariant();
    return variant?.isActive !== false; // true par défaut si pas spécifié
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const handleAddToCart = async () => {
    if (!product || !isAvailable()) {
      toast.error('Ce produit n\'est pas disponible');
      return;
    }

    setIsAddingToCart(true);
    try {
      const variantId = product.hasVariants ? selectedVariantIndex.toString() : undefined;
      
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productId: product._id,
          quantity,
          variantId
        })
      });

      const data = await response.json();
      if (data.success) {
        const variant = getSelectedVariant();
        const name = variant ? `${product.name} - ${variant.name}` : product.name;
        toast.success(`${name} ajouté au panier (×${quantity})`);
        incrementCartCount(quantity);
      } else {
        throw new Error(data.error?.message || 'Erreur');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'ajout au panier');
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading || !dataReady) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
              <p>Chargement du produit...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Produit introuvable</h1>
            <p className="text-gray-600 mb-8">Ce produit n'existe pas ou a été supprimé.</p>
            <Button onClick={() => router.push('/produits')}>
              Retour au catalogue
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
            <button onClick={() => router.push('/')} className="hover:text-primary-600">
              Accueil
            </button>
            <ChevronRight className="w-4 h-4" />
            <button onClick={() => router.push('/produits')} className="hover:text-primary-600">
              Produits
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            
            {/* Images */}
            <div className="space-y-4">
              <div className="aspect-square relative bg-white rounded-lg overflow-hidden shadow-sm">
                <Image
                  src={getCurrentImage()}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
                {!isAvailable() && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Badge className="bg-red-600 text-white">Non disponible</Badge>
                  </div>
                )}
              </div>

              {/* Miniatures */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                        selectedImageIndex === index 
                          ? 'border-primary-500' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Informations */}
            <div className="space-y-6">
              
              {/* Header */}
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{product.category}</Badge>
                      {product.hasVariants && (
                        <Badge variant="outline" className="text-xs">Multi-tailles</Badge>
                      )}
                      {product.difficulty && (
                        <Badge className={difficultyColors[product.difficulty]}>
                          {product.difficulty}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setIsInWishlist(!isInWishlist)}
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Rating */}
                {product.averageRating && product.averageRating > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= product.averageRating! 
                              ? 'text-yellow-400 fill-yellow-400' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-600">({product.reviewsCount || 0})</span>
                  </div>
                )}

                {/* Prix avec debug */}
                <div className="mb-6">
                  <div className="text-4xl font-bold text-primary-600">
                    {formatPrice(getCurrentPrice())}
                  </div>
                  {/* DEBUG - à retirer plus tard */}
                  <div className="text-xs text-red-500 mt-1">
                    DEBUG - hasVariants: {String(product.hasVariants)} | variants: {product.variants?.length || 0} | prix: {getCurrentPrice()} | type: {typeof product.hasVariants}
                  </div>
                  {product.hasVariants === true && (
                    <p className="text-gray-500 mt-1">Prix selon la taille</p>
                  )}
                </div>
              </div>

              {/* Sélecteur de variants - CONDITION CORRIGÉE */}
              {(product.hasVariants === true || (product.variants && product.variants.length > 0)) && (
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Choisir une taille</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {product.variants && product.variants.map((variant, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          console.log('Sélection variant:', index, variant);
                          setSelectedVariantIndex(index);
                        }}
                        disabled={variant.isActive === false}
                        className={`p-4 rounded-lg border-2 text-left transition-colors ${
                          selectedVariantIndex === index
                            ? 'border-primary-500 bg-primary-50'
                            : variant.isActive !== false
                            ? 'border-gray-200 hover:border-gray-300'
                            : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{variant.name}</span>
                          <span className="font-bold text-primary-600">
                            {formatPrice(variant.price)}
                          </span>
                        </div>
                        {variant.description && (
                          <p className="text-sm text-gray-600">{variant.description}</p>
                        )}
                        {variant.isActive === false && (
                          <p className="text-xs text-red-500 mt-1">Indisponible</p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantité */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Quantité</Label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.min(10, quantity + 1))}
                      disabled={quantity >= 10}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-gray-500">Maximum: 10</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <Button 
                  onClick={handleAddToCart}
                  disabled={!isAvailable() || isAddingToCart}
                  size="lg"
                  className="w-full text-lg py-6"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {isAddingToCart 
                    ? 'Ajout en cours...' 
                    : isAvailable() 
                      ? 'Ajouter au panier'
                      : 'Non disponible'
                  }
                </Button>

                {/* Garanties */}
                <div className="grid grid-cols-3 gap-4 text-center py-4 border-t">
                  <div className="flex flex-col items-center gap-2 text-sm text-gray-600">
                    <Truck className="w-5 h-5" />
                    <span>Livraison 24-48h</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-5 h-5" />
                    <span>Paiement sécurisé</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 text-sm text-gray-600">
                    <Award className="w-5 h-5" />
                    <span>Fraîcheur garantie</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs détails */}
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="care">Entretien</TabsTrigger>
              <TabsTrigger value="composition">Composition</TabsTrigger>
              <TabsTrigger value="info">Informations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Description</h3>
                  <p className="text-gray-700 leading-relaxed mb-6">{product.description}</p>
                  
                  {product.tags && product.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Mots-clés</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="care" className="mt-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Instructions d'entretien</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {product.entretien || product.careInstructions || 'Instructions d\'entretien non renseignées.'}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="composition" className="mt-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Composition</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {product.composition || 'Composition non renseignée.'}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="info" className="mt-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Informations produit</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Catégorie</h4>
                      <p className="text-gray-600">{product.category}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Référence</h4>
                      <p className="text-gray-600 font-mono text-sm">{product._id}</p>
                    </div>
                    {product.hasVariants && (
                      <div>
                        <h4 className="font-medium mb-2">Tailles disponibles</h4>
                        <p className="text-gray-600">
                          {product.variants?.filter(v => v.isActive).length || 0} tailles
                        </p>
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium mb-2">Délai</h4>
                      <p className="text-gray-600">24-48h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  );
}