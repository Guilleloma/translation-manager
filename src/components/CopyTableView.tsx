import React, { useState, useMemo, useEffect } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Text,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Flex,
  Tooltip,
  VStack,
  HStack,
  Select,
  Checkbox,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import { Copy } from '../types/copy';
import { BulkImportForm } from './BulkImportForm';
import { useUser } from '../context/UserContext';

interface CopyTableViewProps {
  copys: Copy[];
  onEdit: (copy: Copy) => void;
  onDelete: (id: string) => void;
  onSave?: (copy: Omit<Copy, 'id' | 'status'>) => void;
  languages?: string[];
  onViewHistory?: (copy: Copy) => void;
}

type GroupedCopy = {
  slug: string;
  translations: {
    [language: string]: Copy | null;
  };
  key?: string; // Clave única para forzar re-render
};

export const CopyTableView: React.FC<CopyTableViewProps> = ({ 
  copys, 
  onEdit, 
  onDelete,
  onSave,
  onViewHistory,
  languages = ['es', 'en', 'fr', 'it', 'de', 'pt', 'pt-br'] // Incluir todos los idiomas soportados por defecto
}) => {
  const { isAuthenticated } = useUser(); // Obtener el estado de autenticación
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure(); // Para el modal de confirmación
  const [copyToDelete, setCopyToDelete] = useState<Copy | null>(null); // Para almacenar el copy que se va a eliminar
  const [slugToDelete, setSlugToDelete] = useState<string>(''); // Para almacenar el slug que se va a eliminar (todas las traducciones)
  const [showLanguages, setShowLanguages] = useState<string[]>(languages);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  
  // Este efecto es muy importante para debugging - no borrar
  useEffect(() => {
    console.group('💼 CopyTableView: MONTADO o ACTUALIZADO');
    console.log(`ℹ️ Recibidos ${copys.length} copys y ${languages.length} idiomas`);
    
    // Analizar en detalle los copys recibidos
    console.log('📝 DETALLE DE COPYS RECIBIDOS:');
    const byLanguage: Record<string, Array<{id: string, slug: string, text: string}>> = {};
    
    languages.forEach(lang => {
      byLanguage[lang] = [];
    });
    
    // Agrupar copys por idioma para mejor visualización
    copys.forEach(copy => {
      if (byLanguage[copy.language]) {
        // Verificar que copy.text existe antes de usar substring
        const textPreview = copy.text 
          ? copy.text.substring(0, 20) + (copy.text.length > 20 ? '...' : '')
          : '[sin texto]';
          
        byLanguage[copy.language].push({
          id: copy.id,
          slug: copy.slug,
          text: textPreview
        });
      }
    });
    
    // Mostrar resumen por idioma
    Object.keys(byLanguage).forEach(lang => {
      console.log(`  - ${lang.toUpperCase()}: ${byLanguage[lang].length} copys`);
      byLanguage[lang].forEach((copy, idx) => {
        console.log(`      [${idx+1}] ${copy.slug}: "${copy.text}"`);
      });
    });
    
    console.groupEnd();
  }, [copys, languages]);
  
  // Agregar un efecto para registrar cambios en showLanguages
  useEffect(() => {
    console.log('🌐 IDIOMAS MOSTRADOS:', showLanguages);
  }, [showLanguages]);
  
  // Creamos una key para cada copy basada en sus datos, para detectar cambios reales
  const getCopyKey = (copy: Copy) => {
    // Verificar que copy.text existe antes de usar substring
    const textPreview = copy.text ? copy.text.substring(0, 10) : '';
    return `${copy.id}-${copy.slug}-${copy.language}-${textPreview}`;
  };
  
  // Agrupar copys por slug - Implementación completamente rediseñada para evitar bugs
  // Se calcula desde cero en cada render para garantizar que refleje el estado actual
  const groupedCopys = useMemo(() => {
    console.log('==== Recalculando groupedCopys ====');
    console.log(`Tenemos ${copys.length} copys y ${languages.length} idiomas`);
    
    // Analizar estados de copys para debugging
    const statusCount = { not_assigned: 0, assigned: 0, translated: 0 };
    const languageCount = {};
    
    copys.forEach(copy => {
      // Contar por estado
      statusCount[copy.status] = (statusCount[copy.status] || 0) + 1;
      
      // Contar por idioma
      languageCount[copy.language] = (languageCount[copy.language] || 0) + 1;
    });
    
    console.log('📊 Distribución de copys por estado:', statusCount);
    console.log('🌐 Distribución de copys por idioma:', languageCount);
    
    // Step 1: Crear una nueva tabla vacía para evitar referencias antiguas
    const groupedTable: { [slug: string]: GroupedCopy } = {};
    
    // Step 2: Recopilar todos los slugs únicos primero
    const uniqueSlugs = Array.from(new Set(copys.map(copy => copy.slug)));
    console.log(`Encontrados ${uniqueSlugs.length} slugs únicos`);
    
    // Step 3: Para cada slug, crear una entrada en la tabla y rellenarla
    uniqueSlugs.forEach(slug => {
      console.log(`Procesando slug: ${slug}`);
      
      // Inicializar el grupo con el slug y traducciones vacías
      groupedTable[slug] = {
        slug,
        translations: {},
        key: Date.now().toString() + Math.random().toString(36).substring(2, 9) // Clave única para forzar re-render
      };
      
      // Inicializar todos los idiomas como null
      languages.forEach(lang => {
        groupedTable[slug].translations[lang] = null;
      });
    });
    
    // Step 4: Rellenar la tabla con los datos de cada copy
    copys.forEach(copy => {
      if (groupedTable[copy.slug]) {
        // Asignar el copy al slot correspondiente por idioma
        groupedTable[copy.slug].translations[copy.language] = copy;
        
        // Verificar que copy.text existe antes de usar substring
        const textPreview = copy.text 
          ? `"${copy.text.substring(0, 15)}${copy.text.length > 15 ? '...' : ''}"`
          : '[sin texto]';
          
        console.log(`✅ Asignado correctamente: ${copy.slug} [${copy.language}] = ${textPreview}`);
 
      } else {
        console.error(`❌ Error: No se encontró el slug "${copy.slug}" en la tabla agrupada`);
      }
    });
    
    // Step 5: Convertir la tabla a un array para renderizado
    const resultArray = Object.values(groupedTable);
    console.log(`Resultado final: ${resultArray.length} grupos creados correctamente`);
    
    // Validación final - imprimimos un resumen de cada grupo
    resultArray.forEach(group => {
      const filledLanguages = Object.keys(group.translations).filter(lang => group.translations[lang] !== null);
      console.log(`Grupo ${group.slug}: Tiene traducciones en ${filledLanguages.join(', ')}`);
    });
    
    return resultArray;
  }, [copys, languages]); // Dependencias exactas - solo recalcular cuando estos props cambien
  
  const toggleLanguage = (language: string) => {
    setShowLanguages(prev => 
      prev.includes(language) 
        ? prev.filter(lang => lang !== language)
        : [...prev, language]
    );
  };
  
  // Para ordenar los idiomas, 'es' y 'en' primero, luego el resto alfabéticamente
  const sortedLanguages = useMemo(() => {
    // Obtener todos los idiomas únicos de los copys
    const uniqueLanguages = new Set<string>();
    
    // Agregar los idiomas predeterminados
    languages.forEach(lang => uniqueLanguages.add(lang));
    
    // Agregar los idiomas de los copys
    copys.forEach(copy => {
      if (copy.language) {
        uniqueLanguages.add(copy.language);
      }
    });
    
    // Convertir a array y ordenar
    return Array.from(uniqueLanguages).sort((a, b) => {
      if (a === 'es') return -1;
      if (b === 'es') return 1;
      if (a === 'en') return -1;
      if (b === 'en') return 1;
      return a.localeCompare(b);
    });
  }, [languages, copys]);
  
  return (
    <>
    <Box overflowX="auto">
      <VStack spacing={4} align="stretch" mb={4}>
        <Flex justify="space-between" align="center" mb={4}>
          <Text fontSize="lg" fontWeight="bold">
            Vista de tabla por idiomas
          </Text>
          {/* Botón de importación masiva eliminado */}
          <Box data-testid="bulk-import-button" style={{ display: 'none' }} onClick={onOpen}></Box>
        </Flex>
        
        <HStack spacing={2} flexWrap="wrap">
          <Text fontSize="sm">Mostrar idiomas:</Text>
          {sortedLanguages.map(lang => (
            <Checkbox 
              key={lang} 
              isChecked={showLanguages.includes(lang)}
              onChange={() => toggleLanguage(lang)}
            >
              {lang === 'es' ? 'Español' : 
               lang === 'en' ? 'Inglés' : 
               lang === 'pt' ? 'Portugués' :
               lang === 'fr' ? 'Francés' :
               lang === 'it' ? 'Italiano' :
               lang === 'de' ? 'Alemán' :
               lang}
            </Checkbox>
          ))}
        </HStack>
      </VStack>
      
      <Table variant="simple" size="sm">
        <Thead>
          <Tr bg="gray.50">
            <Th>Slug</Th>
            {sortedLanguages
              .filter(lang => showLanguages.includes(lang))
              .map(lang => (
                <Th key={lang}>
                  {lang === 'es' ? 'Español' : 
                   lang === 'en' ? 'Inglés' : 
                   lang === 'pt' ? 'Portugués' :
                   lang === 'fr' ? 'Francés' :
                   lang === 'it' ? 'Italiano' :
                   lang === 'de' ? 'Alemán' :
                   lang}
                </Th>
              ))}
            <Th width="100px">Acciones</Th>
          </Tr>
        </Thead>
        <Tbody>
          {groupedCopys.length === 0 ? (
            <Tr>
              <Td colSpan={showLanguages.length + 2} textAlign="center" py={4}>
                No hay copys para mostrar
              </Td>
            </Tr>
          ) : (
            groupedCopys.map(group => (
              <Tr key={group.slug}>
                <Td fontWeight="medium">
                  {/* Detectar colisión de slug raíz y prefijo */}
                  {(() => {
                    // Buscar si existe algún otro slug que empiece por este slug + '.' (ej: 'button' y 'button.crear')
                    const hasPrefix = groupedCopys.some(other =>
                      other.slug !== group.slug &&
                      (other.slug.startsWith(group.slug + '.') || group.slug.startsWith(other.slug + '.'))
                    );
                    if (hasPrefix) {
                      console.log(`⚠️ Slug ${group.slug} puede causar conflictos al exportar a JSON i18n porque existe como clave raíz y como prefijo de otros slugs.`);
                      return (
                        <HStack spacing={1} align="center">
                          <span>{group.slug}</span>
                          <Tooltip label="Este slug puede causar conflictos al exportar a JSON i18n porque existe como clave raíz y como prefijo de otros slugs. Revisa la exportación para evitar sobrescribir valores.">
                            <span style={{ color: '#E9B824', cursor: 'pointer' }}>
                              ⚠️
                            </span>
                          </Tooltip>
                        </HStack>
                      );
                    }
                    return group.slug;
                  })()}
                </Td>
                
                {sortedLanguages
                  .filter(lang => showLanguages.includes(lang))
                  .map(lang => {
                    const copy = group.translations[lang];
                    return (
                      <Td key={lang}>
                        {copy ? (
                          <Box>
                            <Text>{copy.text}</Text>
                            <Badge 
                              size="sm" 
                              colorScheme={getStatusColor(copy.status)}
                              mt={1}
                            >
                              {copy.status}
                            </Badge>
                          </Box>
                        ) : (
                          <Text color="gray.400" fontSize="sm" fontStyle="italic">
                            No traducido
                          </Text>
                        )}
                      </Td>
                    );
                  })}
                
                <Td>
                  <HStack spacing={1}>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        aria-label="Acciones"
                        icon={<span>⚙️</span>}
                        variant="ghost"
                        size="sm"
                      />
                      <MenuList>
                        {sortedLanguages.map(lang => {
                          const copy = group.translations[lang];
                          return copy ? (
                            <MenuItem 
                              key={lang}
                              onClick={() => isAuthenticated ? onEdit(copy) : null}
                              icon={<span>✏️</span>}
                              isDisabled={!isAuthenticated}
                            >
                              Editar ({lang})
                              {!isAuthenticated && (
                                <Tooltip label="Debe iniciar sesión para editar" placement="right">
                                  <span style={{ marginLeft: '5px' }}>ℹ️</span>
                                </Tooltip>
                              )}
                            </MenuItem>
                          ) : (
                            <MenuItem 
                              key={lang}
                              icon={<span>➕</span>}
                              // Crear nuevo copy con este slug e idioma
                              isDisabled={!isAuthenticated}
                              onClick={() => {
                                if (isAuthenticated) {
                                  console.log(`🔴 Iniciando creación de nuevo copy para slug "${group.slug}" en idioma "${lang}"`);
                                  // Añadimos una marca temporal para evitar que se pierda entre otros copys
                                  onEdit({
                                    id: '', // vacío para que se cree uno nuevo
                                    slug: group.slug,
                                    text: '',
                                    language: lang,
                                    status: 'not_assigned'
                                  });
                                }
                              }}
                            >
                              Crear en {lang}
                              {!isAuthenticated && (
                                <Tooltip label="Debe iniciar sesión para crear traducciones" placement="right">
                                  <span style={{ marginLeft: '5px' }}>ℹ️</span>
                                </Tooltip>
                              )}
                            </MenuItem>
                          );
                        })}
                        {/* Opción para ver el historial si hay alguna traducción con historial */}
                        {onViewHistory && Object.values(group.translations).some(copy => 
                          copy && copy.history && copy.history.length > 0
                        ) && (
                          <MenuItem 
                            icon={<span>📋</span>}
                            onClick={() => {
                              // Buscar la primera traducción con historial
                              const copyWithHistory = Object.values(group.translations).find(
                                copy => copy && copy.history && copy.history.length > 0
                              );
                              if (copyWithHistory) {
                                onViewHistory(copyWithHistory);
                              }
                            }}
                          >
                            Ver historial de cambios
                          </MenuItem>
                        )}
                        
                        <MenuItem 
                          icon={<span>🗑️</span>}
                          color="red.500"
                          isDisabled={!isAuthenticated}
                          onClick={() => {
                            if (isAuthenticated) {
                              // Guardar el slug y abrir el modal de confirmación
                              setSlugToDelete(group.slug);
                              onDeleteModalOpen();
                            }
                          }}
                        >
                          Eliminar todas las traducciones
                          {!isAuthenticated && (
                            <Tooltip label="Debe iniciar sesión para realizar esta acción" placement="right">
                              <span style={{ marginLeft: '5px' }}>ℹ️</span>
                            </Tooltip>
                          )}
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </HStack>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
      
      <Text mt={2} fontSize="sm" color="gray.600">
        {`${groupedCopys.length} slugs únicos (${copys.length} traducciones totales)`}
      </Text>
    </Box>

    {/* Modal para importación masiva */}
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Importación masiva de copys</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <BulkImportForm 
            existingCopys={copys}
            onImportComplete={(newCopys) => {
              // Procesar las importaciones
              const processImport = async () => {
                try {
                  console.log(`Iniciando importación masiva de ${newCopys.length} traducciones...`);
                  
                  // Mostrar indicador de progreso
                  toast({
                    title: 'Iniciando importación',
                    description: `Procesando ${newCopys.length} traducciones...`,
                    status: 'info',
                    duration: 3000,
                    isClosable: true,
                  });
                  
                  // Estadísticas para el resumen
                  let importedCount = 0;
                  const importedSlugs = new Set<string>();
                  const slugGroups: Record<string, {count: number, languages: string[]}> = {};
                  
                  // Procesar en lotes para mejorar el rendimiento
                  const BATCH_SIZE = 100; // Procesar 100 elementos a la vez
                  const totalBatches = Math.ceil(newCopys.length / BATCH_SIZE);
                  
                  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
                    const startIndex = batchIndex * BATCH_SIZE;
                    const endIndex = Math.min(startIndex + BATCH_SIZE, newCopys.length);
                    const batch = newCopys.slice(startIndex, endIndex);
                    
                    console.log(`Procesando lote ${batchIndex + 1}/${totalBatches} (${batch.length} elementos)`);
                    
                    // Mostrar progreso cada 5 lotes
                    if (batchIndex % 5 === 0) {
                      toast({
                        title: `Progreso: ${Math.round((batchIndex / totalBatches) * 100)}%`,
                        description: `Procesando lote ${batchIndex + 1} de ${totalBatches}`,
                        status: 'info',
                        duration: 1000,
                        isClosable: true,
                      });
                    }
                    
                    // Procesar cada elemento del lote
                    batch.forEach((newCopy) => {
                      // Estadísticas para el resumen
                      if (!slugGroups[newCopy.slug]) {
                        slugGroups[newCopy.slug] = {count: 0, languages: []};
                      }
                      slugGroups[newCopy.slug].count++;
                      slugGroups[newCopy.slug].languages.push(newCopy.language);
                      
                      // Añadimos la propiedad isBulkImport para que handleSave no muestre notificaciones individuales
                      onSave({...newCopy, isBulkImport: true});
                      importedCount++;
                      importedSlugs.add(newCopy.slug);
                    });
                    
                    // Pequeña pausa entre lotes para no bloquear la UI
                    if (batchIndex < totalBatches - 1) {
                      await new Promise(resolve => setTimeout(resolve, 5));
                    }
                  }
                  
                  // Actualizar localStorage al final de todo el proceso
                  setTimeout(() => {
                    const currentCopys = JSON.parse(localStorage.getItem('copys') || '[]');
                    console.log(`Actualizando localStorage con ${currentCopys.length} copys totales`);
                    localStorage.setItem('copys', JSON.stringify(currentCopys));
                  }, 100);
                  
                  // Mostrar resumen de la importación para debugging
                  console.log(`Resumen de importación:`);
                  console.log(`- Total de traducciones: ${importedCount}`);
                  console.log(`- Total de slugs únicos: ${importedSlugs.size}`);
                  Object.entries(slugGroups).forEach(([slug, data]) => {
                    console.log(`  - ${slug}: ${data.count} traducciones en ${data.languages.join(', ')}`);
                  });
                  
                  // Mostramos una única notificación al final del proceso
                  toast({
                    title: 'Importación masiva completada',
                    description: `Se han importado ${importedCount} traducciones (${importedSlugs.size} slugs) correctamente`,
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                  });
                  
                  // Cerrar el modal
                  onClose();
                } catch (error) {
                  console.error('Error durante la importación masiva:', error);
                  toast({
                    title: 'Error en la importación',
                    description: 'Ocurrió un error durante el proceso de importación masiva',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                  });
                }
              };
              
              // Ejecutar la función asíncrona
              processImport();
            }}
            onCancel={onClose}
          />
        </ModalBody>
      </ModalContent>
    </Modal>

    {/* Modal de confirmación para eliminar todas las traducciones */}
    <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color="red.500">
          <HStack>
            <span>⚠️</span>
            <Text>Confirmar eliminación</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="start" spacing={4}>
            <Text>Está a punto de eliminar <strong>todas las traducciones</strong> del slug:</Text>
            <Box p={3} bg="gray.100" borderRadius="md" width="100%">
              <Text fontWeight="bold">{slugToDelete}</Text>
            </Box>
            <Text color="red.500" fontWeight="semibold">Esta acción no se puede deshacer.</Text>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" mr={3} onClick={onDeleteModalClose}>
            Cancelar
          </Button>
          <Button 
            colorScheme="red" 
            onClick={() => {
              // Eliminar todas las traducciones del slug
              const groupToDelete = groupedCopys.find(g => g.slug === slugToDelete);
              if (groupToDelete) {
                Object.values(groupToDelete.translations)
                  .filter(Boolean)
                  .forEach(copy => copy && onDelete(copy.id));
              }
              onDeleteModalClose();
              toast({
                title: "Traducciones eliminadas",
                description: `Se han eliminado todas las traducciones del slug "${slugToDelete}"`,
                status: "success",
                duration: 3000,
                isClosable: true,
              });
            }}
          >
            Confirmar eliminación
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
    </>
  );
};

function getStatusColor(status: string) {
  switch (status) {
    case 'not_assigned': return 'yellow';
    case 'assigned': return 'blue';
    case 'translated': return 'green';
    default: return 'gray';
  }
}
