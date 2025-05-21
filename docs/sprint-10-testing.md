# Guía de Pruebas: Sprint 10 - Flujo de revisión y feedback

Esta guía detalla los pasos para probar todas las nuevas funcionalidades implementadas en el Sprint 10, incluyendo estados de traducción mejorados, sistema de comentarios, etiquetas, historial de cambios y roles de usuario.

## Requisitos previos

- Acceso a la aplicación Translation Manager
- Credenciales para diferentes roles de usuario:
  - **Admin**: `admin@example.com` / `admin123`
  - **Revisor**: `reviewer@example.com` / `reviewer123`
  - **Desarrollador**: `dev@example.com` / `dev123`
  - **Traductores**:
    - Ana López (EN-FR): `ana@example.com` / `translator123`
    - María García (ES-IT): `maria@example.com` / `translator123`
    - John Smith (EN-DE): `john@example.com` / `translator123`
    - Sophie Martin (FR-PT): `sophie@example.com` / `translator123`

## 1. Estados de traducción mejorados

### Acceso a la funcionalidad
1. Iniciar sesión como administrador (admin@example.com)
2. Navegar a la sección principal de copys
3. Seleccionar un copy existente para editar
4. Ver la sección "Estado" en la parte superior del formulario

### Pasos de prueba
1. **Visualización de estados**
   - Verificar que el estado actual del copy se muestra con un badge de color
   - Para usuarios administradores, debería verse un menú desplegable con todos los estados posibles
   - Para otros roles, verificar que solo se muestran los estados permitidos

2. **Cambio de estados según rol**
   - **Admin**: Debe poder cambiar a cualquier estado en cualquier momento
   - **Traductor**: Solo puede cambiar de "Asignado" a "Traducido" si el copy está asignado a él
   - **Revisor**: Puede cambiar de "Traducido" a "Revisado", "Aprobado" o "Rechazado"
   - **Desarrollador**: Tiene los mismos permisos que un administrador

3. **Registro de cambios**
   - Cada cambio de estado debe registrar automáticamente:
     - Usuario que realizó el cambio
     - Fecha y hora exacta
     - Estado anterior y nuevo estado
     - Comentario opcional

### Comportamiento esperado
- Los estados cambian según las reglas de transición definidas
- Se muestra una notificación de confirmación al cambiar el estado
- El historial de cambios se actualiza automáticamente
- Los cambios se reflejan inmediatamente en la interfaz
- Los usuarios solo ven las opciones de estado permitidas para su rol
- El filtro por estado en la página principal permite ver rápidamente los copys en un estado específico
- Los revisores pueden ver todas las traducciones pendientes de revisión en la sección "Tareas Pendientes de Revisión"

### Resolución de problemas
Si no puedes cambiar el estado de un copy:
1. Verifica que estés autenticado correctamente
2. Confirma que tienes los permisos necesarios para realizar la acción
3. Asegúrate de que el copy no esté bloqueado por otro usuario
4. Revisa la consola del navegador (F12) para ver si hay mensajes de error

### Notas técnicas
- Los estados disponibles son: "No asignado", "Asignado", "Traducido", "Revisado", "Aprobado", "Rechazado"
- Cada cambio de estado actualiza automáticamente la fecha de modificación
- Los cambios se guardan inmediatamente sin necesidad de guardar manualmente el formulario
- La página principal incluye un filtro por estado para facilitar la visualización
- La página de tareas ahora funciona tanto para traductores como para revisores

### Acceso a tareas pendientes para revisores
1. Iniciar sesión como revisor (reviewer@example.com / reviewer123)
2. Navegar a la página "Tareas Pendientes" desde el menú principal
3. Ver la lista de traducciones pendientes de revisión (estado "Traducido")
4. Utilizar los filtros disponibles para buscar por idioma o texto
5. Hacer clic en el botón "Revisar" (color morado) para una traducción

### Proceso de revisión de traducciones
1. Iniciar sesión como revisor (reviewer@example.com / reviewer123)
2. Navegar a la página "Tareas Pendientes" desde el menú principal
3. Hacer clic en el botón "Revisar" para una traducción en estado "Traducido"
4. En el modal de revisión:
   - Revisar el texto original y la traducción
   - Agregar comentarios o sugerencias en el campo de texto
   - Hacer clic en "Aprobar Revisión" para marcar como revisado
5. Verificar que:
   - La traducción cambia a estado "Revisado"
   - Se muestra una notificación de éxito
   - Se registra la entrada en el historial con los comentarios
   - La traducción desaparece de la lista de tareas pendientes

## 2. Historial de cambios

### Acceso a la funcionalidad
1. Iniciar sesión con cualquier rol
2. Navegar a la sección principal de copys o a la página de tareas pendientes
3. Para cada copy que tenga historial, aparecerá un botón "Historial"

### Datos de prueba disponibles
- **Copy con historial completo**: "Bienvenido al panel de control" (dashboard.welcome)
  - Tiene un historial de cambios de estado: not_assigned → assigned → translated → reviewed
  - Incluye comentarios en cada etapa del proceso
  - Tiene etiquetas: ui, dashboard

- **Copy con historial de aprobación**: "Bienvenido" (common.welcome)
  - Tiene un historial completo: not_assigned → assigned → translated → reviewed → approved
  - Incluye comentarios del revisor y del administrador
  - Tiene etiquetas: common, ui

- **Copy con etiquetas de urgencia**: "Log in" (login.title)
  - Tiene etiquetas: login, urgente, marketing
  - Incluye comentarios sobre la prioridad

### Pasos de prueba
1. **Ver historial desde la página principal**
   - Iniciar sesión como administrador (admin@example.com / admin123)
   - Localizar el copy "Bienvenido al panel de control" (dashboard.welcome)
   - Hacer clic en el botón "Historial" junto a las acciones
   - Verificar que se abre un modal con el historial completo de cambios
   - Comprobar que se muestran las 3 entradas del historial con sus fechas y usuarios

2. **Ver historial desde la vista de tabla**
   - Cambiar a la vista de tabla haciendo clic en el botón "Tabla"
   - Localizar el slug "common.welcome"
   - Abrir el menú de acciones (⚙️)
   - Hacer clic en "Ver historial de cambios"
   - Verificar que se muestra el historial completo con los 4 cambios de estado

3. **Ver historial desde la página de tareas**
   - Iniciar sesión como revisor (reviewer@example.com / reviewer123)
   - Navegar a "Tareas Pendientes"
   - Localizar un copy con historial (tendrá un botón "Historial")
   - Hacer clic en el botón y verificar que se muestra el historial

### Información mostrada en el historial
- Usuario que realizó el cambio
- Fecha y hora del cambio
- Estado anterior y nuevo estado
- Comentarios asociados al cambio (si existen)

### Comportamiento esperado
- El historial muestra todos los cambios ordenados del más reciente al más antiguo
- Cada entrada del historial muestra claramente el tipo de cambio realizado
- Se puede expandir cada entrada para ver más detalles
- El modal se puede cerrar fácilmente con el botón "Cerrar" o haciendo clic fuera

## 3. Búsqueda avanzada por etiquetas

### Acceso a la funcionalidad
1. Iniciar sesión con cualquier rol
2. Navegar a la sección principal de copys
3. Usar los filtros disponibles en la parte superior de la página

### Datos de prueba disponibles
Los siguientes copys tienen etiquetas para probar el filtrado:

- **Etiqueta "ui"**:
  - "Bienvenido al panel de control" (dashboard.welcome) - Etiquetas: ui, dashboard
  - "Bienvenido" (common.welcome) - Etiquetas: common, ui
  - "Password" (login.password) - Etiquetas: login, legal, seguridad

- **Etiqueta "login"**:
  - "Log in" (login.title) - Etiquetas: login, urgente, marketing
  - "Password" (login.password) - Etiquetas: login, legal, seguridad

- **Etiqueta "urgente"**:
  - "Log in" (login.title) - Etiquetas: login, urgente, marketing

- **Otras etiquetas**:
  - "legal", "seguridad", "marketing", "dashboard", "common"

### Pasos de prueba
1. **Filtrar por una etiqueta**
   - Iniciar sesión como administrador (admin@example.com / admin123)
   - En la página principal, localizar el selector "Filtrar por etiqueta"
   - Seleccionar la etiqueta "ui"
   - Verificar que se muestran solo los copys con la etiqueta "ui"
   - Comprobar que aparecen "Bienvenido al panel de control" y "Bienvenido"

2. **Combinar filtros de etiqueta y estado**
   - Con el filtro de etiqueta "ui" activo, seleccionar el estado "reviewed" en el filtro de estado
   - Verificar que solo se muestra "Bienvenido al panel de control" (tiene etiqueta "ui" y estado "reviewed")
   - Cambiar el filtro de estado a "approved"
   - Verificar que solo se muestra "Bienvenido" (tiene etiqueta "ui" y estado "approved")

3. **Combinar búsqueda de texto y etiquetas**
   - Limpiar el filtro de estado (seleccionar "Todos los estados")
   - Con el filtro de etiqueta "login" activo, escribir "Pass" en el campo de búsqueda
   - Verificar que solo se muestra "Password" (tiene etiqueta "login" y contiene "Pass" en su texto)

### Comportamiento esperado
- Los filtros se aplican correctamente y muestran solo los copys que cumplen con todos los criterios
- Al cambiar un filtro, la lista se actualiza inmediatamente
- Si no hay resultados que coincidan con los filtros, se muestra un mensaje indicando que no hay copys
- Los filtros funcionan correctamente en ambas vistas (lista y tabla)

## 4. Sistema de comentarios

### Acceso a la funcionalidad
1. Iniciar sesión con cualquier rol
2. Navegar a la sección principal de copys
3. Seleccionar un copy existente para editar
4. Ir a la pestaña "Comentarios"

### Pasos de prueba
1. **Añadir comentario**
   - Escribir un comentario en el campo de texto
   - Hacer clic en "Enviar"
   - Verificar que el comentario aparece en la lista

2. **Visualización de comentarios**
   - Comprobar que se muestra el nombre del usuario que hizo el comentario
   - Verificar que se muestra la fecha y hora del comentario
   - Confirmar que los comentarios se ordenan del más reciente al más antiguo

### Comportamiento esperado
- El comentario se añade correctamente
- Aparece una notificación de éxito
- El comentario muestra correctamente el nombre del usuario y la fecha
- La lista de comentarios se actualiza automáticamente

## 3. Etiquetado de traducciones

### Acceso a la funcionalidad
1. Iniciar sesión como Admin o Revisor
2. Navegar a la sección principal de copys
3. Seleccionar un copy existente para editar
4. Ir a la pestaña "Etiquetas"

### Pasos de prueba
1. **Añadir etiquetas**
   - Hacer clic en "Gestionar"
   - Escribir una etiqueta (ej: "urgente") y presionar Enter
   - Añadir varias etiquetas (ej: "marketing", "legal")
   - Cerrar el modal

2. **Eliminar etiquetas**
   - Hacer clic en "Gestionar"
   - Hacer clic en la "X" de una etiqueta existente
   - Cerrar el modal

3. **Sugerencias de etiquetas**
   - Hacer clic en "Gestionar"
   - Comenzar a escribir una etiqueta común (ej: "ur" para "urgente")
   - Verificar que aparecen sugerencias
   - Seleccionar una sugerencia haciendo clic en ella

### Comportamiento esperado
- Las etiquetas se añaden y eliminan correctamente
- Las etiquetas se muestran con un estilo visual distintivo
- Las sugerencias aparecen al escribir
- Solo usuarios con permisos pueden gestionar etiquetas

## 4. Historial de cambios

### Acceso a la funcionalidad
1. Iniciar sesión como Admin
2. Navegar a la sección principal de copys
3. Realizar varios cambios en un copy (estado, texto, etc.)
4. Seleccionar el copy modificado
5. Ir a la pestaña "Historial"

### Pasos de prueba
1. **Visualización del historial**
   - Verificar que se muestran todos los cambios realizados
   - Comprobar que cada entrada muestra:
     - Usuario que realizó el cambio
     - Tipo de cambio (estado, texto)
     - Valores anteriores y nuevos
     - Fecha y hora del cambio

2. **Expandir detalles**
   - Hacer clic en una entrada del historial
   - Verificar que se muestran los detalles completos del cambio

### Comportamiento esperado
- El historial muestra todos los cambios en orden cronológico inverso
- Cada entrada contiene la información completa del cambio
- Los detalles se pueden expandir y contraer

## 5. Sistema de roles y permisos

### Acceso a la funcionalidad
1. Probar con diferentes cuentas de usuario (Admin, Traductor, Revisor, Developer)

### Pasos de prueba
1. **Permisos por rol**
   - **Admin**: Verificar que puede realizar todas las acciones
   - **Traductor**: Verificar que solo puede:
     - Ver sus copys asignados
     - Cambiar estado a "Traducido" si está asignado
     - Añadir comentarios
   - **Revisor**: Verificar que solo puede:
     - Cambiar estado a "Revisado", "Aprobado" o "Rechazado"
     - Añadir comentarios y etiquetas
   - **Developer**: Verificar que puede:
     - Modificar slugs (incluso en copys existentes)
     - Realizar todas las acciones excepto administrativas

2. **Modificación de slugs**
   - Como Traductor o Revisor: Intentar modificar un slug existente
   - Verificar que el campo está deshabilitado
   - Como Developer: Modificar un slug existente
   - Verificar que el cambio se aplica correctamente

### Comportamiento esperado
- Cada rol solo puede realizar las acciones permitidas
- Los campos y botones no permitidos aparecen deshabilitados
- El rol Developer puede modificar slugs mientras otros roles no pueden

## Notas adicionales

- Realizar estas pruebas en diferentes navegadores para asegurar compatibilidad
- Verificar que todas las notificaciones de éxito/error aparecen correctamente
- Comprobar que la interfaz es responsiva y funciona en diferentes tamaños de pantalla
