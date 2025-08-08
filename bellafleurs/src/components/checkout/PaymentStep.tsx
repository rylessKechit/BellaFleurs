// src/components/checkout/PaymentStep.tsx
'use client';

import { CreditCard, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PaymentInfo {
  method: 'card' | 'paypal';
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
}

interface PaymentStepProps {
  paymentInfo: PaymentInfo;
  setPaymentInfo: (info: PaymentInfo) => void;
  errors: Record<string, string>;
}

export default function PaymentStep({
  paymentInfo,
  setPaymentInfo,
  errors
}: PaymentStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Paiement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Méthode de paiement */}
        <div>
          <Label className="text-base font-medium">Méthode de paiement</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <button
              type="button"
              onClick={() => setPaymentInfo({...paymentInfo, method: 'card'})}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                paymentInfo.method === 'card' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium">Carte bancaire</span>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => setPaymentInfo({...paymentInfo, method: 'paypal'})}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                paymentInfo.method === 'paypal' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <div className="w-5 h-5 bg-blue-600 rounded mr-2 flex items-center justify-center text-white text-xs font-bold">
                  P
                </div>
                <span className="font-medium">PayPal</span>
              </div>
            </button>
          </div>
        </div>

        {/* Informations carte */}
        {paymentInfo.method === 'card' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardName">Nom du titulaire *</Label>
              <Input
                id="cardName"
                value={paymentInfo.cardName}
                onChange={(e) => setPaymentInfo({...paymentInfo, cardName: e.target.value})}
                className={errors.cardName ? 'border-red-300' : ''}
                placeholder="Jean Dupont"
              />
              {errors.cardName && <p className="text-red-600 text-sm mt-1">{errors.cardName}</p>}
            </div>
            
            <div>
              <Label htmlFor="cardNumber">Numéro de carte *</Label>
              <Input
                id="cardNumber"
                value={paymentInfo.cardNumber}
                onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value})}
                className={errors.cardNumber ? 'border-red-300' : ''}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
              {errors.cardNumber && <p className="text-red-600 text-sm mt-1">{errors.cardNumber}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Date d'expiration *</Label>
                <Input
                  id="expiryDate"
                  value={paymentInfo.expiryDate}
                  onChange={(e) => setPaymentInfo({...paymentInfo, expiryDate: e.target.value})}
                  className={errors.expiryDate ? 'border-red-300' : ''}
                  placeholder="MM/AA"
                  maxLength={5}
                />
                {errors.expiryDate && <p className="text-red-600 text-sm mt-1">{errors.expiryDate}</p>}
              </div>
              <div>
                <Label htmlFor="cvv">CVV *</Label>
                <Input
                  id="cvv"
                  value={paymentInfo.cvv}
                  onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value})}
                  className={errors.cvv ? 'border-red-300' : ''}
                  placeholder="123"
                  maxLength={4}
                />
                {errors.cvv && <p className="text-red-600 text-sm mt-1">{errors.cvv}</p>}
              </div>
            </div>
          </div>
        )}

        {/* PayPal info */}
        {paymentInfo.method === 'paypal' && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              Vous serez redirigé vers PayPal pour finaliser le paiement de manière sécurisée.
            </p>
          </div>
        )}

        {/* Sécurité */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center">
            <Shield className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-800">
              Paiement 100% sécurisé par cryptage SSL
            </span>
          </div>
        </div>

        {errors.general && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-red-700 text-sm">{errors.general}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}