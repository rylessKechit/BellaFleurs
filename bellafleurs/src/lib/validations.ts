import { z } from 'zod';

// Validation des utilisateurs
export const userSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Format email invalide'),
  role: z.enum(['client', 'admin']).default('client')
});

export const loginSchema = z.object({
  email: z.string().email('Format email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères')
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Format email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

// Validation des variantes produit - MISE À JOUR
export const productVariantSchema = z.object({
  name: z.string().min(1, 'Nom de la variante requis').max(50, 'Nom trop long'),
  price: z.number().min(0.01, 'Prix minimum: 0,01€').max(9999.99, 'Prix maximum: 9999,99€'),
  description: z.string().optional(),
  image: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  order: z.number().int().min(0).default(0)
});

// Validation des produits - MISE À JOUR AVEC VARIANTS
export const productSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100, 'Nom trop long'),
  description: z.string().min(10, 'Description trop courte').max(1000, 'Description trop longue'),
  price: z.number().min(0.01, 'Prix minimum: 0,01€').max(9999.99, 'Prix maximum: 9999,99€').optional(),
  hasVariants: z.boolean().default(false),
  variants: z.array(productVariantSchema).default([]),
  category: z.enum([
    'Bouquets',
    'Fête nouvel an', 
    'Compositions piquées',
    'Roses',
    'Orchidées',
    'Deuil',
    'Incontournable',
  ]),
  images: z.array(z.string().url()).min(1, 'Au moins une image requise'),
  isActive: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  entretien: z.string().optional(),
  careInstructions: z.string().optional(),
  composition: z.string().optional(),
  motsClesSEO: z.array(z.string()).default([])
}).refine((data) => {
  // Si hasVariants = true, variants requis et pas de prix simple
  if (data.hasVariants) {
    return data.variants.length > 0;
  }
  // Si hasVariants = false, prix simple requis
  return data.price !== undefined && data.price > 0;
}, {
  message: "Produit avec variants: variants requis. Produit simple: prix requis.",
  path: ["variants"]
});

// Schémas pour la création et mise à jour
export const createProductSchema = productSchema;
export const updateProductSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100, 'Nom trop long').optional(),
  description: z.string().min(10, 'Description trop courte').max(1000, 'Description trop longue').optional(),
  price: z.number().min(0.01, 'Prix minimum: 0,01€').max(9999.99, 'Prix maximum: 9999,99€').optional(),
  hasVariants: z.boolean().default(false).optional(),
  variants: z.array(productVariantSchema).default([]).optional(),
  category: z.enum([
    'Bouquets',
    'Fête nouvel an', 
    'Compositions piquées',
    'Roses',
    'Orchidées',
    'Deuil',
    'Incontournable',
  ]).optional(),
  images: z.array(z.string().url()).min(1, 'Au moins une image requise').optional(),
  isActive: z.boolean().default(true).optional(),
  tags: z.array(z.string()).default([]).optional(),
  entretien: z.string().optional(),
  careInstructions: z.string().optional(),
  composition: z.string().optional(),
  motsClesSEO: z.array(z.string()).default([]).optional()
}).refine((data: any) => {
  // Validation conditionnelle pour les mises à jour
  if (data.hasVariants !== undefined) {
    if (data.hasVariants && (!data.variants || data.variants.length === 0)) {
      return false;
    }
    if (!data.hasVariants && !data.price) {
      return false;
    }
  }
  return true;
}, {
  message: "Cohérence variants/prix requise",
  path: ["variants"]
});

// Validation des items de commande - MISE À JOUR AVEC VARIANTS
export const orderItemSchema = z.object({
  product: z.string().min(1, 'ID produit requis'),
  name: z.string().min(1, 'Nom produit requis'),
  price: z.number().min(0.01, 'Prix invalide'),
  quantity: z.number().int().min(1, 'Quantité minimum: 1').max(50, 'Quantité maximum: 50'),
  image: z.string().url().optional().or(z.literal('')),
  // NOUVEAU : Support variants dans les commandes
  variantId: z.string().optional(),
  variantName: z.string().optional()
}).refine((data) => {
  // Si variantId présent, variantName requis et vice versa
  if (data.variantId || data.variantName) {
    return data.variantId && data.variantName;
  }
  return true;
}, {
  message: "Si variant spécifié, ID et nom requis",
  path: ["variantName"]
});

// Validation des commandes - MISE À JOUR AVEC VARIANTS
export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Au moins un article requis'),
  customerInfo: z.object({
    name: z.string().min(2, 'Nom complet requis'),
    email: z.string().email('Email invalide'),
    phone: z.string().regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, 'Numéro de téléphone invalide')
  }),
  deliveryInfo: z.object({
    type: z.enum(['delivery', 'pickup']),
    address: z.object({
      street: z.string().min(5, 'Adresse requise'),
      city: z.string().min(2, 'Ville requise'),
      zipCode: z.string().regex(/^\d{5}$/, 'Code postal invalide (5 chiffres)'),
      complement: z.string().optional()
    }).optional(),
    date: z.date(),
    timeSlot: z.enum(['9h-13h', '14h-19h']),
    notes: z.string().max(500, 'Notes trop longues').optional()
  }).refine((data) => {
    // Adresse requise pour livraison
    if (data.type === 'delivery') {
      return data.address !== undefined;
    }
    return true;
  }, {
    message: "Adresse requise pour la livraison",
    path: ["address"]
  }),
  paymentMethod: z.enum(['card', 'paypal']),
  totalAmount: z.number().min(0.01, 'Montant invalide').max(9999.99, 'Montant maximum dépassé')
}).refine((data) => {
  // Vérifier que le total correspond aux items
  const calculatedTotal = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  return Math.abs(calculatedTotal - data.totalAmount) < 0.01;
}, {
  message: "Le total ne correspond pas aux articles",
  path: ["totalAmount"]
});

// Validation mise à jour statut commande
export const updateOrderStatusSchema = z.object({
  status: z.enum(['payée', 'en_creation', 'prête', 'en_livraison', 'livrée', 'annulée']),
  note: z.string().max(200, 'Note trop longue').optional()
});

// Validation des filtres produits - MISE À JOUR AVEC VARIANTS
export const productFiltersSchema = z.object({
  category: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  search: z.string().optional(),
  hasVariants: z.boolean().optional(), // NOUVEAU : Filtrer par type de produit
  tags: z.array(z.string()).optional(),
  sortBy: z.enum(['name', 'price', 'date', 'rating']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

// Validation pagination
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(12),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc')
});

// Validation upload fichiers
export const uploadSchema = z.object({
  file: z.any(),
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/webp']),
  maxSize: z.number().default(5 * 1024 * 1024), // 5MB par défaut
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
  status: z.string().optional(),
  hasVariants: z.string().transform(val => val === 'true').optional() // NOUVEAU
});

// Validation pour les webhooks Stripe - MISE À JOUR AVEC VARIANTS
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
        orderId: z.string().optional(),
        customer_name: z.string(),
        customer_email: z.string(),
        has_variants: z.string().optional(), // NOUVEAU
        variant_items_count: z.string().optional(), // NOUVEAU
        variants: z.string().optional(), // NOUVEAU
        items: z.string()
      }),
      status: z.string()
    })
  })
});

// Validation des items de panier - NOUVEAU AVEC VARIANTS
export const cartItemSchema = z.object({
  productId: z.string().min(1, 'ID produit requis'),
  quantity: z.number().int().min(1, 'Quantité minimum: 1').max(50, 'Quantité maximum: 50'),
  variantId: z.string().optional() // NOUVEAU : ID de la variante (index)
});

// Types inférés pour TypeScript
export type UserInput = z.infer<typeof userSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ProductVariant = z.infer<typeof productVariantSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type OrderInput = z.infer<typeof createOrderSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>; // NOUVEAU
export type CartItemInput = z.infer<typeof cartItemSchema>; // NOUVEAU
export type ProductFiltersInput = z.infer<typeof productFiltersSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type UploadInput = z.infer<typeof uploadSchema>;
export type QueryParamsInput = z.infer<typeof queryParamsSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

// Fonction d'aide pour valider un produit avec logs détaillés
export function validateProductData(data: unknown): {
  success: boolean;
  data?: CreateProductInput;
  errors?: z.ZodError;
} {
  try {
    const result = createProductSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Erreurs de validation:', error.errors);
      return { success: false, errors: error };
    }
    throw error;
  }
}

// NOUVELLE FONCTION : Validation des items de panier avec variants
export function validateCartItemData(data: unknown): {
  success: boolean;
  data?: CartItemInput;
  errors?: z.ZodError;
} {
  try {
    const result = cartItemSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

// NOUVELLE FONCTION : Validation des commandes avec variants
export function validateOrderData(data: unknown): {
  success: boolean;
  data?: OrderInput;
  errors?: z.ZodError;
} {
  try {
    const result = createOrderSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Erreurs de validation commande:', error.errors);
      return { success: false, errors: error };
    }
    throw error;
  }
}

// Fonctions d'aide pour la validation
export function validateEmail(email: string): boolean {
  return z.string().email().safeParse(email).success;
}

export function validatePhone(phone: string): boolean {
  return z.string().regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/).safeParse(phone).success;
}

export function validateZipCode(zipCode: string): boolean {
  return z.string().regex(/^\d{5}$/).safeParse(zipCode).success;
}

// NOUVELLE FONCTION : Validation spécifique aux variants
export function validateVariantData(data: unknown): {
  success: boolean;
  data?: ProductVariant;
  errors?: z.ZodError;
} {
  try {
    const result = productVariantSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}