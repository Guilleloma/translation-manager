# UI Best Practices para Translation Manager

## Consistencia visual y funcional

### Formularios
- **Placeholders adaptativos**: El texto de ayuda (placeholder) debe adaptarse al idioma seleccionado en cada momento
- **Validaciones claras**: Mostrar mensajes de error específicos junto al campo que tiene el problema
- **Estados de los campos**: Mantener coherencia visual en todos los estados (normal, error, foco, deshabilitado)

### Feedback al usuario
- **Notificaciones**: Usar el sistema de toast para informar sobre acciones completadas o errores
- **Confirmaciones**: Solicitar confirmación para acciones destructivas (borrar)
- **Prevención de pérdida de datos**: Advertir y solicitar confirmación explícita antes de sobrescribir o reemplazar datos existentes, especialmente en operaciones masivas

### Estados de carga y feedback visual
- **Principio fundamental**: No debe existir ningún proceso o acción sin un feedback visual correspondiente
- **Navegación entre páginas**: Mostrar un indicador de carga visible siempre que se navegue entre rutas diferentes
  - Usar spinners, barras de progreso o esqueletos de carga (loading skeletons)
  - El indicador debe ser consistente en toda la aplicación (mismo estilo)
  - Colocar el indicador en una posición donde sea inmediatamente visible
- **Interacciones de usuario**: 
  - Deshabilitar visualmente los botones durante la acción (evita doble clic)
  - Utilizar estados de hover/focus/active/disabled en todos los elementos interactivos
  - Mostrar un spinner o texto "Cargando..." en el propio botón
- **Carga de datos**: 
  - Usar esqueletos de carga (skeletons) para representar el contenido que se está cargando
  - Evitar cambios bruscos de layout cuando los datos se cargan
  - Mostrar mensajes claros cuando no hay datos disponibles
- **Tiempo de respuesta**: 
  - Para operaciones que toman <1s: mostrar spinner en el botón
  - Para operaciones entre 1-3s: mostrar loading overlay o skeleton en la sección afectada
  - Para operaciones >3s: mostrar barra de progreso o indicador con estimación de tiempo

### Navegación
- **Jerarquía clara**: Mantener una estructura visual que priorice elementos según su importancia
- **Accesibilidad**: Asegurar que todos los componentes son navegables por teclado
- **Coherencia en CTAs**: Mantener el mismo estilo para botones de acción primaria y secundaria

## Terminología y Copy
- Mantener un glosario de términos consistente en toda la aplicación
- Usar el mismo término para referirse al mismo concepto (ej: "copy" en lugar de alternar entre "copy" y "traducción")
- Adaptar textos al contexto de uso (por ej: placeholders según idioma)

## Responsive Design
- Asegurar que todos los componentes funcionan correctamente en distintos tamaños de pantalla
- Priorizar contenido crítico en vistas móviles
- Usar componentes adaptables de Chakra UI como Stack con dirección responsiva

## Accesibilidad
- Usar etiquetas semánticas HTML adecuadas
- Proporcionar textos alternativos para elementos visuales
- Asegurar suficiente contraste de color

---

Este documento debe ser consultado y actualizado constantemente durante el desarrollo para mantener un alto estándar de usabilidad.
