# Funcionalidad y Flujos de Usuario: Translation Manager

## Casos de uso principales

### 1. Creación y edición de copys
- Crear un nuevo copy con slug y texto en español desde la interfaz.
- Sugerencia automática de slug si solo introduces el texto.
- Edición masiva o individual.

### 2. Traducción y asignación
- Filtrar copys pendientes de traducir por idioma.
- Asignar tareas de traducción a usuarios concretos.
- Traductor ve solo sus tareas y puede marcar como "traducido".
- Traducción manual o sugerida por IA.

### 3. Revisión y control de calidad
- Revisor valida traducciones, deja feedback o solicita cambios.
- Visualización de estado: pendiente, traducido, en revisión, aprobado.
- Historial de cambios por copy.

### 4. Exportación e integración
- Exportar los archivos de traducción por idioma (JSON/YAML).
- Documentación de integración con `react-i18next` o `next-i18next`.

---

## Ejemplo de flujo por usuario

**Admin:**
- Crea copys y slugs.
- Asigna tareas de traducción por idioma.
- Supervisa el avance y aprueba traducciones.

**Traductor:**
- Ve solo los copys asignados en su idioma.
- Traduce y marca como "traducido".
- Puede usar la sugerencia automática.

**Revisor:**
- Filtra copys "traducidos" y los revisa.
- Deja feedback, aprueba o rechaza.

---

## Mockups textuales

### Dashboard principal
- Tabla con copys, slugs, estado por idioma, usuario asignado, acciones (editar, traducir, revisar, aprobar).

### Pantalla de traducción
- Lista de copys pendientes, campos para introducir traducción, botón de sugerir traducción automática, guardar, marcar como traducido.

### Pantalla de revisión
- Lista de copys traducidos, campo de feedback, botones de aprobar/rechazar.

---

## FAQ y buenas prácticas
- ¿Cómo asegurar slugs únicos? Validación en tiempo real.
- ¿Cómo evitar perder trabajo? Autosave y control de versiones.
- ¿Cómo integrar con el frontend? Exportación directa y documentación clara.

---

## Siguientes pasos sugeridos
- Revisar este documento y el README.
- Priorizar funcionalidades para el primer sprint.
- Arrancar desarrollo incremental.
