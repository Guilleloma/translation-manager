# Funcionalidad y Flujos de Usuario: Translation Manager

## Casos de uso principales

### 1. Creación y edición de copys
- Crear un nuevo copy con slug y texto en español desde la interfaz.
- Sugerencia automática de slug si solo introduces el texto.
- Edición masiva o individual.
- **Slugs únicos por idioma**: Un mismo slug puede existir en diferentes idiomas, facilitando la organización de traducciones.

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

## Modelo de datos

Un "copy" en el prototipo tiene la siguiente estructura mínima:

```json
{
  "id": "uuid",
  "slug": "login.title",
  "text": "Inicia sesión",
  "language": "es",
  "status": "pendiente" // otros posibles: "traducido", "revisado", "aprobado"
}
```

**Reglas de validación:**
- El campo `slug` debe ser único y seguir el formato: solo minúsculas, puntos y letras/números (ej: `home.button.save`).
- El campo `text` no puede estar vacío.
- El campo `language` es obligatorio.
- El estado inicial es `pendiente`.
- Si no se introduce slug, se genera automáticamente a partir del texto (función tipo slugify, reemplazando espacios por puntos y quitando acentos/caracteres especiales).

---

## Flujos del prototipo

### Pantallas principales
- **Dashboard principal:**
  - Lista/tabla de copys existentes.
  - Acción para crear nuevo copy.
  - Acciones para editar o eliminar (si aplica).
- **Formulario de creación/edición:**
  - Campos: texto, slug (autogenerado si no se introduce), idioma.
  - Validación en tiempo real de unicidad y formato del slug.
  - Botón de guardar.
- **Exportación:**
  - Acción para exportar los copys a JSON por idioma.

### Flujos de usuario
- **Crear copy:**
  1. El usuario accede al formulario.
  2. Introduce texto y (opcionalmente) slug e idioma.
  3. El sistema valida el slug y lo sugiere si está vacío.
  4. Guarda el copy en memoria (o JSON local).
  5. El nuevo copy aparece en la tabla.
- **Editar copy:**
  1. El usuario selecciona un copy existente.
  2. Modifica campos y guarda.
  3. Se validan las reglas igual que en la creación.
- **Exportar copys:**
  1. El usuario pulsa exportar.
  2. El sistema genera un archivo JSON agrupado por idioma.

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
