import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { UserProvider, useUser } from '../UserContext';

// Mock localStorage
const localStorageMock = (function() {
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
    store
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Test component that uses the user context
const TestComponent = () => {
  const { currentUser, isAuthenticated, isLoading } = useUser();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {isAuthenticated ? (
        <div data-testid="authenticated">
          Logged in as {currentUser?.username}
        </div>
      ) : (
        <div data-testid="not-authenticated">Not logged in</div>
      )}
    </div>
  );
};

describe('Session Persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });
  
  it('should restore user session from localStorage on page load', async () => {
    // Setup: Store a user in localStorage
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'TRANSLATOR'
    };
    
    localStorageMock.setItem('user', JSON.stringify(mockUser));
    
    // Render the component tree with UserProvider
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );
    
    // Initially it might show loading
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Wait for the session to be restored
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toBeInTheDocument();
      expect(screen.getByText(/Logged in as testuser/)).toBeInTheDocument();
    });
    
    // Verify localStorage was accessed
    expect(localStorageMock.getItem).toHaveBeenCalledWith('user');
  });
  
  it('should maintain session after simulated page refresh', async () => {
    // Setup: Store a user in localStorage
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'TRANSLATOR'
    };
    
    localStorageMock.setItem('user', JSON.stringify(mockUser));
    
    // First render - initial page load
    const { unmount } = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );
    
    // Wait for the session to be restored
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toBeInTheDocument();
    });
    
    // Unmount to simulate navigation away
    unmount();
    
    // Second render - simulate page refresh
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );
    
    // User should still be authenticated after the "refresh"
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toBeInTheDocument();
      expect(screen.getByText(/Logged in as testuser/)).toBeInTheDocument();
    });
  });
  
  it('should clear session when logging out', async () => {
    // Setup: Create a component that can trigger logout
    const LogoutTestComponent = () => {
      const { currentUser, isAuthenticated, isLoading, logout } = useUser();
      
      if (isLoading) return <div>Loading...</div>;
      
      return (
        <div>
          {isAuthenticated ? (
            <>
              <div data-testid="authenticated">
                Logged in as {currentUser?.username}
              </div>
              <button onClick={() => logout()} data-testid="logout-button">
                Logout
              </button>
            </>
          ) : (
            <div data-testid="not-authenticated">Not logged in</div>
          )}
        </div>
      );
    };
    
    // Store a user in localStorage
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'TRANSLATOR'
    };
    
    localStorageMock.setItem('user', JSON.stringify(mockUser));
    
    // Render the component
    render(
      <UserProvider>
        <LogoutTestComponent />
      </UserProvider>
    );
    
    // Wait for the session to be restored
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toBeInTheDocument();
    });
    
    // Trigger logout
    act(() => {
      screen.getByTestId('logout-button').click();
    });
    
    // Wait for logout to complete
    await waitFor(() => {
      expect(screen.getByTestId('not-authenticated')).toBeInTheDocument();
    });
    
    // Verify localStorage item was removed
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    
    // Simulate page refresh after logout
    const { unmount } = render(
      <UserProvider>
        <LogoutTestComponent />
      </UserProvider>
    );
    
    unmount();
    
    // Re-render to simulate refresh
    render(
      <UserProvider>
        <LogoutTestComponent />
      </UserProvider>
    );
    
    // User should still be logged out after the "refresh"
    await waitFor(() => {
      expect(screen.getByTestId('not-authenticated')).toBeInTheDocument();
    });
  });
});
