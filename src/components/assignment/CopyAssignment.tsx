'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
    if (!selectedLanguage) return [];
    
    return copys.filter(copy => 
      copy.language === selectedLanguage && 
      !copy.assignedTo
    );
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

  // Asignar copys seleccionados al traductor
  const handleAssign = () => {
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
    
    // Asignar cada copy seleccionado
    for (const copyId of selectedCopys) {
      updateCopy(copyId, {
        assignedTo: selectedTranslator,
        assignedAt: new Date(),
        status: 'assigned'
      });
    }

    // Mostrar mensaje de éxito
    toast({
      title: 'Copys asignados',
      description: `${selectedCopys.length} copys asignados a ${translator?.username}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });

    // Resetear selecciones
    setSelectedCopys([]);
    setSelectAll(false);
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
        
        <HStack spacing={4} mb={4}>
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
          
          <Spacer />
          
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
          
          <Button
            colorScheme="blue"
            onClick={handleAssign}
            isDisabled={!selectedTranslator || selectedCopys.length === 0}
          >
            Asignar {selectedCopys.length} copys
          </Button>
        </HStack>
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
                        onChange={() => handleSelectCopy(copy.id)}
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
