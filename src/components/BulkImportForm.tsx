import React, { useRef, useState, useCallback } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  VStack,
  Text,
  Heading,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Progress,
  HStack,
  CircularProgress,
  CircularProgressLabel
} from '@chakra-ui/react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Copy } from '../types/copy';

interface ImportedCopyData {
  key: string;
  translations: {
    [language: string]: string;
  };
  row: number;
  errors?: string[];
  status: 'valid' | 'warning' | 'error';
}

interface ProcessedCopy {
  slug: string;
  translations: {
    language: string;
    text: string;
  }[];
}

interface BulkImportFormProps {
  existingCopys: Copy[];
  onImportComplete: (newCopys: Copy[]) => void;
  onCancel: () => void;
}

/**
 * Componente de formulario para importación masiva de copys
 * 
 * Permite a los usuarios subir un archivo, validar su contenido y
 * agregar múltiples copys al sistema después de una validación.
 */
export const BulkImportForm: React.FC<BulkImportFormProps> = ({ existingCopys, onImportComplete, onCancel }) => {
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importedData, setImportedData] = useState<ImportedCopyData[]>([]);
  const [duplicatesToOverwrite, setDuplicatesToOverwrite] = useState<ImportedCopyData[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 50; // Número de elementos por página
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Estados para el progreso de importación
  const [validatedData, setValidatedData] = useState<ImportedCopyData[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [isImporting, setIsImporting] = useState(false);

  // Estadísticas de validación
  const validRows = importedData.filter(item => item.status === 'valid').length;
  const warningRows = importedData.filter(item => item.status === 'warning').length;
  const errorRows = importedData.filter(item => item.status === 'error').length;

  /**
   * Mapea los códigos de idioma del archivo al formato esperado por el sistema
   * @param languageCode Código de idioma del archivo
   * @returns Código de idioma normalizado
   */
  const mapLanguageCode = (languageCode: string): string => {
    // Convertir a minúsculas para comparación
    const code = languageCode.toLowerCase();
    
    // Mapa de códigos de idioma
    const languageMap: Record<string, string> = {
      // Español
      'es': 'es',
      'es_es': 'es',
      'spanish': 'es',
      'español': 'es',
      'esp': 'es',
      
      // Inglés
      'en': 'en',
      'en_gb': 'en',
      'en_us': 'en',
      'english': 'en',
      'ingles': 'en',
      'inglés': 'en',
      
      // Francés
      'fr': 'fr',
      'fr_fr': 'fr',
      'french': 'fr',
      'frances': 'fr',
      'francés': 'fr',
      
      // Italiano
      'it': 'it',
      'it_it': 'it',
      'italian': 'it',
      'italiano': 'it',
      
      // Alemán
      'de': 'de',
      'de_de': 'de',
      'german': 'de',
      'aleman': 'de',
      'alemán': 'de',
      
      // Portugués
      'pt': 'pt',
      'pt_pt': 'pt',
      'portuguese': 'pt',
      'portugues': 'pt',
      'portugués': 'pt',
      
      // Portugués de Brasil
      'pt_br': 'pt-br',
      'brazilian': 'pt-br',
      'brasil': 'pt-br',
      'brazilian_portuguese': 'pt-br'
    };
    
    // Devolver el código mapeado o el original si no hay mapeo
    return languageMap[code] || languageCode;
  };
  
  /**
   * Valida los datos de un copy importado
   * 
   * @param data Datos crudos de la fila importada
   * @param rowIndex Índice de la fila para referencia
   * @returns Objeto con datos validados y marcados con errores si corresponde
   */
  const validateCopyData = useCallback((data: any, rowIndex: number): ImportedCopyData => {
    const importedCopy: ImportedCopyData = {
      key: data.key?.trim() || '',
      translations: {},
      row: rowIndex + 1, // +1 para considerar el encabezado
      errors: [],
      status: 'valid'
    };

    // Procesar cada columna como un idioma (excepto la columna 'key')
    Object.entries(data).forEach(([columnName, value]) => {
      if (columnName.toLowerCase() !== 'key' && typeof value === 'string' && value.trim() !== '') {
        // Mapear el código de idioma al formato esperado por el sistema
        const normalizedLanguageCode = mapLanguageCode(columnName);
        importedCopy.translations[normalizedLanguageCode] = value.trim();
      }
    });

    // Validar que la key no esté vacía
    if (!importedCopy.key) {
      importedCopy.errors?.push('La key es obligatoria');
      importedCopy.status = 'error';
    }

    // Validar que haya al menos una traducción
    if (Object.keys(importedCopy.translations).length === 0) {
      importedCopy.errors?.push('Debe proporcionar al menos una traducción');
      importedCopy.status = 'error';
    }

    // Validar formato de la key - permitir más caracteres para ser más flexible
    if (importedCopy.key && !/^[a-zA-Z0-9._\-]+$/.test(importedCopy.key)) {
      importedCopy.errors?.push('La key solo puede contener letras, números, puntos, guiones y guiones bajos');
      // Solo advertencia, no error
      if (importedCopy.status !== 'error') {
        importedCopy.status = 'warning';
      }
    }

    // No validamos el formato del código de idioma para ser más flexibles
    // Esto permite importar desde diferentes formatos de archivo

    // Validar duplicados de slug dentro del mismo idioma
    if (importedCopy.key) {
      const duplicatesInImport = importedData
        .filter(item => item.key === importedCopy.key)
        .map(item => item.row);

      if (duplicatesInImport.length > 0) {
        importedCopy.errors?.push(`Key duplicada en las filas: ${duplicatesInImport.join(', ')}`);
        if (importedCopy.status !== 'error') {
          importedCopy.status = 'warning';
        }
      }
    }

    // Verificar duplicados - solo marcar como warning si la key ya existe
    const duplicateKey = existingCopys.find(copy => copy.slug === importedCopy.key);
    if (duplicateKey) {
      importedCopy.errors?.push('Esta key ya existe en el sistema');
      if (importedCopy.status !== 'error') {
        importedCopy.status = 'warning';
      }
    }

    return importedCopy;
  }, [existingCopys]);

  /**
   * Procesa un archivo CSV a través de PapaParse
   * 
   * @param file Archivo CSV a procesar
   */
  const processCSV = useCallback((file: File) => {
    setIsProcessing(true);
    setError('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<any>) => {
        if (results.errors.length > 0) {
          setError(`Error al procesar el archivo CSV: ${results.errors[0].message}`);
          setIsProcessing(false);
          return;
        }

        try {
          // Registrar datos para debugging
          console.log(`Archivo CSV procesado con ${results.data.length} filas`);
          
          // Validar que el CSV tenga la estructura correcta
          const headers = Object.keys(results.data[0] || {});
          console.log('Encabezados encontrados:', headers);
          
          // Ser más flexible con el formato - no requerir exactamente 'key'
          const keyColumn = headers.find(h => h.toLowerCase() === 'key');
          let processedData: ImportedCopyData[] = [];
          
          if (!keyColumn) {
            console.log('No se encontró columna "key", usando la primera columna como clave');
            // Intentar usar la primera columna como key si no hay una columna 'key'
            const firstRow = results.data[0] || {};
            const firstColumn = headers[0];
            
            if (firstColumn) {
              console.log(`Usando columna "${firstColumn}" como clave`);
              // Transformar los datos para usar la primera columna como 'key'
              const transformedData = results.data.map((row: any) => {
                const newRow: any = { key: row[firstColumn] };
                headers.forEach(h => {
                  if (h !== firstColumn) {
                    newRow[h] = row[h];
                  }
                });
                return newRow;
              });
              
              processedData = transformedData
                .filter((row: any) => Object.keys(row).length > 0) // Filtrar filas vacías
                .map((row: any, index: number) => validateCopyData(row, index));

              console.log(`Datos procesados: ${processedData.length} filas válidas`);
              setImportedData(processedData);
            } else {
              setError('El archivo CSV debe tener al menos una columna para usar como "key"');
              setIsProcessing(false);
              return;
            }
          } else {
            console.log(`Usando columna "${keyColumn}" como clave`);
            // Procesar normalmente si hay una columna 'key'
            processedData = results.data
              .filter(row => Object.keys(row).length > 0) // Filtrar filas vacías
              .map((row: any, index: number) => validateCopyData(row, index));

            console.log(`Datos procesados: ${processedData.length} filas válidas`);
            setImportedData(processedData);
          }
          
          // Agregar logs para depuración
          console.log('Datos procesados:', processedData);
          console.log('Número de filas procesadas:', processedData.length);
          
          // Mostrar notificación si hay errores
          const processedErrorRows = processedData.filter(row => row.status === 'error').length;
          if (processedErrorRows > 0) {
            toast({
              title: 'Advertencia',
              description: `Se encontraron ${processedErrorRows} filas con errores.`,
              status: 'warning',
              duration: 5000,
              isClosable: true,
            });
          }
          
          setIsProcessing(false);
        } catch (err) {
          console.error('Error al procesar datos CSV:', err);
          setError(`Error al procesar los datos: ${err instanceof Error ? err.message : 'Error desconocido'}`);
        } finally {
          setIsProcessing(false);
        }
      },
      error: (error) => {
        setError(`Error al procesar el archivo CSV: ${error.message}`);
        setIsProcessing(false);
      }
    });
  }, [validateCopyData, toast]);

  /**
   * Procesa un archivo Excel a través de la librería XLSX
   * 
   * @param file Archivo Excel a procesar
   */
  const processExcel = useCallback(async (file: File) => {
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
        
        if (workbook.SheetNames.length === 0) {
          throw new Error('El archivo Excel no contiene hojas');
        }
        
        const sheetName = workbook.SheetNames[0]; // Tomamos la primera hoja
        const worksheet = workbook.Sheets[sheetName];
        
        // Convertir a JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          throw new Error('El archivo Excel no contiene datos');
        }
        
        // Verificar si hay una columna 'key'
        const firstRow = jsonData[0] as Record<string, any>;
        const headers = Object.keys(firstRow);
        const keyColumn = headers.find(h => h.toLowerCase() === 'key');
        
        let processedData: ImportedCopyData[] = [];
        
        if (!keyColumn && headers.length > 0) {
          // Usar la primera columna como key
          const firstColumn = headers[0];
          
          // Transformar los datos para usar la primera columna como 'key'
          const transformedData = jsonData.map((row: any) => {
            const newRow: any = { key: row[firstColumn] };
            headers.forEach(h => {
              if (h !== firstColumn) {
                newRow[h] = row[h];
              }
            });
            return newRow;
          });
          
          processedData = transformedData
            .filter((row: any) => Object.keys(row).length > 0) // Filtrar filas vacías
            .map((row: any, index: number) => validateCopyData(row, index));
        } else {
          // Validar cada fila normalmente
          processedData = jsonData
            .filter((row: any) => Object.keys(row).length > 0) // Filtrar filas vacías
            .map((row: any, index: number) => validateCopyData(row, index));
        }
        
        // Agregar logs para depuración
        console.log('Datos Excel procesados:', processedData);
        console.log('Número de filas Excel procesadas:', processedData.length);
        
        setImportedData(processedData);
        
        // Mostrar notificación si hay errores
        const errorRows = processedData.filter(row => row.status === 'error').length;
        if (errorRows > 0) {
          toast({
            title: 'Advertencia',
            description: `Se encontraron ${errorRows} filas con errores.`,
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
        } else {
          // Notificamos al usuario del éxito
          toast({
            title: 'Archivo procesado',
            description: `Se han analizado ${processedData.length} filas del archivo Excel`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (err) {
        console.error('Error al procesar Excel:', err);
        setError(`Error al procesar el archivo Excel: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setError('Error al leer el archivo');
      setIsProcessing(false);
    };

    reader.readAsBinaryString(file);
  }, [validateCopyData, toast]);

  /**
   * Maneja el cambio de archivo seleccionado
   * 
   * @param event Evento de cambio del input de archivo
   */
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setImportedData([]);
    setError('');
    setCurrentPage(1); // Resetear a la primera página cuando se carga un nuevo archivo
    
    // Determinar el tipo de archivo y procesarlo adecuadamente
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'csv') {
      processCSV(file);
    } else if (['xlsx', 'xls'].includes(fileExtension || '')) {
      processExcel(file);
    } else {
      setError('Formato de archivo no soportado');
    }
  }, [processCSV, processExcel]);

  /**
   * Maneja la finalización del proceso de importación
   * Verifica duplicados y muestra confirmación si es necesario
   */
  const handleCompleteImport = useCallback((duplicates?: ImportedCopyData[]) => {
    console.log('handleCompleteImport - duplicates:', duplicates);
    console.log('handleCompleteImport - importedData:', importedData);
    
    // Asegurarnos de que tenemos un array válido para trabajar
    let validData: ImportedCopyData[] = [];
    
    // Si se proporcionan duplicados, usarlos
    if (Array.isArray(duplicates) && duplicates.length > 0) {
      console.log('Usando duplicados proporcionados:', duplicates.length);
      validData = duplicates;
    } 
    // De lo contrario, filtrar los datos válidos de importedData
    else if (Array.isArray(importedData) && importedData.length > 0) {
      console.log('Filtrando datos válidos de importedData');
      validData = importedData.filter(item => item.status !== 'error');
    } else {
      console.error('No hay datos válidos para importar');
      toast({
        title: 'Error',
        description: 'No hay datos válidos para importar.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    console.log(`Se encontraron ${validData.length} elementos válidos para importar`);
    
    // Si no hay duplicados proporcionados, verificar duplicados
    if (!duplicates) {
      const duplicatesToOverwrite = validData.filter(row =>
        Object.keys(row.translations).some(lang =>
          existingCopys.some((copy: Copy) => 
            copy.slug === row.key && copy.language === lang
          )
        )
      );

      if (duplicatesToOverwrite.length > 0) {
        console.log(`Se encontraron ${duplicatesToOverwrite.length} duplicados que necesitan confirmación`);
        setDuplicatesToOverwrite(duplicatesToOverwrite);
        onOpen();
        return;
      }
    }

    // Crear un array de objetos con el formato esperado por el sistema
    // Cada traducción debe ser un objeto independiente con slug, language y text
    const newCopys: Copy[] = [];
    
    // Iterar sobre cada item y extraer sus traducciones
    console.log('Procesando validData:', validData);
    validData.forEach(item => {
      if (!item || !item.translations) {
        console.warn('Item inválido encontrado:', item);
        return; // Saltar este item
      }
      
      // Registrar cada traducción para debugging
      console.log(`Procesando traducciones para slug: ${item.key}`);
      console.log(`Tiene ${Object.keys(item.translations).length} traducciones`);
      
      Object.entries(item.translations).forEach(([lang, text]) => {
        // Mapear el código de idioma al formato esperado por el sistema
        const normalizedLanguageCode = mapLanguageCode(lang);
        console.log(`  - Idioma: ${lang} -> ${normalizedLanguageCode}, Texto: ${text.substring(0, 20)}${text.length > 20 ? '...' : ''}`);
        
        newCopys.push({
          slug: item.key,
          language: normalizedLanguageCode,
          text: text
        });
      });
    });

    // Agregar logs para depuración
    console.log('Datos a importar:', newCopys);
    console.log('Número de traducciones:', newCopys.length);
    
    if (newCopys.length === 0) {
      toast({
        title: 'Advertencia',
        description: 'No hay traducciones válidas para importar.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Llamar a la función de importación proporcionada por el componente padre
    onImportComplete(newCopys);
    onCancel();

    // Mostrar mensaje de éxito
    toast({
      title: 'Importación exitosa',
      description: `Se han importado ${newCopys.length} traducciones correctamente.`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  }, [importedData, existingCopys, onOpen, setDuplicatesToOverwrite, onImportComplete, onCancel, toast]);

  return (
    <React.Fragment>
      <Box p={4} borderWidth="1px" borderRadius="md" bg="white">
        <VStack spacing={4} align="stretch">
          <Heading size="md">Importación masiva de copys</Heading>
          
          <Text>
            Sube un archivo CSV o Excel con las siguientes columnas: <strong>key</strong> y los códigos de idioma (ej: <strong>en_GB</strong>, <strong>es_ES</strong>, etc.).
            Cada fila debe tener una key y al menos una traducción.
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
          
          {isImporting && (
            <Box textAlign="center">
              <Text mb={4} fontSize="lg" fontWeight="bold">Importando traducciones...</Text>
              <CircularProgress 
                value={(importProgress.current / importProgress.total) * 100} 
                size="120px" 
                color="green.400"
                thickness="4px"
              >
                <CircularProgressLabel fontSize="sm">
                  {importProgress.current}/{importProgress.total}
                </CircularProgressLabel>
              </CircularProgress>
              <Text mt={2} fontSize="sm" color="gray.600">
                Procesando {importProgress.current} de {importProgress.total} traducciones
              </Text>
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
                {/* Agregar paginación para manejar grandes volúmenes de datos */}
                <Box mb={4}>
                  <Text fontSize="sm">Mostrando {Math.min(currentPage * itemsPerPage, importedData.length)} de {importedData.length} filas</Text>
                </Box>

                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Fila</Th>
                      <Th>Key</Th>
                      <Th>Traducciones</Th>
                      <Th>Estado</Th>
                      <Th>Errores</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {importedData
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((item: ImportedCopyData, index: number) => (
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
                        <Td>{item.key || '-'}</Td>
                        <Td>
                          <VStack align="start" spacing={1} maxH="100px" overflowY="auto">
                            {Object.entries(item.translations).map(([lang, text]) => (
                              <Text key={lang}>
                                <Badge mr={2} colorScheme="blue">{lang}</Badge>
                                {text}
                              </Text>
                            ))}
                          </VStack>
                        </Td>
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

                {/* Controles de paginación */}
                <Flex mt={4} justifyContent="center">
                  <Button
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    isDisabled={currentPage === 1}
                    mr={2}
                  >
                    Anterior
                  </Button>
                  <Text alignSelf="center" mx={2}>
                    Página {currentPage} de {Math.ceil(importedData.length / itemsPerPage)}
                  </Text>
                  <Button
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(importedData.length / itemsPerPage)))}
                    isDisabled={currentPage === Math.ceil(importedData.length / itemsPerPage)}
                    ml={2}
                  >
                    Siguiente
                  </Button>
                </Flex>
              </Box>
              
              <Flex mt={4} justifyContent="flex-end">
                <Button 
                  colorScheme="red" 
                  variant="outline" 
                  mr={3} 
                  onClick={onCancel}
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
      </Box>

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
                      <Th>Key</Th>
                      <Th>Traducciones</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {duplicatesToOverwrite.map((item, index) => (
                      <Tr key={index} bg="yellow.50">
                        <Td>{item.key}</Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            {Object.entries(item.translations).map(([lang, text]) => (
                              <Text key={lang}>
                                <Badge mr={2} colorScheme="blue">{lang}</Badge>
                                {text}
                              </Text>
                            ))}
                          </VStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button colorScheme="red" onClick={() => {
              console.log('Sobrescribiendo duplicados:', duplicatesToOverwrite);
              handleCompleteImport(duplicatesToOverwrite);
            }}>
              Sobrescribir
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </React.Fragment>
  );
};
