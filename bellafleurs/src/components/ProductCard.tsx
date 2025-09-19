// components/ProductCard.tsx - Carte produit avec support des variants
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Heart, Star } from 'lucide-react';

// Types pour le produit avec variants (selon tes types existants)
interface ProductVariant {
  name: string;
  price: number;
  description?: string;
  image?: string;
  isActive: boolean;
  order: number;
}

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    description: string;
    price?: number;
    hasVariants: boolean;
    variants: ProductVariant[];
    displayPrice?: number;
    displayPriceFormatted?: string;
    priceRangeFormatted?: string;
    images: string[];
    category: string;
    isActive: boolean;
    tags?: string[];
    averageRating?: number;
    reviewsCount?: number;
    slug?: string;
  };
  onAddToCart?: (productId: string, variantId?: string) => void;
  className?: string;
}

export function ProductCard({ product, onAddToCart, className = '' }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Obtenir le prix à afficher
  const getDisplayPrice = () => {
    if (!product.hasVariants) {
      return product.displayPriceFormatted || formatPrice(product.price || 0);
    }
    return product.priceRangeFormatted || 'Prix non disponible';
  };

  // Obtenir l'URL du produit
  const getProductUrl = () => {
    return product.slug ? `/produits/${product.slug}` : `/produits/${product._id}`;
  };

  // Gérer l'ajout au panier rapide (produit simple uniquement)
  const handleQuickAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onAddToCart && !product.hasVariants) {
      onAddToCart(product._id);
    }
  };

  // Formater le prix
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-300 hover:shadow-lg ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={getProductUrl()}>
        <div className="relative overflow-hidden">
          {/* Image principale */}
          <div className="aspect-square bg-gray-100 relative">
            <img
              src={product.images[0] || '/api/placeholder/300/300'}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.hasVariants && (
                <Badge variant="secondary" className="text-xs">
                  Multi-tailles
                </Badge>
              )}
              {!product.isActive && (
                <Badge variant="destructive" className="text-xs">
                  Épuisé
                </Badge>
              )}
            </div>

            {/* Bouton favori */}
            <button
              className="absolute top-2 right-2 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Logic pour ajouter aux favoris
              }}
            >
              <Heart className="w-4 h-4" />
            </button>

            {/* Overlay avec bouton d'action */}
            <div className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
              {product.hasVariants ? (
                <Button variant="secondary" size="sm" className="bg-white">
                  Voir les options
                </Button>
              ) : (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="bg-white"
                  onClick={handleQuickAddToCart}
                  disabled={!product.isActive}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Ajouter au panier
                </Button>
              )}
            </div>
          </div>

          <CardContent className="p-4">
            {/* Nom et catégorie */}
            <div className="mb-2">
              <h3 className="font-semibold text-lg line-clamp-2 mb-1">
                {product.name}
              </h3>
              <Badge variant="outline" className="text-xs">
                {product.category}
              </Badge>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {product.description}
            </p>

            {/* Prix */}
            <div className="mb-3">
              <div className="text-xl font-bold text-green-600">
                {getDisplayPrice()}
              </div>
              {product.hasVariants && (
                <p className="text-xs text-gray-500">
                  {product.variants?.length || 0} taille{(product.variants?.length || 0) > 1 ? 's' : ''} disponible{(product.variants?.length || 0) > 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Rating */}
            {product.averageRating && product.averageRating > 0 && (
              <div className="flex items-center gap-1 mb-3">
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
                <span className="text-sm text-gray-600">
                  ({product.reviewsCount || 0})
                </span>
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {product.tags.slice(0, 2).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {product.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{product.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}

            {/* Affichage des variantes pour les produits multi-tailles */}
            {product.hasVariants && product.variants && product.variants.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-500 mb-2">Tailles :</p>
                <div className="flex flex-wrap gap-1">
                  {product.variants.slice(0, 3).map((variant, index) => (
                    <Badge 
                      key={index} 
                      variant={variant.isActive ? "default" : "secondary"} 
                      className="text-xs"
                    >
                      {variant.name}
                    </Badge>
                  ))}
                  {product.variants.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{product.variants.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </div>
      </Link>
    </Card>
  );
}

// Composant de grille de produits
interface ProductGridProps {
  products: ProductCardProps['product'][];
  onAddToCart?: (productId: string, variantId?: string) => void;
  loading?: boolean;
}

export function ProductGrid({ products, onAddToCart, loading }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-square bg-gray-200 animate-pulse" />
            <CardContent className="p-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Aucun produit trouvé</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}