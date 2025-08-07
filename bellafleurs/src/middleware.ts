// src/middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const session = req.nextauth.token;

    // Protection des routes admin
    if (pathname.startsWith('/admin')) {
      if (!session || session.role !== 'admin') {
        // Redirection vers la page de connexion avec un message d'erreur
        const signInUrl = new URL('/auth/signin', req.url);
        signInUrl.searchParams.set('error', 'AccessDenied');
        signInUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signInUrl);
      }
    }

    // Protection des routes API admin
    if (pathname.startsWith('/api/admin')) {
      if (!session || session.role !== 'admin') {
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: {
              message: 'Accès refusé. Droits administrateur requis.',
              code: 'ACCESS_DENIED'
            }
          }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Protection des routes utilisateur (commandes, profil, etc.)
    if (pathname.startsWith('/mon-compte') || pathname.startsWith('/mes-commandes')) {
      if (!session) {
        const signInUrl = new URL('/auth/signin', req.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signInUrl);
      }
    }

    // Protection des API utilisateur
    if (pathname.startsWith('/api/user') || pathname.startsWith('/api/orders')) {
      if (!session) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: {
              message: 'Authentification requise',
              code: 'AUTH_REQUIRED'
            }
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Redirection automatique des utilisateurs connectés depuis les pages d'auth
    if (session && (pathname.startsWith('/auth/signin') || pathname.startsWith('/auth/signup'))) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Autoriser l'accès aux pages publiques
        if (
          pathname.startsWith('/') ||
          pathname.startsWith('/produits') ||
          pathname.startsWith('/api/auth') ||
          pathname.startsWith('/api/products') ||
          pathname.startsWith('/api/public') ||
          pathname.startsWith('/_next') ||
          pathname.includes('/images/') ||
          pathname === '/favicon.ico'
        ) {
          return true;
        }

        // Pour les autres routes, nécessite une authentification
        return !!token;
      },
    },
  }
);

// Configuration des routes à protéger
export const config = {
  matcher: [
    // Routes admin
    '/admin/:path*',
    '/api/admin/:path*',
    
    // Routes utilisateur protégées
    '/mon-compte/:path*',
    '/mes-commandes/:path*',
    '/checkout/success/:path*',
    
    // API utilisateur protégées
    '/api/user/:path*',
    '/api/orders/:path*',
    
    // Pages d'authentification (pour la redirection)
    '/auth/signin',
    '/auth/signup',
  ],
};