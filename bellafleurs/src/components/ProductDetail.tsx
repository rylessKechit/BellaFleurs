// components/ProductDetail.tsx - Page produit détaillée avec sélecteur de variants
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Heart, Star, Minus, Plus, Share } from 'lucide-react';
import { toast } from 'sonner';

// Types pour les variants
interface ProductVariant {
  name: string;
  price: number;
  description?: string;
  image?: string;
  isActive: boolean;
  order: number;
}

interface ProductDetailProps {
  product: {
    _id: string;
    name: string;
    description: string;
    price?: number;
    hasVariants: boolean;
    variants: ProductVariant[];
    images: string[];
    category: string;
    isActive: boolean;
    tags?: string[];
    entretien?: string;
    averageRating?: number;
    reviewsCount?: number;
    slug?: string;
  };
  onAddToCart: (productId: string, quantity: number, variantId?: string) => Promise<void>;
}

export function ProductDetail({ product, onAddToCart }: ProductDetailProps) {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Initialiser avec la première variante active
  useEffect(() => {
    if (product.hasVariants && product.variants.length > 0) {
      const firstActiveVariant = product.variants.findIndex(v => v.isActive);
      setSelectedVariantIndex(firstActiveVariant >= 0 ? firstActiveVariant : 0);
    }
  }, [product]);

  // Obtenir la variante sélectionnée
  const getSelectedVariant = (): ProductVariant | null => {
    if (!product.hasVariants || !product.variants || product.variants.length === 0) {
      return null;
    }
    return product.variants[selectedVariantIndex] || null;
  };

  // Obtenir le prix actuel
  const getCurrentPrice = (): number => {
    if (!product.hasVariants) {
      return product.price || 0;
    }
    const variant = getSelectedVariant();
    return variant ? variant.price : 0;
  };

  // Obtenir l'image à afficher
  const getCurrentImage = (): string => {
    if (!product.hasVariants || !product.images[selectedImageIndex]) {
      return product.images[selectedImageIndex] || product.images[0] || '';
    }
    
    const variant = getSelectedVariant();
    // Utiliser l'image spécifique de la variante si disponible
    if (variant?.image && selectedImageIndex === 0) {
      return variant.image;
    }
    return product.images[selectedImageIndex] || product.images[0] || '';
  };

  // Vérifier si le produit/variant est disponible
  const isAvailable = (): boolean => {
    if (!product.isActive) return false;
    if (!product.hasVariants) return true;
    const variant = getSelectedVariant();
    return variant ? variant.isActive : false;
  };

  // Gérer l'ajout au panier
  const handleAddToCart = async () => {
    if (!isAvailable()) {
      toast.error('Ce produit n\'est pas disponible');
      return;
    }

    setIsAddingToCart(true);
    try {
      const variantId = product.hasVariants ? selectedVariantIndex.toString() : undefined;
      await onAddToCart(product._id, quantity, variantId);
      
      const variant = getSelectedVariant();
      const productName = variant 
        ? `${product.name} - ${variant.name}` 
        : product.name;
      
      toast.success(`${productName} ajouté au panier (×${quantity})`);
    } catch (error) {
      console.error('Erreur ajout panier:', error);
      toast.error('Erreur lors de l\'ajout au panier');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Formater le prix
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  // Obtenir le nom complet du produit
  const getFullProductName = (): string => {
    if (!product.hasVariants) return product.name;
    const variant = getSelectedVariant();
    return variant ? `${product.name} - ${variant.name}` : product.name;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Galerie d'images */}
        <div className="space-y-4">
          {/* Image principale */}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={getCurrentImage() || '/api/placeholder/600/600'}
              alt={getFullProductName()}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Miniatures */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImageIndex === index 
                      ? 'border-green-500' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
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
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Share className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Heart className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="outline">{product.category}</Badge>
              {product.hasVariants && (
                <Badge variant="secondary">Multi-tailles</Badge>
              )}
            </div>

            {/* Rating */}
            {product.averageRating && product.averageRating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= product.averageRating! 
                          ? 'text-yellow-400 fill-yellow-400' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  ({product.reviewsCount || 0} avis)
                </span>
              </div>
            )}

            {/* Prix */}
            <div className="mb-6">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {formatPrice(getCurrentPrice())}
              </div>
              {product.hasVariants && (
                <p className="text-gray-500">
                  Prix selon la taille sélectionnée
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>

          {/* Sélecteur de variantes */}
          {product.hasVariants && product.variants && product.variants.length > 0 && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Choisir une taille
                </Label>
                
                {/* Options de variantes */}
                <div className="grid grid-cols-2 gap-3">
                  {product.variants.map((variant, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedVariantIndex(index)}
                      disabled={!variant.isActive}
                      className={`p-4 rounded-lg border-2 text-left transition-colors ${
                        selectedVariantIndex === index
                          ? 'border-green-500 bg-green-50'
                          : variant.isActive
                          ? 'border-gray-200 hover:border-gray-300'
                          : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`font-medium ${
                          !variant.isActive ? 'text-gray-400' : 'text-gray-900'
                        }`}>
                          {variant.name}
                        </span>
                        <span className={`font-bold ${
                          !variant.isActive ? 'text-gray-400' : 'text-green-600'
                        }`}>
                          {formatPrice(variant.price)}
                        </span>
                      </div>
                      {variant.description && (
                        <p className={`text-sm ${
                          !variant.isActive ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {variant.description}
                        </p>
                      )}
                      {!variant.isActive && (
                        <p className="text-xs text-red-500 mt-1">Non disponible</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description de la variante sélectionnée */}
              {(() => {
                const variant = getSelectedVariant();
                return variant?.description && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-1">{variant.name}</h4>
                    <p className="text-sm text-gray-700">{variant.description}</p>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Sélecteur de quantité */}
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

          {/* Boutons d'action */}
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
                : `Ajouter au panier - ${formatPrice(getCurrentPrice() * quantity)}`
              }
            </Button>
            
            {!isAvailable() && (
              <p className="text-red-600 text-center text-sm">
                {!product.isActive 
                  ? 'Produit non disponible' 
                  : 'Cette taille n\'est plus disponible'
                }
              </p>
            )}
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Instructions d'entretien */}
          {product.entretien && (
            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg mb-3">Conseils d'entretien</h3>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-gray-700">{product.entretien}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Label component simple si pas déjà défini
const Label = ({ children, className = '', ...props }: { 
  children: React.ReactNode; 
  className?: string;
  [key: string]: any;
}) => (
  <label className={`block text-sm font-medium text-gray-700 ${className}`} {...props}>
    {children}
  </label>
);