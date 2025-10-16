// src/components/checkout/DeliveryStep.tsx
'use client';

import React from 'react';
import { Truck, MapPin, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/hooks/useAuth';

// Types d'interface
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

const DeliveryStep: React.FC<DeliveryStepProps> = ({
  deliveryInfo,
  setDeliveryInfo,
  errors,
  subtotal
}) => {
  const { isAuthenticated, user } = useAuth();
  
  // Calcul des frais de livraison
  const deliveryFee = subtotal >= 50 ? 0 : 10;
  const isFreeDelivery = subtotal >= 50;

  // Date minimale : 2 jours dans le futur
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 2);
  const minDateString = minDate.toISOString().split('T')[0];

  // Gestionnaire de changement d'adresse
  const handleAddressChange = (field: keyof DeliveryAddress, value: string): void => {
    setDeliveryInfo({
      ...deliveryInfo,
      address: {
        ...deliveryInfo.address,
        [field]: value
      } as DeliveryAddress
    });
  };

  // Gestionnaire de changement pour les autres champs
  const handleInputChange = (field: keyof DeliveryInfo, value: string): void => {
    setDeliveryInfo({
      ...deliveryInfo,
      [field]: value
    });
  };

  // Initialiser l'adresse si elle n'existe pas
  React.useEffect(() => {
    if (!deliveryInfo.address) {
      setDeliveryInfo({
        ...deliveryInfo,
        type: 'delivery', // Forcer le type livraison
        address: {
          street: '',
          city: '',
          zipCode: '',
          complement: ''
        }
      });
    }
  }, []);

  return (
    <div className="space-y-6">
      
      {/* En-tête Livraison uniquement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="w-5 h-5 mr-2 text-green-600" />
            Livraison à domicile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm text-green-800 font-medium mb-1">
                  Livraison directement chez vous
                </p>
                <div className="text-sm text-green-700">
                  {isFreeDelivery ? (
                    <span className="font-medium">
                      ✨ Livraison gratuite (commande &gt; 50€)
                    </span>
                  ) : (
                    <>
                      <span>Frais de livraison : {deliveryFee}€</span>
                      <div className="text-xs mt-1 opacity-75">
                        💡 Livraison gratuite dès 50€ d'achat
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adresse de livraison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Adresse de livraison
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Message pour utilisateur connecté */}
          {isAuthenticated && user && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Connecté en tant que {user.name} - Vos informations peuvent être pré-remplies
              </p>
            </div>
          )}

          {/* Champs d'adresse */}
          <div>
            <Label htmlFor="street">Adresse complète *</Label>
            <Input
              id="street"
              value={deliveryInfo.address?.street || ''}
              onChange={(e) => handleAddressChange('street', e.target.value)}
              className={errors.street ? 'border-red-300 bg-red-50' : ''}
              placeholder="123 Rue de la Paix"
            />
            {errors.street && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.street}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="complement">Complément d'adresse (optionnel)</Label>
            <Input
              id="complement"
              value={deliveryInfo.address?.complement || ''}
              onChange={(e) => handleAddressChange('complement', e.target.value)}
              placeholder="Appartement, étage, bâtiment, code d'accès..."
            />
            <p className="text-sm text-gray-500 mt-1">
              Informations utiles pour faciliter la livraison
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zipCode">Code postal *</Label>
              <Input
                id="zipCode"
                value={deliveryInfo.address?.zipCode || ''}
                onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                className={errors.zipCode ? 'border-red-300 bg-red-50' : ''}
                placeholder="75001"
                maxLength={5}
              />
              {errors.zipCode && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.zipCode}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="city">Ville *</Label>
              <Input
                id="city"
                value={deliveryInfo.address?.city || ''}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                className={errors.city ? 'border-red-300 bg-red-50' : ''}
                placeholder="Paris"
              />
              {errors.city && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.city}
                </p>
              )}
            </div>
          </div>

          {/* Zone de livraison */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Zone de livraison :</strong> Paris et petite couronne (75, 92, 93, 94)
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Date de livraison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Date de livraison
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div>
            <Label htmlFor="date">Sélectionnez votre date de livraison *</Label>
            <Input
              id="date"
              type="date"
              value={deliveryInfo.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className={errors.date ? 'border-red-300 bg-red-50' : ''}
              min={minDateString}
            />
            {errors.date && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.date}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Livraison possible à partir de {minDate.toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </p>
          </div>

          {/* Informations sur la livraison */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Informations de livraison</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Livraison entre 9h et 18h</li>
              <li>• Délai minimum : 2 jours ouvrés</li>
              <li>• Livraison du lundi au samedi</li>
              <li>• Nous vous contacterons avant la livraison</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Instructions spéciales */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions spéciales (optionnel)</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="notes">Instructions pour le livreur</Label>
            <Textarea
              id="notes"
              value={deliveryInfo.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Code d'accès, étage, personne à contacter, instructions particulières..."
              rows={3}
              className="mt-1"
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-sm text-gray-500">
                Toute information utile pour faciliter la livraison
              </p>
              <span className="text-xs text-gray-400">
                {deliveryInfo.notes?.length || 0}/500
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Récapitulatif des frais */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <h4 className="font-medium text-gray-900 mb-3">Récapitulatif livraison</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Mode de livraison</span>
              <span className="font-medium">Livraison à domicile</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Frais de livraison</span>
              <span className={`font-bold ${deliveryFee === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                {deliveryFee === 0 ? 'Gratuit' : `${deliveryFee}€`}
              </span>
            </div>
            {deliveryInfo.date && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Date sélectionnée</span>
                <span className="font-medium">
                  {new Date(deliveryInfo.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryStep;