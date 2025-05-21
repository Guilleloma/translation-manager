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
  onTagsChange: (copyId: string, tags: CopyTag[]) => void;
  isFilterMode?: boolean;
  onFilterChange?: (tags: CopyTag[]) => void;
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
  onFilterChange
}) => {
  const { currentUser } = useUser();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [tags, setTags] = useState<CopyTag[]>(copy?.tags || []);
  const [selectedFilterTags, setSelectedFilterTags] = useState<CopyTag[]>([]);
  const toast = useToast();
  
  // Log para debugging
  console.log('Rendering TagManager for copy:', copy?.id, 'with tags:', tags);

  // Actualizar tags cuando cambia el copy
  useEffect(() => {
    if (copy?.tags) {
      setTags(copy.tags);
    } else {
      setTags([]);
    }
  }, [copy]);

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

  // Manejar la adición de una etiqueta
  const handleAddTag = (tag: string) => {
    if (!canEditTags() && !isFilterMode) {
      toast({
        title: 'Permiso denegado',
        description: 'No tienes permisos para añadir etiquetas',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (isFilterMode) {
      // Modo filtro
      if (!selectedFilterTags.includes(tag)) {
        const newFilterTags = [...selectedFilterTags, tag];
        setSelectedFilterTags(newFilterTags);
        if (onFilterChange) {
          onFilterChange(newFilterTags);
        }
      }
    } else {
      // Modo edición
      if (!tags.includes(tag)) {
        const newTags = [...tags, tag];
        setTags(newTags);
        onTagsChange(copy.id, newTags);
        
        toast({
          title: 'Etiqueta añadida',
          description: `Se ha añadido la etiqueta "${tag}"`,
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    }
  };

  // Manejar la eliminación de una etiqueta
  const handleRemoveTag = (tag: string) => {
    if (!canEditTags() && !isFilterMode) {
      toast({
        title: 'Permiso denegado',
        description: 'No tienes permisos para eliminar etiquetas',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (isFilterMode) {
      // Modo filtro
      const newFilterTags = selectedFilterTags.filter(t => t !== tag);
      setSelectedFilterTags(newFilterTags);
      if (onFilterChange) {
        onFilterChange(newFilterTags);
      }
    } else {
      // Modo edición
      const newTags = tags.filter(t => t !== tag);
      setTags(newTags);
      onTagsChange(copy.id, newTags);
      
      toast({
        title: 'Etiqueta eliminada',
        description: `Se ha eliminado la etiqueta "${tag}"`,
        status: 'info',
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
