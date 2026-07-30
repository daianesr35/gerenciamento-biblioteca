# Matriz de Rastreabilidade — Etapa 12

Data da validação: 30 de julho de 2026.

| Critério de funcionamento da SDD                        | Evidências existentes reutilizadas                                                      | Resultado |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------- |
| Cadastro e login do proprietário                        | `auth.test.ts`, actions de Cadastro/Login, provisionamento SQL e testes de sessão/proxy | Aprovado  |
| Cadastro manual de Livros                               | testes de `books`, formulário, action e adaptador Supabase                              | Aprovado  |
| Consulta Google Books por ISBN                          | testes de adaptador, Service, action, preenchimento editável, erro e timeout            | Aprovado  |
| Revisão antes do cadastro e fallback manual             | testes de `new-book-form` e separação entre Buscar ISBN e Salvar Livro                  | Aprovado  |
| Listar, editar e excluir Livros                         | testes de Service, adaptadores, páginas e actions do catálogo                           | Aprovado  |
| Situação Disponível/Emprestado                          | testes do catálogo, solicitações e operações atômicas SQL                               | Aprovado  |
| Registrar empréstimos e devoluções                      | testes de `loans`, actions, página e `operacoes_atomicas_emprestimos.sql`               | Aprovado  |
| Gerar QR Code único da Biblioteca                       | testes de URL pública, página privada e `public-page-sharing`                           | Aprovado  |
| Enviar solicitação pelo acesso público                  | testes da página pública, action, Service, RPC e RLS                                    | Aprovado  |
| Confirmar ou recusar solicitações                       | testes privados de solicitações e `gerenciamento_solicitacoes_privadas.sql`             | Aprovado  |
| Impedir confirmação de Livro indisponível               | testes SQL de atomicidade, repetição, concorrência lógica e rollback                    | Aprovado  |
| Manter Livros, Solicitações e Empréstimos sincronizados | testes SQL de confirmação, empréstimo direto, devolução, backfill e RLS                 | Aprovado  |

## Execução consolidada

- `git diff --check`, ESLint, Prettier, TypeScript e build de produção: aprovados.
- Vitest: 41 arquivos e 200 testes aprovados.
- Banco local limpo: oito migrations aplicadas em ordem.
- Quatro scripts SQL transacionais: aprovados diretamente com `psql -v ON_ERROR_STOP=1`.
- `supabase test db`: executou os scripts sem exceções funcionais, mas retornou código 1 por ausência de plano TAP; os arquivos usam `DO/RAISE`, não pgTAP.
- Lint do schema `public`: sem erros.
- Advisors locais de segurança e desempenho: sem apontamentos.
- RLS, isolamento entre proprietários, grants mínimos, autenticação das RPCs e atomicidade: cobertos pelos scripts SQL aprovados.
- Segredos e temporários: nenhum segredo, `.env.local`, build, dependência, log ou arquivo temporário versionado.

Não foi necessário criar ou alterar testes nem corrigir código.
