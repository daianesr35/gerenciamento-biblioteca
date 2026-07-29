import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import NewBookPage from './page';

describe('página de cadastro manual', () => {
  it('apresenta apenas os campos persistidos permitidos', () => {
    const html = renderToStaticMarkup(<NewBookPage />);

    for (const field of [
      'title',
      'author',
      'isbn',
      'publisher',
      'coverImageUrl',
    ]) {
      expect(html).toContain(`name="${field}"`);
    }
    expect(html).not.toContain('name="situacao"');
    expect(html).not.toContain('name="biblioteca_id"');
    expect(html).not.toContain('Google Books');
    expect(html).not.toContain('Buscar informações');
    expect(html).not.toContain('código de barras');
    expect(html).not.toContain('name="description"');
    expect(html).not.toContain('name="subtitle"');
    expect(html).not.toContain('name="categories"');
    expect(html).not.toContain('name="year"');
    expect(html).not.toContain('name="pages"');
    expect(html).not.toContain('name="language"');
    expect(html).toMatch(/name="title"[^>]*required/);
    expect(html).toMatch(/name="author"[^>]*required/);
    expect(html).toContain('Salvar livro');
  });
});
