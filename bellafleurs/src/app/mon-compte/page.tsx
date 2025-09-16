// src/app/mon-compte/page.tsx
'use client';

import { useState } from 'react';
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

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
  preferences: {
    newsletter: boolean;
    sms: boolean;
    emailPromotions: boolean;
  };
  memberSince: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
}

// Mock user data
const mockUserProfile: UserProfile = {
  name: 'Marie Dubois',
  email: 'marie.dubois@email.com',
  phone: '01 23 45 67 89',
  address: {
    street: '123 Rue de la Paix',
    city: 'Paris',
    zipCode: '75001',
    country: 'France'
  },
  preferences: {
    newsletter: true,
    sms: false,
    emailPromotions: true
  },
  memberSince: '2023-03-15',
  totalOrders: 12,
  totalSpent: 456.80,
  loyaltyPoints: 245
};

const recentOrders = [
  {
    id: 'BF-20241210-0003',
    date: '10 décembre 2024',
    status: 'delivered',
    total: 65.90,
    items: 2
  },
  {
    id: 'BF-20241201-0012',
    date: '1 décembre 2024',
    status: 'delivered',
    total: 45.90,
    items: 1
  },
  {
    id: 'BF-20241120-0008',
    date: '20 novembre 2024',
    status: 'delivered',
    total: 89.50,
    items: 3
  }
];

export default function MonComptePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(mockUserProfile);
  const [isEditing, setIsEditing] = useState({
    personal: false,
    address: false,
    preferences: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (section: keyof typeof isEditing) => {
    setIsLoading(true);
    
    try {
      // Simulation de la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsEditing(prev => ({ ...prev, [section]: false }));
      console.log(`Section ${section} saved:`, profile);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (section: keyof typeof isEditing) => {
    setIsEditing(prev => ({ ...prev, [section]: false }));
    // Reset to original values (in a real app, you'd keep original state)
    setProfile(mockUserProfile);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      delivered: 'bg-green-100 text-green-800',
      preparing: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      delivered: 'Livrée',
      preparing: 'En préparation',
      cancelled: 'Annulée'
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <ProtectedRoute requireAuth>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {/* Header responsive */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Mon compte
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Gérez vos informations personnelles et vos préférences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Sidebar - Statistiques responsive */}
            <div className="space-y-4 sm:space-y-6">
              
              {/* Carte de bienvenue responsive */}
              <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg sm:text-2xl font-bold">
                        {profile.name.charAt(0)}
                      </span>
                    </div>
                    <div className="text-center sm:text-left">
                      <h2 className="text-lg sm:text-xl font-bold">{profile.name}</h2>
                      <p className="text-green-100 text-sm sm:text-base">
                        Membre depuis {new Date(profile.memberSince).toLocaleDateString('fr-FR', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statistiques responsive */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-lg sm:text-xl">Vos statistiques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">Commandes</span>
                    <span className="font-bold text-base sm:text-lg">{profile.totalOrders}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">Total dépensé</span>
                    <span className="font-bold text-base sm:text-lg text-green-600">
                      {profile.totalSpent.toFixed(2)}€
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">Points fidélité</span>
                    <Badge className="bg-yellow-100 text-yellow-800 text-xs sm:text-sm">
                      {profile.loyaltyPoints} pts
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation mobile visible uniquement sur petit écran */}
              <Card className="lg:hidden">
                <CardContent className="p-3 sm:p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm">
                      <Gift className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Fidélité
                    </Button>
                    <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm">
                      <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Paiements
                    </Button>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Contenu principal responsive */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">

              {/* Informations personnelles */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-lg sm:text-xl flex items-center">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Informations personnelles
                    </CardTitle>
                    {!isEditing.personal ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsEditing(prev => ({ ...prev, personal: true }))}
                        className="self-start sm:self-auto"
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Modifier
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button 
                          size="sm"
                          onClick={() => handleSave('personal')}
                          disabled={isLoading}
                          className="text-xs sm:text-sm"
                        >
                          <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Sauvegarder
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCancel('personal')}
                          className="text-xs sm:text-sm"
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Annuler
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  {!isEditing.personal ? (
                    <div className="space-y-3 sm:space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <Label className="text-xs sm:text-sm text-gray-600">Nom complet</Label>
                          <p className="font-medium text-sm sm:text-base">{profile.name}</p>
                        </div>
                        <div>
                          <Label className="text-xs sm:text-sm text-gray-600">Email</Label>
                          <p className="font-medium text-sm sm:text-base break-all sm:break-normal">{profile.email}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm text-gray-600">Téléphone</Label>
                        <p className="font-medium text-sm sm:text-base">{profile.phone}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <Label className="text-xs sm:text-sm">Nom complet</Label>
                          <Input 
                            value={profile.name}
                            onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs sm:text-sm">Email</Label>
                          <Input 
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                            className="text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm">Téléphone</Label>
                        <Input 
                          value={profile.phone}
                          onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Adresse */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-lg sm:text-xl flex items-center">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Adresse de livraison
                    </CardTitle>
                    {!isEditing.address ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsEditing(prev => ({ ...prev, address: true }))}
                        className="self-start sm:self-auto"
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Modifier
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button 
                          size="sm"
                          onClick={() => handleSave('address')}
                          disabled={isLoading}
                          className="text-xs sm:text-sm"
                        >
                          <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Sauvegarder
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCancel('address')}
                          className="text-xs sm:text-sm"
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Annuler
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {!isEditing.address ? (
                    <div className="space-y-2">
                      <p className="font-medium text-sm sm:text-base">{profile.address.street}</p>
                      <p className="text-sm sm:text-base text-gray-600">
                        {profile.address.zipCode} {profile.address.city}
                      </p>
                      <p className="text-sm sm:text-base text-gray-600">{profile.address.country}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs sm:text-sm">Rue</Label>
                        <Input 
                          value={profile.address.street}
                          onChange={(e) => setProfile(prev => ({
                            ...prev,
                            address: { ...prev.address, street: e.target.value }
                          }))}
                          className="text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <Label className="text-xs sm:text-sm">Code postal</Label>
                          <Input 
                            value={profile.address.zipCode}
                            onChange={(e) => setProfile(prev => ({
                              ...prev,
                              address: { ...prev.address, zipCode: e.target.value }
                            }))}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs sm:text-sm">Ville</Label>
                          <Input 
                            value={profile.address.city}
                            onChange={(e) => setProfile(prev => ({
                              ...prev,
                              address: { ...prev.address, city: e.target.value }
                            }))}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Préférences */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-lg sm:text-xl flex items-center">
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={profile.preferences.newsletter}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, newsletter: e.target.checked }
                      }))}
                      className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900 text-sm sm:text-base">Newsletter</span>
                      <p className="text-xs sm:text-sm text-gray-600">Recevez nos conseils et promotions exclusives</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={profile.preferences.sms}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, sms: e.target.checked }
                      }))}
                      className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900 text-sm sm:text-base">Notifications SMS</span>
                      <p className="text-xs sm:text-sm text-gray-600">Recevez des SMS pour le suivi de vos commandes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Commandes récentes */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-lg sm:text-xl">Commandes récentes</CardTitle>
                    <Button variant="outline" size="sm" asChild className="self-start sm:self-auto">
                      <a href="/mes-commandes" className="text-xs sm:text-sm">Voir toutes</a>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors gap-3 sm:gap-0">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                            <span className="font-medium text-gray-900 text-sm sm:text-base">{order.id}</span>
                            <Badge className={`${getStatusColor(order.status)} text-xs w-fit`}>
                              {getStatusLabel(order.status)}
                            </Badge>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600">
                            <span>{order.date}</span>
                            <span>{order.items} article{order.items > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-green-600 text-sm sm:text-base">
                            {order.total.toFixed(2)}€
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
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