'use client';

import React from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  Stack,
  Badge,
  useToast,
  Flex,
  Avatar,
} from '@chakra-ui/react';
import { useUser } from '../../context/UserContext';
import { UserRole } from '../../types/user';
import { useRouter } from 'next/navigation';

/**
 * UserProfile Component
 * Displays user information and logout button
 */
export default function UserProfile() {
  const { currentUser, logout } = useUser();
  const router = useRouter();
  const toast = useToast();

  // Handle logout
  const handleLogout = () => {
    logout();
    toast({
      title: 'Sesión cerrada',
      description: 'Has cerrado sesión correctamente',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    router.push('/');
  };

  // If no user is logged in, show nothing or a login button
  if (!currentUser) {
    return (
      <Button colorScheme="blue" onClick={() => router.push('/auth')}>
        Iniciar sesión
      </Button>
    );
  }

  return (
    <Box p={4} borderWidth={1} borderRadius="lg" boxShadow="md">
      <Flex alignItems="center" mb={4}>
        <Avatar size="md" name={currentUser.username} mr={4} />
        <Box>
          <Heading size="md">{currentUser.username}</Heading>
          <Text color="gray.600">{currentUser.email}</Text>
        </Box>
      </Flex>

      <Stack spacing={3} mb={4}>
        <Flex alignItems="center">
          <Text fontWeight="bold" mr={2}>Rol:</Text>
          <Badge colorScheme={currentUser.role === UserRole.ADMIN ? 'purple' : 'green'}>
            {currentUser.role === UserRole.ADMIN ? 'Administrador' : 'Traductor'}
          </Badge>
        </Flex>

        {currentUser.languages && (
          <Flex alignItems="center">
            <Text fontWeight="bold" mr={2}>Idiomas:</Text>
            <Flex wrap="wrap" gap={1}>
              {currentUser.languages.map(lang => (
                <Badge key={lang} colorScheme="blue">
                  {lang}
                </Badge>
              ))}
            </Flex>
          </Flex>
        )}
      </Stack>

      <Button colorScheme="red" variant="outline" onClick={handleLogout}>
        Cerrar sesión
      </Button>
    </Box>
  );
}
