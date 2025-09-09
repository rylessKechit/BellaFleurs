// src/lib/stripe.ts
import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Configuration côté serveur
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

if (!process.env.STRIPE_PUBLIC_KEY) {
  throw new Error('STRIPE_PUBLIC_KEY is not defined in environment variables');
}

// Instance Stripe côté serveur
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia', // Version API compatible
  typescript: true,
});

// Instance Stripe côté client (singleton)
let stripePromise: ReturnType<typeof loadStripe>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.STRIPE_PUBLIC_KEY!);
  }
  return stripePromise;
};

// Types personnalisés pour notre application
export interface CreatePaymentIntentData {
  orderId: string;
  amount: number; // En centimes (ex: 2500 = 25.00€)
  currency: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

export interface ConfirmPaymentData {
  paymentIntentId: string;
  orderId: string;
  metadata?: Record<string, string>;
}

// Utilitaires Stripe
export const formatAmountForStripe = (amount: number, currency: string): number => {
  // Convertir en centimes pour les devises qui l'exigent
  const zeroDecimalCurrencies = ['jpy', 'krw', 'cop'];
  return zeroDecimalCurrencies.includes(currency.toLowerCase()) 
    ? amount 
    : Math.round(amount * 100);
};

export const formatAmountFromStripe = (amount: number, currency: string): number => {
  const zeroDecimalCurrencies = ['jpy', 'krw', 'cop'];
  return zeroDecimalCurrencies.includes(currency.toLowerCase()) 
    ? amount 
    : amount / 100;
};

// Validation des métadonnées Stripe
export const validateStripeMetadata = (metadata: Record<string, any>): Record<string, string> => {
  const validMetadata: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(metadata)) {
    // Stripe n'accepte que des strings dans les métadonnées
    if (typeof value === 'string' && value.length <= 500) {
      validMetadata[key] = value;
    } else if (typeof value !== 'string') {
      validMetadata[key] = String(value).substring(0, 500);
    }
  }
  
  return validMetadata;
};

// Gestion des erreurs Stripe
export const handleStripeError = (error: any): { 
  message: string; 
  code: string; 
  type: string 
} => {
  if (error.type === 'StripeCardError') {
    return {
      message: error.message || 'Erreur de carte bancaire',
      code: error.code || 'card_error',
      type: 'card_error'
    };
  } else if (error.type === 'StripeInvalidRequestError') {
    return {
      message: 'Erreur de validation des données de paiement',
      code: error.code || 'invalid_request',
      type: 'validation_error'
    };
  } else if (error.type === 'StripeAPIError') {
    return {
      message: 'Erreur temporaire du service de paiement',
      code: 'api_error',
      type: 'api_error'
    };
  } else if (error.type === 'StripeConnectionError') {
    return {
      message: 'Problème de connexion avec le service de paiement',
      code: 'connection_error',
      type: 'connection_error'
    };
  } else if (error.type === 'StripeAuthenticationError') {
    return {
      message: 'Erreur d\'authentification du service de paiement',
      code: 'authentication_error',
      type: 'authentication_error'
    };
  } else {
    return {
      message: 'Une erreur inattendue s\'est produite',
      code: 'unknown_error',
      type: 'unknown_error'
    };
  }
};

// Constantes pour Stripe
export const STRIPE_CONSTANTS = {
  // Montant minimum pour Stripe (0.50€)
  MIN_AMOUNT: 50, // centimes
  
  // Montant maximum pour Stripe (999,999.99€)
  MAX_AMOUNT: 99999999, // centimes
  
  // Devises supportées
  SUPPORTED_CURRENCIES: ['eur', 'usd', 'gbp'] as const,
  
  // Méthodes de paiement supportées
  PAYMENT_METHODS: ['card', 'paypal'] as const,
  
  // Status des Payment Intent
  PAYMENT_INTENT_STATUS: {
    REQUIRES_PAYMENT_METHOD: 'requires_payment_method',
    REQUIRES_CONFIRMATION: 'requires_confirmation',
    REQUIRES_ACTION: 'requires_action',
    PROCESSING: 'processing',
    SUCCEEDED: 'succeeded',
    REQUIRES_CAPTURE: 'requires_capture',
    CANCELED: 'canceled'
  } as const
} as const;

// Types pour TypeScript
export type SupportedCurrency = typeof STRIPE_CONSTANTS.SUPPORTED_CURRENCIES[number];
export type SupportedPaymentMethod = typeof STRIPE_CONSTANTS.PAYMENT_METHODS[number];
export type PaymentIntentStatus = typeof STRIPE_CONSTANTS.PAYMENT_INTENT_STATUS[keyof typeof STRIPE_CONSTANTS.PAYMENT_INTENT_STATUS];