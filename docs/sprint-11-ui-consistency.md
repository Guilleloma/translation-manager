# Sprint 11: Mejoras de Consistencia UI

## Objetivos del Sprint

Este sprint se enfoca en mejorar la consistencia visual y la experiencia de usuario en toda la aplicación, especialmente en elementos clave como estados, roles y visualización de idiomas.

## Backlog de Tareas

### 1. Estandarización de estados y colores

- **Descripción**: Actualmente, los estados de las traducciones (not_assigned, assigned, translated, etc.) se muestran con diferentes nombres y colores en distintas partes de la aplicación, lo que genera confusión.
- **Tareas**:
  - Crear un componente `StatusBadge` reutilizable para mostrar estados de forma consistente
  - Definir una configuración centralizada de colores y etiquetas para cada estado
  - Implementar el componente en todas las vistas donde se muestran estados
  - Asegurar que los tooltips proporcionen información adicional sobre cada estado

### 2. Mejora del selector de roles en el panel de administración

- **Descripción**: El sistema actual de cambio de roles mediante un botón que rota entre opciones es poco intuitivo y propenso a errores.
- **Tareas**:
  - Crear un componente `RoleSelector` con un menú desplegable que muestre todas las opciones disponibles
  - Implementar feedback visual claro sobre el rol actual y las opciones disponibles
  - Mejorar la experiencia de usuario al cambiar roles
  - Asegurar consistencia visual con el resto de la aplicación

### 3. Estandarización de la visualización de idiomas

- **Descripción**: Los idiomas se muestran de forma inconsistente en diferentes partes de la aplicación (a veces como códigos, a veces con nombres completos, con diferentes estilos).
- **Tareas**:
  - Crear un componente `LanguageBadge` reutilizable para mostrar idiomas de forma consistente
  - Definir una configuración centralizada de nombres y colores para cada idioma
  - Implementar tooltips para mostrar el nombre completo cuando se usa el código
  - Aplicar el componente en todas las vistas donde se muestran idiomas

## Implementación

### Componente StatusBadge

Se ha creado un componente reutilizable que encapsula la lógica de visualización de estados, asegurando consistencia en toda la aplicación:

```tsx
// Configuración centralizada de estados
export const statusConfig = {
  'not_assigned': { 
    color: 'gray', 
    label: 'Sin asignar',
    bgColor: 'gray.100',
    textColor: 'gray.600'
  },
  'assigned': { 
    color: 'orange', 
    label: 'Asignado',
    bgColor: 'orange.100',
    textColor: 'orange.700'
  },
  // ... otros estados
};

// Componente reutilizable
const StatusBadge = ({ status, showTooltip = true, size = 'md' }) => {
  // Implementación que usa la configuración centralizada
};
```

### Componente RoleSelector

Se ha implementado un selector de roles mejorado con un menú desplegable que muestra todas las opciones disponibles:

```tsx
// Configuración centralizada de roles
export const roleConfig = {
  'admin': { 
    color: 'purple', 
    label: 'Administrador'
  },
  'translator': { 
    color: 'green', 
    label: 'Traductor'
  },
  // ... otros roles
};

// Componente de selector de roles
const RoleSelector = ({ user, onRoleChange }) => {
  // Implementación con menú desplegable
};
```

### Componente LanguageBadge

Se ha creado un componente para mostrar idiomas de forma consistente:

```tsx
// Configuración centralizada de idiomas
export const languageConfig = {
  'es': { name: 'Español', color: 'red' },
  'en': { name: 'Inglés', color: 'blue' },
  'fr': { name: 'Francés', color: 'cyan' },
  // ... otros idiomas
};

// Componente reutilizable
const LanguageBadge = ({ 
  languageCode, 
  showTooltip = true,
  size = 'md',
  showFullName = false
}) => {
  // Implementación que usa la configuración centralizada
};
```

## Guía de Pruebas

### Acceso a la funcionalidad
1. Iniciar sesión como administrador (admin@example.com / admin123)
2. Navegar a las diferentes secciones de la aplicación donde se muestran estados, roles e idiomas

### Pasos de prueba para la estandarización de estados
1. **Verificación visual en la tabla principal**
   - Ir a la página principal de copys
   - Verificar que los estados se muestran con el mismo estilo y colores
   - Pasar el cursor sobre los estados para ver los tooltips informativos

2. **Verificación en el formulario de edición**
   - Editar cualquier copy
   - Comprobar que el selector de estados muestra los mismos colores y etiquetas

### Pasos de prueba para el selector de roles
1. **Panel de administración**
   - Ir al panel de administración, pestaña "Usuarios"
   - Verificar que el selector de roles muestra un menú desplegable con todas las opciones
   - Cambiar el rol de un usuario y comprobar que el cambio se aplica correctamente
   - Verificar que el feedback visual es claro y consistente

### Pasos de prueba para la visualización de idiomas
1. **Tabla principal**
   - Verificar que los idiomas se muestran con el mismo estilo y colores en la tabla principal
   - Pasar el cursor sobre los códigos de idioma para ver los nombres completos en tooltips

2. **Panel de administración**
   - Ir al panel de administración, pestaña "Usuarios"
   - Verificar que los idiomas asignados a los traductores se muestran con el mismo estilo

## Comportamiento esperado
- Los estados, roles e idiomas se muestran de forma consistente en toda la aplicación
- Los selectores de roles proporcionan una experiencia de usuario intuitiva
- Los tooltips ofrecen información adicional útil
- La interfaz de usuario es más coherente y profesional

## Notas técnicas
- Los componentes reutilizables están disponibles en:
  - `src/components/status/StatusBadge.tsx`
  - `src/components/admin/RoleSelector.tsx`
  - `src/components/common/LanguageBadge.tsx`
- La configuración centralizada facilita cambios futuros en etiquetas o colores
- Los componentes son totalmente personalizables mediante props
