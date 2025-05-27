import React, { useState, useMemo, useCallback } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  HStack,
  Tooltip,
  Box,
  Flex,
  Text,
  Checkbox,
  TableContainer
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { Copy } from '../types/copy';
import StatusBadge from './status/StatusBadge';
import LanguageBadge from './common/LanguageBadge';
import Pagination from './common/Pagination';

interface CopyTableProps {
  copys: Copy[];
  onDelete: (id: string) => void;
  onEdit: (copy: Copy) => void;
  onViewHistory?: (copy: Copy) => void;
  selectedCopys?: string[];
  onToggleSelect?: (copyId: string) => void;
  onSelectAll?: (copyIds: string[]) => void;
  onClearSelection?: () => void;
}

// Componente memoizado para las filas de la tabla
const CopyTableRow = React.memo(({ copy, onEdit, onDelete, isSelected, onToggleSelect }: {
  copy: Copy;
  onEdit: (copy: Copy) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onToggleSelect?: (copyId: string) => void;
}) => {
  console.log(`Rendering table row for copy: ${copy.id}`);
  
  return (
    <Tr key={copy.id} bg={isSelected ? 'blue.50' : 'white'}>
      <Td>
        <label
          onClick={(e) => {
            // Detener la propagación para evitar que el evento llegue a la fila
            e.stopPropagation();
          }}
          style={{ cursor: 'pointer', display: 'block', width: '100%', height: '100%' }}
        >
          <Checkbox
            isChecked={isSelected}
            onChange={() => {
              console.log('Checkbox clicked for copy:', copy.id);
              onToggleSelect?.(copy.id);
            }}
          />
        </label>
      </Td>
      <Td maxW="200px" isTruncated>
        {/* Mostrar el warning si el slug tiene conflicto */}
        {copy.slug}
      </Td>
      <Td maxW="300px" isTruncated>{copy.text}</Td>
      <Td><LanguageBadge languageCode={copy.language} showFullName={true} /></Td>
      <Td><StatusBadge status={copy.status as any} /></Td>
      <Td>
        <HStack spacing={2}>
          <Tooltip label="Editar">
            <IconButton
              aria-label="Editar copy"
              icon={<EditIcon />}
              size="sm"
              variant="ghost"
              onClick={() => onEdit(copy)}
            />
          </Tooltip>
          <Tooltip label="Eliminar">
            <IconButton
              aria-label="Eliminar copy"
              icon={<DeleteIcon />}
              size="sm"
              variant="ghost"
              colorScheme="red"
              onClick={() => onDelete(copy.id)}
            />
          </Tooltip>
        </HStack>
      </Td>
    </Tr>
  );
});

CopyTableRow.displayName = 'CopyTableRow';

const CopyTable: React.FC<CopyTableProps> = ({
  copys = [], // Valor por defecto para evitar errores
  onViewHistory,
  onEdit,
  onDelete,
  selectedCopys = [],
  onToggleSelect,
  onSelectAll,
  onClearSelection
}) => {
  console.time('CopyTable render');
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(25);

  // Aplicar paginación con memoización
  const paginatedCopys = useMemo(() => {
    console.time('Paginating copys in CopyTable');
    if (!copys || copys.length === 0) {
      console.timeEnd('Paginating copys in CopyTable');
      return [];
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = copys.slice(startIndex, endIndex);
    console.timeEnd('Paginating copys in CopyTable');
    return paginated;
  }, [copys, currentPage, itemsPerPage]);

  // Usar useCallback para funciones que se pasan como props
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleItemsPerPageChange = useCallback((items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset a la primera página
  }, []);

  const handleToggleSelect = useCallback((copyId: string) => {
    console.log('Toggle select called for copyId:', copyId);
    onToggleSelect?.(copyId);
  }, [onToggleSelect]);

  const handleEdit = useCallback((copy: Copy) => {
    onEdit(copy);
  }, [onEdit]);

  const handleDelete = useCallback((id: string) => {
    onDelete(id);
  }, [onDelete]);

  const handleSelectAll = useCallback(() => {
    onSelectAll?.(paginatedCopys.map(copy => copy.id));
  }, [onSelectAll, paginatedCopys]);

  const handleClearSelection = useCallback(() => {
    onClearSelection?.();
  }, [onClearSelection]);

  // Memoizar el estado del checkbox principal
  const selectAllState = useMemo(() => {
    const selectedCount = selectedCopys.length;
    const totalCount = paginatedCopys.length;
    
    return {
      isChecked: selectedCount === totalCount && totalCount > 0,
      isIndeterminate: selectedCount > 0 && selectedCount < totalCount
    };
  }, [selectedCopys.length, paginatedCopys.length]);

  console.timeEnd('CopyTable render');

  return (
    <Box>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>
                <label
                  onClick={(e) => {
                    // Detener la propagación para evitar que el evento llegue a la fila
                    e.stopPropagation();
                  }}
                  style={{ cursor: 'pointer', display: 'block', width: '100%', height: '100%' }}
                >
                  <Checkbox
                    isChecked={selectAllState.isChecked}
                    isIndeterminate={selectAllState.isIndeterminate}
                    onChange={(e) => {
                      console.log('Select all checkbox changed:', e.target.checked);
                      if (e.target.checked) {
                        if (onSelectAll) handleSelectAll();
                      } else {
                        if (onClearSelection) handleClearSelection();
                      }
                    }}
                  />
                </label>
              </Th>
              <Th>Slug</Th>
              <Th>Texto</Th>
              <Th>Idioma</Th>
              <Th>Estado</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {paginatedCopys.map((copy) => (
              <CopyTableRow
                key={copy.id}
                copy={copy}
                onEdit={handleEdit}
                onDelete={(id) => onDelete(id)}
                isSelected={selectedCopys.includes(copy.id)}
                onToggleSelect={handleToggleSelect}
              />
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Componente de paginación */}
      <Pagination
        currentPage={currentPage}
        totalItems={copys?.length || 0}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
      <Text mt={2} fontSize="sm" color="gray.600">
        {`${copys?.length || 0} traducciones totales`}
      </Text>
    </Box>
  );
};

export default CopyTable;
