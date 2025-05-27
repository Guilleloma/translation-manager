import mongoose from 'mongoose';

/**
 * Configuración de conexión a MongoDB
 * Utiliza variables de entorno para la configuración
 */

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/translation-manager';

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

/**
 * Conecta a MongoDB usando Mongoose
 * Mantiene una conexión cacheada para evitar múltiples conexiones
 */
async function connectDB() {
  if (cached.conn) {
    console.log('📊 Usando conexión existente a MongoDB');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log('🔌 Conectando a MongoDB...');
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Conectado a MongoDB exitosamente');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ Error conectando a MongoDB:', e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;
