import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import BulkImportForm from '../BulkImportForm';
import '@testing-library/jest-dom';

// Mock de Papa Parse
jest.mock('papaparse', () => ({
  parse: jest.fn((file, options) => {
    // Simulamos un CSV procesado
    const mockResults = {
      data: [
        { key: 'welcome.title', en_GB: 'Welcome', es_ES: 'Bienvenido' },
        { key: 'button.save', en_GB: 'Save', es_ES: 'Guardar' }
      ],
      errors: []
    };
    options.complete(mockResults);
  })
}));

// Mock de xlsx
jest.mock('xlsx', () => ({
  read: jest.fn(() => ({
    SheetNames: ['Sheet1'],
    Sheets: {
      Sheet1: {
        '!ref': 'A1:C3',
        A1: { t: 's', v: 'key' },
        B1: { t: 's', v: 'en_GB' },
        C1: { t: 's', v: 'es_ES' },
        A2: { t: 's', v: 'welcome.title' },
        B2: { t: 's', v: 'Welcome' },
        C2: { t: 's', v: 'Bienvenido' },
        A3: { t: 's', v: 'button.save' },
        B3: { t: 's', v: 'Save' },
        C3: { t: 's', v: 'Guardar' }
      }
    }
  })),
  utils: {
    sheet_to_json: jest.fn(() => [
      { key: 'welcome.title', en_GB: 'Welcome', es_ES: 'Bienvenido' },
      { key: 'button.save', en_GB: 'Save', es_ES: 'Guardar' }
    ])
  }
}));

// Mock de useToast
const mockToast = jest.fn();
jest.mock('@chakra-ui/react', () => {
  const originalModule = jest.requireActual('@chakra-ui/react');
  return {
    ...originalModule,
    useToast: () => mockToast
  };
});

describe('BulkImportForm Component', () => {
  // Configuración inicial para cada prueba
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Renderiza correctamente', () => {
    render(
      <ChakraProvider>
        <BulkImportForm existingCopys={[]} onImport={jest.fn()} />
      </ChakraProvider>
    );
    
    expect(screen.getByText(/Importar copys/i)).toBeInTheDocument();
    expect(screen.getByText(/Selecciona un archivo/i)).toBeInTheDocument();
  });

  test('Procesa un archivo CSV correctamente', async () => {
    const mockOnImport = jest.fn();
    
    render(
      <ChakraProvider>
        <BulkImportForm existingCopys={[]} onImport={mockOnImport} />
      </ChakraProvider>
    );
    
    // Simular la carga de un archivo CSV
    const file = new File(['dummy content'], 'test.csv', { type: 'text/csv' });
    const fileInput = screen.getByLabelText(/Selecciona un archivo/i);
    
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    
    fireEvent.change(fileInput);
    
    // Esperar a que se procese el archivo
    await waitFor(() => {
      expect(screen.getByText(/welcome\.title/i)).toBeInTheDocument();
      expect(screen.getByText(/button\.save/i)).toBeInTheDocument();
    });
    
    // Verificar que se muestran las traducciones
    expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
    expect(screen.getByText(/Bienvenido/i)).toBeInTheDocument();
    expect(screen.getByText(/Save/i)).toBeInTheDocument();
    expect(screen.getByText(/Guardar/i)).toBeInTheDocument();
  });

  test('Procesa un archivo Excel correctamente', async () => {
    const mockOnImport = jest.fn();
    
    render(
      <ChakraProvider>
        <BulkImportForm existingCopys={[]} onImport={mockOnImport} />
      </ChakraProvider>
    );
    
    // Simular la carga de un archivo Excel
    const file = new File(['dummy content'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const fileInput = screen.getByLabelText(/Selecciona un archivo/i);
    
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    
    fireEvent.change(fileInput);
    
    // Esperar a que se procese el archivo
    await waitFor(() => {
      expect(screen.getByText(/welcome\.title/i)).toBeInTheDocument();
      expect(screen.getByText(/button\.save/i)).toBeInTheDocument();
    });
    
    // Verificar que se muestran las traducciones
    expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
    expect(screen.getByText(/Bienvenido/i)).toBeInTheDocument();
    expect(screen.getByText(/Save/i)).toBeInTheDocument();
    expect(screen.getByText(/Guardar/i)).toBeInTheDocument();
  });

  test('Detecta duplicados correctamente', async () => {
    const mockOnImport = jest.fn();
    const existingCopys = [
      { slug: 'welcome.title', text: 'Welcome', language: 'en_GB' }
    ];
    
    render(
      <ChakraProvider>
        <BulkImportForm existingCopys={existingCopys} onImport={mockOnImport} />
      </ChakraProvider>
    );
    
    // Simular la carga de un archivo CSV
    const file = new File(['dummy content'], 'test.csv', { type: 'text/csv' });
    const fileInput = screen.getByLabelText(/Selecciona un archivo/i);
    
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    
    fireEvent.change(fileInput);
    
    // Esperar a que se procese el archivo
    await waitFor(() => {
      expect(screen.getByText(/welcome\.title/i)).toBeInTheDocument();
    });
    
    // Verificar que se detecta el duplicado
    expect(screen.getByText(/Esta key ya existe en el sistema/i)).toBeInTheDocument();
  });

  test('Maneja la paginación correctamente', async () => {
    // Mock de Papa Parse para generar muchos datos
    const mockData = Array.from({ length: 50 }, (_, i) => ({
      key: `key.${i}`,
      en_GB: `Value ${i} in English`,
      es_ES: `Valor ${i} en Español`
    }));
    
    require('papaparse').parse.mockImplementationOnce((file, options) => {
      options.complete({
        data: mockData,
        errors: []
      });
    });
    
    render(
      <ChakraProvider>
        <BulkImportForm existingCopys={[]} onImport={jest.fn()} />
      </ChakraProvider>
    );
    
    // Simular la carga de un archivo CSV
    const file = new File(['dummy content'], 'test.csv', { type: 'text/csv' });
    const fileInput = screen.getByLabelText(/Selecciona un archivo/i);
    
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    
    fireEvent.change(fileInput);
    
    // Esperar a que se procese el archivo
    await waitFor(() => {
      expect(screen.getByText(/key\.0/i)).toBeInTheDocument();
    });
    
    // Verificar que se muestran los controles de paginación
    expect(screen.getByText(/1/i)).toBeInTheDocument();
    
    // Cambiar a la siguiente página
    const nextPageButton = screen.getByLabelText(/next-page/i);
    fireEvent.click(nextPageButton);
    
    // Verificar que se muestran los elementos de la siguiente página
    await waitFor(() => {
      expect(screen.getByText(/key\.20/i)).toBeInTheDocument();
    });
  });

  test('Importa los datos correctamente al hacer clic en el botón de importar', async () => {
    const mockOnImport = jest.fn();
    
    render(
      <ChakraProvider>
        <BulkImportForm existingCopys={[]} onImport={mockOnImport} />
      </ChakraProvider>
    );
    
    // Simular la carga de un archivo CSV
    const file = new File(['dummy content'], 'test.csv', { type: 'text/csv' });
    const fileInput = screen.getByLabelText(/Selecciona un archivo/i);
    
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    
    fireEvent.change(fileInput);
    
    // Esperar a que se procese el archivo
    await waitFor(() => {
      expect(screen.getByText(/welcome\.title/i)).toBeInTheDocument();
    });
    
    // Hacer clic en el botón de importar
    const importButton = screen.getByText(/Importar 2 copys/i);
    fireEvent.click(importButton);
    
    // Verificar que se llama a la función onImport con los datos correctos
    await waitFor(() => {
      expect(mockOnImport).toHaveBeenCalled();
      const importedData = mockOnImport.mock.calls[0][0];
      expect(importedData).toHaveLength(2);
      expect(importedData[0].key).toBe('welcome.title');
      expect(importedData[0].translations.en_GB).toBe('Welcome');
      expect(importedData[0].translations.es_ES).toBe('Bienvenido');
    });
  });
});
