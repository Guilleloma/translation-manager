// Convierte un texto a un slug válido: minúsculas, puntos, sin acentos ni caracteres especiales
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '.')
}
