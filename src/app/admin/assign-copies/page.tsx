'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Spinner, Center, Box, Text } from '@chakra-ui/react';

/**
 * Página de redirección al panel principal
 * Esta página ya no es necesaria porque la funcionalidad de asignación de copys
 * ha sido integrada en el panel principal de administración
 */
export default function AssignCopiesRedirectPage() {
  const router = useRouter();
  
  // Redirigir al panel principal con un pequeño retraso
  useEffect(() => {
    console.log('Redirigiendo a la página principal de administración...');
    
    // Simular una carga breve y luego redirigir
    const redirectTimer = setTimeout(() => {
      router.push('/admin');
    }, 1500);
    
    // Limpieza del temporizador
    return () => clearTimeout(redirectTimer);
  }, [router]);
  
  return (
    <Container maxW="container.xl" py={20}>
      <Center flexDirection="column">
        <Spinner 
          size="xl" 
          color="blue.500" 
          thickness="4px"
          speed="0.65s"
          mb={4}
        />
        <Box textAlign="center">
          <Text fontSize="lg" mb={3}>
            Esta página ha sido integrada en el panel principal de administración
          </Text>
          <Text color="gray.500">
            Redirigiendo al panel de administración...
          </Text>
        </Box>
      </Center>
    </Container>
  );
}
