// src/models/CorporateInvoice.ts - Nouveau modèle pour facturation B2B
import mongoose, { Schema, Model, Document } from 'mongoose';

export interface ICorporateInvoiceItem {
  orderId: mongoose.Types.ObjectId;
  orderNumber: string;
  orderDate: Date;
  amount: number;
  description: string;
}

export interface ICorporateInvoiceMethods {
  calculateTotal(): number;
  markAsPaid(): Promise<ICorporateInvoice>;
  markAsOverdue(): Promise<ICorporateInvoice>;
  addOrder(orderId: string, orderNumber: string, amount: number, description: string): Promise<ICorporateInvoice>;
  canBeEdited(): boolean;
}

export interface ICorporateInvoice extends Document, ICorporateInvoiceMethods {
  invoiceNumber: string;
  corporateUser: mongoose.Types.ObjectId;
  companyName: string;
  
  // Période de facturation
  billingPeriod: {
    startDate: Date;
    endDate: Date;
    month: number;
    year: number;
  };
  
  // Items facturés (commandes du mois)
  items: ICorporateInvoiceItem[];
  
  // Totaux
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  
  // Statut et dates
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issuedAt?: Date;
  dueDate?: Date;
  paidAt?: Date;
  
  // Stripe
  stripeInvoiceId?: string;
  stripePaymentIntentId?: string;
  
  // Notes
  notes?: string;
  adminNotes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ICorporateInvoiceModel extends Model<ICorporateInvoice, {}, ICorporateInvoiceMethods> {
  findByUser(userId: string): Promise<ICorporateInvoice[]>;
  findByPeriod(month: number, year: number): Promise<ICorporateInvoice[]>;
  findPendingPayments(): Promise<ICorporateInvoice[]>;
  findOverdueInvoices(): Promise<ICorporateInvoice[]>;
  generateInvoiceNumber(): Promise<string>;
  createMonthlyInvoice(userId: string, month: number, year: number): Promise<ICorporateInvoice>;
}

export type ICorporateInvoiceDocument = ICorporateInvoice & ICorporateInvoiceMethods;

// Schéma pour les items de facture
const InvoiceItemSchema = new Schema({
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  orderNumber: {
    type: String,
    required: true,
    trim: true
  },
  orderDate: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount must be positive']
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  }
}, { _id: false });

// Schéma principal
const CorporateInvoiceSchema = new Schema<ICorporateInvoice, ICorporateInvoiceModel, ICorporateInvoiceMethods>({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  corporateUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters']
  },
  
  // Période de facturation
  billingPeriod: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: true,
      min: 2024
    }
  },
  
  // Items
  items: {
    type: [InvoiceItemSchema],
    default: []
  },
  
  // Totaux
  subtotal: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Subtotal must be positive']
  },
  vatRate: {
    type: Number,
    required: true,
    default: 20, // 20% TVA France
    min: [0, 'VAT rate must be positive']
  },
  vatAmount: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'VAT amount must be positive']
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Total amount must be positive']
  },
  
  // Statut
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft',
    required: true
  },
  issuedAt: {
    type: Date
  },
  dueDate: {
    type: Date
  },
  paidAt: {
    type: Date
  },
  
  // Stripe
  stripeInvoiceId: {
    type: String,
    sparse: true
  },
  stripePaymentIntentId: {
    type: String,
    sparse: true
  },
  
  // Notes
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  adminNotes: {
    type: String,
    maxlength: [1000, 'Admin notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index
CorporateInvoiceSchema.index({ corporateUser: 1, 'billingPeriod.month': 1, 'billingPeriod.year': 1 }, { unique: true });
CorporateInvoiceSchema.index({ status: 1 });
CorporateInvoiceSchema.index({ dueDate: 1 });
CorporateInvoiceSchema.index({ createdAt: -1 });

// Middleware pour recalculer les totaux
CorporateInvoiceSchema.pre('save', function(this: ICorporateInvoice) {
  this.calculateTotal();
});

// Méthodes d'instance
CorporateInvoiceSchema.methods.calculateTotal = function(this: ICorporateInvoice) {
  this.subtotal = this.items.reduce((total, item) => total + item.amount, 0);
  this.vatAmount = Math.round(this.subtotal * (this.vatRate / 100) * 100) / 100;
  this.totalAmount = Math.round((this.subtotal + this.vatAmount) * 100) / 100;
  return this.totalAmount;
};

CorporateInvoiceSchema.methods.markAsPaid = async function(this: ICorporateInvoice) {
  this.status = 'paid';
  this.paidAt = new Date();
  return await this.save();
};

CorporateInvoiceSchema.methods.markAsOverdue = async function(this: ICorporateInvoice) {
  this.status = 'overdue';
  return await this.save();
};

CorporateInvoiceSchema.methods.addOrder = async function(
  this: ICorporateInvoice,
  orderId: string,
  orderNumber: string,
  amount: number,
  description: string
) {
  this.items.push({
    orderId: new mongoose.Types.ObjectId(orderId),
    orderNumber,
    orderDate: new Date(),
    amount,
    description
  });
  return await this.save();
};

CorporateInvoiceSchema.methods.canBeEdited = function(this: ICorporateInvoice) {
  return this.status === 'draft';
};

// Méthodes statiques
CorporateInvoiceSchema.statics.findByUser = function(userId: string) {
  return this.find({ corporateUser: userId }).sort({ createdAt: -1 });
};

CorporateInvoiceSchema.statics.findByPeriod = function(month: number, year: number) {
  return this.find({
    'billingPeriod.month': month,
    'billingPeriod.year': year
  });
};

CorporateInvoiceSchema.statics.findPendingPayments = function() {
  return this.find({ status: 'sent' });
};

CorporateInvoiceSchema.statics.findOverdueInvoices = function() {
  return this.find({
    status: 'sent',
    dueDate: { $lt: new Date() }
  });
};

CorporateInvoiceSchema.statics.generateInvoiceNumber = async function() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  
  // Format: BFC-YYYY-MM-XXXX (BellaFleurs Corporate)
  const prefix = `BFC-${year}-${month}`;
  
  // Trouver le dernier numéro de facture du mois
  const lastInvoice = await this.findOne({
    invoiceNumber: { $regex: `^${prefix}` }
  }).sort({ invoiceNumber: -1 });
  
  let nextNumber = 1;
  if (lastInvoice) {
    const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-').pop() || '0');
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
};

CorporateInvoiceSchema.statics.createMonthlyInvoice = async function(
  userId: string,
  month: number,
  year: number
) {
  // Vérifier qu'une facture n'existe pas déjà
  const existingInvoice = await this.findOne({
    corporateUser: userId,
    'billingPeriod.month': month,
    'billingPeriod.year': year
  });
  
  if (existingInvoice) {
    throw new Error('Invoice already exists for this period');
  }
  
  // Calculer les dates de la période
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  // Récupérer l'utilisateur corporate
  const User = mongoose.model('User');
  const user = await User.findById(userId);
  if (!user || user.accountType !== 'corporate') {
    throw new Error('User is not a corporate account');
  }
  
  // Générer le numéro de facture
  const invoiceNumber = await this.generateInvoiceNumber();
  
  // Créer la facture
  const invoice = new this({
    invoiceNumber,
    corporateUser: userId,
    companyName: user.company?.name || 'Entreprise',
    billingPeriod: {
      startDate,
      endDate,
      month,
      year
    },
    items: [],
    vatRate: 20
  });
  
  return await invoice.save();
};

// Virtuals
CorporateInvoiceSchema.virtual('isOverdue').get(function(this: ICorporateInvoice) {
  return this.status === 'sent' && this.dueDate && this.dueDate < new Date();
});

CorporateInvoiceSchema.virtual('daysSinceDue').get(function(this: ICorporateInvoice) {
  if (!this.dueDate || this.status !== 'sent') return 0;
  const now = new Date();
  const diffTime = now.getTime() - this.dueDate.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
});

const CorporateInvoice = (mongoose.models.CorporateInvoice as ICorporateInvoiceModel) || 
  mongoose.model<ICorporateInvoice, ICorporateInvoiceModel>('CorporateInvoice', CorporateInvoiceSchema);

export default CorporateInvoice;