'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Select,
  Button,
  useToast,
  VStack,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  IconButton,
  Tooltip,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useUser, type User } from '../../context/UserContext';

// Available languages in the system
const SUPPORTED_LANGUAGES = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
];

interface LanguageAssignment {
  language: string;
  userIds: string[];
}

/**
 * LanguageUserSelector Component
 * Allows admins to assign users to specific languages for translation tasks
 */
export default function LanguageUserSelector() {
  const { users, updateUser } = useUser();
  const toast = useToast();
  const [assignments, setAssignments] = useState<LanguageAssignment[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  
  // Get translators only - memoized to prevent unnecessary recalculations
  const translators = useMemo(() => 
    users.filter((user: User) => user.role === 'translator'),
    [users]
  );
  
  // Initialize assignments based on existing user languages
  useEffect(() => {
    // Only run this effect when users or translators change
    // and only if we haven't initialized assignments yet
    if (assignments.length === 0) {
      const initialAssignments: LanguageAssignment[] = [];
      
      // For each supported language, find all users assigned to it
      SUPPORTED_LANGUAGES.forEach(lang => {
        const usersForLang = translators.filter(
          (user: User) => user.languages?.includes(lang.code)
        );
        
        if (usersForLang.length > 0) {
          initialAssignments.push({
            language: lang.code,
            userIds: usersForLang.map((u: User) => u.id)
          });
        }
      });
      
      // Only update if we have assignments to set
      if (initialAssignments.length > 0) {
        setAssignments(initialAssignments);
      }
    }
  }, [users, translators, assignments.length]);
  
  // Get users assigned to a specific language
  const getAssignedUsers = (languageCode: string): User[] => {
    const assignment = assignments.find(a => a.language === languageCode);
    if (!assignment) return [];
    
    return assignment.userIds
      .map(userId => users.find(u => u.id === userId))
      .filter((user): user is User => user !== undefined);
  };
  
  // Get users not assigned to any language yet
  const getUnassignedUsers = (): User[] => {
    const assignedUserIds = new Set(
      assignments.flatMap(a => a.userIds)
    );
    
    return translators.filter((user: User) => !assignedUserIds.has(user.id));
  };
  
  // Handle adding a user to a language
  const handleAddAssignment = () => {
    if (!selectedLanguage || !selectedUser) return;
    
    // Check if the user is already assigned to this language
    const existingAssignment = assignments.find(a => a.language === selectedLanguage);
    
    if (existingAssignment) {
      // Add user to existing language assignment
      if (existingAssignment.userIds.includes(selectedUser)) {
        toast({
          title: 'Usuario ya asignado',
          description: 'Este usuario ya está asignado al idioma seleccionado',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      setAssignments(prev => 
        prev.map(a => 
          a.language === selectedLanguage
            ? { ...a, userIds: [...a.userIds, selectedUser] }
            : a
        )
      );
    } else {
      // Create new language assignment
      setAssignments(prev => [
        ...prev,
        { language: selectedLanguage, userIds: [selectedUser] }
      ]);
    }
    
    // Update user's languages
    const user = users.find(u => u.id === selectedUser);
    if (user && selectedLanguage) {
      const updatedLanguages = [...(user.languages || []), selectedLanguage];
      // Update the user with the new languages
      updateUser(user.id, {
        languages: [...new Set(updatedLanguages)]
      });
    }
    
    // Reset form
    setSelectedUser('');
    
    // Show success message
    toast({
      title: 'Asignación realizada',
      description: `Usuario asignado al idioma ${SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Handle removing a user from a language
  const handleRemoveAssignment = (languageCode: string, userId: string) => {
    setAssignments(prev => 
      prev
        .map(a => 
          a.language === languageCode
            ? { ...a, userIds: a.userIds.filter(id => id !== userId) }
            : a
        )
        .filter(a => a.userIds.length > 0) // Remove empty assignments
    );
    
    // Update user's languages
    const user = users.find(u => u.id === userId);
    if (user?.languages) {
      updateUser(user.id, {
        languages: user.languages.filter(lang => lang !== languageCode)
      });
    }
    
    // Show success message
    toast({
      title: 'Asignación eliminada',
      description: 'El usuario ha sido eliminado del idioma',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Get language name from code
  const getLanguageName = (code: string) => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code)?.name || code;
  };

  return (
    <Box>
      <Heading size="md" mb={4}>Asignación de Idiomas a Traductores</Heading>
      
      <Box mb={8} p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
        <Text mb={4}>
          Asigna traductores a los diferentes idiomas. Cada traductor solo podrá ver y editar 
          los copys en los idiomas que tenga asignados.
        </Text>
        
        <HStack spacing={4} mb={4}>
          <Select
            placeholder="Seleccionar idioma"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            flex={1}
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name} ({lang.code.toUpperCase()})
              </option>
            ))}
          </Select>
          
          <Select
            placeholder="Seleccionar traductor"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            flex={1}
            isDisabled={!selectedLanguage}
          >
            <option value="" disabled>Selecciona un traductor</option>
            {getUnassignedUsers().map(user => (
              <option key={user.id} value={user.id}>
                {user.username} ({user.email})
              </option>
            ))}
          </Select>
          
          <Tooltip 
            label={!selectedLanguage || !selectedUser ? "Selecciona un idioma y un traductor" : "Asignar traductor al idioma"}
          >
            <IconButton
              aria-label="Asignar traductor"
              icon={<AddIcon />}
              colorScheme="blue"
              onClick={handleAddAssignment}
              isDisabled={!selectedLanguage || !selectedUser}
            />
          </Tooltip>
        </HStack>
      </Box>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {SUPPORTED_LANGUAGES.map(lang => {
          const assignedUsers = getAssignedUsers(lang.code);
          
          // Skip languages with no assigned users
          if (assignedUsers.length === 0) return null;
          
          return (
            <Box 
              key={lang.code} 
              p={4} 
              borderWidth="1px" 
              borderRadius="md"
              bg="white"
              boxShadow="sm"
            >
              <Heading size="sm" mb={3}>
                {lang.name} ({lang.code.toUpperCase()})
              </Heading>
              
              <VStack align="stretch" spacing={2}>
                {assignedUsers.map(user => (
                  <Tag
                    key={`${lang.code}-${user.id}`}
                    size="md"
                    variant="subtle"
                    colorScheme="blue"
                    borderRadius="full"
                    justifyContent="space-between"
                  >
                    <TagLabel>{user.username}</TagLabel>
                    <TagCloseButton 
                      onClick={() => handleRemoveAssignment(lang.code, user.id)}
                    />
                  </Tag>
                ))}
              </VStack>
            </Box>
          );
        })}
        
        {assignments.length === 0 && (
          <Box 
            p={4} 
            borderWidth="1px" 
            borderRadius="md"
            bg="gray.50"
            textAlign="center"
            gridColumn={{ base: '1', md: '1 / -1' }}
          >
            <Text color="gray.500">
              No hay asignaciones de idiomas. Usa el formulario superior para asignar traductores a idiomas.
            </Text>
          </Box>
        )}
      </SimpleGrid>
    </Box>
  );
}
