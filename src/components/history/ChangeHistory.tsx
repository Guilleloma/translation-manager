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
  // Logs detallados para debugging
  console.log('=================== HISTORIAL DEBUG =================');
  console.log('Rendering ChangeHistory with entries:', history?.length);
  
  if (history && history.length > 0) {
    console.log('Primera entrada del historial:', JSON.stringify(history[0], null, 2));
    console.log('Tipos de datos en la primera entrada:');
    const firstEntry = history[0];
    console.log('  previousText:', firstEntry.previousText, typeof firstEntry.previousText);
    console.log('  newText:', firstEntry.newText, typeof firstEntry.newText);
    console.log('  Valores falsy check:');
    console.log('  - previousText falsy?', !firstEntry.previousText);
    console.log('  - previousText empty string?', firstEntry.previousText === '');
    console.log('  - newText falsy?', !firstEntry.newText);
    console.log('  - newText empty string?', firstEntry.newText === '');
    
    // Revisar todas las entradas para detectar problemas
    const entriesWithMissingText = history.filter(entry => 
      (!entry.previousText && !entry.newText) || 
      (entry.previousText === '' && entry.newText === '')
    );
    
    if (entriesWithMissingText.length > 0) {
      console.warn('⚠️ Entradas con texto faltante:', entriesWithMissingText.length);
      console.warn('Primera entrada problemática:', entriesWithMissingText[0]);
    }
  }
  
  // Color de fondo para las entradas del historial - SIEMPRE llamar a hooks al principio del componente
  // y nunca dentro de condicionales para evitar el error "Rendered fewer hooks than expected"
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Renderizar un mensaje si no hay historial
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
        {sortedHistory.map((entry, index) => {
          let key = entry.id;
          if (!key || typeof key !== 'string' || key.trim() === '') {
            const timestamp = entry.createdAt ? new Date(entry.createdAt).getTime() : 'no-timestamp';
            key = `history-entry-${index}-${timestamp}`;
            console.warn(
              `ChangeHistory: Missing or invalid id for history entry at index ${index}. Using fallback key "${key}". Entry:`,
              entry
            );
          }

          const prevStatusConfig = entry.previousStatus ? statusConfig[entry.previousStatus] : null;
          const newStatusConfig = entry.newStatus ? statusConfig[entry.newStatus] : null;
          const createdAtDate = entry.createdAt ? new Date(entry.createdAt) : null;

          return (
            <AccordionItem 
              key={key} 
              border="1px solid"
              borderColor={borderColor}
              borderRadius="md"
              mb={2}
            >
              <h2>
                <AccordionButton py={2}>
                  <Box flex="1" textAlign="left">
                    <HStack spacing={2}>
                      <Text fontWeight="medium">{entry.userName || 'N/A'}</Text>
                      {prevStatusConfig && newStatusConfig && (
                        <HStack spacing={1}>
                          <Badge colorScheme={prevStatusConfig.color}>
                            {prevStatusConfig.label}
                          </Badge>
                          <Text fontSize="sm">→</Text>
                          <Badge colorScheme={newStatusConfig.color}>
                            {newStatusConfig.label}
                          </Badge>
                        </HStack>
                      )}
                      {createdAtDate && (
                        <Text fontSize="xs" color="gray.500">
                          {formatDistanceToNow(createdAtDate, { 
                            addSuffix: true,
                            locale: es 
                          })}
                        </Text>
                      )}
                    </HStack>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} bg={bgColor}>
                <VStack align="stretch" spacing={3}>
                  {/* Cambio de estado */}
                  {prevStatusConfig && newStatusConfig && (
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" mb={1}>Cambio de estado:</Text>
                      <HStack>
                        <Badge colorScheme={prevStatusConfig.color}>
                          {prevStatusConfig.label}
                        </Badge>
                        <Text>→</Text>
                        <Badge colorScheme={newStatusConfig.color}>
                          {newStatusConfig.label}
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
                        <Text fontStyle="italic">
                          {entry.previousText && entry.previousText !== "(Texto Sugerido)" 
                            ? entry.previousText 
                            : <Text as="i" color="gray.500">[Texto anterior no disponible]</Text>}
                        </Text>
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
                        <Text>
                          {entry.newText && entry.newText !== "(Texto Sugerido)" 
                            ? entry.newText 
                            : <Text as="i" color="gray.500">[Texto actualizado no disponible]</Text>}
                        </Text>
                      </Box>
                    </Box>
                  )}
                  
                  {/* Fecha y hora exacta */}
                  {createdAtDate && (
                    <Flex justify="flex-end">
                      <Tooltip label={format(createdAtDate, 'PPpp', { locale: es })}>
                        <Text fontSize="xs" color="gray.500">
                          {format(createdAtDate, 'dd/MM/yyyy HH:mm')}
                        </Text>
                      </Tooltip>
                    </Flex>
                  )}
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          );
        })}
      </Accordion>
    </Box>
  );
};

export default ChangeHistory;
