import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ImportProgressState {
  isImporting: boolean;
  current: number;
  total: number;
  status: 'idle' | 'processing' | 'success' | 'error';
  message: string;
}

interface ImportProgressContextType {
  progress: ImportProgressState;
  startImport: (total: number, message?: string) => void;
  updateProgress: (current: number, message?: string) => void;
  completeImport: (success?: boolean, message?: string) => void;
  resetProgress: () => void;
}

const initialState: ImportProgressState = {
  isImporting: false,
  current: 0,
  total: 0,
  status: 'idle',
  message: ''
};

const ImportProgressContext = createContext<ImportProgressContextType | undefined>(undefined);

export const ImportProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<ImportProgressState>(initialState);

  const startImport = (total: number, message = 'Importando traducciones...') => {
    setProgress({
      isImporting: true,
      current: 0,
      total,
      status: 'processing',
      message
    });
    
    // Log para debugging
    console.log(`Iniciando importación de ${total} elementos`);
  };

  const updateProgress = (current: number, message?: string) => {
    setProgress(prev => ({
      ...prev,
      current,
      message: message || prev.message
    }));
    
    // Log para debugging
    console.log(`Progreso de importación: ${current}/${progress.total}`);
  };

  const completeImport = (success = true, message?: string) => {
    setProgress(prev => ({
      ...prev,
      isImporting: false,
      status: success ? 'success' : 'error',
      message: message || (success ? 'Importación completada con éxito' : 'Error durante la importación')
    }));
    
    // Resetear automáticamente después de unos segundos
    setTimeout(() => {
      if (success) {
        resetProgress();
      }
    }, 5000);
    
    // Log para debugging
    console.log(`Importación ${success ? 'completada' : 'fallida'}: ${message}`);
  };

  const resetProgress = () => {
    setProgress(initialState);
  };

  return (
    <ImportProgressContext.Provider
      value={{
        progress,
        startImport,
        updateProgress,
        completeImport,
        resetProgress
      }}
    >
      {children}
    </ImportProgressContext.Provider>
  );
};

export const useImportProgress = (): ImportProgressContextType => {
  const context = useContext(ImportProgressContext);
  if (context === undefined) {
    throw new Error('useImportProgress must be used within an ImportProgressProvider');
  }
  return context;
};
