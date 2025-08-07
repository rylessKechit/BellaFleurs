import mongoose from 'mongoose';

// Interface pour le cache de connexion
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Déclaration globale pour TypeScript
declare global {
  var mongoose: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

// Utilisation du cache global pour éviter les reconnexions multiples
let cached: MongooseCache = global.mongoose || {
  conn: null,
  promise: null,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Connecte à MongoDB avec mise en cache de la connexion
 * @returns Instance Mongoose connectée
 */
async function connectDB(): Promise<typeof mongoose> {
  // Si on a déjà une connexion, on la retourne
  if (cached.conn) {
    console.log('🟢 Using cached MongoDB connection');
    return cached.conn;
  }

  // Si on n'a pas de promesse de connexion, on en crée une
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Désactive la mise en buffer des commandes
      maxPoolSize: 10, // Nombre max de connexions dans le pool
      serverSelectionTimeoutMS: 5000, // Timeout pour sélectionner un serveur
      socketTimeoutMS: 45000, // Timeout pour les opérations socket
      family: 4, // Utilise IPv4
      retryWrites: true,
      retryReads: true,
    };

    console.log('🔄 Creating new MongoDB connection...');
    
    cached.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB connected successfully');
        return mongoose;
      })
      .catch((error) => {
        console.error('❌ MongoDB connection error:', error);
        // Reset la promesse en cas d'erreur
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

/**
 * Ferme la connexion MongoDB (utile pour les tests)
 */
export async function disconnectDB(): Promise<void> {
  if (cached.conn) {
    await cached.conn.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log('🔴 MongoDB disconnected');
  }
}

/**
 * Vérifie si la base de données est connectée
 */
export function isConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * Obtient le statut de connexion en format lisible
 */
export function getConnectionStatus(): string {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  
  return states[mongoose.connection.readyState as keyof typeof states] || 'unknown';
}

/**
 * Événements de connexion MongoDB pour le monitoring
 */
if (typeof window === 'undefined') {
  mongoose.connection.on('connected', () => {
    console.log('🟢 Mongoose connected to MongoDB');
  });

  mongoose.connection.on('error', (err) => {
    console.error('🔴 Mongoose connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('🟠 Mongoose disconnected from MongoDB');
  });

  // Fermeture propre lors de l'arrêt de l'application
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('🔴 MongoDB connection closed through app termination');
    process.exit(0);
  });
}

export default connectDB;