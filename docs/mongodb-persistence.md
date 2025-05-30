# Guía de Persistencia con MongoDB

Esta guía explica cómo funciona la persistencia de datos con MongoDB en Translation Manager y cómo probar esta funcionalidad.

## Arquitectura de persistencia

Translation Manager utiliza una arquitectura híbrida para la persistencia de datos:

1. **Cliente (navegador)**:
   - Almacenamiento local con `localStorage` como caché
   - Sincronización con el servidor mediante API REST

2. **Servidor (Next.js)**:
   - MongoDB como base de datos principal
   - Modelos Mongoose para copys y usuarios
   - API de sincronización para operaciones CRUD

Esta arquitectura permite que la aplicación funcione incluso sin conexión, utilizando localStorage como caché, y sincronice los datos con MongoDB cuando esté disponible.

## Requisitos previos

- MongoDB instalado y ejecutándose
- Node.js y npm instalados
- Repositorio clonado e instalado

## Cómo probar la persistencia de datos

### 1. Verificar que MongoDB esté ejecutándose

```bash
npm run mongodb:check
```

Deberías ver un mensaje indicando que MongoDB está ejecutándose correctamente.

### 2. Iniciar la aplicación con MongoDB

```bash
npm run dev:mongodb
```

Este comando verifica que MongoDB esté ejecutándose antes de iniciar la aplicación.

### 3. Crear y modificar datos

1. **Crear un nuevo copy**:
   - Accede a la aplicación en http://localhost:3000
   - Haz clic en "Crear nuevo copy"
   - Completa el formulario con los siguientes datos:
     - Slug: `test.mongodb.persistence`
     - Texto: `Este es un texto de prueba para MongoDB`
     - Idioma: `Español`
   - Haz clic en "Guardar"
   - Deberías ver el nuevo copy en la lista

2. **Verificar la persistencia**:
   - Detén la aplicación (Ctrl+C en la terminal)
   - Inicia la aplicación nuevamente: `npm run dev:mongodb`
   - Accede a la aplicación en http://localhost:3000
   - El copy creado anteriormente debería seguir visible en la lista
   - Esto confirma que los datos se han guardado en MongoDB y no solo en localStorage

3. **Editar un copy**:
   - Haz clic en el icono de edición del copy creado
   - Modifica el texto a: `Texto modificado para probar persistencia`
   - Haz clic en "Guardar"
   - Deberías ver el copy actualizado en la lista

4. **Eliminar un copy**:
   - Haz clic en el icono de eliminación del copy
   - Confirma la eliminación
   - El copy debería desaparecer de la lista

5. **Selección múltiple y eliminación masiva**:
   - Crea varios copys de prueba
   - Selecciona varios utilizando los checkboxes
   - Aparecerá una barra de acción en la parte inferior
   - Haz clic en "Eliminar X elementos"
   - Confirma la eliminación
   - Los copys seleccionados deberían desaparecer de la lista

### 4. Verificar la sincronización cliente-servidor

1. **Observar los logs de consola**:
   - Abre las herramientas de desarrollo del navegador (F12)
   - Ve a la pestaña "Console"
   - Realiza operaciones CRUD (crear, leer, actualizar, eliminar)
   - Deberías ver mensajes de log indicando la sincronización con el servidor:
     - `[DataService] Copy X sincronizado con el servidor via API`
     - `[DataService] Copy X actualizado en el servidor via API`
     - `[DataService] Copy X eliminado del servidor via API`

2. **Probar la carga inicial desde el servidor**:
   - Cierra completamente el navegador
   - Abre nuevamente la aplicación
   - Abre la consola del navegador
   - Deberías ver mensajes indicando que los datos se están cargando desde la API:
     - `[DataService] Intentando obtener datos del servidor via API...`
     - `[DataService] Datos obtenidos del servidor: X copys, Y usuarios`

## Comportamiento esperado

- Los datos creados, modificados o eliminados deben persistir entre reinicios de la aplicación
- La aplicación debe funcionar incluso si MongoDB no está disponible (usando localStorage como fallback)
- Los datos deben sincronizarse automáticamente entre el cliente y el servidor
- No deberían ocurrir errores relacionados con la conexión a MongoDB en el cliente

## Solución de problemas

Si encuentras algún problema con la persistencia de datos:

1. **Verifica que MongoDB esté ejecutándose**:
   ```bash
   npm run mongodb:check
   ```

2. **Revisa los logs del servidor**:
   - Observa la terminal donde se ejecuta la aplicación
   - Busca mensajes de error relacionados con MongoDB

3. **Revisa los logs del cliente**:
   - Abre la consola del navegador
   - Busca mensajes de error relacionados con la API o la sincronización

4. **Reinicia MongoDB**:
   ```bash
   brew services restart mongodb-community
   ```

5. **Limpia localStorage si es necesario**:
   - En la consola del navegador: `localStorage.clear()`
   - Recarga la página
