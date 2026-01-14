// types/next-auth.d.ts - Types étendus pour les comptes corporate
import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      name: string;
      role: 'client' | 'admin';
      image?: string;
      
      // ✨ NOUVEAU : Données corporate
      accountType?: 'individual' | 'corporate';
      company?: {
        name: string;
        siret?: string;
        vatNumber?: string;
        industry?: string;
        contactPerson: string;
      };
      corporateSettings?: {
        monthlyLimit?: number;
        paymentTerm: 'immediate' | 'monthly';
        approvalRequired: boolean;
        pendingActivation?: boolean;
      };
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    email: string;
    name: string;
    role: 'client' | 'admin';
    image?: string;
    
    // ✨ NOUVEAU : Données corporate
    accountType?: 'individual' | 'corporate';
    company?: {
      name: string;
      siret?: string;
      vatNumber?: string;
      industry?: string;
      contactPerson: string;
    };
    corporateSettings?: {
      monthlyLimit?: number;
      paymentTerm: 'immediate' | 'monthly';
      approvalRequired: boolean;
      pendingActivation?: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    role: 'client' | 'admin';
    
    // ✨ NOUVEAU : Données corporate dans le JWT
    accountType?: 'individual' | 'corporate';
    company?: {
      name: string;
      siret?: string;
      vatNumber?: string;
      industry?: string;
      contactPerson: string;
    };
    corporateSettings?: {
      monthlyLimit?: number;
      paymentTerm: 'immediate' | 'monthly';
      approvalRequired: boolean;
      pendingActivation?: boolean;
    };
  }
}