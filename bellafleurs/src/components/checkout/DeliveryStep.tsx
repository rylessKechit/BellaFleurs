// src/components/checkout/DeliveryStep.tsx
'use client';

import React from 'react';
import { Truck, Store, MapPin, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Types d'interface corrigés
interface DeliveryAddress {
  street: string;
  city: string;
  zipCode: string;
  complement?: string;
}

interface DeliveryInfo {
  type: 'delivery' | 'pickup';
  address?: DeliveryAddress;
  date: string;
  timeSlot: string;
  notes?: string;
}

interface DeliveryStepProps {
  deliveryInfo: DeliveryInfo;
  setDeliveryInfo: (info: DeliveryInfo) => void;
  errors: Record<string, string>;
  subtotal: number;
}

interface TimeSlot {
  value: string;
  label: string;
  period: string;
}

const timeSlots: TimeSlot[] = [
  { value: '9h-12h', label: '9h - 12h', period: 'Matin' },
  { value: '12h-14h', label: '12h - 14h', period: 'Midi' },
  { value: '14h-17h', label: '14h - 17h', period: 'Après-midi' },
  { value: '17h-19h', label: '17h - 19h', period: 'Fin d\'après-midi' }
];

const DeliveryStep: React.FC<DeliveryStepProps> = ({
  deliveryInfo,
  setDeliveryInfo,
  errors,
  subtotal
}) => {
  const deliveryPrice = subtotal >= 50 ? 0 : 10;
  
  // Date minimale (demain)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateString = minDate.toISOString().split('T')[0];

  const handleDeliveryTypeChange = (type: 'delivery' | 'pickup'): void => {
    setDeliveryInfo({
      ...deliveryInfo,
      type,
      // Réinitialiser l'adresse si on passe en pickup
      ...(type === 'pickup' ? { address: undefined } : {
        address: deliveryInfo.address || {
          street: '',
          city: '',
          zipCode: '',
          complement: ''
        }
      })
    });
  };

  const handleAddressChange = (field: keyof DeliveryAddress, value: string): void => {
    if (!deliveryInfo.address) return;
    
    setDeliveryInfo({
      ...deliveryInfo,
      address: {
        ...deliveryInfo.address,
        [field]: value
      }
    });
  };

  const handleInputChange = (field: keyof DeliveryInfo, value: string): void => {
    setDeliveryInfo({
      ...deliveryInfo,
      [field]: value
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Truck className="w-5 h-5 mr-2 text-primary-600" />
          Livraison & Retrait
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        
        {/* Type de livraison */}
        <div>
          <Label className="text-base font-medium mb-3 block">
            Mode de réception *
          </Label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Livraison à domicile */}
            <button
              type="button"
              onClick={() => handleDeliveryTypeChange('delivery')}
              className={`p-6 border-2 rounded-xl text-left transition-all hover:shadow-md ${
                deliveryInfo.type === 'delivery' 
                  ? 'border-primary-500 bg-primary-50 shadow-sm' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center mb-3">
                <div className={`p-2 rounded-lg mr-3 ${
                  deliveryInfo.type === 'delivery' ? 'bg-primary-100' : 'bg-gray-100'
                }`}>
                  <Truck className={`w-5 h-5 ${
                    deliveryInfo.type === 'delivery' ? 'text-primary-600' : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Livraison à domicile</span>
                  <div className="flex items-center mt-1">
                    <span className={`text-sm font-medium ${
                      deliveryPrice === 0 ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {deliveryPrice === 0 ? 'Gratuite' : `${deliveryPrice}€`}
                    </span>
                    <span className="text-gray-400 mx-1">•</span>
                    <span className="text-sm text-gray-600">24-48h</span>
                  </div>
                </div>
              </div>
              
              {subtotal < 50 && (
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  💡 Livraison gratuite dès 50€ d'achat
                </div>
              )}
            </button>
            
            {/* Retrait en boutique */}
            <button
              type="button"
              onClick={() => handleDeliveryTypeChange('pickup')}
              className={`p-6 border-2 rounded-xl text-left transition-all hover:shadow-md ${
                deliveryInfo.type === 'pickup' 
                  ? 'border-primary-500 bg-primary-50 shadow-sm' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center mb-3">
                <div className={`p-2 rounded-lg mr-3 ${
                  deliveryInfo.type === 'pickup' ? 'bg-primary-100' : 'bg-gray-100'
                }`}>
                  <Store className={`w-5 h-5 ${
                    deliveryInfo.type === 'pickup' ? 'text-primary-600' : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Retrait en boutique</span>
                  <div className="flex items-center mt-1">
                    <span className="text-sm font-medium text-green-600">Gratuit</span>
                    <span className="text-gray-400 mx-1">•</span>
                    <span className="text-sm text-gray-600">Prêt en 2h</span>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                📍 123 Avenue des Fleurs, 75015 Paris
              </div>
            </button>
          </div>
          
          {errors.type && (
            <p className="text-red-600 text-sm mt-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.type}
            </p>
          )}
        </div>

        {/* Adresse de livraison */}
        {deliveryInfo.type === 'delivery' && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
            <h3 className="font-medium flex items-center text-gray-900">
              <MapPin className="w-4 h-4 mr-2 text-primary-600" />
              Adresse de livraison
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="street">Adresse *</Label>
                <Input
                  id="street"
                  value={deliveryInfo.address?.street || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleAddressChange('street', e.target.value)
                  }
                  className={errors.street ? 'border-red-300 focus:ring-red-500' : ''}
                  placeholder="123 Rue de la Paix"
                />
                {errors.street && (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.street}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="complement">Complément d'adresse</Label>
                <Input
                  id="complement"
                  value={deliveryInfo.address?.complement || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleAddressChange('complement', e.target.value)
                  }
                  placeholder="Appartement, étage, code d'accès..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zipCode">Code postal *</Label>
                  <Input
                    id="zipCode"
                    value={deliveryInfo.address?.zipCode || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleAddressChange('zipCode', e.target.value)
                    }
                    className={errors.zipCode ? 'border-red-300 focus:ring-red-500' : ''}
                    placeholder="75001"
                    maxLength={5}
                  />
                  {errors.zipCode && (
                    <p className="text-red-600 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.zipCode}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="city">Ville *</Label>
                  <Input
                    id="city"
                    value={deliveryInfo.address?.city || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleAddressChange('city', e.target.value)
                    }
                    className={errors.city ? 'border-red-300 focus:ring-red-500' : ''}
                    placeholder="Paris"
                  />
                  {errors.city && (
                    <p className="text-red-600 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.city}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Zone de livraison */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Zone de livraison :</strong> Paris et petite couronne (75, 92, 93, 94)
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Date et heure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date" className="flex items-center">
              <Clock className="w-4 h-4 mr-1 text-primary-600" />
              Date {deliveryInfo.type === 'delivery' ? 'de livraison' : 'de retrait'} *
            </Label>
            <Input
              id="date"
              type="date"
              value={deliveryInfo.date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                handleInputChange('date', e.target.value)
              }
              className={errors.date ? 'border-red-300 focus:ring-red-500' : ''}
              min={minDateString}
            />
            {errors.date && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.date}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="timeSlot">Créneau horaire *</Label>
            <select
              id="timeSlot"
              value={deliveryInfo.timeSlot}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                handleInputChange('timeSlot', e.target.value)
              }
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.timeSlot ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Sélectionnez un créneau</option>
              {timeSlots.map((slot: TimeSlot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.label} ({slot.period})
                </option>
              ))}
            </select>
            {errors.timeSlot && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.timeSlot}
              </p>
            )}
          </div>
        </div>

        {/* Instructions spéciales */}
        <div>
          <Label htmlFor="notes">Instructions spéciales</Label>
          <textarea
            id="notes"
            value={deliveryInfo.notes || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
              handleInputChange('notes', e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            rows={3}
            placeholder={
              deliveryInfo.type === 'delivery' 
                ? "Instructions pour la livraison (étage, code d'accès, personne à contacter...)"
                : "Instructions pour le retrait (personne autorisée, préférences...)"
            }
            maxLength={500}
          />
          <div className="text-xs text-gray-500 mt-1">
            {deliveryInfo.notes?.length || 0}/500 caractères
          </div>
        </div>

        {/* Récapitulatif */}
        <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
          <h4 className="font-medium text-gray-900 mb-2">Récapitulatif</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Mode :</span>
              <span className="font-medium">
                {deliveryInfo.type === 'delivery' ? 'Livraison à domicile' : 'Retrait en boutique'}
              </span>
            </div>
            {deliveryInfo.type === 'delivery' && (
              <div className="flex justify-between">
                <span>Frais de livraison :</span>
                <span className={`font-medium ${deliveryPrice === 0 ? 'text-green-600' : ''}`}>
                  {deliveryPrice === 0 ? 'Gratuit' : `${deliveryPrice}€`}
                </span>
              </div>
            )}
            {deliveryInfo.date && (
              <div className="flex justify-between">
                <span>Date :</span>
                <span className="font-medium">
                  {new Date(deliveryInfo.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}
            {deliveryInfo.timeSlot && (
              <div className="flex justify-between">
                <span>Créneau :</span>
                <span className="font-medium">{deliveryInfo.timeSlot}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryStep;