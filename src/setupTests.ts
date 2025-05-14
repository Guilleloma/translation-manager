// Configuración global para tests con React Testing Library
import '@testing-library/jest-dom';

// Silenciar errores de console.error, console.log, etc. durante la ejecución de pruebas
// pero mantener un registro en el caso de que alguien necesite depurar
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleGroup = console.group;
const originalConsoleGroupEnd = console.groupEnd;

beforeAll(() => {
  // Sobreescribir console.log y otros métodos para que no muestren nada durante los tests
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
  console.group = jest.fn();
  console.groupEnd = jest.fn();
});

afterAll(() => {
  // Restaurar los métodos originales después de todos los tests
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.group = originalConsoleGroup;
  console.groupEnd = originalConsoleGroupEnd;
});

// Mock útil para funciones de Chakra UI que pueden generar problemas en tests
jest.mock('@chakra-ui/react', () => {
  const originalModule = jest.requireActual('@chakra-ui/react');
  return {
    __esModule: true,
    ...originalModule,
    // Mock para Tooltip y otros componentes que puedan causar problemas en tests
    Tooltip: ({ children, label }: { children: React.ReactNode; label: string }) => {
      return { type: 'div', props: { 'data-testid': 'tooltip', 'data-content': label, children } };
    }
  };
});
