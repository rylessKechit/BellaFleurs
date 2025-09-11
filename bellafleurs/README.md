# 🌸 Bella Fleurs - E-commerce Platform

Site e-commerce moderne pour la boutique de fleurs Bella Fleurs, développé avec Next.js 14 et MongoDB.

## 🚀 Fonctionnalités

### 🛍️ Partie Client

- **Landing Page** : Design moderne avec animations florales
- **Catalogue Produits** : Navigation par catégories avec filtres
- **Pages Produits** : Descriptions détaillées, galerie d'images, prix
- **Panier & Checkout** : Ajout produits, calcul total, validation commande
- **Paiement Sécurisé** : Intégration Stripe pour les transactions
- **Suivi Commandes** : Tracking en temps réel du statut

### 👨‍💼 Partie Admin

- **Dashboard** : Statistiques ventes, commandes récentes, revenus
- **CRUD Produits** : Création, modification, suppression des produits
- **Gestion Images** : Upload et organisation des photos produits
- **Gestion Commandes** : Suivi, modification statut, communication client

## 🛠️ Stack Technique

- **Framework** : Next.js 14 (App Router)
- **Base de Données** : MongoDB avec Mongoose ODM
- **Authentification** : NextAuth.js v5
- **Paiement** : Stripe Payment Intent
- **Upload Images** : Cloudinary
- **Styling** : Tailwind CSS
- **Validation** : Zod
- **Déploiement** : Vercel

## 📦 Installation

### Prérequis

- Node.js 18+
- npm ou yarn
- Compte MongoDB Atlas
- Compte Stripe
- Compte Cloudinary

### 1. Cloner le projet

```bash
git clone https://github.com/ton-username/bella-fleurs.git
cd bella-fleurs
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration des variables d'environnement

Créer un fichier `.env.local` :

```env
# Base
NEXTAUTH_SECRET=ton-secret-super-secure-32-caracteres-minimum
NEXTAUTH_URL=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bella-fleurs

# Stripe
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=ton-cloud-name
CLOUDINARY_API_KEY=ton-api-key
CLOUDINARY_API_SECRET=ton-api-secret

# Email (optionnel - pour notifications)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=ton-email@gmail.com
EMAIL_SERVER_PASSWORD=ton-mot-de-passe-app
EMAIL_FROM=noreply@bellafleurs.fr

# Admin (compte par défaut)
ADMIN_EMAIL=admin@bellafleurs.fr
ADMIN_PASSWORD=MotDePasseSecurise123!
```

### 4. Lancer le serveur de développement

```bash
npm run dev
```

Le site sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📁 Structure du Projet

```
bella-fleurs/
├── app/                          # App Router Next.js 14
│   ├── (admin)/                 # Routes admin protégées
│   │   ├── admin/
│   │   │   ├── dashboard/       # Dashboard administrateur
│   │   │   ├── produits/        # CRUD produits
│   │   │   ├── commandes/       # Gestion commandes
│   │   │   └── layout.tsx       # Layout admin
│   ├── (public)/                # Routes publiques
│   │   ├── page.tsx            # Landing page
│   │   ├── produits/           # Catalogue et détails
│   │   ├── panier/             # Gestion panier
│   │   ├── checkout/           # Processus de commande
│   │   ├── commande/           # Confirmation & suivi
│   │   └── auth/               # Authentification
│   ├── api/                    # API Routes
│   │   ├── auth/               # NextAuth endpoints
│   │   ├── produits/           # API produits
│   │   ├── commandes/          # API commandes
│   │   ├── upload/             # Upload images
│   │   └── webhooks/           # Webhooks Stripe
│   ├── globals.css             # Styles globaux
│   ├── layout.tsx              # Layout racine
│   └── loading.tsx             # Composant loading
├── components/                  # Composants réutilisables
│   ├── ui/                     # Composants UI de base
│   ├── layout/                 # Headers, footers, navigation
│   ├── product/                # Composants produits
│   ├── admin/                  # Composants admin
│   └── forms/                  # Formulaires
├── lib/                        # Utilitaires et configuration
│   ├── mongodb.ts              # Connection MongoDB
│   ├── auth.ts                 # Configuration NextAuth
│   ├── stripe.ts               # Configuration Stripe
│   ├── cloudinary.ts           # Configuration Cloudinary
│   ├── validations.ts          # Schémas de validation Zod
│   └── utils.ts                # Fonctions utilitaires
├── models/                     # Modèles Mongoose
│   ├── User.ts
│   ├── Product.ts
│   └── Order.ts
├── types/                      # Types TypeScript
│   ├── auth.ts
│   ├── product.ts
│   └── order.ts
├── public/                     # Assets statiques
│   ├── images/
│   └── icons/
├── .env.local                  # Variables d'environnement
├── next.config.js              # Configuration Next.js
├── tailwind.config.js          # Configuration Tailwind
└── package.json
```

## 🗃️ Modèles de Données

### User (Utilisateur)

```typescript
{
  _id: ObjectId
  name: string
  email: string
  password: string (hashé)
  role: 'client' | 'admin'
  address?: {
    street: string
    city: string
    zipCode: string
    country: string
  }
  phone?: string
  createdAt: Date
  updatedAt: Date
}
```

### Product (Produit)

```typescript
{
  _id: ObjectId
  name: string
  description: string
  price: number
  category: 'bouquets' | 'compositions' | 'plantes' | 'evenements'
  subcategory: string
  images: string[] // URLs Cloudinary
  isActive: boolean
  tags: string[]
  seo: {
    title: string
    description: string
    keywords: string[]
  }
  createdAt: Date
  updatedAt: Date
}
```

### Order (Commande)

```typescript
{
  _id: ObjectId
  orderNumber: string // Format: BF-YYYYMMDD-XXXX
  user: ObjectId // Référence User
  items: [{
    product: ObjectId // Référence Product
    name: string // Nom au moment de la commande
    price: number // Prix au moment de la commande
    quantity: number
  }]
  totalAmount: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  stripePaymentIntentId: string
  deliveryInfo: {
    type: 'pickup' | 'delivery'
    address?: {
      street: string
      city: string
      zipCode: string
      country: string
    }
    date: Date
    timeSlot: string
    notes?: string
  }
  customerInfo: {
    name: string
    email: string
    phone: string
  }
  adminNotes?: string
  createdAt: Date
  updatedAt: Date
}
```

## 🔧 Scripts Disponibles

```bash
# Développement
npm run dev              # Serveur de développement
npm run build           # Build de production
npm run start           # Serveur de production
npm run lint            # Linting ESLint

# Base de données
npm run db:seed         # Populate base avec données test
npm run db:reset        # Reset complet de la DB

# Tests (à implémenter)
npm run test            # Tests unitaires
npm run test:e2e        # Tests end-to-end
```

## 🌐 API Endpoints

### Publiques

```
GET    /api/produits              # Liste des produits
GET    /api/produits/[id]         # Détail produit
POST   /api/commandes             # Créer commande
GET    /api/commandes/[id]        # Détail commande
POST   /api/auth/signin           # Connexion
POST   /api/auth/signup           # Inscription
```

### Admin (protégées)

```
POST   /api/admin/produits        # Créer produit
PUT    /api/admin/produits/[id]   # Modifier produit
DELETE /api/admin/produits/[id]   # Supprimer produit
GET    /api/admin/commandes       # Liste commandes
PUT    /api/admin/commandes/[id]  # Modifier statut commande
GET    /api/admin/dashboard       # Stats dashboard
POST   /api/upload               # Upload image
```

## 🚀 Déploiement

### Vercel (Recommandé)

1. Connecter le repo GitHub à Vercel
2. Configurer les variables d'environnement
3. Déployer automatiquement sur push

### Variables d'environnement Vercel

- Copier toutes les variables de `.env.local`
- Modifier `NEXTAUTH_URL` vers l'URL de production
- Configurer les webhooks Stripe pour la prod

## 🔒 Sécurité

- **Authentification** : Sessions JWT sécurisées
- **Autorisation** : Middleware de protection des routes admin
- **Validation** : Validation stricte avec Zod côté client/serveur
- **Sanitisation** : Protection contre les injections
- **HTTPS** : Obligatoire en production
- **Variables** : Secrets stockés dans variables d'environnement

## 📱 Responsive

- **Mobile First** : Design optimisé mobile
- **Breakpoints** : sm (640px), md (768px), lg (1024px), xl (1280px)
- **Images** : Optimisation automatique Next.js
- **Performance** : Score Lighthouse 90+

## 🎨 Design System

### Couleurs

- **Primary** : #c73650 (Rouge Bella Fleurs)
- **Secondary** : #ff6b9d (Rose)
- **Accent** : #ffc1cc (Rose pâle)
- **Neutral** : Grays 50-900

### Typography

- **Headings** : Inter Bold
- **Body** : Inter Regular
- **Mono** : JetBrains Mono

## 📞 Support

- **Email** : dev@bellafleurs.fr
- **Issues** : [GitHub Issues](https://github.com/ton-username/bella-fleurs/issues)
- **Documentation** : [Wiki](https://github.com/ton-username/bella-fleurs/wiki)

## 📄 Licence

MIT License - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

**Développé avec ❤️ pour Bella Fleurs** 🌸
