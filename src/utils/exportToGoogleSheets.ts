/**
 * Utilidad para exportar copys en formato compatible con Google Sheets
 * Genera un archivo CSV con estructura plana: una fila por slug y columnas por idioma
 */

import { Copy } from '../types/copy';

// Tipo para mapear los slugs a sus textos por idioma
type SlugTranslations = {
  slug: string;
  translations: {
    [languageCode: string]: string;
  };
};

/**
 * Convierte un array de copys en una estructura plana organizada por slugs e idiomas
 * @param copys Los copys a convertir
 * @returns Array de objetos con slug y sus traducciones por idioma
 */
export function prepareCopysForGoogleSheets(copys: Copy[]): SlugTranslations[] {
  // Paso 1: Agrupar copys por slug
  const slugMap: Record<string, SlugTranslations> = {};
  
  // Inicializar el mapa
  copys.forEach(copy => {
    if (!slugMap[copy.slug]) {
      slugMap[copy.slug] = {
        slug: copy.slug,
        translations: {}
      };
    }
    
    // Mapear el idioma al formato específico solicitado (ej: "es" -> "es_ES")
    const languageMap: { [key: string]: string } = {
      'es': 'es_ES',
      'en': 'en_GB', // Usando en_GB como predeterminado para inglés
      'it': 'it_IT',
      'en-us': 'en_US',
      'de': 'de_DE',
      'fr': 'fr_FR',
      'pt': 'pt_PT',
      'pt-br': 'pt_BR'
    };
    
    // Obtener el código de idioma formateado, o usar el original si no está mapeado
    const languageCode = languageMap[copy.language] || copy.language;
    
    // Guardar la traducción
    slugMap[copy.slug].translations[languageCode] = copy.text;
  });
  
  // Paso 2: Convertir el mapa a un array para el CSV
  return Object.values(slugMap);
}

/**
 * Genera el contenido CSV a partir de un array de copys
 * @param copys Array de objetos Copy para procesar
 * @param languages Array de códigos de idioma a incluir en el CSV
 * @returns Contenido en formato CSV
 */
export function generateCSVContent(copys: Copy[], languages: string[] = ['en_GB', 'es_ES', 'it_IT', 'en_US', 'de_DE', 'fr_FR', 'pt_PT', 'pt_BR']): string {
  // Aseguramos que las columnas estén exactamente en el orden especificado
  const orderedLanguages = ['en_GB', 'es_ES', 'it_IT', 'en_US', 'de_DE', 'fr_FR', 'pt_PT', 'pt_BR'].filter(lang => languages.includes(lang));
  
  // Añadimos cualquier idioma adicional que pudiera estar en 'languages' pero no en nuestro orden predefinido
  languages.forEach(lang => {
    if (!orderedLanguages.includes(lang)) {
      orderedLanguages.push(lang);
    }
  });
  
  // Usamos los idiomas ordenados en lugar del parámetro original
  // Preparar datos
  const data = prepareCopysForGoogleSheets(copys);
  
  // Generar encabezados
  const headers = ['slug', ...orderedLanguages];
  
  // Log para debug
  console.log('🔢 Orden de columnas para Google Sheets:', headers);
  
  // Generar filas
  const rows = data.map(item => {
    const row = [item.slug];
    
    // Añadir una columna por cada idioma en el orden especificado
    orderedLanguages.forEach(lang => {
      // Escapar comas, comillas, etc. para formato CSV
      const text = item.translations[lang] || '';
      row.push(`"${text.replace(/"/g, '""')}"`);  // Escapar comillas duplicándolas
    });
    
    return row.join(',');
  });
  
  // Combinar encabezados y filas
  return [headers.join(','), ...rows].join('\n');
}

/**
 * Descarga un archivo CSV con formato para Google Sheets
 * @param copys Array de objetos Copy para procesar
 * @param languages Array de códigos de idioma a incluir en el CSV
 * @param fileName Nombre del archivo a descargar
 */
export function downloadGoogleSheetsCSV(copys: Copy[], languages: string[] = ['en_GB', 'es_ES', 'it_IT', 'en_US', 'de_DE', 'fr_FR', 'pt_PT', 'pt_BR'], fileName: string = 'translations_for_google_sheets.csv'): void {
  // Log para debugging
  console.log('📊 Exportando a Google Sheets', {
    totalCopys: copys.length,
    languages,
    fileName
  });

  // Generar contenido CSV
  const csvContent = generateCSVContent(copys, languages);
  
  // Crear Blob
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  // Crear enlace de descarga
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  
  // Añadir al DOM, hacer clic y limpiar
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Liberar URL
  URL.revokeObjectURL(url);
}
