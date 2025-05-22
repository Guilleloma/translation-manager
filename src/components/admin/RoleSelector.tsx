'use client';

import React from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Icon,
  Text,
  HStack,
  Badge,
  useToast
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { User, UserRole } from '../../types/user';

// Configuración de roles con colores y etiquetas consistentes
export const roleConfig: Record<string, { color: string; label: string; icon?: React.ReactNode }> = {
  'admin': { 
    color: 'purple', 
    label: 'Administrador'
  },
  'translator': { 
    color: 'green', 
    label: 'Traductor'
  },
  'reviewer': { 
    color: 'orange', 
    label: 'Revisor'
  },
  'developer': { 
    color: 'blue', 
    label: 'Desarrollador'
  }
};

interface RoleSelectorProps {
  user: User;
  onRoleChange: (userId: string, newRole: UserRole) => void;
}

/**
 * Componente selector de roles que muestra un menú desplegable con todas las opciones disponibles
 */
const RoleSelector: React.FC<RoleSelectorProps> = ({ user, onRoleChange }) => {
  const toast = useToast();
  
  // Función para cambiar el rol
  const handleRoleChange = (newRole: UserRole) => {
    if (newRole === user.role) return;
    
    console.log(`Cambiando rol de usuario ${user.username} de ${user.role} a ${newRole}`);
    onRoleChange(user.id, newRole);
    
    toast({
      title: 'Rol actualizado',
      description: `El rol de ${user.username} ha sido cambiado a ${roleConfig[newRole.toLowerCase()].label}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Normalizar el rol actual para acceder a la configuración
  const normalizedRole = user.role.toLowerCase();
  
  return (
    <Menu>
      <MenuButton 
        as={Button} 
        rightIcon={<ChevronDownIcon />}
        colorScheme={roleConfig[normalizedRole].color}
        size="sm"
        variant="outline"
      >
        <HStack>
          <Badge colorScheme={roleConfig[normalizedRole].color}>
            {roleConfig[normalizedRole].label}
          </Badge>
        </HStack>
      </MenuButton>
      <MenuList>
        {Object.entries(UserRole).map(([key, role]) => (
          <MenuItem 
            key={role}
            onClick={() => handleRoleChange(role)}
            isDisabled={role === user.role}
          >
            <Badge 
              colorScheme={roleConfig[role.toLowerCase()].color} 
              mr={2}
            >
              {roleConfig[role.toLowerCase()].label}
            </Badge>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default RoleSelector;
