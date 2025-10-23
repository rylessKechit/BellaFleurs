// src/app/produits/[id]/page.tsx - Version complète finale
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Plus, 
  Minus, 
  ShoppingCart, 
  Star,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';

// Composant PriceSelector pour prix personnalisable
interface PriceSelectorProps {
  minPrice: number;
  maxPrice: number;
  onPriceChange: (price: number) => void;
}

function PriceSelector({ minPrice, maxPrice, onPriceChange }: PriceSelectorProps) {
  const [selectedPrice, setSelectedPrice] = useState(minPrice);

  const handlePriceChange = (price: number) => {
    setSelectedPrice(price);
    onPriceChange(price);
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Votre budget</Label>
      <div className="space-y-2">
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          step="5"
          value={selectedPrice}
          onChange={(e) => handlePriceChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-sm text-gray-600">
          <span>{minPrice}€</span>
          <span className="font-medium text-primary-600">{selectedPrice}€</span>
          <span>{maxPrice}€</span>
        </div>
      </div>
    </div>
  );
}

// Types
interface ProductVariant {
  _id?: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  isActive: boolean;
  order: number;
  stableId?: string;
  index?: number;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price?: number;
  hasVariants: boolean;
  variants: ProductVariant[];
  pricingType: 'fixed' | 'variants' | 'custom_range';
  customPricing?: {
    minPrice: number;
    maxPrice: number;
  };
  category: string;
  images: string[];
  isActive: boolean;
  tags?: string[];
  entretien?: string;
  averageRating?: number;
  reviewsCount?: number;
  composition?: string;
  careInstructions?: string;
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { incrementCartCount } = useCart();
  
  // États
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataReady, setDataReady] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [customPrice, setCustomPrice] = useState<number | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // ✅ Fonction helper pour créer un ID stable pour les variants
  const getVariantId = (variant: ProductVariant, index: number): string => {
    if (variant._id) {
      return variant._id.toString();
    }
    return `variant_${index}_${variant.name?.replace(/\s+/g, '_').toLowerCase()}`;
  };

  // ✅ Chargement du produit avec gestion des variants existants
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/products/${params.id}`);
        const data = await response.json();
        
        if (response.ok && data.success) {
          const productData = data.data;

          if (!productData.averageRating) productData.averageRating = 4.5;
          if (!productData.reviewsCount) productData.reviewsCount = 1;
          
          if (!productData.hasVariants) {
            productData.variants = [];
          }
          
          if (productData.hasVariants && productData.variants?.length > 0) {
            
            const enrichedVariants = productData.variants.map((variant: ProductVariant, index: number) => ({
              ...variant,
              stableId: getVariantId(variant, index),
              index
            }));
            
            productData.variants = enrichedVariants;
            
            const firstActiveVariant = enrichedVariants.find((v: ProductVariant) => v.isActive === true);
            const fallbackVariant = enrichedVariants[0];
            const selectedVar = firstActiveVariant || fallbackVariant;
            
            if (selectedVar?.stableId) {
              setSelectedVariant(selectedVar.stableId);
            }
          }
          
          setProduct(productData);
          setDataReady(true);
        } else {
          console.error('❌ Erreur API:', data);
          toast.error('Produit introuvable');
          router.push('/produits');
        }
      } catch (error) {
        console.error('❌ Erreur chargement produit:', error);
        toast.error('Erreur lors du chargement du produit');
        router.push('/produits');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id, router]);

  // ✅ Obtenir les données du variant sélectionné
  const selectedVariantData = useMemo(() => {
    if (!product?.variants || !selectedVariant) return null;
    return product.variants.find((v: ProductVariant) => v.stableId === selectedVariant);
  }, [product?.variants, selectedVariant]);

  // ✅ Gestion de l'ajout au panier avec incrémentation du count
  const handleAddToCart = async () => {
    if (!product) return;

    let priceToUse: number;
    let variantId: string | undefined;
    let variantName: string | undefined;
    let variantIndex: number | undefined;

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
      variantIndex = selectedVariantData.index;
      variantName = selectedVariantData.name;
      variantId = selectedVariantData.stableId;
    } else {
      priceToUse = product.price || 0;
    }

    setIsAddingToCart(true);

    try {
      const cartPayload = {
        productId: product._id,
        quantity,
        variantId: variantId,
        variantName: variantName,
        variantIndex: variantIndex,
        customPrice: product.pricingType === 'custom_range' ? customPrice : undefined
      };

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(cartPayload)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Produit ajouté au panier !');
        
        // ✅ NOUVEAU: Incrémenter le cartCount immédiatement
        incrementCartCount(quantity);
      } else {
        throw new Error(data.error?.message || 'Erreur lors de l\'ajout au panier');
      }
    } catch (error: any) {
      console.error('❌ Erreur ajout panier:', error);
      toast.error(error.message || 'Erreur lors de l\'ajout au panier');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Gestion des quantités
  const increaseQuantity = () => {
    if (quantity < 50) setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  // Navigation images
  const nextImage = () => {
    if (product?.images && product.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product?.images && product.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du produit...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Produit introuvable</h1>
            <p className="text-gray-600 mb-4">Le produit que vous recherchez n'existe pas.</p>
            <Button onClick={() => router.push('/produits')}>
              Retour aux produits
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Retour
          </Button>
          <ChevronRight className="w-4 h-4" />
          <span>{product.category}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Galerie d'images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              {product.images && product.images.length > 0 ? (
                <>
                  <Image
                    src={product.images[currentImageIndex]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                  
                  {product.images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg"
                        onClick={nextImage}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-gray-400">Aucune image disponible</span>
                </div>
              )}
            </div>

            {/* Miniatures */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      currentImageIndex === index 
                        ? 'border-primary-600' 
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

          {/* Informations produit */}
          <div className="space-y-6">
            {/* En-tête */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{product.category}</Badge>
                {!product.isActive && (
                  <Badge variant="destructive">Indisponible</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
            </div>

            {/* ✅ Prix et variants avec design en cartes horizontales */}
            <div className="space-y-4">
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
              ) : product.hasVariants && product.variants?.length > 0 ? (
                <div>
                  <Label className="text-base font-medium mb-3 block">Choisir une taille</Label>
                  
                  {/* ✅ Design en cartes horizontales pour variants */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                    {product.variants
                      .filter((variant: ProductVariant) => variant.isActive !== false)
                      .map((variant: ProductVariant) => (
                        <Card 
                          key={variant.stableId}
                          className={`cursor-pointer transition-all duration-200 ${
                            selectedVariant === variant.stableId
                              ? 'ring-2 ring-primary-500 border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                          }`}
                          onClick={() => setSelectedVariant(variant.stableId || '')}
                        >
                          <CardContent className="p-4">
                            <div className="text-center space-y-2">
                              <h4 className="font-medium text-gray-900">
                                {variant.name}
                              </h4>
                              <div className="text-lg font-bold text-primary-600">
                                {variant.price?.toFixed(2) || '0.00'} €
                              </div>
                              {variant.description && (
                                <p className="text-xs text-gray-500 line-clamp-2">
                                  {variant.description}
                                </p>
                              )}
                              {selectedVariant === variant.stableId && (
                                <div className="flex items-center justify-center">
                                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                  
                  {/* ✅ Affichage du prix sélectionné en grand */}
                  {selectedVariantData && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-sm text-gray-600 mb-1">Prix sélectionné</div>
                        <div className="text-3xl font-bold text-gray-900">
                          {selectedVariantData.price?.toFixed(2) || '0.00'} €
                        </div>
                        <div className="text-sm text-gray-600">
                          Taille : {selectedVariantData.name}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {product.price?.toFixed(2) || '0.00'} €
                  </div>
                  <div className="text-sm text-gray-600">Prix unique</div>
                </div>
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

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Quantité et ajout au panier */}
            {product.isActive && (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Quantité */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Quantité</Label>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={decreaseQuantity}
                          disabled={quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-lg font-medium w-12 text-center">
                          {quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={increaseQuantity}
                          disabled={quantity >= 50}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Bouton ajout panier */}
                    <Button
                      onClick={handleAddToCart}
                      disabled={isAddingToCart || !dataReady}
                      className="w-full"
                      size="lg"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {isAddingToCart ? 'Ajout en cours...' : 'Ajouter au panier'}
                    </Button>

                    {/* Actions secondaires */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Heart className="w-4 h-4 mr-2" />
                        Favoris
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Share2 className="w-4 h-4 mr-2" />
                        Partager
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Garanties */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck className="w-4 h-4 text-primary-600" />
                <span>Livraison gratuite</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4 text-primary-600" />
                <span>Garantie fraîcheur</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <RotateCcw className="w-4 h-4 text-primary-600" />
                <span>Retour possible</span>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Section informations détaillées */}
        <div className="mt-12 space-y-8">
          
          {/* Description principale */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 text-lg">📝</span>
                </div>
                Description
              </h2>
            </CardHeader>
            <CardContent>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Grille pour entretien et composition */}
          {(product.entretien || product.careInstructions || product.composition) && (
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Instructions d'entretien */}
              {(product.entretien || product.careInstructions) && (
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                  <CardHeader>
                    <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-sm">💧</span>
                      </div>
                      Instructions d&apos;entretien
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                      {product.entretien || product.careInstructions}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Composition */}
              {product.composition && (
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <CardHeader>
                    <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-sm">🌺</span>
                      </div>
                      Composition
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                      {product.composition}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Section caractéristiques */}
          {product.tags && product.tags.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 text-sm">🏷️</span>
                  </div>
                  Caractéristiques
                </h3>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="text-sm px-3 py-1"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}