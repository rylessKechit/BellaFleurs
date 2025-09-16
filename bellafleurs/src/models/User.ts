// src/models/User.ts - Index corrigés
import mongoose, { Schema, Model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  toPublicJSON(): Omit<IUser, 'password'>;
}

export interface IUserModel extends Model<IUser, {}, IUserMethods> {
  findByEmail(email: string): Promise<IUserDocument | null>;
  findAdmins(): Promise<IUserDocument[]>;
  findClients(): Promise<IUserDocument[]>;
}

export type IUserDocument = IUser & IUserMethods;

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

const UserSchema = new Schema<IUser, IUserModel, IUserMethods>({
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
    // CORRECTION: Retirer unique: true d'ici car on définit l'index séparément
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
    select: false
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

// CORRECTION: Index définis UNE SEULE FOIS ici
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });

// Middleware pre-save pour hasher le mot de passe
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  if (!this.password) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Méthodes d'instance
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.toPublicJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
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

const User = (mongoose.models.User as IUserModel) || 
  mongoose.model<IUser, IUserModel>('User', UserSchema);

export default User;