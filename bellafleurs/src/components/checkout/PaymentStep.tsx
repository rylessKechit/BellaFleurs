// src/components/checkout/PaymentStep.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Smartphone, Shield } from 'lucide-react';

interface PaymentInfo {
  method: 'card' | 'apple_pay' | 'google_pay';
}

interface PaymentStepProps {
  paymentInfo: PaymentInfo;
  setPaymentInfo: (info: PaymentInfo) => void;
  errors: Record<string, string>;
  onValidate: () => boolean;
}

export default function PaymentStep({
  paymentInfo,
  setPaymentInfo,
  errors,
  onValidate
}: PaymentStepProps) {

  const handleMethodChange = (method: 'card' | 'apple_pay' | 'google_pay') => {
    setPaymentInfo({ method });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Méthode de paiement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Sélection méthode de paiement */}
        <div>
          <Label className="text-base font-medium">Choisissez votre méthode de paiement</Label>
          <RadioGroup 
            value={paymentInfo.method} 
            onValueChange={handleMethodChange}
            className="mt-3 space-y-3"
          >
            
            {/* Apple Pay */}
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="apple_pay" id="apple_pay" />
              <Label htmlFor="apple_pay" className="flex items-center cursor-pointer flex-1">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">🍎</span>
                  </div>
                  <div>
                    <div className="font-medium">Apple Pay</div>
                    <div className="text-sm text-gray-500">Paiement sécurisé avec Touch ID ou Face ID</div>
                  </div>
                </div>
              </Label>
            </div>

            {/* Google Pay */}
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="google_pay" id="google_pay" />
              <Label htmlFor="google_pay" className="flex items-center cursor-pointer flex-1">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">G</span>
                  </div>
                  <div>
                    <div className="font-medium">Google Pay</div>
                    <div className="text-sm text-gray-500">Paiement rapide et sécurisé</div>
                  </div>
                </div>
              </Label>
            </div>

            {/* Carte bancaire */}
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex items-center cursor-pointer flex-1">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-8 h-8 text-gray-600" />
                  <div>
                    <div className="font-medium">Carte bancaire</div>
                    <div className="text-sm text-gray-500">Visa, Mastercard, American Express</div>
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Informations selon la méthode choisie */}
        {paymentInfo.method === 'apple_pay' && (
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-gray-600" />
              <div className="text-sm text-gray-700">
                <div className="font-medium">Apple Pay</div>
                <div>Vous serez invité à confirmer le paiement avec Touch ID, Face ID ou votre code d'accès.</div>
              </div>
            </div>
          </div>
        )}

        {paymentInfo.method === 'google_pay' && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-blue-600" />
              <div className="text-sm text-blue-800">
                <div className="font-medium">Google Pay</div>
                <div>Vous serez invité à confirmer le paiement via votre méthode de déverrouillage habituelle.</div>
              </div>
            </div>
          </div>
        )}

        {paymentInfo.method === 'card' && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center space-x-3">
              <CreditCard className="w-5 h-5 text-yellow-600" />
              <div className="text-sm text-yellow-800">
                <div className="font-medium">Carte bancaire</div>
                <div>Vos informations de carte seront demandées à l'étape suivante.</div>
              </div>
            </div>
          </div>
        )}

        {/* Sécurité */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-green-600" />
            <div className="text-sm text-green-800">
              <div className="font-medium">Paiement 100% sécurisé</div>
              <div>Toutes les transactions sont cryptées et protégées par Stripe. Vos données bancaires ne sont jamais stockées sur nos serveurs.</div>
            </div>
          </div>
        </div>

        {/* Erreurs générales */}
        {errors.general && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-red-700 text-sm">{errors.general}</p>
          </div>
        )}

        {/* Informations légales */}
        <div className="text-xs text-gray-500 leading-relaxed">
          <p>
            En procédant au paiement, vous acceptez nos{' '}
            <a href="/conditions-de-vente" className="text-green-600 hover:underline">
              conditions de vente
            </a>
            {' '}et notre{' '}
            <a href="/politique-de-confidentialite" className="text-green-600 hover:underline">
              politique de confidentialité
            </a>
            . Votre commande sera traitée dès confirmation du paiement.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}