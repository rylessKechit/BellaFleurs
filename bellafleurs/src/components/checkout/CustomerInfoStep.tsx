// src/components/checkout/CustomerInfoStep.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/hooks/useAuth';

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface CustomerInfoStepProps {
  customerInfo: CustomerInfo;
  setCustomerInfo: (info: CustomerInfo) => void;
  errors: Record<string, string>;
}

export default function CustomerInfoStep({
  customerInfo,
  setCustomerInfo,
  errors
}: CustomerInfoStepProps) {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();

  // Pré-remplir automatiquement les champs avec les données utilisateur
  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      
      // Extraire prénom et nom du champ "name" complet
      const fullName = user.name || '';
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Vérifier si les champs sont vides pour éviter d'écraser des modifications
      const shouldPrefill = !customerInfo.firstName && 
                           !customerInfo.lastName && 
                           !customerInfo.email && 
                           !customerInfo.phone;

      if (shouldPrefill) {
        setCustomerInfo({
          firstName: firstName,
          lastName: lastName,
          email: user.email || '',
          phone: '' // Le téléphone n'est pas toujours disponible dans la session
        });
      }
    }
  }, [isAuthenticated, user, isLoading, setCustomerInfo]);

  // Récupérer les données complètes du profil utilisateur si connecté
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isAuthenticated && user) {
        try {
          const response = await fetch('/api/user/profile', {
            method: 'GET',
            credentials: 'include'
          });

          if (response.ok) {
            const data = await response.json();
            const userProfile = data.data;

            // Extraire prénom et nom
            const fullName = userProfile.name || '';
            const nameParts = fullName.trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            // Pré-remplir avec les données complètes du profil
            const shouldPrefill = !customerInfo.firstName && 
                                 !customerInfo.lastName && 
                                 !customerInfo.email && 
                                 !customerInfo.phone;

            if (shouldPrefill) {
              setCustomerInfo({
                firstName: firstName,
                lastName: lastName,
                email: userProfile.email || '',
                phone: userProfile.phone || ''
              });
            }
          }
        } catch (error) {
          console.warn('⚠️ Erreur lors de la récupération du profil:', error);
          // Ce n'est pas critique, on continue avec les données de session
        }
      }
    };

    // Délai pour éviter les appels multiples
    const timeoutId = setTimeout(fetchUserProfile, 500);
    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, user, setCustomerInfo]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="w-5 h-5 mr-2" />
          Vos informations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Message pour utilisateur non connecté */}
        {!isAuthenticated && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Vous n'êtes pas connecté.</strong>
                </p>
                <p className="text-sm text-blue-700 mb-3">
                  Se connecter vous permettra de :
                </p>
                <ul className="text-sm text-blue-700 list-disc list-inside mb-3 space-y-1">
                  <li>Pré-remplir automatiquement vos informations</li>
                  <li>Suivre vos commandes facilement</li>
                  <li>Accéder à votre historique d'achats</li>
                  <li>Bénéficier d'un checkout plus rapide</li>
                </ul>
                <button 
                  onClick={() => router.push('/auth/signin?callbackUrl=/checkout')}
                  className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Se connecter maintenant
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Formulaire */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">Prénom *</Label>
            <Input
              id="firstName"
              value={customerInfo.firstName}
              onChange={(e) => setCustomerInfo({...customerInfo, firstName: e.target.value})}
              className={errors.firstName ? 'border-red-300 bg-red-50' : ''}
              placeholder="Jean"
              disabled={isLoading}
            />
            {errors.firstName && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.firstName}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="lastName">Nom *</Label>
            <Input
              id="lastName"
              value={customerInfo.lastName}
              onChange={(e) => setCustomerInfo({...customerInfo, lastName: e.target.value})}
              className={errors.lastName ? 'border-red-300 bg-red-50' : ''}
              placeholder="Dupont"
              disabled={isLoading}
            />
            {errors.lastName && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.lastName}
              </p>
            )}
          </div>
        </div>
        
        <div>
          <Label htmlFor="email">Adresse email *</Label>
          <Input
            id="email"
            type="email"
            value={customerInfo.email}
            onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
            className={errors.email ? 'border-red-300 bg-red-50' : ''}
            placeholder="jean.dupont@email.com"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.email}
            </p>
          )}
        </div>
        
        <div>
          <Label htmlFor="phone">Téléphone *</Label>
          <Input
            id="phone"
            type="tel"
            value={customerInfo.phone}
            onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
            className={errors.phone ? 'border-red-300 bg-red-50' : ''}
            placeholder="07 80 66 27 32"
            disabled={isLoading}
          />
          {errors.phone && (
            <p className="text-red-600 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.phone}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Format attendu : 07 80 66 27 32 ou 07 80 66 27 32
          </p>
        </div>

        {/* Informations sur la protection des données */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600">
            🔒 Vos informations personnelles sont protégées et utilisées uniquement pour traiter votre commande conformément à notre politique de confidentialité.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}