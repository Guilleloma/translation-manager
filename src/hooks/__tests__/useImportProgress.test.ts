import { renderHook, act } from '@testing-library/react';
import { useImportProgress } from '../useImportProgress';

describe('useImportProgress', () => {
  it('inicializa con progreso inactivo', () => {
    const { result } = renderHook(() => useImportProgress());

    expect(result.current.progress.isActive).toBe(false);
    expect(result.current.progress.current).toBe(0);
    expect(result.current.progress.total).toBe(0);
    expect(result.current.progress.phase).toBe('validating');
    expect(result.current.progress.message).toBeUndefined();
    expect(result.current.progress.details).toBeUndefined();
  });

  it('inicia la importación correctamente', () => {
    const { result } = renderHook(() => useImportProgress());

    act(() => {
      result.current.startImport(100, 'Iniciando importación...');
    });

    expect(result.current.progress.isActive).toBe(true);
    expect(result.current.progress.current).toBe(0);
    expect(result.current.progress.total).toBe(100);
    expect(result.current.progress.phase).toBe('validating');
    expect(result.current.progress.message).toBe('Iniciando importación...');
    expect(result.current.progress.details).toEqual({
      processed: 0,
      errors: 0,
      warnings: 0
    });
  });

  it('usa mensaje por defecto cuando no se proporciona', () => {
    const { result } = renderHook(() => useImportProgress());

    act(() => {
      result.current.startImport(50);
    });

    expect(result.current.progress.message).toBe('Preparando importación de 50 elementos...');
  });

  it('actualiza el progreso correctamente', () => {
    const { result } = renderHook(() => useImportProgress());

    // Primero iniciar la importación
    act(() => {
      result.current.startImport(100);
    });

    // Luego actualizar el progreso
    act(() => {
      result.current.updateProgress(25, 'importing', 'Procesando elementos...', {
        processed: 20,
        errors: 3,
        warnings: 2
      });
    });

    expect(result.current.progress.current).toBe(25);
    expect(result.current.progress.phase).toBe('importing');
    expect(result.current.progress.message).toBe('Procesando elementos...');
    expect(result.current.progress.details).toEqual({
      processed: 20,
      errors: 3,
      warnings: 2
    });
  });

  it('cambia a fase de importación', () => {
    const { result } = renderHook(() => useImportProgress());

    act(() => {
      result.current.startImport(100);
    });

    act(() => {
      result.current.startImporting('Importando datos...');
    });

    expect(result.current.progress.phase).toBe('importing');
    expect(result.current.progress.message).toBe('Importando datos...');
  });

  it('usa mensaje por defecto para startImporting', () => {
    const { result } = renderHook(() => useImportProgress());

    act(() => {
      result.current.startImport(100);
    });

    act(() => {
      result.current.startImporting();
    });

    expect(result.current.progress.message).toBe('Importando datos al sistema...');
  });

  it('completa la importación correctamente', () => {
    const { result } = renderHook(() => useImportProgress());

    act(() => {
      result.current.startImport(100);
    });

    act(() => {
      result.current.completeImport('Importación completada exitosamente', {
        processed: 100,
        errors: 0,
        warnings: 5
      });
    });

    expect(result.current.progress.phase).toBe('completed');
    expect(result.current.progress.current).toBe(100);
    expect(result.current.progress.message).toBe('Importación completada exitosamente');
    expect(result.current.progress.details).toEqual({
      processed: 100,
      errors: 0,
      warnings: 5
    });
  });

  it('maneja errores en la importación', () => {
    const { result } = renderHook(() => useImportProgress());

    act(() => {
      result.current.startImport(100);
    });

    act(() => {
      result.current.failImport('Error durante la importación');
    });

    expect(result.current.progress.phase).toBe('error');
    expect(result.current.progress.message).toBe('Error durante la importación');
  });

  it('usa mensaje por defecto para errores', () => {
    const { result } = renderHook(() => useImportProgress());

    act(() => {
      result.current.startImport(100);
    });

    act(() => {
      result.current.failImport();
    });

    expect(result.current.progress.message).toBe('Error durante la importación');
  });

  it('descarta el progreso correctamente', () => {
    const { result } = renderHook(() => useImportProgress());

    // Primero iniciar y completar una importación
    act(() => {
      result.current.startImport(100);
    });

    act(() => {
      result.current.completeImport('Completado');
    });

    // Luego descartar (solo cambia isActive a false, mantiene el resto)
    act(() => {
      result.current.dismissProgress();
    });

    expect(result.current.progress.isActive).toBe(false);
    // El resto de los valores se mantienen después de dismiss
    expect(result.current.progress.current).toBe(100);
    expect(result.current.progress.total).toBe(100);
    expect(result.current.progress.phase).toBe('completed');
    expect(result.current.progress.message).toBe('Completado');
  });

  it('reinicia el progreso correctamente', () => {
    const { result } = renderHook(() => useImportProgress());

    // Primero iniciar una importación
    act(() => {
      result.current.startImport(100, 'Test');
    });

    // Luego reiniciar
    act(() => {
      result.current.resetProgress();
    });

    expect(result.current.progress.isActive).toBe(false);
    expect(result.current.progress.current).toBe(0);
    expect(result.current.progress.total).toBe(0);
    expect(result.current.progress.phase).toBe('validating');
    expect(result.current.progress.message).toBeUndefined();
    expect(result.current.progress.details).toBeUndefined();
  });

  it('mantiene la estabilidad de las funciones entre renders', () => {
    const { result, rerender } = renderHook(() => useImportProgress());

    const initialFunctions = {
      startImport: result.current.startImport,
      updateProgress: result.current.updateProgress,
      startImporting: result.current.startImporting,
      completeImport: result.current.completeImport,
      failImport: result.current.failImport,
      resetProgress: result.current.resetProgress,
      dismissProgress: result.current.dismissProgress
    };

    rerender();

    expect(result.current.startImport).toBe(initialFunctions.startImport);
    expect(result.current.updateProgress).toBe(initialFunctions.updateProgress);
    expect(result.current.startImporting).toBe(initialFunctions.startImporting);
    expect(result.current.completeImport).toBe(initialFunctions.completeImport);
    expect(result.current.failImport).toBe(initialFunctions.failImport);
    expect(result.current.resetProgress).toBe(initialFunctions.resetProgress);
    expect(result.current.dismissProgress).toBe(initialFunctions.dismissProgress);
  });

  it('permite múltiples actualizaciones de progreso', () => {
    const { result } = renderHook(() => useImportProgress());

    act(() => {
      result.current.startImport(100);
    });

    act(() => {
      result.current.updateProgress(25, 'importing', 'Primer lote');
    });

    act(() => {
      result.current.updateProgress(50, 'importing', 'Segundo lote');
    });

    act(() => {
      result.current.updateProgress(75, 'importing', 'Tercer lote');
    });

    expect(result.current.progress.current).toBe(75);
    expect(result.current.progress.message).toBe('Tercer lote');
  });
});
