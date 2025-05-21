/**
 * User roles enum
 * Admin: Can manage all content and users
 * Translator: Can only translate assigned content
 * Reviewer: Can review and approve/reject translations
 * Developer: Can modify slugs and has special permissions
 */
export enum UserRole {
  ADMIN = 'admin',
  TRANSLATOR = 'translator',
  REVIEWER = 'reviewer',
  DEVELOPER = 'developer',
}

/**
 * User interface definition
 */
export interface User {
  id: string;
  username: string;
  email: string;
  password?: string; // Only for development/testing
  role: UserRole;
  languages?: string[]; // Languages the translator can work with
  // Add any other user-related fields here
  // For example: createdAt, lastLogin, etc.
}
