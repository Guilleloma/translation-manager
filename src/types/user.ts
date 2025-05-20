/**
 * User roles enum
 * Admin: Can manage all content and users
 * Translator: Can only translate assigned content
 */
export enum UserRole {
  ADMIN = 'admin',
  TRANSLATOR = 'translator',
}

/**
 * User interface definition
 */
export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  languages?: string[]; // Languages the translator can work with
}
