'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/user';

/**
 * Context interface that defines all user-related operations
 */
export interface UserContextType {
  currentUser: User | null;
  users: User[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingOut: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: (callback?: () => void) => void;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  updateUser: (userId: string, updates: Partial<User>) => void;
}

// Create context with default values
const UserContext = createContext<UserContextType>({
  currentUser: null,
  users: [],
  isAuthenticated: false,
  isLoading: true,
  isLoggingOut: false,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  setCurrentUser: () => {},
  updateUser: () => {},
});

// Usuarios de ejemplo para el prototipo (sería reemplazado por una API real en producción)
const MOCK_USERS: User[] = [
  {
    id: 'admin-1',
    username: 'Admin Demo',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
  },
  {
    id: 'translator-1',
    username: 'Traductor EN-FR',
    email: 'translator@example.com',
    role: UserRole.TRANSLATOR,
    languages: ['en', 'fr'],
  },
  {
    id: 'translator-2',
    username: 'María García',
    email: 'maria@example.com',
    role: UserRole.TRANSLATOR,
    languages: ['es', 'it'],
  },
  {
    id: 'translator-3',
    username: 'John Smith',
    email: 'john@example.com',
    role: UserRole.TRANSLATOR,
    languages: ['en', 'de'],
  },
];

/**
 * User Provider Component
 * Handles authentication state and operations
 */
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Check for stored user on initial load
  useEffect(() => {
    console.log('Checking for stored user session');
    // Asegurarnos que isLoading sea true al inicio
    setIsLoading(true);
    
    // Simular un pequeño retraso para asegurarnos de que el spinner se muestre
    setTimeout(() => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
          console.log('User session restored');
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    }, 300); // Pequeño retraso para asegurar que se muestre el feedback visual
  }, []);

  // Store user in localStorage when it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('user', JSON.stringify(currentUser));
      console.log(`User session saved: ${currentUser.username}`);
    } else {
      localStorage.removeItem('user');
      console.log('User session cleared');
    }
  }, [currentUser]);

  /**
   * Login function
   * @param email User email
   * @param password User password (not validated in prototype)
   * @returns Success status
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log(`Login attempt: ${email}`);
      setIsLoading(true); // Establecer estado de carga al inicio del proceso
      
      // Simular una carga de API con un retraso más visible
      console.log('Starting login API call');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Find user with matching email
      const user = MOCK_USERS.find(u => u.email === email);
      
      // In a real app, we'd validate the password here
      if (user) {
        setCurrentUser(user);
        console.log(`Login successful: ${user.username}`);
        setIsLoading(false); // Desactivar estado de carga al completar exitosamente
        return true;
      }
      console.log('Login failed: User not found');
      setIsLoading(false); // Desactivar estado de carga incluso en caso de error
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false); // Desactivar estado de carga en caso de excepción
      return false;
    }
  };

  /**
   * Register function
   * @param username User display name
   * @param email User email
   * @param password User password
   * @param role User role
   * @returns Success status
   */
  const register = async (
    username: string, 
    email: string, 
    password: string, 
    role: UserRole
  ): Promise<boolean> => {
    try {
      console.log(`Registration attempt: ${email}, role: ${role}`);
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if user already exists
      const userExists = MOCK_USERS.some(u => u.email === email);
      if (userExists) {
        console.log('Registration failed: Email already exists');
        return false;
      }
      
      // Create new user
      const newUser: User = {
        id: `${MOCK_USERS.length + 1}`,
        username,
        email,
        role,
      };
      
      // In a real app, we would make an API call to create the user
      // For this prototype, we'll just add it to our mock array
      MOCK_USERS.push(newUser);
      
      // Auto-login the new user
      setCurrentUser(newUser);
      console.log(`Registration successful: ${newUser.username}`);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  /**
   * Logout function
   * @param callback Optional callback to run after logout is complete
   */
  const logout = (callback?: () => void) => {
    console.log('Logging out user');
    
    // First set logging out state to prevent components from rendering
    // during the logout process
    setIsLoggingOut(true);
    
    // Use a small delay to ensure React doesn't try to update components
    // that might be unmounting
    setTimeout(() => {
      setCurrentUser(null);
      
      // Execute callback only after state has been updated
      if (callback) {
        // Additional delay to ensure state updates have propagated
        setTimeout(() => {
          setIsLoggingOut(false);
          callback();
        }, 50);
      } else {
        setIsLoggingOut(false);
      }
    }, 50);
  };

  // Update user in the users list
  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      )
    );
    
    // Also update currentUser if it's the same user
    if (currentUser?.id === userId) {
      setCurrentUser({ ...currentUser, ...updates });
    }
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        users,
        isAuthenticated: !!currentUser,
        isLoading,
        isLoggingOut,
        login,
        register,
        logout,
        setCurrentUser,
        updateUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

/**
 * Custom hook for using the user context
 * @returns UserContext
 */
export function useUser() {
  return useContext(UserContext);
}
