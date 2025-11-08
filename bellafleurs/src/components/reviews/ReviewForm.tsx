// src/components/reviews/ReviewForm.tsx
'use client';

import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

interface ReviewFormProps {
  productId: string;
  productName: string;
  onClose: () => void;
  onReviewAdded: () => void;
}

export default function ReviewForm({ productId, productName, onClose, onReviewAdded }: ReviewFormProps) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [customerName, setCustomerName] = useState(session?.user?.name || '');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating || !customerName.trim() || !comment.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (comment.trim().length < 10) {
      toast.error('Votre commentaire doit contenir au moins 10 caractères');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating,
          customerName: customerName.trim(),
          comment: comment.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Votre avis a été envoyé avec succès ! Merci pour votre retour 🌸');
        onReviewAdded();
        onClose();
      } else {
        throw new Error(data.error?.message || 'Erreur lors de l\'envoi');
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error.message || 'Erreur lors de l\'envoi de l\'avis');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Très décevant';
      case 2: return 'Décevant';
      case 3: return 'Correct';
      case 4: return 'Bien';
      case 5: return 'Excellent';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-2 top-2"
          >
            <X className="w-4 h-4" />
          </Button>
          <CardTitle className="pr-8">Laisser un avis</CardTitle>
          <p className="text-sm text-gray-600">
            Partagez votre expérience avec <strong>{productName}</strong>
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Votre note *
                {(hoveredRating || rating) > 0 && (
                  <span className="ml-2 text-sm text-primary-600 font-normal">
                    {getRatingText(hoveredRating || rating)}
                  </span>
                )}
              </Label>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => {
                  const starValue = i + 1;
                  return (
                    <button
                      key={i}
                      type="button"
                      className="p-1 transition-all duration-200 hover:scale-110"
                      onMouseEnter={() => setHoveredRating(starValue)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => setRating(starValue)}
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          starValue <= (hoveredRating || rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 hover:text-yellow-200'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nom */}
            <div>
              <Label htmlFor="customerName" className="text-sm font-medium mb-2 block">
                Votre nom *
              </Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Votre nom"
                maxLength={100}
                disabled={!!session?.user?.name} // Désactivé si connecté
                className="w-full"
              />
              {session?.user?.name && (
                <p className="text-xs text-gray-500 mt-1">
                  Nom récupéré automatiquement de votre compte
                </p>
              )}
            </div>

            {/* Commentaire */}
            <div>
              <Label htmlFor="comment" className="text-sm font-medium mb-2 block">
                Votre avis *
              </Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Partagez votre expérience avec ce produit... Qu'avez-vous aimé ? Comment était la qualité ? Recommanderiez-vous ce produit ?"
                rows={4}
                maxLength={1000}
                className="w-full resize-none"
              />
              <div className="flex justify-between items-center mt-1">
                <div className="text-xs text-gray-500">
                  Minimum 10 caractères
                </div>
                <div className={`text-xs ${
                  comment.length > 900 ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {comment.length}/1000 caractères
                </div>
              </div>
            </div>

            {/* Informations sur la modération */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800">
                💡 <strong>Votre avis sera publié immédiatement</strong> et pourra aider d'autres clients dans leur choix. 
                Nous nous réservons le droit de modérer les avis inappropriés.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !rating || !customerName.trim() || comment.trim().length < 10}
                className="flex-1"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Envoi...
                  </div>
                ) : (
                  'Publier l\'avis'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}