---
description: Follow the Branch & Main changes process
---

# Workflow de Control de Versiones

## Proceso de trabajo con ramas

1. Cada característica o corrección se desarrolla en su propia rama
   ```bash
   git checkout -b feature/nombre-de-caracteristica
   ```

2. Realizar cambios, commits y pruebas en la rama de características
   ```bash
   git add .
   git commit -m "Descripción detallada del cambio"
   ```

3. Cuando la característica esté lista, hacer push de la rama
   ```bash
   git push origin feature/nombre-de-caracteristica
   ```

4. Cambiar a la rama principal
   ```bash
   git checkout main
   ```

5. Realizar el merge SIN fast-forward para mantener el historial de commits
   ```bash
   git merge --no-ff feature/nombre-de-caracteristica -m "Merge: Integración de nombre-de-caracteristica"
   ```

6. Realizar push de la rama principal con el merge
   ```bash
   git push origin main
   ```

> **IMPORTANTE**: El paso clave es usar `--no-ff` en el merge para preservar el historial completo de la rama de características, lo que facilita el seguimiento y comprensión de los cambios.