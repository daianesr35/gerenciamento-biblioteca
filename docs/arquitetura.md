# Arquitetura do Projeto

## Objetivo

Registrar a arquitetura base executável do Sistema de Gerenciamento de
Biblioteca Pessoal e suas evoluções incrementais. Esta fundação organiza as
responsabilidades técnicas sem antecipar funcionalidades de etapas futuras.

## Status

Definida na Etapa 3 e atualizada conforme as etapas concluídas. A Tarefa 6.2
adicionou a infraestrutura SSR de autenticação e sessão, sem implementar os
fluxos funcionais de Cadastro, Login, proteção final ou Logout.

## Requisitos arquiteturais

Derivados da SDD funcional:

- aplicação web responsiva com áreas privadas e públicas;
- isolamento futuro dos dados de cada proprietário;
- acesso público restrito ao catálogo disponibilizado pela biblioteca;
- integração futura com Google Books e geração de QR Code;
- transições consistentes de solicitações, empréstimos e devoluções;
- proteção de segredos e separação entre configuração pública e privada;
- possibilidade de evolução incremental sem acoplar interface ao provedor de
  dados.

Os requisitos acima orientam a arquitetura, mas suas regras e fluxos permanecem
reservados às etapas funcionais correspondentes.

## Arquitetura geral

A aplicação adota um monólito web modular com Next.js e App Router. O mesmo
projeto entrega a interface React e os pontos de execução no servidor
necessários à infraestrutura de sessão, à futura proteção de operações e às
integrações externas. Supabase é o backend gerenciado adotado, e Vercel permanece
como plataforma de hospedagem futura. O banco local versionado aplica RLS por
Proprietário e oferece uma superfície pública mínima por funções RPC restritas.

As responsabilidades são separadas da seguinte forma:

1. `app`: composição de rotas, layouts e pontos de entrada da interface;
2. `components`: componentes compartilhados, sem acesso direto a dados;
3. `services`: coordenação de casos de uso e integrações;
4. `data`: adaptadores de acesso ao Supabase ou a outras fontes;
5. `config`: leitura e validação centralizada da configuração;
6. `types`: contratos TypeScript realmente compartilhados.

Componentes de interface não devem conhecer detalhes do Supabase. Rotas chamam
serviços; serviços coordenam regras e dependências; adaptadores de `data`
encapsulam o provedor. Novos módulos só devem ser criados quando a etapa
funcional correspondente for executada.

## Tecnologias utilizadas

| Tecnologia     | Responsabilidade          | Decisão                                                             |
| -------------- | ------------------------- | ------------------------------------------------------------------- |
| Node.js 22+    | ambiente local e de build | versão LTS compatível com o projeto                                 |
| Next.js 16     | framework web full stack  | App Router, renderização no servidor e integração direta com Vercel |
| React 19       | interface declarativa     | ecossistema nativo do Next.js                                       |
| TypeScript 5.9 | tipagem estática          | modo estrito e aliases de importação                                |
| Supabase JS 2  | cliente do backend        | acesso encapsulado em `src/data`                                    |
| ESLint 9       | análise estática          | regras recomendadas do Next.js e TypeScript                         |
| Prettier 3     | formatação                | padrão determinístico dos artefatos técnicos                        |
| Vitest 4       | testes automatizados      | estrutura mínima rápida e compatível com TypeScript                 |
| Supabase CLI 2 | migrations e banco local  | dependência de desenvolvimento fixada e execução por scripts npm    |
| Vercel         | hospedagem futura         | plataforma alinhada ao Next.js; nenhum deploy foi realizado         |

As versões exatas ficam fixadas em `package.json` e `package-lock.json`.

## Estrutura do projeto

```text
.
├── docs/
│   ├── arquitetura.md
│   ├── estado-do-projeto.md
│   └── ...
├── src/
│   ├── app/                 # rotas, layouts e estilos globais mínimos
│   ├── components/          # componentes de interface compartilhados
│   ├── config/              # configuração tipada e validada
│   ├── data/
│   │   └── supabase/        # adaptador do cliente Supabase
│   ├── services/            # coordenação de casos de uso
│   └── types/               # contratos compartilhados
├── .env.example
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

Os arquivos README de cada camada registram suas fronteiras e o estado atual,
sem criar funcionalidades artificiais.

## Fluxo geral de comunicação

```text
Navegador
   │
   ▼
Rotas e layouts (src/app)
   │
   ├──► Componentes compartilhados (src/components)
   │
   ▼
Serviços / casos de uso (src/services)
   │
   ▼
Adaptadores de dados (src/data)
   │
   ├──► Supabase
   └──► APIs externas futuras
```

Chamadas que exigirem segredo, autorização ou proteção de uma API externa
deverão executar no servidor. Nenhuma chave secreta poderá receber o prefixo
`NEXT_PUBLIC_`.

## Rotas públicas e privadas

O App Router permitirá separar grupos de rotas públicas e privadas sem alterar
a URL. A Tarefa 6.2 adicionou `src/proxy.ts` apenas para renovar a sessão e
propagar cookies; ele ainda não redireciona nem protege rotas. A matriz final de
rotas, a validação no layout privado e os redirecionamentos pertencem à Tarefa
6.5.

O matcher exclui recursos internos do Next.js, arquivos estáticos, metadados e
a rota técnica de imagens de referência. Rotas da aplicação continuam passando
pelo Proxy para que uma sessão existente possa ser renovada sem antecipar regras
de acesso.

## Configuração do ambiente

1. Instalar Node.js 22 ou superior.
2. Executar `npm install`.
3. Copiar `.env.example` para `.env.local`.
4. Substituir somente os valores locais.
5. Executar `npm run dev`.

Variáveis atuais:

| Variável                               | Exposição | Uso                          |
| -------------------------------------- | --------- | ---------------------------- |
| `NEXT_PUBLIC_APP_URL`                  | pública   | URL canônica do ambiente     |
| `NEXT_PUBLIC_SUPABASE_URL`             | pública   | URL do projeto Supabase      |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | pública   | chave publicável do cliente  |
| `GOOGLE_BOOKS_API_KEY`                 | servidor  | consultas à Google Books API |

A chave `service_role` e chaves secretas do Supabase não fazem parte desta
configuração. `GOOGLE_BOOKS_API_KEY` não usa o prefixo `NEXT_PUBLIC_` e deve
existir apenas no ambiente do servidor local e da Vercel.

## Integrações externas

### Google Books

A consulta por ISBN é executada no servidor por uma Server Action exclusiva.
O service remove espaços e hífens, aceita somente valores com 10 ou 13
caracteres e usa o primeiro volume retornado. O adaptador usa `fetch` nativo,
limite de um resultado e timeout de cinco segundos. A resposta interna contém
somente título, autores, ISBN, editora e URL da capa.

Falhas de validação, ausência, HTTP, rede, timeout e resposta inesperada são
normalizadas. A consulta não acessa o Supabase, não persiste dados, não revalida
rotas e não redireciona.

### Supabase

Os pacotes `@supabase/supabase-js` e `@supabase/ssr` estão instalados com versões
fixas. A infraestrutura usa uma única estratégia de sessão em cookies:

- `src/data/supabase/browser.ts` mantém um cliente de navegador preguiçoso por
  aba com `createBrowserClient`;
- `src/data/supabase/server.ts` cria um cliente por requisição com
  `createServerClient` e a API assíncrona `cookies()`;
- `src/data/supabase/proxy.ts` renova a sessão com `getClaims()`, copia cookies
  para a requisição e a resposta e aplica os cabeçalhos anti-cache fornecidos
  pelo pacote;
- `src/data/supabase/auth.ts` converte claims verificadas no contrato mínimo de
  identidade da aplicação, sem usar `getSession()` como prova de identidade.

Server Components podem ler cookies, mas não gravá-los durante a renderização.
Nesse contexto, somente o erro específico de escrita proibida pelo Next.js é
ignorado pelo cliente de servidor, pois o Proxy realiza a renovação. Server
Actions e Route Handlers continuam aptos a persistir os cookies. Erros de
escrita inesperados não são ocultados.

O modelo local versionado contém Proprietário, Biblioteca, Livro, Solicitação e
Empréstimo. Cada Proprietário referencia exatamente um `auth.users.id`, e RLS
propaga essa identidade pela Biblioteca, pelos Livros e pelos registros
relacionados.

O papel `authenticated` recebe operações de tabela, mas as policies limitam
cada linha à Biblioteca vinculada a `auth.uid()`. O papel `anon` não recebe
acesso direto às tabelas. A futura página pública deverá usar somente as RPCs
que localizam uma Biblioteca por `identificador_publico`, listam os campos
públicos de Livros disponíveis e criam uma Solicitação pendente válida.

Essas RPCs são `SECURITY DEFINER` porque `anon` não possui privilégios nas
tabelas subjacentes. Todas fixam `search_path` vazio, qualificam schemas,
revogam o `EXECUTE` padrão e concedem execução somente a `anon`. Nenhuma view
pública foi criada, evitando uma superfície enumerável e a exposição acidental
de colunas privadas.

Nenhum projeto remoto, Cadastro, Login funcional, proteção final, Logout ou
consulta da interface foi criado. A infraestrutura de sessão está pronta para
essas tarefas futuras. A modelagem e as políticas RLS permanecem inalteradas
desde a Etapa 5.

### Vercel

O projeto segue as convenções nativas de build do Next.js:

- comando de instalação: `npm install`;
- comando de build: `npm run build`;
- artefato gerenciado pelo framework;
- variáveis configuradas separadamente em cada ambiente da Vercel.

Nenhum projeto Vercel, recurso remoto ou deploy foi criado nesta etapa.

## Qualidade e comandos

| Comando                              | Finalidade                                 |
| ------------------------------------ | ------------------------------------------ |
| `npm run dev`                        | servidor local com recarga                 |
| `npm run lint`                       | análise estática                           |
| `npm run format`                     | aplica formatação                          |
| `npm run format:check`               | confere formatação sem alterar arquivos    |
| `npm run typecheck`                  | valida tipos sem emitir arquivos           |
| `npm run test`                       | executa os testes automatizados            |
| `npm run db:start`                   | inicia o stack Supabase local              |
| `npm run db:stop`                    | encerra o stack Supabase local             |
| `npm run db:reset`                   | recria o banco local pelas migrations      |
| `npm run db:migration:new -- <nome>` | cria uma migration versionada              |
| `npm run db:migrations:list`         | confere o histórico local de migrations    |
| `npm run build`                      | gera o build de produção                   |
| `npm run start`                      | inicia o build de produção                 |
| `npm run validate`                   | executa todas as verificações em sequência |

## Decisões técnicas

- **Monólito modular:** reduz complexidade operacional e mantém fronteiras
  internas claras para o porte atual do sistema.
- **App Router:** oferece componentes de servidor e cliente no mesmo modelo,
  adequado às futuras áreas pública e autenticada.
- **Supabase encapsulado:** evita que componentes dependam diretamente do
  provedor e prepara testes e evolução futura.
- **Configuração fail-fast:** variáveis obrigatórias falham com mensagem clara
  quando o adaptador é usado.
- **Cliente preguiçoso:** o build e a página base não dependem de credenciais nem
  fazem chamadas externas.
- **Cliente de servidor por requisição:** impede compartilhamento de cookies ou
  identidade entre usuários em instâncias aquecidas.
- **Sessão SSR em cookies:** `@supabase/ssr` controla o formato, a rotação e a
  persistência; a aplicação não mantém tokens em armazenamento próprio.
- **Identidade por claims verificadas:** `getClaims()` centraliza a validação
  normal; `getUser()` permanece disponível para fluxos que exijam estado remoto
  mais recente.
- **Respostas de renovação não cacheáveis:** os cabeçalhos entregues por
  `@supabase/ssr` são propagados no Proxy junto com `Set-Cookie`.
- **Dependências fixadas e lockfile:** tornam instalações reprodutíveis.
- **Sem Tailwind ou biblioteca visual:** decisões visuais pertencem à Etapa 4.
- **Supabase CLI local e fixada:** adicionada na Tarefa 5.1 para que configuração
  e migrations sejam reproduzíveis pela versão registrada no lockfile.

## Limitações e pendências

- Design System, tokens, layouts e componentes visuais: Etapa 4.
- Tipos gerados do banco: etapa futura quando a integração funcional exigir.
- Cadastro e provisionamento: Tarefa 6.3.
- Login funcional: Tarefa 6.4.
- Proteção final, redirecionamentos e identidade no layout privado: Tarefa 6.5.
- Logout: Tarefa 6.6.
- Catálogo, Google Books, página pública, QR Code, solicitações, empréstimos e
  devoluções: etapas funcionais posteriores.
- Pipeline de entrega e provisionamento/deploy remoto: Etapa 13.

## Histórico de decisões

| Etapa | Registro                                                                                                                                                         |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3     | Next.js, React, TypeScript, Supabase e Vercel confirmados; estrutura modular, configuração segura e ferramentas de qualidade implementadas.                      |
| 5.1   | Supabase CLI e configuração local versionadas; migrations SQL imperativas adotadas com validação por reconstrução limpa e sem modelo de domínio.                 |
| 5.2   | Modelo iniciado com Proprietário e Biblioteca em relacionamento 1:1; autenticação, RLS, interface e entidades futuras permaneceram adiadas.                      |
| 5.3   | Catálogo persistente modelado com Livro pertencente a uma Biblioteca; interface, empréstimos, solicitações e regras transacionais permaneceram adiados.          |
| 5.4   | Solicitação e Empréstimo modelados separadamente, com vínculos estruturais ao Livro e entre si; interface, automações e transações permaneceram adiadas.         |
| 5.5   | Proprietário vinculado a `auth.users`; RLS aplicada às cinco tabelas; acesso público reduzido a três RPCs e grants mínimos, sem integrar a interface.            |
| 6.2   | Infraestrutura SSR criada com clientes browser/server/proxy, cookies renováveis, validação central de identidade e cabeçalhos anti-cache, sem fluxos funcionais. |
