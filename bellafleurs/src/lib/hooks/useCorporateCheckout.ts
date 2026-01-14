// src/lib/hooks/useCorporateCheckout.ts - Logique spécifique aux comptes corporate
'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export interface CorporateCheckoutData {
  // Auto-remplissage depuis le compte corporate
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
  };
  deliveryInfo: {
    address: {
      street: string;
      city: string;
      zipCode: string;
      country: string;
    };
    date: string;
    timeSlot: string;
    notes: string;
  };
}

export interface CorporateUsage {
  currentMonth: {
    spent: number;
    limit: number;
    remainingBudget: number;
    canOrder: boolean;
  };
  orderAmount: number;
  wouldExceedLimit: boolean;
}

export function useCorporateCheckout(orderTotal: number) {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [corporateData, setCorporateData] = useState<CorporateCheckoutData | null>(null);
  const [usage, setUsage] = useState<CorporateUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const isCorporateAccount = (session?.user as any)?.accountType === 'corporate';

  // Charger les données corporate au démarrage
  useEffect(() => {
    if (!isCorporateAccount || !session?.user) {
      setIsLoading(false);
      return;
    }

    loadCorporateData();
  }, [isCorporateAccount, session]);

  const loadCorporateData = async () => {
    try {
      setIsLoading(true);

      // ✅ NOUVELLE APPROCHE : Récupérer les données directement depuis l'API utilisateur
      console.log('🔄 Chargement des données corporate...');

      const [statsResponse, userResponse] = await Promise.all([
        fetch('/api/corporate/dashboard/stats', { credentials: 'include' }),
        fetch('/api/user/profile', { credentials: 'include' })
      ]);

      console.log('📊 Stats Response Status:', statsResponse.status);
      console.log('👤 User Response Status:', userResponse.status);

      if (!statsResponse.ok) {
        const statsError = await statsResponse.json();
        console.error('❌ Erreur stats:', statsError);
        throw new Error(`Erreur stats: ${statsError.error?.message || 'Erreur inconnue'}`);
      }

      const statsData = await statsResponse.json();
      // ✅ CORRECTION : L'API retourne { data: { stats } }
      const stats = statsData.data?.stats;
      console.log('✅ Stats chargées:', stats);

      // ✅ Récupérer les données utilisateur fraîches depuis l'API
      let userFromAPI = null;
      if (userResponse.ok) {
        const userData = await userResponse.json();
        userFromAPI = userData.data?.user;
        console.log('🔍 Données utilisateur depuis API:', userFromAPI);
      } else {
        const userError = await userResponse.json();
        console.error('❌ Erreur user profile:', userError);
        console.warn('⚠️ Impossible de récupérer les données utilisateur depuis l\'API, utilisation session');
      }

      // ✅ Utiliser les données de l'API si disponibles, sinon fallback vers session
      const user = userFromAPI || session?.user;
      console.log('📱 Données utilisateur finales utilisées:', user);

      // ✅ Extraction sécurisée du nom
      const nameParts = (user?.name || '').split(' ');
      const corporateInfo: CorporateCheckoutData = {
        customerInfo: {
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: user?.email || '',
          phone: user?.phone || '',
          company: user?.company?.name || ''
        },
        deliveryInfo: {
          address: {
            street: user?.address?.street || '',
            city: user?.address?.city || '',
            zipCode: user?.address?.zipCode || '',
            country: user?.address?.country || 'France'
          },
          date: '',
          timeSlot: '9h-12h',
          notes: `Livraison pour ${user?.company?.name || 'entreprise'}`
        }
      };

      console.log('✅ Données corporate pré-remplies:', corporateInfo);

      // Calculer l'usage et les limites
      const monthlyLimit = user?.corporateSettings?.monthlyLimit || 1000;
      // ✅ CORRECTION : L'API retourne 'amount' et non 'spent'
      const currentSpent = stats?.currentMonth?.amount || 0;
      const remainingBudget = monthlyLimit - currentSpent;
      const wouldExceedLimit = (currentSpent + orderTotal) > monthlyLimit;

      console.log('💰 Budget mensuel:', {
        limit: monthlyLimit,
        spent: currentSpent,
        remaining: remainingBudget,
        orderTotal,
        wouldExceed: wouldExceedLimit
      });

      const usageInfo: CorporateUsage = {
        currentMonth: {
          spent: currentSpent,
          limit: monthlyLimit,
          remainingBudget,
          canOrder: !wouldExceedLimit
        },
        orderAmount: orderTotal,
        wouldExceedLimit
      };

      setCorporateData(corporateInfo);
      setUsage(usageInfo);

    } catch (error: any) {
      console.error('❌ Erreur chargement données corporate:', error);
      const errorMessage = error?.message || 'Erreur lors du chargement des données de votre entreprise';
      console.error('💥 Message d\'erreur:', errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Créer une commande corporate (sans paiement immédiat)
  const createCorporateOrder = async (orderData: any) => {
    if (!isCorporateAccount || !session?.user) {
      throw new Error('Compte corporate requis');
    }

    if (usage?.wouldExceedLimit) {
      throw new Error(`Cette commande dépasserait votre limite mensuelle de ${usage.currentMonth.limit}€`);
    }

    setIsCreatingOrder(true);

    try {
      const user = session.user as any; // Cast pour accéder aux propriétés extended
      
      const response = await fetch('/api/orders/corporate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...orderData,
          corporateInfo: {
            companyName: user?.company?.name,
            contactPerson: user?.name,
            monthlyLimit: usage?.currentMonth.limit,
            currentSpent: usage?.currentMonth.spent,
            paymentTerm: user?.corporateSettings?.paymentTerm || 'monthly'
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erreur lors de la création de la commande');
      }

      const result = await response.json();
      const order = result.data.order;

      // Rediriger vers la page de succès corporate
      router.push(`/corporate/orders/${order._id}?success=true`);

      return order;

    } catch (error: any) {
      console.error('Erreur création commande corporate:', error);
      throw error;
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Mettre à jour les données de livraison
  const updateDeliveryInfo = (updates: Partial<CorporateCheckoutData['deliveryInfo']>) => {
    if (!corporateData) return;

    setCorporateData(prev => ({
      ...prev!,
      deliveryInfo: {
        ...prev!.deliveryInfo,
        ...updates
      }
    }));
  };

  // Vérifier si une date est disponible pour la livraison
  const checkDeliveryAvailability = async (date: string) => {
    try {
      const response = await fetch(`/api/delivery/check-availability?date=${date}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Erreur vérification disponibilité');
      }

      const result = await response.json();
      return result.data;

    } catch (error) {
      console.error('Erreur vérification disponibilité:', error);
      return { available: true, timeSlots: ['9h-12h', '14h-17h'] }; // Fallback
    }
  };

  return {
    // État
    isCorporateAccount,
    corporateData,
    usage,
    isLoading,
    isCreatingOrder,

    // Actions
    createCorporateOrder,
    updateDeliveryInfo,
    checkDeliveryAvailability,
    loadCorporateData
  };
}