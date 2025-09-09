// src/hooks/useAdminRedirect.ts
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export function useAdminRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Attendre que la session soit chargée

    if (session?.user?.role === 'admin') {
      // Si l'utilisateur est admin et qu'il n'est pas déjà sur une page admin
      if (!window.location.pathname.startsWith('/admin')) {
        router.push('/admin/dashboard');
      }
    }
  }, [session, status, router]);
}