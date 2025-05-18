import React, { useState, useEffect } from 'react';
import {
  Input,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Select,
  HStack
} from '@chakra-ui/react';
import { slugify } from '../utils/slugify';
import { Copy } from '../types/copy';

interface CopyFormProps {
  // Se pasan todos los copys existentes (excepto el que se está editando)
  existingCopys: Copy[];
  onSave: (copy: Omit<Copy, 'id' | 'status'>) => void;
  onCancel?: () => void;
  initialValues?: Partial<Copy>;
  isEditing?: boolean;
  // Notificar cambios de idioma al componente padre
  onLanguageChange?: (language: string) => void;
}

export const CopyForm: React.FC<CopyFormProps> = ({ existingCopys, onSave, onCancel, initialValues = {}, isEditing = false, onLanguageChange }) => {
  const [text, setText] = useState(initialValues.text || '');
  const [slug, setSlug] = useState(initialValues.slug || '');
  const [language, setLanguage] = useState(initialValues.language || 'es');
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Resetear errores
    setFormError('');
    
    // Validar que al menos uno de los dos campos esté presente
    if (!text?.trim() && !slug?.trim()) {
      setFormError('Debes proporcionar al menos un texto o un slug.');
      return;
    }
    
    // Validar el slug si está presente
    if (slug && !validateSlug(slug)) {
      return;
    }
    
    // Si no hay texto pero hay slug, usamos un texto predeterminado
    const finalText = text?.trim() || `[${slug}]`;
    
    onSave({ 
      slug: slug || '', 
      text: finalText,
      language 
    });
    
    // Resetear solo si no estamos editando
    if (!isEditing) {
      setText('');
      setSlug('');
      setSlugTouched(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormControl isInvalid={!!error || !!formError} mb={2}>
        <FormLabel>Texto {!slug && '(opcional si se proporciona un slug)'}</FormLabel>
        <Input 
          value={text} 
          onChange={e => {
            setText(e.target.value);
            // Limpiar errores al cambiar el valor
            if (formError) setFormError('');
          }} 
          placeholder={language === 'es' ? "Texto en español" : language === 'en' ? "Text in English" : `Texto en ${language}`}
          required={!slug} // Solo requerido si no hay slug
        />
      </FormControl>
      <FormControl isInvalid={!!error || !!formError} mb={2}>
        <FormLabel>Slug (opcional)</FormLabel>
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
        />
        {error && <FormErrorMessage>{error}</FormErrorMessage>}
        {formError && <FormErrorMessage>{formError}</FormErrorMessage>}
      </FormControl>
      <FormControl mb={4}>
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
          required>
          <option value="es">Español</option>
          <option value="en">Inglés</option>
          {/* Puedes añadir más idiomas aquí */}
        </Select>
      </FormControl>
      <HStack spacing={4}>
        <Button 
          type="submit" 
          colorScheme="blue" 
          isDisabled={!!error || (!text?.trim() && !slug?.trim())}
        >
          Guardar
        </Button>
        {onCancel && (
          <Button onClick={onCancel} variant="outline">
            Cancelar edición
          </Button>
        )}
      </HStack>
    </form>
  );
};
