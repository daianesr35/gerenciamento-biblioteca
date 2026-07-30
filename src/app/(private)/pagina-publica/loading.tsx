export default function LoadingPublicPage() {
  return (
    <div className="public-page">
      <header className="public-page-heading">
        <div>
          <h1>Página Pública</h1>
          <p>Compartilhe sua biblioteca com outras pessoas.</p>
        </div>
      </header>
      <section aria-busy="true" className="card empty-state" role="status">
        <p>Carregando Página Pública...</p>
      </section>
    </div>
  );
}
