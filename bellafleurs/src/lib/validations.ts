import { z } from 'zod';

// Validation pour l'utilisateur
export const userSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .trim(),
  email: z.string()
    .email('Veuillez entrer une adresse email valide')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .max(100, 'Le mot de passe ne peut pas dépasser 100 caractères')
    .optional(),
  role: z.enum(['client', 'admin']).default('client'),
  phone: z.string()
    .regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, 'Numéro de téléphone français invalide')
    .optional(),
  address: z.object({
    street: z.string().min(1, 'Adresse requise').max(200),
    city: z.string().min(1, 'Ville requise').max(100),
    zipCode: z.string().regex(/^\d{5}$/, 'Code postal français invalide (5 chiffres)'),
    country: z.string().default('France')
  }).optional()
});

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis')
});

export const registerSchema = userSchema.omit({ role: true }).extend({
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

// Validation pour les produits
export const productSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(200, 'Le nom ne peut pas dépasser 200 caractères')
    .trim(),
  description: z.string()
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(2000, 'La description ne peut pas dépasser 2000 caractères')
    .trim(),
  price: z.number()
    .min(0.01, 'Le prix doit être supérieur à 0')
    .max(10000, 'Le prix ne peut pas dépasser 10 000€'),
  category: z.enum(['bouquets', 'compositions', 'plantes', 'evenements']),
  subcategory: z.string()
    .min(1, 'Sous-catégorie requise')
    .max(100, 'Sous-catégorie trop longue'),
  images: z.array(z.string().url('URL d\'image invalide'))
    .min(1, 'Au moins une image est requise')
    .max(10, 'Maximum 10 images'),
  stock: z.number()
    .min(0, 'Le stock ne peut pas être négatif')
    .max(9999, 'Stock maximum: 9999'),
  isActive: z.boolean().default(true),
  tags: z.array(z.string().max(30, 'Tag trop long')).default([]),
  seo: z.object({
    title: z.string().max(60, 'Titre SEO maximum 60 caractères'),
    description: z.string().max(160, 'Description SEO maximum 160 caractères'),
    keywords: z.array(z.string().max(50)).default([])
  }),
  dimensions: z.object({
    height: z.number().min(0).max(500),
    width: z.number().min(0).max(500),
    depth: z.number().min(0).max(500)
  }).optional(),
  care: z.object({
    difficulty: z.enum(['facile', 'modéré', 'difficile']).default('facile'),
    watering: z.string().max(200, 'Instructions d\'arrosage trop longues'),
    light: z.string().max(200, 'Instructions de luminosité trop longues'),
    temperature: z.string().max(200, 'Instructions de température trop longues')
  }).optional()
});

// Validation pour les commandes
export const orderItemSchema = z.object({
  product: z.string().min(1, 'ID produit requis'),
  name: z.string().min(1, 'Nom du produit requis'),
  price: z.number().min(0, 'Prix invalide'),
  quantity: z.number().min(1, 'Quantité minimum: 1').max(100, 'Quantité maximum: 100'),
  image: z.string().url('URL d\'image invalide')
});

export const customerInfoSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Nom trop long'),
  email: z.string().email('Email invalide'),
  phone: z.string()
    .regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, 'Numéro de téléphone français invalide')
});

export const deliveryInfoSchema = z.object({
  type: z.enum(['pickup', 'delivery']),
  address: z.object({
    street: z.string().min(1, 'Adresse requise').max(200),
    city: z.string().min(1, 'Ville requise').max(100),
    zipCode: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
    country: z.string().default('France')
  }).optional(),
  date: z.date().min(new Date(), 'La date doit être dans le futur'),
  timeSlot: z.enum(['9h-12h', '12h-14h', '14h-17h', '17h-19h']),
  notes: z.string().max(500, 'Notes trop longues').optional()
}).refine((data) => {
  if (data.type === 'delivery') {
    return !!data.address;
  }
  return true;
}, {
  message: "Adresse requise pour la livraison",
  path: ["address"]
});

export const orderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Au moins un article requis'),
  customerInfo: customerInfoSchema,
  deliveryInfo: deliveryInfoSchema
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']),
  note: z.string().max(200, 'Note trop longue').optional()
});

// Validation pour les filtres de recherche
export const productFiltersSchema = z.object({
  category: z.string().optional(),
  subcategory: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  inStock: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional()
});

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(12),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Validation pour l'upload d'images
export const uploadSchema = z.object({
  file: z.instanceof(File),
  folder: z.string().default('products'),
  maxSize: z.number().default(5 * 1024 * 1024), // 5MB par défaut
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/webp'])
}).refine((data) => {
  return data.file.size <= data.maxSize;
}, {
  message: "Fichier trop volumineux",
  path: ["file"]
}).refine((data) => {
  return data.allowedTypes.includes(data.file.type);
}, {
  message: "Type de fichier non autorisé",
  path: ["file"]
});

// Validation pour les paramètres de requête
export const queryParamsSchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1),
  limit: z.string().transform(val => Math.min(parseInt(val) || 12, 100)),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional()
});

// Validation pour les webhooks Stripe
export const stripeWebhookSchema = z.object({
  id: z.string(),
  object: z.string(),
  type: z.string(),
  data: z.object({
    object: z.object({
      id: z.string(),
      amount_received: z.number(),
      currency: z.string(),
      metadata: z.object({
        orderId: z.string()
      }),
      status: z.string()
    })
  })
});

// Types inférés pour TypeScript
export type UserInput = z.infer<typeof userSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type ProductFiltersInput = z.infer<typeof productFiltersSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type UploadInput = z.infer<typeof uploadSchema>;
export type QueryParamsInput = z.infer<typeof queryParamsSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

// Fonctions d'aide pour la validation
export function validateEmail(email: string): boolean {
  return z.string().email().safeParse(email).success;
}

export function validatePhone(phone: string): boolean {
  return z.string().regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/).safeParse(phone).success;
}

export function validateOrderNumber(orderNumber: string): boolean {
  return z.string().regex(/^BF-\d{8}-\d{4}$/).safeParse(orderNumber).success;
}

export function sanitizeString(str: string): string {
  return str.trim().replace(/[<>]/g, '');
}

export function validateAndSanitize<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
} {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}