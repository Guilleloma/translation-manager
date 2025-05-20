"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Heading,
  Container,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Stack,
  HStack,
  Text,
  useToast,
  Select,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Flex,
  Spacer
} from "@chakra-ui/react";
import { v4 as uuidv4 } from "uuid";
import { Copy, CopyInput } from "../types/copy";
import { CopyForm } from "../components/CopyForm";
import { CopyTable } from "../components/CopyTable";
import { CopyTableView } from "../components/CopyTableView";
import { slugify } from "../utils/slugify";

export default function Home() {
  // Estado principal de la aplicación
  const [copys, setCopys] = useState<Copy[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCopys, setFilteredCopys] = useState<Copy[]>([]);
  const [editingCopy, setEditingCopy] = useState<Copy | null>(null);
  const [exportLanguage, setExportLanguage] = useState("all");
  const [currentLanguage, setCurrentLanguage] = useState("es");  // Idioma para el formulario actual
  const [viewMode, setViewMode] = useState<"list" | "table">("list");  // Modo de vista: lista o tabla
  const [updateTrigger, setUpdateTrigger] = useState(0); // Nuevo estado para forzar actualizaciones
  const toast = useToast();

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
  
  // Filtrar copys cada vez que cambie la búsqueda o el array de copys
  useEffect(() => {
    console.log(`Aplicando filtro de búsqueda: "${searchQuery}"`);
    
    if (searchQuery.trim() === "") {
      console.log(`Sin filtro, mostrando todos los ${copys.length} copys`);
      setFilteredCopys(copys);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = copys.filter(
        (copy) =>
          copy.slug.toLowerCase().includes(lowerQuery) ||
          copy.text.toLowerCase().includes(lowerQuery)
      );
      console.log(`Filtro aplicado: ${filtered.length}/${copys.length} copys coinciden`);
      setFilteredCopys(filtered);
    }
  }, [searchQuery, copys, updateTrigger]); // Añadido updateTrigger para forzar actualizaciones

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
        status: 'pendiente',
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
    setEditingCopy(copy);
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

  const cancelEdit = () => {
    setEditingCopy(null);
  };

  return (
    <Container maxW="container.lg" py={8}>
      <Heading mb={4}>Gestión de Copys</Heading>
      
      {/* Formulario de creación/edición */}
      <Box mb={6} p={4} borderWidth="1px" borderRadius="lg">
        <Text fontSize="lg" fontWeight="bold" mb={3}>
          {editingCopy ? "Editar Copy" : "Crear Copy"}
        </Text>
        <CopyForm
          existingCopys={copys.filter(c => editingCopy ? c.id !== editingCopy.id : true)}
          onSave={(data) => handleSave(data, !!editingCopy)}
          onCancel={editingCopy ? cancelEdit : undefined}
          initialValues={editingCopy || {}}
          isEditing={!!editingCopy}
          // Pasar el setter de currentLanguage al formulario
          onLanguageChange={setCurrentLanguage}
        />
      </Box>
      
      {/* Barra de búsqueda y exportación */}
      <Stack direction={{ base: "column", md: "row" }} mb={4} spacing={4}>
        <InputGroup maxW={{ base: "100%", md: "40%" }}>
          <InputLeftElement pointerEvents="none">
            🔍
          </InputLeftElement>
          <Input
            placeholder="Buscar por texto o slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
        
        <HStack>
          <Button
            size="md"
            colorScheme={viewMode === "list" ? "blue" : "gray"}
            variant={viewMode === "list" ? "solid" : "outline"}
            onClick={() => setViewMode("list")}
            leftIcon={<span>📋</span>}
          >
            Lista
          </Button>
          <Button
            size="md"
            colorScheme={viewMode === "table" ? "blue" : "gray"}
            variant={viewMode === "table" ? "solid" : "outline"}
            onClick={() => setViewMode("table")}
            leftIcon={<span>📊</span>}
          >
            Tabla
          </Button>
        </HStack>
        
        <Spacer />
        
        <HStack spacing={3}>
          {/* Selector de idiomas para exportación - Incluye todos los idiomas soportados */}
          <Select 
            value={exportLanguage} 
            onChange={(e) => setExportLanguage(e.target.value)}
            size="md"
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
            colorScheme="blue"
            onClick={exportToJson}
            isDisabled={copys.length === 0}
          >
            Exportar JSON
          </Button>
        </HStack>
      </Stack>
      
      {/* Vista de copys (tabla o lista) */}
      {viewMode === "list" ? (
        <>
          <CopyTable 
            copys={filteredCopys} 
            onDelete={handleDelete} 
            onEdit={handleEdit} 
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
          onSave={(data) => handleSave(data, false)} // Pasamos handleSave para la importación masiva
          languages={["es", "en", "pt", "fr", "it", "de"]} // Todos los idiomas soportados
        />
      )}
    </Container>
  );
}
