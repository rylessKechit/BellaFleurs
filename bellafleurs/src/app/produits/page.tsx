'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Search, 
  Grid3X3, 
  List, 
  ShoppingCart,
  Heart,
  Star,
  Package,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  averageRating?: number;
  reviewsCount?: number;
}

interface ApiResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      nextPage: number | null;
      prevPage: number | null;
    };
  };
  error?: {
    message: string;
    code: string;
  };
}

// Catégories fixes
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
  
  // États
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [addingToCart, setAddingToCart] = useState<string[]>([]);

  // Charger les produits depuis l'API
  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory, sortBy, currentPage]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
      if (sortBy) params.append('sort', sortBy);
      params.append('page', currentPage.toString());
      params.append('limit', '12');

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

  const { incrementCartCount } = useCart();

  // Ajouter au panier (implémentation originale)
  const addToCart = async (productId: string, productName: string) => {
    if (addingToCart.includes(productId)) return;
    
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

  // Composant carte produit avec responsive amélioré
  const ProductCard = ({ product }: { product: Product }) => {
    const isAdding = addingToCart.includes(product._id);

    if (viewMode === 'list') {
      return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Image */}
              <div className="flex-shrink-0 w-full sm:w-32 md:w-48">
                <div className="aspect-square relative overflow-hidden rounded-lg">
                  <Image
                    src={product.images?.[0] || '/placeholder-product.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 128px, 192px"
                  />
                </div>
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/produits/${product._id}`}
                      className="block group"
                    >
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {product.category}
                    </Badge>
                    
                    <p className="text-sm sm:text-base text-gray-600 mb-3 line-clamp-2 sm:line-clamp-3">
                      {product.description}
                    </p>
                    
                    {product.tags && product.tags.length > 0 && (
                      <div className="hidden sm:flex flex-wrap gap-1 mb-3">
                        {product.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Prix et actions */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-2">
                    <p className="text-xl sm:text-2xl font-bold text-green-600">
                      {product.price.toFixed(2)} €
                    </p>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-8 h-8 sm:w-10 sm:h-10 p-0"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                      
                      <Button 
                        onClick={() => addToCart(product._id, product.name)}
                        disabled={isAdding}
                        size="sm"
                        className="px-3 sm:px-4"
                      >
                        {isAdding ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Ajouter</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Vue grille (responsive améliorée)
    return (
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300">
        <div className="aspect-square relative overflow-hidden">
          <Image
            src={product.images?.[0] || '/placeholder-product.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          
          {/* Overlay actions - visible sur hover desktop, toujours visible mobile */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                size="sm"
                className="bg-white/90 hover:bg-white backdrop-blur-sm w-8 h-8 sm:w-10 sm:h-10 p-0"
              >
                <Heart className="w-4 h-4" />
              </Button>
              
              <Button 
                onClick={() => addToCart(product._id, product.name)}
                disabled={isAdding}
                size="sm"
                className="bg-white/90 hover:bg-white text-green-600 hover:text-green-700 backdrop-blur-sm px-3 sm:px-4"
              >
                {isAdding ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600" />
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Ajouter</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="p-3 sm:p-4">
          <Badge variant="secondary" className="mb-2 text-xs">
            {product.category}
          </Badge>
          
          <Link 
            href={`/produits/${product._id}`}
            className="block group/link"
          >
            <h3 className="font-semibold text-gray-900 mb-2 group-hover/link:text-green-600 transition-colors line-clamp-2 text-sm sm:text-base">
              {product.name}
            </h3>
          </Link>
          
          <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between">
            <p className="text-lg sm:text-xl font-bold text-green-600">
              {product.price.toFixed(2)} €
            </p>
            
            {product.averageRating && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-xs sm:text-sm text-gray-600">
                  {product.averageRating.toFixed(1)}
                </span>
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
      <main className="min-h-screen bg-gray-50 pt-16">
        {/* Header de page avec padding responsive */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Nos créations</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Découvrez notre collection de fleurs</p>
              </div>
              
              {/* Barre de recherche responsive */}
              <form onSubmit={handleSearch} className="flex gap-2 max-w-md w-full sm:w-auto">
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="min-w-0"
                />
                <Button type="submit" size="sm" className="px-3 sm:px-4">
                  <Search className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            
            {/* Sidebar filtres - Hidden sur mobile par défaut */}
            <div className="lg:col-span-1">
              <Card className="lg:sticky lg:top-24">
                <CardContent className="p-4 sm:p-6">
                  {/* Catégories */}
                  <div className="mb-6">
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
                        Toutes les catégories
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
              
              {/* Barre d'outils responsive */}
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
                  {/* Grille de produits responsive */}
                  <div className={`grid gap-4 sm:gap-6 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' 
                      : 'grid-cols-1'
                  }`}>
                    {products.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>

                  {/* Pagination responsive */}
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