import React, { useState } from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProvider, useUser } from '../UserContext';
import { UserRole } from '../../types/user';

// Mock for localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => {
      return store[key] || null;
    }),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

// Replace actual localStorage with mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Test component to access user context
const TestComponent = () => {
  const { 
    currentUser, 
    isAuthenticated, 
    isLoggingOut,
    login, 
    logout, 
    register 
  } = useUser();
  const [callbackExecuted, setCallbackExecuted] = useState(false);

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
      </div>
      <div data-testid="logout-status">
        {isLoggingOut ? 'Logging out' : 'Not logging out'}
      </div>
      <div data-testid="callback-status">
        {callbackExecuted ? 'Callback executed' : 'Callback not executed'}
      </div>
      {currentUser && (
        <div data-testid="user-info">
          {currentUser.username}-{currentUser.role}
        </div>
      )}
      <button data-testid="login-button" onClick={() => login('admin@example.com', 'password')}>
        Login
      </button>
      <button data-testid="register-button" onClick={() => 
        register('newuser', 'new@example.com', 'password', UserRole.TRANSLATOR)
      }>
        Register
      </button>
      <button 
        data-testid="logout-button" 
        onClick={() => logout()}
      >
        Logout
      </button>
      <button 
        data-testid="logout-with-callback-button" 
        onClick={() => logout(() => setCallbackExecuted(true))}
      >
        Logout with callback
      </button>
    </div>
  );
};

describe('UserContext', () => {
  // Clear localStorage before each test
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('provides initial unauthenticated state', async () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
    expect(screen.queryByTestId('user-info')).not.toBeInTheDocument();
  });

  it('can login a user', async () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    // User is initially not authenticated
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');

    // Click login button
    await act(async () => {
      userEvent.click(screen.getByTestId('login-button'));
    });

    // Wait for authentication state to update
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-info')).toHaveTextContent('admin-admin');
    });

    // Verify localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('can register a new user', async () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    // User is initially not authenticated
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');

    // Click register button
    await act(async () => {
      userEvent.click(screen.getByTestId('register-button'));
    });

    // Wait for authentication state to update
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-info')).toHaveTextContent('newuser-translator');
    });

    // Verify localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('can logout a user', async () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    // Login first
    await act(async () => {
      userEvent.click(screen.getByTestId('login-button'));
    });

    // Verify login worked
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });

    // Click logout button
    await act(async () => {
      userEvent.click(screen.getByTestId('logout-button'));
    });

    // Verify logout worked
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
      expect(screen.queryByTestId('user-info')).not.toBeInTheDocument();
    });

    // Verify localStorage was cleared
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
  });

  it('can logout a user with callback', async () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    // Login first
    await act(async () => {
      userEvent.click(screen.getByTestId('login-button'));
    });

    // Verify login worked
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });

    // Verify initial state of callback
    expect(screen.getByTestId('callback-status')).toHaveTextContent('Callback not executed');
    
    // Click logout with callback button
    await act(async () => {
      userEvent.click(screen.getByTestId('logout-with-callback-button'));
    });

    // First, isLoggingOut should be true
    await waitFor(() => {
      expect(screen.getByTestId('logout-status')).toHaveTextContent('Logging out');
    });

    // Then verification that logout worked and callback executed
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
      expect(screen.queryByTestId('user-info')).not.toBeInTheDocument();
      expect(screen.getByTestId('callback-status')).toHaveTextContent('Callback executed');
      expect(screen.getByTestId('logout-status')).toHaveTextContent('Not logging out');
    }, { timeout: 1000 });
  });

  it('restores user from localStorage on mount', async () => {
    // Set user in localStorage
    const mockUser = {
      id: '123',
      username: 'testuser',
      email: 'test@example.com',
      role: UserRole.ADMIN
    };
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockUser));

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    // User should be authenticated from localStorage
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-info')).toHaveTextContent('testuser-admin');
    });

    // Verify localStorage was read
    expect(localStorageMock.getItem).toHaveBeenCalledWith('user');
  });
});
