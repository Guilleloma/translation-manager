"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useToast,
  Flex,
  Spacer,
  Select,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Divider,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  Tooltip,
  InputGroup,
  InputLeftElement,
  Stack
} from '@chakra-ui/react';
import { SearchIcon, AddIcon } from '@chakra-ui/icons';
import { useUser } from '../context/UserContext';
import { CopyForm } from '../components/CopyForm';
import { Copy, CopyInput, CopyStatus, UserRole, CopyHistory } from '../types/copy';
import { TranslationStatus } from '../components/status/TranslationStatus';
import HistoryModal from '../components/history/HistoryModal';
import { CopyTable } from '../components/CopyTable';
import { CopyTableView } from "../components/CopyTableView";
import { slugify } from "../utils/slugify";
import { downloadGoogleSheetsCSV } from "../utils/exportToGoogleSheets";

export default function Home() {
  const { currentUser } = useUser();
  // Estado principal de la aplicación
  const [copys, setCopys] = useState<Copy[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCopys, setFilteredCopys] = useState<Copy[]>([]);
  const [editingCopy, setEditingCopy] = useState<Copy | null>(null);
  const [exportLanguage, setExportLanguage] = useState("all");
  const [currentLanguage, setCurrentLanguage] = useState("es");  // Estados para filtros
  const [viewMode, setViewMode] = useState<"list" | "table">("list");  // Estados para filtros
  const [statusFilter, setStatusFilter] = useState<CopyStatus | "all">("all");
  const [tagFilter, setTagFilter] = useState<string | "all">("all");
  
  // Obtener las etiquetas disponibles de los copys existentes
  const availableTags = useMemo(() => {
    const tagsSet = new Set<string>();
    
    // Recorrer todos los copys y recopilar sus etiquetas
    copys.forEach(copy => {
      if (copy.tags && Array.isArray(copy.tags)) {
        copy.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    
    // Convertir el Set a un array y ordenarlo alfabéticamente
    return Array.from(tagsSet).sort();
  }, [copys]);
  const [updateTrigger, setUpdateTrigger] = useState(0); // Nuevo estado para forzar actualizaciones
  const toast = useToast();

  // Estados para los modales
  const { isOpen: isHistoryOpen, onOpen: onHistoryOpen, onClose: onHistoryClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  
  // Copy seleccionado para ver su historial
  const [selectedHistoryCopy, setSelectedHistoryCopy] = useState<Copy | null>(null);

  // Cargar copys desde localStorage cuando el componente se monta
  useEffect(() => {
    console.log('🔄 Cargando copys desde localStorage...');
    const storedCopys = localStorage.getItem('copys');
    if (storedCopys) {
      try {
        const parsedCopys = JSON.parse(storedCopys);
        console.log(`✅ Cargados ${parsedCopys.length} copys desde localStorage`);
        setCopys(parsedCopys);
      } catch (error) {
        console.error('Error al cargar copys:', error);
        toast({
          title: "Error al cargar datos",
          description: "No se pudieron cargar los copys almacenados",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      console.log('⚠️ No hay copys almacenados en localStorage');
    }
  }, [toast]);

  // DEBUG: Mostrar estado cuando cambia
  useEffect(() => {
    console.group('🔍 DEPURACIÓN: ESTADO ACTUAL DE COPYS');
    console.log(`Total: ${copys.length} copys`);
    
    // Crear un mapa para contar copys por slug
    const slugMap = new Map();
    
    copys.forEach(copy => {
      console.log(`ID: ${copy.id.substring(0, 8)}... | ${copy.slug} [${copy.language}] = "${copy.text}"`);
      
      // Contar copys por slug y por idioma
      const key = `${copy.slug}`;
      if (!slugMap.has(key)) {
        slugMap.set(key, new Set());
      }
      slugMap.get(key).add(copy.language);
    });
    
    // Resumen de slugs y sus idiomas
    console.log('📊 RESUMEN DE SLUGS:');
    slugMap.forEach((languages, slug) => {
      console.log(`  - ${slug}: disponible en ${Array.from(languages).join(', ')}`);
    });
    
    console.groupEnd();
  }, [copys]);
  
  // Filtrar copys según la búsqueda, estado y etiquetas
  useEffect(() => {
    console.log(`Aplicando filtros - Búsqueda: "${searchQuery}", Estado: ${statusFilter}, Etiqueta: ${tagFilter}`);
    
    // Aplicar filtros en secuencia: primero por texto, luego por estado, finalmente por etiqueta
    let filtered = [...copys];
    
    // Filtro por texto (búsqueda)
    if (searchQuery.trim() !== "") {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (copy) =>
          copy.slug.toLowerCase().includes(lowerQuery) ||
          copy.text.toLowerCase().includes(lowerQuery)
      );
      console.log(`Filtro de texto aplicado: ${filtered.length}/${copys.length} copys coinciden`);
    }
    
    // Filtro por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(copy => copy.status === statusFilter);
      console.log(`Filtro de estado aplicado: ${filtered.length}/${copys.length} copys con estado ${statusFilter}`);
    }
    
    // Filtro por etiqueta
    if (tagFilter !== "all") {
      filtered = filtered.filter(copy => 
        copy.tags && copy.tags.includes(tagFilter)
      );
      console.log(`Filtro de etiqueta aplicado: ${filtered.length}/${copys.length} copys con etiqueta ${tagFilter}`);
    }
    
    setFilteredCopys(filtered);
  }, [searchQuery, statusFilter, tagFilter, copys, updateTrigger]); // Añadido tagFilter a las dependencias

  // Manejar cambios de estado de las traducciones
  const handleStatusChange = useCallback((copyId: string, newStatus: CopyStatus, historyEntry?: CopyHistory) => {
    console.group('🔄 CAMBIO DE ESTADO');
    console.log(`Copy ID: ${copyId}`);
    console.log(`Nuevo estado: ${newStatus}`);
    console.log('Entrada de historial:', historyEntry);
    
    setCopys(prevCopys => {
      const copyIndex = prevCopys.findIndex(c => c.id === copyId);
      
      if (copyIndex === -1) {
        console.error(`No se encontró el copy con ID: ${copyId}`);
        return prevCopys;
      }
      
      const updatedCopys = [...prevCopys];
      const copyToUpdate = { ...updatedCopys[copyIndex] };
      
      // Actualizar el estado del copy
      copyToUpdate.status = newStatus;
      copyToUpdate.updatedAt = new Date();
      
      // Actualizar fechas según el estado
      const now = new Date();
      if (newStatus === 'assigned') {
        copyToUpdate.assignedAt = now;
      } else if (newStatus === 'translated') {
        copyToUpdate.completedAt = now;
      } else if (newStatus === 'reviewed') {
        copyToUpdate.reviewedAt = now;
        copyToUpdate.reviewedBy = currentUser?.id;
      } else if (newStatus === 'approved') {
        copyToUpdate.approvedAt = now;
        copyToUpdate.approvedBy = currentUser?.id;
      }
      
      // Agregar al historial si se proporciona
      if (historyEntry) {
        copyToUpdate.history = [
          ...(copyToUpdate.history || []),
          historyEntry
        ];
      }
      
      updatedCopys[copyIndex] = copyToUpdate;
      
      console.log('✅ Estado actualizado exitosamente');
      console.groupEnd();
      
      return updatedCopys;
    });
  }, [currentUser?.id]);
  
  // Manejar la creación o actualización de copys
  /**
   * Maneja la creación o actualización de un copy en el sistema
   * @param data - Datos del copy (slug, texto, idioma)
   * @param isEdit - Indica si es una edición (true) o creación (false)
   * @param suppressNotification - Si es true, no muestra notificaciones (usado en importaciones masivas)
   */
  const handleSave = useCallback((data: CopyInput, isEdit = false) => {
    // Verificamos si es parte de una importación masiva para suprimir notificaciones
    const isBulkImport = data.isBulkImport === true;
    console.group('💾 GUARDAR COPY');
    console.log('📡 Datos a guardar:', data);
    console.log('🔄 Modo:', isEdit ? 'EDICIÓN' : 'CREACIÓN');
    
    // === MODO EDICIÓN ===
    // Si viene de "Crear en [idioma]", tendrá id vacío, así que lo tratamos como una creación
    // aunque isEdit sea true
    if (isEdit && editingCopy && editingCopy.id) {
      console.group('📝 EDICIÓN DE COPY');
      console.log('🔥 Copy original:', JSON.stringify(editingCopy));
      
      // Creamos un nuevo objeto con los datos actualizados (inmutabilidad)
      // Solo actualizamos los campos que han cambiado
      const updatedCopy: Copy = {
        ...editingCopy,  // Mantenemos ID y otras propiedades existentes
        slug: data.slug || editingCopy.slug, // Mantener el slug existente si no se proporciona uno nuevo
        text: data.text || editingCopy.text, // Mantener el texto existente si no se proporciona uno nuevo
        language: data.language,
        updatedAt: new Date() // Actualizar la fecha de modificación
      };
      
      console.log('🔺 Copy con cambios:', JSON.stringify(updatedCopy));
      console.log('⚙️ Diferencias detectadas:');
      
      // Mostrar cambios para depuración
      if (editingCopy.slug !== updatedCopy.slug) console.log(`  - Slug: "${editingCopy.slug}" ➡️ "${updatedCopy.slug}"`);
      if (editingCopy.text !== updatedCopy.text) console.log(`  - Texto: "${editingCopy.text}" ➡️ "${updatedCopy.text}"`);
      if (editingCopy.language !== updatedCopy.language) console.log(`  - Idioma: "${editingCopy.language}" ➡️ "${updatedCopy.language}"`);
      
      // IMPORTANTE: Log para verificar exactamente qué hay en el estado antes de actualizar
      console.log('📄 Estado actual:', copys.length, 'copys');
      const existingCopy = copys.find(c => c.id === editingCopy.id);
      console.log('🔎 Copy actual en estado:', existingCopy ? JSON.stringify(existingCopy) : 'No encontrado');
      
      // Actualizamos el estado de forma inmutable
      setCopys(prevCopys => {
        // Verificar si estamos editando un copy existente
        const exists = prevCopys.some(c => c.id === editingCopy.id);
        console.log(`🔍 Verificación: Copy ${exists ? 'encontrado' : 'NO encontrado'} en el estado (ID: ${editingCopy.id})`);
        
        // Si no existe en el estado actual, lo agregamos como nuevo
        if (!exists) {
          console.log('⚠️ ADVERTENCIA: El copy no existe en el estado, lo agregamos como nuevo');
          return [...prevCopys, updatedCopy];
        }
        
        // Si existe, actualizamos
        const newCopys = prevCopys.map(c => {
          if (c.id === editingCopy.id) {
            console.log(`✅ Reemplazando copy (ID: ${c.id.substring(0, 8)}...)`);
            return updatedCopy;
          }
          return c;
        });
        
        console.log(`📊 Resultado: ${newCopys.length} copys en el nuevo estado`);
        return newCopys;
      });
      
      console.groupEnd(); // Fin del grupo EDICIÓN
            // Para forzar una actualización de cualquier componente que dependa de copys
      setTimeout(() => {
        console.log('🔁 Forzando actualización de componentes (updateTrigger)');
        setUpdateTrigger(prev => prev + 1);
      }, 50);
      
      // Limpiar el estado de edición
      setEditingCopy(null);
      
      // Solo mostrar notificación si no es una importación masiva
      if (!isBulkImport) {
        // Construir descripción para la notificación
        const updateDescriptionParts = [];
        if (data.slug) updateDescriptionParts.push(`Slug: ${data.slug}`);
        if (data.text) {
          const textPreview = data.text.length > 20 
            ? `${data.text.substring(0, 20)}...` 
            : data.text;
          updateDescriptionParts.push(`Texto: "${textPreview}"`);
        }
        
        toast({
          title: `Copy actualizado en ${data.language === 'es' ? 'español' : data.language === 'en' ? 'inglés' : data.language}`,
          description: updateDescriptionParts.length > 0 
            ? updateDescriptionParts.join(' | ')
            : 'Sin detalles adicionales',
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      // === MODO CREACIÓN ===
      console.group('✨ CREACIÓN DE NUEVO COPY');
      
      // VERIFICACIÓN PREVIA
      console.log('🔍 Verificando datos...');
      
      // Validar que al menos uno de los dos campos esté presente
      if (!data.text?.trim() && !data.slug?.trim()) {
        console.warn('⚠️ ERROR: Se requiere al menos texto o slug');
        toast({
          title: 'Error: Datos incompletos',
          description: 'Debes proporcionar al menos un texto o un slug.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        console.groupEnd();
        return;
      }
      
      // Si hay un slug, verificar que sea único para este idioma
      if (data.slug) {
        const slugExists = copys.some(c => 
          c.slug === data.slug && 
          c.language === data.language &&
          (!editingCopy?.id || c.id !== editingCopy.id) // Excluir el copy actual en edición
        );
        
        if (slugExists) {
          console.warn('⚠️ DUPLICADO DETECTADO: Ya existe un copy con mismo slug e idioma');
          console.groupEnd();
          
          toast({
            title: 'Error: Slug duplicado',
            description: `Ya existe un copy con slug "${data.slug}" en ${data.language === 'es' ? 'español' : data.language === 'en' ? 'inglés' : data.language}`,
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          
          return;
        }
      }
      
      // Crear un nuevo copy con ID único
      const newCopy: Copy = {
        id: uuidv4(), // Generar UUID único
        status: 'not_assigned',
        slug: data.slug || '', // No generamos slug automáticamente
        text: data.text || `[Sin texto - ${new Date().toISOString().slice(0, 10)}]`,
        language: data.language,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('🆕 Nuevo copy creado:', JSON.stringify(newCopy));
      
      // Añadir el nuevo copy al estado (inmutabilidad)
      setCopys(prevCopys => {
        // Debug del estado previo
        console.log('📃 Estado previo:', prevCopys.length, 'copys');
        
        // Crear nuevo array (inmutabilidad)
        const newCopys = [...prevCopys, newCopy];
        
        console.log(`✅ Operación completada: ahora hay ${newCopys.length} copys en total`);
        
        // Verificar si el nuevo copy está incluido
        const included = newCopys.some(c => c.id === newCopy.id);
        console.log(`🔎 Verificación final: El nuevo copy ${included ? 'ESTÁ' : 'NO está'} en el nuevo estado`);
        
        return newCopys;
      });
      
      // Para forzar una actualización de cualquier componente
      setTimeout(() => {
        console.log('🔁 Forzando actualización de componentes (updateTrigger)');
        setUpdateTrigger(prev => prev + 1);
      }, 50);
      
      // Cerrar grupo de logs
      console.groupEnd();
      
      // Mostrar notificación de éxito
      const languageName = data.language === 'es' ? 'español' : data.language === 'en' ? 'inglés' : data.language;
      const descriptionParts = [];
      
      if (data.slug) descriptionParts.push(`Slug: ${data.slug}`);
      if (data.text) {
        const textPreview = data.text.length > 30 
          ? `${data.text.substring(0, 30)}...` 
          : data.text;
        descriptionParts.push(`Texto: "${textPreview}"`);
      }
      
      if (!isBulkImport) {
        toast({
          title: `Copy creado en ${languageName}`,
          description: descriptionParts.length > 0 
            ? descriptionParts.join(' | ')
            : 'Sin detalles adicionales',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    }
    
    // Cerrar grupo principal de logs
    console.groupEnd();
  }, [editingCopy, toast, setUpdateTrigger]);

  const handleDelete = (id: string) => {
    setCopys(copys.filter((c) => c.id !== id));
    toast({
      title: "Copy eliminado",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleEdit = (copy: Copy) => {
    console.log("Iniciando edición del copy:", copy);
    // Si el ID está vacío, es un copy nuevo basado en un slug existente
    if (!copy.id) {
      console.log("Creando un nuevo copy basado en un slug existente");
    }
    // Establecer el copy que se está editando
    setEditingCopy(copy);
    // Actualizar el idioma actual al del copy que se está editando
    setCurrentLanguage(copy.language);
    // Abrir el modal de edición
    onEditOpen();
  };

  const exportToJson = () => {
    try {
      let dataToExport: Copy[] = [];
      
      if (exportLanguage === "all") {
        dataToExport = [...copys];
      } else {
        dataToExport = copys.filter((c) => c.language === exportLanguage);
      }
      
      // Crear objeto anidado por idioma respetando la jerarquía indicada por los puntos en los slugs
      const byLanguage: Record<string, any> = {};
      
      // Función auxiliar para crear estructura anidada a partir de paths con puntos
      const setNestedProperty = (obj: any, path: string[], value: string) => {
        let current = obj;
        
        // Recorremos todos los segmentos del path excepto el último
        for (let i = 0; i < path.length - 1; i++) {
          const key = path[i];
          // Si la propiedad no existe, la creamos como objeto vacío
          if (!current[key]) {
            current[key] = {};
          }
          // Continuamos recorriendo el objeto anidado
          current = current[key];
        }
        
        // Último segmento: asignamos el valor
        const lastKey = path[path.length - 1];
        current[lastKey] = value;
      };
      
      // Procesar cada copy para construir el objeto anidado
      dataToExport.forEach((copy) => {
        if (!byLanguage[copy.language]) {
          byLanguage[copy.language] = {};
        }
        
        // Dividir el slug por puntos para crear la estructura anidada
        const slugParts = copy.slug.split('.');
        
        // Crear estructura anidada
        setNestedProperty(byLanguage[copy.language], slugParts, copy.text);
      });
      
      // Crear blob y descargar
      const blob = new Blob([JSON.stringify(byLanguage, null, 2)], {
        type: "application/json",
      });
      
      // Log para debugging
      console.log('📦 Estructura JSON de exportación:', JSON.stringify(byLanguage, null, 2));
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `translation-${exportLanguage === "all" ? "all" : exportLanguage}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Exportación completada",
        description: `Se han exportado ${dataToExport.length} copys`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error al exportar",
        description: "Ha ocurrido un error en la exportación",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error("Error al exportar:", error);
    }
  };

  /**
   * Exporta los copys a un archivo CSV con formato para Google Sheets
   * Implementación del Sprint 14 - Exportación a Google Sheets
   */
  const exportToGoogleSheets = () => {
    try {
      let dataToExport: Copy[] = [];
      
      if (exportLanguage === "all") {
        dataToExport = [...copys];
      } else {
        dataToExport = copys.filter((c) => c.language === exportLanguage);
      }
      
      // Mapeo de idiomas internos a formato requerido por Google Sheets
      const languageMapping: { [key: string]: string } = {
        'es': 'es_ES',
        'en': 'en_GB',
        'it': 'it_IT',
        'en-us': 'en_US',
        'de': 'de_DE',
        'fr': 'fr_FR',
        'pt': 'pt_PT',
        'pt-br': 'pt_BR'
      };
      
      // Generar nombre de archivo
      const fileName = `translations-gs-${exportLanguage === "all" ? "all" : exportLanguage}-${new Date().toISOString().split('T')[0]}.csv`;
      
      // Descargar como CSV para Google Sheets
      downloadGoogleSheetsCSV(
        dataToExport,
        Object.values(languageMapping), // Usar todos los códigos de idioma mapeados
        fileName
      );
      
      // Mostrar toast de éxito
      toast({
        title: "Exportación a Google Sheets completada",
        description: `Se han exportado ${dataToExport.length} copys en formato CSV compatible con Google Sheets`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error al exportar a Google Sheets:", error);
      toast({
        title: "Error al exportar",
        description: "Ha ocurrido un error en la exportación a Google Sheets",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const cancelEdit = () => {
    setEditingCopy(null);
    onEditClose();
  };

  const handleViewHistory = (copy: Copy) => {
    console.log('Abriendo historial para:', copy.slug);
    setSelectedHistoryCopy(copy);
    onHistoryOpen();
  };

  return (
    <Container maxW="container.lg" py={8}>
      <HStack mb={4} justifyContent="space-between" alignItems="center">
        <Heading>Gestión de Copys</Heading>
        <HStack spacing={3}>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="green"
            onClick={() => {
              setEditingCopy(null); // Asegurarse de que no hay un copy en edición
              onEditOpen();
            }}
          >
            Crear Copy
          </Button>
          <Button 
            colorScheme="teal" 
            leftIcon={<span>📥</span>}
            onClick={() => {
              // Abrir la vista de tabla si no está activa
              if (viewMode !== "table") {
                setViewMode("table");
              }
              // Simulamos un clic en el botón de importación del CopyTableView
              // Esto se manejará cuando se renderice el componente
              setTimeout(() => {
                const importButton = document.querySelector('[data-testid="bulk-import-button"]');
                if (importButton) {
                  (importButton as HTMLButtonElement).click();
                }
              }, 100);
            }}
          >
            Importar copys masivamente
          </Button>
        </HStack>
      </HStack>
      
      {/* Modal de creación/edición */}
      <Modal isOpen={isEditOpen} onClose={cancelEdit} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingCopy ? "Editar Copy" : "Crear Copy"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <CopyForm
              existingCopys={copys.filter(c => editingCopy ? c.id !== editingCopy.id : true)}
              onSave={(data) => {
                handleSave(data, !!editingCopy);
                onEditClose();
              }}
              onStatusChange={handleStatusChange}
              onAddComment={(copyId, comment) => {
                // Implementar lógica para agregar comentarios si es necesario
                console.log('Agregando comentario:', { copyId, comment });
              }}
              onTagsChange={(copyId, tags) => {
                // Implementar lógica para actualizar etiquetas si es necesario
                console.log('Actualizando etiquetas:', { copyId, tags });
              }}
              onCancel={cancelEdit}
              initialValues={editingCopy || {}}
              isEditing={!!editingCopy}
              // Pasar el setter de currentLanguage al formulario
              onLanguageChange={setCurrentLanguage}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={cancelEdit}>
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Sección de búsqueda y filtros */}
      <Box mb={6}>
        <VStack spacing={4} align="stretch">
          {/* Fila 1: Búsqueda y filtros */}
          <Flex direction={{ base: "column", md: "row" }} gap={4} align="center">
            <InputGroup maxW={{ base: "100%", md: "400px" }}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Buscar por texto o slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
            
            <HStack spacing={4} flexWrap="wrap">
              {/* Filtro por estado */}
              <Select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value as CopyStatus | "all")}
                width={{ base: "100%", md: "200px" }}
                placeholder="Filtrar por estado"
              >
                <option value="all">Todos los estados</option>
                <option value="not_assigned">Sin asignar</option>
                <option value="assigned">Asignados</option>
                <option value="translated">Traducidos</option>
                <option value="reviewed">Revisados</option>
                <option value="approved">Aprobados</option>
                <option value="rejected">Rechazados</option>
              </Select>
              
              {/* Filtro por etiqueta */}
              <Select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                width={{ base: "100%", md: "200px" }}
                placeholder="Filtrar por etiqueta"
              >
                <option value="all">Todas las etiquetas</option>
                {availableTags.map(tag => (
                  <option key={tag} value={tag}>{tag.charAt(0).toUpperCase() + tag.slice(1)}</option>
                ))}
              </Select>
            </HStack>
          </Flex>
          
          {/* Fila 2: Vistas y exportación */}
          <Flex direction={{ base: "column", md: "row" }} justify="space-between" align="center" gap={4}>
            {/* Botones de vista */}
            <HStack spacing={2}>
              <Text fontWeight="medium" fontSize="sm">Vista:</Text>
              <Button
                size="sm"
                colorScheme={viewMode === "list" ? "blue" : "gray"}
                variant={viewMode === "list" ? "solid" : "outline"}
                onClick={() => setViewMode("list")}
                leftIcon={<span>📋</span>}
              >
                Lista
              </Button>
              <Button
                size="sm"
                colorScheme={viewMode === "table" ? "blue" : "gray"}
                variant={viewMode === "table" ? "solid" : "outline"}
                onClick={() => setViewMode("table")}
                leftIcon={<span>📊</span>}
              >
                Tabla
              </Button>
            </HStack>
            
            {/* Exportación */}
            <HStack spacing={3}>
              <Text fontWeight="medium" fontSize="sm">Exportar:</Text>
              {/* Selector de idiomas para exportación */}
              <Select 
                value={exportLanguage} 
                onChange={(e) => setExportLanguage(e.target.value)}
                size="sm"
                width="130px"
              >
                <option value="all">Todos</option>
                <option value="es">Español</option>
                <option value="en">Inglés</option>
                <option value="pt">Portugués</option>
                <option value="fr">Francés</option>
                <option value="it">Italiano</option>
                <option value="de">Alemán</option>
              </Select>
              
              <Button
                size="sm"
                colorScheme="blue"
                onClick={exportToJson}
                isDisabled={copys.length === 0}
              >
                Exportar JSON
              </Button>
              <Button
                size="sm"
                colorScheme="green"
                onClick={exportToGoogleSheets}
                isDisabled={copys.length === 0}
                leftIcon={<span>📊</span>}
              >
                Google Sheets
              </Button>
            </HStack>
          </Flex>
        </VStack>
      </Box>
      
      {/* Vista de copys (tabla o lista) */}
      {viewMode === "list" ? (
        <>
          <CopyTable 
            copys={filteredCopys} 
            onDelete={handleDelete} 
            onEdit={handleEdit} 
            onViewHistory={handleViewHistory}
          />
          
          {/* Contador de resultados para vista lista */}
          <Text mt={2} fontSize="sm" color="gray.600">
            {filteredCopys.length === copys.length
              ? `Mostrando ${copys.length} copys`
              : `Mostrando ${filteredCopys.length} de ${copys.length} copys`}
          </Text>
        </>
      ) : (
        <CopyTableView 
          copys={filteredCopys}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onViewHistory={handleViewHistory}
          onSave={(data) => handleSave(data, false)} // Pasamos handleSave para la importación masiva
          languages={["es", "en", "pt", "fr", "it", "de"]} // Todos los idiomas soportados
        />
      )}
      
      {/* Modal de historial */}
      <HistoryModal
        copy={selectedHistoryCopy}
        isOpen={isHistoryOpen}
        onClose={onHistoryClose}
      />
    </Container>
  );
}
