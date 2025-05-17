import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LanguageUserSelector from '../LanguageUserSelector';
import { useUser } from '../../../context/UserContext';

// Mock de Chakra UI para evitar problemas en pruebas
jest.mock('@chakra-ui/react', () => {
  return {
    __esModule: true,
    // Mockear solo los componentes que se utilizan en LanguageUserSelector
    Box: (props: any) => <div>{props.children}</div>,
    Heading: (props: any) => <h2>{props.children}</h2>,
    Text: (props: any) => <p>{props.children}</p>,
    Select: (props: any) => {
      // Filtrar las propiedades que no son válidas para un select estándar de HTML
      const { isDisabled, placeholder, ...validProps } = props;
      return <select disabled={isDisabled} {...validProps}>{props.children}</select>;
    },
    Button: (props: any) => <button onClick={props.onClick} disabled={props.isDisabled}>{props.children}</button>,
    Table: (props: any) => <table>{props.children}</table>,
    Thead: (props: any) => <thead>{props.children}</thead>,
    Tbody: (props: any) => <tbody>{props.children}</tbody>,
    Tr: (props: any) => <tr>{props.children}</tr>,
    Th: (props: any) => <th>{props.children}</th>,
    Td: (props: any) => <td>{props.children}</td>,
    VStack: (props: any) => <div>{props.children}</div>,
    HStack: (props: any) => <div>{props.children}</div>,
    Grid: (props: any) => <div>{props.children}</div>,
    GridItem: (props: any) => <div>{props.children}</div>,
    Alert: (props: any) => <div>{props.children}</div>,
    AlertIcon: () => <span></span>,
    AlertTitle: (props: any) => <span>{props.children}</span>,
    AlertDescription: (props: any) => <span>{props.children}</span>,
    useToast: () => ({
      isActive: jest.fn(),
      close: jest.fn(),
      closeAll: jest.fn(),
      toast: jest.fn()
    }),
    createIcon: jest.fn(),
  };
});

// Mock de los iconos de Chakra UI
jest.mock('@chakra-ui/icons', () => ({
  __esModule: true,
  AddIcon: () => <span>+</span>,
  DeleteIcon: () => <span>×</span>,
  EditIcon: () => <span>✎</span>,
  CheckIcon: () => <span>✓</span>,
  CloseIcon: () => <span>✕</span>,
}));

// Mock del hook useUser
jest.mock('../../../context/UserContext', () => ({
  __esModule: true,
  ...jest.requireActual('../../../context/UserContext'),
  useUser: jest.fn(),
}));

const mockUpdateUser = jest.fn();

const mockUsers = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
  },
  {
    id: '2',
    username: 'traductor1',
    email: 'traductor1@example.com',
    role: 'translator',
    languages: ['es']
  },
  {
    id: '3',
    username: 'traductor2',
    email: 'traductor2@example.com',
    role: 'translator',
    languages: ['en']
  },
];

beforeEach(() => {
  // Configurar el mock antes de cada prueba
  (useUser as jest.Mock).mockReturnValue({
    currentUser: {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
    },
    users: mockUsers,
    isAuthenticated: true,
    isLoading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    setCurrentUser: jest.fn(),
    updateUser: mockUpdateUser,
  });
});

afterEach(() => {
  // Limpiar mocks después de cada prueba
  jest.clearAllMocks();
});

describe('LanguageUserSelector', () => {
  it('debe renderizar el selector de idiomas', () => {
    render(<LanguageUserSelector />);
    
    // Verificar que los elementos principales estén presentes
    expect(screen.getByText('Asignación de Idiomas a Traductores')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Seleccionar idioma')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Seleccionar traductor')).toBeInTheDocument();
  });

  it('debe permitir seleccionar un idioma y un traductor', async () => {
    render(<LanguageUserSelector />);
    
    // Seleccionar un idioma
    const languageSelect = screen.getByPlaceholderText('Seleccionar idioma');
    fireEvent.change(languageSelect, { target: { value: 'en' } });
    
    // Verificar que el selector de traductores esté habilitado
    const userSelect = screen.getByPlaceholderText('Seleccionar traductor');
    expect(userSelect).not.toBeDisabled();
    
    // Seleccionar un traductor
    fireEvent.change(userSelect, { target: { value: '3' } }); // traductor2
    
    // Hacer clic en el botón de agregar
    const addButton = screen.getByRole('button', { name: /asignar traductor/i });
    fireEvent.click(addButton);
    
    // Verificar que se muestra la asignación
    await waitFor(() => {
      expect(screen.getByText('traductor2')).toBeInTheDocument();
    });
  });

  it('debe mostrar un mensaje cuando no hay asignaciones', () => {
    // Mock de usuarios sin asignaciones
    (useUser as jest.Mock).mockReturnValue({
      users: [
        {
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
        }
      ],
      updateUser: mockUpdateUser,
      currentUser: {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
      },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      setCurrentUser: jest.fn(),
    });
    
    render(<LanguageUserSelector />);
    
    expect(screen.getByText(/no hay asignaciones de idiomas/i)).toBeInTheDocument();
  });
});
