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
} from '@chakra-ui/react';
import { SearchIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { useUser } from '../../context/UserContext';
import { Copy } from '../../types/copy';

/**
 * Página de tareas asignadas para traductores
 * Muestra las tareas pendientes, permite filtrar por idioma y actualizar el estado
 */
export default function TranslatorTasks() {
  const { currentUser } = useUser();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [copys, setCopys] = useState<Copy[]>([]);
  const [editingCopy, setEditingCopy] = useState<Copy | null>(null);
  const [translationText, setTranslationText] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Colores para la UI
  const tableBgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Simular carga de datos (en una app real, esto vendría de una API)
  useEffect(() => {
    // En este punto, cargaríamos los datos de la API
    // Por ahora, simulamos utilizando localStorage
    console.log('🔄 Cargando copys desde localStorage...');
    const storedCopys = localStorage.getItem('copys');
    if (storedCopys) {
      try {
        const parsedCopys = JSON.parse(storedCopys);
        setCopys(parsedCopys);
        console.log(`✅ Copys cargados desde localStorage: ${parsedCopys.length}`);
      } catch (error) {
        console.error('❌ Error al cargar copys:', error);
        setCopys([]);
      }
    }
  }, []);
  
  // Verificar si el usuario está autenticado y es traductor
  if (!currentUser || currentUser.role !== 'translator') {
    return (
      <Container maxW="container.xl" py={10}>
        <Box textAlign="center" py={10} px={6}>
          <Heading as="h2" size="xl">
            Acceso Restringido
          </Heading>
          <Text mt={4} mb={8}>
            Esta página es solo para traductores. Por favor, inicia sesión con una cuenta de traductor.
          </Text>
        </Box>
      </Container>
    );
  }
  
  // Filtrar las tareas asignadas al traductor actual
  const assignedTasks = useMemo(() => {
    console.log(`🔍 Filtrando tareas para traductor: ${currentUser.username} (ID: ${currentUser.id})`);
    console.log('Comprobando asignaciones:')
    
    // Esto es para debugging, listar todos los IDs de asignación
    const assignedIds = new Set();
    copys.forEach(copy => {
      if (copy.assignedTo) {
        assignedIds.add(copy.assignedTo);
      }
    });
    console.log('IDs en asignaciones:', Array.from(assignedIds));
    
    // En caso de que las asignaciones usen el nombre de usuario en lugar del id
    const possibleIds = [currentUser.id, `translator-${currentUser.id}`, currentUser.username];
    console.log('Posibles IDs del usuario actual:', possibleIds);
    
    let filtered = copys.filter(copy => {
      // Buscar en todas las posibles formas en que el usuario podría estar asignado
      return possibleIds.includes(copy.assignedTo);
    });
    
    console.log(`📋 Total de tareas asignadas: ${filtered.length}`);
    
    // Aplicar filtro de idioma si existe
    if (filterLanguage) {
      filtered = filtered.filter(copy => copy.language === filterLanguage);
      console.log(`🌎 Filtro de idioma aplicado (${filterLanguage}): ${filtered.length} tareas`);
    }
    
    // Aplicar filtro de búsqueda si existe
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(copy => 
        copy.slug.toLowerCase().includes(lowerQuery) || 
        copy.text.toLowerCase().includes(lowerQuery)
      );
      console.log(`🔎 Filtro de búsqueda aplicado: ${filtered.length} tareas`);
    }
    
    return filtered;
  }, [copys, currentUser, filterLanguage, searchQuery]);
  
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
      'pendiente': 'gray',
      'assigned': 'yellow',
      'traducido': 'green',
      'revisado': 'blue',
      'aprobado': 'purple'
    };
    
    return statusColors[status as keyof typeof statusColors] || 'gray';
  };
  
  // Función para obtener el nombre del estado
  const getStatusName = (status: string) => {
    const statusNames = {
      'pendiente': 'Pendiente',
      'assigned': 'Asignado',
      'traducido': 'Traducido',
      'revisado': 'Revisado',
      'aprobado': 'Aprobado'
    };
    
    return statusNames[status as keyof typeof statusNames] || status;
  };
  
  // Función para iniciar la traducción de un copy
  const handleTranslate = (copy: Copy) => {
    console.log(`📝 Iniciando traducción para copy: ${copy.slug}`);
    setEditingCopy(copy);
    setTranslationText(copy.text);
    onOpen();
  };
  
  // Función para guardar la traducción
  const handleSaveTranslation = () => {
    if (!editingCopy || !translationText.trim()) {
      toast({
        title: 'Error',
        description: 'Debes proporcionar una traducción válida',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    console.log(`💾 Guardando traducción para: ${editingCopy.slug}`);
    console.log(`📊 Texto original: "${editingCopy.text.substring(0, 50)}..."`);
    console.log(`📊 Traducción: "${translationText.substring(0, 50)}..."`);
    
    // Actualizar el copy en el estado local
    const updatedCopys = copys.map(copy => {
      if (copy.id === editingCopy.id) {
        return {
          ...copy,
          text: translationText,
          status: 'traducido',
          completedAt: new Date()
        };
      }
      return copy;
    });
    
    // Actualizar el estado
    setCopys(updatedCopys);
    
    // En una app real, aquí haríamos una llamada a la API
    // Por ahora, guardamos en localStorage
    localStorage.setItem('copys', JSON.stringify(updatedCopys));
    console.log(`✅ Traducción guardada en localStorage`);
    
    // Mostrar notificación de éxito
    toast({
      title: 'Traducción guardada',
      description: `La traducción para "${editingCopy.slug}" ha sido completada`,
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
    <Container maxW="container.xl" py={6}>
      <Heading as="h1" mb={6}>Mis Tareas de Traducción</Heading>
      
      <Card mb={6} variant="outline" borderColor={borderColor}>
        <CardHeader pb={2}>
          <Flex align="center">
            <Heading size="md">Filtros</Heading>
            <Spacer />
            <Text fontSize="sm" color="gray.500">
              {assignedTasks.length} tareas encontradas
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
      
      {assignedTasks.length === 0 ? (
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
              {assignedTasks.map(task => (
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
                        colorScheme="blue"
                        isDisabled={task.status === 'traducido'}
                        onClick={() => handleTranslate(task)}
                      >
                        {task.status === 'traducido' ? 'Traducido' : 'Traducir'}
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
      
      {/* Modal para editar/traducir */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Traducir Copy
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
              colorScheme="blue" 
              onClick={handleSaveTranslation}
              isDisabled={!translationText.trim()}
            >
              Guardar Traducción
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}
