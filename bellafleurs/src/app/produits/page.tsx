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

      const response = await fetch(`/api/products?${params.toString()}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data: ApiResponse = await response.json();
        setProducts(data.data.products || []);
        setTotalPages(data.data.pagination?.totalPages || 1);
      } else {
        throw new Error('Erreur lors du chargement des produits');
      }
    } catch (error) {
      console.error('Erreur produits:', error);
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setIsLoading(false);
    }
  };

  const { incrementCartCount } = useCart();

  // Ajouter au panier (plus de vérification de stock)
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

  // Recherche
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Changement de catégorie
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  // Changement de tri
  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  // Pagination
  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Composant de carte produit
  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative aspect-square overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-100 to-pink-100 flex items-center justify-center">
            <Package className="w-16 h-16 text-primary-300" />
          </div>
        )}
        
        {/* Actions rapides */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity space-y-1">
          <Button
            size="sm"
            variant="secondary"
            className="w-8 h-8 p-0"
            onClick={(e) => {
              e.preventDefault();
              // Logique favoris
            }}
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
              {product.name}
            </h3>
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-lg font-bold text-green-600">
                {product.price.toFixed(2)}€
              </div>
              {product.averageRating && (
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-600">
                    {product.averageRating.toFixed(1)} ({product.reviewsCount || 0})
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              <Badge variant="outline" className="text-xs">
                {product.category}
              </Badge>
            </div>
          </div>
          
          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {product.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{product.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 space-y-2">
        <div className="flex space-x-2 w-full">
          <Link href={`/produits/${product.slug || product._id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              Voir détails
            </Button>
          </Link>
          
          <Button
            onClick={() => addToCart(product._id, product.name)}
            disabled={addingToCart.includes(product._id)}
            className="flex-1"
          >
            {addingToCart.includes(product._id) ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-1" />
                Ajouter
              </>
            )}
          </Button>
        </div>
        
        {/* Toujours disponible */}
        <div className="w-full text-center">
          <span className="text-xs text-green-600">
            ✓ Création sur mesure
          </span>
        </div>
      </CardFooter>
    </Card>
  );

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Nos Créations Florales
            </h1>
            <p className="text-gray-600">
              Découvrez notre collection de bouquets et compositions florales
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Filtres à gauche */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h3>
                  
                  {/* Recherche */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rechercher
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Rechercher des produits..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Catégories */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      <SelectTrigger>
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
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm text-gray-600">
                  {isLoading ? 'Chargement...' : `${products.length} produit${products.length > 1 ? 's' : ''} trouvé${products.length > 1 ? 's' : ''}`}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
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
                  {/* Grille de produits */}
                  <div className={`grid gap-6 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                      : 'grid-cols-1'
                  }`}>
                    {products.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex justify-center">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Précédent
                        </Button>
                        
                        {[...Array(totalPages)].map((_, index) => {
                          const page = index + 1;
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 2 && page <= currentPage + 2)
                          ) {
                            return (
                              <Button
                                key={page}
                                variant={currentPage === page ? 'default' : 'outline'}
                                onClick={() => goToPage(page)}
                                className="w-10"
                              >
                                {page}
                              </Button>
                            );
                          } else if (page === currentPage - 3 || page === currentPage + 3) {
                            return <span key={page} className="px-2">...</span>;
                          }
                          return null;
                        })}
                        
                        <Button
                          variant="outline"
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Suivant
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