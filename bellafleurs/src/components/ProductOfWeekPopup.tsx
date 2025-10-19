'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, X, ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import Image from 'next/image';

interface ProductOfWeekData {
  isEnabled: boolean;
  title: string;
  description: string;
  product: {
    _id: string;
    name: string;
    description: string;
    images: string[];
    category: string;
    slug?: string;
    hasVariants: boolean;
    displayPriceFormatted: string;
    priceRangeFormatted: string;
  } | null;
}

export default function ProductOfWeekPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<ProductOfWeekData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductOfWeek = async () => {
      try {
        const response = await fetch('/api/product-of-week');
        const result = await response.json();
        
        if (result.success && result.data.isEnabled && result.data.product) {
          setData(result.data);
          
          // Vérifier si la popup a déjà été vue aujourd'hui
          const today = new Date().toDateString();
          const lastShown = localStorage.getItem('productOfWeekLastShown');
          
          if (lastShown !== today) {
            // Attendre un peu avant d'afficher la popup
            setTimeout(() => {
              setIsOpen(true);
            }, 1500); // 3 secondes après le chargement
          }
        }
      } catch (error) {
        console.error('Erreur chargement produit semaine:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductOfWeek();
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Marquer comme vue aujourd'hui
    const today = new Date().toDateString();
    localStorage.setItem('productOfWeekLastShown', today);
  };

  const getProductUrl = () => {
    if (!data?.product) return '/produits';
    
    if (data.product.slug) {
      return `/produits/${data.product.slug}`;
    }
    return `/produits/${data.product._id}`;
  };

  if (loading || !data || !data.isEnabled || !data.product) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md sm:max-w-lg mx-4 p-0 overflow-hidden">
        {/* Header avec badge et fermeture */}
        <div className="relative bg-gradient-to-r from-green-500 to-green-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 fill-current" />
              <span className="font-semibold text-sm">{data.title}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-white hover:bg-white/20 h-8 w-8 absolute top-2 right-2"
            >
              <X className="w-5 h-5 stroke-2" />
            </Button>
          </div>
          <p className="text-green-100 text-sm mt-1">{data.description}</p>
        </div>

        {/* Contenu produit */}
        <div className="p-6 space-y-4">
          {/* Image produit */}
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={data.product.images[0] || '/images/placeholder.jpg'}
              alt={data.product.name}
              fill
              className="object-cover"
            />
            <Badge className="absolute top-3 left-3 bg-green-500 text-white">
              Sélection
            </Badge>
          </div>

          {/* Informations produit */}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg text-gray-900 leading-tight">
                {data.product.name}
              </h3>
              <div className="text-right">
                <p className="font-bold text-green-600 text-lg">
                  {data.product.priceRangeFormatted}
                </p>
              </div>
            </div>
            
            {data.product.description && (
              <p className="text-gray-600 text-sm line-clamp-2">
                {data.product.description}
              </p>
            )}
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {data.product.category}
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-2">
            <Button 
              variant="outline" 
              onClick={() => {
                window.location.href = getProductUrl();
                handleClose();
              }}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              Voir le produit
            </Button>
          </div>

          {/* Note pour variants */}
          {data.product.hasVariants && (
            <p className="text-xs text-gray-500 text-center">
              Ce produit a plusieurs options. Cliquez sur "Voir le produit" pour choisir.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}