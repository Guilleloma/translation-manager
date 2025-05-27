#!/bin/bash

# Script para ejecutar tests de MongoDB después de verificar que está ejecutándose
# Uso: ./scripts/run-mongodb-tests.sh [patrón-de-test]

# Primero verificar que MongoDB esté ejecutándose
./scripts/check-mongodb.sh

# Si MongoDB no está ejecutándose, el script anterior intentará iniciarlo
# Si falla, este script se detendrá debido al código de salida
if [ $? -ne 0 ]; then
  echo "❌ No se pudo iniciar MongoDB. No se pueden ejecutar los tests."
  exit 1
fi

# Patrón de test opcional
TEST_PATTERN=$1

echo "🧪 Ejecutando tests de MongoDB..."

if [ -z "$TEST_PATTERN" ]; then
  # Ejecutar todos los tests de MongoDB
  echo "🔍 Ejecutando todos los tests de MongoDB"
  npx jest --config jest.config.mongodb.js
else
  # Ejecutar tests específicos
  echo "🔍 Ejecutando tests que coinciden con el patrón: $TEST_PATTERN"
  npx jest --config jest.config.mongodb.js --testNamePattern="$TEST_PATTERN"
fi

# Guardar el código de salida de los tests
TEST_EXIT_CODE=$?

# Mostrar resultado
if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo "✅ Todos los tests pasaron correctamente"
else
  echo "❌ Algunos tests fallaron. Revisa los errores arriba."
fi

# Crear un log de los resultados para debugging
echo "📝 Guardando resultados en logs/mongodb-tests.log"
mkdir -p logs
echo "MongoDB Tests - $(date)" > logs/mongodb-tests.log
echo "Patrón de test: ${TEST_PATTERN:-'Todos los tests'}" >> logs/mongodb-tests.log
echo "Código de salida: $TEST_EXIT_CODE" >> logs/mongodb-tests.log
echo "-----------------------------------" >> logs/mongodb-tests.log

exit $TEST_EXIT_CODE
