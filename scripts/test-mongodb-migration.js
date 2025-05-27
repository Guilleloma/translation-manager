/**
 * Script para probar la migración de datos a MongoDB
 * 
 * Uso:
 * - Ejecutar: node scripts/test-mongodb-migration.js
 * - Opciones:
 *   - check: Verificar el estado de la migración
 *   - migrate: Migrar datos a MongoDB
 *   - clear: Limpiar todos los datos
 * 
 * Ejemplo:
 *   node scripts/test-mongodb-migration.js migrate
 */

// Importar las funciones necesarias
require('dotenv').config();
const { 
  migrateAllSeedDataToMongoDB, 
  checkMigrationStatus, 
  clearAllMongoDBData 
} = require('../dist/services/seedMigration');

// Función para manejar errores
const handleError = (error) => {
  console.error('\n❌ Error:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
};

// Función principal
async function main() {
  const command = process.argv[2] || 'check';
  
  try {
    console.log('🔄 Ejecutando comando:', command);
    
    switch (command) {
      case 'check':
        console.log('📊 Verificando estado de la migración...');
        const status = await checkMigrationStatus();
        console.log('\nEstado actual:');
        console.log('- Usuarios:', status.usersCount);
        console.log('- Copys:', status.copysCount);
        console.log('- Migración completa:', status.isComplete ? 'Sí ✅' : 'No ❌');
        break;
        
      case 'migrate':
        console.log('🚀 Iniciando migración de datos...');
        await migrateAllSeedDataToMongoDB();
        console.log('\n✅ Migración completada');
        
        // Verificar el estado después de la migración
        const migrationStatus = await checkMigrationStatus();
        console.log('\nEstado después de la migración:');
        console.log('- Usuarios:', migrationStatus.usersCount);
        console.log('- Copys:', migrationStatus.copysCount);
        console.log('- Migración completa:', migrationStatus.isComplete ? 'Sí ✅' : 'No ❌');
        break;
        
      case 'clear':
        console.log('🧹 Limpiando todos los datos...');
        await clearAllMongoDBData();
        console.log('\n✅ Datos eliminados correctamente');
        break;
        
      default:
        console.error('❌ Comando no reconocido. Opciones válidas: check, migrate, clear');
        process.exit(1);
    }
    
    process.exit(0);
  } catch (error) {
    handleError(error);
  }
}

// Ejecutar la función principal
main();
