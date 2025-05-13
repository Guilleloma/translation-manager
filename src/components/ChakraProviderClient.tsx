'use client';
import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';

export default function ChakraProviderClient({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <ChakraProvider>
      {children}
    </ChakraProvider>
  );
}
