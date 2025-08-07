import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default auth((req: NextRequest & { auth: any }) => {
  const { pathname } = req.nextUrl;
  const token = req.auth;

  // Protection des routes admin
  if (pathname.startsWith('/admin')) {
    if (!token || token.user?.role !== 'admin') {
      // Redirection vers la page de connexion avec un message d'erreur
      const signInUrl = new URL('/auth/signin', req.url);
      signInUrl.searchParams.set('error', 'AccessDenied');
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Protection des routes API admin
  if (pathname.startsWith('/api/admin')) {
    if (!token || token.user?.role !== 'admin') {
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
    if (!token) {
      const signInUrl = new URL('/auth/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Protection des API utilisateur
  if (pathname.startsWith('/api/user') || pathname.startsWith('/api/orders')) {
    if (!token) {
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

  return NextResponse.next();
});

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
    
    // Exclure les routes publiques
    '/((?!api/auth|api/products|api/public|auth|_next/static|_next/image|favicon.ico|images|$).*)',
  ],
};