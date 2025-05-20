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
  Select,
} from '@chakra-ui/react';
import { useUser } from '../../context/UserContext';
import { UserRole } from '../../types/user';

/**
 * RegisterForm Component
 * Handles user registration
 */
export default function RegisterForm({ onSuccess }: { onSuccess?: () => void }) {
  const { register } = useUser();
  const toast = useToast();
  
  // Form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.TRANSLATOR);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Form validation
   */
  const isUsernameValid = () => username.length >= 3;
  const isEmailValid = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = () => password.length >= 6;
  const doPasswordsMatch = () => password === confirmPassword;

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Inmediatamente mostrar estado de carga
    setIsLoading(true);
    console.log('Registration process started, showing loading state');
    
    // Validate form
    if (!isUsernameValid()) {
      setError('El nombre de usuario debe tener al menos 3 caracteres');
      setIsLoading(false);
      return;
    }
    
    if (!isEmailValid()) {
      setError('Por favor, introduce un email válido');
      setIsLoading(false);
      return;
    }
    
    if (!isPasswordValid()) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsLoading(false);
      return;
    }
    
    if (!doPasswordsMatch()) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await register(username, email, password, role);
      
      if (success) {
        toast({
          title: 'Registro completado',
          description: 'Tu cuenta ha sido creada correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError('El email ya está en uso');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Ha ocurrido un error. Por favor, inténtalo de nuevo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" p={6} borderWidth={1} borderRadius="lg" boxShadow="md">
      <Heading mb={6} textAlign="center" size="lg">
        Crear cuenta
      </Heading>
      
      <form onSubmit={handleSubmit}>
        <Stack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Nombre de usuario</FormLabel>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tu nombre"
              autoComplete="name"
            />
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
            />
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Contraseña</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"
              autoComplete="new-password"
            />
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Confirmar contraseña</FormLabel>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="******"
              autoComplete="new-password"
            />
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Rol</FormLabel>
            <Select 
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              <option value={UserRole.ADMIN}>Administrador</option>
              <option value={UserRole.TRANSLATOR}>Traductor</option>
            </Select>
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
            loadingText="Registrando..."
            w="100%"
          >
            Registrar
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
