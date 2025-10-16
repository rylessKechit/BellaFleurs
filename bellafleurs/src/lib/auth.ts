// src/lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import { MongoClient } from 'mongodb';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { loginSchema } from '@/lib/validations';
import mongoose from 'mongoose';

// Interface pour le user avec les méthodes
interface AuthUser {
  _id: mongoose.Types.ObjectId | string;
  email: string;
  name: string;
  role: 'client' | 'admin';
  image?: string;
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

          // Recherche de l'utilisateur avec le mot de passe
          const user = await User.findOne({ email }).select('+password') as AuthUser | null;
          
          if (!user) {
            return null;
          }

          // Vérification du mot de passe
          const isPasswordValid = await user.comparePassword(password);
          
          if (!isPasswordValid) {
            return null;
          }
          
          // Conversion sécurisée de l'ID
          const userId = user._id instanceof mongoose.Types.ObjectId 
            ? user._id.toString() 
            : String(user._id);
          
          return {
            id: userId,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
          };
        } catch (error) {
          console.error('❌ Auth error:', error);
          return null;
        }
      }
    }),

    // Authentification Google (optionnel)
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
            // Créer un nouvel utilisateur
            await User.create({
              name: profile.name,
              email: profile.email,
              role: 'client',
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

// Fonctions helper pour vérifier les rôles
export function hasRole(session: any, role: 'client' | 'admin'): boolean {
  return session?.user?.role === role;
}

export function isAdmin(session: any): boolean {
  return hasRole(session, 'admin');
}

export function isClient(session: any): boolean {
  return hasRole(session, 'client');
}