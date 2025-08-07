'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import type { Session } from 'next-auth';

interface SessionProviderProps {
  children: ReactNode;
  session?: Session | null;
}

export default function SessionProvider({
  children,
  session
}: SessionProviderProps) {
  return (
    <NextAuthSessionProvider 
      session={session} 
      refetchInterval={5 * 60} // Rafraîchir toutes les 5 minutes
      refetchOnWindowFocus={true}
    >
      {children}
    </NextAuthSessionProvider>
  );
}