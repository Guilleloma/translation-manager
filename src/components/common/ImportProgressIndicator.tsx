import React from 'react';
import {
  Box,
  Progress,
  Text,
  HStack,
  VStack,
  Badge,
  Flex,
  Icon,
  Collapse,
  useDisclosure,
  IconButton,
  Divider
} from '@chakra-ui/react';
import { ChevronUpIcon, ChevronDownIcon, DownloadIcon } from '@chakra-ui/icons';

export interface ImportProgress {
  isActive: boolean;
  current: number;
  total: number;
  phase: 'validating' | 'importing' | 'completed' | 'error';
  message?: string;
  details?: {
    processed: number;
    errors: number;
    warnings: number;
  };
}

interface ImportProgressIndicatorProps {
  progress: ImportProgress;
  onDismiss?: () => void;
}

/**
 * Componente de indicador de progreso fijo para importaciones masivas
 * 
 * Muestra el progreso de manera persistente y sutil en la parte superior de la página
 * durante las operaciones de importación masiva, siguiendo las mejores prácticas de UI.
 */
export const ImportProgressIndicator: React.FC<ImportProgressIndicatorProps> = ({
  progress,
  onDismiss
}) => {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });

  if (!progress.isActive) {
    return null;
  }

  const getPhaseColor = () => {
    switch (progress.phase) {
      case 'validating':
        return 'blue';
      case 'importing':
        return 'orange';
      case 'completed':
        return 'green';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getPhaseText = () => {
    switch (progress.phase) {
      case 'validating':
        return 'Validando datos';
      case 'importing':
        return 'Importando';
      case 'completed':
        return 'Completado';
      case 'error':
        return 'Error';
      default:
        return 'Procesando';
    }
  };

  const progressPercentage = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      shadow="sm"
      zIndex={1000}
      transition="all 0.3s ease"
    >
      <Box maxW="container.xl" mx="auto" px={4}>
        <Flex align="center" justify="space-between" py={2}>
          <HStack spacing={3} flex={1}>
            <Icon as={DownloadIcon} color={`${getPhaseColor()}.500`} />
            <VStack align="start" spacing={0} flex={1}>
              <HStack spacing={2}>
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  Importación masiva
                </Text>
                <Badge colorScheme={getPhaseColor()} size="sm">
                  {getPhaseText()}
                </Badge>
              </HStack>
              
              <Collapse in={isOpen} animateOpacity>
                <VStack align="start" spacing={1} mt={1}>
                  <HStack spacing={4} w="full">
                    <Box flex={1} maxW="300px">
                      <Progress
                        value={progressPercentage}
                        size="sm"
                        colorScheme={getPhaseColor()}
                        bg="gray.100"
                        borderRadius="full"
                      />
                    </Box>
                    <Text fontSize="xs" color="gray.600" minW="fit-content">
                      {progress.current} / {progress.total}
                    </Text>
                  </HStack>
                  
                  {progress.message && (
                    <Text fontSize="xs" color="gray.600">
                      {progress.message}
                    </Text>
                  )}
                  
                  {progress.details && (
                    <HStack spacing={3} fontSize="xs">
                      <Text color="green.600">
                        Procesados: {progress.details.processed}
                      </Text>
                      {progress.details.warnings > 0 && (
                        <Text color="orange.600">
                          Advertencias: {progress.details.warnings}
                        </Text>
                      )}
                      {progress.details.errors > 0 && (
                        <Text color="red.600">
                          Errores: {progress.details.errors}
                        </Text>
                      )}
                    </HStack>
                  )}
                </VStack>
              </Collapse>
            </VStack>
          </HStack>
          
          <HStack spacing={1}>
            <IconButton
              aria-label={isOpen ? "Contraer detalles" : "Expandir detalles"}
              icon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
              size="sm"
              variant="ghost"
              onClick={onToggle}
            />
            
            {progress.phase === 'completed' && onDismiss && (
              <>
                <Divider orientation="vertical" h="20px" />
                <IconButton
                  aria-label="Cerrar indicador"
                  icon={<Text fontSize="lg">×</Text>}
                  size="sm"
                  variant="ghost"
                  onClick={onDismiss}
                />
              </>
            )}
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
};
