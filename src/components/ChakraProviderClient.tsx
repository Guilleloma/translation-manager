'use client';
import React from 'react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { UserProvider } from '../context/UserContext';

// Configuración para evitar errores de hidración
const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});

// Creamos un componente que use useEffect para asegurarnos de que solo se ejecute en el cliente
export default function ChakraProviderClient({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  // Asegurarnos de que el componente solo se renderice en el cliente
  const [isClient, setIsClient] = React.useState(false);
  
  React.useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Si no estamos en el cliente, devolvemos un div para evitar la hidración
  if (!isClient) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }
  
  return (
    <ChakraProvider theme={theme} resetCSS={true}>
      <UserProvider>
        {children}
      </UserProvider>
    </ChakraProvider>
  );
}

// Exportar también como named export para ser consistente con la importación en layout.tsx
export const ChakraProviderWrapper = ChakraProviderClient;
