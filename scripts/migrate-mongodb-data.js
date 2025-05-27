/**
 * Script mejorado para migrar datos a MongoDB con feedback detallado
 * 
 * Ejecutar: node scripts/migrate-mongodb-data.js
 */

require('dotenv').config();
const { 
  migrateAllSeedDataToMongoDB, 
  checkMigrationStatus, 
  clearAllMongoDBData 
} = require('../dist/services/seedMigration');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Función para mostrar el progreso
function showProgress(step, total, message) {
  const percent = Math.round((step / total) * 100);
  const bar = '█'.repeat(Math.floor(percent / 2)) + '░'.repeat(50 - Math.floor(percent / 2));
  process.stdout.write(`\r${colors.cyan}[${bar}] ${percent}% ${colors.reset}${message}`);
}

// Función para mostrar mensajes con formato
function log(type, message) {
  const timestamp = new Date().toLocaleTimeString();
  let prefix = '';
  
  switch (type) {
    case 'info':
      prefix = `${colors.blue}[INFO]${colors.reset}`;
      break;
    case 'success':
      prefix = `${colors.green}[ÉXITO]${colors.reset}`;
      break;
    case 'error':
      prefix = `${colors.red}[ERROR]${colors.reset}`;
      break;
    case 'warning':
      prefix = `${colors.yellow}[AVISO]${colors.reset}`;
      break;
    case 'step':
      prefix = `${colors.magenta}[PASO]${colors.reset}`;
      break;
    default:
      prefix = `${colors.cyan}[LOG]${colors.reset}`;
  }
  
  console.log(`${prefix} ${colors.bright}${timestamp}${colors.reset} ${message}`);
}

// Función principal
async function main() {
  try {
    log('info', 'Iniciando proceso de migración a MongoDB...');
    
    // Verificar estado inicial
    log('step', 'Verificando estado actual de la base de datos...');
    const initialStatus = await checkMigrationStatus();
    
    if (initialStatus.usersCount > 0 || initialStatus.copysCount > 0) {
      log('warning', `La base de datos ya contiene datos: ${initialStatus.usersCount} usuarios y ${initialStatus.copysCount} copys.`);
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      return new Promise((resolve) => {
        readline.question(`${colors.yellow}¿Desea limpiar la base de datos antes de migrar? (s/n): ${colors.reset}`, async (answer) => {
          readline.close();
          
          if (answer.toLowerCase() === 's') {
            log('step', 'Limpiando base de datos...');
            await clearAllMongoDBData();
            log('success', 'Base de datos limpiada correctamente.');
            await runMigration();
          } else {
            log('info', 'Continuando sin limpiar la base de datos...');
            await runMigration();
          }
          resolve();
        });
      });
    } else {
      log('info', 'Base de datos vacía, procediendo con la migración...');
      await runMigration();
    }
  } catch (error) {
    log('error', `Error durante la migración: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Función para ejecutar la migración con feedback
async function runMigration() {
  log('step', 'Iniciando migración de datos semilla...');
  
  // Interceptar console.log para mostrar progreso
  const originalLog = console.log;
  console.log = function() {
    // Filtrar mensajes de progreso
    const message = arguments[0];
    if (typeof message === 'string') {
      if (message.includes('Iniciando migración')) {
        log('info', message.replace('🔄', '').trim());
      } else if (message.includes('migrados exitosamente')) {
        log('success', message.replace('✅', '').trim());
      } else if (message.includes('Ya existen')) {
        log('warning', message.replace('⚠️', '').trim());
      } else if (message.includes('Error')) {
        log('error', message.replace('❌', '').trim());
      } else if (message.includes('Estadísticas')) {
        log('info', message.replace('📊', '').trim());
      } else if (message.includes('Migración completa')) {
        log('success', message.replace('🎉', '').trim());
      } else {
        originalLog.apply(console, arguments);
      }
    } else {
      originalLog.apply(console, arguments);
    }
  };
  
  // Ejecutar migración
  const startTime = Date.now();
  await migrateAllSeedDataToMongoDB();
  const endTime = Date.now();
  
  // Restaurar console.log
  console.log = originalLog;
  
  // Verificar estado final
  log('step', 'Verificando estado final de la base de datos...');
  const finalStatus = await checkMigrationStatus();
  
  // Mostrar resumen
  log('success', `Migración completada en ${((endTime - startTime) / 1000).toFixed(2)} segundos.`);
  log('info', '📊 Resumen de la migración:');
  console.log(`   - Usuarios: ${finalStatus.usersCount}`);
  console.log(`   - Copys: ${finalStatus.copysCount}`);
  console.log(`   - Estado: ${finalStatus.isComplete ? colors.green + 'Completo' + colors.reset : colors.yellow + 'Incompleto' + colors.reset}`);
  
  // Instrucciones finales
  console.log('\n' + colors.bright + '🚀 Próximos pasos:' + colors.reset);
  console.log('1. Inicia la aplicación con: ' + colors.cyan + 'npm run dev:mongodb' + colors.reset);
  console.log('2. Verifica la integración en la interfaz de usuario');
  console.log('3. Para ejecutar tests: ' + colors.cyan + 'npm run test:mongodb' + colors.reset);
  
  process.exit(0);
}

// Ejecutar la función principal
main().catch(error => {
  console.error(`${colors.red}[ERROR FATAL]${colors.reset} ${error.message}`);
  console.error(error.stack);
  process.exit(1);
});
