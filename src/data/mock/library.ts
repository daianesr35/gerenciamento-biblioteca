export type BookStatus = 'Disponível' | 'Emprestado';
export type RequestStatus = 'Pendente' | 'Aprovada' | 'Recusada';
export type LoanStatus = 'Emprestado' | 'Devolvido';

export type MockBook = Readonly<{
  id: string;
  title: string;
  author: string;
  category: string;
  status: BookStatus;
}>;

export const books: readonly MockBook[] = [
  {
    id: 'senhor-dos-aneis',
    title: 'O Senhor dos Anéis',
    author: 'J.R.R. Tolkien',
    category: 'Fantasia',
    status: 'Disponível',
  },
  {
    id: '1984',
    title: '1984',
    author: 'George Orwell',
    category: 'Ficção',
    status: 'Disponível',
  },
  {
    id: 'sapiens',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    category: 'História',
    status: 'Disponível',
  },
  {
    id: 'hobbit',
    title: 'O Hobbit',
    author: 'J.R.R. Tolkien',
    category: 'Fantasia',
    status: 'Emprestado',
  },
  {
    id: 'dom-casmurro',
    title: 'Dom Casmurro',
    author: 'Machado de Assis',
    category: 'Literatura brasileira',
    status: 'Disponível',
  },
  {
    id: 'codigo-da-vinci',
    title: 'O Código Da Vinci',
    author: 'Dan Brown',
    category: 'Mistério',
    status: 'Emprestado',
  },
];

export const requests = [
  {
    book: 'O Hobbit',
    person: 'José Silva',
    requestedAt: '15/05/2026',
    status: 'Pendente' as RequestStatus,
  },
  {
    book: '1984',
    person: 'Maria Oliveira',
    requestedAt: '14/05/2026',
    status: 'Pendente' as RequestStatus,
  },
  {
    book: 'Sapiens',
    person: 'Lucas Martins',
    requestedAt: '13/05/2026',
    status: 'Aprovada' as RequestStatus,
  },
  {
    book: 'O Código Da Vinci',
    person: 'Fernanda Costa',
    requestedAt: '09/05/2026',
    status: 'Recusada' as RequestStatus,
  },
] as const;

export const loans = [
  {
    book: 'O Hobbit',
    person: 'José Silva',
    phone: '(87) 99999-9999',
    email: 'jose.silva@email.com',
    origin: 'Amigo',
    loanedAt: '15/05/2026',
    returnedAt: null,
    status: 'Emprestado' as LoanStatus,
  },
  {
    book: '1984',
    person: 'Maria Oliveira',
    phone: '(87) 98888-8888',
    email: 'maria.oliveira@email.com',
    origin: 'Trabalho',
    loanedAt: '14/05/2026',
    returnedAt: null,
    status: 'Emprestado' as LoanStatus,
  },
  {
    book: 'Sapiens',
    person: 'Lucas Martins',
    phone: '(87) 99123-4567',
    email: 'lucas.martins@email.com',
    origin: 'Faculdade',
    loanedAt: '10/04/2026',
    returnedAt: '25/04/2026',
    status: 'Devolvido' as LoanStatus,
  },
] as const;
