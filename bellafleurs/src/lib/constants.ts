// src/lib/constants.ts

// Informations de base
export const SITE_CONFIG = {
  name: 'Bella Fleurs',
  description: 'Créations florales d\'exception en région parisienne',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://bellafleurs.fr',
  ogImage: '/images/og-image.jpg',
  author: 'Bella Fleurs',
  keywords: [
    'fleuriste',
    'bouquet',
    'fleurs',
    'mariage',
    'composition florale',
    'région parisienne',
    'livraison fleurs',
    'bella fleurs'
  ]
} as const;

// Contact
export const CONTACT_INFO = {
  phone: '+33780662732',
  email: 'contact@bellafleurs.fr',
  address: {
    street: '123 Avenue des Fleurs',
    city: 'Paris',
    zipCode: '75015',
    country: 'France',
    full: '123 Avenue des Fleurs, 75015 Paris, France'
  },
  hours: {
    weekdays: 'Lundi-Samedi: 9h-19h',
    weekend: 'Dimanche: 9h-13h',
    detailed: [
      { day: 'Lundi', hours: '9h00 - 19h00' },
      { day: 'Mardi', hours: '9h00 - 19h00' },
      { day: 'Mercredi', hours: '9h00 - 19h00' },
      { day: 'Jeudi', hours: '9h00 - 19h00' },
      { day: 'Vendredi', hours: '9h00 - 19h00' },
      { day: 'Samedi', hours: '9h00 - 19h00' },
      { day: 'Dimanche', hours: '9h00 - 13h00' }
    ]
  },
  social: {
    facebook: 'https://facebook.com/bellafleurs',
    instagram: 'https://instagram.com/bellafleurs',
    twitter: 'https://twitter.com/bellafleurs'
  }
} as const;

// Catégories de produits
export const PRODUCT_CATEGORIES = {
  bouquets: {
    id: 'bouquets',
    name: 'Bouquets',
    description: 'Bouquets frais et compositions sur mesure',
    image: '/images/categories/bouquets.jpg',
    subcategories: [
      { id: 'rond', name: 'Bouquet rond' },
      { id: 'cascade', name: 'Bouquet cascade' },
      { id: 'champetre', name: 'Bouquet champêtre' },
      { id: 'moderne', name: 'Bouquet moderne' },
      { id: 'romantique', name: 'Bouquet romantique' }
    ]
  },
  compositions: {
    id: 'compositions',
    name: 'Compositions',
    description: 'Arrangements floraux créatifs et originaux',
    image: '/images/categories/compositions.jpg',
    subcategories: [
      { id: 'vase', name: 'Composition en vase' },
      { id: 'panier', name: 'Panier fleuri' },
      { id: 'coupe', name: 'Coupe fleurie' },
      { id: 'moderne', name: 'Composition moderne' },
      { id: 'zen', name: 'Style zen' }
    ]
  },
  plantes: {
    id: 'plantes',
    name: 'Plantes',
    description: 'Plantes d\'intérieur et d\'extérieur',
    image: '/images/categories/plantes.jpg',
    subcategories: [
      { id: 'interieur', name: 'Plantes d\'intérieur' },
      { id: 'exterieur', name: 'Plantes d\'extérieur' },
      { id: 'succulentes', name: 'Succulentes' },
      { id: 'orchidees', name: 'Orchidées' },
      { id: 'bonsai', name: 'Bonsaïs' }
    ]
  },
  evenements: {
    id: 'evenements',
    name: 'Événements',
    description: 'Créations spéciales pour vos événements',
    image: '/images/categories/evenements.jpg',
    subcategories: [
      { id: 'mariage', name: 'Mariage' },
      { id: 'anniversaire', name: 'Anniversaire' },
      { id: 'naissance', name: 'Naissance' },
      { id: 'deuil', name: 'Deuil' },
      { id: 'entreprise', name: 'Événement d\'entreprise' }
    ]
  }
} as const;

// Statuts des commandes
export const ORDER_STATUS = {
  payée: {
    value: 'payée',
    label: 'Payée',
    color: 'yellow',
    description: 'Commande reçue et payée'
  },
  en_creation: {
    value: 'en_creation',
    label: 'En création',
    color: 'blue',
    description: 'Aurélie prépare votre commande'
  },
  prête: {
    value: 'prête',
    label: 'Prête',
    color: 'orange',
    description: 'Votre création est prête'
  },
  en_livraison: {
    value: 'en_livraison',
    label: 'En livraison',
    color: 'purple',
    description: 'Commande en livraison'
  },
  livrée: {
    value: 'livrée',
    label: 'Livrée',
    color: 'green',
    description: 'Commande livrée avec succès'
  },
  annulée: {
    value: 'annulée',
    label: 'Annulée',
    color: 'red',
    description: 'Commande annulée'
  }
} as const;

// Statuts de paiement
export const PAYMENT_STATUS = {
  pending: {
    value: 'pending',
    label: 'En attente',
    color: 'yellow',
    description: 'Paiement en attente'
  },
  paid: {
    value: 'paid',
    label: 'Payée',
    color: 'green',
    description: 'Paiement effectué avec succès'
  },
  failed: {
    value: 'failed',
    label: 'Échouée',
    color: 'red',
    description: 'Échec du paiement'
  },
  refunded: {
    value: 'refunded',
    label: 'Remboursée',
    color: 'gray',
    description: 'Paiement remboursé'
  }
} as const;

// Types de livraison
export const DELIVERY_TYPES = {
  pickup: {
    value: 'pickup',
    label: 'Retrait en magasin',
    description: 'Venez récupérer votre commande en boutique',
    price: 0,
    icon: '🏪'
  },
  delivery: {
    value: 'delivery',
    label: 'Livraison à domicile',
    description: 'Livraison directement chez vous',
    price: 10,
    icon: '🚚'
  }
} as const;

// Créneaux horaires
export const TIME_SLOTS = {
  'morning': { value: '9h-12h', label: '9h - 12h', period: 'Matin' },
  'lunch': { value: '12h-14h', label: '12h - 14h', period: 'Midi' },
  'afternoon': { value: '14h-17h', label: '14h - 17h', period: 'Après-midi' },
  'evening': { value: '17h-19h', label: '17h - 19h', period: 'Fin d\'après-midi' }
} as const;

// Difficultés d'entretien des plantes
export const CARE_DIFFICULTY = {
  facile: {
    value: 'facile',
    label: 'Facile',
    description: 'Parfait pour les débutants',
    color: 'green',
    icon: '😊'
  },
  modéré: {
    value: 'modéré',
    label: 'Modéré',
    description: 'Nécessite un peu d\'attention',
    color: 'yellow',
    icon: '🤔'
  },
  difficile: {
    value: 'difficile',
    label: 'Difficile',
    description: 'Pour les jardiniers expérimentés',
    color: 'red',
    icon: '🤓'
  }
} as const;

// Limites et configurations
export const LIMITS = {
  // Fichiers
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGES_PER_PRODUCT: 10,
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  
  // Pagination
  PRODUCTS_PER_PAGE: 12,
  ORDERS_PER_PAGE: 10,
  SEARCH_RESULTS_PER_PAGE: 8,
  
  // Commandes
  MIN_ORDER_AMOUNT: 15,
  MAX_QUANTITY_PER_ITEM: 50,
  
  // Texte
  MAX_REVIEW_LENGTH: 500,
  MAX_MESSAGE_LENGTH: 1000,
  
  // Cache
  CACHE_TTL: 60 * 5, // 5 minutes
  
  // Recherche
  MIN_SEARCH_LENGTH: 2,
  MAX_SEARCH_RESULTS: 50
} as const;

// Messages et textes
export const MESSAGES = {
  // Succès
  success: {
    orderCreated: 'Commande créée avec succès !',
    orderUpdated: 'Commande mise à jour',
    productAdded: 'Produit ajouté au panier',
    productRemoved: 'Produit retiré du panier',
    accountCreated: 'Compte créé avec succès !',
    loginSuccess: 'Connexion réussie !',
    logoutSuccess: 'Déconnexion réussie',
    profileUpdated: 'Profil mis à jour',
    passwordChanged: 'Mot de passe modifié',
    emailSent: 'Email envoyé avec succès',
    subscribed: 'Inscription à la newsletter réussie !'
  },
  
  // Erreurs
  error: {
    generic: 'Une erreur est survenue',
    network: 'Erreur de connexion',
    unauthorized: 'Accès non autorisé',
    forbidden: 'Action interdite',
    notFound: 'Élément introuvable',
    validation: 'Données invalides',
    fileTooBig: 'Fichier trop volumineux',
    unsupportedFile: 'Type de fichier non supporté',
    paymentFailed: 'Échec du paiement',
    orderNotFound: 'Commande introuvable',
    loginFailed: 'Identifiants incorrects',
    emailExists: 'Un compte existe déjà avec cet email',
    weakPassword: 'Mot de passe trop faible',
    invalidEmail: 'Adresse email invalide',
    requiredField: 'Ce champ est obligatoire'
  },
  
  // Confirmations
  confirm: {
    deleteAccount: 'Êtes-vous sûr de vouloir supprimer votre compte ?',
    deleteProduct: 'Supprimer ce produit ?',
    cancelOrder: 'Annuler cette commande ?',
    logout: 'Se déconnecter ?',
    removeFromCart: 'Retirer cet article du panier ?',
    clearCart: 'Vider le panier ?'
  },
  
  // Informations
  info: {
    emptyCart: 'Votre panier est vide',
    noOrders: 'Aucune commande trouvée',
    noProducts: 'Aucun produit trouvé',
    loading: 'Chargement en cours...',
    searchPlaceholder: 'Rechercher des fleurs...',
    selectDate: 'Sélectionnez une date',
    selectTime: 'Choisissez un créneau',
    minAmount: `Montant minimum: ${LIMITS.MIN_ORDER_AMOUNT}€`,
    freeDeliveryFrom: 'Livraison gratuite à partir de 50€'
  }
} as const;

// Regex patterns
export const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
  zipCode: /^\d{5}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
  orderNumber: /^BF-\d{8}-\d{4}$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
} as const;

// URLs et routes
export const ROUTES = {
  // Pages publiques
  home: '/',
  products: '/produits',
  product: (slug: string) => `/produits/${slug}`,
  cart: '/panier',
  checkout: '/checkout',
  order: (id: string) => `/commande/${id}`,
  about: '/#apropos',
  contact: '/#contact',
  
  // Authentification
  signin: '/auth/signin',
  signup: '/auth/signup',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  
  // Utilisateur
  account: '/mon-compte',
  orders: '/mes-commandes',
  
  // Admin
  adminDashboard: '/admin/dashboard',
  adminProducts: '/admin/produits',
  adminOrders: '/admin/commandes',
  adminCustomers: '/admin/clients',
  adminSettings: '/admin/parametres',
  
  // API
  api: {
    auth: {
      signin: '/api/auth/signin',
      signup: '/api/auth/signup',
      signout: '/api/auth/signout'
    },
    products: '/api/products',
    orders: '/api/orders',
    upload: '/api/admin/upload',
    newsletter: '/api/newsletter',
    contact: '/api/contact',
    webhook: '/api/webhook'
  }
} as const;

// Métadonnées SEO par page
export const SEO_CONFIG = {
  home: {
    title: 'Bella Fleurs - Créations Florales d\'Exception à Paris',
    description: 'Découvrez Bella Fleurs, votre fleuriste de confiance à Paris. Bouquets sur mesure, compositions florales et créations uniques pour tous vos événements.',
    keywords: ['fleuriste paris', 'bouquet sur mesure', 'livraison fleurs', 'mariage fleurs']
  },
  products: {
    title: 'Nos Créations Florales - Bella Fleurs',
    description: 'Parcourez notre collection de bouquets, compositions et plantes. Créations fraîches et uniques, livrées à Paris et en région parisienne.',
    keywords: ['bouquet fleurs', 'composition florale', 'plantes paris', 'fleurs fraîches']
  },
  about: {
    title: 'À Propos de Bella Fleurs - Notre Histoire',
    description: 'Découvrez l\'histoire de Bella Fleurs, notre passion pour l\'art floral et notre engagement envers la qualité et la créativité.',
    keywords: ['fleuriste artisan', 'histoire bella fleurs', 'savoir-faire floral']
  },
  contact: {
    title: 'Contact - Bella Fleurs Paris',
    description: 'Contactez Bella Fleurs pour vos projets floraux. Boutique à Paris 15ème, livraison en région parisienne.',
    keywords: ['contact fleuriste', 'paris 15ème', 'livraison fleurs paris']
  }
} as const;

// Animations et transitions
export const ANIMATIONS = {
  // Durées en millisecondes
  durations: {
    fast: 150,
    normal: 300,
    slow: 500
  },
  
  // Easings
  easings: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  
  // Classes CSS pour les animations
  classes: {
    fadeIn: 'animate-fade-in',
    fadeInUp: 'animate-fade-in-up',
    slideInRight: 'animate-slide-in-right',
    slideInLeft: 'animate-slide-in-left',
    bounce: 'animate-bounce-gentle',
    pulse: 'animate-pulse-soft',
    float: 'animate-float'
  }
} as const;

// Configuration des notifications toast
export const TOAST_CONFIG = {
  duration: 4000,
  position: 'top-right' as const,
  style: {
    background: 'white',
    color: '#374151',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    fontSize: '0.875rem'
  },
  success: {
    iconTheme: { primary: '#10b981', secondary: 'white' }
  },
  error: {
    iconTheme: { primary: '#ef4444', secondary: 'white' }
  }
} as const;

// Configuration des couleurs pour les graphiques
export const CHART_COLORS = {
  primary: '#c73650',
  secondary: '#ff6b9d',
  accent: '#ffc1cc',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  gray: '#6b7280'
} as const;

// Export de tous les types pour TypeScript
export type ProductCategoryId = keyof typeof PRODUCT_CATEGORIES;
export type OrderStatusValue = keyof typeof ORDER_STATUS;
export type PaymentStatusValue = keyof typeof PAYMENT_STATUS;
export type DeliveryTypeValue = keyof typeof DELIVERY_TYPES;
export type CareDifficultyValue = keyof typeof CARE_DIFFICULTY;