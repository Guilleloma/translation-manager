"use client";
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// Función para generar IDs únicos (alternativa a uuid)
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 11);
}
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
import CopyTable from '../components/CopyTable';
import { CopyTableView } from "../components/CopyTableView";
import { slugify } from "../utils/slugify";
import { ImportProgressIndicator } from '../components/common/ImportProgressIndicator';
import { useImportProgress } from '../hooks/useImportProgress';
import { downloadGoogleSheetsCSV } from "../utils/exportToGoogleSheets";
import dataService from '../services/dataService';

export default function Home() {
  const { currentUser, isAuthenticated } = useUser();
  
  // Hook para manejar el progreso de importación masiva
  const {
    progress: importProgress,
    startImport,
    updateProgress,
    startImporting,
    completeImport,
    failImport,
    dismissProgress
  } = useImportProgress();
  
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
  
  // Estados para la selección múltiple
  const [selectedCopys, setSelectedCopys] = useState<string[]>([]);
  
  // Funciones para manejar la selección de copys
  const handleToggleSelect = useCallback((copyId: string) => {
    console.log('Toggle select called for copyId:', copyId);
    setSelectedCopys(prev => {
      if (prev.includes(copyId)) {
        return prev.filter(id => id !== copyId);
      } else {
        return [...prev, copyId];
      }
    });
  }, []);
  
  const handleSelectAll = useCallback((copyIds: string[]) => {
    console.log('Select all with ids:', copyIds);
    setSelectedCopys(copyIds);
  }, []);
  
  const handleClearSelection = useCallback(() => {
    console.log('Clear selection');
    setSelectedCopys([]);
  }, []);
  
  // Estados para indicadores de carga
  const [isLoading, setIsLoading] = useState(true); // Carga inicial de datos
  const [isExporting, setIsExporting] = useState(false); // Exportación de datos
  const [isSaving, setIsSaving] = useState(false); // Guardado de copys
  
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
  
  // Estados para el modal de confirmación de eliminación
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  const [copyToDelete, setCopyToDelete] = useState<{id: string, slug: string} | null>(null);
  
  // Estado para el modal de confirmación de eliminación masiva
  const { isOpen: isBulkDeleteModalOpen, onOpen: onBulkDeleteModalOpen, onClose: onBulkDeleteModalClose } = useDisclosure();

  // Función para refrescar la lista de copys (puede ser llamada desde cualquier parte)
  const refreshCopysList = async () => {
    console.log('🔄 Refrescando lista de copys...');
    
    try {
      const storedCopys = await dataService.getCopysFromServer();
      console.log(`📊 Copys obtenidos desde dataService: ${storedCopys.length} total`);
      
      // Log de algunos copys para debugging
      if (storedCopys.length > 0) {
        console.log('📋 Primeros 3 copys obtenidos:', storedCopys.slice(0, 3).map(c => ({
          id: c.id,
          slug: c.slug,
          language: c.language,
          text: c.text.substring(0, 30) + '...'
        })));
      }
      
      setCopys(storedCopys);
      setUpdateTrigger(prev => prev + 1);
      
      // Emitir evento para notificar a otras páginas
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('copysUpdated'));
      }
      
      console.log('✅ Lista de copys actualizada exitosamente');
      return storedCopys;
    } catch (error) {
      console.error('❌ Error al refrescar copys:', error);
      return [];
    }
  };
  
  // Cargar copys desde el servicio de datos cuando el componente se monta
  useEffect(() => {
    console.log('🔄 Cargando copys desde el servicio de datos...');
    setIsLoading(true);
    
    // Refrescar la lista y actualizar estado de carga
    refreshCopysList().finally(() => setIsLoading(false));
    
    // Suscribirse a cambios en los copys
    const unsubscribe = dataService.subscribe('copys', (newCopys) => {
      console.log('📡 Copys actualizados desde el servicio:', newCopys.length);
      setCopys(newCopys);
      setUpdateTrigger(prev => prev + 1);
    });
    
    return unsubscribe;
  }, []);
  
  // Efecto separado para escuchar eventos de actualización de slugs
  useEffect(() => {
    // Escuchar el evento slugsUpdated para actualizar la interfaz cuando se cambian slugs
    // desde la página de tareas del developer
    const handleSlugUpdates = (event: CustomEvent) => {
      console.log('📢 Evento slugsUpdated recibido en la página principal:', event.detail);
      
      // Actualizar inmediatamente la lista de copys
      refreshCopysList().then(updatedCopys => {
        console.log(`✅ Lista de copys actualizada tras cambio de slug: ${updatedCopys.length} copys`); 
        
        // Mostrar notificación sobre la actualización
        toast({
          title: "Slugs actualizados",
          description: `Los slugs han sido actualizados en todos los idiomas`,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom-right"
        });
      });
    };
    
    // Registrar el event listener
    window.addEventListener('slugsUpdated', handleSlugUpdates as EventListener);
    
    // Limpiar el event listener al desmontar
    return () => {
      window.removeEventListener('slugsUpdated', handleSlugUpdates as EventListener);
    };
  }, []);  // Mantenemos un array de dependencias vacío
  
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
    console.log(`Total de copys antes de filtrar: ${copys.length}`);
    
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
    
    // Ordenar por fecha de creación (más recientes primero)
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // Orden descendente
    });
    
    console.log(`Total de copys después de filtrar: ${filtered.length}`);
    setFilteredCopys(filtered);
  }, [searchQuery, statusFilter, tagFilter, copys, updateTrigger]); // Añadido tagFilter a las dependencias

  // Manejar cambios de estado de las traducciones
  const handleStatusChange = useCallback(async (copyId: string, newStatus: CopyStatus, historyEntry?: CopyHistory) => {
    console.group('🔄 CAMBIO DE ESTADO');
    console.log(`Copy ID: ${copyId}`);
    console.log(`Nuevo estado: ${newStatus}`);
    console.log('Entrada de historial:', historyEntry);
    
    // Obtener el copy actual
    const currentCopy = copys.find(c => c.id === copyId);
    if (!currentCopy) {
      console.error(`No se encontró el copy con ID: ${copyId}`);
      console.groupEnd();
      return;
    }
    
    // Crear el copy actualizado
    const updatedCopy = { ...currentCopy };
    
    // Actualizar el estado del copy
    updatedCopy.status = newStatus;
    updatedCopy.updatedAt = new Date();
    
    // Actualizar fechas según el estado
    const now = new Date();
    if (newStatus === 'assigned') {
      updatedCopy.assignedAt = now;
    } else if (newStatus === 'translated') {
      updatedCopy.completedAt = now;
    } else if (newStatus === 'reviewed') {
      updatedCopy.reviewedAt = now;
      updatedCopy.reviewedBy = currentUser?.id;
    } else if (newStatus === 'approved') {
      updatedCopy.approvedAt = now;
      updatedCopy.approvedBy = currentUser?.id;
    }
    
    // Agregar al historial si se proporciona
    if (historyEntry) {
      updatedCopy.history = [
        ...(updatedCopy.history || []),
        historyEntry
      ];
    }
    
    try {
      // Usar el servicio de datos para actualizar (versión asíncrona)
      await dataService.updateCopy(copyId, updatedCopy);
      console.log('✅ Estado actualizado exitosamente');
    } catch (error) {
      console.error('❌ Error al actualizar estado:', error);
    }
    
    console.groupEnd();
  }, [currentUser?.id, copys]);
  
  // Manejar la creación o actualización de copys
  const handleSave = async (data: Omit<Copy, 'id' | 'status'>, isImport = false) => {
    console.log('🚀 ===== INICIO PROCESO CREACIÓN COPY =====');
    console.log('📥 DATOS RECIBIDOS:', {
      text: data.text.substring(0, 50) + '...',
      slug: data.slug,
      language: data.language,
      isImport,
      allDataKeys: Object.keys(data)
    });
    
    // Verificar si el usuario está autenticado
    if (!isAuthenticated && !isImport) {
      console.log('❌ Usuario no autenticado');
      toast({
        title: "Acción no permitida",
        description: "Debe iniciar sesión para crear o editar copys",
        status: "warning",
        duration: 2000,
        isClosable: true,
        position: "bottom-right",
        variant: "subtle",
        size: "sm"
      });
      return;
    }
    
    // Si es una importación masiva, registrar para debugging
    if ((data as any).isBulkImport) {
      console.log(`Procesando elemento de importación masiva: ${data.slug} [${data.language}]`);
    }
    
    // Activar indicador de carga si no es una importación masiva
    if (!isImport && !(data as any).isBulkImport) {
      setIsSaving(true);
    }
    
    try {
      // Verificar si es una edición (actualización) o un nuevo copy
      if (editingCopy && editingCopy.id) {
        console.log('🔄 MODO EDICIÓN - Actualizando copy existente:', {
          editingCopyId: editingCopy.id,
          oldSlug: editingCopy.slug,
          newSlug: data.slug,
          oldText: editingCopy.text.substring(0, 30) + '...',
          newText: data.text.substring(0, 30) + '...'
        });
        
        // Crear el copy actualizado
        const updatedCopy: Copy = {
          ...editingCopy,
          ...data,
          updatedAt: new Date(),
          history: [
            ...(editingCopy.history || []),
            {
              id: generateUniqueId(),
              copyId: editingCopy.id,
              userId: currentUser?.id || 'anonymous',
              userName: currentUser?.username || 'Sistema',
              previousText: editingCopy.text,
              newText: data.text,
              createdAt: new Date(),
              comments: 'Actualización manual'
            } as CopyHistory
          ]
        };
        
        // Usar el servicio de datos para actualizar
        await dataService.updateCopy(editingCopy.id, updatedCopy);
        console.log('📝 Copy actualizado en el DataService:', updatedCopy.id);
        
        // Actualizar explícitamente la lista después de actualizar un copy
        await refreshCopysList();
        
        // Mostrar notificación solo si no es importación masiva
        if (!isImport && !(data as any).isBulkImport) {
          toast({
            title: "Copy actualizado",
            description: `El copy "${data.slug}" ha sido actualizado correctamente`,
            status: "success",
            duration: 2000,
            isClosable: true,
            position: "bottom-right",
            variant: "subtle"
          });
        }
      } else {
        // Crear nuevo copy
        console.log('🆕 Creando nuevo copy:', { slug: data.slug, language: data.language });
        
        // NUEVA ESTRATEGIA: Sistema de grupos de traducción para mantener un único slug
        // Buscar todas las traducciones existentes en el sistema, incluyendo aquellas que 
        // ya han sido actualizadas por el desarrollador
        
        // Paso 1: Buscar si este texto ya tiene otras traducciones (mismo texto o slug)
        const directTranslations = copys.filter(existingCopy => {
          return existingCopy.language !== data.language && 
                 (existingCopy.text === data.text || existingCopy.slug === data.slug);
        });
        
        console.log(`🔍 Traducciones encontradas: ${directTranslations.length}`);
        
        // Paso 2: Buscar también por translationGroupId si alguna tiene
        const relatedTranslations = copys.filter(existingCopy => {
          return existingCopy.translationGroupId && 
                 directTranslations.some(dt => dt.translationGroupId === existingCopy.translationGroupId);
        });
        
        console.log(`🔗 Traducciones relacionadas: ${relatedTranslations.length}`);
        
        // Combinar todas las traducciones relacionadas sin duplicados
        const allRelatedTranslations = [...new Set([...directTranslations, ...relatedTranslations])];
        
        console.log(`🔍 Total traducciones relacionadas: ${allRelatedTranslations.length}`);
        
        // Variables para construir el copy
        let finalSlug = data.slug;
        let needsReview = true;
        let translationGroupId = generateUniqueId(); // Generar un nuevo ID de grupo por defecto
        let isOriginalText = true; // Por defecto, será el texto original si no hay traducciones previas
        
        if (allRelatedTranslations.length > 0) {
          // Ordenar por updatedAt para conseguir la versión más reciente primero
          allRelatedTranslations.sort((a, b) => 
            new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
          
          const latestTranslation = allRelatedTranslations[0];
          
          console.log('📋 Traducción más reciente:', {
            id: latestTranslation.id,
            language: latestTranslation.language,
            slug: latestTranslation.slug,
            translationGroupId: latestTranslation.translationGroupId,
            needsSlugReview: latestTranslation.needsSlugReview,
            updatedAt: latestTranslation.updatedAt
          });
          
          finalSlug = latestTranslation.slug; // Usar el slug más reciente
          translationGroupId = latestTranslation.translationGroupId || translationGroupId;
          needsReview = false; // No necesita revisión si forma parte de un grupo existente
          isOriginalText = false; // No es el texto original si ya existen traducciones
          
          console.log(`🔑 Usando grupo existente: "${translationGroupId}"`);
          console.log(`🔧 Usando slug más reciente: "${finalSlug}" de la traducción en ${latestTranslation.language}`);
          
          // Verificar si el slug ya ha sido revisado (por un developer)
          const hasBeenReviewed = !latestTranslation.needsSlugReview;
          if (hasBeenReviewed) {
            console.log(`✅ Este grupo ya fue revisado por un developer, no aparecerá en tareas pendientes`);
          }
        } else {
          console.log(`🌟 Creando nuevo grupo de traducción: "${translationGroupId}"`);
          console.log(`🔧 Es un texto nuevo, usando slug: "${finalSlug}" (necesita revisión)`);
        }
        
        // Crear el nuevo copy con todos los datos de grupo
        const newCopy: Omit<Copy, 'id'> = {
          ...data,
          slug: finalSlug, // Usar el slug más reciente del grupo
          status: 'not_assigned' as CopyStatus,
          createdAt: new Date(),
          updatedAt: new Date(),
          history: [],
          needsSlugReview: needsReview,
          translationGroupId, // Añadir el ID de grupo
          isOriginalText // Marcar si es texto original
        };
        
        console.log(`💾 COPY A CREAR:`, {
          slug: finalSlug,
          language: data.language,
          groupId: translationGroupId,
          needsReview: needsReview,
          isOriginalText: isOriginalText,
          text: data.text.substring(0, 30) + '...'
        });
        
        // NOTA: El historial se creará automáticamente en el backend cuando se cree el copy
        // No necesitamos crearlo aquí con copyId 'pending'
        
        // Enviar el copy a la API
        console.log('📤 Enviando copy a API...');
        const response = await fetch('/api/copys', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newCopy),
        });

        const result = await response.json();
        console.log('📥 Respuesta API:', { success: result.success, copyId: result.copy?.id });

        if (result.success) {
          console.log('✅ Copy creado exitosamente:', result.copy.id);
          
          // Siempre actualizar la lista completa para asegurar sincronización
          console.log('🔄 Actualizando lista de copys...');
          await refreshCopysList();
          console.log('✅ Lista actualizada');
          
          // Limpiar el formulario solo si no es una importación masiva
          if (!isImport && !(data as any).isBulkImport) {
            // El formulario se limpia automáticamente en el componente CopyForm
          }
        } else {
          console.error('❌ Error al crear copy:', result.error);
          alert(`Error al crear copy: ${result.error}`);
        }
      }
      
      console.log('✅ Copy guardado exitosamente');
    } catch (error) {
      console.error('❌ Error al guardar copy:', error);
      
      // Mostrar error solo si no es importación masiva
      if (!isImport && !(data as any).isBulkImport) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        toast({
          title: "Error al guardar",
          description: `No se pudo sincronizar el copy con el servidor: ${errorMessage}`,
          status: "error",
          duration: 2000,
          isClosable: true,
          position: "bottom-right",
          variant: "subtle"
        });
      }
    } finally {
      // Desactivar indicador de carga si no es una importación masiva
      if (!isImport && !(data as any).isBulkImport) {
        setIsSaving(false);
      }
      console.log('🚀 ===== FIN PROCESO CREACIÓN COPY =====');
    }
  };

  const exportToJson = async () => {
    console.log('Exportando a JSON...');
    setIsExporting(true); // Activar indicador de carga
    
    try {
      // Simular una pequeña demora para mostrar el indicador de carga
      await new Promise(resolve => setTimeout(resolve, 800));
      
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
          } else if (typeof current[key] === 'string') {
            // Si ya existe un string en esta ruta, guardamos su valor y lo convertimos en objeto
            console.log(`Conflicto en la ruta: ${path.join('.')} - El valor '${current[key]}' será reemplazado por un objeto`);
            const oldValue = current[key];
            current[key] = { '_value': oldValue };
          }
          // Continuamos recorriendo el objeto anidado
          current = current[key];
        }
        
        // Último segmento: asignamos el valor
        const lastKey = path[path.length - 1];
        current[lastKey] = value;
      };
      
      // Procesar cada copy para construir el objeto anidado
      console.log('Procesando datos para exportación JSON...');
      dataToExport.forEach((copy) => {
        if (!byLanguage[copy.language]) {
          byLanguage[copy.language] = {};
        }
        
        // Dividir el slug por puntos para crear la estructura anidada
        const slugParts = copy.slug.split('.');
        
        // Añadir log para depuración
        console.log(`Procesando slug: ${copy.slug} (${copy.language})`);
        
        try {
          // Crear estructura anidada
          setNestedProperty(byLanguage[copy.language], slugParts, copy.text);
        } catch (error) {
          console.error(`Error al procesar slug: ${copy.slug}`, error);
          // Continuar con el siguiente copy en lugar de abortar toda la exportación
        }
      });
      
      const jsonStr = JSON.stringify(byLanguage, null, 2);
      
      // Descargar el archivo
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `translations_${exportLanguage}_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Exportación completada",
        description: `Se ha exportado el archivo JSON con ${Object.keys(byLanguage).length} idiomas.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error al exportar a JSON:', error);
      toast({
        title: "Error al exportar",
        description: "Ha ocurrido un error en la exportación a JSON",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsExporting(false); // Desactivar indicador de carga
    }
  };

  const exportToGoogleSheets = async () => {
    console.log('Exportando a formato CSV para Google Sheets...');
    setIsExporting(true); // Activar indicador de carga
    
    try {
      // Simular una pequeña demora para mostrar el indicador de carga
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Filtrar copys según el idioma seleccionado
      let filteredForExport = copys;
      if (exportLanguage !== "all") {
        filteredForExport = copys.filter(c => c.language === exportLanguage);
      }
      
      // Mapeo de idiomas internos a formato requerido por Google Sheets
      const languageCodes = [
        'en_GB', 'es_ES', 'it_IT', 'en_US', 'de_DE', 'fr_FR', 'pt_PT', 'pt_BR'
      ];
      
      // Generar nombre de archivo
      const fileName = `translations-gs-${exportLanguage === "all" ? "all" : exportLanguage}-${new Date().toISOString().split('T')[0]}.csv`;
      
      // Descargar como CSV para Google Sheets
      downloadGoogleSheetsCSV(
        filteredForExport,
        languageCodes, // Usar todos los códigos de idioma definidos
        fileName
      );
      
      // Mostrar toast de éxito
      toast({
        title: "Exportación a Google Sheets completada",
        description: `Se ha exportado el archivo CSV con ${filteredForExport.length} filas.`,
        status: "success",
        duration: 3000,
        isClosable: true
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
    } finally {
      setIsExporting(false); // Desactivar indicador de carga
    }
  };

  const cancelEdit = () => {
    setEditingCopy(null);
    onEditClose();
  };

  // Función para mostrar el modal de confirmación de eliminación
  const handleDeleteConfirmation = (id: string) => {
    // Verificar si el usuario está autenticado
    if (!isAuthenticated) {
      toast({
        title: "Acción no permitida",
        description: "Debe iniciar sesión para eliminar copys",
        status: "warning",
        duration: 2000,
        isClosable: true,
        position: "bottom-right",
        variant: "subtle",
        size: "sm"
      });
      return;
    }
    
    // Buscar el copy por ID para obtener el slug
    const copyToRemove = copys.find(copy => copy.id === id);
    if (!copyToRemove) {
      console.error('No se encontró el copy con ID:', id);
      return;
    }
    
    // Guardar el copy a eliminar y mostrar el modal de confirmación
    setCopyToDelete({id: copyToRemove.id, slug: copyToRemove.slug});
    onDeleteModalOpen();
    
    // Log para debugging
    console.log('🗑️ Solicitando confirmación para eliminar copy:', copyToRemove.id, copyToRemove.slug);
  };

  // Función para editar un copy
  const handleEdit = (copy: Copy) => {
    // Verificar si el usuario está autenticado
    if (!isAuthenticated) {
      toast({
        title: "Acción no permitida",
        description: "Debe iniciar sesión para editar copys",
        status: "warning",
        duration: 2000,
        isClosable: true,
        position: "bottom-right",
        variant: "subtle",
        size: "sm"
      });
      return;
    }
    
    setEditingCopy(copy);
    onEditOpen();
    
    // Log para debugging
    console.log('✏️ Editando copy:', copy.id, copy.slug);
  };
  
  // Función para ver el historial de un copy
  const handleViewHistory = (copy: Copy) => {
    setSelectedHistoryCopy(copy);
    onHistoryOpen();
  };

  return (
    <>
      {/* Indicador de progreso fijo para importaciones masivas */}
      <ImportProgressIndicator 
        progress={importProgress} 
        onDismiss={dismissProgress}
      />
      
      {/* Contenido principal con margen superior cuando hay progreso activo */}
      <Box pt={importProgress.isActive ? "60px" : "0"} transition="padding-top 0.3s ease">
        <Container maxW="container.lg" py={8}>
          <HStack mb={4} justifyContent="space-between" alignItems="center">
            <Heading>Gestión de Copys</Heading>
            <HStack spacing={3}>
              <Tooltip 
                label="Debe iniciar sesión para crear copys" 
                isDisabled={isAuthenticated}
                hasArrow
                placement="top"
              >
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="green"
                  onClick={() => {
                    // Verificar si el usuario está autenticado
                    if (!isAuthenticated) {
                      toast({
                        title: "Acción no permitida",
                        description: "Debe iniciar sesión para crear copys",
                        status: "warning",
                        duration: 2000,
                        isClosable: true,
                        position: "bottom-right",
                        variant: "subtle",
                        size: "sm"
                      });
                      return;
                    }
                    
                    setEditingCopy(null); // Asegurarse de que no hay un copy en edición
                    onEditOpen();
                  }}
                  isDisabled={!isAuthenticated}
                  _disabled={{
                    opacity: 0.6,
                    cursor: "not-allowed"
                  }}
                >
                  Create Copy
                </Button>
              </Tooltip>
              <Tooltip
                label="Debe iniciar sesión para importar copys"
                isDisabled={isAuthenticated}
                hasArrow
                placement="top"
              >
                <Button 
                  colorScheme="teal" 
                  leftIcon={<span>📥</span>}
                  onClick={() => {
                    // Verificar si el usuario está autenticado
                    if (!isAuthenticated) {
                      toast({
                        title: "Acción no permitida",
                        description: "Debe iniciar sesión para importar copys",
                        status: "warning",
                        duration: 2000,
                        isClosable: true,
                        position: "bottom-right",
                        variant: "subtle"
                      });
                      return;
                    }
                    
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
                  isDisabled={!isAuthenticated}
                  _disabled={{
                    opacity: 0.6,
                    cursor: "not-allowed"
                  }}
                >
                Bulk Import
              </Button>
              </Tooltip>
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
                  onSave={async (data) => {
                    await handleSave(data, !!editingCopy);
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
                    isDisabled={copys.length === 0 || isExporting}
                    isLoading={isExporting}
                    loadingText="Exportando..."
                  >
                    Exportar JSON
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="green"
                    onClick={exportToGoogleSheets}
                    isDisabled={copys.length === 0 || isExporting}
                    isLoading={isExporting}
                    loadingText="Exportando..."
                    leftIcon={!isExporting ? <span>📊</span> : undefined}
                  >
                    Google Sheets
                  </Button>
                </HStack>
              </Flex>
            </VStack>
          </Box>
          
          {/* Indicador de carga durante la carga inicial */}
          {isLoading ? (
            <Box textAlign="center" py={10}>
              <VStack spacing={4}>
                <Text fontSize="lg">Cargando datos...</Text>
                <Box>
                  <span role="img" aria-label="loading" style={{ fontSize: '2rem' }}>⏳</span>
                </Box>
              </VStack>
            </Box>
          ) : viewMode === "list" ? (
            <>
              <CopyTable 
                copys={filteredCopys} 
                onDelete={handleDeleteConfirmation} 
                onEdit={handleEdit} 
                onViewHistory={handleViewHistory}
                selectedCopys={selectedCopys}
                onToggleSelect={handleToggleSelect}
                onSelectAll={handleSelectAll}
                onClearSelection={handleClearSelection}
              />
              
              {/* Barra de acciones para operaciones en lote si hay elementos seleccionados */}
              {selectedCopys.length > 0 && (
                <Box 
                  position="fixed" 
                  bottom="0" 
                  left="0" 
                  right="0" 
                  bg="blue.700" 
                  color="white" 
                  py={3} 
                  px={6} 
                  zIndex={100}
                  boxShadow="0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06)"
                >
                  <Container maxW="container.xl">
                    <Flex justify="space-between" align="center">
                      <HStack spacing={4}>
                        <Badge colorScheme="blue" fontSize="md" p={2} borderRadius="md">
                          {selectedCopys.length} elementos seleccionados
                        </Badge>
                        <Button
                          onClick={handleClearSelection}
                          variant="outline"
                          colorScheme="whiteAlpha"
                          size="sm"
                        >
                          Cancelar selección
                        </Button>
                      </HStack>
                      <Button
                        leftIcon={<span>🗑️</span>}
                        colorScheme="red"
                        variant="solid"
                        size="md"
                        onClick={async () => {
                          // Mostrar confirmación
                          if (confirm(`¿Estás seguro de que deseas eliminar ${selectedCopys.length} elementos?`)) {
                            try {
                              // Eliminar elementos seleccionados (versión asíncrona)
                              for (const id of selectedCopys) {
                                await dataService.deleteCopy(id);
                              }
                              
                              // Mostrar notificación
                              toast({
                                title: "Elementos eliminados",
                                description: `Se han eliminado ${selectedCopys.length} elementos`,
                                status: "success",
                                duration: 3000,
                                isClosable: true,
                              });
                              
                              // Log para debugging
                              console.log(`🗑️ ${selectedCopys.length} elementos eliminados`);
                            } catch (error) {
                              console.error('❌ Error al eliminar elementos en lote:', error);
                              toast({
                                title: "Error",
                                description: "Hubo un problema al eliminar los elementos",
                                status: "error",
                                duration: 3000,
                                isClosable: true,
                              });
                            }
                            
                            // Limpiar selección
                            handleClearSelection();
                          }
                        }}
                      >
                        Eliminar {selectedCopys.length} elementos
                      </Button>
                    </Flex>
                  </Container>
                </Box>
              )}
              

              
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
              onDelete={handleDeleteConfirmation}
              onEdit={handleEdit}
              onViewHistory={handleViewHistory}
              onSave={(data) => handleSave(data, false)} // Pasamos handleSave para la importación masiva
              languages={["es", "en", "pt", "fr", "it", "de"]} // Todos los idiomas soportados
              // Props para manejar el progreso de importación
              onImportStart={startImport}
              onImportProgress={updateProgress}
              onImportComplete={completeImport}
              onImportError={failImport}
              onStartImporting={startImporting}
            />
          )}
          
          {/* Modal de historial */}
          <HistoryModal
            copy={selectedHistoryCopy}
            isOpen={isHistoryOpen}
            onClose={onHistoryClose}
          />
          
          {/* Modal de confirmación para eliminar copy */}
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
                  <Text>¿Está seguro que desea eliminar este copy?</Text>
                  {copyToDelete && (
                    <Box p={3} bg="gray.100" borderRadius="md" width="100%">
                      <Text fontWeight="bold">Slug: {copyToDelete.slug}</Text>
                      <Text fontSize="sm" mt={1}>ID: {copyToDelete.id}</Text>
                    </Box>
                  )}
                  <Text color="red.500" fontWeight="semibold">Esta acción no se puede deshacer.</Text>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button variant="outline" mr={3} onClick={onDeleteModalClose}>
                  Cancelar
                </Button>
                <Button 
                  colorScheme="red" 
                  onClick={async () => {
                    if (copyToDelete) {
                      try {
                        // Usar el servicio de datos para eliminar (versión asíncrona)
                        await dataService.deleteCopy(copyToDelete.id);
                        
                        // Mostrar notificación
                        toast({
                          title: "Copy eliminado",
                          description: "El copy ha sido eliminado correctamente",
                          status: "success",
                          duration: 3000,
                          isClosable: true,
                        });
                        
                        // Log para debugging
                        console.log('🗑️ Copy eliminado:', copyToDelete.id);
                      } catch (error) {
                        console.error('❌ Error al eliminar copy:', error);
                        toast({
                          title: "Error",
                          description: "Hubo un problema al eliminar el copy",
                          status: "error",
                          duration: 3000,
                          isClosable: true,
                        });
                      }
                      
                      // Limpiar el estado
                      setCopyToDelete(null);
                    }
                    onDeleteModalClose();
                  }}
                >
                  Confirmar eliminación
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>


        </Container>
      </Box>
    </>
  );
}
