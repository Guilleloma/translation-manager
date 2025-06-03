import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChangeHistory } from '../ChangeHistory';
import { CopyHistory, CopyStatus } from '../../../types/copy';
import { ChakraProvider } from '@chakra-ui/react';

// Mock data
const validHistory: CopyHistory[] = [
  {
    id: '1',
    copyId: 'copy1',
    userId: 'user1',
    userName: 'Test User',
    previousStatus: 'not_assigned' as CopyStatus,
    newStatus: 'assigned' as CopyStatus,
    previousText: 'Texto anterior',
    newText: 'Texto nuevo',
    createdAt: new Date('2023-01-01T12:00:00Z'),
    comments: 'Comentario de prueba'
  },
  {
    id: '2', 
    copyId: 'copy1',
    userId: 'user1',
    userName: 'Test User',
    previousStatus: 'assigned' as CopyStatus,
    newStatus: 'approved' as CopyStatus,
    createdAt: new Date('2023-01-02T12:00:00Z')
  }
];

const problemHistory: CopyHistory[] = [
  {
    id: '3',
    copyId: 'copy2',
    userId: 'user2',
    userName: 'Problem User',
    previousText: '(Texto Sugerido)',
    newText: '(Texto Sugerido)',
    createdAt: new Date('2023-01-03T12:00:00Z')
  },
  {
    id: '', // ID inválido
    copyId: 'copy2',
    userId: 'user2',
    userName: 'Invalid ID User',
    previousText: 'Algún texto',
    newText: 'Texto cambiado',
    createdAt: new Date('2023-01-04T12:00:00Z')
  }
];

describe('ChangeHistory Component', () => {
  const renderWithChakra = (ui: React.ReactElement) => {
    return render(
      <ChakraProvider>
        {ui}
      </ChakraProvider>
    );
  };

  test('Renderiza historia válida correctamente', () => {
    renderWithChakra(<ChangeHistory history={validHistory} />);
    
    // Verificar que se muestran los nombres de usuario
    expect(screen.getByText(/Test User/i)).toBeInTheDocument();
    
    // Verificar que se muestra el texto original y nuevo
    expect(screen.getByText('Texto anterior')).toBeInTheDocument();
    expect(screen.getByText('Texto nuevo')).toBeInTheDocument();
    
    // Verificar que se muestran los cambios de estado
    expect(screen.getByText(/Borrador/i)).toBeInTheDocument();
    expect(screen.getByText(/En revisión/i)).toBeInTheDocument();
  });

  test('Maneja textos problemáticos correctamente', () => {
    renderWithChakra(<ChangeHistory history={problemHistory} />);
    
    // Verificar que se muestra el mensaje alternativo para textos problemáticos
    expect(screen.getByText(/Texto anterior no disponible/i)).toBeInTheDocument();
    expect(screen.getByText(/Texto actualizado no disponible/i)).toBeInTheDocument();
    
    // Verificar que se generan claves correctamente incluso para entradas sin ID
    expect(screen.getByText(/Invalid ID User/i)).toBeInTheDocument();
  });

  test('Maneja un historial vacío correctamente', () => {
    renderWithChakra(<ChangeHistory history={[]} />);
    
    // Verificar mensaje para historial vacío
    expect(screen.getByText(/No hay historial disponible/i)).toBeInTheDocument();
  });
});
