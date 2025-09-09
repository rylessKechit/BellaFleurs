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
const stripePromise = loadStripe(process.env.STRIPE_PUBLIC_KEY!);

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
  orderId: string;
  amount: number; // Montant en euros
  currency?: string;
  customerEmail?: string;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

// Composant interne pour le formulaire (à l'intérieur d'Elements)
function PaymentForm({
  orderId,
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

  // Créer le Payment Intent au montage du composant
  useEffect(() => {
    if (!orderId || !amount) return;

    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/payments/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            orderId,
            amount: Math.round(amount * 100), // Convertir en centimes
            currency,
            customerEmail
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Erreur lors de la création du paiement');
        }

        const result = await response.json();
        setPaymentIntent(result.data.paymentIntent);

      } catch (error: any) {
        console.error('Erreur Payment Intent:', error);
        onError(error.message || 'Erreur lors de la préparation du paiement');
      }
    };

    createPaymentIntent();
  }, [orderId, amount, currency, customerEmail, onError]);

  // Gérer les changements de la carte
  const handleCardChange = (event: any) => {
    setCardError(event.error ? event.error.message : '');
    setCardComplete(event.complete);
  };

  // Traiter le paiement
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !paymentIntent) {
      onError('Stripe n\'est pas encore chargé');
      return;
    }

    if (!cardComplete) {
      setCardError('Veuillez compléter les informations de carte');
      return;
    }

    setIsProcessing(true);
    setCardError('');

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Élément carte non trouvé');
      }

      // Confirmer le paiement avec Stripe
      const { error, paymentIntent: confirmedPaymentIntent } = await stripe.confirmCardPayment(
        paymentIntent.client_secret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              email: customerEmail,
            },
          }
        }
      );

      if (error) {
        // Erreur de paiement
        console.error('Erreur Stripe:', error);
        
        let errorMessage = 'Erreur de paiement';
        
        switch (error.code) {
          case 'card_declined':
            errorMessage = 'Votre carte a été refusée. Veuillez essayer avec une autre carte.';
            break;
          case 'expired_card':
            errorMessage = 'Votre carte a expiré. Veuillez utiliser une carte valide.';
            break;
          case 'insufficient_funds':
            errorMessage = 'Fonds insuffisants sur votre carte.';
            break;
          case 'incorrect_cvc':
            errorMessage = 'Code de sécurité incorrect.';
            break;
          case 'processing_error':
            errorMessage = 'Erreur de traitement. Veuillez réessayer.';
            break;
          case 'rate_limit':
            errorMessage = 'Trop de tentatives. Veuillez attendre avant de réessayer.';
            break;
          default:
            errorMessage = error.message || 'Erreur de paiement';
        }
        
        setCardError(errorMessage);
        onError(errorMessage);
        
      } else if (confirmedPaymentIntent.status === 'succeeded') {
        // Paiement réussi !
        console.log('✅ Paiement réussi:', confirmedPaymentIntent.id);
        
        // Confirmer côté serveur
        try {
          const confirmResponse = await fetch('/api/payments/confirm-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              paymentIntentId: confirmedPaymentIntent.id,
              orderId: orderId
            })
          });

          if (confirmResponse.ok) {
            const confirmResult = await confirmResponse.json();
            toast.success('Paiement confirmé avec succès !');
            onSuccess({
              paymentIntent: confirmedPaymentIntent,
              order: confirmResult.data.order
            });
          } else {
            // Le paiement Stripe a réussi mais la confirmation serveur a échoué
            console.warn('⚠️ Paiement Stripe réussi mais confirmation serveur échouée');
            onSuccess({
              paymentIntent: confirmedPaymentIntent,
              order: null,
              warning: 'Paiement effectué mais confirmation en cours'
            });
          }
          
        } catch (confirmError) {
          console.error('Erreur confirmation serveur:', confirmError);
          // Le paiement a réussi mais on ne peut pas confirmer côté serveur
          onSuccess({
            paymentIntent: confirmedPaymentIntent,
            order: null,
            warning: 'Paiement effectué, confirmation en cours'
          });
        }
        
      } else if (confirmedPaymentIntent.status === 'requires_action') {
        // Le paiement nécessite une action supplémentaire (3D Secure, etc.)
        setCardError('Action supplémentaire requise. Veuillez suivre les instructions de votre banque.');
        
      } else {
        // Autres statuts
        setCardError(`Statut de paiement inattendu: ${confirmedPaymentIntent.status}`);
        onError(`Paiement non finalisé: ${confirmedPaymentIntent.status}`);
      }

    } catch (error: any) {
      console.error('Erreur lors du paiement:', error);
      const errorMessage = error.message || 'Erreur lors du traitement du paiement';
      setCardError(errorMessage);
      onError(errorMessage);
      
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
            disabled={!stripe || !paymentIntent || !cardComplete || isProcessing || disabled}
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
    if (!process.env.STRIPE_PUBLIC_KEY) {
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