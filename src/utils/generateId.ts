/**
 * Genera un ID único usando timestamp y número aleatorio
 * @returns string - ID único
 */
export function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
