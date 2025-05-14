'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  Text,
  useToast,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useUser } from '../../context/UserContext';

/**
 * LoginForm Component
 * Handles user authentication
 */
export default function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const { login } = useUser();
  const toast = useToast();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Form validation
   */
  const isEmailValid = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = () => password.length >= 6;

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    if (!isEmailValid()) {
      setError('Por favor, introduce un email válido');
      return;
    }
    
    if (!isPasswordValid()) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        toast({
          title: 'Inicio de sesión correcto',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError('Email o contraseña incorrectos');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Ha ocurrido un error. Por favor, inténtalo de nuevo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" p={6} borderWidth={1} borderRadius="lg" boxShadow="md">
      <Heading mb={6} textAlign="center" size="lg">
        Iniciar sesión
      </Heading>
      
      <form onSubmit={handleSubmit}>
        <Stack spacing={4}>
          <FormControl isInvalid={!!error && !isEmailValid()}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              autoComplete="email"
            />
          </FormControl>
          
          <FormControl isInvalid={!!error && !isPasswordValid()}>
            <FormLabel>Contraseña</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"
              required
              autoComplete="current-password"
            />
          </FormControl>
          
          {error && (
            <Text color="red.500" fontSize="sm">
              {error}
            </Text>
          )}
          
          <Button
            type="submit"
            colorScheme="blue"
            size="lg"
            fontSize="md"
            isLoading={isLoading}
            loadingText="Iniciando sesión..."
            w="100%"
          >
            Iniciar sesión
          </Button>
          
          <Text fontSize="sm" textAlign="center">
            Nota: Para la demo, puedes usar admin@example.com o translator@example.com (cualquier contraseña)
          </Text>
        </Stack>
      </form>
    </Box>
  );
}
