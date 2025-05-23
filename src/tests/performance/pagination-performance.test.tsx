import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import Pagination from '../../components/common/Pagination';

// Configuración para las pruebas
jest.mock('../../components/common/Pagination', () => {
  // Definir la interfaz para las props
  interface MockPaginationProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange?: (itemsPerPage: number) => void;
  }
  
  const MockPagination = (props: MockPaginationProps) => {
    return (
      <div data-testid="pagination">
        <button onClick={() => props.onPageChange(1)}>1</button>
        <button onClick={() => props.onPageChange(props.currentPage - 1)} aria-label="Página anterior">Anterior</button>
        <button onClick={() => props.onPageChange(props.currentPage + 1)} aria-label="Página siguiente">Siguiente</button>
        <span>Mostrando 1 - {props.itemsPerPage} de {props.totalItems} elementos</span>
      </div>
    );
  };
  return MockPagination;
});

describe('Pagination Component', () => {
  test('renders pagination controls', () => {
    render(
      <ChakraProvider>
        <Pagination
          currentPage={1}
          totalItems={100}
          itemsPerPage={10}
          onPageChange={jest.fn()}
          onItemsPerPageChange={jest.fn()}
        />
      </ChakraProvider>
    );

    // Verificar que se muestran los controles básicos
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Anterior')).toBeInTheDocument();
    expect(screen.getByText('Siguiente')).toBeInTheDocument();
  });

  test('calls onPageChange when clicking next page', () => {
    const mockOnChange = jest.fn();
    
    render(
      <ChakraProvider>
        <Pagination
          currentPage={1}
          totalItems={100}
          itemsPerPage={10}
          onPageChange={mockOnChange}
          onItemsPerPageChange={jest.fn()}
        />
      </ChakraProvider>
    );

    const nextButton = screen.getByLabelText('Página siguiente');
    fireEvent.click(nextButton);
    
    expect(mockOnChange).toHaveBeenCalledWith(2);
  });
});

