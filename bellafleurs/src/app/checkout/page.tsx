// src/app/checkout/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Truck, CreditCard, User, MapPin, Calendar, AlertCircle, CheckCircle, Loader2, Gift } from 'lucide-react';
import StripePaymentForm from '@/components/checkout/StripePaymentForm';
import { usePostalCodeValidation } from '@/hooks/usePostalCodeValidation';

// Types
interface CartItem {
  _id?: string;
  product: string | { _id: string }; // ✅ Ajouter le champ product
  name: string;
  price: number;
  quantity: number;
  image: string;
  addedAt: Date;
  variantId?: string;
  variantName?: string;
  customPrice?: number;
}

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface DeliveryAddress {
  street: string;
  city: string;
  zipCode: string;
  country: string;
}

interface DeliveryInfo {
  address: DeliveryAddress;
  date: string;
  notes: string;
}

interface OrderData {
  items: Array<{
    product: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    variantId?: string;
    variantName?: string;
  }>;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  deliveryInfo: {
    type: 'delivery';
    address: DeliveryAddress;
    date: Date;
    timeSlot: string;
    notes?: string;
    isGift: boolean;
    giftInfo?: {
      recipientName: string;
      senderName: string;
    };
  };
  paymentMethod: string;
  totalAmount: number;
}

interface GiftInfo {
  isGift: boolean;
  recipientFirstName: string;
  recipientLastName: string;
}

interface TimeSlot {
  value: string;
  label: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();

  // États
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { validationState, validatePostalCode } = usePostalCodeValidation();

  // Informations client
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  // Informations de livraison
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    address: {
      street: '',
      city: '',
      zipCode: '',
      country: 'France'
    },
    date: '',
    notes: ''
  });

  // Option cadeau
  const [giftInfo, setGiftInfo] = useState<GiftInfo>({
    isGift: false,
    recipientFirstName: '',
    recipientLastName: ''
  });

  // Créneaux de livraison
  const timeSlots: TimeSlot[] = [
    { value: '9h-13h', label: '9h - 13h (matin)' },
    { value: '14h-19h', label: '14h - 19h (après-midi)' }
  ];
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  // Gestion ville - simplifié
  const [showCitySelect, setShowCitySelect] = useState(false);

  // ✅ CORRECTION: Synchroniser la ville basé sur la validation du code postal
  useEffect(() => {
    if (validationState.cities.length === 1) {
      // Une seule ville - remplir automatiquement
      setDeliveryInfo(prev => ({
        ...prev,
        address: { ...prev.address, city: validationState.cities[0] }
      }));
      setShowCitySelect(false);
    } else if (validationState.cities.length > 1) {
      // Plusieurs villes - montrer le select
      setShowCitySelect(true);
      // ✅ NE PAS vider la ville si elle est déjà sélectionnée et valide
      const currentCity = deliveryInfo.address.city;
      if (!currentCity || !validationState.cities.includes(currentCity)) {
        setDeliveryInfo(prev => ({
          ...prev,
          address: { ...prev.address, city: '' }
        }));
      }
    } else if (deliveryInfo.address.zipCode) {
      // Code postal saisi mais aucune ville trouvée
      setShowCitySelect(false);
      setDeliveryInfo(prev => ({
        ...prev,
        address: { ...prev.address, city: '' }
      }));
    }
  }, [validationState.cities, deliveryInfo.address.zipCode]);

  // Charger le panier
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch('/api/cart', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          // ✅ CORRECTION : Utiliser data.data.cart.items
          if (data.success && data.data?.cart?.items) {
            setCartItems(data.data.cart.items);
          }
        }
      } catch (error) {
        console.error('Erreur chargement panier:', error);
        toast.error('Erreur lors du chargement du panier');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  // Pré-remplir les infos si utilisateur connecté
  useEffect(() => {
    if (session?.user) {
      setCustomerInfo(prev => ({
        ...prev,
        email: session.user.email || '',
        firstName: session.user.name?.split(' ')[0] || '',
        lastName: session.user.name?.split(' ').slice(1).join(' ') || ''
      }));
    }
  }, [session]);

  // Calculs
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = subtotal >= 50 ? 0 : 5;
  const total = subtotal + deliveryFee;

  // ✅ VALIDATION avant paiement
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Vérifications client
    if (!customerInfo.firstName.trim()) newErrors.firstName = 'Prénom requis';
    if (!customerInfo.lastName.trim()) newErrors.lastName = 'Nom requis';
    if (!customerInfo.email.trim()) newErrors.email = 'Email requis';
    if (!customerInfo.phone.trim()) newErrors.phone = 'Téléphone requis';
    
    // Vérifications adresse
    if (!deliveryInfo.address.street.trim()) newErrors.street = 'Adresse requise';
    if (!deliveryInfo.address.zipCode.trim()) newErrors.zipCode = 'Code postal requis';
    if (!deliveryInfo.address.city.trim()) newErrors.city = 'Ville requise';
    
    // Vérifications livraison
    if (!deliveryInfo.date) newErrors.date = 'Date de livraison requise';
    if (!selectedTimeSlot) newErrors.timeSlot = 'Créneau requis';
    
    // Vérification zone de livraison
    if (!validationState.isDeliverable) {
      newErrors.zipCode = 'Cette zone n\'est pas couverte par nos livraisons';
    }
    
    // Validation cadeau
    if (giftInfo.isGift) {
      if (!giftInfo.recipientFirstName.trim()) newErrors.recipientFirstName = 'Prénom du destinataire requis';
      if (!giftInfo.recipientLastName.trim()) newErrors.recipientLastName = 'Nom du destinataire requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Données pour le paiement
  const orderDataForPayment = useMemo(() => {
    if (cartItems.length === 0) return null;
    
    return {
      items: cartItems.map(item => ({
        // ✅ SOLUTION: Gérer les deux cas de structure
        product: typeof item.product === 'string' 
          ? item.product 
          : (item.product as any)?._id || item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        variantId: item.variantId,
        variantName: item.variantName
      })),
      customerInfo: {
        name: giftInfo.isGift 
          ? `${giftInfo.recipientFirstName} ${giftInfo.recipientLastName}`.trim()
          : `${customerInfo.firstName} ${customerInfo.lastName}`.trim(),
        email: customerInfo.email,
        phone: customerInfo.phone
      },
      deliveryInfo: {
        type: 'delivery' as const,
        address: deliveryInfo.address,
        date: new Date(deliveryInfo.date),
        timeSlot: selectedTimeSlot,
        notes: deliveryInfo.notes || undefined,
        isGift: giftInfo.isGift,
        giftInfo: giftInfo.isGift ? {
          recipientName: `${giftInfo.recipientFirstName} ${giftInfo.recipientLastName}`.trim(),
          senderName: `${customerInfo.firstName} ${customerInfo.lastName}`.trim()
        } : undefined
      },
      paymentMethod: 'card',
      totalAmount: total
    };
  }, [cartItems, customerInfo, deliveryInfo, selectedTimeSlot, giftInfo, total]);

  // Gérer le succès du paiement
  const handlePaymentSuccess = async (paymentIntent: any) => {
    toast.success('Paiement confirmé !');
    
    // Vider le panier côté client
    try {
      console.log('🛒 Vidage du panier côté client...');
      const clearResponse = await fetch('/api/cart/clear', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (clearResponse.ok) {
        console.log('✅ Panier vidé côté client');
      } else {
        console.warn('⚠️ Erreur vidage panier côté client');
      }
    } catch (error) {
      console.warn('⚠️ Erreur vidage panier:', error);
    }
    
    router.push(`/checkout/success?payment_intent=${paymentIntent.id}`);
  };

  // Gérer les erreurs de paiement
  const handlePaymentError = (error: string) => {
    toast.error(error);
  };

  // Navigation entre étapes
  const nextStep = () => {
    if (currentStep === 1) {
      // Valider les infos client
      const newErrors: Record<string, string> = {};
      if (!customerInfo.firstName.trim()) newErrors.firstName = 'Prénom requis';
      if (!customerInfo.lastName.trim()) newErrors.lastName = 'Nom requis';
      if (!customerInfo.email.trim()) newErrors.email = 'Email requis';
      if (!customerInfo.phone.trim()) newErrors.phone = 'Téléphone requis';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }

    if (currentStep === 2) {
      // ✅ UTILISER la validation complète
      if (!validateForm()) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }
    }

    setErrors({});
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-8">
            <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Votre panier est vide</h2>
            <p className="text-gray-600 mb-4">Ajoutez des produits pour continuer</p>
            <Button onClick={() => router.push('/produits')}>
              Voir nos produits
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Finaliser ma commande</h1>
          
          {/* Indicateur d'étapes */}
          <div className="mt-6 flex items-center">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep >= step ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    currentStep > step ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-2 flex items-center text-sm text-gray-600">
            <span className={currentStep >= 1 ? 'text-green-600 font-medium' : ''}>
              Informations
            </span>
            <span className="mx-8 text-gray-400">•</span>
            <span className={currentStep >= 2 ? 'text-green-600 font-medium' : ''}>
              Livraison
            </span>
            <span className="mx-8 text-gray-400">•</span>
            <span className={currentStep >= 3 ? 'text-green-600 font-medium' : ''}>
              Paiement
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Formulaire principal */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Étape 1 : Informations client */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Vos informations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        value={customerInfo.firstName}
                        onChange={(e) => setCustomerInfo({...customerInfo, firstName: e.target.value})}
                        className={errors.firstName ? 'border-red-300' : ''}
                        placeholder="Jean"
                      />
                      {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        value={customerInfo.lastName}
                        onChange={(e) => setCustomerInfo({...customerInfo, lastName: e.target.value})}
                        className={errors.lastName ? 'border-red-300' : ''}
                        placeholder="Dupont"
                      />
                      {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                      className={errors.email ? 'border-red-300' : ''}
                      placeholder="jean.dupont@email.com"
                    />
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      className={errors.phone ? 'border-red-300' : ''}
                      placeholder="06 12 34 56 78"
                    />
                    {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={nextStep}
                      className="bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                    >
                      Continuer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Étape 2 : Livraison */}
            {currentStep === 2 && (
              <div className="space-y-6">
                
                {/* Option Cadeau */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Gift className="w-5 h-5 mr-2" />
                      C'est un cadeau ?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isGift"
                          checked={giftInfo.isGift}
                          onChange={(e) => setGiftInfo(prev => ({ 
                            ...prev, 
                            isGift: e.target.checked,
                            recipientFirstName: e.target.checked ? prev.recipientFirstName : '',
                            recipientLastName: e.target.checked ? prev.recipientLastName : ''
                          }))}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="isGift" className="text-sm">
                          Cette commande est un cadeau pour quelqu'un d'autre
                        </Label>
                      </div>
                      
                      {giftInfo.isGift && (
                        <div className="bg-pink-50 p-4 rounded-lg border border-pink-200 space-y-4">
                          <p className="text-sm text-pink-800 font-medium">
                            Informations du destinataire
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="recipientFirstName">Prénom du destinataire *</Label>
                              <Input
                                id="recipientFirstName"
                                value={giftInfo.recipientFirstName}
                                onChange={(e) => setGiftInfo(prev => ({
                                  ...prev,
                                  recipientFirstName: e.target.value
                                }))}
                                className={errors.recipientFirstName ? 'border-red-300 bg-red-50' : ''}
                                placeholder="Prénom"
                              />
                              {errors.recipientFirstName && (
                                <p className="text-red-600 text-sm mt-1">{errors.recipientFirstName}</p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="recipientLastName">Nom du destinataire *</Label>
                              <Input
                                id="recipientLastName"
                                value={giftInfo.recipientLastName}
                                onChange={(e) => setGiftInfo(prev => ({
                                  ...prev,
                                  recipientLastName: e.target.value
                                }))}
                                className={errors.recipientLastName ? 'border-red-300 bg-red-50' : ''}
                                placeholder="Nom"
                              />
                              {errors.recipientLastName && (
                                <p className="text-red-600 text-sm mt-1">{errors.recipientLastName}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Informations de livraison */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Truck className="w-5 h-5 mr-2" />
                      Informations de livraison
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    
                    <div>
                      <Label htmlFor="street">Adresse *</Label>
                      <Input
                        id="street"
                        value={deliveryInfo.address.street}
                        onChange={(e) => setDeliveryInfo({
                          ...deliveryInfo,
                          address: { ...deliveryInfo.address, street: e.target.value }
                        })}
                        className={errors.street ? 'border-red-300' : ''}
                        placeholder="123 rue de la Paix"
                      />
                      {errors.street && <p className="text-red-600 text-sm mt-1">{errors.street}</p>}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="zipCode">Code postal *</Label>
                        <div className="relative">
                          <Input
                            id="zipCode"
                            value={deliveryInfo.address.zipCode}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                              setDeliveryInfo({
                                ...deliveryInfo,
                                address: { ...deliveryInfo.address, zipCode: value }
                              });
                              validatePostalCode(value);
                            }}
                            className={`pr-10 ${
                              validationState.error ? 'border-red-300 bg-red-50' : 
                              validationState.isDeliverable ? 'border-green-500 bg-green-50' : 
                              'border-gray-300'
                            }`}
                            placeholder="91220"
                            maxLength={5}
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            {validationState.isLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                            {validationState.isDeliverable && <CheckCircle className="w-4 h-4 text-green-500" />}
                            {validationState.error && <AlertCircle className="w-4 h-4 text-red-500" />}
                          </div>
                        </div>
                        {validationState.error && (
                          <p className="text-red-600 text-sm mt-1 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {validationState.error}
                          </p>
                        )}
                        {validationState.isDeliverable && (
                          <p className="text-green-600 text-sm mt-1 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Zone de livraison validée
                          </p>
                        )}
                        {errors.zipCode && (
                          <p className="text-red-600 text-sm mt-1">{errors.zipCode}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="city">Ville *</Label>
                        {showCitySelect ? (
                          <select
                            id="city"
                            value={deliveryInfo.address.city}
                            onChange={(e) => setDeliveryInfo(prev => ({
                              ...prev,
                              address: { ...prev.address, city: e.target.value }
                            }))}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                              errors.city ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                          >
                            <option value="">Sélectionnez votre ville</option>
                            {validationState.cities.map((city) => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            id="city"
                            value={validationState.city || deliveryInfo.address.city}
                            disabled={true}
                            className="bg-gray-50 text-gray-700"
                            placeholder="Ville"
                          />
                        )}
                        {!showCitySelect && (
                          <p className="text-xs text-gray-500 mt-1">
                            La ville sera automatiquement remplie
                          </p>
                        )}
                        {showCitySelect && (
                          <p className="text-xs text-blue-600 mt-1">
                            Plusieurs villes trouvées - veuillez sélectionner la vôtre
                          </p>
                        )}
                        {errors.city && (
                          <p className="text-red-600 text-sm mt-1">{errors.city}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date">Date de livraison *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={deliveryInfo.date}
                          onChange={(e) => setDeliveryInfo({...deliveryInfo, date: e.target.value})}
                          className={errors.date ? 'border-red-300' : ''}
                          min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                        />
                        {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
                      </div>
                      
                      <div>
                        <Label htmlFor="timeSlot">Créneau de livraison *</Label>
                        <select
                          id="timeSlot"
                          value={selectedTimeSlot}
                          onChange={(e) => setSelectedTimeSlot(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                            errors.timeSlot ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Choisissez votre créneau</option>
                          {timeSlots.map((slot) => (
                            <option key={slot.value} value={slot.value}>
                              {slot.label}
                            </option>
                          ))}
                        </select>
                        {errors.timeSlot && (
                          <p className="text-red-600 text-sm mt-1">{errors.timeSlot}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Sélectionnez votre créneau préféré pour la livraison
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="notes">Instructions de livraison</Label>
                      <Textarea
                        id="notes"
                        value={deliveryInfo.notes}
                        onChange={(e) => setDeliveryInfo({...deliveryInfo, notes: e.target.value})}
                        placeholder="Étage, code d'accès, instructions spéciales..."
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button variant="outline" onClick={prevStep}>
                        Retour
                      </Button>
                      <Button 
                        onClick={nextStep}
                        disabled={!validationState.isDeliverable}
                        className={!validationState.isDeliverable ? 'bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 opacity-50 cursor-not-allowed' : 'bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200'}
                      >
                        Continuer vers le paiement
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Étape 3 : Paiement */}
            {currentStep === 3 && orderDataForPayment && (
              <StripePaymentForm
                orderData={orderDataForPayment}
                amount={total}
                currency="eur"
                customerEmail={customerInfo.email}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                disabled={false}
              />
            )}

            {currentStep === 3 && (
              <div className="flex justify-start">
                <Button variant="outline" onClick={prevStep}>
                  Retour
                </Button>
              </div>
            )}
          </div>

          {/* Résumé de commande */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Résumé de commande
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Articles */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={`${item._id}-${item.variantId || 'default'}`} className="flex items-center space-x-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </p>
                        {item.variantName && (
                          <p className="text-xs text-gray-500">{item.variantName}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          Quantité: {item.quantity}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {(item.price * item.quantity).toFixed(2)} €
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totaux */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sous-total</span>
                    <span>{subtotal.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Livraison</span>
                    <span>{deliveryFee === 0 ? 'Gratuite' : `${deliveryFee.toFixed(2)} €`}</span>
                  </div>
                  {deliveryFee === 0 && (
                    <p className="text-xs text-green-600">
                      Livraison gratuite dès 50€
                    </p>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{total.toFixed(2)} €</span>
                </div>

                {/* Informations client et livraison dans le résumé */}
                {(customerInfo.firstName || deliveryInfo.address.street) && (
                  <>
                    <Separator />
                    <div className="text-sm space-y-2">
                      {customerInfo.firstName && (
                        <div>
                          <p className="font-medium text-gray-900">
                            {giftInfo.isGift ? 'Expéditeur' : 'Client'}
                          </p>
                          <p className="text-gray-600">
                            {customerInfo.firstName} {customerInfo.lastName}
                          </p>
                          <p className="text-gray-600">{customerInfo.email}</p>
                          
                          {giftInfo.isGift && giftInfo.recipientFirstName && (
                            <div className="mt-3">
                              <p className="font-medium text-gray-900">Destinataire</p>
                              <p className="text-gray-600">
                                {giftInfo.recipientFirstName} {giftInfo.recipientLastName}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {deliveryInfo.address.street && (
                        <div className="mt-3">
                          <p className="font-medium text-gray-900">Livraison</p>
                          <p className="text-gray-600">
                            {deliveryInfo.address.street}<br />
                            {deliveryInfo.address.zipCode} {deliveryInfo.address.city}
                          </p>
                          {deliveryInfo.date && (
                            <p className="text-gray-600">
                              Le {new Date(deliveryInfo.date).toLocaleDateString('fr-FR')}
                              {selectedTimeSlot && ` (${selectedTimeSlot})`}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}