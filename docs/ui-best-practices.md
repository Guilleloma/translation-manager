t# UI Best Practices para Translation Manager

## Consistencia visual y funcional

### Formularios
- **Placeholders adaptativos**: El texto de ayuda (placeholder) debe adaptarse al idioma seleccionado en cada momento
- **Validaciones claras**: Mostrar mensajes de error específicos junto al campo que tiene el problema
- **Estados de los campos**: Mantener coherencia visual en todos los estados (normal, error, foco, deshabilitado)

### Feedback al usuario
- **Notificaciones**: Usar el sistema de toast para informar sobre acciones completadas o errores
- **Estado de carga**: Mostrar indicadores visuales durante operaciones asíncronas
- **Confirmaciones**: Solicitar confirmación para acciones destructivas (borrar)

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
