import React, { useMemo, useCallback } from 'react';
import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Select,
  Text,
  Tooltip
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon, ArrowLeftIcon, ArrowRightIcon } from '@chakra-ui/icons';

interface PaginationProps {
  /**
   * Número total de elementos
   */
  totalItems: number;
  
  /**
   * Número de elementos por página
   */
  itemsPerPage: number;
  
  /**
   * Página actual (comienza en 1)
   */
  currentPage: number;
  
  /**
   * Función para cambiar la página
   */
  onPageChange: (page: number) => void;
  
  /**
   * Función para cambiar el número de elementos por página
   */
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  
  /**
   * Opciones para el número de elementos por página
   */
  itemsPerPageOptions?: number[];
  
  /**
   * Número de páginas a mostrar a cada lado de la página actual
   */
  siblingCount?: number;
}

/**
 * Componente de paginación reutilizable
 * 
 * Muestra controles de navegación para cambiar entre páginas y ajustar
 * el número de elementos mostrados por página.
 */
const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 25, 50, 100],
  siblingCount = 1
}) => {
  console.time('Pagination render');
  
  // Memoizar cálculos de paginación
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    
    return {
      totalPages,
      startItem,
      endItem,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1
    };
  }, [currentPage, totalItems, itemsPerPage]);

  // Memoizar el rango de páginas a mostrar
  const pageRange = useMemo(() => {
    const { totalPages } = paginationData;
    const range = [];
    
    // Calcular el rango de páginas a mostrar
    const startPage = Math.max(1, currentPage - siblingCount);
    const endPage = Math.min(totalPages, currentPage + siblingCount);
    
    for (let i = startPage; i <= endPage; i++) {
      range.push(i);
    }
    
    return range;
  }, [currentPage, paginationData.totalPages, siblingCount]);

  // Usar useCallback para las funciones de navegación
  const handlePreviousPage = useCallback(() => {
    if (paginationData.hasPreviousPage) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, paginationData.hasPreviousPage, onPageChange]);

  const handleNextPage = useCallback(() => {
    if (paginationData.hasNextPage) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, paginationData.hasNextPage, onPageChange]);

  const handlePageClick = useCallback((page: number) => {
    onPageChange(page);
  }, [onPageChange]);

  const handleItemsPerPageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(e.target.value);
    onItemsPerPageChange(newItemsPerPage);
  }, [onItemsPerPageChange]);

  // No renderizar si no hay elementos
  if (totalItems === 0) {
    return null;
  }

  console.timeEnd('Pagination render');

  return (
    <Box width="100%" py={4}>
      <Flex justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={3}>
        {/* Información de elementos mostrados */}
        <Text fontSize="sm" color="gray.600">
          Mostrando {paginationData.startItem} - {paginationData.endItem} de {totalItems} elementos
        </Text>
        
        {/* Controles de paginación */}
        <HStack spacing={1}>
          {/* Botón para ir a la primera página */}
          <Tooltip label="Primera página">
            <IconButton
              aria-label="Primera página"
              icon={<ArrowLeftIcon />}
              size="sm"
              variant="outline"
              isDisabled={currentPage === 1}
              onClick={() => onPageChange(1)}
            />
          </Tooltip>
          
          {/* Botón para ir a la página anterior */}
          <Tooltip label="Página anterior">
            <IconButton
              aria-label="Página anterior"
              icon={<ChevronLeftIcon />}
              size="sm"
              variant="outline"
              isDisabled={currentPage === 1}
              onClick={handlePreviousPage}
            />
          </Tooltip>
          
          {/* Números de página */}
          {pageRange.map((page) => (
            <Button
              key={page}
              size="sm"
              variant={page === currentPage ? 'solid' : 'outline'}
              colorScheme={page === currentPage ? 'blue' : 'gray'}
              onClick={() => handlePageClick(page)}
            >
              {page}
            </Button>
          ))}
          
          {/* Botón para ir a la página siguiente */}
          <Tooltip label="Página siguiente">
            <IconButton
              aria-label="Página siguiente"
              icon={<ChevronRightIcon />}
              size="sm"
              variant="outline"
              isDisabled={currentPage === paginationData.totalPages}
              onClick={handleNextPage}
            />
          </Tooltip>
          
          {/* Botón para ir a la última página */}
          <Tooltip label="Última página">
            <IconButton
              aria-label="Última página"
              icon={<ArrowRightIcon />}
              size="sm"
              variant="outline"
              isDisabled={currentPage === paginationData.totalPages}
              onClick={() => onPageChange(paginationData.totalPages)}
            />
          </Tooltip>
        </HStack>
        
        {/* Selector de elementos por página */}
        {onItemsPerPageChange && (
          <Flex alignItems="center" gap={2}>
            <Text fontSize="sm" whiteSpace="nowrap">Elementos por página:</Text>
            <Select
              size="sm"
              width="auto"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
            >
              {itemsPerPageOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </Flex>
        )}
      </Flex>
    </Box>
  );
};

// Memoizar el componente completo para evitar renders innecesarios
export default React.memo(Pagination);
