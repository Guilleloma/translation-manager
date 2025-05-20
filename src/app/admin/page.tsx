'use client';

import React from 'react';
import { Container } from '@chakra-ui/react';
import AdminPanel from '../../components/admin/AdminPanel';
import AuthGuard from '../../components/auth/AuthGuard';
import { UserRole } from '../../types/user';

/**
 * Admin Page
 * Protected page that only admin users can access
 */
export default function AdminPage() {
  console.log('Admin page rendered');
  
  return (
    <AuthGuard requiredRole={UserRole.ADMIN}>
      <Container maxW="container.xl" py={8}>
        <AdminPanel />
      </Container>
    </AuthGuard>
  );
}
