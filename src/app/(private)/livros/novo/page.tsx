import { ButtonLink, Card, PageHeading } from '@/components/ui';

import { NewBookForm } from './new-book-form';

export default function NewBookPage() {
  return (
    <div className="new-book-page">
      <nav aria-label="Navegação estrutural" className="breadcrumb">
        <ButtonLink href="/biblioteca">Livros</ButtonLink>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Novo livro</span>
      </nav>

      <PageHeading
        description="Adicione um novo livro à sua biblioteca."
        title="Cadastro de Livro"
      />

      <Card className="new-book-card">
        <h2>Informações do livro</h2>
        <p className="muted">Preencha os dados bibliográficos disponíveis.</p>
        <NewBookForm />
      </Card>
    </div>
  );
}
