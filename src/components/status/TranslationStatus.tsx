'use client';

import React from 'react';
import { 
  Badge, 
  Box, 
  HStack, 
  Menu, 
  MenuButton, 
  MenuItem, 
  MenuList, 
  Button, 
  useToast,
  Text,
  Tooltip
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { Copy, CopyStatus, CopyHistory } from '../../types/copy';
import { useUser } from '../../context/UserContext';
// Import UserRole from user.ts where it's defined with UPPERCASE values
import { UserRole } from '../../types/user';

// Configuración de colores y etiquetas para cada estado
// Exportamos esta configuración para que pueda ser usada en otros componentes
export const statusConfig: Record<CopyStatus, { color: string; label: string; bgColor: string; textColor: string }> = {
  'not_assigned': { 
    color: 'gray', 
    label: 'Sin asignar',
    bgColor: 'gray.100',
    textColor: 'gray.600'
  },
  'assigned': { 
    color: 'orange', 
    label: 'Asignado',
    bgColor: 'orange.100',
    textColor: 'orange.700'
  },
  'translated': { 
    color: 'blue', 
    label: 'Traducido',
    bgColor: 'blue.100',
    textColor: 'blue.700'
  },
  'reviewed': { 
    color: 'teal', 
    label: 'Revisado',
    bgColor: 'teal.100',
    textColor: 'teal.700'
  },
  'approved': { 
    color: 'green', 
    label: 'Aprobado',
    bgColor: 'green.100',
    textColor: 'green.700'
  },
  'rejected': { 
    color: 'red', 
    label: 'Rechazado',
    bgColor: 'red.100',
    textColor: 'red.700'
  }
};

interface TranslationStatusProps {
  copy: Copy;
  onStatusChange: (copyId: string, newStatus: CopyStatus, historyEntry?: CopyHistory) => void;
}

/**
 * Componente que muestra y permite cambiar el estado de una traducción
 * según el rol del usuario actual
 * 
 * @param copy Objeto con la información de la traducción
 * @param onStatusChange Callback que se ejecuta cuando cambia el estado
 */
export const TranslationStatus: React.FC<TranslationStatusProps> = ({ copy, onStatusChange }) => {
  // IMPORTANTE: Todos los hooks deben estar al inicio del componente
  const { currentUser } = useUser();
  const toast = useToast();
  
  // Calcular los estados permitidos (mover la lógica aquí para evitar errores de hooks)
  const allowedTransitions = React.useMemo<CopyStatus[]>(() => {
    // Si no hay copia, no se permite ninguna transición
    if (!copy) return [];
    
    // Si no hay usuario autenticado, usar un modo de solo lectura
    if (!currentUser) {
      console.log('TranslationStatus: No hay usuario autenticado, modo de solo lectura');
      return [];
    }
    
    const { role } = currentUser;
    const currentStatus = copy.status as CopyStatus;
    
    // Admin puede cambiar a cualquier estado
    if (role.toLowerCase() === UserRole.ADMIN.toLowerCase()) {
      return ['not_assigned', 'assigned', 'translated', 'reviewed', 'approved', 'rejected'] as CopyStatus[];
    }
    
    // Transiciones permitidas según rol y estado actual
    const normalizedRole = role.toLowerCase();
    
    if (normalizedRole === UserRole.TRANSLATOR.toLowerCase()) {
      // Los traductores solo pueden marcar como traducido si está asignado a ellos
      if (currentStatus === 'assigned' && copy.assignedTo === currentUser.id) {
        return ['translated'] as CopyStatus[];
      }
    } 
    else if (normalizedRole === UserRole.REVIEWER.toLowerCase()) {
      // Los revisores pueden revisar, aprobar o rechazar traducciones
      if (currentStatus === 'translated') {
        return ['reviewed', 'rejected'] as CopyStatus[];
      }
      if (currentStatus === 'reviewed') {
        return ['approved', 'rejected'] as CopyStatus[];
      }
    } 
    else if (normalizedRole === UserRole.DEVELOPER.toLowerCase()) {
      // Los desarrolladores tienen acceso especial
      return ['not_assigned', 'assigned', 'translated', 'reviewed', 'approved', 'rejected'] as CopyStatus[];
    }
    
    return [];
  }, [currentUser, copy]);
  
  // Verifica si el usuario puede cambiar el estado
  const canChangeStatus = allowedTransitions.length > 0;
  
  // Log para debugging
  console.log('=== DEBUG TranslationStatus ===');
  console.log('Copy ID:', copy?.id, 'Status:', copy?.status);
  console.log('Current user:', currentUser);
  console.log('Copy object:', JSON.stringify(copy, null, 2));
  
  if (!currentUser) {
    console.log('TranslationStatus: No hay usuario autenticado - modo de solo lectura');
  } else {
    console.log(`Usuario autenticado: ${currentUser.username} (${currentUser.role})`);
  }

  // Esta función ya no es necesaria porque la lógica se movió al hook useMemo arriba
  console.log('Allowed transitions:', allowedTransitions);
  console.log('Can change status:', canChangeStatus);
  
  const handleStatusChange = (newStatus: CopyStatus) => {
    console.log('=== handleStatusChange ===');
    console.log('Current status:', copy.status);
    console.log('New status:', newStatus);
    
    if (newStatus === copy.status) {
      console.log('El estado no ha cambiado, ignorando...');
      return;
    }
    
    // Verificar si hay un usuario autenticado
    if (!currentUser) {
      console.log('No hay usuario autenticado para cambiar el estado - modo de solo lectura');
      // En modo de solo lectura, no mostramos errores, simplemente no hacemos nada
      return;
    }
    
    console.log(`Cambiando estado de ${copy.status} a ${newStatus} para el copy:`, copy.id);
    
    // Crear una entrada en el historial
    const historyEntry: CopyHistory = {
      id: `history-${Date.now()}`,
      copyId: copy.id,
      userId: currentUser.id,
      userName: currentUser.username,
      previousStatus: copy.status,
      newStatus: newStatus,
      createdAt: new Date()
    };
    
    console.log('Historial creado:', historyEntry);
    
    try {
      // Llamar al callback proporcionado
      console.log('Llamando a onStatusChange...');
      onStatusChange(copy.id, newStatus, historyEntry);
      
      // Mostrar feedback al usuario
      toast({
        title: '✅ Estado actualizado',
        description: `El estado se ha cambiado a "${statusConfig[newStatus].label}"`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      console.log('Estado actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar el estado:', error);
      toast({
        title: '❌ Error',
        description: 'No se pudo actualizar el estado. Por favor, inténtalo de nuevo.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      {canChangeStatus ? (
        <Menu>
          <Tooltip label={`Estado actual: ${statusConfig[copy.status].label}`}>
            <MenuButton 
              as={Button} 
              size="sm" 
              rightIcon={<ChevronDownIcon />}
              variant="outline"
            >
              <HStack>
                <Badge colorScheme={statusConfig[copy.status].color}>
                  {statusConfig[copy.status].label}
                </Badge>
              </HStack>
            </MenuButton>
          </Tooltip>
          <MenuList>
            {allowedTransitions.map((status) => (
              <MenuItem 
                key={status} 
                onClick={() => handleStatusChange(status)}
                isDisabled={status === copy.status}
              >
                <Badge colorScheme={statusConfig[status].color} mr={2}>
                  {statusConfig[status].label}
                </Badge>
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      ) : (
        <Tooltip label="No tienes permisos para cambiar este estado">
          <Badge colorScheme={statusConfig[copy.status].color} px={2} py={1}>
            {statusConfig[copy.status].label}
          </Badge>
        </Tooltip>
      )}
    </Box>
  );
};

export default TranslationStatus;
