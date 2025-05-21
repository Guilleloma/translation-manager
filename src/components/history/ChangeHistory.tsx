'use client';

import React from 'react';
import {
  Box,
  VStack,
  Text,
  Divider,
  Badge,
  HStack,
  Heading,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Flex,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CopyHistory, CopyStatus } from '../../types/copy';

// Configuración de colores y etiquetas para cada estado
const statusConfig: Record<CopyStatus, { color: string; label: string }> = {
  'not_assigned': { color: 'gray', label: 'Sin asignar' },
  'assigned': { color: 'yellow', label: 'Asignado' },
  'translated': { color: 'blue', label: 'Traducido' },
  'reviewed': { color: 'purple', label: 'Revisado' },
  'approved': { color: 'green', label: 'Aprobado' },
  'rejected': { color: 'red', label: 'Rechazado' }
};

interface ChangeHistoryProps {
  history: CopyHistory[];
}

/**
 * Componente para mostrar el historial de cambios de una traducción
 * 
 * @param history - Lista de entradas del historial
 */
export const ChangeHistory: React.FC<ChangeHistoryProps> = ({ history }) => {
  // Log para debugging
  console.log('Rendering ChangeHistory with entries:', history?.length);
  
  // Color de fondo para las entradas del historial
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  if (!history || history.length === 0) {
    return (
      <Box p={4} borderRadius="md" bg={bgColor}>
        <Text color="gray.500" fontSize="sm">No hay historial de cambios para esta traducción</Text>
      </Box>
    );
  }

  // Ordenar el historial por fecha (más reciente primero)
  const sortedHistory = [...history].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <Box>
      <Heading size="sm" mb={3}>Historial de cambios</Heading>
      <Accordion allowToggle>
        {sortedHistory.map((entry) => (
          <AccordionItem 
            key={entry.id} 
            border="1px solid"
            borderColor={borderColor}
            borderRadius="md"
            mb={2}
          >
            <h2>
              <AccordionButton py={2}>
                <Box flex="1" textAlign="left">
                  <HStack spacing={2}>
                    <Text fontWeight="medium">{entry.userName}</Text>
                    {entry.previousStatus && entry.newStatus && (
                      <HStack spacing={1}>
                        <Badge colorScheme={statusConfig[entry.previousStatus].color}>
                          {statusConfig[entry.previousStatus].label}
                        </Badge>
                        <Text fontSize="sm">→</Text>
                        <Badge colorScheme={statusConfig[entry.newStatus].color}>
                          {statusConfig[entry.newStatus].label}
                        </Badge>
                      </HStack>
                    )}
                    <Text fontSize="xs" color="gray.500">
                      {formatDistanceToNow(new Date(entry.createdAt), { 
                        addSuffix: true,
                        locale: es 
                      })}
                    </Text>
                  </HStack>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} bg={bgColor}>
              <VStack align="stretch" spacing={3}>
                {/* Cambio de estado */}
                {entry.previousStatus && entry.newStatus && (
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" mb={1}>Cambio de estado:</Text>
                    <HStack>
                      <Badge colorScheme={statusConfig[entry.previousStatus].color}>
                        {statusConfig[entry.previousStatus].label}
                      </Badge>
                      <Text>→</Text>
                      <Badge colorScheme={statusConfig[entry.newStatus].color}>
                        {statusConfig[entry.newStatus].label}
                      </Badge>
                    </HStack>
                  </Box>
                )}
                
                {/* Cambio de texto */}
                {entry.previousText && entry.newText && (
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" mb={1}>Cambio de texto:</Text>
                    <Box 
                      p={2} 
                      bg="red.50" 
                      borderRadius="md" 
                      fontSize="sm"
                      borderLeft="3px solid"
                      borderColor="red.300"
                    >
                      <Text fontStyle="italic">{entry.previousText}</Text>
                    </Box>
                    <Text textAlign="center" fontSize="sm" my={1}>↓</Text>
                    <Box 
                      p={2} 
                      bg="green.50" 
                      borderRadius="md" 
                      fontSize="sm"
                      borderLeft="3px solid"
                      borderColor="green.300"
                    >
                      <Text>{entry.newText}</Text>
                    </Box>
                  </Box>
                )}
                
                {/* Fecha y hora exacta */}
                <Flex justify="flex-end">
                  <Tooltip label={format(new Date(entry.createdAt), 'PPpp', { locale: es })}>
                    <Text fontSize="xs" color="gray.500">
                      {format(new Date(entry.createdAt), 'dd/MM/yyyy HH:mm')}
                    </Text>
                  </Tooltip>
                </Flex>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  );
};

export default ChangeHistory;
