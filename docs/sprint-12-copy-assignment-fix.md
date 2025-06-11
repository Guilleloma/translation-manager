# Sprint 12: Corrección de la Lógica de Asignación de Copys

## Problema Resuelto: Lógica Invertida en Asignación de Copys

### Descripción del Bug
- Al agregar un Copy con texto en español, no aparecía en la sección de asignación para los idiomas que necesitaban traducción
- La lógica mostraba copys **EN** el idioma seleccionado, en lugar de mostrar copys que **NECESITAN** traducción a ese idioma
- La columna "Texto" no mostraba una referencia clara del texto original en español

### Causa Raíz
1. **Lógica Invertida**: Se filtraban copys por `copy.language === selectedLanguage` cuando debería mostrar los que no tienen traducción al idioma seleccionado
2. **Falta de Referencia**: No se mostraba el texto en español como referencia para los traductores

### Solución Implementada

#### 1. Nueva Lógica de Filtrado
```typescript
// Agrupar copys por slug para encontrar qué traducciones faltan
const copysBySlug = copys.reduce((acc, copy) => {
  if (!acc[copy.slug]) {
    acc[copy.slug] = [];
  }
  acc[copy.slug].push(copy);
  return acc;
}, {} as Record<string, typeof copys>);

// Para cada slug, verificar si falta la traducción al idioma seleccionado
for (const [slug, copies] of Object.entries(copysBySlug)) {
  // Buscar la traducción en español (referencia)
  const spanishCopy = copies.find(copy => copy.language === 'es');
  
  // Buscar si ya existe traducción al idioma seleccionado
  const targetLanguageCopy = copies.find(copy => copy.language === selectedLanguage);
  
  // Si hay texto en español y NO existe traducción al idioma seleccionado,
  // o si existe pero está sin asignar, incluirlo en la lista
  if (spanishCopy && (!targetLanguageCopy || targetLanguageCopy.status === 'not_assigned')) {
    // Añadir a la lista de pendientes
  }
}
```

#### 2. Cambio en la Interfaz
- Renombrada la columna "Texto" a "Texto ES" para clarificar que siempre muestra el texto en español
- Se muestra siempre el texto original en español como referencia para los traductores

#### 3. Mejora en la Asignación
- Ahora se crean automáticamente nuevos copys cuando se asignan traducciones que no existían previamente
- Se distingue entre copys existentes sin asignar y copys completamente nuevos

### Tests Creados
- `CopyAssignment.test.tsx` - Tests unitarios para validar la nueva lógica
- Pruebas para verificar que se muestran correctamente los textos pendientes de traducción
- Pruebas para verificar que se muestra el texto en español como referencia

### Resultado
✅ Al agregar un Copy en español, ahora aparece correctamente como pendiente en todos los demás idiomas
✅ Los traductores siempre ven el texto original en español como referencia
✅ La interfaz es más clara con la columna "Texto ES"
✅ El proceso de asignación es más intuitivo y funciona según lo esperado

### Archivos Modificados
- `src/components/assignment/CopyAssignment.tsx` - Lógica principal de filtrado y asignación
- Tests creados para validar la solución
