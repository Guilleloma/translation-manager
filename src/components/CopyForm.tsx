import React, { useState, useEffect } from 'react';
import {
  Input,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Select,
  HStack,
  VStack,
  Box,
  Divider,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  Badge,
  useToast
} from '@chakra-ui/react';
import { slugify } from '../utils/slugify';
import { Copy, CopyComment, CopyHistory, CopyStatus, CopyTag } from '../types/copy';
import { useUser } from '../context/UserContext';
import { UserRole } from '../types/user';
import TagManager from './tags/TagManager';
import CommentList from './comments/CommentList';
import CommentForm from './comments/CommentForm';
import TranslationStatus, { statusConfig } from './status/TranslationStatus';
import ChangeHistory from './history/ChangeHistory';

interface CopyFormProps {
  // Se pasan todos los copys existentes (excepto el que se está editando)
  existingCopys: Copy[];
  onSave: (copy: Omit<Copy, 'id' | 'status'>) => void;
  onCancel?: () => void;
  initialValues?: Partial<Copy>;
  isEditing?: boolean;
  // Notificar cambios de idioma al componente padre
  onLanguageChange?: (language: string) => void;
  // Nuevas funciones para el Sprint 10
  onStatusChange?: (copyId: string, newStatus: CopyStatus, historyEntry?: CopyHistory) => void;
  onAddComment?: (copyId: string, comment: CopyComment) => void;
  onTagsChange?: (copyId: string, tags: CopyTag[]) => void;
}

export const CopyForm: React.FC<CopyFormProps> = ({ 
  existingCopys, 
  onSave, 
  onCancel, 
  initialValues = {}, 
  isEditing = false, 
  onLanguageChange,
  onStatusChange,
  onAddComment,
  onTagsChange
}) => {
  const { currentUser } = useUser();
  const toast = useToast();
  
  // Estados básicos del formulario
  const [text, setText] = useState(initialValues.text || '');
  const [slug, setSlug] = useState(initialValues.slug || '');
  const [language, setLanguage] = useState(initialValues.language || 'es');
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para indicador de carga
  
  // Estados para las nuevas funcionalidades del Sprint 10
  const [activeTab, setActiveTab] = useState(0);
  
  // Log para debugging
  console.log('Rendering CopyForm with initialValues:', initialValues);

  // Actualizar estados cuando cambian los initialValues (cuando se edita un copy)
  useEffect(() => {
    if (initialValues.text) setText(initialValues.text);
    if (initialValues.slug) {
      setSlug(initialValues.slug);
      setSlugTouched(true);
    }
    if (initialValues.language) setLanguage(initialValues.language);
  }, [initialValues]);

  // Eliminado el efecto que generaba automáticamente el slug a partir del texto

  useEffect(() => {
    validateSlug(slug);
    // eslint-disable-next-line
  }, [slug, existingCopys, language]);

  const validateSlug = (value: string) => {
    // Si hay un valor, validar su formato
    if (value) {
      if (!/^[a-z0-9.]*$/.test(value)) {
        setError('Solo minúsculas, números y puntos.');
        return false;
      }
      
      // Verificación de duplicados por combinación de slug + idioma solo si hay un slug
      // Un mismo slug puede existir en diferentes idiomas, pero no en el mismo idioma
      const duplicado = existingCopys.some(copy => 
        copy.slug === value && 
        copy.language === language &&
        (!initialValues.id || copy.id !== initialValues.id) // Excluir el copy actual en edición
      );
      
      if (duplicado) {
        setError(`El slug '${value}' ya existe para el idioma ${language === 'es' ? 'español' : language === 'en' ? 'inglés' : language}.`);
        return false;
      }
    }
    
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Activar indicador de carga
    setIsSubmitting(true);
    
    // Resetear errores
    setFormError('');
    
    try {
      // Validar que al menos uno de los dos campos esté presente
      if (!text?.trim() && !slug?.trim()) {
        setFormError('Debes proporcionar al menos un texto o un slug.');
        setIsSubmitting(false);
        return;
      }
      
      // Validar el slug si existe
      if (slug && !validateSlug(slug)) {
        setIsSubmitting(false);
        return;
      }
      
      // Preparar los datos para guardar
      const copyData = {
        text: text.trim(),
        slug: slug.trim() || slugify(text.trim()), // Si no hay slug, generar uno a partir del texto
        language,
      };
      
      // Simular una pequeña demora para mostrar el indicador de carga
      // En una aplicación real, esto sería una llamada a la API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Llamar a la función de guardado proporcionada por el padre
      onSave(copyData);
      
      // Mostrar notificación de éxito
      toast({
        title: isEditing ? "Copy actualizado" : "Copy guardado",
        description: isEditing 
          ? `El copy "${copyData.slug}" ha sido actualizado correctamente.` 
          : `El copy "${copyData.slug}" ha sido creado correctamente.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Resetear el formulario si no estamos en modo edición
      if (!isEditing) {
        setText('');
        setSlug('');
      }
    } catch (error) {
      console.error('Error al guardar el copy:', error);
      toast({
        title: "Error",
        description: "Ha ocurrido un error al guardar el copy. Inténtalo de nuevo.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      // Desactivar indicador de carga
      setIsSubmitting(false);
    }
  };

  // Manejar cambio de estado de traducción
  const handleStatusChange = (copyId: string, newStatus: CopyStatus, historyEntry?: CopyHistory) => {
    if (onStatusChange) {
      console.log(`Changing status for copy ${copyId} to ${newStatus}`);
      
      // Actualizar el estado local para reflejar el cambio inmediatamente
      if (initialValues && 'status' in initialValues) {
        // Esto es solo para actualizar la UI, el cambio real lo maneja el componente padre
        initialValues.status = newStatus;
      }
      
      // Llamar al callback del componente padre
      onStatusChange(copyId, newStatus, historyEntry);
    }
  };
  
  // Manejar adición de comentario
  const handleAddComment = (comment: CopyComment) => {
    if (onAddComment && initialValues.id) {
      console.log(`Adding comment to copy ${initialValues.id}:`, comment);
      onAddComment(initialValues.id, comment);
      
      // Cambiar a la pestaña de comentarios después de añadir uno
      setActiveTab(1);
      
      toast({
        title: 'Comentario añadido',
        description: 'Tu comentario se ha añadido correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Manejar cambio de etiquetas
  const handleTagsChange = (copyId: string, tags: CopyTag[]) => {
    if (onTagsChange) {
      console.log(`Updating tags for copy ${copyId}:`, tags);
      onTagsChange(copyId, tags);
    }
  };

  return (
    <Box>
      {/* Formulario básico para crear/editar copy */}
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          {/* Sección de estado (siempre visible en modo edición) */}
          {isEditing && (
            <Box 
              mb={4} 
              p={4} 
              borderWidth="1px" 
              borderRadius="md" 
              borderColor={initialValues.status ? statusConfig[initialValues.status as CopyStatus].color + '.300' : 'gray.200'}
              bg={initialValues.status ? statusConfig[initialValues.status as CopyStatus].bgColor : 'gray.50'}
              transition="all 0.3s ease-in-out"
            >
              <Heading 
                size="sm" 
                mb={3} 
                color={initialValues.status ? statusConfig[initialValues.status as CopyStatus].textColor : 'gray.700'}
              >
                Estado de la traducción
              </Heading>
              
              {initialValues.id && initialValues.status && onStatusChange ? (
                <>
                  <HStack spacing={4} mb={3}>
                    <Box>
                      <Text fontWeight="bold" fontSize="sm">ID:</Text>
                      <Text fontSize="sm" fontFamily="mono">{initialValues.id}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" fontSize="sm">Estado actual:</Text>
                      <Badge 
                        colorScheme={initialValues.status ? statusConfig[initialValues.status as CopyStatus].color : 'gray'}
                        px={2} 
                        py={1}
                      >
                        {initialValues.status ? statusConfig[initialValues.status as CopyStatus].label : 'Desconocido'}
                      </Badge>
                    </Box>
                  </HStack>
                  
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" mb={2}>Cambiar estado:</Text>
                    <TranslationStatus 
                      copy={initialValues as Copy} 
                      onStatusChange={handleStatusChange} 
                    />
                  </Box>
                </>
              ) : (
                <Box p={3} bg="yellow.100" borderRadius="md">
                  <Text color="yellow.800">
                    {!initialValues.id && "No se puede cambiar el estado porque el copy no tiene ID."}
                    {!initialValues.status && initialValues.id && "No se puede cambiar el estado porque el copy no tiene un estado definido."}
                    {!onStatusChange && initialValues.id && initialValues.status && "No se puede cambiar el estado porque no se proporcionó la función onStatusChange."}
                  </Text>
                </Box>
              )}
            </Box>
          )}
          
          <FormControl isInvalid={!!error || !!formError}>
            <FormLabel>Texto {!slug && '(opcional si se proporciona un slug)'}</FormLabel>
            <Input 
              value={text} 
              onChange={e => {
                setText(e.target.value);
                // Limpiar errores al cambiar el valor
                if (formError) setFormError('');
              }} 
              placeholder={
                language === 'es' ? "Texto en español" : 
                language === 'en' ? "Text in English" : 
                language === 'pt' ? "Texto em Português" :
                language === 'fr' ? "Texte en Français" :
                language === 'it' ? "Testo in Italiano" :
                language === 'de' ? "Text auf Deutsch" :
                `Texto en ${language}`
              }
              required={!slug} // Solo requerido si no hay slug
            />
          </FormControl>
          
          <FormControl isInvalid={!!error || !!formError}>
            <FormLabel>Slug {currentUser?.role === UserRole.DEVELOPER ? '' : '(solo modificable por desarrolladores)'}</FormLabel>
            <Input
              value={slug}
              onChange={e => { 
                setSlug(e.target.value); 
                setSlugTouched(true); 
                // Limpiar errores al cambiar el valor
                if (error) setError('');
                if (formError) setFormError('');
              }}
              placeholder="Dejar vacío para asignar después"
              isDisabled={isEditing && currentUser?.role !== UserRole.DEVELOPER && currentUser?.role !== UserRole.ADMIN}
            />
            {error && <FormErrorMessage>{error}</FormErrorMessage>}
            {formError && <FormErrorMessage>{formError}</FormErrorMessage>}
          </FormControl>
          
          <FormControl>
            <FormLabel>Idioma</FormLabel>
            <Select 
              value={language} 
              onChange={e => {
                const newLanguage = e.target.value;
                setLanguage(newLanguage);
                // Notificar al padre del cambio de idioma
                if (onLanguageChange) {
                  onLanguageChange(newLanguage);
                }
              }} 
              required
              isDisabled={isEditing} // No permitir cambiar el idioma en modo edición
            >
              <option value="es">Español</option>
              <option value="en">Inglés</option>
              <option value="pt">Portugués</option>
              <option value="fr">Francés</option>
              <option value="it">Italiano</option>
              <option value="de">Alemán</option>
            </Select>
          </FormControl>
          
          {/* Botones de acción */}
          <HStack spacing={4}>
            <Button 
              type="submit" 
              colorScheme="blue" 
              isDisabled={!!error || (!text?.trim() && !slug?.trim()) || isSubmitting}
              isLoading={isSubmitting}
              loadingText={isEditing ? "Actualizando..." : "Guardando..."}
            >
              {isEditing ? 'Actualizar' : 'Guardar'}
            </Button>
            {onCancel && (
              <Button 
                onClick={onCancel} 
                variant="outline"
                isDisabled={isSubmitting}
              >
                Cancelar
              </Button>
            )}
          </HStack>
        </VStack>
      </form>
      
      {/* Secciones adicionales solo visibles en modo edición */}
      {isEditing && initialValues.id && (
        <Box mt={6}>
          <Divider mb={4} />
          
          <Tabs isFitted variant="enclosed" index={activeTab} onChange={setActiveTab}>
            <TabList mb="1em">
              <Tab>Etiquetas</Tab>
              <Tab>Comentarios</Tab>
              {initialValues.history && initialValues.history.length > 0 && (
                <Tab>Historial</Tab>
              )}
            </TabList>
            <TabPanels>
              {/* Panel de etiquetas */}
              <TabPanel p={0}>
                {onTagsChange && (
                  <TagManager
                    copy={initialValues as Copy}
                    onTagsChange={handleTagsChange}
                  />
                )}
              </TabPanel>
              
              {/* Panel de comentarios */}
              <TabPanel p={0}>
                <VStack spacing={4} align="stretch">
                  {initialValues.comments && initialValues.comments.length > 0 && (
                    <CommentList comments={initialValues.comments} />
                  )}
                  
                  {onAddComment && (
                    <CommentForm
                      copyId={initialValues.id as string}
                      onCommentAdded={handleAddComment}
                    />
                  )}
                </VStack>
              </TabPanel>
              
              {/* Panel de historial */}
              {initialValues.history && initialValues.history.length > 0 && (
                <TabPanel p={0}>
                  <ChangeHistory history={initialValues.history} />
                </TabPanel>
              )}
            </TabPanels>
          </Tabs>
        </Box>
      )}
    </Box>
  );
};
