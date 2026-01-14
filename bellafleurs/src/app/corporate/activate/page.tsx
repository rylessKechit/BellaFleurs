// src/app/corporate/activate/page.tsx - Page d'activation B2B
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Eye, EyeOff, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface ActivationData {
  user: {
    name: string;
    email: string;
    company: {
      name: string;
      contactPerson: string;
    };
  };
  valid: boolean;
}

export default function CorporateActivationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [activationData, setActivationData] = useState<ActivationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActivating, setIsActivating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Vérifier le token au chargement
  useEffect(() => {
    if (!token) {
      toast.error('Token d\'activation manquant');
      router.push('/');
      return;
    }

    checkToken();
  }, [token, router]);

  const checkToken = async () => {
    try {
      const response = await fetch(`/api/corporate/activate?token=${token}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setActivationData(data.data);
      } else {
        toast.error(data.error?.message || 'Token invalide');
        router.push('/');
      }
    } catch (error) {
      toast.error('Erreur lors de la vérification du token');
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'La confirmation est requise';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleActivation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsActivating(true);

    try {
      const response = await fetch('/api/corporate/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Compte activé avec succès !');
        router.push('/auth/signin?message=account-activated');
      } else {
        toast.error(data.error?.message || 'Erreur lors de l\'activation');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'activation');
    } finally {
      setIsActivating(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Vérification du token...
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  if (!activationData) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
          <Card className="w-full max-w-md mx-4 border-red-200">
            <CardContent className="text-center py-8">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Token invalide</h3>
              <p className="text-gray-600">Ce lien d'activation n'est plus valide.</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12 pt-20">
        <div className="max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <Building2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Bella Fleurs Corporate</h1>
          <p className="text-gray-600 mt-2">Activation de votre compte entreprise</p>
        </div>

        <Card>
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Token valide</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Informations de l'entreprise */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">Informations du compte</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Contact :</span> {activationData.user.name}</p>
                <p><span className="font-medium">Email :</span> {activationData.user.email}</p>
                <p><span className="font-medium">Entreprise :</span> {activationData.user.company.name}</p>
              </div>
            </div>

            {/* Formulaire de mot de passe */}
            <form onSubmit={handleActivation} className="space-y-4">
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Minimum 6 caractères"
                    className={errors.password ? 'border-red-300' : ''}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Répétez votre mot de passe"
                    className={errors.confirmPassword ? 'border-red-300' : ''}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isActivating}
              >
                {isActivating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Activation en cours...
                  </>
                ) : (
                  'Activer mon compte'
                )}
              </Button>
            </form>

            {/* Avantages rappel */}
            <div className="text-center text-sm text-gray-600">
              <p className="mb-2">🎯 <strong>Avantages de votre compte corporate :</strong></p>
              <div className="text-xs space-y-1">
                <p>✓ Facturation mensuelle regroupée</p>
                <p>✓ Dashboard dédié avec rapports</p>
                <p>✓ Tarifs préférentiels</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-600">
          Des questions ? Contactez-nous au{' '}
          <a href="tel:0160847568" className="text-green-600 hover:underline">
            01 60 84 75 68
          </a>
        </div>
      </div>
      </div>
      <Footer />
    </>
  );
}