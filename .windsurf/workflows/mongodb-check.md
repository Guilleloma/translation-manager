---
description: Verificar que MongoDB esté ejecutándose antes de iniciar la aplicación
---

# Verificación de MongoDB

Este workflow asegura que MongoDB esté ejecutándose antes de iniciar la aplicación. Es importante ejecutarlo siempre que vayamos a trabajar con la integración de MongoDB.

## Pasos

1. Verificar si MongoDB está ejecutándose:
```bash
mongosh --eval "db.adminCommand('ping')" || echo "MongoDB no está ejecutándose"
```

2. Si MongoDB no está ejecutándose, iniciarlo:
```bash
# En macOS con Homebrew
brew services start mongodb-community
# O si usas MongoDB Community Edition instalado manualmente
mongod --dbpath /usr/local/var/mongodb --logpath /usr/local/var/log/mongodb/mongo.log --fork
```

3. Verificar nuevamente que MongoDB esté ejecutándose:
```bash
mongosh --eval "db.adminCommand('ping')"
```

4. Iniciar la aplicación con soporte para MongoDB:
```bash
npm run dev
```

## Solución de problemas

Si encuentras errores al iniciar MongoDB:

1. Verifica que MongoDB esté instalado correctamente:
```bash
mongosh --version
```

2. Asegúrate de que el directorio de datos exista:
```bash
mkdir -p /usr/local/var/mongodb
```

3. Verifica los logs para identificar problemas:
```bash
cat /usr/local/var/log/mongodb/mongo.log
```

4. Si MongoDB se cierra inesperadamente, puede haber un problema con los permisos o con archivos de bloqueo:
```bash
# Eliminar archivo de bloqueo (usar con precaución)
rm /usr/local/var/mongodb/mongod.lock
# Reparar la base de datos
mongod --repair --dbpath /usr/local/var/mongodb
```

## Notas importantes

- La aplicación requiere MongoDB 4.4+ para funcionar correctamente
- El URI de conexión predeterminado es `mongodb://localhost:27017/translation-manager`
- Para entornos de prueba, se usa `mongodb://localhost:27017/translation-manager-test`
