# Guía para probar la integración con MongoDB

## Requisitos previos

1. MongoDB instalado y ejecutándose localmente (puerto por defecto 27017)
2. Node.js y npm instalados

## ⚠️ IMPORTANTE: Cómo iniciar la aplicación

**NO uses `npm run dev` directamente cuando trabajas con MongoDB.**

### Proceso correcto:

1. **Verificar que MongoDB esté ejecutándose:**
   ```bash
   # Verificar estado
   brew services list | grep mongodb
   
   # Si no está ejecutándose, iniciarlo
   brew services start mongodb-community
   ```

2. **Iniciar la aplicación con verificación de MongoDB:**
   ```bash
   # Usar SIEMPRE este comando (no npm run dev)
   npm run dev:mongodb
   ```

### Scripts disponibles:

- `npm run dev:mongodb` - ✅ **Recomendado**: Verifica MongoDB y luego inicia la aplicación
- `npm run dev` - ❌ **No usar**: Solo inicia Next.js sin verificar MongoDB
- `npm run mongodb:check` - Verifica solo el estado de MongoDB
- `npm run mongodb:migrate` - Ejecuta migración de datos

## Configuración inicial

1. Asegúrate de que MongoDB esté en ejecución:
   ```bash
   # Verifica si MongoDB está ejecutándose
   mongo --eval "db.adminCommand('ping')"
   ```

2. Verifica la configuración de conexión en `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/translation-manager
   ```

## Pasos para probar la migración de datos

### 1. Limpieza de la base de datos (opcional)

Si quieres empezar desde cero:

```bash
# Ejecuta este script para limpiar la base de datos
node -e "require('./dist/services/seedMigration').clearAllMongoDBData().then(() => console.log('Base de datos limpiada')).catch(console.error)"
```

### 2. Migración de datos semilla

```bash
# Ejecuta este script para migrar los datos semilla a MongoDB
node -e "require('./dist/services/seedMigration').migrateAllSeedDataToMongoDB().then(() => console.log('Migración completada')).catch(console.error)"
```

### 3. Verificación del estado de la migración

```bash
# Verifica el estado de la migración
node -e "require('./dist/services/seedMigration').checkMigrationStatus().then(console.log).catch(console.error)"
```

### 4. Verificación manual en MongoDB

Puedes verificar manualmente los datos en MongoDB:

```bash
# Conectar a MongoDB
mongo

# Seleccionar la base de datos
use translation-manager

# Verificar colecciones
show collections

# Contar documentos en cada colección
db.users.countDocuments()
db.copys.countDocuments()

# Ver algunos documentos
db.users.find().limit(3)
db.copys.find().limit(3)
```

## Notas importantes sobre la migración

- La migración actual omite los campos `comments` e `history` para evitar problemas de validación con los IDs.
- Los slugs vacíos están permitidos en el modelo `Copy`.
- Se ha implementado un índice parcial para que la restricción de unicidad solo aplique a slugs no vacíos.

## Solución de problemas

### Error de validación de ObjectId

Si encuentras errores como:
```
ValidationError: Copy validation failed: comments.0.copyId: Cast to ObjectId failed for value "03533f65-a88f-4c9b-8e1a-a445d0e60689" (type string) at path "copyId"
```

Esto indica que hay un problema con la conversión de IDs de string a ObjectId. La solución implementada omite estos campos durante la migración inicial.

### Error de conexión a MongoDB

Si encuentras errores de conexión:
```
MongoNetworkError: failed to connect to server
```

Verifica que MongoDB esté en ejecución y accesible en el puerto configurado.

## Próximos pasos

Una vez que la migración básica funcione correctamente, se puede implementar una segunda fase para migrar los comentarios e historial, convirtiendo adecuadamente los IDs a ObjectId.
