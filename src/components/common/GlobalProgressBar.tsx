import React, { useEffect } from 'react';
import {
  Box,
  Progress,
  Text,
  HStack,
  Collapse,
  useColorModeValue,
  Badge
} from '@chakra-ui/react';
import { useImportProgress } from '../../context/ImportProgressContext';

/**
 * Componente que muestra una barra de progreso global en la parte superior de la aplicación
 * para indicar el progreso de importaciones y otros procesos largos
 */
export const GlobalProgressBar: React.FC = () => {
  const { progress } = useImportProgress();
  const { isImporting, current, total, status, message } = progress;
  
  // Colores según el tema
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Calcular el porcentaje de progreso
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  
  // Determinar el color según el estado
  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'green';
      case 'error': return 'red';
      default: return 'blue';
    }
  };
  
  // Efecto para logging (debugging)
  useEffect(() => {
    if (isImporting) {
      console.log(`Progreso global: ${current}/${total} (${percentage}%)`);
    }
  }, [current, total, isImporting, percentage]);

  return (
    <Collapse in={isImporting} animateOpacity>
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        zIndex={1000}
        bg={bgColor}
        borderBottom="1px"
        borderColor={borderColor}
        boxShadow="md"
        py={2}
        px={4}
      >
        <HStack justify="space-between" mb={1}>
          <Text fontSize="sm" fontWeight="medium">
            {message}
          </Text>
          <HStack spacing={2}>
            <Badge colorScheme={getStatusColor()} fontSize="sm">
              {percentage}%
            </Badge>
            <Text fontSize="xs" color="gray.600">
              {current.toLocaleString()} / {total.toLocaleString()}
            </Text>
          </HStack>
        </HStack>
        
        <Progress
          value={percentage}
          size="xs"
          colorScheme={getStatusColor()}
          hasStripe={status === 'processing'}
          isAnimated={status === 'processing'}
          borderRadius="full"
        />
      </Box>
    </Collapse>
  );
};
