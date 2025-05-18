export type CopyStatus = 'pendiente' | 'traducido' | 'revisado' | 'aprobado';

export interface CopyInput {
  slug?: string;
  text?: string;
  language: string;
}

export interface Copy extends Omit<CopyInput, 'slug' | 'text'> {
  id: string;
  slug: string;
  text: string;
  status: CopyStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
