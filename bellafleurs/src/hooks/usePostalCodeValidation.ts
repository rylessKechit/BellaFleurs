// src/hooks/usePostalCodeValidation.ts - Hook simplifié pour la validation des codes postaux

import { useState, useCallback, useMemo } from 'react';
import { findCitiesByPostalCode, isDeliverable } from '@/lib/data/postalCodes';

export interface PostalCodeValidationState {
  isValid: boolean;
  isDeliverable: boolean;
  city: string; // Première ville (pour compatibilité)
  cities: string[]; // Toutes les villes
  isLoading: boolean;
  error: string | null;
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
  cities: [],
  isLoading: false,
  error: null,
};

export const usePostalCodeValidation = (): UsePostalCodeValidationReturn => {
  const [validationState, setValidationState] = useState<PostalCodeValidationState>(initialState);

  // Validation du format code postal français
  const isValidPostalCodeFormat = useCallback((zipCode: string): boolean => {
    const cleanZipCode = zipCode.trim().replace(/\s+/g, '');
    return /^[0-9]{5}$/.test(cleanZipCode);
  }, []);

  // Fonction principale de validation
  const validatePostalCode = useCallback((zipCode: string) => {
    const cleanZipCode = zipCode.trim().replace(/\s+/g, '');
    
    // Réinitialiser si vide
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
        cities: [],
        isLoading: false,
        error: 'Format de code postal invalide (5 chiffres requis)',
      });
      return;
    }

    // Simulation délai validation
    setValidationState(prev => ({ ...prev, isLoading: true, error: null }));

    setTimeout(() => {
      const cities = findCitiesByPostalCode(cleanZipCode);
      const deliverable = isDeliverable(cleanZipCode);
      
      if (cities.length === 0) {
        setValidationState({
          isValid: true,
          isDeliverable: false,
          city: '',
          cities: [],
          isLoading: false,
          error: 'Code postal non desservi par nos services de livraison',
        });
        return;
      }

      setValidationState({
        isValid: true,
        isDeliverable: deliverable,
        city: cities[0], // Première ville
        cities: cities, // Toutes les villes
        isLoading: false,
        error: null,
      });
    }, 300);
  }, [isValidPostalCodeFormat]);

  // Réinitialisation
  const resetValidation = useCallback(() => {
    setValidationState(initialState);
  }, []);

  // Retour mémorisé
  const returnValue = useMemo(() => ({
    validationState,
    validatePostalCode,
    resetValidation
  }), [validationState, validatePostalCode, resetValidation]);

  return returnValue;
};