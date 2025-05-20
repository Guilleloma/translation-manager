import { CopyStatus } from '../copy';

describe('CopyStatus type', () => {
  it('should accept valid status values', () => {
    // Definición de una función que acepta solo valores de CopyStatus
    const validateStatus = (status: CopyStatus): CopyStatus => status;
    
    // Probar con valores válidos
    expect(validateStatus('not_assigned')).toBe('not_assigned');
    expect(validateStatus('assigned')).toBe('assigned');
    expect(validateStatus('translated')).toBe('translated');
    
    // TypeScript debería fallar en compilación con estos valores, 
    // pero podemos verificar en tiempo de ejecución
    // @ts-expect-error - Probando con valores inválidos
    expect(() => validateStatus('pendiente')).not.toThrow();
    // @ts-expect-error - Probando con valores inválidos
    expect(() => validateStatus('revisado')).not.toThrow();
    // @ts-expect-error - Probando con valores inválidos
    expect(() => validateStatus('aprobado')).not.toThrow();
  });
});
