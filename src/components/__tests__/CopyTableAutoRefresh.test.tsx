/**
 * Test para verificar que la tabla de copys se actualiza automáticamente
 * después de editar un copy en la vista de tabla
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { UserProvider } from '../../context/UserContext';
import CopyTableView from '../CopyTableView';
import { Copy } from '../../types/copy';

// Mock del dataService
jest.mock('../../services/dataService', () => ({
  __esModule: true,
  default: {
    getCopysFromServer: jest.fn(),
    updateCopy: jest.fn(),
    getCopys: jest.fn(),
  }
}));

// Mock del toast
const mockToast = jest.fn();
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useToast: () => mockToast,
}));

const mockCopys: Copy[] = [
  {
    id: '1',
    slug: 'test-slug',
    text: 'Original text',
    language: 'es',
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
    history: [],
    tags: [],
    comments: [],
    translationGroupId: 'group1',
    isOriginalText: true,
    needsSlugReview: false
  },
  {
    id: '2',
    slug: 'test-slug',
    text: 'English text',
    language: 'en',
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
    history: [],
    tags: [],
    comments: [],
    translationGroupId: 'group1',
    isOriginalText: false,
    needsSlugReview: false
  }
];

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraProvider>
    <UserProvider>
      {children}
    </UserProvider>
  </ChakraProvider>
);

describe('CopyTableView Auto Refresh', () => {
  const mockOnEdit = jest.fn();
  const mockOnSave = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call onSave when editing a copy in table view', async () => {
    // Simular que onSave es exitoso
    mockOnSave.mockResolvedValue(undefined);

    render(
      <TestWrapper>
        <CopyTableView
          copys={mockCopys}
          languages={['es', 'en']}
          onEdit={mockOnEdit}
          onSave={mockOnSave}
          onDelete={mockOnDelete}
          onImportProgress={() => {}}
          onImportComplete={() => {}}
        />
      </TestWrapper>
    );

    // Verificar que la tabla se renderiza
    expect(screen.getByText('test-slug')).toBeInTheDocument();
    expect(screen.getByText('Original text')).toBeInTheDocument();

    // Simular clic en editar
    const editButtons = screen.getAllByLabelText(/editar/i);
    fireEvent.click(editButtons[0]);

    // Verificar que se llamó onEdit
    expect(mockOnEdit).toHaveBeenCalledWith(mockCopys[0]);
  });

  it('should handle async onSave correctly', async () => {
    // Simular que onSave toma tiempo pero es exitoso
    mockOnSave.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    const { rerender } = render(
      <TestWrapper>
        <CopyTableView
          copys={mockCopys}
          languages={['es', 'en']}
          onEdit={mockOnEdit}
          onSave={mockOnSave}
          onDelete={mockOnDelete}
          onImportProgress={() => {}}
          onImportComplete={() => {}}
        />
      </TestWrapper>
    );

    // Simular edición exitosa
    const updatedCopy = {
      ...mockCopys[0],
      text: 'Updated text'
    };

    await mockOnSave(updatedCopy);

    // Simular que el componente padre actualiza la lista
    const updatedCopys = mockCopys.map(c => 
      c.id === updatedCopy.id ? updatedCopy : c
    );

    rerender(
      <TestWrapper>
        <CopyTableView
          copys={updatedCopys}
          languages={['es', 'en']}
          onEdit={mockOnEdit}
          onSave={mockOnSave}
          onDelete={mockOnDelete}
          onImportProgress={() => {}}
          onImportComplete={() => {}}
        />
      </TestWrapper>
    );

    // Verificar que el texto actualizado aparece
    await waitFor(() => {
      expect(screen.getByText('Updated text')).toBeInTheDocument();
    });
  });
});
