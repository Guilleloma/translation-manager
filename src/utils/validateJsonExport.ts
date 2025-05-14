/**
 * Utilidad para validar la estructura del JSON de exportación i18n
 * Detecta posibles conflictos entre slugs raíz y slugs con el mismo prefijo
 */

import { Copy } from '../types/copy';

interface ValidationResult {
  valid: boolean;
  conflicts: ConflictInfo[];
}

interface ConflictInfo {
  slug: string;
  conflictsWith: string[];
  type: 'root-prefix' | 'prefix-root';
}

/**
 * Valida un conjunto de copys para detectar conflictos que causarían problemas al exportar a JSON
 * @param copys Array de objetos Copy para analizar
 * @returns Resultado de validación con conflictos detectados
 */
export function validateCopysForExport(copys: Copy[]): ValidationResult {
  const slugs = copys.map(c => c.slug);
  const uniqueSlugs = Array.from(new Set(slugs));
  const conflicts: ConflictInfo[] = [];

  // Verificar cada slug contra todos los demás
  uniqueSlugs.forEach(slug => {
    // Buscar slugs que podrían entrar en conflicto (uno es prefijo del otro)
    const conflictingSlugs = uniqueSlugs.filter(
      otherSlug => 
        slug !== otherSlug && 
        (otherSlug.startsWith(slug + '.') || slug.startsWith(otherSlug + '.'))
    );

    if (conflictingSlugs.length > 0) {
      conflicts.push({
        slug,
        conflictsWith: conflictingSlugs,
        type: slug.includes('.') ? 'prefix-root' : 'root-prefix'
      });
    }
  });

  return {
    valid: conflicts.length === 0,
    conflicts
  };
}

/**
 * Simula la estructura anidada de un objeto JSON a partir de copys
 * @param copys Array de objetos Copy para procesar
 * @returns Estructura de datos simulada (como string con formato JSON)
 */
export function generateJsonPreview(copys: Copy[]): string {
  const byLanguage: Record<string, Record<string, unknown>> = {};
  
  copys.forEach(copy => {
    if (!byLanguage[copy.language]) {
      byLanguage[copy.language] = {};
    }
    
    const slugParts = copy.slug.split('.');
    let current = byLanguage[copy.language];
    
    // Recorrer todos los segmentos del path excepto el último
    for (let i = 0; i < slugParts.length - 1; i++) {
      const key = slugParts[i];
      // Si la propiedad no existe o no es un objeto, sobrescribir
      // Aquí está el problema: si 'button' ya es un string, no puede ser un objeto
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    const lastKey = slugParts[slugParts.length - 1];
    current[lastKey] = copy.text;
  });
  
  return JSON.stringify(byLanguage, null, 2);
}

/**
 * Detecta posibles problemas en la estructura anidada simulada y da recomendaciones
 * @param jsonPreview Estructura generada por generateJsonPreview
 * @returns Mensaje con análisis y recomendaciones
 */
export function analyzeJsonStructure(jsonPreview: string): string {
  try {
    const json = JSON.parse(jsonPreview);
    const languages = Object.keys(json);
    const warnings: string[] = [];
    
    languages.forEach(lang => {
      // Buscar claves que podrían estar sobrescritas
      findOverwrittenKeys(json[lang], [], warnings);
    });
    
    if (warnings.length === 0) {
      return "✅ La estructura JSON parece correcta sin conflictos detectados";
    } else {
      return `⚠️ Se detectaron ${warnings.length} posibles conflictos:\n${warnings.join('\n')}`;
    }
    
  } catch (error) {
    return `Error al analizar la estructura JSON: ${error}`;
  }
}

/**
 * Función auxiliar para encontrar claves sobrescritas en la estructura
 */
function findOverwrittenKeys(obj: Record<string, unknown>, path: string[], warnings: string[]): void {
  if (typeof obj !== 'object' || obj === null) return;
  
  Object.keys(obj).forEach(key => {
    const newPath = [...path, key];
    const fullPath = newPath.join('.');
    
    if (typeof obj[key] === 'string' && Object.keys(obj).some(k => 
      k !== key && k.startsWith(key + '.') || key.startsWith(k + '.')
    )) {
      warnings.push(`  - Conflicto en "${fullPath}": Es un valor pero también un prefijo de otra clave`);
    } else if (typeof obj[key] === 'object') {
      findOverwrittenKeys(obj[key], newPath, warnings);
    }
  });
}
