'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  HStack,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast,
  Flex,
  Badge
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { Copy, CopyTag } from '../../types/copy';
import TagInput from './TagInput';
import { useUser } from '../../context/UserContext';
import { UserRole } from '../../types/user';

interface TagManagerProps {
  copy: Copy;
  // Esta función ahora solo actualizará el estado local del formulario padre,
  // no guardará directamente en la base de datos
  onTagsChange: (copyId: string, tags: string[]) => void;
  onFilterChange?: (selectedTags: string[]) => void;
  isFilterMode?: boolean;
  selectedFilterTags?: string[];
}

/**
 * Componente para gestionar etiquetas de una traducción
 * Permite añadir, eliminar y filtrar por etiquetas
 * 
 * @param copy - Objeto con la información de la traducción
 * @param onTagsChange - Callback que se ejecuta cuando cambian las etiquetas
 * @param isFilterMode - Si está en modo filtro (opcional)
 * @param onFilterChange - Callback para cambios en el filtro (opcional)
 */
export const TagManager: React.FC<TagManagerProps> = ({
  copy,
  onTagsChange,
  isFilterMode = false,
  onFilterChange,
  selectedFilterTags = []
}) => {
  const { currentUser } = useUser();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [tags, setTags] = useState<CopyTag[]>(Array.isArray(copy?.tags) ? copy.tags : []);
  const [selectedFilterTagsState, setSelectedFilterTags] = useState<string[]>(selectedFilterTags);
  const toast = useToast();
  
  // Log simplificado solo si hay etiquetas
  if (copy?.tags && Array.isArray(copy.tags) && copy.tags.length > 0) {
    console.log(`🏷️ [TagManager] Copy ${copy.id} tiene ${copy.tags.length} etiquetas: ${copy.tags.join(', ')}`);
  }

  /**
   * Actualizar tags cuando cambia el copy
   * Este efecto garantiza que el estado local de tags esté sincronizado con los del copy
   */
  useEffect(() => {
    // Verificar si copy existe y tiene tags válidos
    if (copy) {
      // Asegurar que los tags sean siempre un array
      const validTags = Array.isArray(copy.tags) ? copy.tags : [];
      console.log(`🔄 [TagManager] Sincronizando etiquetas para copy ${copy.id}:`, validTags);
      setTags(validTags);
    } else {
      console.log('🔄 [TagManager] No hay copy o tags definidos, usando array vacío');
      setTags([]);
    }
  }, [copy, copy?.tags]); // Añadido copy?.tags para detectar cambios en las etiquetas

  // Verificar si el usuario puede editar etiquetas
  const canEditTags = () => {
    if (!currentUser) return false;
    
    // Roles que pueden editar etiquetas
    return [
      UserRole.ADMIN,
      UserRole.DEVELOPER,
      UserRole.REVIEWER
    ].includes(currentUser.role);
  };

  /**
   * Manejar la adición de una nueva etiqueta
   * - En modo filtro: añade la etiqueta a los filtros
   * - En modo edición: añade la etiqueta al estado local del componente
   */
  const handleAddTag = (newTag: string) => {
    if (isFilterMode) {
      // Modo filtro - añadir a los filtros seleccionados
      const newFilterTags = [...selectedFilterTagsState, newTag];
      setSelectedFilterTags(newFilterTags);
      if (onFilterChange) {
        onFilterChange(newFilterTags);
      }
    } else {
      // Verificar permisos
      if (!canEditTags()) {
        toast({
          title: 'Permiso denegado',
          description: 'No tienes permisos para añadir etiquetas',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // Verificar si la etiqueta ya existe
      if (tags.includes(newTag)) {
        toast({
          title: 'Etiqueta duplicada',
          description: `La etiqueta "${newTag}" ya existe en este copy`,
          status: 'warning',
          duration: 2000,
          isClosable: true,
        });
        return;
      }
      
      // Modo edición - añadir al estado local (no a la BD todavía)
      console.log(`🏷️ [TagManager] Añadiendo etiqueta "${newTag}" al estado local`);
      
      // Crear un nuevo array con la etiqueta añadida
      const newTags = [...tags, newTag];
      
      // Actualizar estado local inmediatamente para mejor UI
      setTags(newTags);
      
      // Notificar al padre del cambio en el estado local
      // Esto NO guarda en la BD, solo actualiza el estado del formulario padre
      onTagsChange(copy.id, newTags);
      
      // Mostrar feedback visual
      toast({
        title: 'Etiqueta añadida',
        description: `Se ha añadido la etiqueta "${newTag}" (Pendiente de guardar)`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  /**
   * Manejar la eliminación de una etiqueta
   * - En modo filtro: actualiza selectedFilterTags para quitar ese filtro
   * - En modo edición: elimina la etiqueta del estado local
   */
  const handleRemoveTag = (tag: string) => {
    if (isFilterMode) {
      // Modo filtro
      const newFilterTags = selectedFilterTags.filter(t => t !== tag);
      setSelectedFilterTags(newFilterTags);
      if (onFilterChange) {
        onFilterChange(newFilterTags);
      }
    } else {
      // Verificar permisos
      if (!canEditTags()) {
        toast({
          title: 'Permiso denegado',
          description: 'No tienes permisos para eliminar etiquetas',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // Modo edición - solo actualizar estado local
      console.log(`🏷️ [TagManager] Eliminando etiqueta "${tag}" del estado local`);
      
      // Crear nuevo array de tags sin la etiqueta eliminada
      const newTags = tags.filter(t => t !== tag);
      
      // Actualizar estado local inmediatamente para mejor UI
      setTags(newTags);
      
      // Notificar al padre del cambio en el estado local
      // Esto NO guarda en la BD, solo actualiza el estado del formulario padre
      onTagsChange(copy.id, newTags);
      
      // Mostrar confirmación visual
      toast({
        title: 'Etiqueta eliminada',
        description: `Se ha eliminado la etiqueta "${tag}" (Pendiente de guardar)`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  // Renderizar etiquetas en modo visualización
  const renderTags = () => {
    if (!tags || tags.length === 0) {
      return (
        <Text fontSize="sm" color="gray.500">
          Sin etiquetas
        </Text>
      );
    }

    return (
      <Flex wrap="wrap" gap={2}>
        {tags.map(tag => (
          <Badge
            key={tag}
            colorScheme="blue"
            borderRadius="full"
            px={2}
            py={1}
            fontSize="xs"
          >
            {tag}
          </Badge>
        ))}
      </Flex>
    );
  };

  return (
    <Box>
      {isFilterMode ? (
        // Modo filtro
        <Box>
          <Heading size="sm" mb={2}>Filtrar por etiquetas</Heading>
          <TagInput
            tags={selectedFilterTags}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            placeholder="Añadir etiqueta para filtrar..."
          />
        </Box>
      ) : (
        // Modo visualización/edición
        <Box>
          <HStack justifyContent="space-between" mb={2}>
            <Heading size="sm">Etiquetas</Heading>
            {canEditTags() && (
              <Button
                size="xs"
                leftIcon={<AddIcon />}
                onClick={onOpen}
                colorScheme="blue"
                variant="outline"
              >
                Gestionar
              </Button>
            )}
          </HStack>
          
          {renderTags()}
          
          {/* Modal para editar etiquetas */}
          <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Gestionar etiquetas</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <TagInput
                  tags={tags}
                  onAddTag={handleAddTag}
                  onRemoveTag={handleRemoveTag}
                  placeholder="Añadir nueva etiqueta..."
                />
              </ModalBody>
              <ModalFooter>
                <Button onClick={onClose}>Cerrar</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Box>
      )}
    </Box>
  );
};

export default TagManager;
