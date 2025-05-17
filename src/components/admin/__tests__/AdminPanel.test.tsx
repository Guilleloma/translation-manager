import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminPanel from '../AdminPanel';
import { useUser } from '../../../context/UserContext';

// Mock de Chakra UI para evitar problemas en pruebas
jest.mock('@chakra-ui/react', () => {
  return {
    __esModule: true,
    // Mockear solo los componentes que se utilizan en AdminPanel
    Tabs: (props: any) => <div>{props.children}</div>,
    TabList: (props: any) => <div>{props.children}</div>,
    Tab: (props: any) => <button onClick={props.onClick}>{props.children}</button>,
    TabPanels: (props: any) => <div>{props.children}</div>,
    TabPanel: (props: any) => <div>{props.children}</div>,
    Box: (props: any) => <div>{props.children}</div>,
    Heading: (props: any) => <h2>{props.children}</h2>,
    Text: (props: any) => <p>{props.children}</p>,
    Table: (props: any) => <table>{props.children}</table>,
    Thead: (props: any) => <thead>{props.children}</thead>,
    Tbody: (props: any) => <tbody>{props.children}</tbody>,
    Tr: (props: any) => <tr>{props.children}</tr>,
    Th: (props: any) => <th>{props.children}</th>,
    Td: (props: any) => <td>{props.children}</td>,
    Badge: (props: any) => <span>{props.children}</span>,
    Button: (props: any) => <button onClick={props.onClick}>{props.children}</button>,
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
    updateUser: mockUpdateUser,
    isAuthenticated: true,
    isLoading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    setCurrentUser: jest.fn(),
  });
});

afterEach(() => {
  // Limpiar mocks después de cada prueba
  jest.clearAllMocks();
});

describe('AdminPanel', () => {
  it('debe mostrar el panel de administración con las pestañas', () => {
    render(<AdminPanel />);
    
    // Verificar que las pestañas estén presentes
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Usuarios')).toBeInTheDocument();
    expect(screen.getByText('Asignación de Idiomas')).toBeInTheDocument();
  });

  it('debe cambiar entre pestañas', () => {
    render(<AdminPanel />);
    
    // Hacer clic en la pestaña de Asignación de Idiomas
    fireEvent.click(screen.getByText('Asignación de Idiomas'));
    
    // Verificar que se muestra el componente de asignación de idiomas
    expect(screen.getByText('Asignación de Idiomas a Traductores')).toBeInTheDocument();
  });

  it('debe mostrar los usuarios en la pestaña de Usuarios', () => {
    render(<AdminPanel />);
    
    // Hacer clic en la pestaña de Usuarios
    fireEvent.click(screen.getByText('Usuarios'));
    
    // Verificar que se muestran los usuarios
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('traductor1')).toBeInTheDocument();
  });
});
