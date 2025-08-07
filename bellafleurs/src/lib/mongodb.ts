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
 * Connecte à MongoDB avec configuration simplifiée
 * @returns Instance Mongoose connectée
 */
async function connectDB(): Promise<typeof mongoose> {
  // Si on a déjà une connexion, on la retourne
  if (cached.conn) {
    return cached.conn;
  }

  // Si on n'a pas de promesse de connexion, on en crée une
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts);
  }

  try {
    cached.conn = await cached.promise;
    console.log('✅ MongoDB connected successfully');
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB connection failed:', e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;