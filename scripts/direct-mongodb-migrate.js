/**
 * Script para migrar datos directamente a MongoDB
 * Este script no requiere compilación previa
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Modelos
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  role: { 
    type: String, 
    enum: ['admin', 'translator', 'reviewer', 'developer'],
    default: 'translator'
  },
  languages: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const copySchema = new mongoose.Schema({
  slug: {
    type: String,
    required: false,
    trim: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  language: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['not_assigned', 'assigned', 'translated', 'reviewed', 'approved', 'rejected'],
    default: 'not_assigned'
  },
  tags: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índice parcial para slug+idioma, pero solo cuando el slug no esté vacío
copySchema.index(
  { slug: 1, language: 1 }, 
  { 
    unique: true,
    partialFilterExpression: { 
      slug: { $exists: true, $ne: '', $ne: null } 
    }
  }
);

const Copy = mongoose.model('Copy', copySchema);

// Datos semilla simplificados
const seedUsers = [
  {
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    languages: ['es', 'en', 'fr', 'de', 'it', 'pt'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: 'translator1',
    email: 'translator1@example.com',
    role: 'translator',
    languages: ['es', 'en'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: 'reviewer1',
    email: 'reviewer1@example.com',
    role: 'reviewer',
    languages: ['es', 'en', 'fr'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: 'developer1',
    email: 'developer1@example.com',
    role: 'developer',
    languages: ['es', 'en'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const seedCopys = [
  {
    slug: 'welcome',
    text: 'Bienvenido a nuestra aplicación',
    language: 'es',
    status: 'approved',
    tags: ['general', 'inicio'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    slug: 'welcome',
    text: 'Welcome to our application',
    language: 'en',
    status: 'approved',
    tags: ['general', 'home'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    slug: 'login.title',
    text: 'Iniciar sesión',
    language: 'es',
    status: 'approved',
    tags: ['auth'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    slug: 'login.title',
    text: 'Log in',
    language: 'en',
    status: 'approved',
    tags: ['auth'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    slug: '',
    text: 'Texto pendiente de asociar a un slug',
    language: 'es',
    status: 'not_assigned',
    tags: ['pending'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Función para limpiar la base de datos
async function clearAllData() {
  console.log('Limpiando base de datos...');
  await User.deleteMany({});
  await Copy.deleteMany({});
  console.log('Base de datos limpiada correctamente.');
}

// Función para migrar usuarios
async function migrateUsers() {
  console.log('Migrando usuarios...');
  const users = await User.insertMany(seedUsers);
  console.log(`${users.length} usuarios migrados correctamente.`);
  return users;
}

// Función para migrar copys
async function migrateCopys() {
  console.log('Migrando copys...');
  const copys = await Copy.insertMany(seedCopys);
  console.log(`${copys.length} copys migrados correctamente.`);
  return copys;
}

// Función para verificar el estado de la migración
async function checkStatus() {
  const usersCount = await User.countDocuments();
  const copysCount = await Copy.countDocuments();
  
  console.log('\nEstado de la base de datos:');
  console.log(`- Usuarios: ${usersCount}`);
  console.log(`- Copys: ${copysCount}`);
  console.log(`- Migración completa: ${usersCount > 0 && copysCount > 0 ? 'Sí' : 'No'}`);
}

// Función principal
async function main() {
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/translation-manager');
    console.log('Conexión exitosa a MongoDB.');
    
    // Preguntar si se quiere limpiar la base de datos
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('¿Desea limpiar la base de datos antes de migrar? (s/n): ', async (answer) => {
      readline.close();
      
      if (answer.toLowerCase() === 's') {
        await clearAllData();
      }
      
      // Migrar datos
      await migrateUsers();
      await migrateCopys();
      
      // Verificar estado
      await checkStatus();
      
      // Desconectar
      console.log('\nDesconectando de MongoDB...');
      await mongoose.disconnect();
      console.log('Desconexión exitosa.');
      
      console.log('\n¡Migración completada con éxito!');
      console.log('Puedes iniciar la aplicación con: npm run dev:mongodb');
    });
  } catch (error) {
    console.error('Error durante la migración:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Ejecutar la función principal
main();
