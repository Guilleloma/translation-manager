'use client';

import React, { useState, useEffect } from 'react';
import { Container, Tabs, TabList, TabPanels, Tab, TabPanel, Box, Heading, Text, Button } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import LoginForm from '../../components/auth/LoginForm';
import RegisterForm from '../../components/auth/RegisterForm';
import { useUser } from '../../context/UserContext';

/**
 * Authentication Page Component
 * Handles user login and registration
 */
export default function AuthPage() {
  const { isAuthenticated, isLoading } = useUser();
  const router = useRouter();
  const [tabIndex, setTabIndex] = useState(0);

  // Log for debugging
  console.log('Auth page rendered', { isAuthenticated, isLoading });

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log('User already authenticated, redirecting to home');
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // Handle successful auth
  const handleAuthSuccess = () => {
    console.log('Authentication successful, redirecting to home');
    router.push('/');
  };

  return (
    <Container maxW="container.md" py={10}>
      <Box textAlign="center" mb={10}>
        <Heading as="h1" size="xl" mb={3}>
          Translation Manager
        </Heading>
        <Text fontSize="lg" color="gray.600">
          Gestión de traducciones y copys para tu aplicación
        </Text>
      </Box>

      {isLoading ? (
        <Box textAlign="center">Cargando...</Box>
      ) : (
        <Tabs isFitted variant="enclosed" index={tabIndex} onChange={setTabIndex}>
          <TabList mb="1em">
            <Tab>Iniciar sesión</Tab>
            <Tab>Registrarse</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <LoginForm onSuccess={handleAuthSuccess} />
            </TabPanel>
            <TabPanel>
              <RegisterForm onSuccess={handleAuthSuccess} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}

      <Box mt={8} textAlign="center">
        <Button variant="link" onClick={() => router.push('/')}>
          Volver a la página principal
        </Button>
      </Box>
    </Container>
  );
}
