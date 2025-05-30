/**
 * Estados posibles de una traducción
 * - not_assigned: No asignado a ningún traductor
 * - assigned: Asignado a un traductor pero pendiente de traducir
 * - translated: Ya traducido por el traductor asignado
 * - reviewed: Revisado por un revisor
 * - approved: Aprobado por un revisor o administrador
 * - rejected: Rechazado por un revisor, requiere cambios
 */
export type CopyStatus = 'not_assigned' | 'assigned' | 'translated' | 'reviewed' | 'approved' | 'rejected';

export interface CopyInput {
  slug?: string;
  text?: string;
  language: string;
  // Propiedad para indicar si el copy es parte de una importación masiva
  // Esto permite suprimir notificaciones individuales durante importaciones
  isBulkImport?: boolean;
}

/**
 * Representa un comentario sobre una traducción
 */
export interface CopyComment {
  id: string;
  copyId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
}

/**
 * Etiquetas para organizar traducciones
 */
export type CopyTag = 'urgente' | 'marketing' | 'legal' | 'técnico' | 'ui' | string;

/**
 * Roles de usuario en el sistema
 */
export enum UserRole {
  Translator = 'translator',
  Reviewer = 'reviewer',
  Admin = 'admin',
  Developer = 'developer'
}

/**
 * Representa un historial de cambios en la traducción
 */
export interface CopyHistory {
  id: string;
  copyId: string;
  userId: string;
  userName: string;
  previousStatus?: CopyStatus;
  newStatus?: CopyStatus;
  previousText?: string;
  newText?: string;
  createdAt: Date;
  comments?: string; // Comentarios opcionales sobre el cambio
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
  reviewedBy?: string; // ID del revisor
  reviewedAt?: Date;   // Fecha de revisión
  approvedBy?: string; // ID del aprobador
  approvedAt?: Date;   // Fecha de aprobación
  tags?: CopyTag[];    // Etiquetas asociadas a la traducción
  comments?: CopyComment[]; // Comentarios sobre la traducción
  history?: CopyHistory[]; // Historial de cambios
  needsSlugReview?: boolean; // Indica si el slug necesita revisión por parte de un desarrollador
  metadata?: Record<string, any>; // Metadatos adicionales para cualquier información extra
}
