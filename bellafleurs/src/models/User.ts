import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '@/types';

// Schéma pour l'adresse
const AddressSchema = new Schema({
  street: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Street address cannot exceed 200 characters']
  },
  city: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'City name cannot exceed 100 characters']
  },
  zipCode: {
    type: String,
    required: true,
    trim: true,
    match: [/^\d{5}$/, 'Please enter a valid 5-digit zip code']
  },
  country: {
    type: String,
    required: true,
    trim: true,
    default: 'France',
    maxlength: [50, 'Country name cannot exceed 50 characters']
  }
}, { _id: false });

// Schéma principal User
const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Par défaut, ne pas inclure le mot de passe dans les requêtes
  },
  role: {
    type: String,
    enum: ['client', 'admin'],
    default: 'client',
    required: true
  },
  address: {
    type: AddressSchema,
    required: false
  },
  phone: {
    type: String,
    trim: true,
    match: [
      /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
      'Please enter a valid French phone number'
    ]
  },
  emailVerified: {
    type: Date,
    default: null
  },
  image: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// Index pour les performances
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });

// Middleware pre-save pour hasher le mot de passe
UserSchema.pre('save', async function(next) {
  // Ne hasher que si le mot de passe a été modifié
  if (!this.isModified('password')) return next();
  
  // Si pas de mot de passe (OAuth), passer
  if (!this.password) return next();

  try {
    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Méthode d'instance pour comparer les mots de passe
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Méthode d'instance pour obtenir les infos publiques
UserSchema.methods.toPublicJSON = function() {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    address: this.address,
    phone: this.phone,
    emailVerified: this.emailVerified,
    image: this.image,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Méthodes statiques
UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

UserSchema.statics.findAdmins = function() {
  return this.find({ role: 'admin' });
};

UserSchema.statics.findClients = function() {
  return this.find({ role: 'client' });
};

// Virtuals
UserSchema.virtual('fullAddress').get(function() {
  if (!this.address) return null;
  return `${this.address.street}, ${this.address.zipCode} ${this.address.city}, ${this.address.country}`;
});

UserSchema.virtual('isAdmin').get(function() {
  return this.role === 'admin';
});

UserSchema.virtual('isEmailVerified').get(function() {
  return !!this.emailVerified;
});

// Interface pour les méthodes statiques
interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  findAdmins(): Promise<IUser[]>;
  findClients(): Promise<IUser[]>;
}

// Éviter la recompilation du modèle
const User = (mongoose.models.User as unknown as IUserModel) || mongoose.model<IUser, IUserModel>('User', UserSchema);

export default User;