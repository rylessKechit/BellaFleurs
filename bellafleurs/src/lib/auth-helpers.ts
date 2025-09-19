// src/lib/auth-helpers.ts - Fichier manquant à créer
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function checkAdminAccess(): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions);
    return session?.user?.role === 'admin';
  } catch (error) {
    console.error('Erreur vérification admin:', error);
    return false;
  }
}

export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions);
    return session?.user || null;
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    return null;
  }
}