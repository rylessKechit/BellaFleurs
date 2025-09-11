// src/app/checkout/page.tsx - Version complète avec Stripe
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
import OrderSummary from '@/components/checkout/OrderSummary';
import StripePaymentForm from '@/components/checkout/StripePaymentForm';

// Types
interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
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
      } finally {
        setIsLoadingCart(false);
      }
    };

    fetchCart();
  }, []);

  return { cartItems, isLoadingCart, user, isAuthenticated };
}

// Hook pour la validation des étapes
function useCheckoutValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number, customerInfo: CustomerInfo, deliveryInfo: DeliveryInfo) => {
    const newErrors: Record<string, string> = {};

    if (step >= 1) {
      // Validation informations client
      if (!customerInfo.firstName.trim()) newErrors.firstName = 'Prénom requis';
      if (!customerInfo.lastName.trim()) newErrors.lastName = 'Nom requis';
      if (!customerInfo.email.trim()) newErrors.email = 'Email requis';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
        newErrors.email = 'Email invalide';
      }
      if (!customerInfo.phone.trim()) newErrors.phone = 'Téléphone requis';
      else if (!/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/.test(customerInfo.phone)) {
        newErrors.phone = 'Numéro de téléphone français invalide';
      }
    }

    if (step >= 2) {
      // Validation livraison
      if (!deliveryInfo.date) newErrors.date = 'Date de livraison requise';
      if (!deliveryInfo.timeSlot) newErrors.timeSlot = 'Créneau horaire requis';
      
      if (deliveryInfo.type === 'delivery') {
        if (!deliveryInfo.address?.street?.trim()) newErrors.street = 'Adresse requise';
        if (!deliveryInfo.address?.city?.trim()) newErrors.city = 'Ville requise';
        if (!deliveryInfo.address?.zipCode?.trim()) newErrors.zipCode = 'Code postal requis';
        else if (!/^\d{5}$/.test(deliveryInfo.address.zipCode)) {
          newErrors.zipCode = 'Code postal invalide';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { errors, setErrors, validateStep };
}

// Hook pour pré-remplir les infos utilisateur
function useUserProfile(isAuthenticated: boolean, setCustomerInfo: Function, setDeliveryInfo: Function) {
  useEffect(() => {
    if (isAuthenticated) {
      // TODO: Récupérer les infos utilisateur depuis l'API
      // Pour l'instant, on peut laisser vide ou utiliser les données de session
    }
  }, [isAuthenticated, setCustomerInfo, setDeliveryInfo]);
}

// Composant indicateur d'étapes
const StepIndicator = ({ currentStep }: { currentStep: number }) => (
  <div className="flex items-center justify-center mb-8">
    {[1, 2, 3].map((step, index) => (
      <div key={step} className="flex items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
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

// Composant principal
export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, isLoadingCart, user, isAuthenticated } = useCheckoutData();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string>('');
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

  // Pré-remplir les infos utilisateur
  useUserProfile(isAuthenticated, setCustomerInfo, setDeliveryInfo);

  // Calculs
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = deliveryInfo.type === 'delivery' ? (subtotal >= 50 ? 0 : 8.90) : 0;
  const total = subtotal + deliveryFee;

  // Navigation entre les étapes
  const nextStep = () => {
    if (validateStep(currentStep, customerInfo, deliveryInfo)) {
      if (currentStep === 2) {
        // Créer la commande avant de passer au paiement
        createOrder();
      } else {
        setCurrentStep(prev => Math.min(prev + 1, 3));
      }
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Création de la commande (étape 2 → 3)
  const createOrder = async () => {
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
        paymentMethod: 'card',
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
      
      setCreatedOrderId(order._id);
      setCurrentStep(3);
      toast.success('Commande créée, procédez au paiement');

    } catch (error: any) {
      console.error('Erreur lors de la création de la commande:', error);
      toast.error(error.message || 'Erreur lors de la création de votre commande');
      setErrors({ general: error.message || 'Erreur lors de la création de votre commande' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Succès du paiement Stripe
  const handlePaymentSuccess = async (result: any) => {
    try {
      // Vider le panier
      await fetch('/api/cart/clear', {
        method: 'POST',
        credentials: 'include'
      });

      toast.success('Paiement effectué avec succès !');
      
      // Rediriger vers la page de succès
      if (result.order?.orderNumber) {
        router.push(`/checkout/success?order=${result.order.orderNumber}`);
      } else {
        // Fallback si pas de numéro de commande
        router.push('/checkout/success');
      }
      
    } catch (error) {
      console.error('Erreur post-paiement:', error);
      // Même si le vidage du panier échoue, le paiement a réussi
      router.push('/checkout/success');
    }
  };

  // Erreur de paiement Stripe
  const handlePaymentError = (error: string) => {
    toast.error(error);
    setErrors({ payment: error });
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

          <StepIndicator currentStep={currentStep} />

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

              {currentStep === 3 && createdOrderId && (
                <StripePaymentForm
                  orderId={createdOrderId}
                  amount={total}
                  customerEmail={customerInfo.email}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  disabled={isProcessing}
                />
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <Button 
                  variant="outline" 
                  onClick={prevStep}
                  disabled={currentStep === 1 || isProcessing}
                  className="flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Précédent
                </Button>

                {currentStep < 3 && (
                  <Button 
                    onClick={nextStep}
                    disabled={isProcessing}
                    className="flex items-center"
                  >
                    {isProcessing ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {currentStep === 2 ? 'Création...' : 'Traitement...'}
                      </div>
                    ) : (
                      <>
                        {currentStep === 2 ? 'Procéder au paiement' : 'Suivant'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Erreur générale */}
              {errors.general && (
                <div className="mt-4 bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-red-700 text-sm">{errors.general}</p>
                </div>
              )}
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