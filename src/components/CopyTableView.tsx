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
  Checkbox
} from '@chakra-ui/react';
import { Copy } from '../types/copy';

interface CopyTableViewProps {
  copys: Copy[];
  onEdit: (copy: Copy) => void;
  onDelete: (id: string) => void;
  languages?: string[];
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
  languages = ['es', 'en'] 
}) => {
  const [showLanguages, setShowLanguages] = useState<string[]>(languages);
  
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
        byLanguage[copy.language].push({
          id: copy.id,
          slug: copy.slug,
          text: copy.text.substring(0, 20) + (copy.text.length > 20 ? '...' : '')
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
  const getCopyKey = (copy: Copy) => `${copy.id}-${copy.slug}-${copy.language}-${copy.text.substring(0, 10)}`;
  
  // Agrupar copys por slug - Implementación completamente rediseñada para evitar bugs
  // Se calcula desde cero en cada render para garantizar que refleje el estado actual
  const groupedCopys = useMemo(() => {
    console.log('==== Recalculando groupedCopys ====');
    console.log(`Tenemos ${copys.length} copys y ${languages.length} idiomas`);
    
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
        console.log(`✅ Asignado correctamente: ${copy.slug} [${copy.language}] = "${copy.text.substring(0, 15)}${copy.text.length > 15 ? '...' : ''}"`); 
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
    return languages.sort((a, b) => {
      if (a === 'es') return -1;
      if (b === 'es') return 1;
      if (a === 'en') return -1;
      if (b === 'en') return 1;
      return a.localeCompare(b);
    });
  }, [languages]);
  
  return (
    <Box overflowX="auto">
      <VStack spacing={4} align="stretch" mb={4}>
        <Text fontSize="lg" fontWeight="bold">
          Vista de tabla por idiomas
        </Text>
        
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
                              onClick={() => onEdit(copy)}
                              icon={<span>✏️</span>}
                            >
                              Editar ({lang})
                            </MenuItem>
                          ) : (
                            <MenuItem 
                              key={lang}
                              icon={<span>➕</span>}
                              // Crear nuevo copy con este slug e idioma
                              onClick={() => {
                                console.log(`🔴 Iniciando creación de nuevo copy para slug "${group.slug}" en idioma "${lang}"`);
                                // Añadimos una marca temporal para evitar que se pierda entre otros copys
                                onEdit({
                                  id: '', // vacío para que se cree uno nuevo
                                  slug: group.slug,
                                  text: '',
                                  language: lang,
                                  status: 'pendiente'
                                });
                              }}
                            >
                              Crear en {lang}
                            </MenuItem>
                          );
                        })}
                        <MenuItem 
                          icon={<span>🗑️</span>}
                          color="red.500"
                          onClick={() => {
                            // Eliminar todas las traducciones de este slug
                            Object.values(group.translations)
                              .filter(Boolean)
                              .forEach(copy => copy && onDelete(copy.id));
                          }}
                        >
                          Eliminar todas las traducciones
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
  );
};

function getStatusColor(status: string) {
  switch (status) {
    case 'pendiente': return 'yellow';
    case 'traducido': return 'blue';
    case 'revisado': return 'purple';
    case 'aprobado': return 'green';
    default: return 'gray';
  }
}
