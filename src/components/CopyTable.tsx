import React from 'react';
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
  Tooltip
} from '@chakra-ui/react';
import { Copy } from '../types/copy';

interface CopyTableProps {
  copys: Copy[];
  onDelete: (id: string) => void;
  onEdit: (copy: Copy) => void;
}

export const CopyTable: React.FC<CopyTableProps> = ({ copys, onDelete, onEdit }) => (
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
            <Td maxW="200px" isTruncated>{copy.slug}</Td>
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

function getStatusColor(status: string) {
  switch (status) {
    case 'pendiente': return 'yellow';
    case 'traducido': return 'blue';
    case 'revisado': return 'purple';
    case 'aprobado': return 'green';
    default: return 'gray';
  }
}
