import React, { useState, useMemo } from 'react';
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
};

export const CopyTableView: React.FC<CopyTableViewProps> = ({ 
  copys, 
  onEdit, 
  onDelete,
  languages = ['es', 'en'] 
}) => {
  const [showLanguages, setShowLanguages] = useState<string[]>(languages);
  
  // Agrupar copys por slug
  const groupedCopys = useMemo(() => {
    const grouped: { [slug: string]: GroupedCopy } = {};
    
    // Inicializar con todos los slugs únicos
    const uniqueSlugs = [...new Set(copys.map(copy => copy.slug))];
    uniqueSlugs.forEach(slug => {
      grouped[slug] = {
        slug,
        translations: {}
      };
      
      // Inicializar todos los idiomas como null
      languages.forEach(lang => {
        grouped[slug].translations[lang] = null;
      });
    });
    
    // Rellenar con los copys disponibles
    copys.forEach(copy => {
      if (grouped[copy.slug]) {
        grouped[copy.slug].translations[copy.language] = copy;
      }
    });
    
    return Object.values(grouped);
  }, [copys, languages]);
  
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
                <Td fontWeight="medium">{group.slug}</Td>
                
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
                              onClick={() => onEdit({
                                id: '', // vacío para que se cree uno nuevo
                                slug: group.slug,
                                text: '',
                                language: lang,
                                status: 'pendiente'
                              })}
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
