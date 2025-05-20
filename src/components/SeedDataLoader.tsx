'use client';

import { useEffect } from 'react';
import { loadSeedData } from '../utils/seedData';

/**
 * Componente invisible que se encarga de cargar los datos semilla cuando
 * la aplicación se inicia por primera vez.
 */
export default function SeedDataLoader() {
  useEffect(() => {
    // Carga los datos semilla solo si no existen datos en localStorage
    loadSeedData();
  }, []);

  // Este componente no renderiza nada, solo ejecuta la lógica
  return null;
}
