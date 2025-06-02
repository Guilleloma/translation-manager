# Sprint 23: Administración de Base de Datos

## Descripción
Implementación de funcionalidades para administrar la base de datos directamente desde el panel de administración, permitiendo realizar operaciones de mantenimiento y limpieza de datos sin necesidad de acceder directamente a MongoDB.

## Objetivos
- Proporcionar herramientas para administradores que permitan gestionar la base de datos desde la interfaz
- Permitir operaciones de limpieza y reinicio de datos para entornos de prueba
- Mantener la seguridad y evitar operaciones destructivas accidentales

## Backlog de Tareas
- ✅ Crear API endpoint para eliminar todos los copys
- ✅ Implementar método en dataService para comunicarse con el API
- ✅ Añadir sección de administración de base de datos en el panel de administrador
- ✅ Implementar diálogo de confirmación con advertencias claras
- ✅ Asegurar que la operación no afecte a los usuarios
- ✅ Actualizar documentación

## Implementación

### API Endpoint
Se ha creado un nuevo endpoint en `/api/db/reset-copies/route.ts` que permite eliminar todos los copys de la base de datos mediante una petición DELETE. Este endpoint:
- Conecta con MongoDB
- Elimina todos los documentos de la colección Copy
- Devuelve el número de documentos eliminados
- Incluye manejo de errores y logging

### DataService
Se ha añadido un nuevo método `deleteAllCopys()` en el dataService que:
- Llama al endpoint de API para eliminar todos los copys
- Limpia el localStorage para mantener la coherencia
- Fuerza una recarga de datos para actualizar la interfaz
- Proporciona feedback detallado sobre la operación

### Panel de Administración
Se ha añadido una nueva sección "Administración de Base de Datos" en el panel de administrador que:
- Está visualmente diferenciada con colores de advertencia (rojo)
- Incluye advertencias claras sobre la naturaleza destructiva de las operaciones
- Proporciona un botón para eliminar todos los copys
- Implementa un diálogo de confirmación con múltiples advertencias
- Muestra feedback visual durante y después de la operación

## Guía de Pruebas

1. Acceder al panel de administración con un usuario con rol de administrador
2. Navegar a la pestaña "Dashboard"
3. Desplazarse hasta la sección "Administración de Base de Datos"
4. Hacer clic en el botón "Eliminar Todos los Copys"
5. Verificar que aparece un diálogo de confirmación con advertencias claras
6. Confirmar la operación
7. Verificar que aparece una notificación de éxito con el número de copys eliminados
8. Comprobar que la interfaz se actualiza mostrando 0 copys
9. Verificar que los usuarios no han sido afectados

## Comportamiento Esperado
- La operación debe eliminar todos los copys de la base de datos sin afectar a los usuarios
- La interfaz debe actualizarse automáticamente mostrando 0 copys
- El localStorage debe limpiarse para mantener la coherencia
- Debe mostrarse feedback claro sobre el resultado de la operación

## Notas Técnicas
- Esta operación es irreversible y debe usarse con extrema precaución
- Solo los usuarios con rol de administrador pueden acceder a esta funcionalidad
- La operación no afecta a la base de datos de usuarios, solo a los copys
- Se han implementado múltiples capas de confirmación para evitar operaciones accidentales
- Se ha añadido logging extensivo para facilitar la depuración en caso de problemas
