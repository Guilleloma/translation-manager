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
import { Copy } from '../../types/copy';

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
  
  // Simular carga de datos (en una app real, esto vendría de una API)
  useEffect(() => {
    // En este punto, cargaríamos los datos de la API
    // Por ahora, simulamos utilizando localStorage
    console.log(' Cargando copys desde localStorage...');
    const storedCopys = localStorage.getItem('copys');
    if (storedCopys) {
      try {
        const parsedCopys = JSON.parse(storedCopys);
        setCopys(parsedCopys);
        console.log(` Copys cargados desde localStorage: ${parsedCopys.length}`);
      } catch (error) {
        console.error(' Error al cargar copys:', error);
        setCopys([]);
      }
    }
  }, []);
  
  // Verificar si el usuario está autenticado y tiene un rol válido
  const isTranslator = currentUser?.role === 'translator';
  const isReviewer = currentUser?.role === 'reviewer';
  
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
  
  // Filtrar las tareas según el rol del usuario
  const userTasks = useMemo(() => {
    console.log(` Filtrando tareas para usuario: ${currentUser.username} (ID: ${currentUser.id}, Rol: ${currentUser.role})`);
    
    // Determinar qué tareas mostrar según el rol
    let filteredTasks: Copy[] = [];
    
    if (isTranslator) {
      // Para traductores: mostrar tareas asignadas a ellos
      console.log('Buscando tareas asignadas al traductor:');
      
      // En caso de que las asignaciones usen diferentes formatos de ID
      const possibleIds = [currentUser.id, `translator-${currentUser.id}`, currentUser.username];
      console.log('Posibles IDs del usuario actual:', possibleIds);
      
      filteredTasks = copys.filter(copy => 
        possibleIds.includes(copy.assignedTo) && 
        copy.status === 'assigned'
      );
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
        copy.text.toLowerCase().includes(query) || 
        copy.slug.toLowerCase().includes(query)
      );
      console.log(`Filtrado por búsqueda "${searchQuery}": ${result.length} tareas`);
    }
    
    // Devolver el resultado filtrado
    return result;
  }, [copys, currentUser, filterLanguage, filterStatus, searchQuery, isTranslator, isReviewer]);
  
  // Obtener los idiomas disponibles para el traductor
  const translatorLanguages = useMemo(() => {
    return currentUser?.languages || [];
  }, [currentUser]);
  
  // Función para nombrar los idiomas
  const getLanguageName = (code: string) => {
    const languages = {
      'es': 'Español',
      'en': 'Inglés',
      'fr': 'Francés',
      'de': 'Alemán',
      'it': 'Italiano',
      'pt': 'Portugués'
    };
    
    return languages[code as keyof typeof languages] || code;
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
  const handleSaveTranslation = () => {
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
    
    // Determinar el nuevo estado según el rol del usuario
    const newStatus = isReviewer ? 'reviewed' : 'translated';
    const actionName = isReviewer ? 'revisión' : 'traducción';
    
    console.log(` Guardando ${actionName} para: ${editingCopy.slug}`);
    console.log(` Texto original: "${editingCopy.text.substring(0, 50)}..."`);
    console.log(` ${isReviewer ? 'Texto revisado' : 'Traducción'}: "${translationText.substring(0, 50)}..."`);
    
    // Crear una entrada de historial
    const historyEntry = {
      id: `history-${Date.now()}`,
      copyId: editingCopy.id,
      userId: currentUser.id,
      userName: currentUser.username,
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
    
    // Actualizar el estado
    setCopys(updatedCopys);
    
    // En una app real, aquí haríamos una llamada a la API
    // Por ahora, guardamos en localStorage
    localStorage.setItem('copys', JSON.stringify(updatedCopys));
    console.log(` Traducción guardada en localStorage`);
    
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
                  <Td fontSize="sm">{formatDate(task.assignedAt)}</Td>
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
