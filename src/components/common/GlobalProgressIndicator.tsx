import React from 'react';
import {
  Box,
  Progress,
  Text,
  HStack,
  VStack,
  Badge,
  Collapse,
  useColorModeValue
} from '@chakra-ui/react';

interface GlobalProgressIndicatorProps {
  isVisible: boolean;
  title: string;
  description?: string;
  current: number;
  total: number;
  status?: 'info' | 'success' | 'warning' | 'error';
}

export const GlobalProgressIndicator: React.FC<GlobalProgressIndicatorProps> = ({
  isVisible,
  title,
  description,
  current,
  total,
  status = 'info'
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const shadowColor = useColorModeValue('md', 'dark-lg');
  
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  
  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'green';
      case 'warning': return 'yellow';
      case 'error': return 'red';
      default: return 'blue';
    }
  };

  return (
    <Collapse in={isVisible} animateOpacity>
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        zIndex={1000}
        bg={bgColor}
        borderBottom="1px"
        borderColor={borderColor}
        shadow={shadowColor}
        p={4}
      >
        <VStack spacing={2} align="stretch">
          <HStack justify="space-between" align="center">
            <HStack spacing={3}>
              <Text fontWeight="semibold" fontSize="sm">
                {title}
              </Text>
              {description && (
                <Text fontSize="xs" color="gray.600">
                  {description}
                </Text>
              )}
            </HStack>
            
            <HStack spacing={2}>
              <Badge colorScheme={getStatusColor()} variant="subtle">
                {percentage}%
              </Badge>
              <Text fontSize="xs" color="gray.500">
                {current.toLocaleString()} / {total.toLocaleString()}
              </Text>
            </HStack>
          </HStack>
          
          <Progress
            value={percentage}
            colorScheme={getStatusColor()}
            size="sm"
            borderRadius="md"
            bg="gray.100"
          />
        </VStack>
      </Box>
    </Collapse>
  );
};
