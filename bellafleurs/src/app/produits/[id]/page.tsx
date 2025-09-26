'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, ShoppingCart, ArrowLeft, Plus, Minus, Truck, Shield, RefreshCw, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import PriceSelector from '@/components/product/PriceSelector';

interface ProductVariant {
  _id?: string;
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
  pricingType?: 'fixed' | 'variants' | 'custom_range';
  customPricing?: {
    minPrice: number;
    maxPrice: number;
  };
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
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [customPrice, setCustomPrice] = useState<number | null>(null);

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
          
          const productData = { ...data.data };
          
          // Respecter hasVariants du backend sans forcer
          // Nettoyer les variants pour produits simples
          if (!productData.hasVariants) {
            productData.variants = [];
          }
          
          setProduct(productData);
          
          // Initialiser variants seulement si réellement présents
          if (productData.hasVariants && productData.variants?.length > 0) {
  console.log('Initialisation variants:', productData.variants);
  const firstActiveVariant = productData.variants.find((v: any) => v.isActive !== false);
  if (firstActiveVariant && firstActiveVariant._id) {
    setSelectedVariant(firstActiveVariant._id);
  } else if (productData.variants[0]?._id) {
    // Si aucun variant actif, prendre le premier
    setSelectedVariant(productData.variants[0]._id);
  }
  console.log('Variant sélectionné:', firstActiveVariant);
          } else {
            // Pour les produits sans variants, on ne touche pas à selectedVariant
            console.log('Produit simple, pas de variants');
          }
          
          setDataReady(true);
        } else {
          console.error('Erreur API:', data);
          toast.error('Produit introuvable');
          router.push('/produits');
        }
      } catch (error) {
        console.error('Erreur chargement produit:', error);
        toast.error('Erreur lors du chargement du produit');
        router.push('/produits');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id, router]);

  // Obtenir les données du variant sélectionné
  const selectedVariantData = product?.variants.find(v => v._id === selectedVariant);

  // Ajout au panier
  const handleAddToCart = async () => {
    if (!product) return;

    let priceToUse: number;
    let variantId: string | undefined;
    let variantName: string | undefined;

    if (product.pricingType === 'custom_range') {
      if (!customPrice) {
        toast.error('Veuillez sélectionner un budget');
        return;
      }
      priceToUse = customPrice;
    } else if (product.hasVariants) {
      if (!selectedVariant || !selectedVariantData) {
        toast.error('Veuillez sélectionner une taille');
        return;
      }
      priceToUse = selectedVariantData.price;
      variantId = selectedVariant;
      variantName = selectedVariantData.name;
    } else {
      priceToUse = product.price || 0;
    }

    setIsAddingToCart(true);

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productId: product._id,
          quantity,
          variantId,
          variantName,
          customPrice: product.pricingType === 'custom_range' ? customPrice : undefined
        })
      });

      if (response.ok) {
        toast.success('Produit ajouté au panier !');
        incrementCartCount();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error?.message || 'Erreur lors de l\'ajout au panier');
      }
    } catch (error) {
      console.error('Erreur ajout panier:', error);
      toast.error('Erreur lors de l\'ajout au panier');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Gestion quantité
  const updateQuantity = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 50) {
      setQuantity(newQuantity);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  // Product not found
  if (!product || !dataReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produit introuvable</h1>
          <Button onClick={() => router.push('/produits')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux produits
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
            <Link href="/" className="hover:text-pink-600">Accueil</Link>
            <span>/</span>
            <Link href="/produits" className="hover:text-pink-600">Produits</Link>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>

          {/* Bouton retour */}
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Galerie d'images - GAUCHE */}
            <div className="space-y-4">
              {/* Image principale */}
              <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-sm">
                <Image
                  src={product.images[selectedImageIndex] || '/api/placeholder/600/600'}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  quality={100}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/api/placeholder/600/600';
                  }}
                />
              </div>

              {/* Miniatures */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImageIndex === index 
                          ? 'border-pink-500' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={image || '/api/placeholder/150/150'}
                        alt={`${product.name} ${index + 1}`}
                        width={150}
                        height={150}
                        className="w-full h-full object-cover"
                        quality={100}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/api/placeholder/150/150';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Informations produit - DROITE */}
            <div className="space-y-6">
              {/* En-tête */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {product.category}
                  </Badge>
                  {product.difficulty && (
                    <Badge className={`text-xs ${difficultyColors[product.difficulty]}`}>
                      {product.difficulty}
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>
                
                {/* Section Prix */}
                {product.pricingType === 'custom_range' && product.customPricing ? (
                  <div>
                    <div className="text-2xl font-bold text-gray-900 mb-4">
                      À partir de {product.customPricing.minPrice.toFixed(2)} €
                    </div>
                    <PriceSelector
                      minPrice={product.customPricing.minPrice}
                      maxPrice={product.customPricing.maxPrice}
                      onPriceChange={setCustomPrice}
                    />
                  </div>
                ) : product.hasVariants && product.variants.length > 0 ? (
                  <div>
                    <Label className="text-base font-medium">Choisir une taille</Label>
                    {/* SOLUTION : Afficher le Select seulement si on a un variant sélectionné */}
                    {selectedVariant ? (
                      <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                        <SelectTrigger className="w-full mt-2">
                          <SelectValue placeholder="Sélectionner une taille" />
                        </SelectTrigger>
                        <SelectContent>
                          {product.variants
                            .filter(variant => variant.isActive)
                            .map((variant) => (
                              <SelectItem key={variant._id} value={variant._id || ''}>
                                {variant.name} - {variant.price.toFixed(2)} €
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-2 text-gray-500">
                        Chargement des tailles...
                      </div>
                    )}
                    {selectedVariantData && (
                      <div className="mt-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {selectedVariantData.price.toFixed(2)} €
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-gray-900">
                    {product.price?.toFixed(2)} €
                  </div>
                )}

                {/* Rating */}
                {product.averageRating && product.reviewsCount ? (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.averageRating!)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.averageRating.toFixed(1)} ({product.reviewsCount} avis)
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Description du variant (seulement si produit avec variants) */}
              {product.hasVariants && product.variants?.length > 0 && selectedVariantData?.description && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-blue-600" />
                      <h3 className="font-medium text-blue-900">
                        À propos de "{selectedVariantData.name}"
                      </h3>
                    </div>
                    <p className="text-blue-800 text-sm leading-relaxed">
                      {selectedVariantData.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Quantité et ajout panier */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Quantité</h3>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="font-medium text-lg min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(quantity + 1)}
                      disabled={quantity >= 50}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || !product.isActive}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                    size="lg"
                  >
                    {isAddingToCart ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Ajout...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Ajouter au panier
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setIsInWishlist(!isInWishlist)}
                  >
                    <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current text-red-500' : ''}`} />
                  </Button>
                </div>
              </div>

              {/* Informations de livraison */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">Livraison gratuite</p>
                        <p className="text-xs text-gray-600">À partir de 50€ d&apos;achat</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">Satisfaction garantie</p>
                        <p className="text-xs text-gray-600">Fraîcheur assurée 48h</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description principale déplacée sous les images */}
          <div className="mt-12 space-y-8">
            
            {/* Description principale */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed text-base">
                    {product.description || "Une magnifique création florale composée avec soin par nos artisans fleuristes."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Composition */}
            {product.composition && (
              <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm">🌺</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg">Composition</h3>
                  </div>
                  <div className="text-gray-700 leading-relaxed text-base">
                    {product.composition}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Instructions d'entretien */}
            {(product.entretien || product.careInstructions) && (
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm">💧</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg">Instructions d&apos;entretien</h3>
                  </div>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                    {product.entretien || product.careInstructions}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sections supplémentaires */}
          <div className="mt-16 space-y-8">
            {/* Section Pourquoi choisir ce produit */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 text-xl">Pourquoi choisir ce bouquet ?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 text-sm">🌱</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Fleurs fraîches</h4>
                      <p className="text-sm text-gray-600">Sélectionnées le matin même pour une fraîcheur optimale</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 text-sm">🎨</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Création unique</h4>
                      <p className="text-sm text-gray-600">Chaque bouquet est composé à la main par nos fleuristes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 text-sm">💝</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Emballage soigné</h4>
                      <p className="text-sm text-gray-600">Présenté dans un emballage élégant et protecteur</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-pink-600 text-sm">⚡</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Livraison rapide</h4>
                      <p className="text-sm text-gray-600">Livré dans les meilleurs délais pour préserver la beauté</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Produits similaires ou recommandations */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 text-xl">Vous pourriez aussi aimer</h3>
                <p className="text-gray-600 text-center py-8">
                  Découvrez nos autres créations florales dans la même catégorie
                </p>
                <div className="text-center">
                  <Button variant="outline" asChild>
                    <Link href={`/produits?category=${encodeURIComponent(product.category)}`}>
                      Voir plus de {product.category.toLowerCase()}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}