import { useState, useCallback } from 'react';
import { ImportProgress } from '../components/common/ImportProgressIndicator';

/**
 * Hook personalizado para manejar el estado del progreso de importación masiva
 * 
 * Proporciona funciones para iniciar, actualizar y finalizar el progreso de importación,
 * manteniendo un estado centralizado que puede ser consumido por múltiples componentes.
 */
export const useImportProgress = () => {
  const [progress, setProgress] = useState<ImportProgress>({
    isActive: false,
    current: 0,
    total: 0,
    phase: 'validating'
  });

  /**
   * Inicia el proceso de importación con el total de elementos a procesar
   */
  const startImport = useCallback((total: number, message?: string) => {
    console.log(`[ImportProgress] Iniciando importación de ${total} elementos`);
    setProgress({
      isActive: true,
      current: 0,
      total,
      phase: 'validating',
      message: message || `Preparando importación de ${total} elementos...`,
      details: {
        processed: 0,
        errors: 0,
        warnings: 0
      }
    });
  }, []);

  /**
   * Actualiza el progreso actual de la importación
   */
  const updateProgress = useCallback((
    current: number, 
    phase?: ImportProgress['phase'],
    message?: string,
    details?: ImportProgress['details']
  ) => {
    setProgress(prev => {
      const newProgress = {
        ...prev,
        current,
        phase: phase || prev.phase,
        message: message || prev.message,
        details: details || prev.details
      };
      
      console.log(`[ImportProgress] Actualizando progreso: ${current}/${prev.total} (${Math.round((current / prev.total) * 100)}%)`);
      return newProgress;
    });
  }, []);

  /**
   * Cambia a la fase de importación
   */
  const startImporting = useCallback((message?: string) => {
    console.log('[ImportProgress] Iniciando fase de importación');
    setProgress(prev => ({
      ...prev,
      phase: 'importing',
      message: message || 'Importando datos al sistema...'
    }));
  }, []);

  /**
   * Marca la importación como completada
   */
  const completeImport = useCallback((message?: string, details?: ImportProgress['details']) => {
    console.log('[ImportProgress] Importación completada');
    setProgress(prev => ({
      ...prev,
      phase: 'completed',
      current: prev.total,
      message: message || `Importación completada exitosamente`,
      details: details || prev.details
    }));
  }, []);

  /**
   * Marca la importación como fallida
   */
  const failImport = useCallback((message?: string) => {
    console.error('[ImportProgress] Error en la importación:', message);
    setProgress(prev => ({
      ...prev,
      phase: 'error',
      message: message || 'Error durante la importación'
    }));
  }, []);

  /**
   * Reinicia el estado del progreso
   */
  const resetProgress = useCallback(() => {
    console.log('[ImportProgress] Reiniciando estado del progreso');
    setProgress({
      isActive: false,
      current: 0,
      total: 0,
      phase: 'validating'
    });
  }, []);

  /**
   * Cierra el indicador de progreso (para cuando se completa exitosamente)
   */
  const dismissProgress = useCallback(() => {
    console.log('[ImportProgress] Cerrando indicador de progreso');
    setProgress(prev => ({
      ...prev,
      isActive: false
    }));
  }, []);

  return {
    progress,
    startImport,
    updateProgress,
    startImporting,
    completeImport,
    failImport,
    resetProgress,
    dismissProgress
  };
};
