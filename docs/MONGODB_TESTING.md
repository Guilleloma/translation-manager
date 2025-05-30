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

## Notas importantes

- Los datos se persisten automáticamente en MongoDB
- Ya no es necesario migrar datos desde localStorage
- Los usuarios y copys se crean directamente en la base de datos
- La aplicación se conecta automáticamente a MongoDB al iniciar

## Solución de problemas

### Error de conexión a MongoDB

Si encuentras errores de conexión:
```
MongoNetworkError: failed to connect to server
```

Verifica que MongoDB esté en ejecución y accesible en el puerto configurado.

## Próximos pasos

La aplicación ahora utiliza MongoDB como base de datos principal. Los datos se crean directamente en MongoDB conforme se van añadiendo a través de la interfaz.
