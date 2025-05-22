'use client';

import React from 'react';
import { Badge, Tooltip } from '@chakra-ui/react';
import { CopyStatus } from '../../types/copy';
import { statusConfig } from './TranslationStatus';

interface StatusBadgeProps {
  status: CopyStatus;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Componente reutilizable para mostrar el estado de una traducción de forma consistente
 * en toda la aplicación.
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  showTooltip = true,
  size = 'md'
}) => {
  const config = statusConfig[status];
  
  // Tamaños predefinidos
  const sizeProps = {
    sm: { px: 1, py: 0, fontSize: 'xs' },
    md: { px: 2, py: 1, fontSize: 'sm' },
    lg: { px: 3, py: 1, fontSize: 'md' }
  };
  
  const badge = (
    <Badge 
      colorScheme={config.color}
      {...sizeProps[size]}
    >
      {config.label}
    </Badge>
  );
  
  if (showTooltip) {
    return (
      <Tooltip label={`Estado: ${config.label}`}>
        {badge}
      </Tooltip>
    );
  }
  
  return badge;
};

export default StatusBadge;
