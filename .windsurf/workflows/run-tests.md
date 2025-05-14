---
description: Ejecutar la validación completa del proyecto
---

# Validación de Testing y Exportación JSON

Este workflow ejecuta todas las validaciones configuradas en el proyecto, incluyendo:
- Linting de código
- Pruebas unitarias
- Validación de estructura JSON i18n para evitar conflictos de slugs

## Pasos

// turbo-all
1. Ejecutar validación completa:
   ```bash
   npm run validate
   ```

2. Validar solo la estructura de JSON:
   ```bash
   npm run validate:json
   ```

## Notas importantes

- La validación se debe ejecutar antes de cualquier PR o merge.
- Los slugs conflictivos (por ejemplo, "button" y "button.crear") se marcarán con un icono ⚠️ en la tabla.
- Para resolver conflictos de slugs, considera usar alguna de estas opciones:
  - Usar una convención como "button._self" para valores directos
  - Evitar usar slugs raíz que sean prefijos de otros slugs
  - Asegurarte de que la validación JSON pase sin conflictos

## Resolución de problemas

Si experimentas errores:

1. Revisa la consola para mensajes detallados
2. Comprueba si hay conflictos de slugs
3. Asegúrate de que todos los slugs son únicos por combinación de slug+idioma
