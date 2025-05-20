/**
 * Pruebas para la utilidad de exportación a Google Sheets
 * Verifica que la estructura CSV generada tenga el formato correcto y los datos se procesen adecuadamente
 */

import { prepareCopysForGoogleSheets, generateCSVContent } from '../exportToGoogleSheets';
import { Copy } from '../../types/copy';

// Mocks para evitar errores con Blob y URL que no están disponibles en entorno de testing
global.Blob = jest.fn().mockImplementation((content, options) => ({
  content,
  options
})) as any;

// URL.createObjectURL mock
global.URL.createObjectURL = jest.fn().mockImplementation(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

describe('exportToGoogleSheets', () => {
  // Datos de prueba
  const mockCopys: Copy[] = [
    {
      id: '1',
      slug: 'button.save',
      text: 'Guardar',
      language: 'es',
      status: 'translated'
    },
    {
      id: '2',
      slug: 'button.save',
      text: 'Save',
      language: 'en',
      status: 'translated'
    },
    {
      id: '3',
      slug: 'button.cancel',
      text: 'Cancelar',
      language: 'es',
      status: 'translated'
    },
    {
      id: '4',
      slug: 'button.cancel',
      text: 'Cancel',
      language: 'en',
      status: 'translated'
    },
    {
      id: '5',
      slug: 'form.title',
      text: 'Formulario de contacto',
      language: 'es',
      status: 'translated'
    }
  ];

  describe('prepareCopysForGoogleSheets', () => {
    it('debe agrupar correctamente los copys por slug', () => {
      // Ejecutar la función
      const result = prepareCopysForGoogleSheets(mockCopys);
      
      // Verificar que hay 3 slugs únicos (button.save, button.cancel, form.title)
      expect(result.length).toBe(3);
      
      // Verificar que cada slug tiene las traducciones correctas
      const buttonSave = result.find(item => item.slug === 'button.save');
      expect(buttonSave).toBeDefined();
      expect(buttonSave?.translations['es_ES']).toBe('Guardar');
      expect(buttonSave?.translations['en_GB']).toBe('Save');
      
      const buttonCancel = result.find(item => item.slug === 'button.cancel');
      expect(buttonCancel).toBeDefined();
      expect(buttonCancel?.translations['es_ES']).toBe('Cancelar');
      expect(buttonCancel?.translations['en_GB']).toBe('Cancel');
      
      const formTitle = result.find(item => item.slug === 'form.title');
      expect(formTitle).toBeDefined();
      expect(formTitle?.translations['es_ES']).toBe('Formulario de contacto');
      expect(formTitle?.translations['en_GB']).toBeUndefined();
    });
    
    it('debe mapear correctamente los códigos de idioma al formato requerido', () => {
      // Crear copys con diferentes formatos de idioma
      const copysWithDifferentLanguages: Copy[] = [
        {
          id: '1',
          slug: 'test.multilanguage',
          text: 'Texto en español',
          language: 'es',
          status: 'translated'
        },
        {
          id: '2',
          slug: 'test.multilanguage',
          text: 'English text',
          language: 'en',
          status: 'translated'
        },
        {
          id: '3',
          slug: 'test.multilanguage',
          text: 'Testo italiano',
          language: 'it',
          status: 'translated'
        },
        {
          id: '4',
          slug: 'test.multilanguage',
          text: 'US English text',
          language: 'en-us',
          status: 'translated'
        }
      ];
      
      const result = prepareCopysForGoogleSheets(copysWithDifferentLanguages);
      
      // Verificar que hay 1 slug con 4 traducciones
      expect(result.length).toBe(1);
      const translations = result[0].translations;
      
      // Verificar que los códigos de idioma se han mapeado correctamente
      expect(translations['es_ES']).toBe('Texto en español');
      expect(translations['en_GB']).toBe('English text');
      expect(translations['it_IT']).toBe('Testo italiano');
      expect(translations['en_US']).toBe('US English text');
    });
  });
  
  describe('generateCSVContent', () => {
    it('debe generar un CSV con el formato correcto de cabeceras', () => {
      // Ejecutar con idiomas específicos
      const csv = generateCSVContent(mockCopys, ['en_GB', 'es_ES']);
      
      // Verificar formato de cabeceras
      const lines = csv.split('\n');
      expect(lines[0]).toBe('slug,en_GB,es_ES');
    });
    
    it('debe mantener el orden específico de columnas solicitado', () => {
      // Intentar con un orden diferente para verificar que lo reordena
      const csv = generateCSVContent(mockCopys, ['es_ES', 'en_GB', 'it_IT']);
      
      // Verificar que mantiene el orden: en_GB, es_ES, it_IT
      const lines = csv.split('\n');
      expect(lines[0]).toBe('slug,en_GB,es_ES,it_IT');
    });
    
    it('debe escapar correctamente caracteres especiales', () => {
      // Copy con caracteres que necesitan escape
      const copysWithSpecialChars: Copy[] = [
        {
          id: '1',
          slug: 'test.special',
          text: 'Texto con "comillas" y, comas',
          language: 'es',
          status: 'translated'
        }
      ];
      
      const csv = generateCSVContent(copysWithSpecialChars);
      
      // Verificar que las comillas están correctamente escapadas
      const lines = csv.split('\n');
      expect(lines[1]).toContain('test.special');
      expect(lines[1]).toContain('"Texto con ""comillas"" y, comas"');
    });
    
    it('debe incluir todos los idiomas predeterminados cuando no se especifican', () => {
      const csv = generateCSVContent(mockCopys); // Sin especificar idiomas
      
      // Verificar que incluye todos los idiomas predeterminados
      const lines = csv.split('\n');
      expect(lines[0]).toBe('slug,en_GB,es_ES,it_IT,en_US,de_DE,fr_FR,pt_PT,pt_BR');
    });
  });
});
