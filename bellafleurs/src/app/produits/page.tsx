// src/app/produits/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Filter, Grid, List, Star, ShoppingCart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { PRODUCT_CATEGORIES } from '@/lib/constants';

// Types
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  images: string[];
  isInStock: boolean;
  tags: string[];
  averageRating?: number;
  reviewCount?: number;
}

interface Filters {
  category: string;
  subcategory: string;
  priceRange: [number, number];
  inStock: boolean;
  sortBy: string;
}

// Données de démonstration
const mockProducts: Product[] = [
  {
    _id: '1',
    name: 'Bouquet Romantique',
    description: 'Composition de roses rouges et blanches avec verdure',
    price: 45.90,
    category: 'bouquets',
    subcategory: 'romantique',
    images: ['/api/placeholder/400/300'],
    isInStock: true,
    tags: ['roses', 'romantique', 'rouge'],
    averageRating: 4.8,
    reviewCount: 23
  },
  {
    _id: '2',
    name: 'Composition Moderne',
    description: 'Arrangement contemporain avec orchidées et bambou',
    price: 65.00,
    category: 'compositions',
    subcategory: 'moderne',
    images: ['/api/placeholder/400/300'],
    isInStock: true,
    tags: ['orchidées', 'moderne', 'zen'],
    averageRating: 4.9,
    reviewCount: 17
  },
  {
    _id: '3',
    name: 'Plante Dépolluante',
    description: 'Sansevieria en pot décoratif blanc',
    price: 29.90,
    category: 'plantes',
    subcategory: 'interieur',
    images: ['/api/placeholder/400/300'],
    isInStock: false,
    tags: ['dépolluante', 'facile', 'bureau'],
    averageRating: 4.7,
    reviewCount: 45
  },
  {
    _id: '4',
    name: 'Bouquet de Mariée',
    description: 'Création sur mesure avec pivoines et roses',
    price: 120.00,
    category: 'evenements',
    subcategory: 'mariage',
    images: ['/api/placeholder/400/300'],
    isInStock: true,
    tags: ['mariage', 'pivoines', 'blanc'],
    averageRating: 5.0,
    reviewCount: 8
  },
  {
    _id: '5',
    name: 'Composition Zen',
    description: 'Bambous et galets dans vase rectangulaire',
    price: 38.50,
    category: 'compositions',
    subcategory: 'zen',
    images: ['/api/placeholder/400/300'],
    isInStock: true,
    tags: ['bambou', 'zen', 'minimaliste'],
    averageRating: 4.6,
    reviewCount: 12
  },
  {
    _id: '6',
    name: 'Bouquet Champêtre',
    description: 'Mélange de fleurs des champs et herbes folles',
    price: 32.00,
    category: 'bouquets',
    subcategory: 'champetre',
    images: ['/api/placeholder/400/300'],
    isInStock: true,
    tags: ['champêtre', 'naturel', 'sauvage'],
    averageRating: 4.5,
    reviewCount: 31
  }
];

export default function ProduitsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(mockProducts);
  const [filters, setFilters] = useState<Filters>({
    category: '',
    subcategory: '',
    priceRange: [0, 200],
    inStock: false,
    sortBy: 'popular'
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Appliquer les filtres
  useEffect(() => {
    let result = [...products];

    // Filtre par catégorie
    if (filters.category) {
      result = result.filter(product => product.category === filters.category);
    }

    // Filtre par sous-catégorie
    if (filters.subcategory) {
      result = result.filter(product => product.subcategory === filters.subcategory);
    }

    // Filtre par prix
    result = result.filter(product => 
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    // Filtre par stock
    if (filters.inStock) {
      result = result.filter(product => product.isInStock);
    }

    // Tri
    switch (filters.sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      default:
        // Tri par popularité (nombre de reviews)
        result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    }

    setFilteredProducts(result);
  }, [products, filters]);

  const updateFilter = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      subcategory: '',
      priceRange: [0, 200],
      inStock: false,
      sortBy: 'popular'
    });
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative">
        <div className="aspect-square bg-gradient-to-br from-primary-100 to-pink-100 flex items-center justify-center">
          <span className="text-6xl opacity-40">🌸</span>
        </div>
        
        {/* Overlay actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex space-x-2">
            <Button size="sm" className="bg-white text-gray-900 hover:bg-white/90">
              <Eye className="w-4 h-4 mr-1" />
              Voir
            </Button>
            <Button size="sm" className="bg-primary-600 hover:bg-primary-700">
              <ShoppingCart className="w-4 h-4 mr-1" />
              Ajouter
            </Button>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-1">
          {!product.isInStock && (
            <Badge variant="destructive" className="text-xs">
              Rupture
            </Badge>
          )}
          {product.averageRating && product.averageRating >= 4.8 && (
            <Badge className="bg-yellow-500 text-white text-xs">
              ⭐ Top
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
              {product.name}
            </h3>
            <div className="text-right">
              <div className="text-lg font-bold text-primary-600">
                {product.price.toFixed(2)}€
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>

          {product.averageRating && (
            <div className="flex items-center space-x-1">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3 h-3 ${i < Math.floor(product.averageRating!) ? 'fill-current' : ''}`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                ({product.reviewCount})
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Catégories */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Catégories</h3>
        <div className="space-y-2">
          <button
            onClick={() => updateFilter('category', '')}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !filters.category ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
            }`}
          >
            Toutes les catégories
          </button>
          {Object.entries(PRODUCT_CATEGORIES).map(([key, category]) => (
            <button
              key={key}
              onClick={() => updateFilter('category', key)}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                filters.category === key ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sous-catégories */}
      {filters.category && PRODUCT_CATEGORIES[filters.category as keyof typeof PRODUCT_CATEGORIES] && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Types</h3>
          <div className="space-y-2">
            <button
              onClick={() => updateFilter('subcategory', '')}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                !filters.subcategory ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
              }`}
            >
              Tous les types
            </button>
            {PRODUCT_CATEGORIES[filters.category as keyof typeof PRODUCT_CATEGORIES].subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => updateFilter('subcategory', sub.id)}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters.subcategory === sub.id ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Prix */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Prix</h3>
        <div className="space-y-3">
          <div className="px-3">
            <input
              type="range"
              min={0}
              max={200}
              value={filters.priceRange[1]}
              onChange={(e) => updateFilter('priceRange', [0, parseInt(e.target.value)])}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0€</span>
              <span>{filters.priceRange[1]}€</span>
            </div>
          </div>
        </div>
      </div>

      {/* Disponibilité */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Disponibilité</h3>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => updateFilter('inStock', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">En stock uniquement</span>
        </label>
      </div>

      {/* Reset */}
      <Button onClick={resetFilters} variant="outline" className="w-full">
        Réinitialiser les filtres
      </Button>
    </div>
  );

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        
        {/* Hero section */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold mb-4">
                Mes Créations Florales
              </h1>
              <p className="text-xl text-primary-100">
                Découvrez notre collection de bouquets, compositions et plantes 
                soigneusement sélectionnés pour vous.
              </p>
            </div>
          </div>
        </section>

        {/* Filtres et produits */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Sidebar filtres - Desktop */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white p-6 rounded-xl shadow-lg sticky top-24">
                <div className="flex items-center mb-6">
                  <Filter className="w-5 h-5 text-primary-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
                </div>
                <FilterPanel />
              </div>
            </div>

            {/* Contenu principal */}
            <div className="flex-1">
              
              {/* Barre d'outils */}
              <div className="bg-white p-4 rounded-xl shadow-lg mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  
                  {/* Info résultats */}
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
                    </span>
                    
                    {/* Filtres mobile */}
                    <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="lg:hidden">
                          <Filter className="w-4 h-4 mr-2" />
                          Filtres
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="w-80">
                        <SheetHeader>
                          <SheetTitle>Filtres</SheetTitle>
                        </SheetHeader>
                        <div className="mt-6">
                          <FilterPanel />
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-4">
                    
                    {/* Tri */}
                    <select
                      value={filters.sortBy}
                      onChange={(e) => updateFilter('sortBy', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="popular">Plus populaires</option>
                      <option value="rating">Mieux notés</option>
                      <option value="price-asc">Prix croissant</option>
                      <option value="price-desc">Prix décroissant</option>
                      <option value="name">Nom A-Z</option>
                    </select>

                    {/* Vue */}
                    <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grille de produits */}
              {filteredProducts.length > 0 ? (
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {filteredProducts.map((product) => (
                    <Link key={product._id} href={`/produits/${product._id}`}>
                      <ProductCard product={product} />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-12 rounded-xl shadow-lg text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Aucun produit trouvé
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Essayez de modifier vos critères de recherche
                  </p>
                  <Button onClick={resetFilters} variant="outline">
                    Réinitialiser les filtres
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}