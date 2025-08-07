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
}

// Types pour les produits
export interface IProduct extends BaseDocument {
  name: string;
  description: string;
  price: number;
  category: 'bouquets' | 'compositions' | 'plantes' | 'evenements';
  subcategory: string;
  images: string[];
  stock: number;
  isActive: boolean;
  tags: string[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  dimensions?: {
    height: number;
    width: number;
    depth: number;
  };
  care?: {
    difficulty: 'facile' | 'modéré' | 'difficile';
    watering: string;
    light: string;
    temperature: string;
  };
}

// Types pour les commandes
export interface IOrderItem {
  product: string; // ObjectId en string
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface IOrder extends BaseDocument {
  orderNumber: string;
  user?: string; // ObjectId en string pour les clients connectés
  items: IOrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
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
  adminNotes?: string;
  timeline: {
    status: IOrder['status'];
    date: Date;
    note?: string;
  }[];
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

// Types pour les filtres de recherche
export interface ProductFilters {
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  tags?: string[];
  search?: string;
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