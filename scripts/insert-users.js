const { MongoClient } = require('mongodb');

const users = [
  {
    username: 'Admin Demo',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    languages: ['es', 'en', 'fr', 'de', 'it', 'pt'],
  },
  {
    username: 'Revisor Principal',
    email: 'reviewer@example.com',
    password: 'reviewer123',
    role: 'reviewer',
    languages: ['es', 'en'],
  },
  {
    username: 'Desarrollador',
    email: 'dev@example.com',
    password: 'dev123',
    role: 'developer',
    languages: ['en'],
  },
  {
    username: 'Ana López (EN-FR)',
    email: 'ana@example.com',
    password: 'translator123',
    role: 'translator',
    languages: ['en', 'fr'],
  },
  {
    username: 'María García (ES-IT)',
    email: 'maria@example.com',
    password: 'translator123',
    role: 'translator',
    languages: ['es', 'it'],
  },
  {
    username: 'John Smith (EN-DE)',
    email: 'john@example.com',
    password: 'translator123',
    role: 'translator',
    languages: ['en', 'de'],
  },
  {
    username: 'Sophie Martin (FR-PT)',
    email: 'sophie@example.com',
    password: 'translator123',
    role: 'translator',
    languages: ['fr', 'pt'],
  },
];

async function insertUsers() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB');
    
    const db = client.db('translation-manager');
    const collection = db.collection('users');
    
    // Verificar si ya existen usuarios
    const existingCount = await collection.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Ya existen ${existingCount} usuarios. Eliminando todos primero...`);
      await collection.deleteMany({});
    }
    
    // Insertar usuarios
    const result = await collection.insertMany(users);
    console.log(`✅ ${result.insertedCount} usuarios insertados exitosamente`);
    
    // Mostrar usuarios creados
    console.log('\n📋 Usuarios creados:');
    users.forEach(user => {
      console.log(`   - ${user.username} (${user.role}) - ${user.email}`);
    });
    
    console.log('\n🎉 ¡Listo! Ahora puedes hacer login con cualquiera de estos usuarios.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

insertUsers();
