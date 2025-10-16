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
import { CreditCard, Shield, AlertCircle, CheckCircle, Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Configuration Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

// Styles pour CardElement - Version simplifiée
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
  hidePostalCode: true,
};

// Interface pour les props du formulaire
interface StripePaymentFormProps {
  orderData: any;
  amount: number;
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
  const [cardError, setCardError] = useState<string>('');
  const [cardComplete, setCardComplete] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [canMakePayment, setCanMakePayment] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);

  // Initialiser Payment Request (Apple Pay / Google Pay)
  useEffect(() => {
    if (stripe) {
      const pr = stripe.paymentRequest({
        country: 'FR',
        currency: currency.toLowerCase(),
        total: {
          label: 'Bella Fleurs',
          amount: Math.round(amount * 100),
        },
        requestPayerName: true,
        requestPayerEmail: true,
        requestPayerPhone: true,
      });

      // Vérifier si Apple Pay / Google Pay est disponible
      pr.canMakePayment().then(result => {
        if (result) {
          setPaymentRequest(pr);
          setCanMakePayment(true);
        } else {
          setShowCardForm(true); // Afficher directement le formulaire carte
        }
      });

      // Gérer le paiement Apple Pay / Google Pay
      pr.on('paymentmethod', async (ev) => {
        setIsProcessing(true);
        
        try {
          // Créer le payload corrigé pour l'API - STRUCTURE CORRIGÉE
          const paymentPayload = {
            // Directement les propriétés attendues par l'API (pas de wrapper orderData)
            items: orderData.items || [],
            customerInfo: orderData.customerInfo || {},
            deliveryInfo: orderData.deliveryInfo || {},
            paymentMethod: 'card',
            totalAmount: amount
          };

          // Créer Payment Intent
          const response = await fetch('/api/payments/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(paymentPayload)
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Erreur lors de la création du paiement');
          }

          const result = await response.json();
          const { client_secret } = result.data.paymentIntent;

          // Confirmer le paiement
          const { error: confirmError, paymentIntent } = await stripe!.confirmCardPayment(
            client_secret,
            { payment_method: ev.paymentMethod.id },
            { handleActions: false }
          );

          if (confirmError) {
            ev.complete('fail');
            onError(confirmError.message || 'Erreur lors du paiement');
          } else {
            ev.complete('success');
            
            onSuccess(paymentIntent);
          }
        } catch (error: any) {
          console.error('❌ Erreur Payment Request:', error);
          ev.complete('fail');
          onError(error.message || 'Erreur lors du paiement');
        } finally {
          setIsProcessing(false);
        }
      });
    }
  }, [stripe, amount, currency, customerEmail, orderData, onSuccess, onError]);

  // Gérer les changements de la carte
  const handleCardChange = (event: any) => {
    setCardError(event.error ? event.error.message : '');
    setCardComplete(event.complete);
  };

  // Traiter le paiement par carte
  const handleCardSubmit = async (event: React.FormEvent) => {
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
      // Créer le payload corrigé pour l'API - STRUCTURE CORRIGÉE  
      const paymentPayload = {
        // Directement les propriétés attendues par l'API (pas de wrapper orderData)
        items: orderData.items || [],
        customerInfo: orderData.customerInfo || {},
        deliveryInfo: orderData.deliveryInfo || {},
        paymentMethod: 'card',
        totalAmount: amount
      };

      // Créer Payment Intent
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(paymentPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erreur API:', errorData);
        throw new Error(errorData.error?.message || 'Erreur lors de la création du paiement');
      }

      const result = await response.json();
      const { client_secret } = result.data.paymentIntent;

      // Confirmer le paiement avec la carte
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        client_secret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: orderData.customerInfo?.name || '',
              email: orderData.customerInfo?.email || '',
              phone: orderData.customerInfo?.phone || '',
            }
          }
        }
      );

      if (confirmError) {
        console.error('❌ Erreur confirmation:', confirmError);
        onError(confirmError.message || 'Erreur lors du paiement');
      } else {
        
        onSuccess(paymentIntent);
      }
    } catch (error: any) {
      console.error('❌ Erreur paiement carte:', error);
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
      <CardContent className="space-y-6">
        
        {/* Apple Pay / Google Pay */}
        {canMakePayment && paymentRequest && !showCardForm && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">Paiement express</p>
              <div id="payment-request-button" className="mb-4">
                {/* Le bouton Payment Request sera injecté ici par Stripe */}
              </div>
              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="px-4 text-sm text-gray-500">ou</span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCardForm(true)}
                className="w-full"
              >
                Payer par carte bancaire
              </Button>
            </div>
          </div>
        )}

        {/* Formulaire carte bancaire */}
        {(showCardForm || !canMakePayment) && (
          <form onSubmit={handleCardSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Informations de carte *
              </label>
              <div className={`p-3 border rounded-lg ${cardError ? 'border-red-300' : cardComplete ? 'border-green-300' : 'border-gray-300'}`}>
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
              className="w-full py-3 text-lg bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
              size="lg"
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 "></div>
                  Traitement en cours...
                </div>
              ) : (
                `Payer ${amount.toFixed(2)} €`
              )}
            </Button>
          </form>
        )}

        {/* Afficher le bouton "Retour aux options" si on a affiché le formulaire carte */}
        {canMakePayment && showCardForm && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowCardForm(false)}
            className="w-full"
          >
            ← Retour aux options de paiement
          </Button>
        )}

        {/* Informations légales */}
        <div className="text-xs text-gray-500 text-center">
          En cliquant sur "Payer", vous acceptez d'être débité de {amount.toFixed(2)} € 
          et vous confirmez avoir lu nos conditions de vente.
        </div>
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