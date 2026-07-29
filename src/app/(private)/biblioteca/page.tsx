import { BookCard } from '@/components/book-card';
import { ButtonLink, PageHeading } from '@/components/ui';
import { listOwnBooks } from '@/services/books';

export default async function LibraryPage() {
  const result = await listOwnBooks();

  return (
    <div className="library-page">
      <PageHeading
        action={
          <ButtonLink href="/livros/novo" variant="primary">
            <span aria-hidden="true">＋</span>
            Adicionar livro
          </ButtonLink>
        }
        description="Organize, encontre e gerencie todos os livros da sua coleção."
        title="Minha Biblioteca"
      />
      <div
        aria-label="Visão da biblioteca"
        className="library-collection-banner"
        role="img"
      />
      {result.status === 'error' ? (
        <section className="card empty-state" role="alert">
          <h2>Não foi possível carregar os livros</h2>
          <p className="muted">Tente novamente.</p>
        </section>
      ) : result.books.length ? (
        <div className="book-grid">
          {result.books.map((book) => (
            <BookCard book={book} compactActions key={book.id} />
          ))}
        </div>
      ) : (
        <section className="card empty-state">
          <span aria-hidden="true" className="cover-placeholder">
            ♧
          </span>
          <h2>Ainda não há livros cadastrados</h2>
          <p className="muted">
            Adicione o primeiro livro para começar sua coleção.
          </p>
          <ButtonLink href="/livros/novo" variant="primary">
            Adicionar livro
          </ButtonLink>
        </section>
      )}
    </div>
  );
}
