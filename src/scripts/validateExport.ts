/**
 * Script para validar la exportación de JSON de i18n
 * Ejecutar con: npx ts-node src/scripts/validateExport.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Definir la interfaz Copy directamente aquí para evitar problemas de importación
type CopyStatus = 'pendiente' | 'traducido' | 'revisado' | 'aprobado';

interface Copy {
  id: string;
  slug: string;
  text: string;
  language: string;
  status: CopyStatus;
}

import { validateCopysForExport, generateJsonPreview, analyzeJsonStructure } from '../utils/validateJsonExport';

// Simular carga de datos (en un entorno real, esto vendría de una BD o archivo)
const mockCopys: Copy[] = [
  { id: '1', slug: 'button', text: 'Botón General', language: 'es', status: 'pendiente' },
  { id: '2', slug: 'button.crear', text: 'Crear', language: 'es', status: 'pendiente' },
  { id: '3', slug: 'button.cancelar', text: 'Cancelar', language: 'es', status: 'pendiente' },
  { id: '4', slug: 'button.save', text: 'Save', language: 'en', status: 'pendiente' },
  { id: '5', slug: 'menu', text: 'Menú', language: 'es', status: 'pendiente' },
  { id: '6', slug: 'menu.file', text: 'Archivo', language: 'es', status: 'pendiente' },
];

// Función principal
async function main() {
  console.log('🔍 Validando estructura de JSON para i18n...');
  
  try {
    // Si existe un archivo 'copys.json' en la raíz, usarlo como fuente
    let copys = mockCopys;
    const copysPath = path.join(process.cwd(), 'copys.json');
    
    if (fs.existsSync(copysPath)) {
      console.log(`📄 Cargando datos desde ${copysPath}`);
      const data = fs.readFileSync(copysPath, 'utf8');
      copys = JSON.parse(data);
    } else {
      console.log('ℹ️ Usando datos de ejemplo. Crea un archivo copys.json para usar datos reales.');
    }
    
    // Validar los copys
    const validation = validateCopysForExport(copys);
    console.log('\n==== RESULTADOS DE VALIDACIÓN ====');
    
    if (validation.valid) {
      console.log('✅ No se encontraron conflictos potenciales entre slugs!');
    } else {
      console.log(`⚠️ Se encontraron ${validation.conflicts.length} posibles conflictos:`);
      
      validation.conflicts.forEach((conflict, i) => {
        console.log(`\n[Conflicto ${i+1}]`);
        console.log(`  Slug: "${conflict.slug}"`);
        console.log(`  Conflictos con: ${conflict.conflictsWith.map(s => `"${s}"`).join(', ')}`);
        console.log(`  Tipo: ${conflict.type === 'root-prefix' ? 
          'Este slug es raíz pero otros tienen este prefijo' : 
          'Este slug tiene como prefijo a otro slug'}`);
      });
      
      console.log('\n🧪 SIMULACIÓN DE ESTRUCTURA JSON:');
      const jsonPreview = generateJsonPreview(copys);
      console.log(jsonPreview);
      
      console.log('\n💡 ANÁLISIS DE LA ESTRUCTURA:');
      console.log(analyzeJsonStructure(jsonPreview));
      
      console.log('\n💌 RECOMENDACIONES:');
      console.log('1. Evita usar el mismo slug como valor y como prefijo (ej: "button" y "button.crear")');
      console.log('2. Si es necesario, usa una convención como "button._self" para el valor directo');
      console.log('3. O usa siempre la estructura completa, solo con slugs específicos (sin slugs raíz)');
    }
    
  } catch (error) {
    console.error('❌ Error al validar:', error);
    process.exit(1);
  }
}

// Ejecutar
main().catch(console.error);
