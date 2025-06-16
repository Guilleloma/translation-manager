'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  IconButton,
  Spinner,
  Divider,
} from '@chakra-ui/react';
import { ArrowForwardIcon, SettingsIcon, AtSignIcon, EditIcon, RepeatIcon, DeleteIcon, WarningIcon } from '@chakra-ui/icons';
import NextLink from 'next/link';
import { useUser } from '../../context/UserContext';
import { UserRole, User } from '../../types/user';
import LanguageUserSelector from '../assignment/LanguageUserSelector';
import CopyAssignment from '../assignment/CopyAssignment';
import { Copy } from '../../types/copy';
import RoleSelector from './RoleSelector';
import LanguageBadge from '../common/LanguageBadge';
import { useCopys } from '../../hooks/useDataService';
import dataService from '../../services/dataService';

/**
 * AdminPanel Component
 * Provides admin functionality for managing users and roles
 */
export default function AdminPanel() {
  const { currentUser, users, updateUser } = useUser();
  const toast = useToast();
  
  // Diálogo para eliminar usuario
  const { 
    isOpen: isUserDeleteOpen, 
    onOpen: onUserDeleteOpen, 
    onClose: onUserDeleteClose 
  } = useDisclosure();
  
  // Diálogo para eliminar todos los copys
  const { 
    isOpen: isResetCopysOpen, 
    onOpen: onResetCopysOpen, 
    onClose: onResetCopysClose 
  } = useDisclosure();
  
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Usar el nuevo hook para copys
  const { copys, loading: isLoadingCopys, refresh: refreshCopys } = useCopys();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  // Actualizar timestamp cuando cambian los copys
  useEffect(() => {
    setLastUpdate(new Date());
  }, [copys]);
  
  // Referencia para controlar los toasts
  const toastIdRef = useRef<string | number | null>(null);
  const lastToastTime = useRef<number>(0);
  const pendingUpdates = useRef<number>(0);
  
  /**
   * Función para actualizar un copy
   * Implementa un sistema de gestión de notificaciones para evitar saturar la interfaz
   * cuando se actualizan muchos copys a la vez
   */
  const updateCopy = (copyId: string, updates: Partial<Copy>) => {
    console.log(`Actualizando copy ${copyId}:`, updates);
    
    // Usar el servicio de datos
    dataService.updateCopy(copyId, updates);
    
    // Incrementar contador de actualizaciones pendientes
    pendingUpdates.current += 1;
    
    // Obtener tiempo actual
    const now = Date.now();
    
    // Si hay un toast activo o ha pasado poco tiempo desde el último toast, no mostrar uno nuevo
    if (toastIdRef.current || (now - lastToastTime.current < 500)) {
      return;
    }
    
    // Mostrar un toast que se actualizará con el número total de actualizaciones
    toastIdRef.current = toast({
      title: 'Actualizando copys',
      description: `Se está actualizando la asignación de copys...`,
      status: 'info',
      duration: null,
      isClosable: true,
      position: 'bottom-right',
    });
    
    // Configurar un timeout para cerrar el toast actual y mostrar el resumen
    setTimeout(() => {
      // Cerrar el toast de progreso
      if (toastIdRef.current) {
        toast.close(toastIdRef.current);
      }
      
      // Mostrar el toast de resumen solo si hubo actualizaciones
      if (pendingUpdates.current > 0) {
        toast({
          title: 'Copys actualizados',
          description: `Se ha actualizado la asignación de ${pendingUpdates.current} copy${pendingUpdates.current !== 1 ? 's' : ''}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'bottom-right',
        });
      }
      
      // Resetear el estado
      toastIdRef.current = null;
      pendingUpdates.current = 0;
      lastToastTime.current = Date.now();
    }, 1000); // Esperar 1 segundo para acumular actualizaciones
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
    // Implementar lógica para eliminar usuario
    onUserDeleteClose();
  };

  // Function to confirm delete user
  const confirmDelete = (user: User) => {
    setSelectedUser(user);
    onUserDeleteOpen();
  };

  /**
   * Función para eliminar todos los copys de la base de datos
   * Esta operación es irreversible y solo debe ser utilizada por administradores
   */
  const handleDeleteAllCopys = async () => {
    try {
      setIsDeleting(true);
      
      // Llamar al método del dataService
      const result = await dataService.deleteAllCopys();
      
      // Cerrar el diálogo
      onResetCopysClose();
      
      // Mostrar notificación
      toast({
        title: result.success ? 'Operación exitosa' : 'Error',
        description: result.message,
        status: result.success ? 'success' : 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
      
      // Actualizar la lista de copys
      if (result.success) {
        refreshCopys();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Error al eliminar los copys: ${(error as Error).message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box p={6}>
      <Flex mb={6} align="center" justify="space-between">
        <Heading size="lg">Panel de Administración</Heading>
        <Flex gap={2} align="center">
          <Text fontSize="sm" color="gray.500">
            Última actualización: {lastUpdate.toLocaleTimeString()}
          </Text>
          <Tooltip label="Refrescar datos">
            <IconButton
              aria-label="Refrescar datos"
              icon={isLoadingCopys ? <Spinner size="sm" /> : <RepeatIcon />}
              onClick={() => {
                refreshCopys();
                // Eliminar llamada a método debug que no existe
              }}
              size="sm"
              colorScheme="blue"
              variant="ghost"
              isDisabled={isLoadingCopys}
            />
          </Tooltip>
        </Flex>
      </Flex>

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
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
              <Card>
                <CardBody>
                  <Flex align="center" mb={2}>
                    <Icon as={AtSignIcon} mr={2} color="blue.500" />
                    <Heading size="md">Usuarios</Heading>
                  </Flex>
                  <Text fontSize="2xl" fontWeight="bold">{users.length}</Text>
                  <Text color="gray.500">Usuarios registrados</Text>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <Flex align="center" mb={2}>
                    <Icon as={EditIcon} mr={2} color="green.500" />
                    <Heading size="md">Traductores</Heading>
                  </Flex>
                  <Text fontSize="2xl" fontWeight="bold">
                    {users.filter(u => u.role === UserRole.TRANSLATOR).length}
                  </Text>
                  <Text color="gray.500">Traductores activos</Text>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <Flex align="center" mb={2}>
                    <Icon as={SettingsIcon} mr={2} color="purple.500" />
                    <Heading size="md">Copys</Heading>
                  </Flex>
                  <Flex align="baseline" gap={2}>
                    <Text fontSize="2xl" fontWeight="bold">{copys.length}</Text>
                    {isLoadingCopys && <Spinner size="sm" color="purple.500" />}
                  </Flex>
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
            
            {/* Sección de Administración de Base de Datos */}
            <Box mt={8}>
              <Heading size="md" mb={4}>Administración de Base de Datos</Heading>
              <Box
                p={4}
                borderWidth="1px"
                borderRadius="md"
                bg="red.50"
              >
                <Heading size="sm" mb={2} color="red.600">
                  <Flex align="center">
                    <WarningIcon mr={2} />
                    Operaciones Peligrosas
                  </Flex>
                </Heading>
                <Text mb={4} color="gray.700">
                  Las siguientes operaciones son irreversibles y afectarán permanentemente a la base de datos.
                  Úsalas con extrema precaución.
                </Text>
                
                <Divider mb={4} />
                
                <Box>
                  <Heading size="xs" mb={2} color="red.600">Eliminar Todos los Copys</Heading>
                  <Text mb={2} fontSize="sm" color="gray.700">
                    Esta operación eliminará todos los copys de la base de datos. Los usuarios no se verán afectados.
                  </Text>
                  <Button
                    leftIcon={<DeleteIcon />}
                    colorScheme="red"
                    variant="outline"
                    size="sm"
                    onClick={onResetCopysOpen}
                    isDisabled={isDeleting}
                  >
                    Eliminar Todos los Copys
                  </Button>
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
                    <Th>Contraseña</Th>
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
                      <Td>{user.password || '-'}</Td>
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

      {/* Delete User Confirmation Dialog */}
      <AlertDialog
        isOpen={isUserDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onUserDeleteClose}
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
              <Button ref={cancelRef} onClick={onUserDeleteClose}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleDeleteUser} ml={3}>
                Eliminar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
      
      {/* Delete All Copys Confirmation Dialog */}
      <AlertDialog
        isOpen={isResetCopysOpen}
        leastDestructiveRef={cancelRef}
        onClose={onResetCopysClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="red.600">
              <Flex align="center">
                <WarningIcon mr={2} />
                Eliminar Todos los Copys
              </Flex>
            </AlertDialogHeader>

            <AlertDialogBody>
              <Text mb={3} fontWeight="bold">
                ¡ADVERTENCIA! Esta es una operación destructiva e irreversible.
              </Text>
              <Text mb={3}>
                Estás a punto de eliminar <strong>TODOS</strong> los copys de la base de datos. 
                Esta acción no afectará a los usuarios, pero eliminará permanentemente todas las traducciones.
              </Text>
              <Text fontWeight="bold">
                ¿Estás completamente seguro de que deseas continuar?
              </Text>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onResetCopysClose}>
                Cancelar
              </Button>
              <Button 
                colorScheme="red" 
                onClick={handleDeleteAllCopys} 
                ml={3}
                isLoading={isDeleting}
                loadingText="Eliminando..."
              >
                Eliminar Todos los Copys
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
