# Exportación a Google Sheets

## Descripción
Esta funcionalidad permite exportar todas las traducciones del sistema a un archivo CSV con formato compatible con Google Sheets. El formato de exportación es una estructura plana donde cada fila representa un slug y las columnas representan los diferentes idiomas disponibles.

## Características principales
- Exportación en formato CSV optimizado para Google Sheets
- Estructura con columnas estándar: `slug, en_GB, es_ES, it_IT, en_US, de_DE, fr_FR, pt_PT, pt_BR`
- Soporte para filtrar por idioma específico o exportar todos los idiomas
- Nombres de archivo con fecha para mejor organización

## Cómo probar la funcionalidad

### Requisitos previos
1. Tener copys creados en el sistema en diferentes idiomas
2. Tener acceso a Google Sheets o cualquier herramienta que pueda abrir archivos CSV

### Pasos para probar la exportación a Google Sheets

1. **Acceder a la aplicación**
   - Inicia sesión en la aplicación Translation Manager
   - Navega a la pantalla principal donde se muestran los copys

2. **Seleccionar idiomas para exportar**
   - En el selector de idiomas de exportación, selecciona:
     - "Todos" para exportar las traducciones en todos los idiomas disponibles
     - Un idioma específico (ej: "Español", "Inglés", etc.) para exportar solo ese idioma

3. **Realizar la exportación**
   - Haz clic en el botón "Google Sheets" en la barra de herramientas
   - Se generará y descargará automáticamente un archivo CSV con el formato adecuado
   - El nombre del archivo seguirá el patrón: `translations-gs-[idioma]-[fecha].csv`

4. **Importar a Google Sheets**
   - Abre Google Sheets en tu navegador
   - Crea una nueva hoja de cálculo
   - Ve a Archivo > Importar > Subir > selecciona el archivo CSV descargado
   - En opciones de importación, asegúrate de seleccionar:
     - "Reemplazar hoja de cálculo"
     - "Detectar automáticamente" para el separador
     - Hacer clic en "Importar datos"

5. **Verificar el resultado**
   - Comprueba que la primera fila contiene los encabezados correctos: `slug, en_GB, es_ES, it_IT, en_US, de_DE, fr_FR, pt_PT, pt_BR`
   - Verifica que cada fila contiene un slug único y sus traducciones correspondientes
   - Confirma que los caracteres especiales (acentos, símbolos) se muestran correctamente

### Comportamiento esperado
- El archivo CSV debe contener todos los slugs disponibles en el sistema
- Cada columna de idioma debe mostrar la traducción correspondiente para cada slug
- Los slugs sin traducción en algún idioma deben mostrar la celda vacía para ese idioma
- El archivo debe poder importarse a Google Sheets sin problemas de formato

### Pruebas adicionales
- Prueba a exportar con solo unos pocos copys en el sistema
- Prueba a exportar con muchos copys para verificar el rendimiento
- Intenta exportar después de realizar cambios en las traducciones para confirmar que se reflejan en la exportación
- Verifica el comportamiento cuando hay slugs con caracteres especiales o muy largos

## Resolución de problemas
- Si algún carácter especial no se muestra correctamente, asegúrate de que Google Sheets detecta el archivo como UTF-8
- En caso de problemas de importación, también puedes abrir el CSV con Excel y luego guardarlo como XLSX para usarlo en Google Sheets
