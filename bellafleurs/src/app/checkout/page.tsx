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
import { ShoppingCart, Truck, CreditCard, User, MapPin, Calendar, AlertCircle, CheckCircle, Loader2, Gift, AlertTriangle, Clock } from 'lucide-react';
import StripePaymentForm from '@/components/checkout/StripePaymentForm';
import CorporateCheckout from '@/components/checkout/CorporateCheckout';
import { usePostalCodeValidation } from '@/hooks/usePostalCodeValidation';
import { IProduct } from '@/types/index';
import { useDeuil } from '../../hooks/useDeuil';
import DeuilForm from '../../components/DeuilForm';
import { 
  DeuilInfo, 
  validateDeuilForm, 
  hasDeuilValidationErrors,
  formatDeuilDataForOrder,
  DeuilValidationErrors 
} from '../../utils/deuilValidation';


function useShopStatus() {
  const [status, setStatus] = useState({
    isOpen: true,
    isClosed: false,
    reason: '',
    message: '',
    startDate: '',
    endDate: '',
    loading: true,
    // Ajout des données de fermeture pour la validation des dates
    shopClosure: {
      isEnabled: false,
      startDate: undefined as string | undefined,
      endDate: undefined as string | undefined,
      reason: undefined as string | undefined
    }
  });

  useEffect(() => {
    async function checkStatus() {
      try {
        const response = await fetch('/api/shop/status');
        const result = await response.json();
        
        if (result.success) {
          const data = result.data;
          
          // Si on a des dates de fermeture, les paramètres de fermeture sont activés
          const hasClosureDates = data.startDate && data.endDate;
          
          setStatus({
            ...data,
            loading: false,
            // Construire les données de fermeture pour la validation
            shopClosure: {
              isEnabled: hasClosureDates, // Activé si on a des dates
              startDate: data.startDate,
              endDate: data.endDate,
              reason: data.reason
            }
          });
        } else {
          setStatus({
            isOpen: true,
            loading: false,
            isClosed: false,
            reason: '',
            message: '',
            startDate: '',
            endDate: '',
            shopClosure: {
              isEnabled: false,
              startDate: undefined,
              endDate: undefined,
              reason: undefined
            }
          });
        }
      } catch (error) {
        console.error('Erreur vérification statut:', error);
        setStatus({
          isOpen: true,
          loading: false,
          isClosed: false,
          reason: '',
          message: '',
          startDate: '',
          endDate: '',
          shopClosure: {
            isEnabled: false,
            startDate: undefined,
            endDate: undefined,
            reason: undefined
          }
        });
      }
    }

    checkStatus();
  }, []);

  return status;
}

// Fonction pour vérifier si une date tombe pendant une fermeture
const isDateDuringClosure = (
  deliveryDate: string, 
  closureSettings?: {
    isEnabled: boolean;
    startDate?: string;
    endDate?: string;
  }
): boolean => {
  if (!closureSettings?.isEnabled || !closureSettings.startDate || !closureSettings.endDate) {
    return false;
  }

  const delivery = new Date(deliveryDate);
  const closureStart = new Date(closureSettings.startDate);
  const closureEnd = new Date(closureSettings.endDate);

  // Normaliser les dates à minuit pour comparaison
  delivery.setHours(0, 0, 0, 0);
  closureStart.setHours(0, 0, 0, 0);
  closureEnd.setHours(0, 0, 0, 0);

  return delivery >= closureStart && delivery <= closureEnd;
};

// Types
interface CartItem {
  _id?: string;
  product: IProduct; // ✅ Ajouter le champ product
  name: string;
  price: number;
  quantity: number;
  image: string;
  addedAt: Date;
  isActive: boolean;
  variantId?: string;
  variantName?: string;
  customPrice?: number;
  freeDelivery?: boolean;
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
      message?: string; // ✨ SEULE MODIFICATION: Ajout message
    };
  };
  paymentMethod: string;
  totalAmount: number;
}

interface GiftInfo {
  isGift: boolean;
  recipientFirstName: string;
  recipientLastName: string;
  message: string; // ✨ SEULE MODIFICATION: Ajout message
}

interface TimeSlot {
  value: string;
  label: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const shopStatus = useShopStatus();

  // ✨ NOUVELLE LOGIQUE B2B - 3 LIGNES AJOUTÉES
  const isCorporateAccount = session?.user && (session.user as any).accountType === 'corporate';
  
  // Si c'est un compte corporate, utiliser le checkout B2B
  if (isCorporateAccount) {
    return <CorporateCheckout />;
  }

  const [deuilInfo, setDeuilInfo] = useState<DeuilInfo>({
    isDeuil: false,
    defuntName: '',
    condolenceMessage: '',
    senderName: ''
  });

  const [deuilErrors, setDeuilErrors] = useState<DeuilValidationErrors>({});

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
    recipientLastName: '',
    message: '' // ✨ SEULE MODIFICATION: Ajout message
  });

  // Créneaux de livraison avec logique heure 20h
    // Créneaux de livraison avec logique spéciale pour deuil
  const getAvailableTimeSlots = () => {
    // ✅ NOUVEAU : Créneaux spéciaux pour arrangements funéraires
    if (hasDeuil) {
      return [
        { value: '9h', label: '9h' },
        { value: '10h', label: '10h' },
        { value: '11h', label: '11h' },
        { value: '12h', label: '12h' },
        { value: '13h', label: '13h' },
        { value: '14h', label: '14h' },
        { value: '15h', label: '15h' },
        { value: '16h', label: '16h' },
        { value: '17h', label: '17h' },
        { value: '18h', label: '18h' },
        { value: '19h', label: '19h' }
      ];
    }

    // ✅ Créneaux normaux pour produits classiques
    const baseTimeSlots: TimeSlot[] = [
      { value: '9h-13h', label: '9h - 13h (matin)' },
      { value: '14h-19h', label: '14h - 19h (après-midi)' }
    ];

    // Si aucune date n'est sélectionnée, retourner tous les créneaux
    if (!deliveryInfo.date) {
      return baseTimeSlots;
    }

    // Calculer les dates
    const selectedDate = new Date(deliveryInfo.date);
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

    // NOUVELLE LOGIQUE
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

    // Pour toutes les autres dates (J+2+ normalement, J+3+ si après 20h)
    return baseTimeSlots;
  };

  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  useEffect(() => {
    const availableSlots = getAvailableTimeSlots();
    const isSelectedSlotAvailable = availableSlots.some(slot => slot.value === selectedTimeSlot);
    
    // Si le créneau sélectionné n'est plus disponible, le réinitialiser
    if (selectedTimeSlot && !isSelectedSlotAvailable) {
      setSelectedTimeSlot('');
      // Optionnel : afficher un message informatif
      setErrors(prev => ({
        ...prev,
        timeSlot: 'Le créneau matin n\'est pas disponible pour une livraison demain.'
      }));
    } else if (selectedTimeSlot && isSelectedSlotAvailable) {
      // Effacer l'erreur si le créneau redevient valide
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.timeSlot;
        return newErrors;
      });
    }
  }, [deliveryInfo.date, selectedTimeSlot]);

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
          if (data.success && data.data?.cart?.items) {
            setCartItems(data.data.cart.items);
            // ✅ LIGNE DE DEBUG - Ajoute temporairement
            console.log('🛒 Items du panier:', data.data.cart.items);
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
  const hasFreeDeliveryItem = cartItems.some(item => item.product.freeDelivery);
  const deliveryFee = (hasFreeDeliveryItem || subtotal >= 50) ? 0 : 5;
  const total = subtotal + deliveryFee;

  const { hasDeuil, isDeuilOnly, hasMixedCategories } = useDeuil(cartItems);

  useEffect(() => {
  if (hasDeuil && !deuilInfo.isDeuil) {
    setDeuilInfo(prev => ({
      ...prev,
      isDeuil: true,
      senderName: `${customerInfo.firstName} ${customerInfo.lastName}`.trim()
    }));
  }
}, [hasDeuil, customerInfo.firstName, customerInfo.lastName]);

  // ✅ VALIDATION avant paiement
    // Fonction de validation globale incluant deuil
  const validateAllForms = (): boolean => {
    let hasErrors = false;
    const newErrors: Record<string, string> = {};

    // === VALIDATION INFORMATIONS CLIENT ===
    if (!customerInfo.firstName.trim()) {
      newErrors.firstName = 'Le prénom est obligatoire';
      hasErrors = true;
    }
    
    if (!customerInfo.lastName.trim()) {
      newErrors.lastName = 'Le nom est obligatoire';
      hasErrors = true;
    }
    
    if (!customerInfo.email.trim()) {
      newErrors.email = 'L\'email est obligatoire';
      hasErrors = true;
    } else if (!/\S+@\S+\.\S+/.test(customerInfo.email)) {
      newErrors.email = 'Format d\'email invalide';
      hasErrors = true;
    }
    
    if (!customerInfo.phone.trim()) {
      newErrors.phone = 'Le téléphone est obligatoire';
      hasErrors = true;
    }

    // === VALIDATION LIVRAISON ===
    if (!deliveryInfo.address.street.trim()) {
      newErrors.street = 'L\'adresse est obligatoire';
      hasErrors = true;
    }
    
    if (!deliveryInfo.address.zipCode.trim()) {
      newErrors.zipCode = 'Le code postal est obligatoire';
      hasErrors = true;
    }
    
    if (!deliveryInfo.address.city.trim()) {
      newErrors.city = 'La ville est obligatoire';
      hasErrors = true;
    }
    
    if (!deliveryInfo.date) {
      newErrors.date = 'La date de livraison est obligatoire';
      hasErrors = true;
    }
    
    if (!selectedTimeSlot) {
      newErrors.timeSlot = 'Veuillez sélectionner un créneau horaire';
      hasErrors = true;
    }

    // === VALIDATION CADEAU CLASSIQUE ===
    if (giftInfo.isGift && !hasDeuil) {
      if (!giftInfo.recipientFirstName.trim()) {
        newErrors.recipientFirstName = 'Le prénom du destinataire est obligatoire';
        hasErrors = true;
      }
      
      if (!giftInfo.recipientLastName.trim()) {
        newErrors.recipientLastName = 'Le nom du destinataire est obligatoire';
        hasErrors = true;
      }
    }

    // === VALIDATION SPÉCIFIQUE DEUIL ===
    if (hasDeuil && deuilInfo.isDeuil) {
      const deuilValidationErrors = validateDeuilForm(deuilInfo);
      setDeuilErrors(deuilValidationErrors);
      
      if (hasDeuilValidationErrors(deuilValidationErrors)) {
        hasErrors = true;
        toast.error('Veuillez compléter les informations pour l\'arrangement funéraire');
      }
    }

    // Appliquer les erreurs générales
    setErrors(newErrors);
    
    // Afficher message d'erreur global si nécessaire
    if (hasErrors && !hasDeuil) {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
    }

    return !hasErrors;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    
    if (!selectedDate) {
      setDeliveryInfo({...deliveryInfo, date: ''});
      return;
    }
    
    // VALIDATION TEMPS RÉEL avec logique 20h
    const selected = new Date(selectedDate);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const selectedMidnight = new Date(selected);
    selectedMidnight.setHours(0, 0, 0, 0);

    // Vérifier l'heure actuelle
    const currentHour = new Date().getHours();
    const isAfter8PM = currentHour >= 20;

    if (selectedMidnight < tomorrow) {
      setErrors(prev => ({
        ...prev,
        date: 'Livraison impossible aujourd\'hui. Sélectionnez une date à partir de demain.'
      }));
      return;
    }

    // NOUVELLE VALIDATION : Si après 20h, J+1 interdit
    if (isAfter8PM && selectedMidnight.getTime() === tomorrow.getTime()) {
      setErrors(prev => ({
        ...prev,
        date: 'Après 20h, livraison impossible demain. Sélectionnez une date à partir d\'après-demain.'
      }));
      return;
    }
    
    // VALIDATION FERMETURE PROGRAMMÉE
    if (shopStatus.shopClosure && isDateDuringClosure(selectedDate, shopStatus.shopClosure)) {
      const startDate = shopStatus.shopClosure.startDate;
      const endDate = shopStatus.shopClosure.endDate;
      const reason = shopStatus.shopClosure.reason || 'Fermeture programmée';
      
      setErrors(prev => ({
        ...prev,
        date: `Nous serons fermés du ${startDate ? new Date(startDate).toLocaleDateString('fr-FR') : '?'} au ${endDate ? new Date(endDate).toLocaleDateString('fr-FR') : '?'} - ${reason}. Choisissez une autre date.`
      }));
      return;
    }
    
    // Date valide
    setDeliveryInfo({...deliveryInfo, date: selectedDate});
    setErrors(prev => {
      const newErrors = {...prev};
      delete newErrors.date;
      return newErrors;
    });
  };

  // Données pour le paiement
  const orderDataForPayment = useMemo(() => {
  if (cartItems.length === 0) return null;
  
  // Préparer les données de deuil si applicable
  const deuilData = hasDeuil && deuilInfo.isDeuil 
      ? formatDeuilDataForOrder(deuilInfo) 
      : null;
    
    return {
      items: cartItems.map(item => ({
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
        
        // MODIFICATION : Gérer à la fois cadeaux et deuil
        isGift: giftInfo.isGift || (deuilData?.isGift || false),
        giftInfo: giftInfo.isGift ? {
        recipientName: `${giftInfo.recipientFirstName} ${giftInfo.recipientLastName}`.trim(),
        senderName: `${customerInfo.firstName} ${customerInfo.lastName}`.trim(),
        message: giftInfo.message
      } : deuilData ? {
        recipientName: `${deuilData.defuntName}`,
        senderName: deuilData.senderName, // ✅ ASSURE-TOI QUE C'EST BIEN LÀ
        message: deuilData.message,
        // Champs spécifiques au deuil
        isDeuil: true,
        defuntName: deuilData.defuntName,
        condolenceMessage: deuilData.condolenceMessage
      } : undefined
      },
      paymentMethod: 'card',
      totalAmount: total
    };
  }, [cartItems, customerInfo, deliveryInfo, selectedTimeSlot, giftInfo, deuilInfo, hasDeuil, total]);

  // Gérer le succès du paiement
  const handlePaymentSuccess = async (paymentIntent: any) => {
    toast.success('Paiement confirmé !');
    
    // Vider le panier côté client
    try {
      const clearResponse = await fetch('/api/cart/clear', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (clearResponse.ok) {
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
    // Nettoyer les erreurs précédentes
    setErrors({});
    
    if (currentStep === 1) {
      // Validation des informations client
      const newErrors: Record<string, string> = {};
      
      if (!customerInfo.firstName.trim()) {
        newErrors.firstName = 'Prénom requis';
      }
      
      if (!customerInfo.lastName.trim()) {
        newErrors.lastName = 'Nom requis';
      }
      
      if (!customerInfo.email.trim()) {
        newErrors.email = 'Email requis';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
        newErrors.email = 'Format d\'email invalide';
      }
      
      if (!customerInfo.phone.trim()) {
        newErrors.phone = 'Téléphone requis';
      } else if (!/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/.test(customerInfo.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Format de téléphone invalide';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }

    if (currentStep === 2) {
      // Validation des informations de livraison
      const newErrors: Record<string, string> = {};
      
      // Validation de l'adresse
      if (!deliveryInfo.address.street.trim()) {
        newErrors.street = 'Adresse requise';
      }
      
      if (!deliveryInfo.address.zipCode.trim()) {
        newErrors.zipCode = 'Code postal requis';
      } else if (!/^\d{5}$/.test(deliveryInfo.address.zipCode.trim())) {
        newErrors.zipCode = 'Code postal invalide (5 chiffres)';
      }
      
      if (!deliveryInfo.address.city.trim()) {
        newErrors.city = 'Ville requise';
      }
      
      // VALIDATION STRICTE DE LA DATE - NOUVELLE VERSION MOBILE
      if (!deliveryInfo.date) {
        newErrors.date = 'Date de livraison requise';
      } else {
        // Calculer demain à 00h00
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        // Date sélectionnée à 00h00
        const selectedDate = new Date(deliveryInfo.date);
        selectedDate.setHours(0, 0, 0, 0);
        
        // Vérification stricte : la date doit être >= demain
        if (selectedDate < tomorrow) {
          newErrors.date = 'Livraison impossible aujourd\'hui. Veuillez sélectionner une date à partir de demain.';
        }
        
        // VALIDATION FERMETURE PROGRAMMÉE
        if (shopStatus.shopClosure && isDateDuringClosure(deliveryInfo.date, shopStatus.shopClosure)) {
          const reason = shopStatus.shopClosure.reason || 'Fermeture programmée';
          newErrors.date = `Nous serons fermés pendant cette période (${reason}). Choisissez une autre date.`;
        }
        
        // Vérification week-end (optionnel - supprime si tu livres le dimanche)
        const dayOfWeek = selectedDate.getDay();
        if (dayOfWeek === 0) { // 0 = Dimanche
          newErrors.date = 'Pas de livraison le dimanche. Veuillez choisir un autre jour.';
        }
      }
      
      // Validation du créneau horaire
      if (!selectedTimeSlot) {
        newErrors.timeSlot = 'Créneau de livraison requis';
      }
      
      // Validation zone de livraison
      if (!validationState.isDeliverable) {
        newErrors.zipCode = 'Zone non couverte par nos services de livraison';
      }
      
      // Validation informations cadeau si activé
      if (giftInfo.isGift) {
        if (!giftInfo.recipientFirstName.trim()) {
          newErrors.recipientFirstName = 'Prénom du destinataire requis';
        }
        if (!giftInfo.recipientLastName.trim()) {
          newErrors.recipientLastName = 'Nom du destinataire requis';
        }
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        // Faire défiler vers la première erreur
        const firstErrorElement = document.querySelector('.border-red-300');
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
    }

    // Si toutes les validations passent, passer à l'étape suivante
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Si le shop est fermé, afficher le message de fermeture
  if (!shopStatus.loading && !shopStatus.isOpen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-orange-600" />
                </div>
                <h1 className="text-2xl font-bold text-orange-800 mb-2">
                  Boutique temporairement fermée
                </h1>
                <p className="text-orange-700 text-lg">
                  {shopStatus.message}
                </p>
              </div>

              {shopStatus.reason && (
                <div className="mb-6">
                  <p className="text-orange-600">
                    <strong>Raison :</strong> {shopStatus.reason}
                  </p>
                </div>
              )}

              {shopStatus.startDate && shopStatus.endDate && (
                <div className="bg-white/50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center text-orange-700 mb-2">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="font-medium">Période de fermeture</span>
                  </div>
                  <p className="text-sm text-orange-600">
                    Du {new Date(shopStatus.startDate).toLocaleDateString('fr-FR')} 
                    {' au '} 
                    {new Date(shopStatus.endDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <p className="text-orange-700">
                  Les commandes reprendront automatiquement après cette période.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/produits'}
                    className="border-orange-200 text-orange-700 hover:bg-orange-100"
                  >
                    Voir nos créations
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/contact'}
                    className="border-orange-200 text-orange-700 hover:bg-orange-100"
                  >
                    Nous contacter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading || shopStatus.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{shopStatus.loading ? 'Vérification...' : 'Chargement...'}</p>
        </div>
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
                {hasDeuil && (
                  <DeuilForm
                    deuilInfo={deuilInfo}
                    setDeuilInfo={setDeuilInfo}
                    customerName={`${customerInfo.firstName} ${customerInfo.lastName}`.trim()}
                    errors={deuilErrors}
                    isVisible={hasDeuil}
                  />
                )}

                {/* 🔄 SECTION CADEAU MODIFIÉE - S'affiche SEULEMENT si pas de produits deuil */}
                {!hasDeuil && (
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
                              recipientLastName: e.target.checked ? prev.recipientLastName : '',
                              message: e.target.checked ? prev.message : ''
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
                            
                            {/* Champ message cadeau */}
                            <div>
                              <Label htmlFor="giftMessage">Message personnalisé (optionnel)</Label>
                              <Textarea
                                id="giftMessage"
                                value={giftInfo.message}
                                onChange={(e) => setGiftInfo(prev => ({
                                  ...prev,
                                  message: e.target.value
                                }))}
                                placeholder="Votre message personnalisé pour accompagner ce cadeau..."
                                maxLength={300}
                                rows={3}
                                className="mt-1 resize-none"
                              />
                              <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-gray-500">
                                  Ce message apparaîtra sur la carte accompagnant votre cadeau
                                </p>
                                <span className="text-xs text-gray-400">
                                  {giftInfo.message.length}/300
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 🆕 AVERTISSEMENT PANIER MIXTE - Nouveau */}
                {hasMixedCategories && (
                  <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="p-4">
                      <div className="flex items-center text-orange-800">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        <p className="text-sm">
                          Votre panier contient des arrangements funéraires et d'autres produits. 
                          Les informations de deuil s'appliqueront aux arrangements funéraires uniquement.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

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
                          onChange={handleDateChange}
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
                          {getAvailableTimeSlots().map((slot) => (
                            <option key={slot.value} value={slot.value}>
                              {slot.label}
                            </option>
                          ))}
                        </select>
                        {errors.timeSlot && (
                          <p className="text-red-600 text-sm mt-1">{errors.timeSlot}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {deliveryInfo.date && (() => {
                            const selectedDate = new Date(deliveryInfo.date);
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
                        {item.freeDelivery && (
                          <p className="text-xs text-green-600 font-medium">
                            🚚 Livraison gratuite
                          </p>
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
                      {hasFreeDeliveryItem 
                        ? 'Produit éligible dans votre panier' 
                        : 'Livraison gratuite dès 50€'
                      }
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
                              {/* ✨ SEULE MODIFICATION: Affichage du message dans le résumé */}
                              {giftInfo.message && (
                                <div className="mt-2 p-2 bg-pink-50 rounded border border-pink-200">
                                  <p className="text-xs text-pink-800 font-medium">Message cadeau :</p>
                                  <p className="text-xs text-pink-700 italic">"{giftInfo.message}"</p>
                                </div>
                              )}
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