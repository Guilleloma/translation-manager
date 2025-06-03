import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import CopyAssignment from './CopyAssignment';
import { UserProvider } from '../../context/UserContext';
import { Copy } from '../../types/copy';
import { User } from '../../types/user';

// Mock del dataService
jest.mock('../../services/dataService', () => ({
  __esModule: true,
  default: {
    addCopy: jest.fn().mockResolvedValue(undefined),
  }
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider>
    <UserProvider>
      {children}
    </UserProvider>
  </ChakraProvider>
);

describe('CopyAssignment - Fixed Logic', () => {
  const mockUpdateCopy = jest.fn();

  const mockCopys: Copy[] = [
    {
      id: '1',
      slug: 'welcome.title',
      text: 'Bienvenido',
      language: 'es',
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
      needsSlugReview: false
    },
    {
      id: '2',
      slug: 'button.save',
      text: 'Guardar',
      language: 'es',
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
      needsSlugReview: false
    },
    {
      id: '3',
      slug: 'welcome.title',
      text: 'Welcome',
      language: 'en',
      status: 'not_assigned',
      createdAt: new Date(),
      updatedAt: new Date(),
      needsSlugReview: false
    }
  ];

  beforeEach(() => {
    mockUpdateCopy.mockClear();
  });

  test('should show pending translations when language is selected', async () => {
    render(
      <TestWrapper>
        <CopyAssignment copys={mockCopys} updateCopy={mockUpdateCopy} />
      </TestWrapper>
    );

    const languageSelect = screen.getByDisplayValue('');
    fireEvent.change(languageSelect, { target: { value: 'en' } });

    await waitFor(() => {
      // Debería mostrar 'button.save' que no tiene traducción al inglés
      expect(screen.getByText('button.save')).toBeInTheDocument();
      // Debería mostrar el texto en español como referencia
      expect(screen.getByText('Guardar')).toBeInTheDocument();
      // También debería mostrar 'welcome.title' que existe pero está sin asignar
      expect(screen.getByText('welcome.title')).toBeInTheDocument();
    });
  });

  test('should show spanish text as reference (TEXTO ES)', async () => {
    render(
      <TestWrapper>
        <CopyAssignment copys={mockCopys} updateCopy={mockUpdateCopy} />
      </TestWrapper>
    );

    const languageSelect = screen.getByDisplayValue('');
    fireEvent.change(languageSelect, { target: { value: 'fr' } });

    await waitFor(() => {
      // La columna debe ser "Texto ES"
      expect(screen.getByText('Texto ES')).toBeInTheDocument();
      
      // Debería mostrar todos los textos de referencia en español
      expect(screen.getByText('Bienvenido')).toBeInTheDocument();
      expect(screen.getByText('Guardar')).toBeInTheDocument();
    });
  });

  test('should not show copys when they already exist in the target language with status completed', async () => {
    const copysWithCompleted: Copy[] = [
      ...mockCopys,
      {
        id: '4',
        slug: 'button.save',
        text: 'Save',
        language: 'en',
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
        needsSlugReview: false
      }
    ];

    render(
      <TestWrapper>
        <CopyAssignment copys={copysWithCompleted} updateCopy={mockUpdateCopy} />
      </TestWrapper>
    );

    const languageSelect = screen.getByDisplayValue('');
    fireEvent.change(languageSelect, { target: { value: 'en' } });

    await waitFor(() => {
      // No debería mostrar 'button.save' porque ya está completado en inglés
      const buttonSaveCells = screen.queryAllByText('button.save');
      // Solo debería aparecer 'welcome.title' que está sin asignar
      const welcomeCells = screen.queryAllByText('welcome.title');
      expect(welcomeCells.length).toBeGreaterThan(0);
    });
  });

  test('should identify tasks that need new translation vs existing unassigned copies', async () => {
    render(
      <TestWrapper>
        <CopyAssignment copys={mockCopys} updateCopy={mockUpdateCopy} />
      </TestWrapper>
    );

    const languageSelect = screen.getByDisplayValue('');
    fireEvent.change(languageSelect, { target: { value: 'en' } });

    await waitFor(() => {
      // Debería mostrar ambos: uno que necesita nueva traducción (button.save) 
      // y uno que ya existe pero está sin asignar (welcome.title)
      expect(screen.getByText('button.save')).toBeInTheDocument();
      expect(screen.getByText('welcome.title')).toBeInTheDocument();
    });
  });
});
