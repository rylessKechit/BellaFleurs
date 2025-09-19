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
  updateStock?(quantity: number): Promise<IProduct>;
  reduceStock?(quantity: number): Promise<IProduct>;
  addTag(tag: string): Promise<IProduct>;
  removeTag(tag: string): Promise<IProduct>;
  addVariant?(variant: Omit<IProductVariant, '_id' | 'order'>): Promise<IProduct>;
  removeVariant?(variantId: string): Promise<IProduct>;
  updateVariant?(variantId: string, updates: Partial<IProductVariant>): Promise<IProduct>;
  getDefaultVariant?(): IProductVariant | null;
  
  // Virtuals
  isInStock?: boolean;
  isLowStock?: boolean;
  isOutOfStock?: boolean;
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
  // Nouveau : Support des variants dans le panier/commandes
  variantId?: string;              // ID de la variante choisie
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
  inStock?: boolean;
  tags?: string[];
  search?: string;
  hasVariants?: boolean;           // Nouveau filtre pour variants
}

// Types pour la pagination
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

// Types pour les statistiques admin
export interface DashboardStats {
  orders: {
    total: number;
    pending: number;
    completed: number;
    revenue: number;
  };
  products: {
    total: number;
    inStock: number;
    outOfStock: number;
    lowStock: number;
  };
  customers: {
    total: number;
    newThisMonth: number;
  };
  recentOrders: IOrder[];
  topProducts: {
    product: IProduct;
    sales: number;
  }[];
}

// Types pour les erreurs API
export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  errors?: ApiError[];
}

// Types pour l'authentification
export interface AuthSession {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'client' | 'admin';
    image?: string;
  };
  expires: string;
}

// Types pour NextAuth étendu
export interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'admin';
  image?: string;
}

export interface ExtendedSession {
  user: ExtendedUser;
  expires: string;
}

// Types pour les webhooks Stripe
export interface StripeWebhookData {
  id: string;
  object: string;
  amount_received: number;
  currency: string;
  customer: string;
  metadata: {
    orderId: string;
  };
  status: string;
}

// Types pour les uploads
export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export interface UploadResponse {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

// Types pour les formulaires
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
}

// Types pour les hooks
export interface UseAuthReturn {
  user: ExtendedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isClient: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: RegisterFormData) => Promise<boolean>;
  requireAuth: (callback?: () => void) => void;
  requireAdmin: (callback?: () => void) => void;
}

// Types pour les composants
export interface ComponentWithChildren {
  children: React.ReactNode;
}

export interface ComponentWithClassName {
  className?: string;
}

// Types pour les formulaires de produits - MIS À JOUR AVEC VARIANTS
export interface ProductFormVariant {
  name: string;
  price: number;
  description?: string;
  image?: string;
  isActive: boolean;
  order: number;
}

export interface ProductFormData {
  name: string;
  description: string;
  price?: number;                  // Optionnel si hasVariants = true
  hasVariants: boolean;            // Nouveau champ
  variants: ProductFormVariant[];  // Nouveau champ
  category: IProduct['category'];
  subcategory?: string;            // Garder pour compatibilité
  images: string[];
  isActive: boolean;
  tags: string[];
  entretien?: string;
  motsClesSEO?: string[];
  careInstructions?: string;
  difficulty?: 'facile' | 'modéré' | 'difficile';
  composition?: string;
  // Garder pour compatibilité
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
}

// Types pour les formulaires de commandes
export interface OrderFormData {
  items: IOrderItem[];
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
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
}

// Utility types
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Status types
export type OrderStatus = IOrder['status'];
export type PaymentStatus = IOrder['paymentStatus'];
export type UserRole = IUser['role'];
export type ProductCategory = IProduct['category'];
export type DeliveryType = IOrder['deliveryInfo']['type'];

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState {
  isSubmitting: boolean;
  errors: ValidationError[];
  success: boolean;
  message?: string;
}