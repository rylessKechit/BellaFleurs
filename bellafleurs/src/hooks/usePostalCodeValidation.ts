// src/hooks/usePostalCodeValidation.ts - Hook pour la validation des codes postaux
import { useState, useCallback, useMemo } from 'react';
import { findCityByPostalCode, isDeliverable, type PostalCodeData } from '@/lib/data/postalCodes';

export interface PostalCodeValidationState {
  isValid: boolean;
  isDeliverable: boolean;
  city: string;
  isLoading: boolean;
  error: string | null;
  zoneInfo: PostalCodeData | null;
}

export interface UsePostalCodeValidationReturn {
  validationState: PostalCodeValidationState;
  validatePostalCode: (zipCode: string) => void;
  resetValidation: () => void;
}

const initialState: PostalCodeValidationState = {
  isValid: false,
  isDeliverable: false,
  city: '',
  isLoading: false,
  error: null,
  zoneInfo: null
};

export const usePostalCodeValidation = (): UsePostalCodeValidationReturn => {
  const [validationState, setValidationState] = useState<PostalCodeValidationState>(initialState);

  // Fonction de validation du format du code postal français
  const isValidPostalCodeFormat = useCallback((zipCode: string): boolean => {
    const cleanZipCode = zipCode.trim().replace(/\s+/g, '');
    return /^[0-9]{5}$/.test(cleanZipCode);
  }, []);

  // Fonction principale de validation
  const validatePostalCode = useCallback((zipCode: string) => {
    const cleanZipCode = zipCode.trim().replace(/\s+/g, '');
    
    // Réinitialiser l'état si le code postal est vide
    if (!cleanZipCode) {
      setValidationState(initialState);
      return;
    }

    // Vérifier le format
    if (!isValidPostalCodeFormat(cleanZipCode)) {
      setValidationState({
        isValid: false,
        isDeliverable: false,
        city: '',
        isLoading: false,
        error: 'Format de code postal invalide (5 chiffres requis)',
        zoneInfo: null
      });
      return;
    }

    // Simulation d'un délai de validation (comme un appel API)
    setValidationState(prev => ({ ...prev, isLoading: true, error: null }));

    // Simuler un délai court pour une meilleure UX
    setTimeout(() => {
      const zoneInfo = findCityByPostalCode(cleanZipCode);
      const deliverable = isDeliverable(cleanZipCode);

      if (zoneInfo) {
        setValidationState({
          isValid: true,
          isDeliverable: deliverable,
          city: zoneInfo.city,
          isLoading: false,
          error: null,
          zoneInfo
        });
      } else {
        setValidationState({
          isValid: true, // Format valide mais zone non couverte
          isDeliverable: false,
          city: '',
          isLoading: false,
          error: 'Zone non couverte par notre service de livraison',
          zoneInfo: null
        });
      }
    }, 300); // Délai court pour une validation fluide
  }, [isValidPostalCodeFormat]);

  // Fonction de réinitialisation
  const resetValidation = useCallback(() => {
    setValidationState(initialState);
  }, []);

  // Mémoriser le retour pour éviter les re-renders inutiles
  const returnValue = useMemo(() => ({
    validationState,
    validatePostalCode,
    resetValidation
  }), [validationState, validatePostalCode, resetValidation]);

  return returnValue;
};