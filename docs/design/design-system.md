# Design System Resumido

## Sistema de Gerenciamento de Biblioteca Pessoal

**Versão:** 1.0
**Status:** Aprovado para implementação

---

# 1. Objetivo

Este documento define a identidade visual e os principais componentes da interface do Sistema de Gerenciamento de Biblioteca Pessoal.

Seu objetivo é garantir consistência visual durante toda a implementação, servindo como referência para o desenvolvimento no Codex.

Este documento **não substitui a SDD do sistema**, mas complementa sua especificação funcional com as decisões de UI/UX aprovadas.

---

# 2. Conceito Visual

O sistema deve transmitir a sensação de uma biblioteca pessoal organizada, confortável e acolhedora.

Os princípios adotados são:

- simplicidade;
- elegância;
- organização;
- legibilidade;
- foco no conteúdo;
- baixa carga cognitiva.

Evitar:

- excesso de cores;
- gradientes chamativos;
- animações desnecessárias;
- aparência corporativa;
- aparência futurista.

---

# 3. Identidade Visual

A identidade foi inspirada na biblioteca pessoal da proprietária.

A fotografia da biblioteca constitui o principal elemento visual do sistema e deve ser utilizada nas seguintes telas:

- Dashboard;
- Login;
- Página Pública.

Sempre que possível, o banner deve preservar boa legibilidade do texto por meio de sobreposição escura (overlay).

---

# 4. Paleta de Cores

## Cor primária

Marrom escuro

Utilização:

- botões principais;
- destaques;
- links importantes;
- identidade visual.

---

## Cor de fundo

Branco

Utilização:

- fundo principal;
- cartões;
- formulários.

---

## Cor secundária

Bege muito claro

Utilização:

- cards informativos;
- banners;
- áreas de destaque.

---

## Cores de apoio

Verde

- sucesso;
- disponível;
- aprovado.

Azul

- informação;
- links;
- ações secundárias.

Amarelo

- atenção.

Laranja

- livro emprestado.

Vermelho

- exclusão;
- erro;
- recusado.

Cinza

- textos auxiliares;
- placeholders;
- estados desabilitados.

---

# 5. Tipografia

Prioridades:

- excelente legibilidade;
- aparência clássica;
- leitura confortável.

Hierarquia:

- Título da página
- Título de seção
- Subtítulo
- Texto principal
- Texto auxiliar
- Legendas

Todos os títulos devem possuir forte contraste com o fundo.

---

# 6. Espaçamentos

Utilizar uma escala fixa:

- 8 px
- 16 px
- 24 px
- 32 px
- 48 px

Não utilizar espaçamentos arbitrários.

---

# 7. Bordas

Todos os componentes devem utilizar:

- cantos arredondados;
- bordas discretas;
- baixo contraste.

---

# 8. Sombras

Utilizar sombras suaves apenas para destacar:

- cards;
- menus;
- diálogos;
- dropdowns.

Evitar sombras pesadas.

---

# 9. Componentes

## 9.1 Botão Primário

Utilização:

- Salvar
- Entrar
- Adicionar Livro
- Novo Empréstimo

Características:

- cor primária;
- texto branco;
- ícone opcional;
- altura padronizada;
- bordas arredondadas.

---

## 9.2 Botão Secundário

Utilização:

- Cancelar
- Voltar
- Ver detalhes
- Editar

Características:

- fundo branco;
- borda discreta;
- texto escuro.

---

## 9.3 Campos de Formulário

Estados obrigatórios:

- normal;
- foco;
- erro;
- desabilitado;
- somente leitura.

Todos os campos devem possuir:

- mesmo raio;
- mesma altura;
- mesma tipografia.

---

## 9.4 Cards

Todos os cards devem compartilhar:

- mesmo espaçamento interno;
- mesmo raio;
- mesma borda;
- mesma sombra.

Aplicações:

- estatísticas;
- informações;
- QR Code;
- resumo;
- configurações;
- atividades.

---

## 9.5 Info Card

Componente reutilizável para mensagens como:

- Dica;
- Importante;
- Sobre;
- Como funciona.

Estrutura:

- ícone;
- título;
- descrição.

---

## 9.6 Badges

Devem possuir:

- formato arredondado;
- preenchimento suave;
- texto curto.

Padronização:

Verde

- Disponível
- Aprovado

Laranja

- Emprestado

Azul

- Informação
- Categoria de contato

Vermelho

- Recusado

Amarelo

- Atenção

Cinza

- Neutro

---

## 9.7 Listas

Todas as listas do sistema devem compartilhar o mesmo padrão.

Aplicações:

- Biblioteca;
- Solicitações;
- Empréstimos;
- Histórico.

Elementos:

- pesquisa;
- filtros;
- ordenação;
- paginação;
- menu de ações.

---

# 10. Navegação

A barra lateral deve permanecer fixa.

Estados:

- normal;
- hover;
- ativo.

O item ativo deve ser claramente identificado.

---

# 11. Ícones

Todos os ícones devem possuir:

- mesmo estilo;
- mesma espessura;
- alinhamento consistente.

Ícones devem sempre complementar o texto, nunca substituí-lo.

---

# 12. Imagens

## Banner

Utilizar fotografia da biblioteca.

Aplicações:

- Login;
- Dashboard;
- Página Pública.

---

## Capas dos livros

Somente serão exibidas quando fornecidas automaticamente pela API Google Books.

Não será permitido:

- upload manual;
- alteração manual da capa.

Na ausência da imagem deverá ser exibido um placeholder padrão.

---

# 13. Responsividade

O layout deverá adaptar-se para:

## Desktop

Layout completo com sidebar fixa.

## Tablet

Sidebar recolhível.

Cards reorganizados em menos colunas.

## Celular

Menu lateral em formato de drawer.

Cards empilhados.

Tabelas convertidas em listas.

Botões ocupando largura adequada ao dispositivo.

---

# 14. Acessibilidade

Garantir:

- contraste adequado;
- navegação por teclado;
- foco visível;
- textos legíveis;
- áreas clicáveis confortáveis;
- ícones acompanhados de texto quando necessário.

---

# 15. Consistência Visual

Todos os componentes devem reutilizar o mesmo padrão visual.

Não criar novas variações de:

- botões;
- cards;
- badges;
- formulários;
- tabelas;
- menus;
- diálogos.

Sempre reutilizar componentes existentes.

---

# 16. Decisões de Interface

As seguintes decisões fazem parte do design aprovado:

- utilização do banner da biblioteca nas telas principais;
- integração com Google Books para preenchimento automático dos dados do livro;
- ausência de upload manual de capas;
- placeholder padrão quando não houver capa;
- notas pessoais mantidas na tela de detalhes do livro;
- fluxo simplificado de empréstimos contendo apenas os estados **Emprestado** e **Devolvido**, conforme definido na SDD;
- Página Pública contendo banner, QR Code, compartilhamento e estatísticas;
- interface minimalista priorizando leitura e organização.

---

# 17. Componentes Reutilizáveis

O sistema deverá reutilizar, sempre que possível:

- Sidebar;
- Header;
- Banner;
- Card de estatística;
- Card informativo;
- Card de resumo;
- Botão primário;
- Botão secundário;
- Campo de formulário;
- Badge;
- Dropdown;
- Modal de confirmação;
- Paginação;
- Barra de pesquisa;
- Filtros;
- Lista de dados.

---

# 18. Critério de Aprovação

A implementação será considerada fiel ao design quando:

- todas as telas utilizarem os componentes padronizados;
- a identidade visual permanecer consistente em toda a aplicação;
- os componentes forem reutilizados em vez de duplicados;
- as regras de interface definidas neste documento forem respeitadas;
- o resultado preserve a aparência acolhedora, minimalista e organizada aprovada durante a Etapa 4.
