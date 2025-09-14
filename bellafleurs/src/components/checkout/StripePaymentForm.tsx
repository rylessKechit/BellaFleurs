// src/components/checkout/StripePaymentForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { CreditCard, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Configuration Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

// Styles pour CardElement
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      fontFamily: '"Inter", "Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      '::placeholder': {
        color: '#aab7c4',
      },
      padding: '12px',
    },
    invalid: {
      color: '#9e2146',
      iconColor: '#9e2146',
    },
  },
  hidePostalCode: true, // On gère déjà l'adresse séparément
};

// Interface pour les props du formulaire
interface StripePaymentFormProps {
  orderData: any;
  amount: number; // Montant en euros
  currency?: string;
  customerEmail?: string;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

// Composant interne pour le formulaire (à l'intérieur d'Elements)
function PaymentForm({
  orderData,
  amount,
  currency = 'eur',
  customerEmail,
  onSuccess,
  onError,
  disabled = false
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const [cardError, setCardError] = useState<string>('');
  const [cardComplete, setCardComplete] = useState(false);

  // Gérer les changements de la carte
  const handleCardChange = (event: any) => {
    setCardError(event.error ? event.error.message : '');
    setCardComplete(event.complete);
  };

  // Traiter le paiement
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      onError('Stripe n\'est pas encore chargé');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onError('Élément de carte non trouvé');
      return;
    }

    if (!cardComplete) {
      onError('Veuillez compléter les informations de carte');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Créer le Payment Intent
      console.log('🔄 Création du Payment Intent...');
      
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          currency,
          customerEmail,
          orderData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erreur lors de la création du paiement');
      }

      const result = await response.json();
      const newPaymentIntent = result.data.paymentIntent;
      console.log('✅ Payment Intent créé:', newPaymentIntent.id);

      // 2. Confirmer le paiement avec Stripe
      console.log('🔄 Confirmation du paiement...');
      
      const { error: confirmError, paymentIntent: confirmedPaymentIntent } = await stripe.confirmCardPayment(
        newPaymentIntent.client_secret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: orderData.customerInfo.name,
              email: orderData.customerInfo.email,
              phone: orderData.customerInfo.phone,
              address: orderData.deliveryInfo.address ? {
                line1: orderData.deliveryInfo.address.street,
                city: orderData.deliveryInfo.address.city,
                postal_code: orderData.deliveryInfo.address.zipCode,
                country: 'FR'
              } : undefined
            }
          }
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message || 'Erreur lors de la confirmation du paiement');
      }

      if (confirmedPaymentIntent?.status === 'succeeded') {
        console.log('✅ Paiement confirmé:', confirmedPaymentIntent.id);
        onSuccess({
          paymentIntent: confirmedPaymentIntent,
          orderData
        });
      } else {
        throw new Error('Le paiement n\'a pas pu être confirmé');
      }

    } catch (error: any) {
      console.error('❌ Erreur de paiement:', error);
      onError(error.message || 'Erreur lors du paiement');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Paiement sécurisé
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Montant */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Montant à payer :</span>
              <span className="text-2xl font-bold text-green-600">
                {amount.toFixed(2)} €
              </span>
            </div>
          </div>

          {/* Élément carte Stripe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Informations de carte bancaire
            </label>
            <div className={`border rounded-lg p-3 ${cardError ? 'border-red-300' : 'border-gray-300'} ${cardComplete ? 'border-green-300' : ''}`}>
              <CardElement
                options={cardElementOptions}
                onChange={handleCardChange}
              />
            </div>
            {cardError && (
              <div className="flex items-center mt-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {cardError}
              </div>
            )}
            {cardComplete && !cardError && (
              <div className="flex items-center mt-2 text-green-600 text-sm">
                <CheckCircle className="w-4 h-4 mr-1" />
                Informations de carte valides
              </div>
            )}
          </div>

          {/* Sécurité */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-green-600 mr-2" />
              <div className="text-sm text-green-800">
                <div className="font-medium">Paiement 100% sécurisé</div>
                <div>Vos données sont cryptées et protégées par Stripe</div>
              </div>
            </div>
          </div>

          {/* Bouton de paiement */}
          <Button
            type="submit"
            disabled={!stripe || !cardComplete || isProcessing || disabled}
            className="w-full py-3 text-lg"
            size="lg"
          >
            {isProcessing ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Traitement en cours...
              </div>
            ) : (
              `Payer ${amount.toFixed(2)} €`
            )}
          </Button>

          {/* Informations légales */}
          <div className="text-xs text-gray-500 text-center">
            En cliquant sur "Payer", vous acceptez d'être débité de {amount.toFixed(2)} € 
            et vous confirmez avoir lu nos conditions de vente.
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Composant principal avec provider Elements
export default function StripePaymentForm(props: StripePaymentFormProps) {
  const [stripeError, setStripeError] = useState<string>('');

  // Vérifier que Stripe est configuré
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
      setStripeError('Configuration Stripe manquante');
    }
  }, []);

  if (stripeError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center text-red-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>Erreur de configuration : {stripeError}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
}