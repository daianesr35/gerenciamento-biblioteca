import { ButtonLink, Card, PageHeading } from '@/components/ui';

export default function EditBookPage() {
  return (
    <div className="new-book-page">
      <PageHeading
        description="A edição dos dados do livro será conectada em uma tarefa posterior."
        title="Edição de Livro"
      />
      <Card className="new-book-card">
        <p className="muted">Nenhuma alteração será salva nesta etapa.</p>
        <div className="new-book-actions">
          <ButtonLink href="/biblioteca">Voltar à biblioteca</ButtonLink>
        </div>
      </Card>
    </div>
  );
}
