// Script para forzar la restauración de los datos de prueba
// Ejecutar este script para asegurarse de que los nuevos usuarios y roles estén disponibles

// Importar los datos de prueba
const { seedUsers, seedCopys } = require('./seedData');

// Función para forzar la restauración de los datos
function forceReset() {
  console.log('🔄 Forzando restauración de datos de prueba...');
  
  // Guardar usuario actual antes de resetear (si existe)
  const currentUser = localStorage.getItem('user');
  
  // Resetear datos
  localStorage.setItem('users', JSON.stringify(seedUsers));
  localStorage.setItem('copys', JSON.stringify(seedCopys));
  
  // Restaurar usuario actual si existe
  if (currentUser) {
    localStorage.setItem('user', currentUser);
  }
  
  console.log('✅ Datos restaurados correctamente');
  console.log(`📊 Usuarios: ${seedUsers.length}`);
  console.log(`📝 Copys: ${seedCopys.length}`);
  
  // Mostrar los usuarios disponibles
  console.log('\n👤 Usuarios disponibles:');
  seedUsers.forEach(user => {
    console.log(`- ${user.username} (${user.email}) - Rol: ${user.role}`);
  });
}

// Ejecutar la función
forceReset();

// Exportar la función para poder usarla desde otros archivos
module.exports = { forceReset };
