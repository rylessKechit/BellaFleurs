// src/components/reviews/ReviewsList.tsx - Version corrigée
'use client';

import { useState, useEffect } from 'react';
import { Star, MessageCircle, Filter, ChevronDown, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Types locaux pour éviter les conflits
interface Review {
  _id: string;
  customerName: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  isPublished: boolean;
  adminResponse?: string;
  createdAt: string;
  ratingLabel?: string;
  isPositive?: boolean;
}

interface RatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}

interface ReviewsListProps {
  productId: string;
}

export default function ReviewsList({ productId }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingDistribution, setRatingDistribution] = useState<RatingDistribution[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [filterRating, setFilterRating] = useState('all');

  useEffect(() => {
    fetchReviews(true); // Reset quand les filtres changent
  }, [productId, sortBy, filterRating]);

  const fetchReviews = async (reset: boolean = false) => {
    try {
      setLoading(true);
      const currentPage = reset ? 1 : page;
      
      const params = new URLSearchParams({
        productId,
        page: currentPage.toString(),
        limit: '5',
        sortBy,
        sortOrder: 'desc'
      });

      if (filterRating !== 'all') {
        params.append('rating', filterRating);
      }

      const response = await fetch(`/api/reviews?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        if (reset) {
          setReviews(data.data.reviews);
          setPage(2); // Préparer pour la page suivante
        } else {
          setReviews(prev => [...prev, ...data.data.reviews]);
          setPage(prev => prev + 1);
        }
        
        setRatingDistribution(data.data.ratingDistribution || []);
        setTotalReviews(data.data.totalReviews || 0);
        setHasMore(data.pagination.hasNextPage);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSortLabel = (value: string) => {
    switch (value) {
      case 'createdAt': return 'Plus récents';
      case 'rating': return 'Note décroissante';
      case 'helpful': return 'Plus utiles';
      default: return 'Plus récents';
    }
  };

  const getRatingFilterLabel = (value: string) => {
    if (value === 'all') return 'Toutes les notes';
    return `${value} étoiles`;
  };

  if (loading && page === 1) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Distribution des notes */}
      {ratingDistribution.length > 0 && totalReviews > 0 && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Répartition des notes</h3>
            <div className="space-y-2">
              {ratingDistribution.map((stat) => (
                <div key={stat.rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-sm font-medium">{stat.rating}</span>
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 w-16 text-right">
                    {stat.count} ({stat.percentage}%)
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtres et tri */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="text-sm text-gray-600">
          {totalReviews} avis au total
        </div>
        
        <div className="flex items-center gap-2">
          {/* Filtre par note */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                {getRatingFilterLabel(filterRating)}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterRating('all')}>
                Toutes les notes
              </DropdownMenuItem>
              {[5, 4, 3, 2, 1].map((rating) => (
                <DropdownMenuItem 
                  key={rating} 
                  onClick={() => setFilterRating(rating.toString())}
                >
                  {rating} étoiles
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Tri */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                Trier par: {getSortLabel(sortBy)}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy('createdAt')}>
                Plus récents
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('rating')}>
                Note décroissante
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('helpful')}>
                Plus utiles
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Liste des avis */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">
                {filterRating === 'all' 
                  ? 'Aucun avis pour ce produit pour le moment.'
                  : `Aucun avis avec ${filterRating} étoiles.`
                }
              </p>
              <p className="text-sm">
                {filterRating === 'all' 
                  ? 'Soyez le premier à laisser votre avis !'
                  : 'Essayez un autre filtre.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary-100 text-primary-600">
                      {review.customerName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h4 className="font-medium text-gray-900 truncate">
                        {review.customerName}
                      </h4>
                      {review.isVerified && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 border-green-200">
                          ✓ Achat vérifié
                        </Badge>
                      )}
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-3 leading-relaxed">
                      {review.comment}
                    </p>
                    
                    {/* Réponse administrateur */}
                    {review.adminResponse && (
                      <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">
                            Réponse de Bella Fleurs
                          </Badge>
                        </div>
                        <p className="text-blue-800 text-sm leading-relaxed">
                          {review.adminResponse}
                        </p>
                      </div>
                    )}

                    {/* Actions (pour plus tard: utile/pas utile) */}
                    <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                      <button className="flex items-center gap-1 hover:text-gray-700 transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                        Utile
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Bouton "Voir plus" */}
          {hasMore && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={() => fetchReviews(false)}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? 'Chargement...' : 'Voir plus d\'avis'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}