import Link from 'next/link';
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { useId } from 'react';

export function Button({
  children,
  variant = 'secondary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  return (
    <button className={`button ${variant} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  href,
  variant = 'secondary',
}: {
  children: ReactNode;
  href: string;
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  return (
    <Link className={`button ${variant}`} href={href}>
      {children}
    </Link>
  );
}

export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`card ${className}`.trim()}>{children}</section>;
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'success' | 'info' | 'warning' | 'danger' | 'neutral';
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

type FieldProps = {
  label: string;
  error?: string;
  hint?: string;
};

export function Input({
  label,
  error,
  hint,
  id,
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const generatedId = useId();
  const fieldId = id ?? props.name ?? generatedId;
  const describedBy = [
    hint ? `${fieldId}-hint` : undefined,
    error ? `${fieldId}-error` : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="field">
      <label htmlFor={fieldId}>{label}</label>
      <input
        aria-describedby={describedBy || undefined}
        aria-invalid={Boolean(error)}
        id={fieldId}
        {...props}
      />
      {hint && (
        <small className="muted" id={`${fieldId}-hint`}>
          {hint}
        </small>
      )}
      {error && (
        <span className="error" id={`${fieldId}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}

export function Select({
  label,
  error,
  hint,
  children,
  id,
  ...props
}: FieldProps &
  SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  const generatedId = useId();
  const fieldId = id ?? props.name ?? generatedId;
  const describedBy = [
    hint ? `${fieldId}-hint` : undefined,
    error ? `${fieldId}-error` : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="field">
      <label htmlFor={fieldId}>{label}</label>
      <select
        aria-describedby={describedBy || undefined}
        aria-invalid={Boolean(error)}
        id={fieldId}
        {...props}
      >
        {children}
      </select>
      {hint && (
        <small className="muted" id={`${fieldId}-hint`}>
          {hint}
        </small>
      )}
      {error && (
        <span className="error" id={`${fieldId}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}

export function Textarea({
  label,
  error,
  hint,
  id,
  ...props
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const generatedId = useId();
  const fieldId = id ?? props.name ?? generatedId;
  const describedBy = [
    hint ? `${fieldId}-hint` : undefined,
    error ? `${fieldId}-error` : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="field">
      <label htmlFor={fieldId}>{label}</label>
      <textarea
        aria-describedby={describedBy || undefined}
        aria-invalid={Boolean(error)}
        id={fieldId}
        {...props}
      />
      {hint && (
        <small className="muted" id={`${fieldId}-hint`}>
          {hint}
        </small>
      )}
      {error && (
        <span className="error" id={`${fieldId}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}

export function SearchField({
  label = 'Pesquisar',
  placeholder,
  value,
  onChange,
}: {
  label?: string;
  placeholder: string;
  value?: string;
  onChange?: InputHTMLAttributes<HTMLInputElement>['onChange'];
}) {
  const fieldId = useId();

  return (
    <div className="search-field">
      <label className="sr-only" htmlFor={fieldId}>
        {label}
      </label>
      <input
        id={fieldId}
        onChange={onChange}
        placeholder={placeholder}
        type="search"
        value={value}
      />
    </div>
  );
}

export function CoverPlaceholder({
  label = 'Capa indisponível',
}: {
  label?: string;
}) {
  return (
    <div aria-label={label} className="cover-placeholder" role="img">
      <svg aria-hidden="true" fill="none" viewBox="0 0 48 48">
        <path d="M24 13c-5-5-12-6-19-4v27c7-2 14-1 19 4m0-27c5-5 12-6 19-4v27c-7-2-14-1-19 4m0-27v27" />
      </svg>
    </div>
  );
}

export function Pagination({
  summary,
  pageSize,
}: {
  summary?: string;
  pageSize?: string;
} = {}) {
  return (
    <div className="pagination-row">
      {summary && <p className="pagination-summary">{summary}</p>}
      <nav aria-label="Paginação" className="pagination">
        <Button aria-label="Página anterior" disabled>
          ‹
        </Button>
        <Button aria-current="page" variant="primary">
          1
        </Button>
        <Button aria-label="Ir para a página 2">2</Button>
        <Button aria-label="Ir para a página 3">3</Button>
        <span aria-hidden="true" className="pagination-ellipsis">
          …
        </span>
        <Button aria-label="Ir para a página 23">23</Button>
        <Button aria-label="Próxima página">›</Button>
      </nav>
      {pageSize && (
        <label className="page-size">
          <span className="sr-only">Livros por página</span>
          <select defaultValue="12">
            <option value="12">{pageSize}</option>
          </select>
        </label>
      )}
    </div>
  );
}

export function PageHeading({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-heading">
      <div>
        <h1>{title}</h1>
        <p className="subtitle">{description}</p>
      </div>
      {action}
    </header>
  );
}

export function StatCard({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string;
  label: string;
}) {
  return (
    <Card className="stat-card">
      <span aria-hidden="true" className="stat-icon">
        {icon}
      </span>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </Card>
  );
}
