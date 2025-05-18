import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Progress,
  Heading,
  VStack,
  HStack,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Copy } from '../types/copy';
import { v4 as uuidv4 } from 'uuid';

// Define una interfaz para los datos importados
interface ImportedCopyData {
  slug?: string;
  text?: string;
  language: string;
  row: number; // Número de fila en el archivo original
  errors?: string[]; // Errores de validación para esta fila
  status: 'valid' | 'warning' | 'error'; // Estado de validación
}

interface BulkImportFormProps {
  existingCopys: Copy[]; // Lista de copys existentes para validar duplicados
  onImportComplete: (newCopys: Omit<Copy, 'id' | 'status'>[]) => void;
  onCancel?: () => void;
}

/**
 * Componente para cargar masivamente copys/slugs desde un archivo CSV/Excel
 * 
 * Permite a los usuarios subir un archivo, validar su contenido y
 * agregar múltiples copys al sistema después de una validación.
 */
export const BulkImportForm: React.FC<BulkImportFormProps> = ({
  existingCopys,
  onImportComplete,
  onCancel
}) => {
  // Estado para almacenar el archivo seleccionado
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Estado para almacenar los datos importados ya procesados
  const [importedData, setImportedData] = useState<ImportedCopyData[]>([]);
  
  // Estado para indicar si el proceso de análisis del archivo está en curso
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Estado para almacenar errores generales del proceso de importación
  const [error, setError] = useState<string>('');
  
  // Estado para almacenar copys que serán sobrescritos y requieren confirmación
  const [duplicatesToOverwrite, setDuplicatesToOverwrite] = useState<ImportedCopyData[]>([]);
  
  // Control del modal de confirmación
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Referencia al input file para poder limpiarlo después de un proceso
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Hook para mostrar notificaciones toast
  const toast = useToast();

  // Estadísticas de validación
  const validRows = importedData.filter(row => row.status === 'valid').length;
  const warningRows = importedData.filter(row => row.status === 'warning').length;
  const errorRows = importedData.filter(row => row.status === 'error').length;

  /**
   * Valida los datos de un copy importado
   * @param data Datos del copy a validar
   * @param rowIndex Índice de la fila para referencia
   * @returns Objeto con datos validados y marcados con errores si corresponde
   */
  const validateCopyData = (data: any, rowIndex: number): ImportedCopyData => {
    // Inicializamos el objeto de datos importados con valores por defecto
    const importedCopy: ImportedCopyData = {
      slug: data.slug?.trim() || undefined,
      text: data.text?.trim() || undefined,
      language: data.language?.trim()?.toLowerCase() || 'es', // Por defecto español si no se especifica
      row: rowIndex + 1, // +1 para considerar el encabezado
      errors: [],
      status: 'valid'
    };

    // Validar que al menos se proporcione texto o slug
    if (!importedCopy.text && !importedCopy.slug) {
      importedCopy.errors?.push('Debe proporcionar al menos un texto o un slug');
      importedCopy.status = 'error';
    }

    // Validar formato del slug si existe
    if (importedCopy.slug && !/^[a-z0-9.]*$/.test(importedCopy.slug)) {
      importedCopy.errors?.push('El slug debe contener solo letras minúsculas, números y puntos');
      importedCopy.status = 'error';
    }

    // Validar idioma (debe ser uno de los admitidos)
    const validLanguages = ['es', 'en']; // Agregar otros idiomas soportados si es necesario
    if (!validLanguages.includes(importedCopy.language)) {
      importedCopy.errors?.push(`Idioma no válido. Valores permitidos: ${validLanguages.join(', ')}`);
      importedCopy.status = 'error';
    }

    // Validar duplicados de slug dentro del mismo idioma
    if (importedCopy.slug) {
      const slugExistsInFile = importedData.some(
        item => item.slug === importedCopy.slug && item.language === importedCopy.language
      );
      
      const slugExistsInSystem = existingCopys.some(
        copy => copy.slug === importedCopy.slug && copy.language === importedCopy.language
      );

      if (slugExistsInFile) {
        importedCopy.errors?.push(`El slug "${importedCopy.slug}" ya existe en el archivo para el idioma ${importedCopy.language}`);
        importedCopy.status = 'error';
      } else if (slugExistsInSystem) {
        importedCopy.errors?.push(`El slug "${importedCopy.slug}" ya existe en el sistema para el idioma ${importedCopy.language}`);
        importedCopy.status = 'warning';
      }
    }

    // Si hay errores pero status sigue siendo valid, es porque solo hay warnings
    if (importedCopy.errors?.length && importedCopy.status === 'valid') {
      importedCopy.status = 'warning';
    }

    return importedCopy;
  };

  /**
   * Procesa un archivo CSV a través de PapaParse
   * @param file Archivo CSV a procesar
   */
  const processCSV = (file: File) => {
    setIsProcessing(true);
    setError('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<any>) => {
        console.log('Resultado del parsing CSV:', results);
        
        if (results.errors.length > 0) {
          setError(`Error al procesar el archivo CSV: ${results.errors[0].message}`);
          setIsProcessing(false);
          return;
        }

        try {
          // Procesamos y validamos cada fila
          const validatedData = results.data.map((row: any, index: number) => 
            validateCopyData(row, index)
          );
          
          setImportedData(validatedData);
          setIsProcessing(false);
          
          // Notificamos al usuario
          toast({
            title: 'Archivo procesado',
            description: `Se han analizado ${validatedData.length} filas del archivo CSV`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        } catch (err) {
          console.error('Error al procesar datos CSV:', err);
          setError(`Error al procesar los datos: ${err instanceof Error ? err.message : 'Error desconocido'}`);
          setIsProcessing(false);
        }
      },
      error: (err: Error) => {
        console.error('Error al parsear CSV:', err);
        setError(`Error al analizar el archivo CSV: ${err.message}`);
        setIsProcessing(false);
      }
    });
  };

  /**
   * Procesa un archivo Excel a través de la librería XLSX
   * @param file Archivo Excel a procesar
   */
  const processExcel = (file: File) => {
    setIsProcessing(true);
    setError('');

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error('No se pudieron leer los datos del archivo');
        }
        
        // Procesar el archivo Excel
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0]; // Tomamos la primera hoja
        const worksheet = workbook.Sheets[sheetName];
        
        // Convertir a JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        console.log('Datos Excel convertidos a JSON:', jsonData);
        
        // Validar cada fila
        const validatedData = jsonData.map((row: any, index: number) => 
          validateCopyData(row, index)
        );
        
        setImportedData(validatedData);
        setIsProcessing(false);
        
        // Notificamos al usuario
        toast({
          title: 'Archivo procesado',
          description: `Se han analizado ${validatedData.length} filas del archivo Excel`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } catch (err) {
        console.error('Error al procesar Excel:', err);
        setError(`Error al procesar el archivo Excel: ${err instanceof Error ? err.message : 'Error desconocido'}`);
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setError('Error al leer el archivo');
      setIsProcessing(false);
    };

    reader.readAsBinaryString(file);
  };

  /**
   * Maneja el cambio en el input de archivo
   * @param e Evento de cambio del input
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    setImportedData([]);
    setError('');
    
    // Determinar el tipo de archivo y procesarlo adecuadamente
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'csv') {
      processCSV(file);
    } else if (['xlsx', 'xls'].includes(fileExtension || '')) {
      processExcel(file);
    } else {
      setError('Formato de archivo no soportado. Por favor, sube un archivo CSV o Excel (xlsx/xls)');
    }
  };

  /**
   * Verifica si hay datos que se van a sobrescribir y muestra un diálogo de confirmación
   */
  const checkForOverwrites = useCallback(() => {
    // Filtrar solo las filas válidas o con warnings
    const validData = importedData.filter(row => row.status !== 'error');
    
    if (validData.length === 0) {
      toast({
        title: 'No hay datos válidos para importar',
        description: 'Corrige los errores y vuelve a intentarlo',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    // Identificar los copys que sobrescribirán datos existentes
    const duplicates = validData.filter(row => 
      row.status === 'warning' && 
      row.errors?.some(error => error.includes('ya existe en el sistema'))
    );
    
    if (duplicates.length > 0) {
      // Guardar los duplicados y mostrar el diálogo de confirmación
      setDuplicatesToOverwrite(duplicates);
      onOpen();
    } else {
      // Si no hay duplicados, proceder directamente con la importación
      proceedWithImport(validData);
    }
  }, [importedData, onOpen, toast]);

  /**
   * Procede con la importación después de la confirmación o si no hay duplicados
   */
  const proceedWithImport = useCallback((validData: ImportedCopyData[]) => {
    // Convertir a formato Copy (sin id ni status que se generan al guardar)
    const copysToImport = validData.map(row => ({
      slug: row.slug || '',
      text: row.text || (row.slug ? `[${row.slug}]` : ''), // Si no hay texto, usamos el slug entre corchetes
      language: row.language
    }));
    
    // Enviar al componente padre para procesamiento
    onImportComplete(copysToImport);
    
    // Limpiar el formulario
    setSelectedFile(null);
    setImportedData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setDuplicatesToOverwrite([]);
    
    // Cerrar el modal si estaba abierto
    onClose();
    
    // Notificar al usuario
    toast({
      title: 'Importación completada',
      description: `Se han importado ${copysToImport.length} copys correctamente`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  }, [onImportComplete, toast, onClose]);
  
  /**
   * Completa el proceso de importación y envía los datos validados
   */
  const handleCompleteImport = useCallback(() => {
    checkForOverwrites();
  }, [checkForOverwrites]);

  /**
   * Cancela el proceso de importación y limpia el formulario
   */
  const handleCancel = () => {
    setSelectedFile(null);
    setImportedData([]);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="md" bg="white">
      <VStack spacing={4} align="stretch">
        <Heading size="md">Importación masiva de copys</Heading>
        
        <Text>
          Sube un archivo CSV o Excel con las siguientes columnas: <strong>slug</strong>, <strong>text</strong> y <strong>language</strong>.
          Al menos una de las dos primeras debe tener valor.
        </Text>
        
        <FormControl isInvalid={!!error}>
          <FormLabel>Selecciona un archivo</FormLabel>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ width: '100%' }}
          />
          {error && <FormErrorMessage>{error}</FormErrorMessage>}
        </FormControl>
        
        {isProcessing && (
          <Box>
            <Text mb={2}>Procesando archivo...</Text>
            <Progress isIndeterminate colorScheme="blue" />
          </Box>
        )}
        
        {importedData.length > 0 && (
          <Box>
            <Heading size="sm" mb={2}>Vista previa de datos</Heading>
            
            <HStack spacing={4} mb={4}>
              <Badge colorScheme="green">{validRows} válidos</Badge>
              <Badge colorScheme="yellow">{warningRows} advertencias</Badge>
              <Badge colorScheme="red">{errorRows} errores</Badge>
            </HStack>
            
            {errorRows > 0 && (
              <Alert status="warning" mb={4}>
                <AlertIcon />
                <AlertTitle>Hay filas con errores</AlertTitle>
                <AlertDescription>
                  Algunas filas tienen errores y no se importarán. Puedes corregir el archivo y subirlo nuevamente.
                </AlertDescription>
              </Alert>
            )}
            
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Fila</Th>
                    <Th>Slug</Th>
                    <Th>Texto</Th>
                    <Th>Idioma</Th>
                    <Th>Estado</Th>
                    <Th>Errores</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {importedData.map((item, index) => (
                    <Tr 
                      key={index}
                      bg={
                        item.status === 'error' 
                          ? 'red.50' 
                          : item.status === 'warning' 
                            ? 'yellow.50' 
                            : 'white'
                      }
                    >
                      <Td>{item.row}</Td>
                      <Td>{item.slug || '-'}</Td>
                      <Td>{item.text || '-'}</Td>
                      <Td>{item.language}</Td>
                      <Td>
                        <Badge
                          colorScheme={
                            item.status === 'error' 
                              ? 'red' 
                              : item.status === 'warning' 
                                ? 'yellow' 
                                : 'green'
                          }
                        >
                          {item.status === 'error' 
                            ? 'Error' 
                            : item.status === 'warning' 
                              ? 'Advertencia' 
                              : 'Válido'}
                        </Badge>
                      </Td>
                      <Td>{item.errors?.join(', ') || '-'}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
            
            <Flex mt={4} justifyContent="flex-end">
              <Button 
                colorScheme="red" 
                variant="outline" 
                mr={3} 
                onClick={handleCancel}
              >
                Cancelar
              </Button>
              <Button 
                colorScheme="blue" 
                onClick={handleCompleteImport}
                isDisabled={importedData.length === 0 || importedData.every(item => item.status === 'error')}
              >
                Importar {validRows + warningRows} copys
              </Button>
            </Flex>
          </Box>
        )}
      </VStack>
      
      {/* Modal de confirmación para sobrescribir datos */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirmación: Sobrescribir datos existentes</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status="warning" mb={4}>
              <AlertIcon />
              <Box>
                <AlertTitle>Se detectaron copys duplicados</AlertTitle>
                <AlertDescription>
                  Los siguientes {duplicatesToOverwrite.length} copys ya existen en el sistema y serán sobrescritos.
                  ¿Estás seguro de que deseas continuar?
                </AlertDescription>
              </Box>
            </Alert>
            
            {duplicatesToOverwrite.length > 0 && (
              <Box overflowX="auto" maxHeight="300px" overflowY="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Slug</Th>
                      <Th>Texto</Th>
                      <Th>Idioma</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {duplicatesToOverwrite.map((item, index) => (
                      <Tr key={index} bg="yellow.50">
                        <Td>{item.slug || '-'}</Td>
                        <Td>{item.text || '-'}</Td>
                        <Td>{item.language}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              colorScheme="yellow" 
              onClick={() => proceedWithImport(importedData.filter(row => row.status !== 'error'))}
            >
              Sí, sobrescribir y continuar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
