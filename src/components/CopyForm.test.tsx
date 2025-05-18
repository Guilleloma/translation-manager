import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CopyForm } from './CopyForm';
import { Copy } from '../types/copy';

describe('CopyForm', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();
  const mockOnLanguageChange = jest.fn();
  
  const existingCopys: Copy[] = [
    { id: '1', slug: 'existing.slug', text: 'Existing text', language: 'es', status: 'pendiente' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('permite crear un copy solo con texto', async () => {
    render(
      <CopyForm 
        existingCopys={[]} 
        onSave={mockOnSave} 
      />
    );

    // Rellenar solo el campo de texto
    const textInput = screen.getByPlaceholderText('Texto en español');
    fireEvent.change(textInput, { target: { value: 'Nuevo texto' } });

    // Enviar el formulario
    const submitButton = screen.getByRole('button', { name: /guardar/i });
    fireEvent.click(submitButton);

    // Verificar que se llamó a onSave con los datos correctos
    expect(mockOnSave).toHaveBeenCalledWith({
      text: 'Nuevo texto',
      slug: '',
      language: 'es'
    });
  });

  it('permite crear un copy solo con slug', async () => {
    render(
      <CopyForm 
        existingCopys={[]} 
        onSave={mockOnSave} 
      />
    );

    // Rellenar solo el campo de slug
    const slugInput = screen.getByPlaceholderText('Dejar vacío para asignar después');
    fireEvent.change(slugInput, { target: { value: 'nuevo.slug' } });

    // Enviar el formulario
    const submitButton = screen.getByRole('button', { name: /guardar/i });
    fireEvent.click(submitButton);

    // Verificar que se llamó a onSave con los datos correctos
    expect(mockOnSave).toHaveBeenCalledWith({
      text: '[nuevo.slug]',
      slug: 'nuevo.slug',
      language: 'es'
    });
  });

  it('permite crear un copy con texto y slug', async () => {
    render(
      <CopyForm 
        existingCopys={[]} 
        onSave={mockOnSave} 
      />
    );

    // Rellenar ambos campos
    const textInput = screen.getByPlaceholderText('Texto en español');
    const slugInput = screen.getByPlaceholderText('Dejar vacío para asignar después');
    
    fireEvent.change(textInput, { target: { value: 'Nuevo texto' } });
    fireEvent.change(slugInput, { target: { value: 'nuevo.slug' } });

    // Enviar el formulario
    const submitButton = screen.getByRole('button', { name: /guardar/i });
    fireEvent.click(submitButton);

    // Verificar que se llamó a onSave con los datos correctos
    expect(mockOnSave).toHaveBeenCalledWith({
      text: 'Nuevo texto',
      slug: 'nuevo.slug',
      language: 'es'
    });
  });

  it('no permite guardar si no se proporciona texto ni slug', () => {
    render(
      <CopyForm 
        existingCopys={[]} 
        onSave={mockOnSave} 
      />
    );

    // Verificar que el botón de guardar esté deshabilitado inicialmente
    const submitButton = screen.getByRole('button', { name: /guardar/i });
    expect(submitButton).toBeDisabled();
    
    // Verificar que no se llamó a onSave
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('no permite guardar si el slug tiene formato inválido', () => {
    render(
      <CopyForm 
        existingCopys={[]} 
        onSave={mockOnSave} 
      />
    );

    // Rellenar el slug con un formato inválido
    const slugInput = screen.getByPlaceholderText('Dejar vacío para asignar después');
    fireEvent.change(slugInput, { target: { value: 'slug inválido' } });

    // Verificar que el botón de guardar está deshabilitado
    const submitButton = screen.getByRole('button', { name: /guardar/i });
    expect(submitButton).toBeDisabled();
    
    // Verificar que no se llamó a onSave
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('no permite guardar si el slug ya existe para el mismo idioma', () => {
    render(
      <CopyForm 
        existingCopys={existingCopys} 
        onSave={mockOnSave} 
      />
    );

    // Rellenar con un slug que ya existe
    const slugInput = screen.getByPlaceholderText('Dejar vacío para asignar después');
    fireEvent.change(slugInput, { target: { value: 'existing.slug' } });

    // Verificar que el botón de guardar está deshabilitado
    const submitButton = screen.getByRole('button', { name: /guardar/i });
    expect(submitButton).toBeDisabled();
    
    // Verificar que no se llamó a onSave
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('permite editar un copy existente', async () => {
    const existingCopy = {
      id: '1',
      slug: 'existing.slug',
      text: 'Existing text',
      language: 'es',
      status: 'pendiente' as const
    };

    render(
      <CopyForm 
        existingCopys={[]} 
        onSave={mockOnSave} 
        initialValues={existingCopy}
        isEditing={true}
      />
    );

    // Verificar que los campos se llenan con los valores existentes
    expect(screen.getByPlaceholderText('Texto en español')).toHaveValue('Existing text');
    expect(screen.getByPlaceholderText('Dejar vacío para asignar después')).toHaveValue('existing.slug');

    // Modificar el texto
    const textInput = screen.getByPlaceholderText('Texto en español');
    fireEvent.change(textInput, { target: { value: 'Texto modificado' } });

    // Enviar el formulario
    const submitButton = screen.getByRole('button', { name: /guardar/i });
    fireEvent.click(submitButton);

    // Verificar que se llamó a onSave con los datos actualizados
    expect(mockOnSave).toHaveBeenCalledWith({
      text: 'Texto modificado',
      slug: 'existing.slug',
      language: 'es'
    });
  });
});
