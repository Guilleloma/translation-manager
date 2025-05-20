'use client';

import React, { useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { UserRole } from '../../types/user';
import { useRouter, usePathname } from 'next/navigation';
import { Box, Spinner, Text, Center } from '@chakra-ui/react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

/**
 * AuthGuard Component
 * Protects routes that require authentication or specific roles
 */
export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { isAuthenticated, currentUser, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  // Log for debugging
  console.log('AuthGuard rendered', { 
    isAuthenticated, 
    currentUserRole: currentUser?.role,
    requiredRole,
    pathname
  });

  useEffect(() => {
    // Skip if still loading
    if (isLoading) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to auth page');
      router.push('/auth');
      return;
    }

    // If specific role is required, check user role
    if (requiredRole && currentUser?.role !== requiredRole) {
      console.log('User does not have required role, redirecting to home');
      router.push('/');
      return;
    }
  }, [isAuthenticated, currentUser, isLoading, router, requiredRole]);

  // Show loading state
  if (isLoading) {
    return (
      <Center h="100vh">
        <Box textAlign="center">
          <Spinner size="xl" mb={4} />
          <Text>Comprobando autenticación...</Text>
        </Box>
      </Center>
    );
  }

  // Show unauthorized message if not authenticated or wrong role
  if (!isAuthenticated || (requiredRole && currentUser?.role !== requiredRole)) {
    return null; // This will be replaced by the redirect
  }

  // If authenticated and has required role, render children
  return <>{children}</>;
}
