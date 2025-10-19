import { useState, useEffect } from 'react';

interface ShopStatus {
  isOpen: boolean;
  isClosed?: boolean;
  reason?: string;
  message?: string;
  startDate?: string;
  endDate?: string;
  loading: boolean;
}

export function useShopStatus() {
  const [status, setStatus] = useState<ShopStatus>({
    isOpen: true,
    loading: true
  });

  useEffect(() => {
    async function checkStatus() {
      try {
        const response = await fetch('/api/shop/status');
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
    }

    checkStatus();
  }, []);

  return status;
}