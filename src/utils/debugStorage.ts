/**
 * Utilidad para depurar el estado del almacenamiento local
 * Ayuda a verificar el contenido de localStorage para debugging
 */

import dataService from '../services/dataService';

export function debugStorage() {
  console.log('=== DEBUG STORAGE ===');
  
  // Usar el servicio de datos para obtener información
  dataService.debug();
  
  // También mostrar información raw de localStorage para comparación
  console.log('\n=== RAW LOCALSTORAGE ===');
  const copysStr = localStorage.getItem('copys');
  const usersStr = localStorage.getItem('users');
  
  if (copysStr) {
    try {
      const copys = JSON.parse(copysStr);
      console.log(`📋 Copys en localStorage: ${copys.length}`);
      
      if (copys.length > 0) {
        console.log('Primeros 3 copys:');
        copys.slice(0, 3).forEach((copy: any, index: number) => {
          console.log(`  ${index + 1}. ${copy.slug} [${copy.language}] - ${copy.status}`);
        });
      }
    } catch (error) {
      console.error('❌ Error al parsear copys:', error);
    }
  } else {
    console.log('📋 No hay copys en localStorage');
  }
  
  if (usersStr) {
    try {
      const users = JSON.parse(usersStr);
      console.log(`👥 Usuarios en localStorage: ${users.length}`);
    } catch (error) {
      console.error('❌ Error al parsear usuarios:', error);
    }
  } else {
    console.log('👥 No hay usuarios en localStorage');
  }
  
  console.log('=======================');
}

export function reloadCopys() {
  console.log('🔄 Forzando recarga de copys...');
  dataService.refreshData();
}

// Hacer las funciones disponibles globalmente para debugging
if (typeof window !== 'undefined') {
  (window as any).debugStorage = debugStorage;
  (window as any).reloadCopys = reloadCopys;
}
