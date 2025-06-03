import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TagManager } from '../TagManager';
import { Copy, CopyStatus } from '../../../types/copy';
import { ChakraProvider } from '@chakra-ui/react';
import { UserProvider } from '../../../context/UserContext';

// Mock el contexto de usuario
jest.mock('../../../context/UserContext', () => ({
  useUser: jest.fn(() => ({
    currentUser: {
      id: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com',
      role: 'ADMIN'
    },
    isAuthenticated: true
  })),
  UserProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Datos de prueba
const mockCopyWithTags: Copy = {
  id: 'copy1',
  slug: 'test-copy',
  text: 'Este es un texto de prueba',
  language: 'es',
  status: 'not_assigned' as CopyStatus,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-02'),
  tags: ['importante', 'test', 'ui']
};

const mockCopyWithoutTags: Copy = {
  id: 'copy2',
  slug: 'test-copy-no-tags',
  text: 'Este es otro texto de prueba',
  language: 'en',
  status: 'not_assigned' as CopyStatus,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-02'),
  tags: []
};

const mockCopyWithInvalidTags: Copy = {
  id: 'copy3',
  slug: 'test-copy-invalid-tags',
  text: 'Este es un texto con tags inválidos',
  language: 'fr',
  status: 'not_assigned' as CopyStatus,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-02'),
  // @ts-ignore - Simulamos tags inválidos a propósito para pruebas
  tags: null
};

describe('TagManager Component', () => {
  // Mock para toast de Chakra UI
  const mockToast = jest.fn();
  jest.mock('@chakra-ui/react', () => {
    const originalModule = jest.requireActual('@chakra-ui/react');
    return {
      ...originalModule,
      useToast: () => mockToast
    };
  });

  const onTagsChange = jest.fn();
  
  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <ChakraProvider>
        <UserProvider>
          {ui}
        </UserProvider>
      </ChakraProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Renderiza los tags existentes correctamente', () => {
    renderWithProviders(
      <TagManager 
        copy={mockCopyWithTags} 
        onTagsChange={onTagsChange} 
      />
    );
    
    // Verificar que cada tag esté presente
    expect(screen.getByText('importante')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('ui')).toBeInTheDocument();
  });

  test('Muestra mensaje cuando no hay tags', () => {
    renderWithProviders(
      <TagManager 
        copy={mockCopyWithoutTags} 
        onTagsChange={onTagsChange} 
      />
    );
    
    // Verificar mensaje para sin etiquetas
    expect(screen.getByText('Sin etiquetas')).toBeInTheDocument();
  });

  test('Maneja tags inválidos o nulos sin errores', () => {
    renderWithProviders(
      <TagManager 
        copy={mockCopyWithInvalidTags} 
        onTagsChange={onTagsChange} 
      />
    );
    
    // Verificar mensaje para sin etiquetas cuando los tags son inválidos
    expect(screen.getByText('Sin etiquetas')).toBeInTheDocument();
  });

  // Este test verifica que se muestra el botón de añadir etiqueta
  test('Muestra el botón para añadir etiquetas', () => {
    renderWithProviders(
      <TagManager 
        copy={mockCopyWithTags} 
        onTagsChange={onTagsChange} 
      />
    );
    
    const addButton = screen.getByText('Añadir etiqueta');
    expect(addButton).toBeInTheDocument();
  });
  
  // Función auxiliar para logging
  console.log('Tests para verificar la correcta visualización y manejo de etiquetas');
});
