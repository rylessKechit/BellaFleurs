// src/components/checkout/CorporateCheckout.tsx - VERSION CORRIGÉE COMPLÈTE
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Euro,
  Clock
} from 'lucide-react';
import { useCorporateCheckout } from '@/lib/hooks/useCorporateCheckout';
import { toast } from 'sonner';

interface CorporateCheckoutProps {
  onSuccess?: (orderId: string) => void;
}

export default function CorporateCheckout({ onSuccess }: CorporateCheckoutProps) {
  const { data: session } = useSession();
  const router = useRouter();
  
  // State local pour les items du panier
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  
  const {
    isCorporateAccount,
    corporateData,
    usage,
    isLoading,
    isCreatingOrder,
    createCorporateOrder,
    updateDeliveryInfo
  } = useCorporateCheckout(cartTotal);

  const [deliveryDate, setDeliveryDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('9h-13h');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Charger les items du panier
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setIsLoadingCart(true);
        const response = await fetch('/api/cart', { credentials: 'include' });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.cart) {
            setCartItems(data.data.cart.items || []);
            setCartTotal(data.data.cart.totalAmount || 0);
          }
        }
      } catch (error) {
        console.error('Erreur chargement panier:', error);
      } finally {
        setIsLoadingCart(false);
      }
    };

    fetchCart();
  }, []);

  // Redirection si pas corporate
  useEffect(() => {
    if (!isLoading && !isCorporateAccount) {
      router.push('/checkout'); // Rediriger vers checkout normal
      return;
    }
  }, [isLoading, isCorporateAccount, router]);

  // ✅ NOUVELLES RÈGLES DE DATE/HEURE (identiques au checkout normal)
  const getAvailableTimeSlots = () => {
    const baseTimeSlots = [
      { value: '9h-13h', label: '9h - 13h (matin)' },
      { value: '14h-19h', label: '14h - 19h (après-midi)' }
    ];

    // Si aucune date sélectionnée, retourner tous les créneaux
    if (!deliveryDate) {
      return baseTimeSlots;
    }

    // Calculer les dates
    const selectedDate = new Date(deliveryDate);
    selectedDate.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    dayAfterTomorrow.setHours(0, 0, 0, 0);
    
    const isTomorrow = selectedDate.getTime() === tomorrow.getTime();
    const isDayAfterTomorrow = selectedDate.getTime() === dayAfterTomorrow.getTime();
    
    // Vérifier l'heure actuelle (20h = seuil)
    const currentHour = new Date().getHours();
    const isAfter8PM = currentHour >= 20;

    // LOGIQUE IDENTIQUE AU CHECKOUT NORMAL
    if (isTomorrow) {
      if (isAfter8PM) {
        // Après 20h : J+1 complètement bloqué
        return [];
      } else {
        // Avant 20h : J+1 matin + après-midi disponibles
        return baseTimeSlots;
      }
    }

    if (isDayAfterTomorrow && isAfter8PM) {
      // Après 20h : J+2 devient le premier jour disponible
      return baseTimeSlots;
    }

    // Pour toutes les autres dates
    return baseTimeSlots;
  };

  const handleDeliveryDateChange = (date: string) => {
    if (!date) {
      setDeliveryDate('');
      updateDeliveryInfo({ date: '', timeSlot, notes: deliveryNotes });
      return;
    }
    
    // ✅ VALIDATION avec règles identiques au checkout normal
    const selected = new Date(date);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const selectedMidnight = new Date(selected);
    selectedMidnight.setHours(0, 0, 0, 0);

    // Vérifier l'heure actuelle (règle 20h)
    const currentHour = new Date().getHours();
    const isAfter8PM = currentHour >= 20;

    // Validation: pas aujourd'hui
    if (selectedMidnight < tomorrow) {
      toast.error('Livraison impossible aujourd\'hui. Sélectionnez une date à partir de demain.');
      return;
    }

    // NOUVELLE VALIDATION : Si après 20h, J+1 interdit
    if (isAfter8PM && selectedMidnight.getTime() === tomorrow.getTime()) {
      toast.error('Après 20h, livraison impossible demain. Sélectionnez une date à partir d\'après-demain.');
      return;
    }
    
    // Vérification dimanche (pas de livraison)
    const dayOfWeek = selectedMidnight.getDay();
    if (dayOfWeek === 0) { // 0 = Dimanche
      toast.error('Pas de livraison le dimanche. Veuillez choisir un autre jour.');
      return;
    }

    // Date valide
    setDeliveryDate(date);
    updateDeliveryInfo({ date, timeSlot, notes: deliveryNotes });
  };

  const handleTimeSlotChange = (slot: string) => {
    setTimeSlot(slot);
    updateDeliveryInfo({ date: deliveryDate, timeSlot: slot, notes: deliveryNotes });
  };

  const handleNotesChange = (notes: string) => {
    setDeliveryNotes(notes);
    updateDeliveryInfo({ date: deliveryDate, timeSlot, notes });
  };

  // Vérification de budget
  const budgetStatus = usage ? {
    canOrder: usage.currentMonth.canOrder,
    remainingBudget: usage.currentMonth.remainingBudget,
    wouldExceed: usage.wouldExceedLimit,
    percentage: (usage.currentMonth.spent / usage.currentMonth.limit) * 100
  } : null;

  const handleSubmitOrder = async () => {
    if (!corporateData || !deliveryDate) {
      toast.error('Informations de livraison incomplètes');
      return;
    }

    if (!budgetStatus?.canOrder) {
      toast.error('Cette commande dépasserait votre limite mensuelle');
      return;
    }

    if (!cartItems.length) {
      toast.error('Votre panier est vide');
      return;
    }

    if (!timeSlot) {
      toast.error('Veuillez sélectionner un créneau horaire');
      return;
    }

    try {
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.product?._id || item.product,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          customization: item.customization
        })),
        totalAmount: cartTotal,
        customerInfo: corporateData.customerInfo,
        deliveryInfo: {
          ...corporateData.deliveryInfo,
          date: deliveryDate,
          timeSlot,
          notes: deliveryNotes
        }
      };

      const order = await createCorporateOrder(orderData);
      
      // Succès - vider le panier
      toast.success('Commande corporate créée avec succès !');
      
      if (onSuccess) {
        onSuccess(order._id);
      } else {
        router.push(`/corporate/orders/${order._id}?success=true`);
      }

    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création de la commande');
    }
  };

  if (isLoading || isLoadingCart) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de vos données corporate...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isCorporateAccount || !corporateData) {
    return null;
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header Corporate */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Commande Corporate</h1>
              <p className="text-blue-700">
                {corporateData.customerInfo.company} - Facturation mensuelle
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Status */}
      {budgetStatus && (
        <Card className={budgetStatus.canOrder ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {budgetStatus.canOrder ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                )}
                <div>
                  <h3 className="font-semibold">Budget mensuel</h3>
                  <p className="text-sm text-gray-600">
                    {usage?.currentMonth.spent.toFixed(2)}€ / {usage?.currentMonth.limit.toFixed(2)}€ utilisés
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {budgetStatus.remainingBudget.toFixed(2)}€
                </p>
                <p className="text-sm text-gray-600">Budget restant</p>
              </div>
            </div>
            
            {/* Barre de progression */}
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    budgetStatus.percentage >= 90 ? 'bg-red-500' : 
                    budgetStatus.percentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(budgetStatus.percentage, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {budgetStatus.percentage.toFixed(1)}% du budget utilisé
              </p>
            </div>

            {budgetStatus.wouldExceed && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Cette commande de {cartTotal.toFixed(2)}€ dépasserait votre limite mensuelle.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations pré-remplies */}
        <div className="space-y-6">
          {/* ✅ INFORMATIONS DE CONTACT CORRIGÉES */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Informations de contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prénom</Label>
                  <Input 
                    value={corporateData.customerInfo.firstName} 
                    readOnly 
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label>Nom</Label>
                  <Input 
                    value={corporateData.customerInfo.lastName} 
                    readOnly 
                    className="bg-gray-50"
                  />
                </div>
              </div>
              
              <div>
                <Label>Entreprise</Label>
                <Input 
                  value={corporateData.customerInfo.company} 
                  readOnly 
                  className="bg-gray-50"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input 
                    value={corporateData.customerInfo.email} 
                    readOnly 
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label>Téléphone</Label>
                  <Input 
                    value={corporateData.customerInfo.phone || 'Non renseigné'} 
                    readOnly 
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Informations pré-remplies depuis votre compte corporate. 
                  Pour les modifier, contactez votre administrateur.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* ✅ ADRESSE DE LIVRAISON CORRIGÉE */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Adresse de livraison
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Adresse</Label>
                <Input 
                  value={corporateData.deliveryInfo.address.street || 'Non renseignée'} 
                  readOnly 
                  className="bg-gray-50"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Code postal</Label>
                  <Input 
                    value={corporateData.deliveryInfo.address.zipCode || 'Non renseigné'} 
                    readOnly 
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label>Ville</Label>
                  <Input 
                    value={corporateData.deliveryInfo.address.city || 'Non renseignée'} 
                    readOnly 
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label>Pays</Label>
                  <Input 
                    value={corporateData.deliveryInfo.address.country || 'France'} 
                    readOnly 
                    className="bg-gray-50"
                  />
                </div>
              </div>

              {(!corporateData.deliveryInfo.address.street || !corporateData.deliveryInfo.address.zipCode) && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-orange-800">
                    Adresse incomplète dans votre profil corporate. Contactez votre administrateur pour la compléter.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ✅ INFORMATIONS DE LIVRAISON AVEC RÈGLES */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Planification de livraison
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="deliveryDate">Date de livraison *</Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => handleDeliveryDateChange(e.target.value)}
                  min={minDate}
                  required
                />
              </div>

              <div>
                <Label htmlFor="timeSlot">Créneau horaire *</Label>
                <select
                  id="timeSlot"
                  value={timeSlot}
                  onChange={(e) => handleTimeSlotChange(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Choisissez votre créneau</option>
                  {getAvailableTimeSlots().map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
                {getAvailableTimeSlots().length === 0 && deliveryDate && (
                  <p className="text-red-600 text-sm mt-1">
                    Aucun créneau disponible pour cette date. Choisissez une autre date.
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {deliveryDate && (() => {
                    const selectedDate = new Date(deliveryDate);
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    const currentHour = new Date().getHours();
                    const isAfter8PM = currentHour >= 20;
                    
                    if (selectedDate.toDateString() === tomorrow.toDateString()) {
                      if (isAfter8PM) {
                        return "Après 20h, aucun créneau disponible pour demain.";
                      } else {
                        return "Avant 20h, tous les créneaux sont disponibles pour demain.";
                      }
                    }
                    return "Tous les créneaux sont disponibles.";
                  })()}
                </p>
              </div>

              <div>
                <Label htmlFor="notes">Instructions de livraison</Label>
                <Textarea
                  id="notes"
                  value={deliveryNotes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="Étage, code d'accès, instructions spéciales..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Récapitulatif et validation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Euro className="w-5 h-5 mr-2" />
                Récapitulatif de commande
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-t border-b py-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total de la commande :</span>
                  <span>{cartTotal.toFixed(2)} €</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Sera inclus dans votre facture mensuelle
                </p>
              </div>

              <Alert className="bg-yellow-50 border-yellow-200">
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  <strong>Facturation corporate :</strong> Cette commande sera ajoutée à votre facture mensuelle. 
                  Aucun paiement immédiat requis.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleSubmitOrder}
                disabled={!deliveryDate || !timeSlot || !budgetStatus?.canOrder || isCreatingOrder || !cartItems.length}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                {isCreatingOrder ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Création en cours...
                  </>
                ) : (
                  'Confirmer la commande corporate'
                )}
              </Button>

              {!budgetStatus?.canOrder && (
                <p className="text-sm text-red-600 text-center">
                  Cette commande dépasserait votre limite mensuelle de {usage?.currentMonth.limit}€
                </p>
              )}

              {cartItems.length === 0 && (
                <p className="text-sm text-gray-600 text-center">
                  Votre panier est vide
                </p>
              )}

              {!timeSlot && deliveryDate && (
                <p className="text-sm text-red-600 text-center">
                  Veuillez sélectionner un créneau horaire
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}