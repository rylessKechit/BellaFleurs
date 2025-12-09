// types/index.ts - MISE À JOUR pour ajouter le message cadeau

import { Document, Model } from 'mongoose';

// Type de base pour tous les documents MongoDB
export interface BaseDocument extends Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Interface User pour MongoDB
export interface IUser extends BaseDocument {
  name: string;
  email: string;
  password?: string;
  role: 'client' | 'admin';
  phone?: string;
  address?: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
  emailVerified?: Date;
  image?: string;
  
  // Méthodes d'instance
  comparePassword(candidatePassword: string): Promise<boolean>;
  toPublicJSON(): any;
  
  // Virtuals
  fullAddress?: string;
  isAdmin?: boolean;
  isEmailVerified?: boolean;
}

// Interface pour le modèle User
export interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  findAdmins(): Promise<IUser[]>;
  findClients(): Promise<IUser[]>;
}

// Types pour les variants de produits
export interface IProductVariant {
  _id: string;
  name: string;
  price: number;
  stock: number;
  order: number;
  description?: string;
  isActive: boolean;
}

// Interface Product pour MongoDB
export interface IProduct extends BaseDocument {
  name: string;
  description: string;
  images: string[];
  category: string;
  subcategory?: string;
  tags: string[];
  isActive: boolean;

  hasVariants: boolean;

  slug?: string;
  entretien?: string;
  composition?: string;
  averageRating?: number;
  reviewsCount?: number;
  
  // ✨ NOUVEAU : Gestion flexible des prix avec variants
  pricingType: 'fixed' | 'variants' | 'custom_range';
  price?: number;                  // Prix fixe (si pricingType = 'fixed')
  variants: IProductVariant[];    // Variants avec leurs prix (si pricingType = 'variants')
  customPricing?: {               // Prix personnalisé (si pricingType = 'custom_range')
    minPrice: number;
    maxPrice: number;
  };

  freeDelivery: boolean;
  
  // SEO et référencement
  metaTitle?: string;
  metaDescription?: string;
  motsClesSEO: string[];
  
  // Informations produit avancées
  featured: boolean;
  stock: number;
  dimensions?: {
    height: number;
    width: number;
    depth: number;
  };
  weight?: number;
  careInstructions?: {
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

// Types pour les commandes - MIS À JOUR AVEC VARIANTS ET MESSAGE CADEAU
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

// ✨ NOUVEAU : Interface pour les informations cadeau avec message
export interface IGiftInfo {
  recipientFirstName: string;
  recipientLastName: string;
  message?: string;                // ✨ NOUVEAU CHAMP MESSAGE
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
    timeSlot: string;
    notes?: string;
  };
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  
  // ✨ NOUVEAU : Support complet du système cadeau avec message
  isGift?: boolean;
  giftInfo?: IGiftInfo;
  
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

// Types pour le checkout - MIS À JOUR AVEC VARIANTS ET MESSAGE CADEAU
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
  timeSlot: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

// ✨ NOUVEAU : Interface GiftInfo pour le checkout avec message
export interface GiftInfo {
  isGift: boolean;
  recipientFirstName: string;
  recipientLastName: string;
  message: string;                 // ✨ NOUVEAU CHAMP MESSAGE
}

export interface CheckoutData {
  items: CheckoutItem[];
  customerInfo: CustomerInfo;
  deliveryInfo: DeliveryInfo;
  totalAmount: number;
  // ✨ NOUVEAU : Support du système cadeau avec message
  isGift?: boolean;
  giftInfo?: Omit<GiftInfo, 'isGift'>;
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
    youtube?: string;
  };
  businessHours: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  deliveryZones: string[];
  maintenanceMode: boolean;
  
  // Virtuals
  fullAddress?: string;
  isMaintenanceMode?: boolean;
}

// Interface pour les avis côté client (API responses)
export interface ReviewResponse {
  _id: string;
  product: string;
  user?: string;
  customerName: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  isPublished: boolean;
  adminResponse?: string;
  createdAt: string; // String pour les réponses API (format ISO)
  updatedAt: string;
  
  // Virtuals
  ratingLabel?: string;
  isPositive?: boolean;
}

// Interface pour les statistiques de notation
export interface RatingStats {
  averageRating: number;
  reviewsCount: number;
  ratingDistribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
}

// Interface pour les filtres de reviews
export interface ReviewFilters {
  productId: string;
  rating?: number;
  isVerified?: boolean;
  sortBy?: 'createdAt' | 'rating' | 'helpful';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Interface pour la création d'un avis
export interface CreateReviewData {
  productId: string;
  rating: number;
  comment: string;
  customerName: string;
}

// Interface pour la réponse API des avis
export interface ReviewsApiResponse {
  success: boolean;
  data: {
    reviews: ReviewResponse[];
    ratingDistribution: {
      rating: number;
      count: number;
      percentage: number;
    }[];
    totalReviews: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Props pour les composants
export interface ReviewsListProps {
  productId: string;
}

export interface ReviewFormProps {
  productId: string;
  productName: string;
  onClose: () => void;
  onReviewAdded: () => void;
}

// Interface pour la distribution des notes
export interface RatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}