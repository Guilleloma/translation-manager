'use client';

import React from 'react';
import { Button, useToast } from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import { seedUsers, seedCopys } from '../../utils/seedData';

/**
 * Componente para forzar la restauración de los datos de prueba
 * Útil para pruebas y demostraciones
 */
export default function ResetDataButton() {
  const toast = useToast();

  const handleReset = () => {
    try {
      console.log('🔄 Forzando restauración de datos de prueba...');
      
      // Guardar usuario actual antes de resetear (si existe)
      const currentUser = localStorage.getItem('user');
      
      // Resetear datos
      localStorage.setItem('users', JSON.stringify(seedUsers));
      localStorage.setItem('copys', JSON.stringify(seedCopys));
      
      // Restaurar usuario actual si existe
      if (currentUser) {
        localStorage.setItem('user', currentUser);
      }
      
      console.log('✅ Datos restaurados correctamente');
      console.log(`📊 Usuarios: ${seedUsers.length}`);
      console.log(`📝 Copys: ${seedCopys.length}`);
      
      // Mostrar los usuarios disponibles en la consola
      console.log('\n👤 Usuarios disponibles:');
      seedUsers.forEach(user => {
        console.log(`- ${user.username} (${user.email}) - Rol: ${user.role}`);
      });
      
      // Mostrar notificación de éxito
      toast({
        title: 'Datos restaurados',
        description: 'Se han restaurado los datos de prueba con los nuevos roles y usuarios',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Recargar la página para aplicar los cambios
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error al restaurar datos:', error);
      
      // Mostrar notificación de error
      toast({
        title: 'Error',
        description: 'Ha ocurrido un error al restaurar los datos',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Button
      colorScheme="red"
      leftIcon={<RepeatIcon />}
      onClick={handleReset}
      size="lg"
      position="fixed"
      bottom="20px"
      right="20px"
      zIndex={1000}
      boxShadow="lg"
    >
      Restaurar Datos
    </Button>
  );
}
