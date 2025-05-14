import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import AuthGuard from '../AuthGuard';
import { UserRole } from '../../../context/UserContext';

// Mock useUser hook
jest.mock('../../../context/UserContext', () => ({
  UserRole: {
    ADMIN: 'admin',
    TRANSLATOR: 'translator',
  },
  useUser: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/test'),
}));

// Import the mocked module to manipulate it in tests
import { useUser } from '../../../context/UserContext';

describe('AuthGuard', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it('shows loading state when authentication is in progress', () => {
    (useUser as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      currentUser: null,
      isLoading: true,
    });

    render(
      <AuthGuard>
        <div>Protected content</div>
      </AuthGuard>
    );

    expect(screen.getByText(/comprobando autenticación/i)).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('redirects to auth page when user is not authenticated', async () => {
    (useUser as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      currentUser: null,
      isLoading: false,
    });

    render(
      <AuthGuard>
        <div>Protected content</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth');
    });
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('renders children when user is authenticated', () => {
    (useUser as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      currentUser: { 
        id: '1', 
        username: 'testuser', 
        email: 'test@example.com',
        role: UserRole.TRANSLATOR 
      },
      isLoading: false,
    });

    render(
      <AuthGuard>
        <div>Protected content</div>
      </AuthGuard>
    );

    expect(screen.getByText('Protected content')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('redirects to home when user does not have the required role', async () => {
    (useUser as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      currentUser: { 
        id: '1', 
        username: 'testuser', 
        email: 'test@example.com',
        role: UserRole.TRANSLATOR 
      },
      isLoading: false,
    });

    render(
      <AuthGuard requiredRole={UserRole.ADMIN}>
        <div>Admin only content</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
    expect(screen.queryByText('Admin only content')).not.toBeInTheDocument();
  });

  it('renders children when user has the required role', () => {
    (useUser as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      currentUser: { 
        id: '1', 
        username: 'admin', 
        email: 'admin@example.com',
        role: UserRole.ADMIN 
      },
      isLoading: false,
    });

    render(
      <AuthGuard requiredRole={UserRole.ADMIN}>
        <div>Admin only content</div>
      </AuthGuard>
    );

    expect(screen.getByText('Admin only content')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
