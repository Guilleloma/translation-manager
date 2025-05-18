import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BulkImportForm } from './BulkImportForm';
import { Copy } from '../types/copy';

// Mock de las dependencias
jest.mock('xlsx', () => ({
  read: jest.fn().mockReturnValue({
    SheetNames: ['Sheet1'],
    Sheets: {
      Sheet1: {}
    }
  }),
  utils: {
    sheet_to_json: jest.fn().mockReturnValue([
      { slug: 'test.slug', text: 'Test text', language: 'es' },
      { slug: 'another.slug', text: 'Another text', language: 'en' }
    ])
  }
}));

jest.mock('papaparse', () => ({
  parse: jest.fn().mockImplementation((file, options) => {
    // Simular la función de callback 'complete'
    options.complete({
      data: [
        { slug: 'test.slug', text: 'Test text', language: 'es' },
        { slug: 'another.slug', text: 'Another text', language: 'en' }
      ],
      errors: []
    });
  })
}));

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mock-uuid')
}));

// Mock del FileReader
class MockFileReader {
  static readonly EMPTY = 0;
  static readonly LOADING = 1;
  static readonly DONE = 2;
  
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  
  readAsBinaryString(file: Blob) {
    if (this.onload) {
      const mockEvent = { target: { result: 'binary-string-mock' } } as unknown as ProgressEvent<FileReader>;
      this.onload.call(this as unknown as FileReader, mockEvent);
    }
  }
}

global.FileReader = MockFileReader as unknown as typeof FileReader;

describe('BulkImportForm', () => {
  const mockOnImportComplete = jest.fn();
  const mockOnCancel = jest.fn();
  
  const existingCopys: Copy[] = [
    { id: '1', slug: 'existing.slug', text: 'Existing text', language: 'es', status: 'pendiente' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra el formulario de importación correctamente', () => {
    render(
      <BulkImportForm
        existingCopys={existingCopys}
        onImportComplete={mockOnImportComplete}
        onCancel={mockOnCancel}
      />
    );

    // Verificar que se muestra el título y las instrucciones
    expect(screen.getByText('Importación masiva de copys')).toBeInTheDocument();
    expect(screen.getByText(/Sube un archivo CSV o Excel/)).toBeInTheDocument();
    
    // Verificar que existe el input de archivo
    const fileInput = screen.getByLabelText('Selecciona un archivo');
    expect(fileInput).toBeInTheDocument();
  });

  it('procesa un archivo CSV correctamente', async () => {
    render(
      <BulkImportForm
        existingCopys={existingCopys}
        onImportComplete={mockOnImportComplete}
        onCancel={mockOnCancel}
      />
    );

    // Crear un archivo CSV de prueba
    const file = new File(['dummy content'], 'test.csv', { type: 'text/csv' });
    const fileInput = screen.getByLabelText('Selecciona un archivo');
    
    // Simular la subida del archivo
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Esperar a que se procese el archivo y se muestre la vista previa
    await waitFor(() => {
      expect(screen.getByText('Vista previa de datos')).toBeInTheDocument();
    });
    
    // Verificar que se muestran los datos importados
    expect(screen.getByText('test.slug')).toBeInTheDocument();
    expect(screen.getByText('Test text')).toBeInTheDocument();
    
    // Hacer clic en el botón de importar
    const importButton = screen.getByText(/Importar/);
    fireEvent.click(importButton);
    
    // Verificar que se llama a la función onImportComplete con los datos correctos
    expect(mockOnImportComplete).toHaveBeenCalledWith([
      { slug: 'test.slug', text: 'Test text', language: 'es' },
      { slug: 'another.slug', text: 'Another text', language: 'en' }
    ]);
  });

  it('maneja el botón de cancelar correctamente', () => {
    render(
      <BulkImportForm
        existingCopys={existingCopys}
        onImportComplete={mockOnImportComplete}
        onCancel={mockOnCancel}
      />
    );

    // Crear un archivo CSV de prueba y cargarlo
    const file = new File(['dummy content'], 'test.csv', { type: 'text/csv' });
    const fileInput = screen.getByLabelText('Selecciona un archivo');
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Una vez procesado el archivo, hacer clic en cancelar
    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);
    
    // Verificar que se llama a la función onCancel
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
