// src/hooks/useShopStatus.ts - VERSION CORRIGÉE (sans erreur TypeScript)
import { useState, useEffect, useCallback } from 'react';

interface ShopStatus {
  isOpen: boolean;
  isClosed?: boolean;
  reason?: string;
  message?: string;
  startDate?: string;
  endDate?: string;
  loading: boolean;
}

// Event system pour revalidation globale
const statusEvents = new EventTarget();

export function useShopStatus(autoRefresh: boolean = true) {
  const [status, setStatus] = useState<ShopStatus>({
    isOpen: true,
    loading: true
  });

  const checkStatus = useCallback(async () => {
    try {
      // Force cache bypass with timestamp
      const timestamp = Date.now();
      const response = await fetch(`/api/shop/status?t=${timestamp}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setStatus({
          ...result.data,
          loading: false
        });
      } else {
        setStatus({
          isOpen: true,
          loading: false
        });
      }
    } catch (error) {
      console.error('Erreur vérification statut:', error);
      setStatus({
        isOpen: true,
        loading: false
      });
    }
  }, []);

  useEffect(() => {
    checkStatus();

    if (autoRefresh) {
      // Écouter les événements de revalidation
      const handleRevalidate = () => {
        checkStatus();
      };

      statusEvents.addEventListener('revalidate', handleRevalidate);

      // Auto-refresh toutes les 30 secondes
      const interval = setInterval(checkStatus, 30000);

      return () => {
        statusEvents.removeEventListener('revalidate', handleRevalidate);
        clearInterval(interval);
      };
    }
    
    // ✅ CORRECTION: Retourner une fonction vide si autoRefresh est false
    return () => {};
  }, [checkStatus, autoRefresh]);

  // Méthode pour forcer le refresh
  const refreshStatus = useCallback(() => {
    checkStatus();
  }, [checkStatus]);

  return { ...status, refreshStatus };
}

// Fonction utilitaire pour déclencher une revalidation globale
export function revalidateShopStatus() {
  statusEvents.dispatchEvent(new Event('revalidate'));
}