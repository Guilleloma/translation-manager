'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Box,
  Heading,
  Text,
  Select,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Badge,
  useToast,
  Flex,
  Spacer,
  HStack,
  Tag,
  TagLabel,
  useColorModeValue,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import { useUser, type User } from '../../context/UserContext';
import { Copy } from '../../types/copy';

// Array de idiomas soportados
const SUPPORTED_LANGUAGES = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
];

interface CopyAssignmentProps {
  copys: Copy[];
  updateCopy: (copyId: string, updates: Partial<Copy>) => void;
}

/**
 * Componente para asignar copys a traductores según idioma
 * Permite asignación individual o masiva de copys pendientes
 */
export default function CopyAssignment({ copys, updateCopy }: CopyAssignmentProps) {
  const { users } = useUser();
  const toast = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedTranslator, setSelectedTranslator] = useState('');
  const [selectedCopys, setSelectedCopys] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [progress, setProgress] = useState(0);
  const toastIdRef = useRef<string | number>();

  // Color de fondo para la tabla
  const tableBgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Filtrar traductores que pueden trabajar con el idioma seleccionado
  const eligibleTranslators = useMemo(() => {
    if (!selectedLanguage) return [];
    
    return users.filter((user: User) => 
      user.role === 'translator' && 
      user.languages?.includes(selectedLanguage)
    );
  }, [users, selectedLanguage]);

  // Filtrar copys por idioma seleccionado y no asignados
  const pendingCopys = useMemo(() => {
    if (!selectedLanguage || !Array.isArray(copys)) return [];
    
    // Mejoramos el filtrado para que considere correctamente el estado y el idioma
    console.log(`Filtrando copys pendientes para idioma: ${selectedLanguage}`);
    const filtered = copys.filter(copy => 
      copy.language === selectedLanguage && 
      copy.status === 'not_assigned' // Usamos el status como criterio principal
    );
    
    console.log(`Encontrados ${filtered.length} copys pendientes para el idioma ${selectedLanguage}:`, 
      filtered.map(c => ({ id: c.id, slug: c.slug, status: c.status }))
    );
    
    return filtered;
  }, [copys, selectedLanguage]);

  // Limpiar selección cuando cambia el idioma
  useEffect(() => {
    setSelectedCopys([]);
    setSelectAll(false);
    setSelectedTranslator('');
  }, [selectedLanguage]);

  // Manejar selección/deselección de todos los copys
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCopys([]);
    } else {
      setSelectedCopys(pendingCopys.map(copy => copy.id));
    }
    setSelectAll(!selectAll);
  };

  // Manejar selección/deselección individual de copys
  const handleSelectCopy = (copyId: string) => {
    if (selectedCopys.includes(copyId)) {
      setSelectedCopys(selectedCopys.filter(id => id !== copyId));
      setSelectAll(false);
    } else {
      setSelectedCopys([...selectedCopys, copyId]);
      
      // Si todos están seleccionados, actualizar selectAll
      if (selectedCopys.length + 1 === pendingCopys.length) {
        setSelectAll(true);
      }
    }
  };

  /**
 * Asignar copys seleccionados al traductor
 * Implementa un sistema de feedback visual durante el proceso de asignación
 * y maneja mejor las notificaciones para evitar saturar la interfaz
 */
const handleAssign = async () => {
  if (!selectedTranslator || selectedCopys.length === 0) {
    toast({
      title: 'Error',
      description: 'Selecciona un traductor y al menos un copy para asignar',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  // Obtener el usuario seleccionado
  const translator = users.find(user => user.id === selectedTranslator);
  const totalCopys = selectedCopys.length;
  
  // Activar estado de carga
  setIsAssigning(true);
  setProgress(0);
  
  // Crear toast de progreso
  toastIdRef.current = toast({
    title: 'Asignando copys',
    description: `0/${totalCopys} copys asignados a ${translator?.username}`,
    status: 'info',
    duration: null,
    isClosable: false,
    position: 'bottom-right',
  });
  
  // Asignar cada copy seleccionado con un pequeño retraso para permitir actualizaciones de UI
  try {
    for (let i = 0; i < selectedCopys.length; i++) {
      const copyId = selectedCopys[i];
      
      // Actualizar el copy
      updateCopy(copyId, {
        assignedTo: selectedTranslator,
        assignedAt: new Date(),
        status: 'assigned'
      });
      
      // Actualizar progreso
      const currentProgress = Math.round(((i + 1) / totalCopys) * 100);
      setProgress(currentProgress);
      
      // Actualizar toast cada 10% o cada 50 copys para no saturar la UI
      if (i % Math.max(Math.floor(totalCopys / 10), 1) === 0 || i === selectedCopys.length - 1) {
        if (toastIdRef.current) {
          toast.update(toastIdRef.current, {
            description: `${i + 1}/${totalCopys} copys asignados a ${translator?.username} (${currentProgress}%)`,
            progress: currentProgress / 100,
          });
        }
      }
      
      // Si hay muchos copys, añadir un pequeño retraso cada cierto número para permitir actualizaciones de UI
      if (totalCopys > 100 && i % 50 === 0 && i > 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    // Cerrar el toast de progreso
    if (toastIdRef.current) {
      toast.close(toastIdRef.current);
    }
    
    // Mostrar mensaje de éxito
    toast({
      title: 'Copys asignados',
      description: `${totalCopys} copys asignados a ${translator?.username}`,
      status: 'success',
      duration: 5000,
      isClosable: true,
      position: 'bottom-right',
    });
    
    // Resetear selecciones
    setSelectedCopys([]);
    setSelectAll(false);
  } catch (error) {
    console.error('Error al asignar copys:', error);
    
    // Cerrar el toast de progreso en caso de error
    if (toastIdRef.current) {
      toast.close(toastIdRef.current);
    }
    
    // Mostrar mensaje de error
    toast({
      title: 'Error al asignar copys',
      description: 'Ha ocurrido un error durante la asignación. Por favor, inténtalo de nuevo.',
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  } finally {
    // Desactivar estado de carga
    setIsAssigning(false);
    setProgress(0);
  }
  };

  // Obtener nombre del idioma a partir del código
  const getLanguageName = (code: string) => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code)?.name || code;
  };

  return (
    <Box>
      <Heading size="md" mb={4}>Asignación de Copys a Traductores</Heading>
      
      <Box mb={8} p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
        <Text mb={4}>
          Asigna copys pendientes de traducción a los traductores disponibles. 
          Los traductores solo verán los copys que tengan asignados en los idiomas en los que pueden trabajar.
        </Text>
        
        <VStack spacing={4} align="stretch">
          <HStack spacing={4} align="end">
            <Box flex="1">
              <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.600">
                Idioma
              </Text>
              <Select
                placeholder="Seleccionar idioma"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.code.toUpperCase()})
                  </option>
                ))}
              </Select>
            </Box>
            
            <Box flex="1">
              <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.600">
                Traductor
              </Text>
              <Tooltip 
                label={eligibleTranslators.length === 0 ? "No hay traductores disponibles para este idioma" : ""}
              >
                <Select
                  placeholder="Seleccionar traductor"
                  value={selectedTranslator}
                  onChange={(e) => setSelectedTranslator(e.target.value)}
                  isDisabled={!selectedLanguage || eligibleTranslators.length === 0}
                >
                  {eligibleTranslators.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.email})
                    </option>
                  ))}
                </Select>
              </Tooltip>
            </Box>
            
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2} color="transparent">
                Acción
              </Text>
              <Button
                colorScheme="blue"
                onClick={handleAssign}
                isDisabled={!selectedTranslator || selectedCopys.length === 0 || isAssigning}
                size="md"
                minW="140px"
                isLoading={isAssigning}
                loadingText={`Asignando... ${progress}%`}
              >
                Asignar {selectedCopys.length} copy{selectedCopys.length !== 1 ? 's' : ''}
              </Button>
            </Box>
          </HStack>
        </VStack>
      </Box>

      {selectedLanguage && (
        <Box boxShadow="sm" borderRadius="md" overflow="hidden" borderWidth="1px" borderColor={borderColor}>
          <Table variant="simple" size="sm" bg={tableBgColor}>
            <Thead bg="gray.50">
              <Tr>
                <Th width="40px">
                  <Checkbox 
                    isChecked={selectAll} 
                    onChange={handleSelectAll}
                    isDisabled={pendingCopys.length === 0}
                    onClick={(e) => {
                      // Detener la propagación para evitar que el evento llegue a la fila
                      e.stopPropagation();
                    }}
                  />
                </Th>
                <Th>Slug</Th>
                <Th>Texto</Th>
                <Th width="100px">Estado</Th>
              </Tr>
            </Thead>
            <Tbody>
              {pendingCopys.length === 0 ? (
                <Tr>
                  <Td colSpan={4} textAlign="center" py={4}>
                    <Text color="gray.500">
                      No hay copys pendientes para asignar en {getLanguageName(selectedLanguage)}
                    </Text>
                  </Td>
                </Tr>
              ) : (
                pendingCopys.map(copy => (
                  <Tr key={copy.id}>
                    <Td>
                      <Checkbox 
                        isChecked={selectedCopys.includes(copy.id)} 
                        onChange={() => {
                          console.log('Checkbox clicked for copy:', copy.id);
                          handleSelectCopy(copy.id);
                        }}
                        onClick={(e) => {
                          // Detener la propagación para evitar que el evento llegue a la fila
                          e.stopPropagation();
                        }}
                      />
                    </Td>
                    <Td fontFamily="mono" fontSize="sm">{copy.slug}</Td>
                    <Td>
                      <Text noOfLines={1} maxW="400px">{copy.text}</Text>
                    </Td>
                    <Td>
                      <Badge colorScheme="yellow">Pendiente</Badge>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>

          {pendingCopys.length > 0 && (
            <Flex p={3} borderTopWidth="1px" borderColor={borderColor} bg="gray.50">
              <Text fontSize="sm">
                {pendingCopys.length} copys pendientes • {selectedCopys.length} seleccionados
              </Text>
              <Spacer />
              {eligibleTranslators.length > 0 ? (
                <HStack>
                  {eligibleTranslators.map(user => (
                    <Tag 
                      key={user.id} 
                      size="sm" 
                      variant="subtle" 
                      colorScheme="blue"
                      borderRadius="full"
                      cursor="pointer"
                      onClick={() => setSelectedTranslator(user.id)}
                    >
                      <TagLabel>{user.username}</TagLabel>
                    </Tag>
                  ))}
                </HStack>
              ) : (
                <Text fontSize="sm" color="orange.500">
                  No hay traductores asignados para {getLanguageName(selectedLanguage)}
                </Text>
              )}
            </Flex>
          )}
        </Box>
      )}
    </Box>
  );
}
