import React from 'react';
import { render, screen } from '../../utils/test-utils';
import { CopyTableView } from '../CopyTableView';
import { Copy } from '../../types/copy';

const copys: Copy[] = [
  { id: '1', slug: 'button', text: 'Botón General', language: 'es', status: 'not_assigned' },
  { id: '2', slug: 'button.crear', text: 'Crear', language: 'es', status: 'not_assigned' },
  { id: '3', slug: 'button.cancelar', text: 'Cancelar', language: 'es', status: 'not_assigned' },
  { id: '4', slug: 'button.save', text: 'Save', language: 'en', status: 'not_assigned' },
];

describe('CopyTableView', () => {
  it('muestra el warning de conflicto de slug raíz/prefijo', () => {
    render(
      <CopyTableView
        copys={copys}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        languages={['es', 'en']}
      />
    );
    // El slug "button" debe tener el icono ⚠️
    const warning = screen.getAllByText('⚠️');
    expect(warning.length).toBeGreaterThan(0);
    // El tooltip debe estar presente en el DOM
    expect(screen.getByText(/puede causar conflictos al exportar a JSON/i)).toBeInTheDocument();
  });

  it('no muestra el warning si no hay conflicto', () => {
    render(
      <CopyTableView
        copys={[
          { id: '1', slug: 'menu', text: 'Menú', language: 'es', status: 'not_assigned' },
          { id: '2', slug: 'menu.file', text: 'Archivo', language: 'es', status: 'not_assigned' },
        ]}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        languages={['es']}
      />
    );
    // Si no hay conflicto, no debe aparecer el icono de warning
    expect(screen.queryByText('⚠️')).toBeNull();
  });
});
