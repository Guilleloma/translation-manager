export type CopyStatus = 'pendiente' | 'traducido' | 'revisado' | 'aprobado';

export interface Copy {
  id: string;
  slug: string;
  text: string;
  language: string;
  status: CopyStatus;
}
