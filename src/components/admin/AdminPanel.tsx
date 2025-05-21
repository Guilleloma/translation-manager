'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  SimpleGrid,
  Card,
  CardBody,
  Icon,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Link,
  Flex,
  Tooltip,
} from '@chakra-ui/react';
import { ArrowForwardIcon, SettingsIcon, AtSignIcon, EditIcon, RepeatIcon } from '@chakra-ui/icons';
import NextLink from 'next/link';
import { useUser } from '../../context/UserContext';
import { UserRole, User } from '../../types/user';
import LanguageUserSelector from '../assignment/LanguageUserSelector';
import CopyAssignment from '../assignment/CopyAssignment';
import { Copy } from '../../types/copy';
import { resetToSeedData } from '../../utils/seedData';

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
  const [copys, setCopys] = useState<Copy[]>([]);
  
  // Cargar copys desde localStorage (en una app real, esto sería una API)
  useEffect(() => {
    console.log('🔄 Cargando copys desde localStorage para panel de administración...');
    
    const storedCopys = localStorage.getItem('copys');
    if (storedCopys) {
      try {
        const parsedCopys = JSON.parse(storedCopys);
        setCopys(parsedCopys);
        console.log(`✅ Copys cargados correctamente: ${parsedCopys.length}`);
      } catch (error) {
        console.error('❌ Error al cargar copys:', error);
        setCopys([]);
      }
    } else {
      console.log('⚠️ No se encontraron copys en localStorage');
    }
  }, []);
  
  // Función para actualizar un copy
  const updateCopy = (copyId: string, updates: Partial<Copy>) => {
    console.log(`📝 Actualizando copy ${copyId}:`, updates);
    
    setCopys(prevCopys => {
      const updatedCopys = prevCopys.map(copy => {
        if (copy.id === copyId) {
          return { ...copy, ...updates };
        }
        return copy;
      });
      
      // En una app real, esto sería una llamada a API
      // Por ahora, guardamos en localStorage
      localStorage.setItem('copys', JSON.stringify(updatedCopys));
      
      return updatedCopys;
    });
    
    // Mensaje de éxito
    toast({
      title: 'Copy actualizado',
      description: 'Se ha actualizado la asignación del copy',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
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
    
    // Determine the next role in the sequence
    let newRole: UserRole;
    switch (user.role) {
      case UserRole.ADMIN:
        newRole = UserRole.TRANSLATOR;
        break;
      case UserRole.TRANSLATOR:
        newRole = UserRole.REVIEWER;
        break;
      case UserRole.REVIEWER:
        newRole = UserRole.DEVELOPER;
        break;
      case UserRole.DEVELOPER:
      default:
        newRole = UserRole.ADMIN;
    }
    
    // Update the user's role
    updateUser(user.id, { role: newRole });
    
    // Get role display name
    const roleNames = {
      [UserRole.ADMIN]: 'Administrador',
      [UserRole.TRANSLATOR]: 'Traductor',
      [UserRole.REVIEWER]: 'Revisor',
      [UserRole.DEVELOPER]: 'Desarrollador'
    };
    
    // Show success message
    toast({
      title: 'Rol actualizado',
      description: `El usuario ${user.username} ahora es ${roleNames[newRole]}`,
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
    reviewers: users.filter(u => u.role === UserRole.REVIEWER).length,
    developers: users.filter(u => u.role === UserRole.DEVELOPER).length,
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Panel de Administración</Heading>
      </Flex>
      
      <Tabs variant="enclosed">
        <TabList>
          <Tab>Dashboard</Tab>
          <Tab>Asignación de Copys</Tab>
          <Tab>Usuarios</Tab>
          <Tab>Asignación de Idiomas</Tab>
        </TabList>
        
        <TabPanels>
          {/* Dashboard Tab */}
          <TabPanel>
            <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
              <Heading fontSize="xl" mb={4}>Estadísticas Generales</Heading>
              
              <Box display="grid" gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
                <Box p={4} borderWidth="1px" borderRadius="md" bg="blue.50">
                  <Heading size="md" mb={2}>Usuarios Totales</Heading>
                  <Text fontSize="2xl" fontWeight="bold" color="blue.700">{stats.totalUsers}</Text>
                </Box>
                
                <Box p={4} borderWidth="1px" borderRadius="md" bg="purple.50">
                  <Heading size="md" mb={2}>Administradores</Heading>
                  <Text fontSize="2xl" fontWeight="bold" color="purple.700">{stats.admins}</Text>
                </Box>
                
                <Box p={4} borderWidth="1px" borderRadius="md" bg="green.50">
                  <Heading size="md" mb={2}>Traductores</Heading>
                  <Text fontSize="2xl" fontWeight="bold" color="green.700">{stats.translators}</Text>
                </Box>
                
                <Box p={4} borderWidth="1px" borderRadius="md" bg="orange.50">
                  <Heading size="md" mb={2}>Revisores</Heading>
                  <Text fontSize="2xl" fontWeight="bold" color="orange.700">{stats.reviewers}</Text>
                </Box>
                
                <Box p={4} borderWidth="1px" borderRadius="md" bg="blue.50">
                  <Heading size="md" mb={2}>Desarrolladores</Heading>
                  <Text fontSize="2xl" fontWeight="bold" color="blue.700">{stats.developers}</Text>
                </Box>
                
                <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
                  <Heading size="md" mb={2}>Otros Usuarios</Heading>
                  <Text fontSize="2xl" fontWeight="bold" color="gray.700">
                    {stats.totalUsers - (stats.admins + stats.translators + stats.reviewers + stats.developers)}
                  </Text>
                </Box>
              </Box>
            </Box>
          </TabPanel>
          
          {/* Copy Assignment Tab */}
          <TabPanel>
            <CopyAssignment 
              copys={copys} 
              updateCopy={updateCopy} 
            />
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
                        <Badge 
                          colorScheme={
                            user.role === UserRole.ADMIN ? 'purple' :
                            user.role === UserRole.REVIEWER ? 'orange' :
                            user.role === UserRole.DEVELOPER ? 'blue' : 'green'
                          }
                        >
                          {user.role === UserRole.ADMIN ? 'Admin' :
                           user.role === UserRole.TRANSLATOR ? 'Traductor' :
                           user.role === UserRole.REVIEWER ? 'Revisor' : 'Desarrollador'}
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
                            colorScheme={
                              user.role === UserRole.ADMIN ? 'green' :
                              user.role === UserRole.TRANSLATOR ? 'orange' :
                              user.role === UserRole.REVIEWER ? 'blue' : 'purple'
                            }
                            onClick={() => toggleUserRole(user)}
                          >
                            Cambiar Rol
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
