'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Select,
  Textarea,
  useToast,
  Flex,
  Spacer,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useColorModeValue,
  VStack
} from '@chakra-ui/react';
import { SearchIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { useUser } from '../../context/UserContext';
import { Copy, CopyStatus } from '../../types/copy';
import { Tooltip } from '@chakra-ui/react';

/**
 * Página de tareas asignadas para traductores y revisores
 * Muestra las tareas pendientes según el rol del usuario, permite filtrar por idioma y actualizar el estado
 */
export default function UserTasks() {
  const { currentUser } = useUser();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [copys, setCopys] = useState<Copy[]>([]);
  const [editingCopy, setEditingCopy] = useState<Copy | null>(null);
  const [translationText, setTranslationText] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Estado para el modal de historial
  const { isOpen: isHistoryOpen, onOpen: onHistoryOpen, onClose: onHistoryClose } = useDisclosure();
  
  // Copy seleccionado para ver su historial
  const [selectedHistoryCopy, setSelectedHistoryCopy] = useState<Copy | null>(null);
  
  // Colores para la UI
  const tableBgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Función para cargar copys asignados al usuario actual
  const fetchAssignedCopys = async () => {
    if (!currentUser) {
      console.log('No hay usuario autenticado');
      return;
    }
    
    console.log(`🔄 Cargando copys asignados a ${currentUser.username} (ID: ${currentUser.id})`);
    
    try {
      // Construir URL con parámetros de filtrado
      const url = new URL('/api/copys', window.location.origin);
      url.searchParams.append('assignedTo', currentUser.id);
      if (currentUser.role === 'translator' && currentUser.languages && currentUser.languages.length > 0) {
        currentUser.languages.forEach(lang => {
          url.searchParams.append('language', lang);
        });
      }
      
      console.log(`🔍 Consultando API: ${url.toString()}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        // Convertir los datos de la API al tipo Copy correcto
        const typedCopys: Copy[] = data.data.map((copy: any) => ({
          ...copy,
          status: copy.status as CopyStatus
        }));
        
        setCopys(typedCopys);
        console.log(`✅ Copys cargados desde API: ${typedCopys.length}`);
      } else {
        console.error('❌ Error al cargar copys:', data.error || 'Respuesta inválida');
        setCopys([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar copys:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las tareas asignadas',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setCopys([]);
    }
  };
  
  // Cargar copys al iniciar o cambiar de usuario
  useEffect(() => {
    fetchAssignedCopys();
  }, [currentUser]);
  
  // Verificar si el usuario está autenticado y tiene un rol válido
  const isTranslator = currentUser?.role === 'translator';
  const isReviewer = currentUser?.role === 'reviewer';
  
  // Filtrar las tareas según el rol del usuario (debe estar antes del return condicional)
  const userTasks = useMemo(() => {
    if (!currentUser || (!isTranslator && !isReviewer)) {
      return [];
    }
    
    console.log(` Filtrando tareas para usuario: ${currentUser.username} (ID: ${currentUser.id}, Rol: ${currentUser.role})`);
    
    // Determinar qué tareas mostrar según el rol
    let filteredTasks: Copy[] = [];
    
    if (isTranslator) {
      // Para traductores: mostrar tareas asignadas a ellos
      console.log('Buscando tareas asignadas al traductor:');
      
      // En caso de que las asignaciones usen diferentes formatos de ID
      const possibleIds = [currentUser.id, `translator-${currentUser.id}`, currentUser.username];
      console.log('Posibles IDs del usuario actual:', possibleIds);
      
      // 🔍 LOG DE DEPURACIÓN: Ver qué contienen los copys cargados
      console.log('🔍 Copys cargados para análisis:', copys.length);
      copys.forEach((copy, index) => {
        console.log(`  Copy ${index + 1}:`, {
          slug: copy.slug,
          language: copy.language,
          status: copy.status,
          assignedTo: copy.assignedTo,
          assignedToType: typeof copy.assignedTo,
          assignedToId: typeof copy.assignedTo === 'object' && copy.assignedTo ? 
            (copy.assignedTo as any)._id || (copy.assignedTo as any).id : copy.assignedTo
        });
      });
      
      filteredTasks = copys.filter(copy => {
        // Verificar si el copy tiene un assignedTo válido
        if (!copy.assignedTo) {
          return false;
        }
        
        // IMPORTANTE: No filtrar estrictamente por status === 'assigned'
        // Mostrar todos los copys asignados al usuario independientemente del estado
        
        // Manejar assignedTo como string o como objeto poblado
        let assignedToId: string;
        if (typeof copy.assignedTo === 'string') {
          assignedToId = copy.assignedTo;
        } else if (typeof copy.assignedTo === 'object' && copy.assignedTo) {
          // Si es un objeto poblado, extraer el ID
          assignedToId = (copy.assignedTo as any)._id || (copy.assignedTo as any).id;
        } else {
          return false;
        }
        
        // Normalizar IDs para comparación (eliminar posibles prefijos o sufijos)
        const normalizedAssignedId = assignedToId.toString().replace(/^translator-/, '');
        const normalizedUserIds = possibleIds.map(id => id.toString().replace(/^translator-/, ''));
        
        const matches = normalizedUserIds.some(id => normalizedAssignedId.includes(id) || id.includes(normalizedAssignedId));
        console.log(`🔍 Verificando copy "${copy.slug}": assignedToId="${assignedToId}", coincide=${matches}`);
        
        return matches;
      });
    } else if (isReviewer) {
      // Para revisores: mostrar tareas traducidas pendientes de revisión
      console.log('Buscando tareas pendientes de revisión:');
      filteredTasks = copys.filter(copy => copy.status === 'translated');
    }
    
    console.log(`Tareas encontradas: ${filteredTasks.length}`);
    
    // Aplicar filtros adicionales (búsqueda y lenguaje)
    let result = [...filteredTasks];
    
    // Filtrar por idioma si se ha seleccionado uno
    if (filterLanguage) {
      result = result.filter(copy => copy.language === filterLanguage);
      console.log(`Filtrado por idioma ${filterLanguage}: ${result.length} tareas`);
    }
    
    // Filtrar por estado si se ha seleccionado uno (solo para revisores)
    if (isReviewer && filterStatus !== 'all') {
      result = result.filter(copy => copy.status === filterStatus);
      console.log(`Filtrado por estado ${filterStatus}: ${result.length} tareas`);
    }
    
    // Filtrar por texto de búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(copy => 
        copy.slug.toLowerCase().includes(query) ||
        copy.text.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [copys, currentUser, isTranslator, isReviewer, filterLanguage, filterStatus, searchQuery]);
  
  // Obtener los idiomas disponibles para el traductor
  const translatorLanguages = useMemo(() => {
    return currentUser?.languages || [];
  }, [currentUser]);
  
  // Función para nombrar los idiomas
  const getLanguageName = (code: string | undefined) => {
    if (!code) return 'Desconocido';
    
    switch (code) {
      case 'es': return 'Español';
      case 'en': return 'English';
      case 'fr': return 'Français';
      case 'de': return 'Deutsch';
      case 'it': return 'Italiano';
      case 'pt': return 'Português';
      default: return code;
    }
  };
  
  // Función para formatear la fecha
  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };
  
  // Función para obtener el color del estado
  const getStatusColor = (status: string) => {
    const statusColors = {
      'not_assigned': 'gray',
      'assigned': 'yellow',
      'translated': 'green',
      'reviewed': 'purple',
      'approved': 'blue',
      'rejected': 'red'
    };
    
    return statusColors[status as keyof typeof statusColors] || 'gray';
  };
  
  // Función para obtener el nombre del estado
  const getStatusName = (status: string) => {
    const statusNames: Record<string, string> = {
      'not_assigned': 'Sin asignar',
      'assigned': 'Asignado',
      'translated': 'Traducido',
      'reviewed': 'Revisado',
      'approved': 'Aprobado',
      'rejected': 'Rechazado'
    };
    
    return statusNames[status as keyof typeof statusNames] || status;
  };
  
  // Función para iniciar la traducción o revisión de un copy
  const handleTranslate = (copy: Copy) => {
    if (isReviewer) {
      console.log(` Iniciando revisión para copy: ${copy.slug}`);
    } else {
      console.log(` Iniciando traducción para copy: ${copy.slug}`);
    }
    
    setEditingCopy(copy);
    setTranslationText(copy.text);
    onOpen();
  };
  
  // Función para ver el historial de un copy
  const handleViewHistory = (copy: Copy) => {
    console.log(` Viendo historial para copy: ${copy.slug}`);
    setSelectedHistoryCopy(copy);
    onHistoryOpen();
  };
  
  // Función para guardar la traducción o revisión
  const handleSaveTranslation = async () => {
    // Verificar que haya un texto y un copy para editar
    if (!editingCopy || !translationText.trim()) {
      toast({
        title: 'Error',
        description: isReviewer 
          ? 'Debes proporcionar comentarios para la revisión' 
          : 'Debes proporcionar una traducción válida',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Verificar que el usuario esté autenticado
    if (!currentUser) {
      toast({
        title: 'Error de autenticación',
        description: 'No se ha detectado un usuario autenticado. Por favor, inicia sesión nuevamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    // Determinar el nuevo estado según el rol del usuario
    const newStatus: CopyStatus = isReviewer ? 'reviewed' : 'translated';
    const actionName = isReviewer ? 'revisión' : 'traducción';
    
    console.log(` Guardando ${actionName} para: ${editingCopy.slug}`);
    console.log(` Texto original: "${editingCopy.text.substring(0, 50)}..."`);
    console.log(` ${isReviewer ? 'Texto revisado' : 'Traducción'}: "${translationText.substring(0, 50)}..."`);
    
    // Crear una entrada de historial
    const historyEntry = {
      id: `history-${Date.now()}`,
      copyId: editingCopy.id,
      userId: currentUser.id,
      userName: currentUser.username || 'Usuario',
      previousStatus: editingCopy.status,
      newStatus: newStatus,
      createdAt: new Date(),
      comments: isReviewer ? translationText : undefined
    };
    
    console.log('Creando entrada de historial:', historyEntry);
    
    // Actualizar el copy en el estado local
    const updatedCopys = copys.map(copy => {
      if (copy.id === editingCopy.id) {
        const updatedCopy = {
          ...copy,
          status: newStatus,
          // Si es revisor, no modificamos el texto sino que agregamos un comentario
          // Si es traductor, actualizamos el texto
          ...(!isReviewer && { text: translationText }),
        };
        
        // Agregar fechas según el estado
        if (newStatus === 'translated') {
          updatedCopy.completedAt = new Date();
        } else if (newStatus === 'reviewed') {
          updatedCopy.reviewedAt = new Date();
          updatedCopy.reviewedBy = currentUser.id;
        }
        
        // Agregar historial si no existe
        if (!updatedCopy.history) {
          updatedCopy.history = [];
        }
        
        // Agregar la nueva entrada al historial
        updatedCopy.history.push(historyEntry);
        
        return updatedCopy;
      }
      return copy;
    });
    
    // Preparar los datos para enviar a la API
    const copyToUpdate = updatedCopys.find(copy => copy.id === editingCopy.id);
    
    if (!copyToUpdate) {
      console.error('❌ Error: No se encontró el copy actualizado en el estado local');
      return;
    }
    
    console.log('📤 Enviando actualización a la API:', {
      id: copyToUpdate.id,
      status: copyToUpdate.status,
      text: copyToUpdate.text.substring(0, 30) + '...'
    });
    
    try {
      // Llamar a la API para actualizar el copy
      const response = await fetch(`/api/copys/${editingCopy.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(copyToUpdate),
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Copy actualizado exitosamente en la API');
        // Actualizar el estado local con los datos actualizados
        await fetchAssignedCopys();
      } else {
        console.error('❌ Error al actualizar copy en la API:', result.error);
        throw new Error(result.error || 'Error al actualizar la traducción');
      }
    } catch (error) {
      console.error('❌ Error en la llamada a la API:', error);
      toast({
        title: 'Error al guardar',
        description: `No se pudo guardar la ${actionName}. Por favor, intenta nuevamente.`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return; // Salir de la función sin cerrar el modal
    }
    
    // Mostrar notificación de éxito
    toast({
      title: isReviewer ? 'Revisión completada' : 'Traducción guardada',
      description: isReviewer
        ? `La revisión para "${editingCopy.slug}" ha sido completada.`
        : `La traducción para "${editingCopy.slug}" ha sido guardada.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    
    // Cerrar el modal y limpiar el estado
    onClose();
    setEditingCopy(null);
    setTranslationText('');
  };
  
  if (!currentUser || (!isTranslator && !isReviewer)) {
    return (
      <Container maxW="container.xl" py={10}>
        <Box textAlign="center" py={10} px={6}>
          <Heading as="h2" size="xl">
            Acceso Restringido
          </Heading>
          <Text mt={4} mb={8}>
            Esta página es solo para traductores y revisores. Por favor, inicia sesión con una cuenta adecuada.
          </Text>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.xl" py={10}>
      <Heading mb={6}>
        {isTranslator ? 'Mis Tareas de Traducción' : 'Tareas Pendientes de Revisión'}
      </Heading>
      
      <Text mb={4}>
        Bienvenido/a, <strong>{currentUser.username}</strong>. 
        {isTranslator 
          ? 'Aquí puedes ver y gestionar tus tareas de traducción asignadas.' 
          : 'Aquí puedes revisar las traducciones pendientes de aprobación.'}
      </Text>
      
      <Card mb={6} variant="outline" borderColor={borderColor}>
        <CardHeader pb={2}>
          <Flex align="center">
            <Heading size="md">Filtros</Heading>
            <Spacer />
            <Text fontSize="sm" color="gray.500">
              {userTasks.length} tareas encontradas
            </Text>
          </Flex>
        </CardHeader>
        
        <Divider />
        
        <CardBody>
          <Flex 
            direction={{ base: 'column', md: 'row' }} 
            gap={4} 
            align={{ base: 'stretch', md: 'center' }}
          >
            <InputGroup maxW={{ base: '100%', md: '60%' }}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Buscar por slug o texto"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
            
            <Select
              placeholder="Filtrar por idioma"
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              maxW={{ base: '100%', md: '40%' }}
            >
              <option value="">Todos los idiomas</option>
              {translatorLanguages.map(lang => (
                <option key={lang} value={lang}>
                  {getLanguageName(lang)}
                </option>
              ))}
            </Select>
          </Flex>
        </CardBody>
      </Card>
      
      {userTasks.length === 0 ? (
        <Box
          bg="gray.50"
          p={10}
          borderRadius="md"
          textAlign="center"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Text fontSize="lg" color="gray.500">
            No tienes tareas de traducción asignadas
            {filterLanguage && ` en ${getLanguageName(filterLanguage)}`}
            {searchQuery && ` que contengan "${searchQuery}"`}
          </Text>
        </Box>
      ) : (
        <Box
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          borderColor={borderColor}
        >
          <Table variant="simple" bg={tableBgColor}>
            <Thead bg="gray.50">
              <Tr>
                <Th>Slug</Th>
                <Th>Texto Original</Th>
                <Th>Idioma</Th>
                <Th>Estado</Th>
                <Th>Asignado</Th>
                <Th width="120px">Acciones</Th>
              </Tr>
            </Thead>
            
            <Tbody>
              {userTasks.map(task => (
                <Tr key={task.id}>
                  <Td fontFamily="mono" fontSize="sm">
                    {task.slug}
                  </Td>
                  <Td>
                    <Text noOfLines={2} maxW="300px">
                      {task.text}
                    </Text>
                  </Td>
                  <Td>
                    <Badge colorScheme="blue">
                      {getLanguageName(task.language)}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(task.status)}>
                      {getStatusName(task.status)}
                    </Badge>
                  </Td>
                  <Td fontSize="sm">
                    {task.assignedTo ? (
                      typeof task.assignedTo === 'string' 
                        ? task.assignedTo 
                        : (task.assignedTo as any).username || (task.assignedTo as any).email || 'Usuario'
                    ) : 'N/A'}
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        colorScheme={isReviewer ? "purple" : "blue"}
                        isDisabled={isTranslator && task.status === 'translated'}
                        onClick={() => handleTranslate(task)}
                      >
                        {isReviewer 
                          ? (task.status === 'reviewed' ? 'Revisado' : 'Revisar')
                          : (task.status === 'translated' ? 'Traducido' : 'Traducir')
                        }
                      </Button>
                      {task.history && task.history.length > 0 && (
                        <Tooltip label="Ver historial de cambios">
                          <Button
                            size="sm"
                            colorScheme="gray"
                            variant="outline"
                            onClick={() => handleViewHistory(task)}
                          >
                            Historial
                          </Button>
                        </Tooltip>
                      )}
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
      
      {/* Modal para editar/traducir/revisar */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isReviewer ? 'Revisar Traducción' : 'Traducir Copy'}
            {editingCopy && (
              <Text fontSize="sm" fontWeight="normal" mt={1} color="gray.500">
                {editingCopy.slug}
              </Text>
            )}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            {editingCopy && (
              <>
                <Box mb={4}>
                  <Text fontWeight="medium" mb={1}>
                    Texto original:
                  </Text>
                  <Box
                    p={3}
                    bg="gray.50"
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor={borderColor}
                  >
                    {editingCopy.text}
                  </Box>
                </Box>
                
                <Box mb={4}>
                  <Text fontWeight="medium" mb={1}>
                    Traducción a {getLanguageName(editingCopy.language)}:
                  </Text>
                  <Textarea
                    value={translationText}
                    onChange={(e) => setTranslationText(e.target.value)}
                    placeholder={`Escribe la traducción en ${getLanguageName(editingCopy.language)}`}
                    rows={5}
                  />
                </Box>
              </>
            )}
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              colorScheme={isReviewer ? "purple" : "blue"} 
              onClick={handleSaveTranslation}
              isDisabled={!translationText.trim()}
            >
              {isReviewer ? 'Aprobar Revisión' : 'Guardar Traducción'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}
