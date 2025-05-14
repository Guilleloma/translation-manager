import React, { ReactElement } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { ChakraProvider, theme } from '@chakra-ui/react';

// Mock UserContext module at top level (outside of this file)
jest.mock('../context/UserContext', () => ({
  __esModule: true,
  UserRole: {
    ADMIN: 'admin',
    TRANSLATOR: 'translator',
  },
  UserProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-user-provider">{children}</div>,
  useUser: jest.fn().mockReturnValue({
    currentUser: null,
    isAuthenticated: false,
    isLoading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    setCurrentUser: jest.fn(),
  }),
}));

// Wrapper personalizado con ChakraProvider para pruebas
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ChakraProvider theme={theme}>
      {children}
    </ChakraProvider>
  );
};

// Función de renderizado personalizada que incluye ChakraProvider
const render = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => rtlRender(ui, { wrapper: AllTheProviders, ...options });

// Re-exportar todo lo demás
export * from '@testing-library/react';
export { render };
