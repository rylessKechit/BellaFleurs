'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, X, Eye } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// DialogContent personnalisé sans la croix par défaut
const CustomDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
CustomDialogContent.displayName = DialogPrimitive.Content.displayName;

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
            }, 1500); // 1.5 secondes après le chargement
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
      <CustomDialogContent className="w-[calc(100vw-2rem)] max-w-[350px] sm:max-w-md md:max-w-lg mx-auto p-0 overflow-hidden">
        {/* Header avec badge et fermeture - RESPONSIVE OPTIMISÉ */}
        <div className="relative bg-gradient-to-r from-green-500 to-green-600 text-white p-3 sm:p-4">
          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-current flex-shrink-0" />
              <span className="font-semibold text-xs sm:text-sm leading-tight">{data.title}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-white hover:bg-white/20 h-7 w-7 sm:h-8 sm:w-8 absolute top-2 right-2 flex-shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-2" />
          </Button>
          <p className="text-green-100 text-xs sm:text-sm mt-1 pr-8 leading-relaxed">{data.description}</p>
        </div>

        {/* Contenu produit - RESPONSIVE OPTIMISÉ */}
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          {/* Image produit - RESPONSIVE OPTIMISÉ */}
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={data.product.images[0] || '/images/placeholder.jpg'}
              alt={data.product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 280px, 400px"
            />
            <Badge className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-green-500 text-white text-xs">
              Sélection
            </Badge>
          </div>

          {/* Informations produit - RESPONSIVE OPTIMISÉ */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 leading-tight flex-1 min-w-0">
                {data.product.name}
              </h3>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-green-600 text-base sm:text-lg whitespace-nowrap">
                  {data.product.priceRangeFormatted}
                </p>
              </div>
            </div>
            
            {data.product.description && (
              <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                {data.product.description}
              </p>
            )}
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {data.product.category}
              </Badge>
            </div>
          </div>

          {/* Actions - RESPONSIVE OPTIMISÉ */}
          <div className="flex space-x-2 sm:space-x-3 pt-1 sm:pt-2">
            <Button 
              variant="outline" 
              onClick={() => {
                window.location.href = getProductUrl();
                handleClose();
              }}
              className="flex-1 text-xs sm:text-sm h-9 sm:h-10"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
              <span className="truncate">Voir le produit</span>
            </Button>
          </div>

          {/* Note pour variants - RESPONSIVE OPTIMISÉ */}
          {data.product.hasVariants && (
            <p className="text-xs text-gray-500 text-center leading-relaxed px-2">
              Ce produit a plusieurs options. Cliquez sur "Voir le produit" pour choisir.
            </p>
          )}
        </div>
      </CustomDialogContent>
    </Dialog>
  );
}