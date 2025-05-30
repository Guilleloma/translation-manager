# Guía de Pruebas: Panel de Developer

## Descripción
Esta guía detalla cómo probar la funcionalidad del panel de developer para gestión de slugs auto-generados.

## Datos de Prueba Necesarios

### 1. Usuario Developer
- **Username**: developer
- **Email**: developer@test.com
- **Password**: developer123
- **Role**: developer

### 2. Copys con Slugs Auto-generados
Ejecutar el script para agregar datos de prueba:
```bash
node scripts/add-test-auto-slugs.js
```

Este script agrega 10 copys con slugs auto-generados en diferentes idiomas:
- **Español**: 4 copys
- **Inglés**: 3 copys  
- **Francés**: 2 copys
- **Alemán**: 1 copy

## Pasos de Prueba

### Paso 1: Acceso al Panel de Developer

1. **Iniciar la aplicación**:
   ```bash
   npm run dev:mongodb
   ```

2. **Iniciar sesión como developer**:
   - Ir a `/auth`
   - Username: `developer`
   - Password: `developer123`

3. **Verificar navegación**:
   - ✅ Debe aparecer el botón "Mis Tareas" en el header
   - ✅ NO debe aparecer el botón "Developer" (solo para admins)

### Paso 2: Acceso a Tareas de Developer

1. **Navegar a tareas**:
   - Hacer clic en "Mis Tareas" en el header
   - Debe redirigir a `/developer-tasks`

2. **Verificar vista inicial**:
   - ✅ Título: "🔧 Mis Tareas de Developer"
   - ✅ Estadísticas visibles:
     - Total de tareas: 10
     - Prioridad alta: 4-5 (dependiendo de los timestamps)
     - Idiomas afectados: 4
   - ✅ Filtros disponibles: idioma y búsqueda

### Paso 3: Funcionalidad de Filtros

1. **Filtro por idioma**:
   - Seleccionar "Español" → debe mostrar 4 copys
   - Seleccionar "Inglés" → debe mostrar 3 copys
   - Seleccionar "Francés" → debe mostrar 2 copys
   - Seleccionar "Alemán" → debe mostrar 1 copy
   - Seleccionar "Todos los idiomas" → debe mostrar 10 copys

2. **Búsqueda por texto**:
   - Buscar "Bienvenido" → debe mostrar 1 resultado
   - Buscar "auto_" → debe mostrar copys con slugs que empiecen por "auto_"
   - Buscar "Welcome" → debe mostrar 1 resultado en inglés

### Paso 4: Detección de Prioridades

1. **Verificar prioridades asignadas**:
   - ✅ **Alta** (rojo): Slugs con timestamps (ej: `auto_1703875200000`)
   - ✅ **Media** (naranja): Textos largos con slugs simples
   - ✅ **Baja** (amarillo): Otros casos

2. **Verificar badges de prioridad**:
   - Cada copy debe tener un badge de prioridad visible
   - Los colores deben corresponder al nivel de prioridad

### Paso 5: Sugerencias de Slugs

1. **Verificar sugerencias automáticas**:
   - "Bienvenido a nuestra aplicación" → `bienvenido_a_nuestra`
   - "Guardar cambios" → `guardar_cambios`
   - "Error de validación" → `error_de_validacion`
   - "Welcome to our application" → `welcome_to_our`

2. **Verificar normalización**:
   - ✅ Acentos removidos correctamente
   - ✅ Espacios convertidos a guiones bajos
   - ✅ Máximo 3 palabras por sugerencia

### Paso 6: Edición de Slugs

1. **Edición manual**:
   - Hacer clic en el botón "Editar" (icono de lápiz)
   - ✅ Debe aparecer un input con el slug actual
   - Modificar el slug (ej: `button.save`)
   - Hacer clic en el botón "Guardar" (check verde)
   - ✅ Debe mostrar toast de confirmación
   - ✅ El copy debe desaparecer de la lista

2. **Usar sugerencia**:
   - Hacer clic en "Usar sugerencia"
   - ✅ Debe cargar la sugerencia en el input
   - Hacer clic en "Guardar"
   - ✅ Debe actualizar el slug y remover de la lista

3. **Cancelar edición**:
   - Iniciar edición de un slug
   - Hacer clic en "Cancelar" (X gris)
   - ✅ Debe volver al estado original

### Paso 7: Modal de Detalles

1. **Abrir detalles**:
   - Hacer clic en el texto de cualquier copy
   - ✅ Debe abrir modal con detalles completos

2. **Verificar información mostrada**:
   - ✅ Slug actual
   - ✅ Texto completo
   - ✅ Idioma con badge
   - ✅ Prioridad con badge
   - ✅ Sugerencia de slug

### Paso 8: Validaciones y Errores

1. **Slug vacío**:
   - Intentar guardar un slug vacío
   - ✅ Debe mostrar error: "El slug no puede estar vacío"

2. **Slug duplicado**:
   - Intentar usar un slug que ya existe
   - ✅ Debe mostrar error de duplicidad

3. **Error de conexión**:
   - Simular error de red
   - ✅ Debe mostrar toast de error apropiado

### Paso 9: Actualización de Estadísticas

1. **Verificar actualización automática**:
   - Después de actualizar slugs
   - ✅ Las estadísticas deben actualizarse
   - ✅ El contador total debe decrementar

2. **Estado final**:
   - Después de procesar todos los copys
   - ✅ Debe mostrar mensaje de "¡Excelente trabajo!"

## Comportamiento Esperado por Paso

### Acceso Inicial
- Carga rápida de la página (< 2 segundos)
- Estadísticas precisas basadas en datos reales
- Interfaz responsiva en diferentes tamaños de pantalla

### Filtros
- Filtrado instantáneo sin recarga de página
- Contador actualizado según filtros aplicados
- Combinación de filtros funcional

### Edición
- Feedback inmediato en todas las acciones
- Validación en tiempo real
- Persistencia de cambios en base de datos

### UX General
- Navegación intuitiva
- Mensajes de error claros y útiles
- Confirmaciones visuales para todas las acciones

## Casos Edge a Probar

1. **Sin datos**: Eliminar todos los copys auto-generados y verificar mensaje vacío
2. **Muchos datos**: Agregar 100+ copys y verificar rendimiento
3. **Slugs muy largos**: Probar con textos de 200+ caracteres
4. **Caracteres especiales**: Probar con emojis y caracteres Unicode
5. **Conexión lenta**: Simular latencia alta y verificar UX

## Criterios de Éxito

✅ **Funcionalidad**: Todas las operaciones CRUD funcionan correctamente
✅ **UX**: Interfaz intuitiva y responsiva
✅ **Performance**: Carga rápida incluso con muchos datos
✅ **Validación**: Errores manejados apropiadamente
✅ **Consistencia**: Comportamiento uniforme en toda la aplicación
