# Atelier de Estudo

[Português](#português) · [English](#english)

## Português

O **Atelier de Estudo** é uma aplicação de apoio ao estudo criada por mim e pela minha filha. É um projeto de família para tornar a preparação dos testes mais organizada, visual e participativa.

### Funcionalidades

- Flashcards para rever a matéria e indicar o grau de dificuldade.
- Resumos e esquemas para explorar os temas.
- Planeamento de sessões de estudo, com acompanhamento do progresso.
- Temporizador para apoiar as sessões de estudo.

A interface está em português. O repositório inclui um pacote de demonstração de Geografia sobre demografia e evolução da população.

### Executar localmente

Requer **Node.js 22 ou superior** e **npm**.

```sh
npm ci
npm run build
npm run serve
```

Abre o endereço indicado no terminal.

Para executar os testes e validar a compilação:

```sh
npm run check
```

### Estrutura do projeto

- `src/` — interface, estilos e lógica da aplicação.
- `content/` — pacotes de estudo em YAML e respetivo esquema de validação.
- `scripts/` — compilação e servidor local.
- `tests/` — testes do conteúdo e do planeamento.

### Dados e privacidade

O progresso é guardado no armazenamento local do navegador. A versão pública omite as referências pessoais, as ligações privadas do Notion e a configuração local de alojamento identificadas na preparação do repositório.

Não incluas chaves, credenciais ou dados pessoais nos ficheiros publicados.

## English

**Atelier de Estudo** is a study app created by me and my daughter. It is a family project that aims to make preparing for tests more organised, visual and collaborative.

### Features

- Flashcards to review topics and rate their difficulty.
- Summaries and diagrams to explore the material.
- Study session planning with progress tracking.
- A timer to support study sessions.

The interface is in Portuguese. The repository includes a sample Geography study pack covering demography and population change.

### Run locally

Requires **Node.js 22 or later** and **npm**.

```sh
npm ci
npm run build
npm run serve
```

Open the address shown in the terminal.

To run the tests and validate the build:

```sh
npm run check
```

### Project structure

- `src/` — interface, styles and application logic.
- `content/` — YAML study packs and their validation schema.
- `scripts/` — build script and local server.
- `tests/` — content and study planning tests.

### Data and privacy

Progress is saved in the browser's local storage. The public version omits the personal references, private Notion links and local hosting configuration identified when preparing this repository.

Do not include keys, credentials or personal data in published files.
