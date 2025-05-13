"use client";
import React, { useState, useEffect } from "react";
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
import { Copy } from "../types/copy";
import { CopyForm } from "../components/CopyForm";
import { CopyTable } from "../components/CopyTable";
import { CopyTableView } from "../components/CopyTableView";

export default function Home() {
  const [copys, setCopys] = useState<Copy[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCopys, setFilteredCopys] = useState<Copy[]>([]);
  const [editingCopy, setEditingCopy] = useState<Copy | null>(null);
  const [exportLanguage, setExportLanguage] = useState("all");
  const [currentLanguage, setCurrentLanguage] = useState("es");  // Idioma para el formulario actual
  const [viewMode, setViewMode] = useState<"list" | "table">("list");  // Modo de vista: lista o tabla
  const toast = useToast();

  // Filtrar copys cada vez que cambie la búsqueda o el array de copys
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCopys(copys);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredCopys(
        copys.filter(
          (copy) =>
            copy.slug.toLowerCase().includes(lowerQuery) ||
            copy.text.toLowerCase().includes(lowerQuery)
        )
      );
    }
  }, [searchQuery, copys]);

  const handleSave = (data: Omit<Copy, "id" | "status">, isEdit = false) => {
    console.log("Guardando datos:", data); // Log para depuración
    
    if (isEdit && editingCopy) {
      setCopys(
        copys.map((c) =>
          c.id === editingCopy.id
            ? { ...c, slug: data.slug, text: data.text, language: data.language }
            : c
        )
      );
      setEditingCopy(null);
      toast({
        title: "Copy actualizado",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } else {
      // Asegurarse de que todos los campos estén presentes
      const newCopy: Copy = {
        id: uuidv4(),
        status: "pendiente",
        slug: data.slug,
        text: data.text,
        language: data.language
      };
      
      console.log("Nuevo copy creado:", newCopy); // Log para depuración
      
      setCopys(prevCopys => [...prevCopys, newCopy]);
      
      toast({
        title: `Copy creado en ${data.language === 'es' ? 'español' : data.language === 'en' ? 'inglés' : data.language}`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
  };

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
      
      // Crear objeto por idioma
      const byLanguage: Record<string, Record<string, string>> = {};
      
      dataToExport.forEach((copy) => {
        if (!byLanguage[copy.language]) {
          byLanguage[copy.language] = {};
        }
        byLanguage[copy.language][copy.slug] = copy.text;
      });
      
      // Crear blob y descargar
      const blob = new Blob([JSON.stringify(byLanguage, null, 2)], {
        type: "application/json",
      });
      
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
          existingSlugs={copys
            .filter((c) => !editingCopy || c.id !== editingCopy.id)
            .filter((c) => c.language === (editingCopy?.language || currentLanguage))
            .map((c) => c.slug)}
          onSave={(data) => handleSave(data, !!editingCopy)}
          onCancel={editingCopy ? cancelEdit : undefined}
          initialValues={editingCopy || {}}
          isEditing={!!editingCopy}
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
          <Select 
            value={exportLanguage} 
            onChange={(e) => setExportLanguage(e.target.value)}
            size="md"
            width="130px"
          >
            <option value="all">Todos</option>
            <option value="es">Español</option>
            <option value="en">Inglés</option>
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
          languages={["es", "en"]} // Añade más idiomas aquí según sea necesario
        />
      )}
    </Container>
  );
}
