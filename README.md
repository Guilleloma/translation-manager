# Translation Manager

> **Estado:** Prototipo funcional. Este proyecto es una prueba de concepto centrada en la velocidad de desarrollo y la validación rápida de flujos clave para la gestión de traducciones. Las decisiones técnicas y de alcance están optimizadas para simplicidad y facilidad de iteración.


## Descripción

Translation Manager es una herramienta web interna para gestionar traducciones de aplicaciones, eliminando la dependencia de Excel y facilitando la colaboración, revisión y robustez del sistema de copys. El flujo es 100% en la app: puedes crear, editar, traducir y asignar copys y slugs desde la interfaz, sin depender de archivos externos. Permite asignar tareas de traducción a usuarios por idioma, controlar el estado de cada copy y trabajar de forma colaborativa y ágil.

### Características principales

- **Gestión multilenguaje robusta**: Un mismo slug puede tener diferentes traducciones, una por cada idioma.
- **Soporte completo para 6 idiomas**: Español, Inglés, Portugués, Francés, Italiano y Alemán en toda la aplicación.
- **Vista de tabla por idiomas**: Visualización clara de todos los copys organizados por slug e idioma.
- **Creación y edición intuitiva**: Interfaz optimizada para trabajar eficientemente con traducciones.
- **Detección de conflictos de slug**: Sistema de alerta visual (⚠️) que muestra posibles conflictos en la estructura JSON cuando un slug raíz ('button') colisiona con slugs anidados ('button.crear').

---

## Principios y enfoque ágil

- Desarrollo incremental: entregas pequeñas y funcionales en cada sprint.
- Priorización de valor: primero funcionalidades core, luego mejoras y automatizaciones.
- Feedback continuo: iteramos en base a uso real y feedback del equipo.

---

## Roles y tipos de usuario

- **Administrador:** gestiona usuarios, asigna tareas, revisa y aprueba traducciones.
- **Traductor:** recibe y gestiona tareas de traducción por idioma, marca como traducido o en revisión.
- **Revisor:** valida traducciones y deja feedback.
- **Colaborador:** puede proponer copys o sugerir cambios.

---

## Flujo de trabajo completo

1. **Creación de copys y slugs:**
   - Directamente en la app, individualmente o en lote.
   - Sugerencia automática de slugs si solo tienes el copy.
2. **Edición y gestión centralizada:**
   - Búsqueda, filtrado y edición en tiempo real.
   - Estado de cada copy: pendiente, traducido, revisado, aprobado.
3. **Asignación de tareas por idioma y usuario:**
   - El admin asigna copys pendientes a traductores según idioma.
   - Cada traductor ve solo sus tareas y puede marcar como traducido.
4. **Traducción asistida:**
   - Traducción manual o sugerida por IA (ChatGPT) desde la interfaz.
   - Visualización clara de origen de la traducción y estado.
5. **Revisión y control:**
   - Revisor valida traducciones, deja comentarios o aprueba.
   - Historial de cambios y auditoría.
6. **Exportación y consumo:**
   - Exporta archivos JSON/YAML listos para i18n en el frontend.
   - Integración directa con el pipeline de CI/CD si se desea.

---

## Decisiones de arquitectura y alcance del prototipo

### Objetivo
- Validar el flujo de creación, edición y exportación de copys/traducciones de forma colaborativa, sin depender de archivos Excel.
- Entregar valor rápido y obtener feedback sobre la experiencia de usuario y la utilidad de la herramienta.

### Stack Tecnológico
- **Frontend:** Next.js + TypeScript
- **UI:** Chakra UI
- **Estado:** React Context y estado local (sin Redux ni Zustand)
- **Persistencia:** Datos en memoria (o archivos JSON locales para simular BD si es necesario)
- **Backend/API:** API routes de Next.js para leer/escribir datos si se requiere persistencia
- **Testing:** Opcional, solo para lógica crítica (ej: validación de slug)
- **Despliegue:** Vercel/Netlify (preview automático)

### Justificación de decisiones
- **Next.js:** Permite desarrollo rápido, rutas API integradas y despliegue sencillo.
- **Chakra UI:** Componentes accesibles y personalizables, ideal para prototipos.
- **Sin BD compleja:** Para un prototipo, persistencia en JSON o memoria es suficiente y acelera el desarrollo.
- **Sin autenticación real:** Los roles se simulan en el frontend, priorizando la funcionalidad principal.

### Límites del prototipo
- No hay control de acceso real ni gestión de usuarios persistente.
- Los datos pueden perderse tras recargar si no se usa archivo JSON.
- La exportación es manual y básica, pensada para validar integración con i18n.
- El foco está en la experiencia de creación/edición y validación de slugs.

---

## Sprints y entregas incrementales

### Sprint 1: Estructura base del proyecto ✅
- ✅ Inicializar repo Next.js + TypeScript
- ✅ Configuración básica del proyecto y carpetas
- ✅ Integración con Chakra UI

### Sprint 2: Creación y edición de copys ✅
- ✅ UI para crear copys y slugs manualmente
- ✅ Validación de unicidad y formato de slug
- ✅ Generación automática de slugs a partir del texto

### Sprint 3: Edición y búsqueda ✅
- ✅ Buscador por texto y slug
- ✅ Edición inline de copys existentes
- ✅ Eliminación de copys
- ✅ Filtros para visualización
- ✅ Feedback visual con notificaciones
- ✅ Validación de slugs únicos por idioma (no globalmente)
- ✅ Vista en formato tabla para traducciones por idioma
- ✅ Corrección de bugs en gestión multilenguaje
  - ✅ Solucionado problema de desaparición de traducciones al crear nuevas
  - ✅ Mejorada la validación de unicidad slug+idioma

### Sprint 4: Exportación básica ✅
- ✅ Exportar copys a JSON por idioma
- ✅ Selección de idioma para exportación
- ✅ Estructura JSON compatible con i18n

### Sprint 5: Gestión de usuarios y roles ✅
- ✅ Registro/login básico
- ✅ Roles: admin, traductor
- ✅ Panel de administración básico
- ✅ Protección de rutas basada en roles
- ✅ Integración de autenticación en la aplicación

### Sprint 6: Asignación de tareas de traducción y datos de prueba ✅
- ✅ UI para asignar idiomas a traductores
  - ✅ Selector de usuarios por idioma
  - ✅ Interfaz de administración para gestionar permisos
  - ✅ Soporte para múltiples asignaciones de idiomas a un mismo traductor
- ✅ Asignación masiva de copys a traductores
  - ✅ Selección de copys pendientes por idioma
  - ✅ Filtros y búsqueda para asignar tareas
  - ✅ Interfaz integrada como pestaña en el panel de administración
- ✅ Sistema de notificaciones para traductores
  - ✅ Badge indicador de tareas pendientes en el encabezado
  - ✅ Vista resumida de tareas agrupadas por idioma
  - ✅ Acceso rápido a todas las tareas pendientes
- ✅ Sistema de datos de prueba automatizado
  - ✅ Carga automática de datos semilla para demos y pruebas
  - ✅ Múltiples casuísticas de copys (con/sin slug, diferentes estados, etc.)
  - ✅ Función para restaurar datos de prueba con un clic
  - ✅ Documentación detallada para probar todas las funcionalidades
  - ✅ Dashboard de tareas para traductores

### Sprint 7: Gestión avanzada de copys y slugs ✅
- ✅ Creación independiente de copys y slugs
  - ✅ Añadir copys sin slug asociado inicialmente
  - ✅ Añadir slugs sin copys asociados inicialmente
  - ✅ Asignación posterior de copys a slugs existentes
- ✅ Carga masiva de copys/slugs
  - ✅ Importación desde archivo CSV/Excel
  - ✅ Validación de datos durante la importación
  - ✅ Visualización previa antes de confirmar la importación

### Sprint 8: Soporte multilenguaje y mejoras UX ✅
- ✅ Soporte completo para idiomas adicionales
  - ✅ Ampliado soporte para incluir: Español, Inglés, Italiano, Alemán, Francés y Portugués
  - ✅ Selección de idioma en todos los formularios
  - ✅ Placeholders dinámicos acordes al idioma seleccionado
  - ✅ Vista de tabla con todos los idiomas soportados
  - ✅ Exportación JSON para todos los idiomas
  - ✅ Importación masiva compatible con todos los idiomas
- ⏳ Integración backend proxy seguro para OpenAI (pendiente)
- ⏳ Botón de sugerir traducción (pendiente)

### Sprint 9: Persistencia y versión Beta ⏳
- ⏳ Implementación de base de datos MongoDB
  - ⏳ Modelado de datos para copys/traducciones
  - ⏳ API para CRUD de copys con persistencia
  - ⏳ Migración de sistema en memoria a MongoDB
- ⏳ Despliegue de versión Beta
  - ⏳ Configuración de entorno de pruebas
  - ⏳ Documentación para usuarios beta

### Sprint 10: Flujo de revisión y feedback ⏳
- ⏳ Estado de traducción: pendiente, traducido, revisado, aprobado
- ⏳ Historial de cambios
- ⏳ Sistema de roles y permisos
  - ⏳ Roles definidos (Traductor, Revisor, Admin)
  - ⏳ Control de acceso basado en roles
  - ⏳ Flujos de aprobación según roles

### Sprint 11: Versionado de traducciones ⏳
- ⏳ Sistema de etiquetado de versiones para traducciones
  - ⏳ Crear releases de traducciones
  - ⏳ Comparación entre versiones
  - ⏳ Restauración de versiones anteriores
- ⏳ Asociación de traducciones con versiones de producto

### Sprint 12: Métricas y Analytics ⏳
- ⏳ Dashboard de métricas
  - ⏳ Progreso de traducción por idioma
  - ⏳ Tiempo de traducción/revisión
  - ⏳ Identificación de cuellos de botella
- ⏳ Reportes de calidad y consistencia
- ⏳ Exportación de reportes

### Sprint 13: Exportación avanzada y CI/CD ⏳
- ⏳ Exportación YAML
- ⏳ GitHub Actions: lint, test, validación, build y deploy

### Sprint 14: Documentación y ejemplos de integración frontend ⏳
- ⏳ Docs de integración con i18n
- ⏳ Ejemplo de uso en React

---

---

## Alcance

- Importar archivos Excel/CSV con copys y traducciones.
- Validar y convertir datos a archivos JSON/YAML por idioma.
- Dashboard para detectar y corregir errores comunes (slugs duplicados, copys sin traducir, inconsistencias, etc.).
- Edición y búsqueda de copys desde la interfaz.
- Sugerencia de traducciones automáticas vía OpenAI (ChatGPT).
- Exportación de archivos de traducción limpios.
- Control de acceso básico.
- Integración con CI/CD para validaciones automáticas y despliegue.

---

## Tecnologías

- **Frontend:** Next.js (React) + TypeScript
- **Backend:** Node.js (API REST para parsing, validaciones y proxy a OpenAI)
- **Parsing Excel:** Librería `xlsx` o similar
- **Validación:** Zod/Joi para esquemas y reglas de negocio
- **UI:** Chakra UI, Material UI o similar
- **Autenticación:** Google OAuth (opcional)
- **CI/CD:** GitHub Actions (lint, test, build, deploy)
- **Despliegue:** Vercel, Netlify o similar
- **Testing:** Jest + React Testing Library

---

## Estructura de directorios inicial

```
translation-manager/
│
├── README.md
├── package.json
├── next.config.js
├── public/
├── src/
│   ├── pages/           # Rutas Next.js
│   ├── components/      # Componentes UI
│   ├── utils/           # Utilidades (validaciones, helpers)
│   ├── services/        # Lógica de import/export, API OpenAI, etc.
│   ├── api/             # Endpoints backend (import, validación, traducción)
│   └── types/           # Tipado TypeScript
├── translations/        # Archivos JSON/YAML generados
├── .github/
│   └── workflows/       # CI/CD (lint, test, build, deploy)
└── ...
```

---

## Flujos de desarrollo y CI/CD

1. **Desarrollo local:**  
   - Pull Request → Lint + Test automáticos.
   - Validación de archivos de traducción en cada push.
   - Revisión de código por pares.

2. **CI/CD:**  
   - GitHub Actions:
     - Linter (ESLint, Prettier): `npm run lint`
     - Tests (Jest): `npm run test`
     - Validación de archivos de traducción: `npm run validate:json`
     - Validación completa: `npm run validate` (incluye lint + test + validación JSON)
     - Build y despliegue automático (Vercel/Netlify)

3. **Despliegue:**  
   - Preview de cada PR.
   - Producción tras merge en main.

---

## Primeros pasos

1. Clona el repositorio
2. Instala dependencias: `npm install --legacy-peer-deps` (necesario por compatibilidad de testing con React 19)
3. Arranca el entorno local: `npm run dev`
4. Ejecuta validaciones: `npm run validate`

---

## Integración con i18n en el frontend

La herramienta está diseñada para exportar archivos de traducción en formato JSON plano compatible con las principales librerías i18n de React/Next.js, como `react-i18next` o `next-i18next`. Para integrarlo en el frontend:

1. Instala la librería i18n en tu proyecto frontend:
   ```bash
   npm install react-i18next i18next
   ```
2. Copia los archivos generados (`es.json`, `en.json`, etc.) en la carpeta de recursos de tu frontend.
3. Configura i18next para cargar los archivos por idioma.
4. Usa el hook `useTranslation()` para mostrar los copys en los componentes.

_Ejemplo de uso:_
```jsx
import { useTranslation } from 'react-i18next';

function Login() {
  const { t } = useTranslation();
  return <h1>{t('login.title')}</h1>;
}
```

Más información: [react-i18next docs](https://react.i18next.com/)

---

## Roadmap inicial

1. **Estructura base del proyecto**
   - Next.js + TypeScript + configuración inicial
   - Estructura de carpetas y dependencias

2. **Importador de Excel/CSV**
   - Subida y parsing de archivos
   - Conversión a estructura interna

3. **Validaciones y dashboard de revisión**
   - Detección de slugs duplicados, copys vacíos, inconsistencias
   - Interfaz para revisar y corregir

4. **Edición y búsqueda de copys**
   - UI para editar, buscar y filtrar traducciones

5. **Integración con API de OpenAI para traducciones sugeridas**
   - Backend proxy seguro para OpenAI
   - Botón de "sugerir traducción" en la UI

6. **Exportación a JSON/YAML**
   - Generación de archivos por idioma compatibles con i18n

7. **Integración CI/CD y despliegue**
   - GitHub Actions: lint, test, validación, build y deploy

8. **Integración con el frontend (i18n)**
   - Documentación y ejemplo de uso con `react-i18next` o `next-i18next`

---

## Contribución

- Haz fork y PR para proponer cambios.
- Sigue las normas de estilo y convenciones del proyecto.
- Cualquier sugerencia o bug, abre un issue.

---

## Licencia

MIT
