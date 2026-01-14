// src/components/corporate/CorporateRedirect.tsx - Redirection automatique
'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function CorporateRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'loading') return;
    
    // Si l'utilisateur est connecté et que c'est un compte corporate
    if (session?.user?.accountType === 'corporate') {
      
      // Pages à éviter pour les comptes corporate (les rediriger vers le dashboard)
      const publicPages = ['/', '/produits', '/panier'];
      const adminPages = ['/admin'];
      const corporatePages = ['/corporate'];
      
      // Si sur une page publique et pas déjà sur une page corporate
      if (publicPages.some(page => pathname === page) && 
          !corporatePages.some(page => pathname.startsWith(page))) {
        
        // Si c'est la page d'accueil, rediriger vers le dashboard corporate
        if (pathname === '/') {
          router.push('/corporate/dashboard');
          return;
        }
      }
      
      // Empêcher l'accès aux pages admin pour les comptes corporate (sauf si admin)
      if (adminPages.some(page => pathname.startsWith(page)) && 
          session.user.role !== 'admin') {
        router.push('/corporate/dashboard');
        return;
      }
    }
    
    // Si l'utilisateur est un compte individuel sur des pages corporate
    if (session?.user?.accountType === 'individual' || 
        (session?.user && !session.user.accountType)) {
      
      if (pathname.startsWith('/corporate/')) {
        router.push('/'); // Rediriger vers l'accueil
        return;
      }
    }
    
  }, [session, status, router, pathname]);

  return null; // Ce composant ne rend rien visuellement
}