# gerenciamento-biblioteca

Sistema web para gerenciamento de biblioteca pessoal.

## Requisitos

- Node.js 22 ou superior;
- npm;
- variáveis locais copiadas de `.env.example` para `.env.local`.

## Execução local

```bash
npm install
copy .env.example .env.local
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

## Verificações

```bash
npm run lint
npm run format:check
npm run typecheck
npm run test
npm run build
```

O comando `npm run validate` executa toda a sequência acima.

As decisões e responsabilidades arquiteturais estão documentadas em
[`docs/arquitetura.md`](docs/arquitetura.md).
