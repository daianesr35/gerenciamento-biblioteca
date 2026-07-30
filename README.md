# Gerenciamento de Biblioteca

## Acesso Rápido

- Aplicação publicada: [gerenciamento-biblioteca.vercel.app](https://gerenciamento-biblioteca.vercel.app)
- Repositório: [github.com/daianesr35/gerenciamento-biblioteca](https://github.com/daianesr35/gerenciamento-biblioteca)

## Sobre o projeto

Sistema web para gerenciamento de uma biblioteca pessoal. Permite organizar o
acervo, compartilhar um catálogo público e controlar solicitações, empréstimos e
devoluções.

## Tecnologias

- Next.js, React e TypeScript;
- Supabase (PostgreSQL, autenticação e Row Level Security);
- Google Books API para consulta de livros por ISBN;
- Vercel para hospedagem da aplicação;
- Vitest, Testing Library, ESLint e Prettier.

## Principais funcionalidades

- cadastro, login, sessão protegida e logout;
- cadastro manual e consulta de livros por ISBN;
- listagem, detalhes, edição e exclusão de livros;
- página pública da biblioteca com QR Code;
- criação e gerenciamento de solicitações públicas;
- registro de empréstimos, devoluções e histórico;
- isolamento dos dados de cada biblioteca com RLS.

## Execução local

### Pré-requisitos

- Git;
- Node.js 22 ou superior;
- npm;
- Docker Desktop.

### 1. Clonar e acessar o projeto

```bash
git clone https://github.com/daianesr35/gerenciamento-biblioteca.git
cd gerenciamento-biblioteca
```

### 2. Instalar as dependências

```bash
npm ci
```

### 3. Configurar as variáveis de ambiente

Copie `.env.example` para `.env.local` e configure somente no arquivo local:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_APP_URL
GOOGLE_BOOKS_API_KEY
```

Nunca versione `.env.local` ou valores de credenciais.

### 4. Iniciar o Supabase e a aplicação

Com o Docker Desktop em execução:

```bash
npm run db:start
npm run dev
```

A aplicação ficará disponível em [http://localhost:3000](http://localhost:3000).

## Comandos essenciais

```bash
npm ci
npm run db:start
npm run dev
npm run validate
npm run db:stop
```
