# Gerenciamento de Biblioteca

Sistema web para gerenciamento de uma biblioteca pessoal, desenvolvido com
Next.js, TypeScript e Supabase.

## Funcionalidades disponíveis

Atualmente, é possível testar:

- cadastro de Proprietário com provisionamento da Biblioteca;
- login, restauração de sessão, proteção das rotas privadas e logout;
- listagem dos Livros da Biblioteca autenticada;
- cadastro manual de Livro;
- consulta dos detalhes de um Livro;
- edição dos dados bibliográficos;
- exclusão física de Livro com confirmação, desde que não existam Solicitações
  ou Empréstimos relacionados;
- isolamento dos dados por Biblioteca com Row Level Security (RLS).

Dashboard, Página Pública, Solicitações, Empréstimos, Devoluções, QR Code e
integração com Google Books ainda não possuem fluxo funcional completo.

## Pré-requisitos

- [Git](https://git-scm.com/);
- Node.js 22 ou superior;
- npm;
- Docker Desktop em execução.

No Windows, use o backend WSL 2 se ele for exigido pela instalação do Docker
Desktop. O projeto não requer uma distribuição WSL separada quando o Docker
Engine já funciona normalmente.

## Acesso ao repositório privado

Após receber o convite:

1. Entre no GitHub com a conta convidada.
2. Aceite o convite para o repositório privado.
3. Confirme que essa conta possui acesso ao repositório.
4. Autentique o Git para usar HTTPS ou configure uma chave SSH na mesma conta.

O GitHub não aceita a senha da conta como senha do Git via HTTPS. Use o método
de autenticação oferecido pelo Git Credential Manager ou um token pessoal
criado na própria conta.

## Primeira execução

### 1. Clonar o repositório

Com HTTPS:

```bash
git clone https://github.com/daianesr35/gerenciamento-biblioteca.git
```

Ou, se a conta já estiver configurada para SSH:

```bash
git clone git@github.com:daianesr35/gerenciamento-biblioteca.git
```

### 2. Entrar na pasta do projeto

```bash
cd gerenciamento-biblioteca
```

### 3. Instalar as dependências

Use o arquivo de lock versionado:

```bash
npm ci
```

### 4. Criar o arquivo de ambiente

No PowerShell:

```powershell
Copy-Item .env.example .env.local
```

No macOS, Linux ou Git Bash:

```bash
cp .env.example .env.local
```

O arquivo `.env.local` utiliza estas variáveis:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
GOOGLE_BOOKS_API_KEY=
```

Não use os valores ilustrativos de `.env.example` para executar o ambiente
local. A URL e a chave pública corretas serão exibidas ao iniciar o Supabase no
próximo passo. Não registre `.env.local` no Git e nunca use uma chave
`service_role` ou outra chave secreta no navegador. `GOOGLE_BOOKS_API_KEY` deve
ser uma chave habilitada para a Books API e é lida somente no servidor.

### 5. Iniciar o Docker Desktop

Abra o Docker Desktop e aguarde até o Docker Engine indicar que está em
execução.

### 6. Iniciar o Supabase local

Na raiz do projeto:

```bash
npm run db:start
```

Ao final, o Supabase CLI exibe os dados do ambiente local. Copie para
`.env.local`:

- a URL local da API para `NEXT_PUBLIC_SUPABASE_URL`;
- a chave pública/publishable local para
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

Esses valores são gerados para o ambiente local e não devem ser tratados como
credenciais permanentes nem copiados para o README.

### 7. Recriar o banco local, se necessário

O `db:start` inicia o stack e aplica a configuração versionada. Para reconstruir
o banco local desde o zero e reaplicar todas as migrations:

```bash
npm run db:reset
```

Esse comando descarta os dados do banco local. Use-o somente quando precisar
recriar o schema e os dados locais; ele não é necessário em toda inicialização.

Para conferir o histórico local de migrations:

```bash
npm run db:migrations:list
```

### 8. Iniciar a aplicação

```bash
npm run dev
```

## Endereços locais

Com os serviços iniciados:

- aplicação: <http://localhost:3000>;
- API local do Supabase: <http://127.0.0.1:54321>;
- Supabase Studio: <http://127.0.0.1:54323>;
- Mailpit: <http://127.0.0.1:54324>.

## Como testar

1. Acesse <http://localhost:3000>.
2. Crie uma conta pela página de cadastro. Não existe usuário de teste
   pré-configurado.
3. Entre com a conta criada.
4. Acesse **Livros**.
5. Cadastre um Livro manualmente.
6. Abra os detalhes para consultar, editar ou excluir o Livro.
7. Use **Sair** para encerrar a sessão.

A exclusão é física e somente é concluída quando o Livro pertence à Biblioteca
autenticada e não possui Solicitações ou Empréstimos relacionados.

## Execuções seguintes

Depois da primeira configuração:

1. Inicie o Docker Desktop.
2. Entre na pasta do projeto.
3. Inicie o Supabase:

   ```bash
   npm run db:start
   ```

4. Inicie a aplicação:

   ```bash
   npm run dev
   ```

Execute `npm ci` novamente somente quando o `package-lock.json` mudar ou quando
as dependências locais precisarem ser reinstaladas.

## Como encerrar

1. No terminal da aplicação, pressione `Ctrl+C`.
2. Na raiz do projeto, encerre o Supabase preservando o estado local:

   ```bash
   npm run db:stop
   ```

3. Se não precisar mais do Docker, encerre o Docker Desktop pela interface do
   aplicativo.

## Solução de problemas

### Docker Engine indisponível

Abra o Docker Desktop, aguarde a inicialização completa e execute novamente:

```bash
npm run db:start
```

No Windows, verifique a configuração do backend WSL 2 do Docker Desktop caso o
Engine não consiga iniciar.

### Porta ocupada

A aplicação usa a porta `3000`. O Supabase local usa as portas definidas em
`supabase/config.toml`, incluindo `54321` para a API, `54322` para o banco,
`54323` para o Studio e `54324` para o Mailpit.

Encerre o processo ou outro projeto Supabase que esteja usando a porta e tente
novamente. Não altere `supabase/config.toml` sem combinar a mudança com a
equipe.

### Variáveis de ambiente ausentes

Confirme que `.env.local` existe e contém as quatro variáveis descritas em
`.env.example`. Depois de corrigir o arquivo, reinicie `npm run dev`.

### Dependências não instaladas

Na raiz do projeto:

```bash
npm ci
```

## Validação do projeto

Para executar todas as verificações:

```bash
npm run validate
```

Também é possível executá-las separadamente:

```bash
npm run lint
npm run format:check
npm run typecheck
npm run test
npm run build
```

O comando abaixo aplica a formatação aos arquivos e altera o conteúdo:

```bash
npm run format
```

As decisões e responsabilidades arquiteturais estão documentadas em
[`docs/arquitetura.md`](docs/arquitetura.md). O modelo, as migrations e as
políticas de acesso estão descritos em
[`docs/banco-de-dados.md`](docs/banco-de-dados.md).
