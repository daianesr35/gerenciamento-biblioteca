# Plano técnico do catálogo manual — Etapa 7

## 1. Objetivo e limites

A Etapa 7 deve permitir que o Proprietário autenticado mantenha manualmente os
Livros de sua própria Biblioteca: listar, cadastrar, consultar detalhes, editar
os dados bibliográficos e excluir quando o modelo permitir. A interface também
deve exibir a situação `Disponível` ou `Emprestado`, e todo Livro novo deve
iniciar como `Disponível`.

O MVP desta etapa não inclui Google Books, consulta automática por ISBN, leitura
de código de barras, upload, Storage, pesquisa pública, QR Code, solicitações,
empréstimos, devoluções, histórico, mudança manual de situação, categorias,
subtítulo, descrição, ano, páginas, idioma, favoritos, avaliações, importação,
paginação complexa, filtros avançados, soft delete ou refatorações gerais.

## 2. Estado encontrado no repositório

### 2.1 Git e estrutura

- branch: `main`;
- `HEAD`: `d01f722` (`feat(auth): concluir tarefa 6.6 - logout`);
- remoto: `origin`, apontando para o repositório GitHub do projeto;
- rastreamento: `main` no mesmo commit de `origin/main`;
- estado antes desta tarefa: árvore limpa, sem modificados ou não rastreados;
- estrutura relevante: rotas em `src/app`, componentes em `src/components`,
  regras em `src/services`, adaptadores em `src/data`, contratos em `src/types`,
  migrations e testes SQL em `supabase`.

A sincronização foi confirmada pelas referências locais e pelo rastreamento do
Git, sem `fetch`, push ou outra operação remota.

### 2.2 Páginas e componentes existentes

| Recurso               | Estado encontrado                                                                                                                                  | Uso na Etapa 7                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `/biblioteca`         | Client Component com busca, filtros, estatísticas, cards, estado vazio e paginação simulados sobre `books`                                         | converter a composição de dados para dados reais; simplificar controles fora do MVP             |
| `/livros/novo`        | formulário simulado com estado local e mensagem de “etapa futura”                                                                                  | preservar a base visual, reduzir aos campos da SDD e integrar por Server Action                 |
| `/livros/[id]`        | Server Component que procura o Livro no mock e usa `notFound()`                                                                                    | trocar o mock pela consulta real e limitar ações à Etapa 7                                      |
| `/livros/[id]/editar` | reexporta a página de cadastro, que detecta edição pelo pathname                                                                                   | reutilizar um formulário comum com dados reais, sem depender do pathname para regras de domínio |
| `BookCard`            | card visual acoplado a `MockBook`                                                                                                                  | desacoplar do mock e receber o contrato mínimo de Livro                                         |
| `AppShell`            | navegação privada e Logout já integrados                                                                                                           | reutilizar sem nova navegação ou novo shell                                                     |
| `ui.tsx`              | `Button`, `ButtonLink`, `Card`, `Badge`, `Input`, `Select`, `Textarea`, `SearchField`, `CoverPlaceholder`, `Pagination`, `PageHeading`, `StatCard` | reutilizar os componentes aplicáveis; não usar paginação no MVP                                 |

O Design System já define padrões para campos, erros, badges, botões, cards,
feedback, estado vazio e foco. Não existe diálogo compartilhado de confirmação.
Uma confirmação simples de exclusão poderá ser um pequeno Client Component
local, sem criar um sistema genérico de modais.

As telas simuladas contêm Google Books, categoria, subtítulo, descrição, ano,
páginas, idioma, prévia, empréstimo, solicitação, devolução, atividade e
paginação. Esses elementos são incompatíveis com o escopo atual e devem ser
ocultados ou removidos das composições afetadas quando cada fluxo for integrado,
preservando estilos e componentes úteis.

### 2.3 Serviços, adaptadores, contratos e testes

Não há `types`, service, adaptador, Server Action ou teste TypeScript do
catálogo. O único dado usado pela interface é `src/data/mock/library.ts`.

O padrão real da autenticação separa:

1. contratos compartilhados em `src/types`;
2. validação, normalização, coordenação e erros seguros em `src/services`;
3. chamadas ao Supabase em `src/data/supabase`;
4. Server Actions junto às rotas de mutação;
5. Server Components para identidade, proteção e composição inicial;
6. Client Components somente para interação e estado pendente.

Esse padrão deve ser repetido apenas no mínimo necessário ao catálogo. Os testes
Vitest ficam próximos dos módulos testados. O teste SQL
`supabase/tests/rls_e_acesso_publico.sql` já cobre SELECT isolado por
Proprietário, INSERT/UPDATE/DELETE próprios, um INSERT que usa a situação padrão,
tentativa de INSERT cruzado, transferência cruzada e DELETE cruzado sem efeito.
O teste exercita o padrão, mas não possui uma asserção específica sobre o valor
`disponivel`; essa comprovação deve ser acrescentada na validação integrada da
Etapa 7. Ele também cobre a RPC pública de Livros, que pertence a etapa futura e
não deve ser usada no CRUD privado.

### 2.4 Lacunas reais

- ausência da camada tipada de catálogo, validações, adaptador e casos de uso;
- páginas ainda ligadas a mocks e campos/ações fora da SDD ou de etapas futuras;
- ausência de carregamento real, mutações, revalidação e redirecionamentos;
- ausência de confirmação e tratamento funcional da exclusão;
- ausência de testes TypeScript do catálogo;
- o SQL atual testa operações próprias e parte das negações cruzadas, mas deverá
  explicitar, na validação integrada, todas as operações negadas sobre Livros;

## 3. Modelo de dados confirmado

### 3.1 Tabela `public.livros`

| Coluna          | Tipo   | Nulabilidade       | Padrão e regras                                                   |
| --------------- | ------ | ------------------ | ----------------------------------------------------------------- |
| `id`            | `uuid` | `NOT NULL` pela PK | `gen_random_uuid()`; chave primária                               |
| `biblioteca_id` | `uuid` | `NOT NULL`         | FK para `public.bibliotecas(id)`, `ON DELETE RESTRICT`            |
| `isbn`          | `text` | aceita `NULL`      | se informado, `btrim(isbn) <> ''`; não é único                    |
| `titulo`        | `text` | `NOT NULL`         | `btrim(titulo) <> ''`                                             |
| `autor`         | `text` | `NOT NULL`         | `btrim(autor) <> ''`; autores permanecem em texto único           |
| `editora`       | `text` | aceita `NULL`      | se informada, não pode ser vazia após `btrim`                     |
| `imagem_capa`   | `text` | aceita `NULL`      | referência textual; se informada, não pode ser vazia após `btrim` |
| `situacao`      | `text` | `NOT NULL`         | padrão `disponivel`; somente `disponivel` ou `emprestado`         |

Constraints: PK implícita de `id`, `livros_isbn_nao_vazio`,
`livros_titulo_nao_vazio`, `livros_autor_nao_vazio`,
`livros_editora_nao_vazia`, `livros_imagem_capa_nao_vazia`,
`livros_situacao_valida` e `livros_biblioteca_fk`.

Existe somente o índice explícito `livros_biblioteca_id_idx` em
`biblioteca_id`, além do índice da chave primária. Não há índice de ISBN, título
ou situação, nem constraint de unicidade de ISBN. A mesma edição pode existir
mais de uma vez.

### 3.2 Propriedade e relacionamentos

O vínculo de propriedade é indireto:

```text
auth.users.id
  → proprietarios.usuario_auth_id
  → bibliotecas.proprietario_id
  → livros.biblioteca_id
```

Cada Livro pertence a exatamente uma Biblioteca; uma Biblioteca possui zero ou
muitos Livros. O provisionamento após `auth.users` cria exatamente um
Proprietário e sua Biblioteca. O catálogo deve consultar essa Biblioteca no
servidor e nunca aceitar `biblioteca_id` fornecido pelo formulário.

`solicitacoes.livro_id` e `emprestimos.livro_id` referenciam `livros.id` com
`ON DELETE RESTRICT`. Assim, Livro sem registros relacionados pode ser excluído
definitivamente; Livro referenciado por Solicitação ou Empréstimo não pode.
Não há cascata, soft delete ou lixeira.

Não há trigger, função ou procedure privada específica para o CRUD do catálogo.
As funções `listar_livros_publicos` e `criar_solicitacao_publica` atendem ao
fluxo anônimo futuro e não devem ser reutilizadas pela área privada. O trigger
de provisionamento atua em `auth.users`, não em `livros`.

## 4. RLS confirmada

RLS está habilitada em `public.livros`. `anon` e `authenticated` têm seus
privilégios anteriores revogados; `authenticated` recebe SELECT, INSERT, UPDATE
e DELETE. Quatro policies restringem as linhas por junção entre Livro,
Biblioteca, Proprietário e `(select auth.uid())`:

| Operação | Policy                   | Regra                                                                                   |
| -------- | ------------------------ | --------------------------------------------------------------------------------------- |
| SELECT   | `livros_select_proprios` | `USING` exige Biblioteca cujo Proprietário tenha `usuario_auth_id = auth.uid()`         |
| INSERT   | `livros_insert_proprios` | `WITH CHECK` exige o mesmo pertencimento para `biblioteca_id`                           |
| UPDATE   | `livros_update_proprios` | `USING` protege a linha atual e `WITH CHECK` impede transferência para outra Biblioteca |
| DELETE   | `livros_delete_proprios` | `USING` permite excluir somente Livro próprio                                           |

A RLS é a barreira definitiva contra acesso cruzado. A consulta por identificador
deve tratar zero linhas como “não encontrado ou inacessível”, sem revelar se o
Livro de outro Proprietário existe. A aplicação ainda deve derivar a Biblioteca
da sessão no servidor e não confiar em identificadores enviados pelo cliente.

## 5. Arquitetura proposta

### 5.1 Fluxo comum

As rotas continuam protegidas pelo Proxy e por `src/app/(private)/layout.tsx`.
Server Components e Server Actions reutilizam
`createSupabaseServerClient()`; o cliente de navegador não é necessário para o
CRUD inicial. `getServerAuthIdentity()` permanece como identidade validada, sem
sessão própria, token manual, `localStorage` ou `service_role`.

O fluxo mínimo será:

```text
Server Component ou Server Action
  → service do catálogo
  → adaptador Supabase do catálogo
  → public.livros sob RLS
```

O adaptador deve:

- obter a Biblioteca visível ao usuário autenticado por consulta sob RLS;
- selecionar apenas colunas necessárias;
- ordenar a listagem de modo determinístico, preferencialmente por `titulo` e
  `id`, pois `livros` não possui timestamp;
- consultar detalhe com `id` e depender da RLS;
- no INSERT, usar a Biblioteca obtida no servidor e omitir `situacao`, deixando
  o padrão do banco atuar;
- no UPDATE, alterar somente `isbn`, `titulo`, `autor`, `editora` e
  `imagem_capa`, nunca `biblioteca_id` ou `situacao`;
- no DELETE, excluir por `id` e distinguir somente sucesso, não encontrado/
  inacessível e falha segura.

O service deve validar/normalizar entradas, mapear linhas, classificar erros por
código quando necessário e nunca repassar mensagens do Supabase. Server Actions
devem ler `FormData`, chamar o service, devolver estado serializável, executar
`revalidatePath` após sucesso e redirecionar conforme o fluxo:

- cadastro → detalhes do novo Livro;
- edição → detalhes do Livro;
- exclusão → `/biblioteca`.

Redirecionamentos devem ocorrer fora de blocos que convertam exceções, conforme
o padrão do Next.js. Componentes cliente ficam restritos a formulário,
`useActionState`, pendência, erros de campo e confirmação simples de exclusão.

## 6. Contratos mínimos

Os nomes finais podem acompanhar o padrão do código, mas o conteúdo mínimo deve
ser:

```ts
type BookStatus = 'disponivel' | 'emprestado';

type Book = Readonly<{
  id: string;
  isbn: string | null;
  title: string;
  author: string;
  publisher: string | null;
  coverImageUrl: string | null;
  status: BookStatus;
}>;

type CreateBookInput = Readonly<{
  isbn: string | null;
  title: string;
  author: string;
  publisher: string | null;
  coverImageUrl: string | null;
}>;

type UpdateBookInput = CreateBookInput & Readonly<{ id: string }>;
```

Consultas devem retornar `Book[]` para listagem e uma união discriminada para o
detalhe (`found`, `not_found`, `error`) ou lançar somente erro interno
normalizado no limite do service. Mutações devem usar uniões discriminadas
pequenas: `created`/`updated`/`deleted`, `invalid` com erros por campo,
`not_found` e `error` com categoria segura.

Categorias internas suficientes: `unavailable`, `related_records` e `unknown`.
A interface não deve receber SQL, nome de tabela, policy, constraint ou mensagem
original. Não criar repositório genérico, DTO base, result monad ou hierarquia de
exceções para três mutações.

## 7. Consultas necessárias

### 7.1 Listagem

Selecionar `id`, `isbn`, `titulo`, `autor`, `editora`, `imagem_capa` e
`situacao` de `livros`, sob RLS, sem paginação. A Biblioteca autenticada pode ser
resolvida separadamente para confirmar o provisionamento, mas o filtro explícito
por seu `biblioteca_id` é recomendado como intenção da consulta, mantendo a RLS
como defesa definitiva. Ordenação determinística local ao banco.

A página deve ter estados de sucesso com resultados, vazio e falha segura.
“Carregando” pode ser atendido por `loading.tsx` da rota se a consulta tornar o
estado perceptível; não é necessário introduzir cache ou framework de fetching.

### 7.2 Detalhe

Selecionar as mesmas colunas por UUID. Resultado sem linha deve produzir a mesma
experiência para Livro inexistente e Livro de outro Proprietário. UUID inválido
deve ser tratado sem expor erro técnico. A consulta não deve usar a RPC pública.

## 8. Mutações necessárias

### 8.1 Cadastro

Validar no servidor, resolver a Biblioteca autenticada e inserir somente os
cinco campos bibliográficos e `biblioteca_id`. Omitir `situacao` para preservar
o padrão `disponivel`. Retornar o `id` criado para redirecionamento.

### 8.2 Edição

Carregar o Livro real no servidor, preencher o formulário compartilhado e
atualizar somente campos bibliográficos. `situacao` será exibida no detalhe ou
listagem, mas não será campo editável. Não permitir troca de Biblioteca.

### 8.3 Exclusão

Exigir confirmação simples, executar DELETE por `id` sob RLS e redirecionar
somente no sucesso. Zero linhas é “Livro não encontrado ou inacessível”.
Violação de FK por Solicitação ou Empréstimo relacionada é falha compreensível,
sem remoção dos registros e sem alternativa de soft delete.

## 9. Validação

### 9.1 Confirmada no banco

- `titulo` e `autor`: obrigatórios e não vazios após `btrim`;
- `isbn`, `editora` e `imagem_capa`: opcionais, mas não vazios após `btrim`;
- `isbn`: texto sem formato ou unicidade impostos pelo banco;
- `imagem_capa`: texto, sem Storage ou upload;
- `situacao`: obrigatória, padrão `disponivel`, domínio fechado em
  `disponivel`/`emprestado`;
- `biblioteca_id`: obrigatório e protegido por FK e RLS;
- `id`: UUID gerado pelo banco.

### 9.2 Proposta para a interface

- aplicar `trim`; campos opcionais vazios viram `null`;
- título e autor recebem mensagens obrigatórias específicas;
- aceitar ISBN-10 ou ISBN-13 com hífens/espaços, validando localmente a
  quantidade de dígitos e o dígito verificador; preservar uma representação
  textual normalizada simples, sem consulta externa;
- URL de capa opcional deve usar `http:` ou `https:` válida; nenhuma requisição
  de validação remota;
- não impor limites de tamanho não existentes no schema nesta etapa; HTML pode
  orientar entrada, mas o servidor continua obrigatório;
- não renderizar `situacao` nem `biblioteca_id` como campos de formulário.

Mensagens propostas: “Informe o título.”, “Informe o autor.”, “Informe um ISBN
válido.” e “Informe uma URL de capa válida.”. Erros inesperados usam mensagem
geral do fluxo.

## 10. Páginas e componentes

### Reutilizar e alterar

- `src/app/(private)/biblioteca/page.tsx`: tornar Server Component de composição
  e extrair interação somente se necessária; retirar busca complexa, filtros,
  paginação e estatísticas não indispensáveis;
- `src/components/book-card.tsx`: receber `Book`, renderizar capa URL quando
  presente, fallback, situação e links reais;
- `src/app/(private)/livros/novo/page.tsx`: reduzir ao formulário manual;
- `src/app/(private)/livros/[id]/page.tsx`: usar consulta real e mostrar apenas
  metadados confirmados, editar e excluir;
- `src/app/(private)/livros/[id]/editar/page.tsx`: carregar dados reais e
  reutilizar o formulário;
- `src/components/ui.tsx`, `AppShell` e estilos atuais: reutilizar.

### Provavelmente criar

- contratos, service, adaptador e respectivos testes do catálogo;
- formulário compartilhado de Livro como Client Component;
- Server Actions de criação, edição e exclusão junto às rotas;
- pequeno controle cliente para confirmação de exclusão;
- opcionalmente `loading.tsx`/estado de erro local da rota, se necessário para
  representar os estados previstos sem arquitetura adicional.

### Remover apenas das composições afetadas

Elementos simulados de Google Books e campos não persistidos; ações de
emprestar, solicitar, devolver e atividade; filtros avançados e paginação
simulada. Não apagar mocks usados por páginas de outras etapas e não redesenhar
o sistema.

## 11. Estratégia de erros

| Cenário                                   | Mensagem segura                                                          |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| falha na listagem                         | “Não foi possível carregar os livros. Tente novamente.”                  |
| inexistente, UUID inválido ou inacessível | “Livro não encontrado.”                                                  |
| falha no cadastro                         | “Não foi possível cadastrar o livro. Tente novamente.”                   |
| falha na edição                           | “Não foi possível salvar as alterações. Tente novamente.”                |
| falha na exclusão                         | “Não foi possível excluir o livro. Tente novamente.”                     |
| Livro relacionado                         | “Este livro não pode ser excluído porque possui registros relacionados.” |
| entrada inválida                          | mensagens por campo, sem detalhes internos                               |

O mapeamento pode reconhecer códigos Postgres conhecidos, mas nunca deve
comparar ou apresentar texto original como regra de interface. Logs de servidor,
se adicionados, devem evitar dados sensíveis e não são requisito do MVP.

## 12. Estratégia de testes

- unitários do service: trim, opcionais para `null`, ISBN-10/13, URL, obrigatórios,
  mapeamento snake_case/camelCase e normalização segura de erro;
- adaptador: projeções, filtros, biblioteca obtida no servidor, INSERT sem
  `situacao`, UPDATE sem `situacao`/`biblioteca_id`, DELETE e zero linhas;
- Server Actions: `FormData`, repetição da validação, estados, revalidação e
  destinos de sucesso;
- listagem: dados reais, situação correta, capa/fallback, vazio e erro;
- cadastro: válido, inválido, Livro criado na Biblioteca própria e situação
  padrão `disponivel`;
- detalhes: próprio, inexistente, UUID inválido e UUID de outro Proprietário;
- edição: preenchimento real, campos bibliográficos, tentativa cruzada e
  preservação de situação/Biblioteca;
- exclusão: sucesso sem vínculos, cancelamento, inexistente/inacessível e bloqueio
  por Solicitação ou Empréstimo;
- SQL/RLS: SELECT, INSERT, UPDATE e DELETE próprios e negados entre dois
  Proprietários; transferência de Biblioteca negada; situação padrão;
- falhas: nenhuma mensagem de Supabase, policy, constraint ou tabela chega à UI.

Na Tarefa 7.8, executar reconstrução/testes SQL locais se a infraestrutura
estiver disponível, além de `npm run validate`. Testes já existentes devem
permanecer aprovados.

## 13. Riscos e controles

| Risco                             | Controle                                              |
| --------------------------------- | ----------------------------------------------------- |
| duplicar cliente Supabase         | reutilizar `createSupabaseServerClient()`             |
| confiar no cliente                | validar no servidor e manter RLS                      |
| aceitar `biblioteca_id` externo   | resolver Biblioteca pela sessão                       |
| acesso cruzado                    | consultas sob RLS e testes com dois Proprietários     |
| alterar `situacao` manualmente    | omitir dos contratos de entrada e queries de mutação  |
| migration desnecessária           | schema atual já atende à SDD; não criar migration     |
| exclusão com vínculos             | capturar restrição e informar mensagem segura         |
| antecipar Google Books            | remover/ocultar a simulação no formulário manual      |
| redesenho                         | reutilizar AppShell, tokens, estilos e componentes    |
| abstrações excessivas             | contratos e funções específicos ao catálogo           |
| filtros sobre campos inexistentes | retirar categoria e busca avançada                    |
| falta de timestamp                | ordenar por título e id, sem inventar “mais recentes” |

## 14. Divisão da Etapa 7

### 7.1 — Inspeção e planejamento técnico do catálogo

- **Objetivo/responsabilidade:** confirmar repositório, schema, RLS, arquitetura
  e interfaces, produzindo este plano.
- **Dependências:** Etapas 5 e 6.
- **Arquivos:** este documento e `docs/estado-do-projeto.md`.
- **Atividades/validações:** inspeção, confronto documental, diff,
  `git diff --check` e `npm run validate`.
- **Riscos:** pressupor schema ou alterar código.
- **Fora do escopo:** qualquer CRUD.
- **Aceitação/conclusão:** plano fiel ao repositório e somente documentação
  alterada.

### 7.2 — Camada mínima de consulta do catálogo

- **Objetivo/responsabilidade:** criar contratos de leitura, mapeamento,
  adaptador e service apenas para listar e consultar um Livro.
- **Dependências:** 7.1.
- **Arquivos prováveis:** `src/types/books.ts`, `src/services/books.ts`,
  `src/data/supabase/books.ts` e testes próximos.
- **Atividades:** resolver Biblioteca autenticada, projetar colunas, ordenar,
  consultar por UUID e normalizar falhas.
- **Validações:** testes unitários do mapeamento, queries, inacessibilidade e
  erros.
- **Riscos:** RPC pública, cliente concorrente ou abstração genérica.
- **Fora do escopo:** interface e mutações.
- **Aceitação/conclusão:** consultas testadas, tipadas e sob RLS, sem página
  conectada.

### 7.3 — Listagem real dos livros

- **Objetivo/responsabilidade:** substituir o mock da Biblioteca pela listagem
  real e seus estados.
- **Dependências:** 7.2.
- **Arquivos prováveis:** página `/biblioteca`, `BookCard`, estilos e testes.
- **Atividades:** Server Component, cards, capa/fallback, badge, vazio,
  carregamento/erro e remoção dos controles fora do MVP.
- **Validações:** lista, vazio, erro, links e situações.
- **Riscos:** manter categoria, estatísticas falsas ou paginação simulada.
- **Fora do escopo:** criação, edição, exclusão e busca avançada.
- **Aceitação/conclusão:** Proprietário vê somente seus Livros reais sem dados
  simulados.

### 7.4 — Cadastro manual de livro

- **Objetivo/responsabilidade:** cadastrar manualmente um Livro próprio.
- **Dependências:** 7.2 e listagem disponível em 7.3 para retorno consistente.
- **Arquivos prováveis:** formulário compartilhado, página `/livros/novo`,
  Server Action, service/adaptador e testes.
- **Atividades:** reduzir campos, validar, resolver Biblioteca, inserir sem
  situação, revalidar e redirecionar.
- **Validações:** campos, ISBN, URL, opcionais, erro seguro e padrão
  `disponivel`.
- **Riscos:** aceitar Biblioteca/situação ou antecipar Google Books.
- **Fora do escopo:** consulta externa e upload.
- **Aceitação/conclusão:** cadastro válido persiste na Biblioteca própria como
  Disponível; inválido não persiste.

### 7.5 — Detalhes do livro

- **Objetivo/responsabilidade:** exibir um Livro próprio por identificador.
- **Dependências:** 7.2 e 7.4 para exercício completo.
- **Arquivos prováveis:** página `/livros/[id]`, componentes/estilos e testes.
- **Atividades:** remover mock/metadados fictícios, mostrar campos reais,
  situação, capa e ações permitidas.
- **Validações:** próprio, inexistente, inválido, cruzado e erro.
- **Riscos:** revelar existência alheia ou manter ações futuras.
- **Fora do escopo:** atividade, empréstimo, solicitação e devolução.
- **Aceitação/conclusão:** detalhe real e resposta indistinguível para ausente
  ou inacessível.

### 7.6 — Edição manual de livro

- **Objetivo/responsabilidade:** editar apenas dados bibliográficos.
- **Dependências:** 7.4 (formulário) e 7.5 (consulta/destino).
- **Arquivos prováveis:** página `/livros/[id]/editar`, formulário, Action,
  service/adaptador e testes.
- **Atividades:** preencher dados, validar, atualizar projeção restrita,
  revalidar e redirecionar.
- **Validações:** sucesso, inválido, cruzado, erro, situação e Biblioteca
  preservadas.
- **Riscos:** mass assignment e alteração manual de situação.
- **Fora do escopo:** mudança de disponibilidade.
- **Aceitação/conclusão:** campos permitidos atualizados sem alterar propriedade
  ou situação.

### 7.7 — Exclusão de livro

- **Objetivo/responsabilidade:** excluir definitivamente quando permitido.
- **Dependências:** 7.5.
- **Arquivos prováveis:** controle de confirmação, Action, service/adaptador,
  detalhe/listagem e testes.
- **Atividades:** confirmar, excluir sob RLS, mapear FK, revalidar e redirecionar.
- **Validações:** cancelar, sucesso, cruzado, inexistente e bloqueado por
  Solicitação/Empréstimo.
- **Riscos:** mensagem interna ou exclusão em cascata presumida.
- **Fora do escopo:** soft delete, lixeira e remoção de dependências.
- **Aceitação/conclusão:** Livro sem vínculo é removido; vinculado permanece com
  mensagem segura.

### 7.8 — Validação integrada e encerramento da Etapa 7

- **Objetivo/responsabilidade:** validar o CRUD completo e documentar o estado.
- **Dependências:** 7.2 a 7.7.
- **Arquivos prováveis:** testes SQL/TypeScript estritamente necessários,
  `docs/estado-do-projeto.md` e SDD auxiliar de encerramento fora do repositório,
  se solicitada.
- **Atividades:** fluxos ponta a ponta, dois Proprietários, RLS, falhas, revisão
  de escopo e documentação.
- **Validações:** `npm run validate`, `git diff --check`, testes SQL locais e
  inspeção final.
- **Riscos:** marcar concluída sem isolamento ou antecipar a Etapa 8.
- **Fora do escopo:** Google Books e etapas posteriores.
- **Aceitação/conclusão:** todos os critérios da seção 16 comprovados e Etapa 7
  registrada como concluída.

## 15. Ordem de implementação

A ordem reduz retrabalho: primeiro estabiliza contratos e consultas (7.2);
depois conecta a principal visão de retorno (7.3); cria o formulário e a mutação
base (7.4); usa a consulta individual no detalhe (7.5); reutiliza formulário e
detalhe na edição (7.6); adiciona por último a mutação destrutiva e seus casos de
FK (7.7); e só então valida tudo com RLS e encerra (7.8). A exclusão não bloqueia
as demais operações e fica depois delas por apresentar o maior risco destrutivo.

## 16. Critério de conclusão da Etapa 7

A etapa estará concluída somente quando o Proprietário puder listar, cadastrar
manualmente, consultar detalhes, editar e excluir Livros quando o modelo
permitir; a situação correta for exibida; novos Livros nascerem
`disponivel`; Livros alheios permanecerem inacessíveis em todas as operações;
falhas forem seguras; testes proporcionais estiverem aprovados; e nenhuma
integração Google Books ou funcionalidade de etapa posterior tiver sido
antecipada.
