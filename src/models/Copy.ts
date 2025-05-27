import mongoose, { Schema, Document } from 'mongoose';
import { Copy as ICopy, CopyStatus, CopyComment, CopyHistory, CopyTag } from '../types/copy';

/**
 * Interface que extiende el Document de Mongoose para el modelo Copy
 */
export interface CopyDocument extends Omit<ICopy, 'id'>, Document {
  _id: string;
}

/**
 * Schema para comentarios de copys
 */
const CopyCommentSchema: Schema = new Schema({
  copyId: {
    type: Schema.Types.ObjectId,
    ref: 'Copy',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: [true, 'El texto del comentario es requerido'],
    maxlength: [1000, 'El comentario no puede exceder 1000 caracteres']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Schema para historial de cambios de copys
 */
const CopyHistorySchema: Schema = new Schema({
  copyId: {
    type: Schema.Types.ObjectId,
    ref: 'Copy',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  previousStatus: {
    type: String,
    enum: ['not_assigned', 'assigned', 'translated', 'reviewed', 'approved', 'rejected']
  },
  newStatus: {
    type: String,
    enum: ['not_assigned', 'assigned', 'translated', 'reviewed', 'approved', 'rejected']
  },
  previousText: String,
  newText: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  comments: {
    type: String,
    maxlength: [500, 'Los comentarios del historial no pueden exceder 500 caracteres']
  }
});

/**
 * Schema principal para el modelo Copy
 */
const CopySchema: Schema = new Schema({
  slug: {
    type: String,
    required: false, // Permitir slugs vacíos o undefined
    trim: true,
    maxlength: [200, 'El slug no puede exceder 200 caracteres'],
    validate: {
      validator: function(v: string) {
        // Si el slug está presente, debe cumplir el formato
        if (v && v.length > 0) {
          return /^[a-zA-Z0-9._-]+$/.test(v);
        }
        return true; // Permitir slugs vacíos
      },
      message: 'El slug solo puede contener letras, números, puntos, guiones y guiones bajos'
    }
  },
  text: {
    type: String,
    required: [true, 'El texto es requerido'],
    trim: true,
    maxlength: [5000, 'El texto no puede exceder 5000 caracteres']
  },
  language: {
    type: String,
    required: [true, 'El idioma es requerido'],
    match: [/^[a-z]{2,3}$/, 'El código de idioma debe tener 2-3 caracteres en minúsculas']
  },
  status: {
    type: String,
    enum: ['not_assigned', 'assigned', 'translated', 'reviewed', 'approved', 'rejected'],
    default: 'not_assigned',
    required: true
  },
  // Campos de asignación y seguimiento
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: Date,
  completedAt: Date,
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  // Etiquetas y metadatos
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function(tags: string[]) {
        return tags.every(tag => tag.length <= 50);
      },
      message: 'Las etiquetas no pueden exceder 50 caracteres'
    }
  },
  // Referencias a comentarios e historial
  comments: [CopyCommentSchema],
  history: [CopyHistorySchema],
  // Campos adicionales para importaciones masivas
  isBulkImport: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true, // Agrega createdAt y updatedAt automáticamente
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

/**
 * Índices compuestos para optimizar consultas
 */
// Índice único para slug+idioma, pero solo cuando el slug no esté vacío
CopySchema.index(
  { slug: 1, language: 1 }, 
  { 
    unique: true,
    partialFilterExpression: { 
      slug: { $exists: true, $ne: '', $ne: null } 
    }
  }
);
CopySchema.index({ language: 1 });
CopySchema.index({ status: 1 });
CopySchema.index({ assignedTo: 1 });
CopySchema.index({ createdAt: -1 });
CopySchema.index({ updatedAt: -1 });
CopySchema.index({ tags: 1 });

/**
 * Middleware pre-save para validaciones adicionales
 */
CopySchema.pre('save', function(next) {
  const copy = this as CopyDocument;
  
  // Validar que el slug no esté vacío si el texto no está vacío
  if (copy.text && copy.text.trim() && (!copy.slug || !copy.slug.trim())) {
    return next(new Error('Un copy con texto debe tener un slug asociado'));
  }
  
  // Actualizar fechas según el estado
  if (copy.isModified('status')) {
    const now = new Date();
    
    switch (copy.status) {
      case 'assigned':
        if (!copy.assignedAt) copy.assignedAt = now;
        break;
      case 'translated':
        if (!copy.completedAt) copy.completedAt = now;
        break;
      case 'reviewed':
        if (!copy.reviewedAt) copy.reviewedAt = now;
        break;
      case 'approved':
        if (!copy.approvedAt) copy.approvedAt = now;
        break;
    }
  }
  
  next();
});

/**
 * Método estático para buscar copys por slug en todos los idiomas
 */
CopySchema.statics.findBySlug = function(slug: string) {
  return this.find({ slug });
};

/**
 * Método estático para buscar copys asignados a un traductor
 */
CopySchema.statics.findAssignedTo = function(userId: string) {
  return this.find({ assignedTo: userId });
};

/**
 * Método estático para buscar copys por idioma y estado
 */
CopySchema.statics.findByLanguageAndStatus = function(language: string, status?: CopyStatus) {
  const query: any = { language };
  if (status) query.status = status;
  return this.find(query);
};

/**
 * Método para agregar un comentario al copy
 */
CopySchema.methods.addComment = function(userId: string, userName: string, text: string) {
  this.comments.push({
    copyId: this._id,
    userId,
    userName,
    text,
    createdAt: new Date()
  });
  return this.save();
};

/**
 * Método para agregar una entrada al historial
 */
CopySchema.methods.addHistoryEntry = function(
  userId: string, 
  userName: string, 
  previousStatus?: CopyStatus, 
  newStatus?: CopyStatus,
  previousText?: string,
  newText?: string,
  comments?: string
) {
  this.history.push({
    copyId: this._id,
    userId,
    userName,
    previousStatus,
    newStatus,
    previousText,
    newText,
    createdAt: new Date(),
    comments
  });
  return this.save();
};

/**
 * Exportar el modelo
 * Usar mongoose.models para evitar errores de re-compilación en desarrollo
 */
export default mongoose.models.Copy || mongoose.model<CopyDocument>('Copy', CopySchema);
