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

  // Show loading state immediately
  if (isLoading) {
    console.log('Showing auth loading spinner');
    return (
      <Center h="100vh" position="fixed" top="0" left="0" width="100%" zIndex="9999" bg="rgba(255, 255, 255, 0.8)">
        <Box textAlign="center" p={8} borderRadius="md" boxShadow="lg" bg="white">
          <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" mb={4} />
          <Text fontSize="lg" fontWeight="medium">Comprobando autenticación...</Text>
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
