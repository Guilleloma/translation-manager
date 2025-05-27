import mongoose, { Schema, Document } from 'mongoose';
import { User as IUser, UserRole } from '../types/user';

/**
 * Interface que extiende el Document de Mongoose para el modelo User
 */
export interface UserDocument extends IUser, Document {
  _id: string;
}

/**
 * Schema de Mongoose para el modelo User
 */
const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: [true, 'El nombre de usuario es requerido'],
    trim: true,
    maxlength: [100, 'El nombre de usuario no puede exceder 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingresa un email válido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    required: [true, 'El rol es requerido'],
    default: UserRole.TRANSLATOR
  },
  languages: {
    type: [String],
    default: [],
    validate: {
      validator: function(languages: string[]) {
        // Validar que todos los códigos de idioma sean válidos (2-3 caracteres)
        return languages.every(lang => /^[a-z]{2,3}$/.test(lang));
      },
      message: 'Los códigos de idioma deben tener 2-3 caracteres en minúsculas'
    }
  }
}, {
  timestamps: true, // Agrega createdAt y updatedAt automáticamente
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password; // No incluir password en respuestas JSON
      return ret;
    }
  }
});

/**
 * Índices para optimizar consultas
 */
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ languages: 1 });

/**
 * Middleware pre-save para hashear password
 * Nota: En producción se debería usar bcrypt para hashear passwords
 */
UserSchema.pre('save', function(next) {
  const user = this as UserDocument;
  
  // Solo hashear si la password fue modificada (o es nueva)
  if (!user.isModified('password')) return next();
  
  // En desarrollo mantenemos passwords simples
  // En producción usar: user.password = await bcrypt.hash(user.password, 12);
  
  next();
});

/**
 * Método para comparar passwords
 * En producción usar bcrypt.compare
 */
UserSchema.methods.comparePassword = function(candidatePassword: string): boolean {
  return this.password === candidatePassword;
};

/**
 * Método estático para encontrar traductores por idioma
 */
UserSchema.statics.findTranslatorsByLanguage = function(language: string) {
  return this.find({
    role: UserRole.TRANSLATOR,
    languages: language
  });
};

/**
 * Exportar el modelo
 * Usar mongoose.models para evitar errores de re-compilación en desarrollo
 */
export default mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);
