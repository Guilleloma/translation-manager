import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { ImportProgressIndicator, ImportProgress } from '../ImportProgressIndicator';

// Wrapper para ChakraUI
const ChakraWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraProvider>{children}</ChakraProvider>
);

describe('ImportProgressIndicator', () => {
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProgress: ImportProgress = {
    isActive: true,
    current: 50,
    total: 100,
    phase: 'importing',
    message: 'Procesando datos...',
    details: {
      processed: 45,
      errors: 2,
      warnings: 3
    }
  };

  it('no se renderiza cuando isActive es false', () => {
    const inactiveProgress = { ...defaultProgress, isActive: false };
    
    render(
      <ChakraWrapper>
        <ImportProgressIndicator progress={inactiveProgress} onDismiss={mockOnDismiss} />
      </ChakraWrapper>
    );

    expect(screen.queryByText('Importación masiva')).not.toBeInTheDocument();
  });

  it('se renderiza correctamente cuando isActive es true', () => {
    render(
      <ChakraWrapper>
        <ImportProgressIndicator progress={defaultProgress} onDismiss={mockOnDismiss} />
      </ChakraWrapper>
    );

    expect(screen.getByText('Importación masiva')).toBeInTheDocument();
    expect(screen.getByText('Importando')).toBeInTheDocument();
    expect(screen.getByText('50 / 100')).toBeInTheDocument();
    expect(screen.getByText('Procesando datos...')).toBeInTheDocument();
  });

  it('muestra los detalles correctamente', () => {
    render(
      <ChakraWrapper>
        <ImportProgressIndicator progress={defaultProgress} onDismiss={mockOnDismiss} />
      </ChakraWrapper>
    );

    expect(screen.getByText('Procesados: 45')).toBeInTheDocument();
    expect(screen.getByText('Errores: 2')).toBeInTheDocument();
    expect(screen.getByText('Advertencias: 3')).toBeInTheDocument();
  });

  it('muestra el color correcto según la fase', () => {
    const validatingProgress = { ...defaultProgress, phase: 'validating' as const };
    const { rerender } = render(
      <ChakraWrapper>
        <ImportProgressIndicator progress={validatingProgress} onDismiss={mockOnDismiss} />
      </ChakraWrapper>
    );

    expect(screen.getByText('Validando datos')).toBeInTheDocument();

    const completedProgress = { ...defaultProgress, phase: 'completed' as const };
    rerender(
      <ChakraWrapper>
        <ImportProgressIndicator progress={completedProgress} onDismiss={mockOnDismiss} />
      </ChakraWrapper>
    );

    expect(screen.getByText('Completado')).toBeInTheDocument();
  });

  it('permite expandir y contraer los detalles', () => {
    render(
      <ChakraWrapper>
        <ImportProgressIndicator progress={defaultProgress} onDismiss={mockOnDismiss} />
      </ChakraWrapper>
    );

    const toggleButton = screen.getByLabelText('Contraer detalles');
    fireEvent.click(toggleButton);

    // Después de contraer, el botón debería cambiar su label
    expect(screen.getByLabelText('Expandir detalles')).toBeInTheDocument();
  });

  it('muestra el botón de cerrar solo cuando está completado', () => {
    const completedProgress = { ...defaultProgress, phase: 'completed' as const };
    
    render(
      <ChakraWrapper>
        <ImportProgressIndicator progress={completedProgress} onDismiss={mockOnDismiss} />
      </ChakraWrapper>
    );

    const closeButton = screen.getByLabelText('Cerrar indicador');
    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton);
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('no muestra el botón de cerrar cuando no está completado', () => {
    render(
      <ChakraWrapper>
        <ImportProgressIndicator progress={defaultProgress} onDismiss={mockOnDismiss} />
      </ChakraWrapper>
    );

    expect(screen.queryByLabelText('Cerrar indicador')).not.toBeInTheDocument();
  });

  it('calcula correctamente el porcentaje de progreso', () => {
    const progress25 = { ...defaultProgress, current: 25, total: 100 };
    
    render(
      <ChakraWrapper>
        <ImportProgressIndicator progress={progress25} onDismiss={mockOnDismiss} />
      </ChakraWrapper>
    );

    expect(screen.getByText('25 / 100')).toBeInTheDocument();
  });

  it('maneja el caso cuando total es 0', () => {
    const zeroProgress = { ...defaultProgress, current: 0, total: 0 };
    
    render(
      <ChakraWrapper>
        <ImportProgressIndicator progress={zeroProgress} onDismiss={mockOnDismiss} />
      </ChakraWrapper>
    );

    expect(screen.getByText('0 / 0')).toBeInTheDocument();
  });

  it('no muestra advertencias y errores cuando son 0', () => {
    const cleanProgress = {
      ...defaultProgress,
      details: {
        processed: 50,
        errors: 0,
        warnings: 0
      }
    };
    
    render(
      <ChakraWrapper>
        <ImportProgressIndicator progress={cleanProgress} onDismiss={mockOnDismiss} />
      </ChakraWrapper>
    );

    expect(screen.getByText('Procesados: 50')).toBeInTheDocument();
    expect(screen.queryByText('Errores:')).not.toBeInTheDocument();
    expect(screen.queryByText('Advertencias:')).not.toBeInTheDocument();
  });
});
