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
  // Aquí se pasan solo los slugs existentes que ya tienen el mismo idioma seleccionado
  existingSlugs: string[];
  onSave: (copy: Omit<Copy, 'id' | 'status'>) => void;
  onCancel?: () => void;
  initialValues?: Partial<Copy>;
  isEditing?: boolean;
}

export const CopyForm: React.FC<CopyFormProps> = ({ existingSlugs, onSave, onCancel, initialValues = {}, isEditing = false }) => {
  const [text, setText] = useState(initialValues.text || '');
  const [slug, setSlug] = useState(initialValues.slug || '');
  const [language, setLanguage] = useState(initialValues.language || 'es');
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState('');

  // Actualizar estados cuando cambian los initialValues (cuando se edita un copy)
  useEffect(() => {
    if (initialValues.text) setText(initialValues.text);
    if (initialValues.slug) {
      setSlug(initialValues.slug);
      setSlugTouched(true);
    }
    if (initialValues.language) setLanguage(initialValues.language);
  }, [initialValues]);

  useEffect(() => {
    if (!slugTouched && text) {
      setSlug(slugify(text));
    }
    // eslint-disable-next-line
  }, [text]);

  useEffect(() => {
    validateSlug(slug);
    // eslint-disable-next-line
  }, [slug, existingSlugs]);

  const validateSlug = (value: string) => {
    if (!value) {
      setError('El slug es obligatorio.');
      return false;
    }
    if (!/^[a-z0-9.]+$/.test(value)) {
      setError('Solo minúsculas, números y puntos.');
      return false;
    }
    // Verificación de duplicados - ahora solo comprueba entre slugs del mismo idioma
    // Estos ya vienen filtrados desde el componente padre
    if (existingSlugs.includes(value)) {
      setError(`El slug '${value}' ya existe para el idioma ${language}.`);
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSlug(slug)) return;
    if (!text) {
      setError('El texto es obligatorio.');
      return;
    }
    onSave({ slug, text, language });
    setText('');
    setSlug('');
    setSlugTouched(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormControl isInvalid={!!error} mb={2}>
        <FormLabel>Texto</FormLabel>
        <Input 
          value={text} 
          onChange={e => setText(e.target.value)} 
          placeholder={language === 'es' ? "Texto en español" : language === 'en' ? "Text in English" : `Texto (${language})`} 
          required 
        />
      </FormControl>
      <FormControl isInvalid={!!error} mb={2}>
        <FormLabel>Slug</FormLabel>
        <Input
          value={slug}
          onChange={e => { setSlug(e.target.value); setSlugTouched(true); }}
          placeholder="slug.auto.generado"
          required
        />
        {error && <FormErrorMessage>{error}</FormErrorMessage>}
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>Idioma</FormLabel>
        <Select value={language} onChange={e => setLanguage(e.target.value)} required>
          <option value="es">Español</option>
          <option value="en">Inglés</option>
          {/* Puedes añadir más idiomas aquí */}
        </Select>
      </FormControl>
      <HStack spacing={4}>
        <Button type="submit" colorScheme="blue" isDisabled={!!error || !text}>
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
