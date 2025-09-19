'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  ChevronRight,
  Star,
  ShoppingCart,
  Heart,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';

// Types pour les variants
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
  createdAt?: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination?: {
      totalPages: number;
      page: number;
      total: number;
    };
  };
}

const CATEGORIES = [
  'Bouquets',
  'Fleurs de saisons',
  'Compositions piquées',
  'Roses',
  'Orchidées',
  'Deuil',
  'Abonnement'
];

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { incrementCartCount } = useCart();

  // États existants
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [addingToCart, setAddingToCart] = useState<string[]>([]);

  // Charger les produits
  useEffect(() => {
    fetchProducts();
  }, [currentPage, selectedCategory, sortBy]);

  // Initialiser les filtres depuis l'URL
  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    if (category && CATEGORIES.includes(category)) {
      setSelectedCategory(category);
    }
    if (search) {
      setSearchTerm(search);
    }
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        sort: sortBy
      });

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const response = await fetch(`/api/products?${params.toString()}`);
      
      if (response.ok) {
        const data: ApiResponse = await response.json();
        setProducts(data.data.products);
        setTotalPages(data.data.pagination?.totalPages || 1);
      } else {
        throw new Error('Erreur lors du chargement des produits');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setIsLoading(false);
    }
  };

  // Gestionnaires d'événements
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // FONCTION AJOUT PANIER AMÉLIORÉE AVEC VARIANTS
  const addToCart = async (productId: string, productName: string, hasVariants: boolean) => {
    if (addingToCart.includes(productId)) return;
    
    // Pour les produits avec variants, rediriger vers la page produit
    if (hasVariants) {
      router.push(`/produits/${productId}`);
      return;
    }
    
    try {
      setAddingToCart(prev => [...prev, productId]);

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          productId: productId,
          quantity: 1
          // Pas de variantId pour produit simple
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`${productName} ajouté au panier`);
        incrementCartCount(1);
      } else {
        throw new Error(data.error?.message || 'Erreur lors de l\'ajout au panier');
      }

    } catch (error: any) {
      console.error('Erreur addToCart:', error);
      toast.error(error.message || 'Erreur lors de l\'ajout au panier');
    } finally {
      setAddingToCart(prev => prev.filter(id => id !== productId));
    }
  };

  // COMPOSANT CARTE PRODUIT AMÉLIORÉ AVEC VARIANTS
  const ProductCard = ({ product }: { product: Product }) => {
    const [isHovered, setIsHovered] = useState(false);
    const isAdding = addingToCart.includes(product._id);

    // Obtenir le prix à afficher selon variants
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

    // Gestion clic ajout panier
    const handleAddToCart = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      addToCart(product._id, product.name, product.hasVariants);
    };

    // Formater le prix
    const formatPrice = (price: number): string => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(price);
    };

    if (viewMode === 'list') {
      return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Image */}
              <Link href={getProductUrl()} className="flex-shrink-0 w-full sm:w-32 md:w-48">
                <div className="aspect-square relative overflow-hidden rounded-lg">
                  <Image
                    src={product.images?.[0] || '/api/placeholder/300/300'}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 128px, 192px"
                  />
                  {/* Badges overlay */}
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
                </div>
              </Link>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <Link href={getProductUrl()}>
                      <h3 className="font-semibold text-lg text-gray-900 hover:text-primary-600 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">{product.category}</p>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-bold text-primary-600">
                      {getDisplayPrice()}
                    </p>
                    {product.hasVariants && (
                      <p className="text-xs text-gray-500">
                        {product.variants?.filter(v => v.isActive).length || 0} taille{(product.variants?.filter(v => v.isActive).length || 0) > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                  {product.description}
                </p>

                {/* Tags et variants */}
                <div className="space-y-3">
                  {/* Tags */}
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {product.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {product.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{product.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Variants preview */}
                  {product.hasVariants && product.variants && product.variants.length > 0 && (
                    <div className="border-t pt-3">
                      <p className="text-xs text-gray-500 mb-2">Tailles disponibles :</p>
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
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4">
                  <Button 
                    onClick={handleAddToCart}
                    disabled={!product.isActive || isAdding}
                    className="flex-1 sm:flex-initial"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {isAdding 
                      ? 'Ajout...' 
                      : product.hasVariants 
                        ? 'Choisir' 
                        : 'Ajouter'
                    }
                  </Button>
                  <Button variant="outline" size="icon">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Mode grille
    return (
      <Card 
        className="group cursor-pointer transition-all duration-300 hover:shadow-lg overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={getProductUrl()}>
          <div className="relative overflow-hidden">
            {/* Image principale */}
            <div className="aspect-square bg-gray-100 relative">
              <Image
                src={product.images?.[0] || '/api/placeholder/300/300'}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              />
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                {product.hasVariants && (
                  <Badge variant="secondary" className="text-xs bg-white/90">
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
                className="absolute top-3 right-3 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toast.success('Ajouté aux favoris');
                }}
              >
                <Heart className="w-4 h-4" />
              </button>

              {/* Overlay avec bouton d'action */}
              <div className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}>
                <Button 
                  onClick={handleAddToCart}
                  disabled={!product.isActive || isAdding}
                  className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {isAdding 
                    ? 'Ajout...' 
                    : product.hasVariants 
                      ? 'Choisir une taille' 
                      : 'Ajouter au panier'
                  }
                </Button>
              </div>
            </div>
          </div>
        </Link>

        {/* Contenu carte */}
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Titre et catégorie */}
            <div>
              <Link href={getProductUrl()}>
                <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2 mb-1">
                  {product.name}
                </h3>
              </Link>
              <p className="text-sm text-gray-600">{product.category}</p>
            </div>

            {/* Prix et variants info */}
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-primary-600">
                {getDisplayPrice()}
              </span>
              {product.hasVariants && (
                <span className="text-xs text-gray-500">
                  {product.variants?.filter(v => v.isActive).length || 0} taille{(product.variants?.filter(v => v.isActive).length || 0) > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Rating */}
            {product.averageRating && product.averageRating > 0 && (
              <div className="flex items-center gap-1">
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

            {/* Variants preview */}
            {product.hasVariants && product.variants && product.variants.length > 0 && (
              <div className="pt-2 border-t">
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
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header et breadcrumb */}
          <div className="mb-8">
            <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
              <Link href="/" className="hover:text-primary-600">Accueil</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900">Produits</span>
            </nav>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Nos créations florales
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Découvrez notre collection de bouquets, compositions et arrangements floraux créés avec passion.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar filtres */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardContent className="p-4 sm:p-6 space-y-6">
                  
                  {/* Recherche */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recherche
                    </label>
                    <form onSubmit={handleSearch} className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit" size="sm">
                        <Search className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>

                  {/* Catégories */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Catégories
                    </label>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleCategoryChange('all')}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedCategory === 'all'
                            ? 'bg-primary-100 text-primary-700 font-medium'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        Tous les produits
                      </button>
                      {CATEGORIES.map((category) => (
                        <button
                          key={category}
                          onClick={() => handleCategoryChange(category)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            selectedCategory === category
                              ? 'bg-primary-100 text-primary-700 font-medium'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tri */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trier par
                    </label>
                    <Select value={sortBy} onValueChange={handleSortChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Trier par" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Nom A-Z</SelectItem>
                        <SelectItem value="-name">Nom Z-A</SelectItem>
                        <SelectItem value="price">Prix croissant</SelectItem>
                        <SelectItem value="-price">Prix décroissant</SelectItem>
                        <SelectItem value="-createdAt">Plus récents</SelectItem>
                        <SelectItem value="createdAt">Plus anciens</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contenu principal */}
            <div className="lg:col-span-3">
              
              {/* Barre d'outils */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="text-sm text-gray-600">
                  {isLoading ? 'Chargement...' : `${products.length} produit${products.length > 1 ? 's' : ''} trouvé${products.length > 1 ? 's' : ''}`}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="px-2 sm:px-3"
                  >
                    <Grid3X3 className="w-4 h-4" />
                    <span className="hidden sm:inline ml-2">Grille</span>
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="px-2 sm:px-3"
                  >
                    <List className="w-4 h-4" />
                    <span className="hidden sm:inline ml-2">Liste</span>
                  </Button>
                </div>
              </div>

              {/* Contenu produits */}
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement des produits...</p>
                  </div>
                </div>
              ) : products.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-16">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucun produit trouvé
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {searchTerm || selectedCategory !== 'all' 
                        ? 'Aucun produit ne correspond à vos critères de recherche.'
                        : 'Aucun produit disponible pour le moment.'
                      }
                    </p>
                    {(searchTerm || selectedCategory !== 'all') && (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedCategory('all');
                        }}
                      >
                        Réinitialiser les filtres
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Grille/Liste de produits */}
                  <div className={`${
                    viewMode === 'grid' 
                      ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6' 
                      : 'space-y-6'
                  }`}>
                    {products.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 sm:mt-12 flex justify-center">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Button
                          variant="outline"
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          size="sm"
                          className="px-2 sm:px-4"
                        >
                          <span className="hidden sm:inline">Précédent</span>
                          <span className="sm:hidden">‹</span>
                        </Button>
                        
                        {[...Array(totalPages)].map((_, index) => {
                          const page = index + 1;
                          const showPage = page === 1 || 
                                         page === totalPages || 
                                         (page >= currentPage - 1 && page <= currentPage + 1);
                          
                          if (showPage) {
                            return (
                              <Button
                                key={page}
                                variant={currentPage === page ? 'default' : 'outline'}
                                onClick={() => goToPage(page)}
                                size="sm"
                                className="w-8 sm:w-10"
                              >
                                {page}
                              </Button>
                            );
                          } else if (page === currentPage - 2 || page === currentPage + 2) {
                            return <span key={page} className="px-1 sm:px-2 text-gray-400">...</span>;
                          }
                          return null;
                        })}
                        
                        <Button
                          variant="outline"
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          size="sm"
                          className="px-2 sm:px-4"
                        >
                          <span className="hidden sm:inline">Suivant</span>
                          <span className="sm:hidden">›</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}