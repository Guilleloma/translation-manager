'use client';

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProvider, useUser } from '../UserContext';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
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

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock requestAnimationFrame
global.requestAnimationFrame = (cb: FrameRequestCallback) => {
  return setTimeout(cb, 0);
};

// Test component
function TestComponent() {
  const { currentUser, login, logout, isLoggingOut } = useUser();
  
  return (
    <div>
      {isLoggingOut && <div data-testid="logging-out">Logging out...</div>}
      {currentUser ? (
        <div>
          <div data-testid="user">{currentUser.username}</div>
          <button data-testid="logout-btn" onClick={() => logout()}>
            Logout
          </button>
        </div>
      ) : (
        <button
          data-testid="login-btn"
          onClick={() => login('test@example.com', 'password')}
        >
          Login
        </button>
      )}
    </div>
  );
}

describe('UserContext logout functionality', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  it('should handle logout without causing hook count inconsistencies', async () => {
    // Verificar consola para errores de React relacionados con hooks
    const consoleSpy = jest.spyOn(console, 'error');
    
    // Renderizar el componente de prueba dentro del UserProvider
    const { rerender } = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    // Log in first
    const loginButton = screen.getByTestId('login-btn');
    await userEvent.click(loginButton);
    
    // Verify we're logged in
    await waitFor(() => {
      expect(screen.getByTestId('user')).toBeInTheDocument();
    });

    // Log out
    const logoutButton = screen.getByTestId('logout-btn');
    await act(async () => {
      await userEvent.click(logoutButton);
    });

    // Verify logout flag is triggered correctly
    expect(screen.queryByTestId('logging-out')).not.toBeInTheDocument();
    
    // Verify we've been logged out
    await waitFor(() => {
      expect(screen.queryByTestId('user')).not.toBeInTheDocument();
      expect(screen.getByTestId('login-btn')).toBeInTheDocument();
    });

    // Forzar un rerender después del logout para verificar que los hooks se manejan correctamente
    rerender(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    // No debería haber errores de React relacionados con hooks count
    expect(consoleSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('Rendered fewer hooks than expected')
    );
    
    // Verify localStorage was updated
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
  });
  
  it('should execute callback after logout is complete', async () => {
    const callbackMock = jest.fn();
    
    // Setup a component that uses a callback with logout
    function CallbackComponent() {
      const { currentUser, login, logout } = useUser();
      
      return (
        <div>
          {currentUser ? (
            <button
              data-testid="logout-with-callback"
              onClick={() => logout(callbackMock)}
            >
              Logout with callback
            </button>
          ) : (
            <button
              data-testid="login-btn"
              onClick={() => login('test@example.com', 'password')}
            >
              Login
            </button>
          )}
        </div>
      );
    }
    
    render(
      <UserProvider>
        <CallbackComponent />
      </UserProvider>
    );
    
    // Log in first
    const loginButton = screen.getByTestId('login-btn');
    await userEvent.click(loginButton);
    
    // Wait for login to complete
    await waitFor(() => {
      expect(screen.getByTestId('logout-with-callback')).toBeInTheDocument();
    });
    
    // Log out with callback
    const logoutButton = screen.getByTestId('logout-with-callback');
    await act(async () => {
      await userEvent.click(logoutButton);
    });
    
    // Verify callback was called after logout completed
    await waitFor(() => {
      expect(callbackMock).toHaveBeenCalled();
    });
  });
});
