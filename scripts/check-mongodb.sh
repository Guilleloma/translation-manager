#!/bin/bash

# Script para verificar y arrancar MongoDB si es necesario
# Uso: ./scripts/check-mongodb.sh

echo "🔍 Verificando si MongoDB está ejecutándose..."

# Intentar conectar a MongoDB
if mongosh --eval "db.adminCommand('ping')" &>/dev/null; then
    echo "✅ MongoDB está ejecutándose correctamente."
else
    echo "❌ MongoDB no está ejecutándose."
    echo "🚀 Intentando iniciar MongoDB..."
    
    # Intentar iniciar MongoDB con Homebrew (macOS)
    if command -v brew &>/dev/null && brew list mongodb-community &>/dev/null; then
        brew services start mongodb-community
        echo "🍺 Iniciando MongoDB con Homebrew..."
        sleep 2
    # Intentar iniciar MongoDB manualmente
    elif command -v mongod &>/dev/null; then
        echo "🔧 Iniciando MongoDB manualmente..."
        # Crear directorio de datos si no existe
        mkdir -p /usr/local/var/mongodb
        mkdir -p /usr/local/var/log/mongodb
        
        # Iniciar MongoDB en segundo plano
        mongod --dbpath /usr/local/var/mongodb --logpath /usr/local/var/log/mongodb/mongo.log --fork
        sleep 2
    else
        echo "❓ No se pudo detectar una instalación de MongoDB."
        echo "📋 Por favor, instala MongoDB manualmente:"
        echo "   - macOS: brew install mongodb-community"
        echo "   - Linux: sudo apt install mongodb"
        echo "   - Windows: Descarga el instalador desde https://www.mongodb.com/try/download/community"
        exit 1
    fi
    
    # Verificar nuevamente
    if mongosh --eval "db.adminCommand('ping')" &>/dev/null; then
        echo "✅ MongoDB se ha iniciado correctamente."
    else
        echo "❌ No se pudo iniciar MongoDB."
        echo "📋 Revisa los logs para más información:"
        echo "   - /usr/local/var/log/mongodb/mongo.log"
        exit 1
    fi
fi

echo "📊 Información de la base de datos:"
mongosh --eval "db.adminCommand('listDatabases')" | grep translation-manager

echo "🚀 Puedes iniciar la aplicación ahora con 'npm run dev'"
