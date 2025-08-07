// pages/api/auth/[...nextauth].ts
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { MongoClient } from 'mongodb';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { loginSchema } from '@/lib/validations';

// Interface pour le user avec les méthodes
interface AuthUser {
  _id: string;
  email: string;
  name: string;
  role: 'client' | 'admin';
  image?: string;
  password?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Client MongoDB pour l'adapter (optionnel)
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.MONGODB_URI) {
  client = new MongoClient(process.env.MONGODB_URI);
  clientPromise = client.connect();
}

export const authOptions: NextAuthOptions = {
  // Adapter MongoDB (optionnel - peut être retiré si problématique)
  // adapter: MongoDBAdapter(clientPromise),
  
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
            console.log('❌ Validation failed:', validatedFields.error.flatten().fieldErrors);
            return null;
          }

          const { email, password } = validatedFields.data;

          // Connexion à la DB
          await connectDB();

          // Recherche de l'utilisateur avec le mot de passe
          const user = await User.findOne({ email }).select('+password') as AuthUser | null;
          
          if (!user) {
            console.log('❌ User not found:', email);
            return null;
          }

          // Vérification du mot de passe
          const isPasswordValid = await user.comparePassword(password);
          
          if (!isPasswordValid) {
            console.log('❌ Invalid password for:', email);
            return null;
          }

          console.log('✅ User authenticated:', user.email);
          
          return {
            id: String(user._id),
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

  // Callbacks
  callbacks: {
    // Callback JWT
    async jwt({ token, user }) {
      // Première connexion
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },

    // Callback Session
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },

    // Callback SignIn
    async signIn({ user, account, profile }) {
      // Authentification par identifiants
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
            console.log('✅ New Google user created:', profile.email);
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
    async signIn(message) {
      console.log(`🔐 User signed in: ${message.user.email}`);
    },
    
    async signOut(message) {
      console.log('🔓 User signed out');
    },
  },

  // Configuration debug
  debug: process.env.NODE_ENV === 'development',
  
  // Secret
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);