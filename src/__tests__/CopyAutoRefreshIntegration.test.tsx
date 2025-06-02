/**
 * Test de integración para verificar que el auto-refresh funciona
 * correctamente después de editar copys
 */

import dataService from '../services/dataService';
import apiService from '../services/apiService';

// Mock de apiService
jest.mock('../services/apiService', () => ({
  __esModule: true,
  default: {
    fetchAllData: jest.fn(),
    updateDocument: jest.fn(),
    createDocument: jest.fn(),
  }
}));

// Mock de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Copy Auto Refresh Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should refresh copys from server when getCopysFromServer is called', async () => {
    const mockCopys = [
      {
        id: '1',
        slug: 'test',
        text: 'Test text',
        language: 'es',
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [],
        tags: [],
        comments: [],
        translationGroupId: 'group1',
        isOriginalText: true,
        needsSlugReview: false
      }
    ];

    // Mock de la respuesta del servidor
    (apiService.fetchAllData as jest.Mock).mockResolvedValue({
      copys: mockCopys,
      users: []
    });

    // Llamar al método que fuerza recarga desde servidor
    const result = await dataService.getCopysFromServer();

    // Verificar que se llamó a la API
    expect(apiService.fetchAllData).toHaveBeenCalled();

    // Verificar que se actualizó localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'copys', 
      JSON.stringify(mockCopys)
    );

    // Verificar que devuelve los copys correctos
    expect(result).toEqual(mockCopys);
  });

  it('should handle server errors gracefully', async () => {
    // Mock de error del servidor
    (apiService.fetchAllData as jest.Mock).mockRejectedValue(
      new Error('Server error')
    );

    // Mock de localStorage con datos existentes
    const existingCopys = [
      {
        id: '2',
        slug: 'existing',
        text: 'Existing text',
        language: 'es',
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [],
        tags: [],
        comments: [],
        translationGroupId: 'group2',
        isOriginalText: true,
        needsSlugReview: false
      }
    ];

    localStorageMock.getItem.mockReturnValue(JSON.stringify(existingCopys));

    // Llamar al método que fuerza recarga desde servidor
    const result = await dataService.getCopysFromServer();

    // Verificar que se intentó llamar a la API
    expect(apiService.fetchAllData).toHaveBeenCalled();

    // Verificar que devuelve los datos de localStorage como fallback
    // Las fechas se serializan como strings en localStorage
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
    expect(result[0].slug).toBe('existing');
    expect(result[0].text).toBe('Existing text');
  });

  it('should update copy and maintain data consistency', async () => {
    const originalCopy = {
      id: '1',
      slug: 'test',
      text: 'Original text',
      language: 'es',
      status: 'draft' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      history: [],
      tags: [],
      comments: [],
      translationGroupId: 'group1',
      isOriginalText: true,
      needsSlugReview: false
    };

    const updatedCopy = {
      ...originalCopy,
      text: 'Updated text',
      updatedAt: new Date()
    };

    // Mock localStorage con el copy original
    localStorageMock.getItem.mockReturnValue(JSON.stringify([originalCopy]));

    // Mock de la API de actualización
    (apiService.updateDocument as jest.Mock).mockResolvedValue(updatedCopy);

    // Actualizar el copy
    await dataService.updateCopy(originalCopy.id, updatedCopy);

    // Verificar que se actualizó localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'copys',
      JSON.stringify([updatedCopy])
    );

    // Verificar que se llamó a la API
    expect(apiService.updateDocument).toHaveBeenCalledWith('copy', updatedCopy);
  });
});
