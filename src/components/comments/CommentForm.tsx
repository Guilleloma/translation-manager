'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  FormControl,
  Input,
  HStack,
  useToast 
} from '@chakra-ui/react';
import { useUser } from '../../context/UserContext';
import { CopyComment } from '../../types/copy';

interface CommentFormProps {
  copyId: string;
  onCommentAdded: (comment: CopyComment) => void;
}

/**
 * Componente de formulario para añadir nuevos comentarios a una traducción
 * 
 * @param copyId ID de la traducción a la que se añade el comentario
 * @param onCommentAdded Callback que se ejecuta cuando se añade un comentario
 */
export const CommentForm: React.FC<CommentFormProps> = ({ copyId, onCommentAdded }) => {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useUser();
  const toast = useToast();

  // Log para debugging
  console.log('Rendering CommentForm for copyId:', copyId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      console.error('No user logged in, cannot add comment');
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para añadir comentarios',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!commentText.trim()) {
      console.error('Comment text is empty');
      toast({
        title: 'Error',
        description: 'El comentario no puede estar vacío',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    
    // En un entorno real, esto sería una llamada a API
    // Simulamos una pequeña latencia para mostrar el estado de carga
    setTimeout(() => {
      const newComment: CopyComment = {
        id: `comment-${Date.now()}`, // Generación simple de ID para prototipo
        copyId,
        userId: currentUser.id,
        userName: currentUser.username,
        text: commentText,
        createdAt: new Date(),
      };

      console.log('Adding new comment:', newComment);
      onCommentAdded(newComment);
      setCommentText('');
      setIsSubmitting(false);
      
      toast({
        title: 'Comentario añadido',
        description: 'Tu comentario se ha añadido correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }, 500);
  };

  return (
    <Box as="form" onSubmit={handleSubmit} mt={4}>
      <FormControl isDisabled={!currentUser}>
        <HStack>
          <Input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={currentUser ? "Añadir un comentario..." : "Inicia sesión para comentar"}
            disabled={!currentUser || isSubmitting}
          />
          <Button 
            type="submit" 
            colorScheme="blue"
            isLoading={isSubmitting}
            loadingText="Enviando"
            disabled={!currentUser || isSubmitting || !commentText.trim()}
          >
            Enviar
          </Button>
        </HStack>
      </FormControl>
    </Box>
  );
};

export default CommentForm;
