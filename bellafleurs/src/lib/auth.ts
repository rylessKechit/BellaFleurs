import NextAuth from 'next-auth';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { MongoClient } from 'mongodb';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import type { Adapter } from 'next-auth/adapters';
import connectDB from '@/lib/mongodb';
import User, { type IUserDocument } from '@/models/User';
import { loginSchema } from '@/lib/validations';

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

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Adapter MongoDB pour stocker les sessions
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: 'bella-fleurs'
  }) as Adapter,
  
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
            console.log('❌ Validation failed:', validatedFields.error.flatten().fieldErrors);
            return null;
          }

          const { email, password } = validatedFields.data;

          // Connexion à la DB
          await connectDB();

          // Recherche de l'utilisateur avec le mot de passe
          const user = await User.findOne({ email }).select('+password');
          
          if (!user) {
            console.log('❌ User not found:', email);
            return null;
          }

          // Vérification du mot de passe
          const isPasswordValid = await (user as IUserDocument).comparePassword(password);
          
          if (!isPasswordValid) {
            console.log('❌ Invalid password for:', email);
            return null;
          }

          console.log('✅ User authenticated:', (user as IUserDocument).email);
          
          return {
            id: ((user as IUserDocument)._id as any).toString(),
            email: (user as IUserDocument).email,
            name: (user as IUserDocument).name,
            role: (user as IUserDocument).role,
            image: (user as IUserDocument).image,
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
          profile(profile) {
            return {
              id: profile.sub,
              name: profile.name,
              email: profile.email,
              image: profile.picture,
              role: 'client', // Par défaut, les utilisateurs Google sont des clients
            };
          },
        })]
      : []
    ),
  ],

  // Configuration des sessions
  session: {
    strategy: 'jwt', // Utilise JWT au lieu des sessions DB pour de meilleures performances
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },

  // Configuration des JWT
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },

  // Pages personnalisées
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

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
    async signIn({ user, account }) {
      // Authentification par identifiants - déjà validée dans authorize()
      if (account?.provider === 'credentials') {
        return true;
      }

      // Authentification Google
      if (account?.provider === 'google') {
        try {
          await connectDB();
          
          // Vérifier si l'utilisateur existe déjà
          const existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            // Créer un nouvel utilisateur
            await User.create({
              name: user.name,
              email: user.email,
              role: 'client',
              image: user.image,
              emailVerified: new Date(),
            });
            console.log('✅ New Google user created:', user.email);
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

  // Événements
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log(`🔐 User signed in: ${user.email} via ${account?.provider}`);
      if (isNewUser) {
        console.log('🆕 New user registration');
      }
    },
    
    async signOut() {
      console.log('🔓 User signed out');
    },

    async createUser({ user }) {
      console.log(`👤 New user created: ${user.email}`);
    },
  },

  // Configuration debug
  debug: process.env.NODE_ENV === 'development',
  
  // Secret pour signer les JWT
  secret: process.env.NEXTAUTH_SECRET,
});

// Types étendus pour TypeScript
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: 'client' | 'admin';
      image?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: 'client' | 'admin';
    image?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'client' | 'admin';
  }
}

// Fonction helper pour vérifier les rôles
export function hasRole(session: any, role: 'client' | 'admin'): boolean {
  return session?.user?.role === role;
}

export function isAdmin(session: any): boolean {
  return hasRole(session, 'admin');
}

export function isClient(session: any): boolean {
  return hasRole(session, 'client');
}