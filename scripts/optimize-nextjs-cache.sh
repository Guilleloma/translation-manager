#!/bin/bash

# Script para optimizar el rendimiento de Next.js
# Este script implementa varias técnicas para mejorar los tiempos de compilación y navegación

echo "🚀 Iniciando optimización de Next.js..."

# Verificar si estamos en la raíz del proyecto
if [ ! -f "package.json" ]; then
  echo "❌ Error: Este script debe ejecutarse desde la raíz del proyecto"
  exit 1
fi

# 1. Limpiar caché de Next.js
echo "🧹 Limpiando caché de Next.js..."
rm -rf .next/cache

# 2. Optimizar node_modules
echo "📦 Optimizando node_modules..."
npm dedupe

# 3. Verificar y actualizar configuración de Next.js
echo "⚙️ Verificando configuración de Next.js..."

# Crear archivo de configuración optimizado si no existe
if ! grep -q "swcMinify" next.config.ts; then
  echo "✏️ Actualizando next.config.ts con optimizaciones..."
  
  # Hacer backup del archivo original
  cp next.config.ts next.config.ts.bak
  
  # Reemplazar configuración
  cat > next.config.ts << EOL
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@chakra-ui/react'],
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
EOL
  echo "✅ Configuración de Next.js actualizada"
else
  echo "✅ Configuración de Next.js ya contiene optimizaciones"
fi

# 4. Crear archivo .env.local con optimizaciones si no existe
if [ ! -f ".env.local" ] || ! grep -q "NEXT_TELEMETRY_DISABLED" .env.local; then
  echo "✏️ Creando archivo .env.local con optimizaciones..."
  
  echo "NEXT_TELEMETRY_DISABLED=1" >> .env.local
  echo "NEXT_RUNTIME_OPTIMIZE=1" >> .env.local
  
  echo "✅ Archivo .env.local actualizado"
else
  echo "✅ Archivo .env.local ya contiene optimizaciones"
fi

# 5. Crear script de desarrollo optimizado
echo "📝 Creando script de desarrollo optimizado..."

# Actualizar package.json para incluir el script optimizado
if ! grep -q "\"dev:optimized\":" package.json; then
  # Hacer backup del archivo original
  cp package.json package.json.bak
  
  # Insertar nuevo script antes de la línea "dev:mongodb"
  sed -i '' '/\"dev:mongodb\"/i\
    "dev:optimized": "NEXT_RUNTIME_OPTIMIZE=1 next dev --turbopack",
' package.json
  
  echo "✅ Script dev:optimized añadido a package.json"
else
  echo "✅ Script dev:optimized ya existe en package.json"
fi

# 6. Crear script combinado optimizado + mongodb
if ! grep -q "\"dev:optimized:mongodb\":" package.json; then
  # Insertar nuevo script después de la línea "dev:optimized"
  sed -i '' '/\"dev:optimized\"/a\
    "dev:optimized:mongodb": "npm run mongodb:check && NEXT_RUNTIME_OPTIMIZE=1 next dev --turbopack",
' package.json
  
  echo "✅ Script dev:optimized:mongodb añadido a package.json"
else
  echo "✅ Script dev:optimized:mongodb ya existe en package.json"
fi

echo "🎉 Optimización completada. Para ejecutar la aplicación con optimizaciones, usa:"
echo "   npm run dev:optimized:mongodb"
echo ""
echo "📊 Estas optimizaciones deberían reducir significativamente los tiempos de compilación y navegación"
