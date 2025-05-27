/**
 * Configuración específica para tests de MongoDB
 */

import { TextEncoder, TextDecoder } from 'util';

// Polyfills para Node.js
(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

// Configurar variables de entorno para tests
process.env.MONGODB_URI = 'mongodb://localhost:27017/translation-manager-test';

// Configurar timeout para Jest
jest.setTimeout(30000);

// Mock de console para tests más limpios
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
