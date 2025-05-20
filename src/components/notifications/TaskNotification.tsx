'use client';

import React, { useMemo } from 'react';
import {
  Box,
  Text,
  Badge,
  Flex,
  Icon,
  Tooltip,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Divider,
  HStack,
} from '@chakra-ui/react';
import { BellIcon, CheckIcon, TimeIcon } from '@chakra-ui/icons';
import { useUser, type User } from '../../context/UserContext';
import { Copy } from '../../types/copy';

interface TaskNotificationProps {
  copys: Copy[];
  onViewAssignedTasks: () => void;
}

/**
 * Componente que muestra notificaciones de tareas pendientes asignadas al usuario
 * Muestra un icono de campana con un contador de tareas y un menú desplegable
 * con información detallada sobre las tareas pendientes
 */
export default function TaskNotification({ copys, onViewAssignedTasks }: TaskNotificationProps) {
  // Estos hooks siempre deben ejecutarse, sin importar si el usuario es null, está autenticado o no
  const { currentUser } = useUser();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Calcular posibles IDs del usuario para comparar con asignaciones
  const possibleUserIds = useMemo(() => {
    if (!currentUser) return [];
    return [currentUser.id, `translator-${currentUser.id.replace(/^translator-/, '')}`, currentUser.username];
  }, [currentUser]);
  
  // Obtener las tareas asignadas al usuario actual - seguro ante valores null
  const assignedTasks = useMemo(() => {
    if (!possibleUserIds.length) return [];
    
    return copys.filter(copy => {
      // Si no hay asignación o estado, no incluir
      if (!copy.assignedTo || !copy.status) return false;
      
      // Verificar si el copy está asignado a alguna de las posibles IDs del usuario
      const isAssignedToUser = possibleUserIds.includes(copy.assignedTo);
      
      // Verificar si el copy no está ya completado
      const isPending = copy.status !== 'traducido' && 
                       copy.status !== 'revisado' && 
                       copy.status !== 'aprobado';
      
      return isAssignedToUser && isPending;
    });
  }, [copys, possibleUserIds]);
  
  // Determinar si debemos mostrar el componente - seguro ante valores null
  const shouldRender = useMemo(() => {
    return !!currentUser && 
           currentUser.role === 'translator' && 
           assignedTasks.length > 0;
  }, [currentUser, assignedTasks.length]);

  // Agrupar tareas por idioma para mostrar resumen
  const tasksByLanguage = assignedTasks.reduce((acc, task) => {
    acc[task.language] = (acc[task.language] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Obtener el total de tareas
  const totalTasks = assignedTasks.length;
  
  // Función para formatear la fecha de asignación
  const formatAssignmentDate = (date?: Date) => {
    if (!date) return 'Fecha desconocida';
    
    const formattedDate = new Date(date).toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return formattedDate;
  };

  // Obtener el nombre del idioma a partir del código
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

  // Si no debemos renderizar, devolver null para evitar errores
  if (!shouldRender) {
    return null;
  }

  return (
    <Menu closeOnSelect={false}>
      <MenuButton
        as={Button}
        variant="ghost"
        color={totalTasks > 0 ? "orange.500" : "gray.500"}
        position="relative"
        _hover={{ bg: 'gray.100' }}
      >
        <Icon as={BellIcon} boxSize={5} />
        {totalTasks > 0 && (
          <Badge 
            colorScheme="red" 
            position="absolute" 
            top="-5px" 
            right="-5px"
            fontSize="xs"
            borderRadius="full"
            minW="18px"
          >
            {totalTasks}
          </Badge>
        )}
      </MenuButton>
      
      <MenuList 
        p={0} 
        minW="300px" 
        maxH="400px" 
        overflowY="auto"
        boxShadow="md"
        border="1px solid"
        borderColor={borderColor}
      >
        <Box p={3} bg="blue.50">
          <Flex alignItems="center">
            <Text fontWeight="medium">Tareas pendientes</Text>
            <Badge ml={2} colorScheme="orange">{totalTasks}</Badge>
          </Flex>
        </Box>
        
        <Divider />
        
        <Box p={2}>
          <Text fontSize="sm" fontWeight="medium" mb={2}>
            Resumen por idioma:
          </Text>
          
          <Flex flexWrap="wrap" gap={2} mb={3}>
            {Object.entries(tasksByLanguage).map(([language, count]) => (
              <Badge 
                key={language} 
                colorScheme="blue" 
                variant="subtle"
                borderRadius="full"
                px={2}
                py={1}
              >
                {getLanguageName(language)}: {count}
              </Badge>
            ))}
          </Flex>
        </Box>
        
        <Divider />
        
        <Box maxH="200px" overflowY="auto">
          {assignedTasks.slice(0, 5).map(task => (
            <MenuItem key={task.id} _hover={{ bg: 'gray.50' }} px={3} py={2}>
              <Box width="100%">
                <Flex alignItems="center" mb={1}>
                  <Text fontWeight="medium" fontSize="sm" noOfLines={1} flex={1}>
                    {task.slug}
                  </Text>
                  <Badge size="sm" colorScheme="orange" ml={2}>
                    {getLanguageName(task.language)}
                  </Badge>
                </Flex>
                
                <Text fontSize="xs" noOfLines={1} color="gray.600" mb={1}>
                  {task.text.substring(0, 50)}{task.text.length > 50 ? '...' : ''}
                </Text>
                
                <HStack spacing={1} fontSize="xs" color="gray.500">
                  <Icon as={TimeIcon} boxSize={3} />
                  <Text>Asignado: {formatAssignmentDate(task.assignedAt)}</Text>
                </HStack>
              </Box>
            </MenuItem>
          ))}
        </Box>
        
        {assignedTasks.length > 5 && (
          <Box px={3} py={1} bg="gray.50">
            <Text fontSize="xs" color="gray.500" textAlign="center">
              Y {assignedTasks.length - 5} tareas más...
            </Text>
          </Box>
        )}
        
        <Divider />
        
        <Box p={2}>
          <Button 
            size="sm" 
            width="100%" 
            leftIcon={<CheckIcon />}
            colorScheme="blue"
            variant="outline"
            onClick={onViewAssignedTasks}
          >
            Ver todas mis tareas
          </Button>
        </Box>
      </MenuList>
    </Menu>
  );
}
