/**
 * Estados posibles de una traducción
 * - not_assigned: No asignado a ningún traductor
 * - assigned: Asignado a un traductor pero pendiente de traducir
 * - translated: Ya traducido por el traductor asignado
 */
export type CopyStatus = 'not_assigned' | 'assigned' | 'translated';

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
  // Propiedades para asignación y seguimiento
  assignedTo?: string; // ID del traductor asignado
  assignedAt?: Date;   // Fecha de asignación
  completedAt?: Date;  // Fecha en que se completó la traducción
}
