'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

import {
  Button,
  ButtonLink,
  Card,
  CoverPlaceholder,
  Input,
  PageHeading,
  Select,
  Textarea,
} from '@/components/ui';

function Icon({
  name,
}: {
  name:
    | 'barcode'
    | 'calendar'
    | 'check'
    | 'info'
    | 'language'
    | 'pages'
    | 'publisher'
    | 'search'
    | 'save';
}) {
  const paths = {
    barcode: <path d="M4 5v14M7 5v14M11 5v14M14 5v14M18 5v14M20 5v14" />,
    calendar: (
      <>
        <rect height="16" rx="2" width="18" x="3" y="5" />
        <path d="M7 3v4M17 3v4M3 10h18" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6M12 7h.01" />
      </>
    ),
    language: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c3 3 4 6 4 9s-1 6-4 9c-3-3-4-6-4-9s1-6 4-9Z" />
      </>
    ),
    pages: (
      <>
        <path d="M6 3h9l3 3v15H6Z" />
        <path d="M15 3v4h4M9 11h6M9 15h6" />
      </>
    ),
    publisher: (
      <>
        <path d="M4 20V7l8-4 8 4v13M2 20h20" />
        <path d="M8 10h8M8 14h8" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    save: (
      <>
        <path d="M5 3h12l3 3v15H4V4a1 1 0 0 1 1-1Z" />
        <path d="M8 3v6h8V3M8 21v-7h8v7" />
      </>
    ),
  } as const;

  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}

export default function NewBookPage() {
  const pathname = usePathname();
  const isEditing = pathname.endsWith('/editar');
  const bookId = isEditing
    ? pathname.split('/').filter(Boolean).at(-2)
    : undefined;
  const detailsHref = bookId ? `/livros/${bookId}` : '/biblioteca';
  const [manual, setManual] = useState(isEditing);
  const [feedback, setFeedback] = useState('');
  const [searched, setSearched] = useState(false);

  return (
    <div className="new-book-page">
      <nav aria-label="Navegação estrutural" className="breadcrumb">
        <ButtonLink href="/biblioteca">Livros</ButtonLink>
        <span aria-hidden="true">›</span>
        <span aria-current="page">
          {isEditing ? 'Editar livro' : 'Novo livro'}
        </span>
      </nav>
      <PageHeading
        description={
          isEditing
            ? 'Edite as informações do livro selecionado.'
            : 'Adicione um novo livro à sua biblioteca.'
        }
        title={isEditing ? 'Edição de Livro' : 'Cadastro de Livro'}
      />

      <div className="new-book-layout">
        <div className="new-book-form-column">
          <Card className="new-book-card isbn-card">
            <h2>1. Buscar informações (recomendado)</h2>
            <p className="muted">
              Informe o ISBN para buscar os dados automaticamente no Google
              Books.
            </p>
            <div className="isbn-search-row">
              <div className="icon-field">
                <span aria-hidden="true" className="field-icon">
                  <Icon name="barcode" />
                </span>
                <Input
                  error={
                    searched
                      ? 'Livro não localizado nos dados simulados. Ative o preenchimento manual.'
                      : undefined
                  }
                  label="ISBN"
                  name="isbn-search"
                  placeholder="Ex.: 9788535932786"
                />
              </div>
              <Button
                onClick={() => {
                  setSearched(true);
                  setManual(true);
                }}
                type="button"
                variant="primary"
              >
                <Icon name="search" />
                Buscar no Google Books
              </Button>
            </div>
            <div className="form-notice" role="note">
              <Icon name="info" />
              <span>
                O sistema buscará as informações do livro e preencherá os campos
                automaticamente.
              </span>
            </div>
          </Card>

          <Card className="new-book-card book-information-card">
            <div className="book-information-heading">
              <div>
                <h2>2. Informações do livro</h2>
                <p className="muted">Preencha ou revise os dados do livro.</p>
              </div>
              <label className="manual-toggle">
                <input
                  checked={manual}
                  onChange={(event) => setManual(event.target.checked)}
                  type="checkbox"
                />
                <span aria-hidden="true" className="toggle-track" />
                <span>
                  <strong>Preenchimento manual</strong>
                  <small>Ativar quando o livro não for encontrado</small>
                </span>
              </label>
            </div>

            <form
              className="book-form-grid"
              id="new-book-form"
              onSubmit={(event) => {
                event.preventDefault();
                const form = event.currentTarget;
                if (!form.checkValidity()) {
                  form.reportValidity();
                  return;
                }
                setFeedback(
                  isEditing
                    ? 'Alterações validadas. O salvamento definitivo será integrado em etapa futura.'
                    : 'Livro validado. O salvamento definitivo será integrado em etapa futura.',
                );
              }}
            >
              <Input
                disabled={!manual}
                label="Título *"
                name="title"
                placeholder="Título do livro"
                defaultValue={isEditing ? 'O Senhor dos Anéis' : undefined}
                required
              />
              <Input
                disabled={!manual}
                label="Subtítulo"
                name="subtitle"
                placeholder="Subtítulo do livro (opcional)"
                defaultValue={isEditing ? 'A Sociedade do Anel' : undefined}
              />
              <Input
                disabled={!manual}
                hint="Separe vários autores por vírgula"
                label="Autores *"
                name="authors"
                placeholder="Ex.: J.R.R. Tolkien"
                defaultValue={isEditing ? 'J.R.R. Tolkien' : undefined}
                required
              />
              <Input
                disabled={!manual}
                label="Editora"
                name="publisher"
                placeholder="Ex.: HarperCollins Brasil"
                defaultValue={isEditing ? 'HarperCollins Brasil' : undefined}
              />
              <div className="icon-field year-field">
                <span aria-hidden="true" className="field-icon">
                  <Icon name="calendar" />
                </span>
                <Input
                  disabled={!manual}
                  label="Ano de publicação"
                  name="year"
                  placeholder="Ex.: 2023"
                  defaultValue={isEditing ? '1954' : undefined}
                />
              </div>
              <Input
                disabled={!manual}
                label="Número de páginas"
                name="pages"
                placeholder="Ex.: 384"
                type="number"
                defaultValue={isEditing ? '423' : undefined}
              />
              <Select
                defaultValue={isEditing ? 'Português' : ''}
                disabled={!manual}
                label="Idioma"
                name="language"
              >
                <option value="">Selecione o idioma</option>
                <option>Português</option>
                <option>Inglês</option>
              </Select>
              <Input
                disabled={!manual}
                label="ISBN"
                name="isbn"
                placeholder="Ex.: 9788535932786"
                defaultValue={isEditing ? '9788536502618' : undefined}
              />
              <Select
                defaultValue={isEditing ? 'Fantasia' : ''}
                disabled={!manual}
                label="Categorias"
                name="categories"
              >
                <option value="">Selecione ou digite as categorias</option>
                <option>Fantasia</option>
                <option>Ficção</option>
                <option>Literatura brasileira</option>
              </Select>
              <div className="book-description-field">
                <Textarea
                  disabled={!manual}
                  label="Descrição"
                  maxLength={1000}
                  name="description"
                  placeholder="Resumo ou descrição do livro (opcional)"
                  defaultValue={
                    isEditing
                      ? 'A Sociedade do Anel é o primeiro volume da trilogia épica O Senhor dos Anéis.'
                      : undefined
                  }
                />
                <span aria-hidden="true" className="character-count">
                  0/1000
                </span>
              </div>
              <div className="form-notice important-notice" role="note">
                <Icon name="info" />
                <span>
                  <strong>Importante:</strong> A capa do livro será exibida
                  somente quando fornecida automaticamente pela API Google
                  Books. O sistema não possui upload nem{' '}
                  {isEditing ? 'edição' : 'cadastro'} manual de capa.
                </span>
              </div>
            </form>
          </Card>
        </div>

        <Card className="new-book-card new-book-preview">
          <h2>Prévia do livro</h2>
          <p className="muted">Verifique como as informações serão exibidas.</p>
          <div className="preview-panel">
            <div className="preview-book">
              <div className="preview-cover">
                <CoverPlaceholder />
                <span>Capa indisponível</span>
              </div>
              <div className="preview-copy">
                <h2>{isEditing ? 'O Senhor dos Anéis' : 'Título do livro'}</h2>
                <p className="muted preview-author">
                  {isEditing ? 'J.R.R. Tolkien' : 'Autor ou autores'}
                </p>
                <ul className="preview-metadata">
                  <li>
                    <Icon name="publisher" /> Editora
                  </li>
                  <li>
                    <Icon name="calendar" /> Ano de publicação
                  </li>
                  <li>
                    <Icon name="pages" /> Páginas
                  </li>
                  <li>
                    <Icon name="language" /> Idioma
                  </li>
                  <li>
                    <Icon name="barcode" /> ISBN
                  </li>
                </ul>
                <div className="preview-tags">
                  <span>Categoria 1</span>
                  <span>+ Categoria</span>
                </div>
              </div>
            </div>
            <div className="preview-description">
              <h3>Descrição</h3>
              <p>
                {isEditing
                  ? 'A Sociedade do Anel é o primeiro volume da trilogia épica O Senhor dos Anéis.'
                  : 'A descrição do livro aparecerá aqui.'}
              </p>
            </div>
          </div>
          <div className="tips-card">
            <h3>
              <Icon name="check" /> Dicas
            </h3>
            <ul>
              <li>
                <Icon name="check" /> Use o ISBN para obter dados mais precisos.
              </li>
              <li>
                <Icon name="check" /> Se o livro não for encontrado, ative o
                preenchimento manual.
              </li>
              <li>
                <Icon name="check" /> Você poderá editar os dados depois de
                salvar.
              </li>
            </ul>
          </div>
        </Card>
      </div>

      <div className="new-book-actions">
        <ButtonLink href={detailsHref}>Cancelar</ButtonLink>
        <Button
          disabled={!manual}
          form="new-book-form"
          type="submit"
          variant="primary"
        >
          <Icon name="save" />
          {isEditing ? 'Salvar alterações' : 'Salvar livro'}
        </Button>
      </div>
      {feedback && (
        <div aria-live="polite" className="feedback" role="status">
          {feedback}
        </div>
      )}
    </div>
  );
}
