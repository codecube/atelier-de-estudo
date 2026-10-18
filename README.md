# Atelier de Estudo

[Português](#português) · [English](#english)

## Português

O **Atelier de Estudo** é uma aplicação de apoio ao estudo criada por mim e pela minha filha. É um projeto de família para tornar a preparação dos testes mais organizada, visual e participativa.

### O nosso método de estudo

A aplicação faz parte de um método que construímos em família: documentar cada lição, compreender a matéria e praticar a recordação antes de consultar a resposta. O objetivo é criar uma rotina contínua, com revisões e feedback, e distribuir a preparação dos testes por sessões curtas.

O percurso começa nas fotografias dos apontamentos do caderno e dos exercícios do livro trabalhados na aula. Criámos uma skill personalizada — um conjunto de instruções para o assistente — que ajuda a transformar essas fotografias numa página de estudo organizada no Notion. Para cada lição, a skill orienta a criação de:

1. Uma transcrição fiel dos apontamentos, assinalando passagens ilegíveis ou incertas.
2. Uma secção separada com os exercícios do livro e as respostas trabalhadas na aula, quando fornecidos.
3. Um resumo claro para estudar.
4. Um diagrama visual com os conceitos e as suas relações.
5. Uma recomendação de vídeo sobre a matéria, preferencialmente em português e até cinco minutos.
6. Exatamente três perguntas ou exercícios, com espaço para responder antes de ver as soluções.

Antes de tratar uma nova lição, a skill orienta a revisão dos exercícios da lição anterior da mesma disciplina: corrige as respostas com uma explicação curta, preserva o trabalho original e lembra o que ficou por responder. Os apontamentos, os exercícios do livro e as explicações acrescentadas ficam claramente distinguidos na mesma página.

Na preparação de um teste, os conteúdos selecionados e revistos são organizados em pacotes de estudo para a aplicação. Os resumos e esquemas ajudam a compreender; os flashcards convidam a tentar recordar antes de revelar a resposta; a classificação da dificuldade e o planeamento ajudam a decidir o que rever a seguir.

O Notion serve de arquivo das lições e a aplicação apoia a prática e a preparação dos testes. A skill é usada através do assistente, fora desta aplicação; este repositório não inclui a skill nem uma sincronização automática com o Notion.

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

### Our study method

The app is part of a method we developed as a family: document each lesson, understand the material and practise recalling it before checking the answer. The aim is to build an ongoing routine with review and feedback, and spread test preparation across short sessions.

The process starts with photos of notebook notes and textbook exercises covered in class. We created a custom skill — a set of instructions for the assistant — to help turn those photos into an organised study page in Notion. For each lesson, the skill guides the creation of:

1. A faithful transcription of the notes, marking unclear or uncertain passages.
2. A separate section for textbook exercises and answers worked on in class, when provided.
3. A clear study summary.
4. A visual diagram showing concepts and their relationships.
5. A relevant video recommendation, preferably in Portuguese and no longer than five minutes.
6. Exactly three questions or exercises, with space to answer before seeing the solutions.

Before processing a new lesson, the skill guides a review of the exercises from the previous lesson in the same subject: it checks answers with brief explanations, preserves the original work and flags unanswered questions. Notebook notes, textbook exercises and added explanations remain clearly distinguished on the same page.

When preparing for a test, selected and reviewed material is organised into study packs for the app. Summaries and diagrams support understanding; flashcards encourage recalling an answer before revealing it; difficulty ratings and study planning help decide what to review next.

Notion acts as the lesson archive, while the app supports practice and test preparation. The skill runs through the assistant, outside this app; this repository includes neither the skill nor automatic synchronisation with Notion.

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
