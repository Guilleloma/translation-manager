# Guía de pruebas: Sprint 6 - Asignación de Copys y Notificaciones

Este documento detalla los pasos para probar las funcionalidades implementadas en el Sprint 6, utilizando los datos de prueba precargados que incluyen múltiples casuísticas.

## Credenciales de prueba

La aplicación ahora incluye datos semilla que se cargan automáticamente cuando no hay datos existentes en localStorage. Puedes usar estas credenciales:

| Rol | Email | Descripción |
|-----|-------|-------------|
| Admin | admin@example.com | Acceso completo a todas las funcionalidades |
| Traductor EN-FR | translator@example.com | Asignado a idiomas inglés y francés |
| Traductor ES-IT | maria@example.com | Asignado a idiomas español e italiano |
| Traductor EN-DE | john@example.com | Asignado a idiomas inglés y alemán |

## Datos de prueba incluidos

La aplicación incluye ahora un conjunto extenso de datos para probar diferentes casuísticas:

### Por tipo de copy
- **Copys con slug completo**: La mayoría de los copys tienen un identificador slug (ej: 'login.title')
- **Copys sin slug**: Algunos textos están pendientes de asignar a un slug (texto vacío)
- **Slugs sin texto**: Algunos slugs existen pero no tienen texto asignado (ej: 'nav.settings' en italiano)
- **Slugs con potenciales conflictos**: Para probar la robustez del sistema (ej: 'button' vs 'button.save')

### Por estado
- **Pendiente**: Copys que no han sido asignados a ningún traductor
- **Assigned**: Copys asignados a un traductor pero sin traducir
- **Traducido**: Copys que ya han sido traducidos
- **Revisado**: Copys que han pasado por un proceso de revisión
- **Aprobado**: Copys que han sido finalmente aprobados

### Por idioma
- **Español (es)**: Idioma base con todos los tipos de copys
- **Inglés (en)**: Idioma principal de traducción
- **Francés (fr)**: Con ejemplos de reasignación entre traductores
- **Italiano (it)**: Incluye ejemplos de slugs sin texto
- **Alemán (de)**: Con ejemplos de slugs potencialmente conflictivos
- **Portugués (pt)**: Para probar la asignación de nuevos idiomas

> **Nota**: Para restaurar los datos de prueba en cualquier momento, ve al Panel de Administración y usa el botón "Restaurar datos de prueba".

## 1. Asignación de Idiomas a Traductores

### Acceso
1. Inicia sesión como admin (`admin@example.com`)
2. Ve a la pestaña "Asignación de Idiomas" en el panel de administración

### Datos de prueba
- Los datos precargados ya incluyen varios traductores con idiomas asignados
- Puedes ver estas asignaciones en las tarjetas por idioma

### Pasos para probar
1. Selecciona un idioma (por ejemplo, Portugués) en el selector
2. Selecciona un traductor que no tenga ese idioma asignado
3. Haz clic en el botón con el icono "+"
4. Verifica que el traductor aparece en la tarjeta del idioma seleccionado
5. Repite los pasos anteriores para asignar otro idioma al mismo traductor
6. Comprueba que un traductor puede tener múltiples idiomas asignados

### Comportamiento esperado
- Cada traductor puede tener múltiples idiomas asignados
- Las asignaciones se muestran correctamente en las tarjetas de idioma
- Aparecen notificaciones confirmando las acciones realizadas

## 2. Asignación de Copys a Traductores

### Acceso
1. Inicia sesión como admin (`admin@example.com`)
2. Ve a la pestaña "Asignación de Copys" en el panel de administración

### Datos de prueba
- Los datos semilla incluyen varios copys en diferentes idiomas (español, inglés, francés, italiano, alemán)
- Algunos copys ya están asignados y otros están pendientes

### Pasos para probar
1. Selecciona un idioma en el selector (por ejemplo, "Español")
2. Verás la lista de copys pendientes para ese idioma
3. Selecciona un traductor que tenga permiso para ese idioma
4. Marca varios copys utilizando los checkboxes
5. Haz clic en "Asignar X copys"
6. Verifica que aparece un mensaje de confirmación

### Comportamiento esperado
- Solo aparecen los copys pendientes para el idioma seleccionado
- Solo puedes seleccionar traductores que tengan permiso para ese idioma
- Después de asignar, los copys desaparecen de la lista de pendientes
- La asignación se refleja en localStorage y persiste entre recargas

## 3. Notificaciones de Tareas Pendientes

### Acceso
1. Cierra sesión de admin e inicia sesión como traductor (`translator@example.com`)
2. Observa el icono de notificaciones en la barra superior

### Datos de prueba
- El traductor "Traductor EN-FR" tiene varias tareas asignadas en inglés y francés
- Algunas tareas están marcadas como "assigned" y otras como "traducido"

### Pasos para probar
1. Observa que hay un contador en el icono de notificaciones
2. Haz clic en el icono para ver el resumen de tareas pendientes
3. Verifica que muestra las tareas agrupadas por idioma
4. Haz clic en "Ver todas mis tareas" para acceder al panel completo
5. Filtra las tareas por idioma o utiliza la búsqueda
6. Selecciona una tarea pendiente y haz clic en "Traducir"
7. Introduce un texto para la traducción y guárdala

### Comportamiento esperado
- El contador muestra el número correcto de tareas pendientes
- El resumen muestra las tareas agrupadas por idioma correctamente
- Puedes ver y filtrar todas tus tareas en el panel completo
- Al traducir una tarea, su estado cambia a "Traducido" y desaparece de pendientes
- El contador de notificaciones se actualiza automáticamente

## Restauración de Datos

Si en algún momento quieres restaurar los datos de prueba a su estado original:

1. Inicia sesión como admin (`admin@example.com`)
2. Ve al panel de administración
3. Haz clic en el botón "Restaurar datos de prueba" en la parte superior derecha
4. Se mostrará una notificación confirmando la restauración
5. La página se recargará automáticamente

Esto restablecerá todos los usuarios, copys y asignaciones a su estado inicial, facilitando las demostraciones repetidas.
