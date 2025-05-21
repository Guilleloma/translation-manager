import React, { useMemo } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th, 
  Td,
  Badge,
  IconButton,
  HStack,
  Tooltip,
  Box,
  Flex
} from '@chakra-ui/react';
import { Copy } from '../types/copy';

interface CopyTableProps {
  copys: Copy[];
  onDelete: (id: string) => void;
  onEdit: (copy: Copy) => void;
  onViewHistory?: (copy: Copy) => void;
}

export const CopyTable: React.FC<CopyTableProps> = ({ copys, onDelete, onEdit, onViewHistory }) => {
  // Detectar posibles conflictos de slug (slug raíz vs slug con prefijo)
  // Ejemplo: 'button' vs 'button.crear' causarían conflicto en la estructura JSON
  const slugConflicts = useMemo(() => {
    // Extraer todos los slugs únicos
    const slugs = Array.from(new Set(copys.map(c => c.slug)));
    const conflictMap: Record<string, boolean> = {};
    
    // Detectar conflictos: un slug es prefijo de otro
    slugs.forEach(slug => {
      slugs.forEach(otherSlug => {
        if (slug !== otherSlug && 
           (otherSlug.startsWith(slug + '.') || slug.startsWith(otherSlug + '.'))) {
          // Log para debugging
          console.log(`⚠️ Conflicto de slug detectado en vista lista: "${slug}" con "${otherSlug}"`); 
          conflictMap[slug] = true;
          conflictMap[otherSlug] = true;
        }
      });
    });
    
    return conflictMap;
  }, [copys]);
  
  return (
  <Table variant="simple" mt={4}>
    <Thead>
      <Tr>
        <Th>Slug</Th>
        <Th>Texto</Th>
        <Th>Idioma</Th>
        <Th>Estado</Th>
        <Th width="100px">Acciones</Th>
      </Tr>
    </Thead>
    <Tbody>
      {copys.length === 0 ? (
        <Tr>
          <Td colSpan={5} textAlign="center" py={4}>
            No hay copys para mostrar
          </Td>
        </Tr>
      ) : (
        copys.map(copy => (
          <Tr key={copy.id}>
            <Td maxW="200px" isTruncated>
              {/* Mostrar el warning si el slug tiene conflicto */}
              {slugConflicts[copy.slug] ? (
                <Flex align="center">
                  <Box mr={1}>{copy.slug}</Box>
                  <Tooltip label="Este slug puede causar conflictos al exportar a JSON i18n porque existe como clave raíz y como prefijo de otros slugs. Revisa la exportación para evitar sobrescribir valores.">
                    <span style={{ color: '#E9B824', cursor: 'pointer' }}>
                      ⚠️
                    </span>
                  </Tooltip>
                </Flex>
              ) : copy.slug}
            </Td>
            <Td maxW="300px" isTruncated>{copy.text}</Td>
            <Td>{copy.language === 'es' ? 'Español' : copy.language === 'en' ? 'Inglés' : copy.language}</Td>
            <Td><Badge colorScheme={getStatusColor(copy.status)}>{copy.status}</Badge></Td>
            <Td>
              <HStack spacing={2}>
                <Tooltip label="Editar">
                  <IconButton
                    aria-label="Editar copy"
                    icon={<span>✏️</span>}
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(copy)}
                  />
                </Tooltip>
                <Tooltip label="Eliminar">
                  <IconButton
                    aria-label="Eliminar copy"
                    icon={<span>🗑️</span>}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => onDelete(copy.id)}
                  />
                </Tooltip>
              </HStack>
            </Td>
          </Tr>
        ))
      )}
    </Tbody>
  </Table>
  );
};

function getStatusColor(status: string) {
  switch (status) {
    case 'not_assigned': return 'yellow';
    case 'assigned': return 'blue';
    case 'translated': return 'green';
    default: return 'gray';
  }
}
