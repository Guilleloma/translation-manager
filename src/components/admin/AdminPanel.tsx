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
import RoleSelector from './RoleSelector';
import LanguageBadge from '../common/LanguageBadge';

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
  }, [users, updateUser]); // Empty dependency array means this runs once on mount

  // Function to change user role
  const handleRoleChange = (userId: string, newRole: UserRole) => {
    if (!currentUser) return;
    
    // Buscar el usuario por ID
    const user = users.find(u => u.id === userId);
    if (!user) {
      console.error(`Usuario con ID ${userId} no encontrado`);
      return;
    }
    
    console.log(`Cambiando rol de usuario: ${user.username} de ${user.role} a ${newRole}`);
    
    // Actualizar el rol del usuario
    updateUser(userId, { ...user, role: newRole });
  };

  // Function to delete user
  const handleDeleteUser = () => {
    if (!selectedUser || !currentUser) return;
    
    console.log(`Deleting user: ${selectedUser.username}`);
    
    // In a real app, this would be an API call
    // For this prototype, we just filter out the user from our local state
    const updatedUsers = users.filter(u => u.id !== selectedUser.id);
    
    // Update local storage (in a real app, this would be handled by the API)
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
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

  return (
    <Box p={5}>
      <Heading as="h1" size="xl" mb={5}>
        Panel de Administración
      </Heading>
      
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>Dashboard</Tab>
          <Tab>Asignación de Copys</Tab>
          <Tab>Usuarios</Tab>
          <Tab>Asignación de Idiomas</Tab>
        </TabList>
        
        <TabPanels>
          {/* Dashboard Tab */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
              <Card>
                <CardBody>
                  <Flex align="center" mb={3}>
                    <Icon as={AtSignIcon} boxSize={6} color="blue.500" mr={2} />
                    <Heading size="md">Usuarios</Heading>
                  </Flex>
                  <Text fontSize="2xl" fontWeight="bold">{users.length}</Text>
                  <Text color="gray.500">Total de usuarios registrados</Text>
                </CardBody>
              </Card>
              
              <Card>
                <CardBody>
                  <Flex align="center" mb={3}>
                    <Icon as={EditIcon} boxSize={6} color="green.500" mr={2} />
                    <Heading size="md">Copys</Heading>
                  </Flex>
                  <Text fontSize="2xl" fontWeight="bold">{copys.length}</Text>
                  <Text color="gray.500">Total de copys en el sistema</Text>
                </CardBody>
              </Card>
              

            </SimpleGrid>
            
            <Box mt={8}>
              <Heading size="md" mb={4}>Actividad Reciente</Heading>
              <Box 
                p={4} 
                borderWidth="1px" 
                borderRadius="md" 
                bg="gray.50"
              >
                <Text color="gray.500" fontStyle="italic">
                  Esta sección mostrará la actividad reciente de los usuarios (en desarrollo)
                </Text>
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
                    <Th width="100px">Eliminar</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {users.map(user => (
                    <Tr key={user.id}>
                      <Td>{user.id}</Td>
                      <Td>{user.username}</Td>
                      <Td>{user.email}</Td>
                      <Td>
                        <RoleSelector 
                          user={user} 
                          onRoleChange={handleRoleChange} 
                        />
                      </Td>
                      <Td>
                        {user.languages ? (
                          <Box display="flex" gap={1} flexWrap="wrap">
                            {user.languages.map(lang => (
                              <LanguageBadge key={lang} languageCode={lang} size="sm" />
                            ))}
                          </Box>
                        ) : (
                          <Text color="gray.500">-</Text>
                        )}
                      </Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="red"
                          onClick={() => confirmDelete(user)}
                          isDisabled={user.id === currentUser?.id}
                        >
                          Eliminar
                        </Button>
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
