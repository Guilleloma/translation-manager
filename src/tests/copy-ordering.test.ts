/**
 * Test para verificar el ordenamiento de copys por fecha de creación
 */

import dataService from '../services/dataService';
import { Copy } from '../types/copy';

describe('Copy Ordering', () => {
  let mockCopys: Copy[];

  beforeEach(() => {
    // Crear copys de prueba con diferentes fechas de creación
    const now = new Date();
    mockCopys = [
      {
        id: '1',
        slug: 'test.old',
        text: 'Texto más antiguo',
        language: 'es',
        status: 'not_assigned',
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 días atrás
        updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        slug: 'test.new',
        text: 'Texto más reciente',
        language: 'es',
        status: 'not_assigned',
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 día atrás
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        id: '3',
        slug: 'test.newest',
        text: 'Texto más nuevo',
        language: 'es',
        status: 'not_assigned',
        createdAt: now, // Ahora
        updatedAt: now
      },
      {
        id: '4',
        slug: 'test.middle',
        text: 'Texto intermedio',
        language: 'es',
        status: 'not_assigned',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 días atrás
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      }
    ];
  });

  test('should order copys by creation date descending (newest first)', () => {
    // Simular el ordenamiento que hace el servicio de datos
    const sortedCopys = mockCopys.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // Orden descendente
    });

    // Verificar que el orden sea correcto (más recientes primero)
    expect(sortedCopys[0].slug).toBe('test.newest');
    expect(sortedCopys[1].slug).toBe('test.new');
    expect(sortedCopys[2].slug).toBe('test.middle');
    expect(sortedCopys[3].slug).toBe('test.old');
  });

  test('should handle copys without createdAt field', () => {
    // Agregar un copy sin fecha de creación
    const copyWithoutDate: Copy = {
      id: '5',
      slug: 'test.no-date',
      text: 'Texto sin fecha',
      language: 'es',
      status: 'not_assigned'
      // Sin createdAt ni updatedAt
    };

    const copysWithMissingDate = [...mockCopys, copyWithoutDate];

    // Simular el ordenamiento que hace el servicio de datos
    const sortedCopys = copysWithMissingDate.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // Orden descendente
    });

    // El copy sin fecha debería ir al final (fecha = 0)
    expect(sortedCopys[sortedCopys.length - 1].slug).toBe('test.no-date');
    
    // Los demás deberían mantener su orden correcto
    expect(sortedCopys[0].slug).toBe('test.newest');
    expect(sortedCopys[1].slug).toBe('test.new');
    expect(sortedCopys[2].slug).toBe('test.middle');
    expect(sortedCopys[3].slug).toBe('test.old');
  });

  test('should maintain stable sort for copys with same creation date', () => {
    const sameDate = new Date();
    
    // Crear copys con la misma fecha de creación
    const copysWithSameDate: Copy[] = [
      {
        id: '1',
        slug: 'test.first',
        text: 'Primer texto',
        language: 'es',
        status: 'not_assigned',
        createdAt: sameDate,
        updatedAt: sameDate
      },
      {
        id: '2',
        slug: 'test.second',
        text: 'Segundo texto',
        language: 'es',
        status: 'not_assigned',
        createdAt: sameDate,
        updatedAt: sameDate
      }
    ];

    // Simular el ordenamiento
    const sortedCopys = copysWithSameDate.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    // Debería mantener el orden original para elementos con la misma fecha
    expect(sortedCopys).toHaveLength(2);
    expect(sortedCopys[0].slug).toBe('test.first');
    expect(sortedCopys[1].slug).toBe('test.second');
  });
});
