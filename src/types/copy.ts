export type CopyStatus = 'pendiente' | 'traducido' | 'revisado' | 'aprobado';

export interface CopyInput {
  slug?: string;
  text?: string;
  language: string;
  // Propiedad para indicar si el copy es parte de una importación masiva
  // Esto permite suprimir notificaciones individuales durante importaciones
  isBulkImport?: boolean;
}

export interface Copy extends Omit<CopyInput, 'slug' | 'text'> {
  id: string;
  slug: string;
  text: string;
  status: CopyStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
