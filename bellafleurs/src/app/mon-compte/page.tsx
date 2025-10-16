// 🚨 FIX URGENT - src/app/mon-compte/page.tsx - Version SANS boucle infinie
'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, MapPin, Lock, Bell, CreditCard, Gift, Edit, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/hooks/useAuth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { toast } from 'sonner';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
  role: string;
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderData {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  items: any[];
  createdAt: string;
}

interface UserStats {
  totalOrders: number;
  totalSpent: number;
  avgOrderAmount: number;
}

export default function MonComptePage() {
  const { user, isAuthenticated } = useAuth();
  
  // États
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    totalOrders: 0,
    totalSpent: 0,
    avgOrderAmount: 0
  });
  const [recentOrders, setRecentOrders] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState({
    personal: false,
    address: false,
    preferences: false
  });
  const [isSaving, setIsSaving] = useState(false);

  // 🛡️ PROTECTION CONTRE LES BOUCLES INFINIES
  const hasLoadedData = useRef(false);
  const isLoadingRef = useRef(false);

  // 🔥 CHARGEMENT UNIQUE ET SÉCURISÉ
  useEffect(() => {
    const loadUserData = async () => {
      // ✅ Protection : une seule exécution
      if (!isAuthenticated || !user || hasLoadedData.current || isLoadingRef.current) {
        return;
      }
      isLoadingRef.current = true;
      setIsLoading(true);

      try {
        // Charger toutes les données en parallèle
        const [profileData, ordersData] = await Promise.all([
          fetchUserProfile(),
          fetchUserOrders()
        ]);

        // Calculer les stats à partir des commandes récupérées
        if (ordersData && ordersData.length > 0) {
          calculateStats(ordersData);
        }

        hasLoadedData.current = true;

      } catch (error) {
        console.error('❌ Erreur lors du chargement:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    };

    // Délai pour éviter les appels multiples
    const timeoutId = setTimeout(loadUserData, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isAuthenticated, user?.id]); // ✅ Dépendances stables uniquement

  // 📝 RÉCUPÉRER LE PROFIL UTILISATEUR
  const fetchUserProfile = async (): Promise<UserProfile | null> => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.data);
        return data.data;
      } else {
        throw new Error('Erreur lors du chargement du profil');
      }
    } catch (error) {
      console.error('❌ Erreur profil:', error);
      toast.error('Erreur lors du chargement du profil');
      return null;
    }
  };

  // 📊 RÉCUPÉRER LES COMMANDES
  const fetchUserOrders = async (): Promise<OrderData[]> => {
    try {
      const response = await fetch('/api/orders?limit=10', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const orders = data.data.orders || [];
        setRecentOrders(orders);
        return orders;
      } else {
        console.warn('⚠️ Pas de commandes trouvées');
        setRecentOrders([]);
        return [];
      }
    } catch (error) {
      console.error('❌ Erreur commandes:', error);
      setRecentOrders([]);
      return [];
    }
  };

  // 🧮 CALCULER LES STATS (fonction pure sans effects)
  const calculateStats = (orders: OrderData[]) => {
    const validOrders = orders.filter(order => order.status !== 'annulée');
    const totalOrders = validOrders.length;
    const totalSpent = validOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const avgOrderAmount = totalOrders > 0 ? totalSpent / totalOrders : 0;

    setUserStats({
      totalOrders,
      totalSpent,
      avgOrderAmount
    });
  };

  // 💾 SAUVEGARDER LES MODIFICATIONS
  const handleSave = async (section: keyof typeof isEditing) => {
    if (!profile) return;

    setIsSaving(true);
    
    try {
      let updateData: any = {};

      if (section === 'personal') {
        updateData = {
          name: profile.name,
          phone: profile.phone
        };
      } else if (section === 'address') {
        updateData = {
          address: profile.address
        };
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.data);
        setIsEditing(prev => ({ ...prev, [section]: false }));
        toast.success('Profil mis à jour avec succès');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erreur lors de la sauvegarde');
      }
    } catch (error: any) {
      console.error('❌ Erreur sauvegarde:', error);
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  // ❌ ANNULER LES MODIFICATIONS  
  const handleCancel = (section: keyof typeof isEditing) => {
    setIsEditing(prev => ({ ...prev, [section]: false }));
    // Pas de rechargement automatique pour éviter les boucles
  };

  // 🎨 COULEURS DES STATUTS
  const getStatusColor = (status: string) => {
    const colors = {
      'payée': 'bg-blue-100 text-blue-800',
      'en_creation': 'bg-purple-100 text-purple-800',
      'prête': 'bg-green-100 text-green-800',
      'en_livraison': 'bg-orange-100 text-orange-800',
      'livrée': 'bg-emerald-100 text-emerald-800',
      'annulée': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // 📝 LABELS DES STATUTS
  const getStatusLabel = (status: string) => {
    const labels = {
      'payée': 'Payée',
      'en_creation': 'En création',
      'prête': 'Prête',
      'en_livraison': 'En livraison',  
      'livrée': 'Livrée',
      'annulée': 'Annulée'
    };
    return labels[status as keyof typeof labels] || status;
  };

  // 🔄 LOADING STATE
  if (isLoading || !profile) {
    return (
      <ProtectedRoute requireAuth>
        <Header />
        <main className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de votre profil...</p>
          </div>
        </main>
        <Footer />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Mon compte
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Gérez vos informations personnelles et consultez vos commandes
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Sidebar - Statistiques */}
            <div className="space-y-4 sm:space-y-6">
              
              {/* Carte de bienvenue */}
              <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg sm:text-2xl font-bold">
                        {profile.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-center sm:text-left">
                      <h2 className="text-lg sm:text-xl font-bold">{profile.name}</h2>
                      <p className="text-green-100 text-sm sm:text-base">
                        Membre depuis {new Date(profile.createdAt).toLocaleDateString('fr-FR', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statistiques */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-lg sm:text-xl">Vos statistiques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">Commandes</span>
                    <span className="font-bold text-base sm:text-lg">{userStats.totalOrders}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">Total dépensé</span>
                    <span className="font-bold text-base sm:text-lg text-green-600">
                      {userStats.totalSpent.toFixed(2)}€
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">Panier moyen</span>
                    <span className="font-bold text-base sm:text-lg">
                      {userStats.avgOrderAmount.toFixed(2)}€
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Commandes récentes */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-lg sm:text-xl">Commandes récentes</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentOrders.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      Aucune commande pour le moment
                    </p>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {recentOrders.slice(0, 3).map((order) => (
                        <div key={order._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{order.orderNumber}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                            <p className="text-xs text-gray-600">
                              {order.items.length} article{order.items.length > 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end sm:space-x-3">
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusLabel(order.status)}
                            </Badge>
                            <span className="font-medium text-sm">
                              {order.totalAmount.toFixed(2)}€
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Contenu principal */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Informations personnelles */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center text-lg sm:text-xl">
                    <User className="w-5 h-5 mr-2" />
                    Informations personnelles
                  </CardTitle>
                  <Button
                    variant={isEditing.personal ? "outline" : "ghost"}
                    size="sm"
                    onClick={() => setIsEditing(prev => ({ 
                      ...prev, 
                      personal: !prev.personal 
                    }))}
                    disabled={isSaving}
                  >
                    {isEditing.personal ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isEditing.personal ? (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs sm:text-sm text-gray-500">Nom complet</Label>
                        <p className="font-medium text-sm sm:text-base">{profile.name}</p>
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm text-gray-500">Email</Label>
                        <p className="text-sm sm:text-base">{profile.email}</p>
                        {profile.emailVerified && (
                          <Badge variant="outline" className="mt-1">
                            ✓ Vérifié
                          </Badge>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm text-gray-500">Téléphone</Label>
                        <p className="text-sm sm:text-base">
                          {profile.phone || 'Non renseigné'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs sm:text-sm">Nom complet</Label>
                        <Input 
                          value={profile.name}
                          onChange={(e) => setProfile(prev => prev ? {
                            ...prev,
                            name: e.target.value
                          } : null)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm">Téléphone</Label>
                        <Input 
                          value={profile.phone || ''}
                          onChange={(e) => setProfile(prev => prev ? {
                            ...prev,
                            phone: e.target.value
                          } : null)}
                          placeholder="07 80 66 27 32"
                          className="text-sm"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleSave('personal')}
                          disabled={isSaving}
                        >
                          {isSaving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save className="w-4 h-4 mr-1" />}
                          Sauvegarder
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleCancel('personal')}
                          disabled={isSaving}
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Adresse */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center text-lg sm:text-xl">
                    <MapPin className="w-5 h-5 mr-2" />
                    Adresse de livraison
                  </CardTitle>
                  <Button
                    variant={isEditing.address ? "outline" : "ghost"}
                    size="sm"
                    onClick={() => setIsEditing(prev => ({ 
                      ...prev, 
                      address: !prev.address 
                    }))}
                    disabled={isSaving}
                  >
                    {isEditing.address ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  </Button>
                </CardHeader>
                <CardContent>
                  {!isEditing.address ? (
                    profile.address ? (
                      <div className="space-y-2">
                        <p className="font-medium text-sm sm:text-base">{profile.address.street}</p>
                        <p className="text-sm sm:text-base text-gray-600">
                          {profile.address.zipCode} {profile.address.city}
                        </p>
                        <p className="text-sm sm:text-base text-gray-600">{profile.address.country}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm sm:text-base">Aucune adresse renseignée</p>
                    )
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs sm:text-sm">Rue</Label>
                        <Input 
                          value={profile.address?.street || ''}
                          onChange={(e) => setProfile(prev => prev ? {
                            ...prev,
                            address: { 
                              street: e.target.value,
                              city: prev.address?.city || '',
                              zipCode: prev.address?.zipCode || '',
                              country: prev.address?.country || 'France'
                            }
                          } : null)}
                          className="text-sm"
                          placeholder="123 Rue de la Paix"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <Label className="text-xs sm:text-sm">Code postal</Label>
                          <Input 
                            value={profile.address?.zipCode || ''}
                            onChange={(e) => setProfile(prev => prev ? {
                              ...prev,
                              address: { 
                                ...prev.address!,
                                zipCode: e.target.value
                              }
                            } : null)}
                            className="text-sm"
                            placeholder="75001"
                          />
                        </div>
                        <div>
                          <Label className="text-xs sm:text-sm">Ville</Label>
                          <Input 
                            value={profile.address?.city || ''}
                            onChange={(e) => setProfile(prev => prev ? {
                              ...prev,
                              address: { 
                                ...prev.address!,
                                city: e.target.value
                              }
                            } : null)}
                            className="text-sm"
                            placeholder="Paris"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleSave('address')}
                          disabled={isSaving}
                        >
                          {isSaving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save className="w-4 h-4 mr-1" />}
                          Sauvegarder
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleCancel('address')}
                          disabled={isSaving}
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </ProtectedRoute>
  );
}