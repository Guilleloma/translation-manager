'use client';

import React from 'react';
import { Badge, Tooltip } from '@chakra-ui/react';

// Configuración de idiomas con nombres completos y códigos ISO
export const languageConfig: Record<string, { name: string; color: string }> = {
  'es': { name: 'Español', color: 'red' },
  'en': { name: 'Inglés', color: 'blue' },
  'fr': { name: 'Francés', color: 'cyan' },
  'it': { name: 'Italiano', color: 'green' },
  'de': { name: 'Alemán', color: 'purple' },
  'pt': { name: 'Portugués', color: 'orange' }
};

interface LanguageBadgeProps {
  languageCode: string;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showFullName?: boolean;
}

/**
 * Componente para mostrar un idioma de forma consistente en toda la aplicación
 */
const LanguageBadge: React.FC<LanguageBadgeProps> = ({ 
  languageCode, 
  showTooltip = true,
  size = 'md',
  showFullName = false
}) => {
  // Si el código de idioma no existe en la configuración, mostramos el código tal cual
  const config = languageConfig[languageCode] || { name: languageCode, color: 'gray' };
  
  // Tamaños predefinidos
  const sizeProps = {
    sm: { px: 1, py: 0, fontSize: 'xs' },
    md: { px: 2, py: 1, fontSize: 'sm' },
    lg: { px: 3, py: 1, fontSize: 'md' }
  };
  
  const displayText = showFullName ? config.name : languageCode;
  
  const badge = (
    <Badge 
      colorScheme={config.color}
      {...sizeProps[size]}
    >
      {displayText}
    </Badge>
  );
  
  if (showTooltip && !showFullName) {
    return (
      <Tooltip label={config.name}>
        {badge}
      </Tooltip>
    );
  }
  
  return badge;
};

export default LanguageBadge;
