/**
 * Script para corregir problemas de validación de idiomas en la importación de copys
 * 
 * Este script soluciona dos problemas principales:
 * 1. Errores de validación de idioma (códigos no válidos)
 * 2. Manejo de duplicados durante la importación
 */

const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');

// Configuración de MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || 'translation-manager';

// Mapa de códigos de idioma válidos
const VALID_LANGUAGE_CODES = {
  'en': 'en', 'en_US': 'en', 'en_GB': 'en', 'english': 'en',
  'es': 'es', 'es_ES': 'es', 'spanish': 'es', 'español': 'es',
  'fr': 'fr', 'fr_FR': 'fr', 'french': 'fr', 'français': 'fr',
  'de': 'de', 'de_DE': 'de', 'german': 'de', 'deutsch': 'de',
  'it': 'it', 'it_IT': 'it', 'italian': 'it', 'italiano': 'it',
  'pt': 'pt', 'pt_PT': 'pt', 'pt_BR': 'pt', 'portuguese': 'pt', 'português': 'pt'
};

async function connectToMongoDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Conectado a MongoDB exitosamente');
    return client;
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error);
    throw error;
  }
}

async function fixLanguageCodes() {
  let client;
  try {
    client = await connectToMongoDB();
    const db = client.db(DB_NAME);
    const copysCollection = db.collection('copys');
    
    // 1. Encontrar copys con códigos de idioma no válidos
    const allCopys = await copysCollection.find({}).toArray();
    console.log(`📊 Total de copys encontrados: ${allCopys.length}`);
    
    let invalidLanguageCopys = 0;
    let updatedCopys = 0;
    
    // 2. Corregir códigos de idioma no válidos
    for (const copy of allCopys) {
      const originalLang = copy.language;
      
      // Verificar si el idioma necesita corrección
      if (originalLang && (originalLang.length > 3 || !VALID_LANGUAGE_CODES[originalLang.toLowerCase()])) {
        invalidLanguageCopys++;
        
        // Intentar mapear a un código válido
        const normalizedLang = originalLang.toLowerCase();
        const validLang = VALID_LANGUAGE_CODES[normalizedLang];
        
        if (validLang) {
          // Actualizar el copy con el código de idioma válido
          const result = await copysCollection.updateOne(
            { _id: copy._id },
            { $set: { language: validLang } }
          );
          
          if (result.modifiedCount > 0) {
            updatedCopys++;
            console.log(`✅ Corregido: "${originalLang}" -> "${validLang}" para slug "${copy.slug}"`);
          }
        } else {
          console.log(`⚠️ No se pudo corregir el idioma "${originalLang}" para slug "${copy.slug}"`);
        }
      }
    }
    
    // 3. Generar informe
    console.log('\n📊 INFORME DE CORRECCIÓN:');
    console.log(`Total de copys procesados: ${allCopys.length}`);
    console.log(`Copys con idiomas inválidos: ${invalidLanguageCopys}`);
    console.log(`Copys corregidos: ${updatedCopys}`);
    
    // 4. Verificar duplicados
    const duplicateReport = await checkDuplicates(copysCollection);
    
    // 5. Guardar informe en un archivo
    const report = {
      timestamp: new Date().toISOString(),
      totalCopys: allCopys.length,
      invalidLanguageCopys,
      updatedCopys,
      duplicates: duplicateReport
    };
    
    await fs.writeFile(
      path.join(process.cwd(), 'language-validation-report.json'),
      JSON.stringify(report, null, 2)
    );
    console.log('✅ Informe guardado en language-validation-report.json');
    
  } catch (error) {
    console.error('❌ Error al procesar copys:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('📡 Conexión a MongoDB cerrada');
    }
  }
}

async function checkDuplicates(collection) {
  console.log('\n🔍 Verificando duplicados por combinación slug+idioma...');
  
  // Agrupar por slug+idioma y contar
  const pipeline = [
    {
      $group: {
        _id: { slug: "$slug", language: "$language" },
        count: { $sum: 1 },
        ids: { $push: "$_id" }
      }
    },
    {
      $match: { count: { $gt: 1 } }
    },
    {
      $sort: { count: -1 }
    }
  ];
  
  const duplicates = await collection.aggregate(pipeline).toArray();
  console.log(`🔍 Se encontraron ${duplicates.length} combinaciones slug+idioma duplicadas`);
  
  // Crear informe detallado
  const duplicateReport = [];
  
  for (const dup of duplicates) {
    const { slug, language } = dup._id;
    console.log(`⚠️ Duplicado: "${slug}" [${language}] - ${dup.count} copias`);
    
    // Obtener detalles de los duplicados
    const details = await collection.find({
      slug: slug,
      language: language
    }).toArray();
    
    duplicateReport.push({
      slug,
      language,
      count: dup.count,
      details: details.map(d => ({
        id: d._id.toString(),
        text: d.text,
        createdAt: d.createdAt
      }))
    });
  }
  
  return duplicateReport;
}

// Ejecutar el script
fixLanguageCodes()
  .then(() => console.log('✅ Proceso completado'))
  .catch(err => console.error('❌ Error en el proceso:', err));
