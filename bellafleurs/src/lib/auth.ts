// src/lib/auth.ts - Version étendue pour les comptes corporate
import { NextAuthOptions } from 'next-auth';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import { MongoClient } from 'mongodb';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { loginSchema } from '@/lib/validations';
import mongoose from 'mongoose';

// Interface pour l'utilisateur d'authentification
interface AuthUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  role: 'client' | 'admin';
  // ✨ NOUVEAU : Champs corporate
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
  password?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Client MongoDB pour l'adapter
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  // En développement, utilise une variable globale pour éviter les reconnexions
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(process.env.MONGODB_URI);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  // En production, crée une nouvelle connexion
  client = new MongoClient(process.env.MONGODB_URI);
  clientPromise = client.connect();
}

export const authOptions: NextAuthOptions = {
  // Adapter MongoDB pour stocker les sessions (optionnel avec JWT)
  // adapter: MongoDBAdapter(clientPromise, {
  //   databaseName: 'bella-fleurs'
  // }),
  
  // Configuration des sessions
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },

  // Configuration JWT
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },

  // Pages personnalisées
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  // Providers d'authentification
  providers: [
    // Authentification par email/password
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { 
          label: 'Email', 
          type: 'email',
          placeholder: 'votre@email.com'
        },
        password: { 
          label: 'Mot de passe', 
          type: 'password'
        }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Validation des données
          const validatedFields = loginSchema.safeParse({
            email: credentials.email,
            password: credentials.password
          });

          if (!validatedFields.success) {
            return null;
          }

          const { email, password } = validatedFields.data;

          // Connexion à la DB
          await connectDB();

          // ✅ DEBUG : Log de la tentative de connexion
          console.log('🔍 Tentative de connexion:', email);

          // ✅ MODIFICATION : Recherche incluant les comptes corporate
          const user = await User.findOne({ email }).select('+password') as AuthUser | null;
          
          // ✅ DEBUG : Utilisateur trouvé ou non
          if (!user) {
            console.log('❌ Utilisateur non trouvé pour:', email);
            return null;
          }
          
          console.log('✅ Utilisateur trouvé:', {
            email: user.email,
            accountType: user.accountType,
            pendingActivation: user.corporateSettings?.pendingActivation
          });

          // ✅ VÉRIFICATION : Compte corporate activé
          if (user.accountType === 'corporate' && user.corporateSettings?.pendingActivation) {
            console.log('❌ Compte corporate non activé:', user.email);
            return null;
          }

          // Vérification du mot de passe
          const isPasswordValid = await user.comparePassword(password);
          
          // ✅ DEBUG : Résultat vérification mot de passe
          console.log('🔐 Vérification mot de passe:', isPasswordValid);
          
          if (!isPasswordValid) {
            console.log('❌ Mot de passe incorrect pour:', email);
            return null;
          }
          
          // Conversion sécurisée de l'ID
          const userId = user._id instanceof mongoose.Types.ObjectId 
            ? user._id.toString() 
            : user._id;

          console.log('✅ Connexion réussie:', {
            email: user.email,
            role: user.role,
            accountType: user.accountType || 'individual',
            company: user.company?.name
          });

          // ✅ EXTENSION : Retour des données corporate
          return {
            id: userId,
            name: user.name,
            email: user.email,
            role: user.role,
            accountType: user.accountType || 'individual',
            company: user.company,
            corporateSettings: user.corporateSettings
          };
          
        } catch (error) {
          console.error('❌ Erreur lors de l\'authentification:', error);
          return null;
        }
      }
    }),

    // Google OAuth (si configuré)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })]
      : []
    ),
  ],

  // Callbacks pour personnaliser l'authentification
  callbacks: {
    // Callback JWT - appelé chaque fois qu'un JWT est créé/accédé
    async jwt({ token, user, trigger, session }) {
      // Première connexion - ajouter les infos utilisateur au token
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        
        // ✨ NOUVEAU : Données corporate dans le JWT
        token.accountType = (user as any).accountType || 'individual';
        token.company = (user as any).company;
        token.corporateSettings = (user as any).corporateSettings;
      }

      // Mise à jour du profil
      if (trigger === 'update' && session) {
        token.name = session.name;
        token.email = session.email;
      }

      return token;
    },

    // Callback Session - structure les données envoyées au client
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as 'client' | 'admin';
        
        // ✨ NOUVEAU : Données corporate dans la session
        (session.user as any).accountType = token.accountType as 'individual' | 'corporate';
        (session.user as any).company = token.company;
        (session.user as any).corporateSettings = token.corporateSettings;
      }

      return session;
    },

    // Callback SignIn - contrôle qui peut se connecter
    async signIn({ user, account, profile }) {
      // Authentification par identifiants - déjà validée dans authorize()
      if (account?.provider === 'credentials') {
        return true;
      }

      // Authentification Google
      if (account?.provider === 'google' && profile) {
        try {
          await connectDB();
          
          // Vérifier si l'utilisateur existe déjà
          const existingUser = await User.findOne({ email: profile.email });
          
          if (!existingUser) {
            // ✅ CRÉER : Seulement des comptes individuels via Google
            await User.create({
              name: profile.name,
              email: profile.email,
              role: 'client',
              accountType: 'individual', // Par défaut individual pour Google
              image: (profile as any).picture,
              emailVerified: new Date(),
            });
          }
          
          return true;
        } catch (error) {
          console.error('❌ Google sign-in error:', error);
          return false;
        }
      }

      return true;
    },
  },

  // Configuration debug
  debug: process.env.NODE_ENV === 'development',
  
  // Secret pour signer les JWT
  secret: process.env.NEXTAUTH_SECRET,
};

// Fonction helper pour obtenir la session côté serveur
export { getServerSession } from 'next-auth';

// ✅ EXTENSION : Fonctions helper pour les comptes corporate
export function hasRole(session: any, role: 'client' | 'admin'): boolean {
  return session?.user?.role === role;
}

export function isAdmin(session: any): boolean {
  return hasRole(session, 'admin');
}

export function isClient(session: any): boolean {
  return hasRole(session, 'client');
}

// ✨ NOUVELLES : Fonctions helper corporate
export function isCorporateAccount(session: any): boolean {
  return session?.user?.accountType === 'corporate';
}

export function isIndividualAccount(session: any): boolean {
  return session?.user?.accountType === 'individual' || !session?.user?.accountType;
}

export function getCorporateInfo(session: any) {
  if (!isCorporateAccount(session)) return null;
  
  return {
    company: session.user.company,
    settings: session.user.corporateSettings
  };
}

export function canPlaceOrder(session: any): boolean {
  if (!session?.user) return false;
  
  // Admin peut toujours commander (pour tester)
  if (session.user.role === 'admin') return true;
  
  // Client individual peut toujours commander
  if (isIndividualAccount(session)) return true;
  
  // Client corporate : vérifier l'activation et l'approbation si nécessaire
  if (isCorporateAccount(session)) {
    const settings = session.user.corporateSettings;
    
    // Compte non activé
    if (settings?.pendingActivation) return false;
    
    // Pour l'instant, on autorise toutes les commandes corporate activées
    // Plus tard on ajoutera la logique d'approbation et de limite
    return true;
  }
  
  return false;
}