'use client';

import React from 'react';
import { 
  Box, 
  VStack, 
  Text, 
  Divider, 
  Avatar, 
  HStack, 
  Badge
} from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { CopyComment } from '../../types/copy';

interface CommentListProps {
  comments: CopyComment[];
}

/**
 * Componente que muestra la lista de comentarios asociados a una traducción
 * 
 * @param comments Lista de comentarios a mostrar
 */
export const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  // Añadir log para debugging
  console.log('Rendering CommentList with comments:', comments);
  
  if (!comments || comments.length === 0) {
    return (
      <Box p={4} borderRadius="md" bg="gray.50">
        <Text color="gray.500" fontSize="sm">No hay comentarios para esta traducción</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch" width="100%">
      {comments.map((comment, index) => (
        <Box 
          key={comment.id} 
          p={4} 
          borderRadius="md" 
          bg="gray.50" 
          borderLeft="4px solid" 
          borderLeftColor="blue.500"
        >
          <HStack spacing={3} mb={2}>
            <Avatar size="sm" name={comment.userName} />
            <Box>
              <Text fontWeight="bold">{comment.userName}</Text>
              <Text fontSize="xs" color="gray.500">
                {formatDistanceToNow(new Date(comment.createdAt), { 
                  addSuffix: true,
                  locale: es 
                })}
              </Text>
            </Box>
          </HStack>
          <Text>{comment.text}</Text>
          {index < comments.length - 1 && <Divider mt={3} />}
        </Box>
      ))}
    </VStack>
  );
};

export default CommentList;
