#!/usr/bin/env node

/**
 * Script para agregar copys de prueba con slugs auto-generados
 * Esto permite probar la funcionalidad del panel de developer
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/translation-manager';

const testCopies = [
  {
    slug: 'auto_1703875200000',
    text: 'Bienvenido a nuestra aplicación',
    language: 'es',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    slug: 'text_456789',
    text: 'Guardar cambios',
    language: 'es',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    slug: 'copy_987654',
    text: 'Error de validación',
    language: 'es',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    slug: 'mensaje_1703875200001',
    text: 'Usuario no encontrado',
    language: 'es',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    slug: 'auto_welcome_en',
    text: 'Welcome to our application',
    language: 'en',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    slug: 'text_123456',
    text: 'Save changes',
    language: 'en',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    slug: 'error_1703875200002',
    text: 'Validation error',
    language: 'en',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    slug: 'auto_bienvenue',
    text: 'Bienvenue dans notre application',
    language: 'fr',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    slug: 'button_789123',
    text: 'Enregistrer les modifications',
    language: 'fr',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    slug: 'copy_555666',
    text: 'Willkommen in unserer Anwendung',
    language: 'de',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function addTestCopies() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 Conectando a MongoDB...');
    await client.connect();
    
    const db = client.db();
    const collection = db.collection('copies');
    
    console.log('🧪 Agregando copys de prueba con slugs auto-generados...');
    
    // Verificar si ya existen copys con estos slugs
    const existingSlugs = await collection.find({
      slug: { $in: testCopies.map(copy => copy.slug) }
    }).toArray();
    
    if (existingSlugs.length > 0) {
      console.log('⚠️  Algunos copys de prueba ya existen. Eliminando duplicados...');
      await collection.deleteMany({
        slug: { $in: testCopies.map(copy => copy.slug) }
      });
    }
    
    // Insertar los nuevos copys
    const result = await collection.insertMany(testCopies);
    
    console.log(`✅ Se agregaron ${result.insertedCount} copys de prueba`);
    
    // Mostrar estadísticas
    const stats = {};
    testCopies.forEach(copy => {
      stats[copy.language] = (stats[copy.language] || 0) + 1;
    });
    
    console.log('\n📊 Estadísticas por idioma:');
    Object.entries(stats).forEach(([lang, count]) => {
      console.log(`   ${lang.toUpperCase()}: ${count} copys`);
    });
    
    console.log('\n🎯 Copys agregados:');
    testCopies.forEach(copy => {
      console.log(`   • ${copy.slug} (${copy.language}) - "${copy.text}"`);
    });
    
    console.log('\n✨ ¡Datos de prueba listos! Ahora puedes probar el panel de developer.');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  addTestCopies();
}

module.exports = { addTestCopies };
