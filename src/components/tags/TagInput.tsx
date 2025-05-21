'use client';

import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import {
  Input,
  InputGroup,
  InputRightElement,
  Tag,
  TagLabel,
  TagCloseButton,
  HStack,
  Box,
  Wrap,
  WrapItem,
  useDisclosure,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  VStack,
  Button,
  Text,
  useColorModeValue,
  InputLeftElement,
  Icon
} from '@chakra-ui/react';
import { AddIcon, CloseIcon, SmallAddIcon } from '@chakra-ui/icons';
import { CopyTag } from '../../types/copy';

// Etiquetas predefinidas comunes para sugerir
const COMMON_TAGS: CopyTag[] = [
  'urgente',
  'marketing',
  'legal',
  'técnico',
  'ui',
  'onboarding',
  'error',
  'success'
];

interface TagInputProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  maxTags?: number;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Componente para gestionar etiquetas con sugerencias
 * 
 * @param tags - Lista de etiquetas actuales
 * @param onAddTag - Función que se ejecuta al añadir una etiqueta
 * @param onRemoveTag - Función que se ejecuta al eliminar una etiqueta
 * @param maxTags - Número máximo de etiquetas permitidas (opcional)
 * @param placeholder - Texto de placeholder para el input (opcional)
 * @param disabled - Si el componente está deshabilitado (opcional)
 */
export const TagInput: React.FC<TagInputProps> = ({
  tags = [],
  onAddTag,
  onRemoveTag,
  maxTags = 10,
  placeholder = "Añadir etiqueta...",
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<CopyTag[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Log para debugging
  console.log('Rendering TagInput with tags:', tags);

  // Color de fondo para las sugerencias según el modo de color
  const suggestionBgColor = useColorModeValue('gray.50', 'gray.700');
  const suggestionHoverBgColor = useColorModeValue('gray.100', 'gray.600');

  // Filtrar sugerencias basadas en el input actual
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = COMMON_TAGS.filter(
        tag => 
          tag.toLowerCase().includes(inputValue.toLowerCase()) && 
          !tags.includes(tag)
      );
      setFilteredSuggestions(filtered);
      if (filtered.length > 0 && !isOpen) {
        onOpen();
      } else if (filtered.length === 0 && isOpen) {
        onClose();
      }
    } else {
      setFilteredSuggestions([]);
      onClose();
    }
  }, [inputValue, tags, isOpen, onOpen, onClose]);

  // Manejar la adición de una nueva etiqueta
  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();
    
    // Validaciones
    if (!trimmedTag) return;
    if (tags.includes(trimmedTag)) return;
    if (tags.length >= maxTags) return;
    
    console.log('Adding new tag:', trimmedTag);
    onAddTag(trimmedTag);
    setInputValue('');
    onClose();
    
    // Enfocar el input después de añadir
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 50);
  };

  // Manejar la tecla Enter para añadir etiqueta
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      handleAddTag(inputValue);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Manejar clic en una sugerencia
  const handleSuggestionClick = (tag: string) => {
    handleAddTag(tag);
  };

  return (
    <Box width="100%">
      {/* Etiquetas actuales */}
      <Wrap spacing={2} mb={2}>
        {tags.map(tag => (
          <WrapItem key={tag}>
            <Tag
              size="md"
              borderRadius="full"
              variant="solid"
              colorScheme="blue"
            >
              <TagLabel>{tag}</TagLabel>
              <TagCloseButton
                onClick={() => {
                  console.log('Removing tag:', tag);
                  onRemoveTag(tag);
                }}
                isDisabled={disabled}
              />
            </Tag>
          </WrapItem>
        ))}
      </Wrap>

      {/* Input para nuevas etiquetas */}
      <Popover
        isOpen={isOpen}
        onClose={onClose}
        placement="bottom-start"
        autoFocus={false}
      >
        <PopoverTrigger>
          <InputGroup size="md">
            <InputLeftElement>
              <Icon as={SmallAddIcon} color="gray.500" />
            </InputLeftElement>
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (inputValue && filteredSuggestions.length > 0) {
                  onOpen();
                }
              }}
              placeholder={placeholder}
              disabled={disabled || tags.length >= maxTags}
            />
            {inputValue && (
              <InputRightElement>
                <CloseIcon
                  boxSize={3}
                  color="gray.500"
                  cursor="pointer"
                  onClick={() => setInputValue('')}
                />
              </InputRightElement>
            )}
          </InputGroup>
        </PopoverTrigger>
        
        {/* Sugerencias de etiquetas */}
        <PopoverContent width="100%">
          <PopoverBody p={0}>
            <VStack align="stretch" spacing={0}>
              {filteredSuggestions.length > 0 ? (
                filteredSuggestions.map(tag => (
                  <Button
                    key={tag}
                    variant="ghost"
                    justifyContent="flex-start"
                    py={2}
                    px={3}
                    fontWeight="normal"
                    onClick={() => handleSuggestionClick(tag)}
                    _hover={{ bg: suggestionHoverBgColor }}
                    leftIcon={<SmallAddIcon />}
                  >
                    {tag}
                  </Button>
                ))
              ) : (
                <Box p={3}>
                  <Text fontSize="sm" color="gray.500">
                    Presiona Enter para añadir "{inputValue}"
                  </Text>
                </Box>
              )}
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Popover>

      {/* Mensaje de límite de etiquetas */}
      {tags.length >= maxTags && (
        <Text fontSize="xs" color="gray.500" mt={1}>
          Límite de {maxTags} etiquetas alcanzado
        </Text>
      )}
    </Box>
  );
};

export default TagInput;
