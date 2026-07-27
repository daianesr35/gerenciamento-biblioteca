# Arquitetura do Projeto

## Objetivo

Registrar a arquitetura base executável do Sistema de Gerenciamento de
Biblioteca Pessoal. Esta fundação organiza as responsabilidades técnicas para as
etapas futuras sem implementar autenticação, modelo de dados ou funcionalidades
de negócio.

## Status

Definida e implementada na Etapa 3. A aplicação base instala, valida, compila e
inicia localmente.

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
projeto entrega a interface React e, futuramente, os pontos de execução no
servidor necessários para proteger operações e integrar serviços externos.
Supabase foi confirmado como backend gerenciado futuro e Vercel como plataforma
de hospedagem futura.

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
| Supabase JS 2  | cliente do backend futuro | acesso encapsulado em `src/data`                                    |
| ESLint 9       | análise estática          | regras recomendadas do Next.js e TypeScript                         |
| Prettier 3     | formatação                | padrão determinístico dos artefatos técnicos                        |
| Vitest 4       | testes automatizados      | estrutura mínima rápida e compatível com TypeScript                 |
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

Os arquivos README nas pastas ainda sem implementação tornam explícita a
fronteira de cada camada sem criar funcionalidades artificiais.

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
a URL. A estrutura concreta, os controles de sessão e a proteção de rotas serão
implementados na Etapa 6. Nesta etapa não existe middleware/proxy de sessão nem
autenticação.

## Configuração do ambiente

1. Instalar Node.js 22 ou superior.
2. Executar `npm install`.
3. Copiar `.env.example` para `.env.local`.
4. Substituir somente os valores locais.
5. Executar `npm run dev`.

Variáveis atuais:

| Variável                               | Exposição | Uso                         |
| -------------------------------------- | --------- | --------------------------- |
| `NEXT_PUBLIC_APP_URL`                  | pública   | URL canônica do ambiente    |
| `NEXT_PUBLIC_SUPABASE_URL`             | pública   | URL do projeto Supabase     |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | pública   | chave publicável do cliente |

A chave `service_role`, chaves secretas do Supabase e tokens de provedores não
fazem parte desta configuração. Quando necessários em etapas futuras, deverão
existir apenas como variáveis de servidor no ambiente local e na Vercel.

## Integrações externas

### Supabase

O pacote `@supabase/supabase-js` está instalado com versão fixa. A fábrica em
`src/data/supabase/client.ts` cria sob demanda apenas o cliente de navegador com
URL e chave publicável validadas. Nenhum projeto remoto, tabela, migration,
política RLS, autenticação ou consulta foi criado.

O cliente de servidor e o gerenciamento de cookies serão definidos na Etapa 6,
quando o fluxo de autenticação for implementado. A modelagem e as políticas RLS
permanecem na Etapa 5.

### Vercel

O projeto segue as convenções nativas de build do Next.js:

- comando de instalação: `npm install`;
- comando de build: `npm run build`;
- artefato gerenciado pelo framework;
- variáveis configuradas separadamente em cada ambiente da Vercel.

Nenhum projeto Vercel, recurso remoto ou deploy foi criado nesta etapa.

## Qualidade e comandos

| Comando                | Finalidade                                 |
| ---------------------- | ------------------------------------------ |
| `npm run dev`          | servidor local com recarga                 |
| `npm run lint`         | análise estática                           |
| `npm run format`       | aplica formatação                          |
| `npm run format:check` | confere formatação sem alterar arquivos    |
| `npm run typecheck`    | valida tipos sem emitir arquivos           |
| `npm run test`         | executa os testes automatizados            |
| `npm run build`        | gera o build de produção                   |
| `npm run start`        | inicia o build de produção                 |
| `npm run validate`     | executa todas as verificações em sequência |

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
- **Dependências fixadas e lockfile:** tornam instalações reprodutíveis.
- **Sem Tailwind ou biblioteca visual:** decisões visuais pertencem à Etapa 4.
- **Sem Supabase CLI nesta etapa:** schema e migrations pertencem à Etapa 5.

## Limitações e pendências

- Design System, tokens, layouts e componentes visuais: Etapa 4.
- Modelo de dados, migrations, RLS e tipos gerados: Etapa 5.
- Cliente Supabase de servidor, cookies, sessão e proteção de rotas: Etapa 6.
- Catálogo, Google Books, página pública, QR Code, solicitações, empréstimos e
  devoluções: etapas funcionais posteriores.
- Pipeline de entrega e provisionamento/deploy remoto: Etapa 13.

## Histórico de decisões

| Etapa | Registro                                                                                                                                    |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 3     | Next.js, React, TypeScript, Supabase e Vercel confirmados; estrutura modular, configuração segura e ferramentas de qualidade implementadas. |
