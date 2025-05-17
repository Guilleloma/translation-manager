'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { useUser, UserRole, User } from '../../context/UserContext';
import LanguageUserSelector from '../assignment/LanguageUserSelector';

/**
 * AdminPanel Component
 * Provides admin functionality for managing users and roles
 */
export default function AdminPanel() {
  const { currentUser, users, updateUser } = useUser();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Sample users data - these would be loaded from an API in a real app
  const sampleUsers: User[] = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      role: UserRole.ADMIN,
    },
    {
      id: '2',
      username: 'translator',
      email: 'translator@example.com',
      role: UserRole.TRANSLATOR,
      languages: ['en', 'fr'],
    },
    {
      id: '3',
      username: 'Maria García',
      email: 'maria@example.com',
      role: UserRole.TRANSLATOR,
      languages: ['en', 'it'],
    },
  ];
  
  // Initialize with sample users if no users exist
  useEffect(() => {
    if (users.length === 0) {
      sampleUsers.forEach(user => {
        updateUser(user.id, user);
      });
    }
  }, []); // Empty dependency array means this runs once on mount

  // Function to change user role
  const toggleUserRole = (user: User) => {
    if (!currentUser) return;
    
    console.log(`Changing user role: ${user.username} from ${user.role}`);
    const newRole = user.role === UserRole.ADMIN ? UserRole.TRANSLATOR : UserRole.ADMIN;
    
    // Update the user's role
    updateUser(user.id, { role: newRole });
    
    // Show success message
    toast({
      title: 'Rol actualizado',
      description: `El usuario ${user.username} ahora es ${newRole === UserRole.ADMIN ? 'Administrador' : 'Traductor'}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Function to delete user
  const handleDeleteUser = () => {
    if (!selectedUser || !currentUser) return;
    
    console.log(`Attempting to delete user: ${selectedUser.username}`);
    
    // Cannot delete yourself
    if (selectedUser.id === currentUser.id) {
      console.error('Cannot delete own user account');
      toast({
        title: 'Operación no permitida',
        description: 'No puedes eliminar tu propio usuario',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      return;
    }
    
    // In a real app, we would make an API call to delete the user
    console.log(`User deleted: ${selectedUser.username}`);
    
    // For this prototype, we'll just show a success message
    toast({
      title: 'Usuario eliminado',
      description: `El usuario ${selectedUser.username} ha sido eliminado`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    
    onClose();
  };

  // Function to confirm delete
  const confirmDelete = (user: User) => {
    console.log(`Confirming delete for user: ${user.username}`);
    setSelectedUser(user);
    onOpen();
  };

  // Stats for the dashboard
  const stats = {
    totalUsers: users.length,
    admins: users.filter(u => u.role === UserRole.ADMIN).length,
    translators: users.filter(u => u.role === UserRole.TRANSLATOR).length,
  };

  return (
    <Box>
      <Heading size="lg" mb={6}>Panel de Administración</Heading>
      
      <Tabs variant="enclosed">
        <TabList>
          <Tab>Dashboard</Tab>
          <Tab>Usuarios</Tab>
          <Tab>Asignación de Idiomas</Tab>
        </TabList>
        
        <TabPanels>
          {/* Dashboard Tab */}
          <TabPanel>
            <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
              <Heading fontSize="xl" mb={4}>Estadísticas Generales</Heading>
              
              <Box display="flex" flexWrap="wrap" gap={4}>
                <Box flex="1" p={4} borderWidth="1px" borderRadius="md" bg="blue.50">
                  <Heading size="md" mb={2}>Usuarios Totales</Heading>
                  <Text fontSize="2xl">{stats.totalUsers}</Text>
                </Box>
                
                <Box flex="1" p={4} borderWidth="1px" borderRadius="md" bg="purple.50">
                  <Heading size="md" mb={2}>Administradores</Heading>
                  <Text fontSize="2xl">{stats.admins}</Text>
                </Box>
                
                <Box flex="1" p={4} borderWidth="1px" borderRadius="md" bg="green.50">
                  <Heading size="md" mb={2}>Traductores</Heading>
                  <Text fontSize="2xl">{stats.translators}</Text>
                </Box>
              </Box>
            </Box>
          </TabPanel>
          
          {/* Users Tab */}
          <TabPanel>
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>ID</Th>
                    <Th>Usuario</Th>
                    <Th>Email</Th>
                    <Th>Rol</Th>
                    <Th>Idiomas</Th>
                    <Th>Acciones</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {users.map(user => (
                    <Tr key={user.id}>
                      <Td>{user.id}</Td>
                      <Td>{user.username}</Td>
                      <Td>{user.email}</Td>
                      <Td>
                        <Badge colorScheme={user.role === UserRole.ADMIN ? 'purple' : 'green'}>
                          {user.role === UserRole.ADMIN ? 'Admin' : 'Traductor'}
                        </Badge>
                      </Td>
                      <Td>
                        {user.languages ? (
                          <Box display="flex" gap={1}>
                            {user.languages.map(lang => (
                              <Badge key={lang} colorScheme="blue">{lang}</Badge>
                            ))}
                          </Box>
                        ) : (
                          <Text color="gray.500">-</Text>
                        )}
                      </Td>
                      <Td>
                        <Box display="flex" gap={2}>
                          <Button
                            size="sm"
                            colorScheme={user.role === UserRole.ADMIN ? 'green' : 'purple'}
                            onClick={() => toggleUserRole(user)}
                          >
                            {user.role === UserRole.ADMIN ? 'Hacer Traductor' : 'Hacer Admin'}
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="red"
                            onClick={() => confirmDelete(user)}
                            isDisabled={user.id === currentUser?.id}
                          >
                            Eliminar
                          </Button>
                        </Box>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </TabPanel>
          
          {/* Language Assignment Tab */}
          <TabPanel>
            <LanguageUserSelector />
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Eliminar Usuario
            </AlertDialogHeader>

            <AlertDialogBody>
              ¿Estás seguro de que quieres eliminar al usuario {selectedUser?.username}? Esta acción no se puede deshacer.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleDeleteUser} ml={3}>
                Eliminar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
