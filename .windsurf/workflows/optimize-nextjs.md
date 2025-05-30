---
description: Optimizar los tiempos de compilación y navegación de Next.js
---

# Optimización de Next.js

Este workflow permite optimizar los tiempos de compilación y navegación en la aplicación Translation Manager.

## Pasos para optimizar Next.js

1. Ejecutar el script de optimización para configurar automáticamente las mejoras:
// turbo
```bash
./scripts/optimize-nextjs-cache.sh
```

2. Iniciar la aplicación con el nuevo comando optimizado (incluye verificación de MongoDB):
```bash
npm run dev:optimized:mongodb
```

3. Para limpiar la caché de Next.js manualmente cuando sea necesario:
```bash
rm -rf .next/cache
```

## Beneficios de la optimización

- Reducción significativa en los tiempos de compilación
- Navegación más fluida entre páginas
- Mejor experiencia de desarrollo
- Optimización de importaciones de paquetes grandes (Chakra UI)
- Activación de optimizeCss para mejorar rendimiento

## Notas

- El script `optimize-nextjs-cache.sh` puede ejecutarse periódicamente para mantener el rendimiento óptimo
- La optimización incluye configuraciones específicas para Next.js 15.3.2 con Turbopack
- Si experimentas problemas después de la optimización, puedes restaurar la configuración original desde los archivos de backup (.bak)
