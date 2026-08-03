import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import NewBookPage from './page';

describe('página de cadastro de Livro', () => {
  it('apresenta apenas os campos persistidos permitidos', () => {
    const html = renderToStaticMarkup(<NewBookPage />);

    for (const field of [
      'title',
      'author',
      'isbn',
      'publisher',
      'coverImageUrl',
      'category',
    ]) {
      expect(html).toContain(`name="${field}"`);
    }
    expect(html).not.toContain('name="situacao"');
    expect(html).not.toContain('name="biblioteca_id"');
    expect(html).not.toContain('código de barras');
    expect(html).not.toContain('name="description"');
    expect(html).not.toContain('name="subtitle"');
    expect(html).not.toContain('name="categories"');
    expect(html).not.toContain('name="year"');
    expect(html).not.toContain('name="pages"');
    expect(html).not.toContain('name="language"');
    expect(html).toMatch(/<input(?=[^>]*name="title")(?=[^>]*required)/);
    expect(html).toMatch(/<input(?=[^>]*name="author")(?=[^>]*required)/);
    expect(html.indexOf('name="isbn"')).toBeLessThan(
      html.indexOf('name="title"'),
    );
    expect(html).toContain('Buscar ISBN');
    expect(html).toMatch(
      /<button class="button primary" type="button">Buscar ISBN<\/button>/,
    );
    expect(html).toContain('Salvar livro');
  });
});
