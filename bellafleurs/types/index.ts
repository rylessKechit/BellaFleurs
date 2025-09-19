import { Document } from 'mongoose';

// Types de base pour MongoDB
export interface BaseDocument extends Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Types pour l'utilisateur
export interface IUser extends BaseDocument {
  name: string;
  email: string;
  password?: string;
  role: 'client' | 'admin';
  address?: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
  phone?: string;
  emailVerified?: Date;
  image?: string;
  
  // Méthodes d'instance
  comparePassword(candidatePassword: string): Promise<boolean>;
  toPublicJSON(): Omit<IUser, 'password'>;
  
  // Virtuals
  fullAddress?: string;
  isAdmin?: boolean;
  isEmailVerified?: boolean;
}

// Interface pour une variante de produit
export interface IProductVariant {
  _id?: string;
  name: string;                    // "Petit", "Moyen", "Grand", "Taille unique"
  price: number;                   // Prix spécifique à cette variante
  description?: string;            // Description optionnelle de la variante
  image?: string;                  // Image optionnelle spécifique à cette variante
  isActive: boolean;               // Si cette variante est disponible
  order: number;                   // Ordre d'affichage (0 = premier)
}

// Types pour les produits - MIS À JOUR AVEC VARIANTS
export interface IProduct extends BaseDocument {
  name: string;
  description: string;
  price?: number;                  // Optionnel si hasVariants = true
  hasVariants: boolean;          // Nouveau : true = produit avec tailles multiples
  variants: IProductVariant[];     // Nouveau : array des variantes
  category: 'Bouquets' | 'Fleurs de saisons' | 'Compositions piquées' | 'Roses' | 'Orchidées' | 'Deuil' | 'Abonnement';
  subcategory?: string;            // Garder pour compatibilité
  images: string[];
  isActive: boolean;
  tags: string[];
  
  // Champs optionnels mis à jour
  entretien?: string;
  motsClesSEO?: string[];
  slug?: string;
  averageRating?: number;
  reviewsCount?: number;
  careInstructions?: string;
  difficulty?: 'facile' | 'modéré' | 'difficile';
  composition?: string;
  
  // Ancien champ SEO (garder pour compatibilité)
  seo?: {
    title: string;
    description: string;
    keywords: string[];
  };
  care?: {
    difficulty: 'facile' | 'modéré' | 'difficile';
    watering: string;
    light: string;
    temperature: string;
  };
  
  // Méthodes d'instance
  addTag(tag: string): Promise<IProduct>;
  removeTag(tag: string): Promise<IProduct>;
  addVariant?(variant: Omit<IProductVariant, '_id' | 'order'>): Promise<IProduct>;
  removeVariant?(variantId: string): Promise<IProduct>;
  updateVariant?(variantId: string, updates: Partial<IProductVariant>): Promise<IProduct>;
  getDefaultVariant?(): IProductVariant | null;
  
  // Virtuals
  mainImage?: string;
  categoryLabel?: string;
  priceFormatted?: string;
  displayPrice?: number;           // Prix à afficher (price ou prix du premier variant)
  displayPriceFormatted?: string;
  priceRangeFormatted?: string;    // "À partir de 25€" ou "25€ - 45€"
}

// Types pour les commandes - MIS À JOUR AVEC VARIANTS
export interface IOrderItem {
  product: string; // ObjectId en string
  name: string;
  price: number;
  quantity: number;
  image: string;
  // NOUVEAU : Support des variants dans le panier/commandes
  variantId?: string;              // ID de la variante choisie (index)
  variantName?: string;            // Nom de la variante pour affichage
}

export interface IOrder extends BaseDocument {
  orderNumber: string;
  user?: string; // ObjectId en string pour les clients connectés
  items: IOrderItem[];
  totalAmount: number;
  status: 'payée' | 'en_creation' | 'prête' | 'en_livraison' | 'livrée' | 'annulée';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  stripePaymentIntentId?: string;
  deliveryInfo: {
    type: 'pickup' | 'delivery';
    address?: {
      street: string;
      city: string;
      zipCode: string;
      country: string;
    };
    date: Date;
    notes?: string;
  };
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  adminNotes?: string;
  timeline: {
    status: IOrder['status'];
    date: Date;
    note?: string;
  }[];
  
  // Méthodes d'instance
  updateStatus(newStatus: IOrder['status'], note?: string): Promise<IOrder>;
  updatePaymentStatus(newStatus: IOrder['paymentStatus']): Promise<IOrder>;
  cancel(reason?: string): Promise<IOrder>;
  calculateTotal(): number;
  
  // Virtuals
  itemsCount?: number;
  totalAmountFormatted?: string;
  isDelivery?: boolean;
  isPickup?: boolean;
  isPaid?: boolean;
  isCompleted?: boolean;
  isCancelled?: boolean;
  canBeCancelled?: boolean;
  statusLabel?: string;
  paymentStatusLabel?: string;
}

// Types pour les catégories
export interface ICategory {
  id: string;
  name: string;
  description: string;
  image: string;
  subcategories: {
    id: string;
    name: string;
    description: string;
  }[];
}

// Types pour les filtres de recherche - MIS À JOUR AVEC VARIANTS
export interface ProductFilters {
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  search?: string;
  hasVariants?: boolean;           // NOUVEAU : Filtrer par type de produit
  sortBy?: 'name' | 'price' | 'date' | 'rating';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Types pour les réponses API - MIS À JOUR AVEC VARIANTS
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Types pour le panier - MIS À JOUR AVEC VARIANTS
export interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  isActive: boolean;
  // NOUVEAU : Support variants côté client
  variantId?: string;
  variantName?: string;
}

export interface CartData {
  items: CartItem[];
  total: number;
  itemsCount: number;
}

// Types pour le checkout - MIS À JOUR AVEC VARIANTS
export interface CheckoutItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  // NOUVEAU : Support variants dans le checkout
  variantId?: string;
  variantName?: string;
}

export interface DeliveryInfo {
  type: 'pickup' | 'delivery';
  address?: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
  date: string;
  notes?: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface CheckoutData {
  items: CheckoutItem[];
  customerInfo: CustomerInfo;
  deliveryInfo: DeliveryInfo;
  totalAmount: number;
}

// Types pour les reviews
export interface IReview extends BaseDocument {
  product: string;
  user?: string;
  customerName: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  isPublished: boolean;
  adminResponse?: string;
  
  // Virtuals
  ratingLabel?: string;
  isPositive?: boolean;
}

// Types pour les settings
export interface ISiteSettings extends BaseDocument {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  deliveryZones: string[];
  deliveryFee: number;
  minOrderForFreeDelivery: number;
  openingHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
}

// Types pour la pagination - AJOUTÉ
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}