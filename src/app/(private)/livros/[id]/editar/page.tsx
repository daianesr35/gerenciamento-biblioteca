import Link from 'next/link';

import { ButtonLink, Card, PageHeading } from '@/components/ui';
import { getOwnBookById } from '@/services/books';

import { EditBookForm } from './edit-book-form';

function EditState({ message }: { message: string }) {
  return (
    <div className="new-book-page">
      <PageHeading description={message} title="Edição de Livro" />
      <Card className="new-book-card">
        <div className="new-book-actions">
          <ButtonLink href="/biblioteca">Voltar à biblioteca</ButtonLink>
        </div>
      </Card>
    </div>
  );
}

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getOwnBookById(id);

  if (result.status === 'invalid_id' || result.status === 'not_found') {
    return <EditState message="Livro não encontrado." />;
  }

  if (result.status === 'error') {
    return (
      <EditState message="Não foi possível carregar o livro. Tente novamente." />
    );
  }

  const { book } = result;

  return (
    <div className="new-book-page">
      <nav aria-label="Navegação estrutural" className="breadcrumb">
        <Link href="/biblioteca">Livros</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Editar livro</span>
      </nav>
      <PageHeading
        description="Atualize os dados bibliográficos do livro."
        title="Edição de Livro"
      />
      <Card className="new-book-card">
        <h2>Informações do livro</h2>
        <p className="muted">Edite somente os dados que deseja alterar.</p>
        <EditBookForm book={book} />
      </Card>
    </div>
  );
}
