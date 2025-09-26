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
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

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
            const firstActiveIndex = productData.variants.findIndex((v: any) => v.isActive !== false);
            const indexToUse = firstActiveIndex >= 0 ? firstActiveIndex : 0;
            setSelectedVariantIndex(indexToUse);
            console.log('Index variant sélectionné:', indexToUse);
          } else {
            setSelectedVariantIndex(0);
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

  // Fonction prix unifiée
  const getCurrentPrice = () => {
    if (!product) return 0;
    
    if (!product.hasVariants) {
      return product.price || 0;
    }
    
    if (product.variants?.length > 0 && product.variants[selectedVariantIndex]) {
      return product.variants[selectedVariantIndex].price;
    }
    
    return 0;
  };

  // Fonction prix formaté unifiée
  const getFormattedPrice = () => {
    const price = getCurrentPrice();
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  // Obtenir le variant actuel ou null
  const getCurrentVariant = () => {
    if (!product?.hasVariants || !product.variants?.length) {
      return null;
    }
    return product.variants[selectedVariantIndex] || null;
  };

  // Ajout au panier
  const handleAddToCart = async () => {
    if (!product || isAddingToCart) return;

    try {
      setIsAddingToCart(true);

      const requestBody: any = {
        productId: product._id,
        quantity: quantity
      };

      // Ajouter variantId seulement si produit a des variants
      if (product.hasVariants && product.variants?.length > 0) {
        requestBody.variantId = selectedVariantIndex.toString();
      }

      console.log('Ajout panier avec données:', requestBody);

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const currentVariant = getCurrentVariant();
        const productName = currentVariant 
          ? `${product.name} - ${currentVariant.name}`
          : product.name;
          
        toast.success(`${productName} ajouté au panier`);
        incrementCartCount(quantity);
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
                
                {/* Prix */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold text-pink-600">
                    {getFormattedPrice()}
                  </span>
                  {product.hasVariants && product.variants?.length > 0 && (
                    <span className="text-sm text-gray-500">
                      par {getCurrentVariant()?.name.toLowerCase() || 'pièce'}
                    </span>
                  )}
                </div>

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

              {/* NOUVEAU : Description du variant (seulement si produit avec variants) */}
              {product.hasVariants && product.variants?.length > 0 && getCurrentVariant()?.description && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-blue-600" />
                      <h3 className="font-medium text-blue-900">
                        À propos de "{getCurrentVariant()?.name}"
                      </h3>
                    </div>
                    <p className="text-blue-800 text-sm leading-relaxed">
                      {getCurrentVariant()?.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Sélecteur variants seulement si hasVariants = true */}
              {product.hasVariants && product.variants?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Choisir une taille</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {product.variants.map((variant, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedVariantIndex(index)}
                        disabled={!variant.isActive}
                        className={`p-3 border rounded-lg text-center transition-colors ${
                          selectedVariantIndex === index
                            ? 'border-pink-500 bg-pink-50 text-pink-900'
                            : variant.isActive
                            ? 'border-gray-200 hover:border-gray-300 text-gray-900'
                            : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <div className="font-medium">{variant.name}</div>
                        <div className="text-sm text-gray-600">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR'
                          }).format(variant.price)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
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
                    className="flex-1"
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

          {/* NOUVEAU : Description principale déplacée sous les images */}
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