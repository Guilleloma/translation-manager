'use client';

import React, { useState, useEffect } from 'react';
import { Box, Spinner, Progress, useColorModeValue, useToken } from '@chakra-ui/react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Componente que muestra un indicador de carga durante la navegación entre páginas
 * Se activa automáticamente cuando el usuario navega entre rutas
 * 
 * Implementa dos tipos de indicadores:
 * 1. Una barra de progreso fija en la parte superior (para cambios de página)
 * 2. Un spinner central (para cambios que tardan más de lo esperado)
 */
export default function LoadingIndicator() {
  // Estados para controlar la visibilidad y duración de la carga
  const [loading, setLoading] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Obtener la ruta actual para detectar cambios
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Colores para el tema
  const progressColor = useColorModeValue('blue.500', 'blue.300');
  const [bgColor] = useToken('colors', ['white']);
  
  // Efecto para detectar cambios de ruta
  useEffect(() => {
    // Función para simular el progreso
    let progressInterval: NodeJS.Timeout;
    let spinnerTimeout: NodeJS.Timeout;
    
    // Al cambiar la ruta, mostrar el indicador de carga
    const handleRouteChange = () => {
      // Iniciar carga
      setLoading(true);
      setProgress(0);
      
      // Simular progreso gradual
      progressInterval = setInterval(() => {
        setProgress(prev => {
          // Incremento gradual que se ralentiza a medida que se acerca a 90%
          const increment = Math.max(1, 10 - Math.floor(prev / 10));
          const nextProgress = prev + increment;
          
          // Limitar al 90% para que no parezca que ha terminado
          return nextProgress > 90 ? 90 : nextProgress;
        });
      }, 100);
      
      // Mostrar spinner central si tarda más de 1 segundo
      spinnerTimeout = setTimeout(() => {
        setShowSpinner(true);
      }, 1000);
    };
    
    // Iniciar carga
    handleRouteChange();
    
    // Temporizador para completar la carga (simular finalización)
    const completeTimeout = setTimeout(() => {
      // Completar barra de progreso rápidamente
      setProgress(100);
      
      // Ocultar los indicadores después de completar
      setTimeout(() => {
        setLoading(false);
        setShowSpinner(false);
        clearInterval(progressInterval);
        clearTimeout(spinnerTimeout);
      }, 300); // Tiempo para la animación de finalización
    }, 800); // Tiempo estimado para la carga de la página
    
    // Limpiar todos los timers e intervalos al desmontar
    return () => {
      clearInterval(progressInterval);
      clearTimeout(spinnerTimeout);
      clearTimeout(completeTimeout);
    };
  }, [pathname, searchParams]); // Reactivar cuando cambie la ruta o los parámetros
  
  // Si no está cargando, no mostrar nada
  if (!loading) return null;
  
  return (
    <>
      {/* Barra de progreso superior */}
      <Box 
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={9999}
        height="3px"
      >
        <Progress 
          value={progress} 
          size="xs" 
          colorScheme="blue"
          isAnimated
          hasStripe
          style={{ 
            transition: 'width 0.2s ease-in-out',
            borderRadius: 0 
          }}
        />
      </Box>
      
      {/* Spinner central para cargas prolongadas */}
      {showSpinner && (
        <Box
          position="fixed"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          zIndex={9998}
          bg={`${bgColor}80`} // Semi-transparente
          p={4}
          borderRadius="md"
          boxShadow="md"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color={progressColor}
            size="xl"
          />
        </Box>
      )}
    </>
  );
}
