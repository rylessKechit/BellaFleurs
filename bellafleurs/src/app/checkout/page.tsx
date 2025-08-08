// src/app/checkout/page.tsx - Version refactorisée avec composants
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';

// Composants des étapes
import CustomerInfoStep from '@/components/checkout/CustomerInfoStep';
import DeliveryStep from '@/components/checkout/DeliveryStep';
import PaymentStep from '@/components/checkout/PaymentStep';
import OrderSummary from '@/components/checkout/OrderSummary';

// Types
interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  stock: number;
}

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface DeliveryInfo {
  type: 'delivery' | 'pickup';
  address?: {
    street: string;
    city: string;
    zipCode: string;
    complement?: string;
  };
  date: string;
  timeSlot: string;
  notes?: string;
}

interface PaymentInfo {
  method: 'card' | 'paypal';
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
}

// Hook personnalisé pour gérer les données de checkout
function useCheckoutData() {
  const { user, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoadingCart, setIsLoadingCart] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch('/api/cart', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setCartItems(data.data.items || []);
          
          if (!data.data.items || data.data.items.length === 0) {
            throw new Error('Panier vide');
          }
        } else {
          throw new Error('Erreur lors du chargement du panier');
        }
      } catch (error) {
        console.error('Erreur panier:', error);
        toast.error('Erreur lors du chargement du panier');
        // Redirection gérée dans le composant parent
      } finally {
        setIsLoadingCart(false);
      }
    };

    fetchCart();
  }, []);

  return { cartItems, isLoadingCart, user, isAuthenticated };
}

// Hook pour gérer les infos utilisateur pré-remplies
function useUserProfile(isAuthenticated: boolean, setCustomerInfo: (info: CustomerInfo) => void, setDeliveryInfo: (info: DeliveryInfo) => void) {
  useEffect(() => {
// Hook pour gérer les infos utilisateur pré-remplies
function useUserProfile(isAuthenticated: boolean, setCustomerInfo: (info: CustomerInfo) => void, setDeliveryInfo: (info: DeliveryInfo) => void) {
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/user/profile', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          const userProfile = data.data.user;
          
          setCustomerInfo({
            firstName: userProfile.name.split(' ')[0] || '',
            lastName: userProfile.name.split(' ').slice(1).join(' ') || '',
            email: userProfile.email || '',
            phone: userProfile.phone || ''
          });
          
          if (userProfile.address) {
            setDeliveryInfo(prev => ({
              ...prev,
              address: {
                street: userProfile.address.street || '',
                city: userProfile.address.city || '',
                zipCode: userProfile.address.zipCode || '',
                complement: ''
              }
            }));
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
      }
    };

    fetchUserInfo();
  }, [isAuthenticated, setCustomerInfo, setDeliveryInfo]);
}

// Hook pour la validation
function useCheckoutValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number, customerInfo: CustomerInfo, deliveryInfo: DeliveryInfo, paymentInfo: PaymentInfo): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!customerInfo.firstName.trim()) newErrors.firstName = 'Prénom requis';
      if (!customerInfo.lastName.trim()) newErrors.lastName = 'Nom requis';
      if (!customerInfo.email.trim()) newErrors.email = 'Email requis';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) newErrors.email = 'Email invalide';
      if (!customerInfo.phone.trim()) newErrors.phone = 'Téléphone requis';
    }

    if (step === 2) {
      if (!deliveryInfo.date) newErrors.date = 'Date de livraison requise';
      if (!deliveryInfo.timeSlot) newErrors.timeSlot = 'Créneau horaire requis';
      if (deliveryInfo.type === 'delivery') {
        if (!deliveryInfo.address?.street?.trim()) newErrors.street = 'Adresse requise';
        if (!deliveryInfo.address?.city?.trim()) newErrors.city = 'Ville requise';
        if (!deliveryInfo.address?.zipCode?.trim()) newErrors.zipCode = 'Code postal requis';
        else if (!/^\d{5}$/.test(deliveryInfo.address.zipCode)) newErrors.zipCode = 'Code postal invalide';
      }
    }

    if (step === 3) {
      if (paymentInfo.method === 'card') {
        if (!paymentInfo.cardNumber.trim()) newErrors.cardNumber = 'Numéro de carte requis';
        if (!paymentInfo.expiryDate.trim()) newErrors.expiryDate = 'Date d\'expiration requise';
        if (!paymentInfo.cvv.trim()) newErrors.cvv = 'CVV requis';
        if (!paymentInfo.cardName.trim()) newErrors.cardName = 'Nom du titulaire requis';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { errors, setErrors, validateStep };
}

// Composant principal
export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, isLoadingCart, user, isAuthenticated } = useCheckoutData();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const { errors, setErrors, validateStep } = useCheckoutValidation();

  // États des formulaires
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    type: 'delivery',
    date: '',
    timeSlot: '',
    notes: ''
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    method: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });

  // Pré-remplir les infos utilisateur
  useUserProfile(isAuthenticated, setCustomerInfo, setDeliveryInfo);

  // Calculs
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = deliveryInfo.type === 'delivery' ? (subtotal >= 50 ? 0 : 8.90) : 0;
  const total = subtotal + deliveryFee;

  // Navigation entre les étapes
  const nextStep = () => {
    if (validateStep(currentStep, customerInfo, deliveryInfo, paymentInfo)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Traitement de la commande
  const processOrder = async () => {
    if (!validateStep(3, customerInfo, deliveryInfo, paymentInfo)) return;

    setIsProcessing(true);
    
    try {
      const orderData = {
        items: cartItems.map(item => ({
          product: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        customerInfo: {
          name: `${customerInfo.firstName} ${customerInfo.lastName}`,
          email: customerInfo.email,
          phone: customerInfo.phone
        },
        deliveryInfo: {
          type: deliveryInfo.type,
          address: deliveryInfo.type === 'delivery' ? deliveryInfo.address : undefined,
          date: new Date(deliveryInfo.date),
          timeSlot: deliveryInfo.timeSlot,
          notes: deliveryInfo.notes
        },
        paymentMethod: paymentInfo.method,
        totalAmount: total
      };

      // Créer la commande
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erreur lors de la création de la commande');
      }

      const result = await response.json();
      const order = result.data.order;

      // Traiter le paiement si nécessaire
      if (paymentInfo.method === 'card') {
        const paymentResponse = await fetch('/api/payments/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            orderId: order._id,
            amount: Math.round(total * 100),
            currency: 'eur'
          })
        });

        if (!paymentResponse.ok) {
          throw new Error('Erreur lors de la création du paiement');
        }

        // Simuler le traitement du paiement
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Confirmer le paiement
        await fetch('/api/payments/confirm-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            paymentIntentId: 'simulated_payment_intent',
            orderId: order._id
          })
        });
      }

      // Vider le panier
      await fetch('/api/cart/clear', {
        method: 'POST',
        credentials: 'include'
      });

      toast.success('Commande créée avec succès !');
      router.push(`/checkout/success?order=${order.orderNumber}`);
      
    } catch (error: any) {
      console.error('Erreur lors du traitement de la commande:', error);
      toast.error(error.message || 'Erreur lors du traitement de votre commande');
      setErrors({ general: error.message || 'Erreur lors du traitement de votre commande' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Redirection si panier vide
  useEffect(() => {
    if (!isLoadingCart && cartItems.length === 0) {
      router.push('/panier');
    }
  }, [isLoadingCart, cartItems, router]);

  // Loading state
  if (isLoadingCart) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de votre panier...</p>
          </div>
        </main>
      </>
    );
  }

  // Composant indicateur d'étapes
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
            step <= currentStep 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-200 text-gray-600'
          }`}>
            {step < currentStep ? <Check className="w-5 h-5" /> : step}
          </div>
          {step < 3 && (
            <div className={`w-16 h-1 mx-2 ${
              step < currentStep ? 'bg-green-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Breadcrumb */}
          <nav className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <button onClick={() => router.push('/')} className="hover:text-green-600">
                Accueil
              </button>
              <span>/</span>
              <button onClick={() => router.push('/panier')} className="hover:text-green-600">
                Panier
              </button>
              <span>/</span>
              <span className="text-gray-900">Commande</span>
            </div>
          </nav>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Finaliser votre commande
            </h1>
            <p className="text-gray-600">
              Quelques étapes pour recevoir vos plus belles fleurs
            </p>
          </div>

          <StepIndicator />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Formulaire principal */}
            <div className="lg:col-span-2">
              {currentStep === 1 && (
                <CustomerInfoStep
                  customerInfo={customerInfo}
                  setCustomerInfo={setCustomerInfo}
                  errors={errors}
                />
              )}

              {currentStep === 2 && (
                <DeliveryStep
                  deliveryInfo={deliveryInfo}
                  setDeliveryInfo={setDeliveryInfo}
                  errors={errors}
                  subtotal={subtotal}
                />
              )}

              {currentStep === 3 && (
                <PaymentStep
                  paymentInfo={paymentInfo}
                  setPaymentInfo={setPaymentInfo}
                  errors={errors}
                />
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Précédent
                </Button>
                
                {currentStep < 3 ? (
                  <Button onClick={nextStep} className="flex items-center">
                    Suivant
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    onClick={processOrder} 
                    disabled={isProcessing}
                    className="flex items-center"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Traitement...
                      </>
                    ) : (
                      <>
                        Finaliser la commande
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Résumé de commande */}
            <div className="lg:col-span-1">
              <OrderSummary
                cartItems={cartItems}
                customerInfo={customerInfo}
                deliveryInfo={deliveryInfo}
                subtotal={subtotal}
                deliveryFee={deliveryFee}
                total={total}
                currentStep={currentStep}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}