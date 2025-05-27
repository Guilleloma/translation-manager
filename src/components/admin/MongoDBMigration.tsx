import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Divider,
  useToast
} from '@chakra-ui/react';

interface MigrationStatus {
  usersCount: number;
  copysCount: number;
  isComplete: boolean;
}

export const MongoDBMigration: React.FC = () => {
  const [status, setStatus] = useState<MigrationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const toast = useToast();

  // Verificar estado de migración al cargar
  useEffect(() => {
    checkMigrationStatus();
  }, []);

  const checkMigrationStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/migration');
      const result = await response.json();
      
      if (result.success) {
        setStatus(result.data);
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo verificar el estado de migración',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error verificando migración:', error);
      toast({
        title: 'Error de conexión',
        description: 'No se pudo conectar con la API',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const executeMigration = async () => {
    setIsMigrating(true);
    try {
      const response = await fetch('/api/migration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'migrate' }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setStatus(result.data);
        toast({
          title: 'Migración exitosa',
          description: 'Los datos se han migrado correctamente a MongoDB',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error en migración',
          description: result.error || 'Error desconocido',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error ejecutando migración:', error);
      toast({
        title: 'Error de conexión',
        description: 'No se pudo ejecutar la migración',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const clearData = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar todos los datos de MongoDB?')) {
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/migration', {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setStatus(result.data);
        toast({
          title: 'Datos eliminados',
          description: 'Todos los datos han sido eliminados de MongoDB',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Error desconocido',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error eliminando datos:', error);
      toast({
        title: 'Error de conexión',
        description: 'No se pudo eliminar los datos',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <Heading size="md">🗄️ Migración a MongoDB</Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          {/* Estado actual */}
          {isLoading ? (
            <HStack>
              <Spinner size="sm" />
              <Text>Verificando estado...</Text>
            </HStack>
          ) : status ? (
            <Alert status={status.isComplete ? 'success' : 'warning'}>
              <AlertIcon />
              <Box>
                <AlertTitle>
                  {status.isComplete ? 'MongoDB configurado' : 'Migración pendiente'}
                </AlertTitle>
                <AlertDescription>
                  <HStack spacing={4} mt={2}>
                    <Badge colorScheme="blue">
                      {status.usersCount} usuarios
                    </Badge>
                    <Badge colorScheme="green">
                      {status.copysCount} copys
                    </Badge>
                  </HStack>
                </AlertDescription>
              </Box>
            </Alert>
          ) : (
            <Alert status="error">
              <AlertIcon />
              <AlertTitle>No se pudo conectar a MongoDB</AlertTitle>
              <AlertDescription>
                Verifica que MongoDB esté ejecutándose y la configuración sea correcta.
              </AlertDescription>
            </Alert>
          )}

          <Divider />

          {/* Acciones */}
          <VStack spacing={3}>
            <Text fontSize="sm" color="gray.600">
              La migración transferirá todos los datos de ejemplo desde localStorage a MongoDB.
              Esto solo se ejecuta si MongoDB está vacío.
            </Text>
            
            <HStack spacing={3} width="100%">
              <Button
                colorScheme="blue"
                onClick={executeMigration}
                isLoading={isMigrating}
                loadingText="Migrando..."
                disabled={isLoading}
                flex={1}
              >
                🚀 Migrar datos a MongoDB
              </Button>
              
              <Button
                variant="outline"
                onClick={checkMigrationStatus}
                isLoading={isLoading}
                disabled={isMigrating}
              >
                🔄 Verificar estado
              </Button>
            </HStack>
            
            <Button
              colorScheme="red"
              variant="outline"
              size="sm"
              onClick={clearData}
              isLoading={isLoading}
              disabled={isMigrating}
            >
              🧹 Limpiar MongoDB (solo desarrollo)
            </Button>
          </VStack>

          {/* Información adicional */}
          <Alert status="info" size="sm">
            <AlertIcon />
            <Text fontSize="xs">
              Una vez migrado, la aplicación usará MongoDB en lugar de localStorage.
              Los datos existentes en localStorage se mantendrán como respaldo.
            </Text>
          </Alert>
        </VStack>
      </CardBody>
    </Card>
  );
};
