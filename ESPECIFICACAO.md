# Aplicação de Estudo da estudante — Especificação do Produto

## 1. Finalidade

Construir uma aplicação web de apoio ao estudo da estudante, centrada na preparação de testes através de:

- planos de estudo com tarefas diárias;
- flashcards com perguntas, respostas e explicações;
- resumos curtos em tópicos;
- esquemas visuais;
- materiais imprimíveis e exportáveis para PDF.

A aplicação deve evoluir ao longo do tempo. A inclusão de um novo teste e da respetiva matéria não deve exigir alterações ao código da aplicação: cada teste será representado por um pacote de estudo estruturado.

## 2. Princípios do produto

1. **Clareza:** estudar deve ser a atividade principal; decoração e funcionalidades secundárias não podem distrair.
2. **Autonomia acompanhada:** a estudante participa na definição do plano, podendo este ser revisto com um adulto.
3. **Sessões realistas:** o estudo é dividido em tarefas curtas, concretas e adequadas ao tempo disponível.
4. **Conteúdo verificável:** materiais gerados automaticamente devem poder ser revistos antes de serem publicados.
5. **Evolução simples:** novos testes são adicionados através de ficheiros de conteúdo validados.
6. **Utilização em papel:** flashcards, resumos, esquemas e planos devem ter versões próprias para impressão.
7. **Privacidade:** a primeira versão não terá publicidade nem rastreamento e guardará o progresso localmente.

## 3. Utilizadores

### 3.1 estudante

Utilizadora principal. Consulta o plano, realiza sessões de estudo, usa os materiais e regista a dificuldade e a conclusão das tarefas.

### 3.2 Adulto responsável

Pode ajudar a confirmar a disponibilidade, rever o plano proposto e validar os conteúdos gerados antes de estes serem disponibilizados.

### 3.3 Criador de conteúdos

Pessoa ou sistema, incluindo ChatGPT/Codex através de uma futura skill, que transforma a matéria de um teste num pacote de estudo válido.

## 4. Estrutura da informação

A organização principal será:

```text
Disciplina
└── Teste
    ├── Informação e data
    ├── Plano de estudo
    ├── Temas
    ├── Flashcards
    ├── Resumo
    └── Esquemas
```

Cada teste constitui um pacote de estudo independente.

## 5. Navegação principal

A aplicação deverá ter quatro áreas principais dentro de cada teste:

1. **Plano:** o que estudar, quando e durante quanto tempo.
2. **Resumo:** conteúdo essencial em tópicos curtos.
3. **Esquemas:** relações, processos, classificações e sequências apresentados visualmente.
4. **Flashcards:** perguntas para recordar e testar conhecimentos.

A página inicial deverá mostrar:

- testes futuros ordenados por data;
- contagem decrescente para cada teste;
- próxima tarefa de estudo;
- acesso às disciplinas e testes anteriores;
- estado geral de progresso.

## 6. Flashcards

### 6.1 Conteúdo de um cartão

Cada flashcard deve suportar:

- identificador único;
- tema;
- pergunta;
- resposta;
- explicação curta;
- palavras-chave;
- dificuldade opcional;
- imagem ou esquema opcional;
- fonte ou referência opcional.

### 6.2 Interação de estudo

O fluxo de utilização será:

1. Mostrar a pergunta.
2. Dar tempo à estudante para responder mentalmente ou em voz alta.
3. Mostrar a resposta e a explicação após uma ação explícita.
4. Pedir uma autoavaliação:
   - **Ainda não sei**;
   - **Quase**;
   - **Já sei**.
5. Avançar para o cartão seguinte.

Os cartões marcados como **Ainda não sei** devem voltar a aparecer com maior frequência na mesma sessão ou numa sessão de revisão.

### 6.3 Controlos da sessão

A sessão deve permitir:

- ver o progresso, por exemplo, “8 de 25”;
- filtrar por tema;
- usar ordem normal ou aleatória;
- estudar apenas cartões difíceis;
- reiniciar a sessão;
- navegar por botões e teclado;
- consultar o número de cartões dominados.

### 6.4 Repetição

O MVP não necessita de um algoritmo complexo de repetição espaçada. Deve guardar localmente a classificação dos cartões e permitir rever com prioridade os cartões difíceis. Revisões programadas e algoritmos adaptativos ficam previstos para uma fase posterior.

## 7. Resumos

Cada teste deve conter um resumo de revisão rápida, caracterizado por:

- frases curtas;
- tópicos e subtópicos;
- definições essenciais;
- relações de causa e efeito;
- vocabulário importante;
- fórmulas, datas ou regras, quando aplicável;
- uma secção final “O que preciso mesmo de saber”.

O resumo não deve ser uma transcrição extensa da matéria.

## 8. Esquemas de estudo

Os pacotes poderão incluir diferentes tipos de esquema:

- mapa de conceitos;
- linha cronológica;
- ciclo ou processo;
- tabela comparativa;
- árvore de classificação;
- diagrama com partes identificadas;
- sequência de acontecimentos.

Os esquemas deverão ser definidos através de dados estruturados sempre que possível, para que a aplicação consiga apresentá-los no ecrã e imprimi-los adequadamente.

Cada esquema deve ter uma alternativa textual que preserve a informação quando o elemento visual não estiver disponível ou não for adequado à impressão.

## 9. Planeamento do estudo

### 9.1 Objetivo

Cada teste deverá ter um plano criado com a participação da estudante. O plano deve converter a matéria em tarefas concretas distribuídas pelos dias disponíveis.

### 9.2 Informação necessária

Para propor o plano, a aplicação deve considerar:

- data do teste;
- primeira data possível para começar;
- dias da semana disponíveis;
- tempo disponível em cada dia;
- dias indisponíveis;
- temas abrangidos;
- dificuldade sentida em cada tema;
- outros testes ou compromissos relevantes, quando fornecidos;
- preferência por sessões curtas ou mais longas.

### 9.3 Participação da estudante

Durante a preparação do plano, a estudante deverá poder classificar cada tema como:

- **Ainda não percebo**;
- **Preciso de praticar**;
- **Já sei razoavelmente**.

Depois de indicada a disponibilidade, a aplicação apresenta uma proposta. A estudante e um adulto podem ajustar dias, tarefas e durações antes da confirmação.

### 9.4 Antecedência

A aplicação nunca deverá sugerir que a estudante comece a estudar mais de oito dias antes do teste.

| Dimensão do teste | Antecedência inicial sugerida |
|---|---:|
| Pequeno | 3 dias |
| Médio | 4–5 dias |
| Grande | 6–8 dias |

Estes valores são orientações. A proposta deverá considerar a quantidade e dificuldade da matéria, o domínio atual, os dias disponíveis e a necessidade de realizar exercícios.

Se a matéria for excecionalmente extensa, a aplicação não deve ultrapassar automaticamente os oito dias. Deve avisar que o tempo poderá ser insuficiente e propor:

- priorização dos temas essenciais;
- sessões um pouco mais longas;
- duas sessões curtas em alguns dias;
- redução de tarefas menos importantes;
- revisão do plano com um adulto.

### 9.5 Princípios de distribuição

O plano deve:

- dividir a matéria em unidades pequenas;
- usar sessões curtas e regulares;
- alternar compreensão, prática e revisão;
- atribuir mais tempo aos temas difíceis;
- voltar aos temas em dias diferentes;
- evitar introduzir muita matéria nova na véspera;
- reservar o último dia para revisão leve, sempre que possível;
- manter pelo menos um dia de margem quando o calendário o permitir.

### 9.6 Tipos de tarefa

Uma sessão poderá combinar:

- leitura de uma parte do resumo;
- observação e explicação de um esquema;
- estudo de um conjunto de flashcards;
- revisão dos cartões difíceis;
- resposta a perguntas sem consulta;
- realização ou correção de exercícios;
- explicação de um tema em voz alta;
- revisão geral;
- pequena simulação do teste.

Cada tarefa deve indicar a duração prevista e o tema a que pertence. Deve usar instruções concretas, evitando designações vagas como “Estudar Ciências”.

### 9.7 Acompanhamento

Depois de uma sessão, a estudante poderá indicar:

- **Concluído**;
- **Fiz uma parte**;
- **Não consegui fazer**;
- **Foi fácil**;
- **Foi adequado**;
- **Foi difícil**.

Com base neste registo, a aplicação poderá propor:

- reagendar tarefas não concluídas;
- dividir tarefas demasiado longas;
- acrescentar revisões aos temas difíceis;
- reduzir a repetição de temas dominados.

As alterações automáticas deverão ser apresentadas como propostas e não aplicadas silenciosamente.

### 9.8 Ecrã do plano

O ecrã deve apresentar:

- contagem decrescente para o teste;
- tarefa de hoje;
- duração prevista;
- plano completo;
- progresso por tema;
- sessões concluídas;
- tarefas atrasadas;
- ação “Reorganizar o plano”;
- ação de impressão.

## 10. Impressão e PDF

### 10.1 Modos de impressão

A aplicação deverá disponibilizar:

1. flashcards frente e verso para recortar;
2. folha de perguntas e folha de respostas;
3. caderno de estudo com resumo, esquemas e flashcards;
4. plano de estudo em formato de calendário ou lista diária.

### 10.2 Opções

O utilizador deverá poder selecionar:

- todos os cartões ou apenas determinados temas;
- cartões difíceis;
- inclusão ou exclusão das explicações;
- tamanho dos cartões;
- impressão a cores ou económica;
- formato A4;
- margens e linhas de corte quando aplicável.

O plano impresso deve incluir tarefas, duração prevista, caixas de conclusão, dias de descanso e espaço para observações.

### 10.3 PDF

No MVP, o PDF poderá ser produzido através da funcionalidade do navegador **Imprimir → Guardar como PDF**. Não é necessário um gerador de PDF próprio na primeira versão.

## 11. Identidade visual

### 11.1 Conceito

A aplicação deverá transmitir a sensação de um pequeno estúdio criativo de arquitetura e decoração, relacionando o estudo com os interesses da estudante sem reduzir a legibilidade ou a concentração.

A direção visual combina:

- um estúdio de arquitetura, com grelhas subtis, linhas finas, cotas e símbolos técnicos;
- um ambiente de decoração de interiores, com cores acolhedoras, materiais e pequenos elementos de mobiliário.

A interface não deverá parecer infantil nem ficar sobrecarregada.

### 11.2 Elementos visuais

Poderão ser usados discretamente:

- réguas, esquadros e compassos;
- plantas vistas de cima;
- candeeiros, cadeiras, secretárias e estantes;
- amostras de cores e materiais;
- linhas de cota;
- esboços de móveis;
- grelhas de papel milimétrico;
- ícones com aparência de desenho técnico.

As disciplinas podem surgir como pastas de projeto, os testes como projetos e os resumos como painéis de apresentação ou moodboards.

### 11.3 Paleta indicativa

- branco quente ou creme;
- bege e madeira clara;
- verde sálvia;
- azul de desenho técnico;
- terracota suave;
- grafite para texto e linhas.

Os estados não devem depender apenas da cor. Devem também ter texto e ícones.

### 11.4 Progressão visual opcional

Numa fase posterior, sessões concluídas poderão desbloquear peças para compor um quarto virtual e diferentes estilos de decoração. Esta componente:

- será opcional;
- não deverá tornar-se um jogo complexo;
- não deverá interromper o estudo;
- nunca penalizará a estudante por falhar um dia.

### 11.5 Estilo de impressão

Na impressão, a decoração deverá ser automaticamente reduzida:

- fundo branco;
- linhas técnicas muito claras;
- baixo consumo de tinta;
- ausência de texturas desnecessárias;
- decoração limitada a títulos e separadores.

## 12. Pacotes de estudo

### 12.1 Formato

Os testes serão definidos em ficheiros YAML ou JSON. A preferência inicial é YAML, devido à facilidade de leitura e revisão manual.

Um pacote deverá conter, pelo menos:

- metadados do teste;
- temas;
- flashcards;
- resumo;
- esquemas;
- recomendações de planeamento.

Exemplo conceptual, não definitivo:

```yaml
teste:
  id: ciencias-sistema-digestivo-2026-11-12
  disciplina: Ciências Naturais
  titulo: Sistema digestivo
  data: 2026-11-12
  dimensao: media

planeamento:
  antecedencia:
    minimo_dias: 3
    maximo_dias: 8
  duracao_sessao_sugerida_minutos: 20

temas:
  - id: orgaos
    nome: Órgãos do sistema digestivo
    peso: 3

flashcards:
  - id: digestao-01
    tema: orgaos
    pergunta: Qual é a função do estômago?
    resposta: Misturar os alimentos e iniciar a digestão das proteínas.
    explicacao: O estômago usa movimentos musculares e suco gástrico para transformar o alimento.
    dificuldade: media
    palavras_chave:
      - estômago
      - suco gástrico
      - proteínas
```

O esquema definitivo deverá ser documentado e validado automaticamente.

### 12.2 Separação entre conteúdo e progresso

O pacote de estudo contém conteúdos e recomendações gerais. Não deverá conter:

- disponibilidade pessoal da estudante;
- sessões concluídas;
- classificações dos cartões;
- perceção individual de dificuldade;
- alterações pessoais ao plano.

Esses dados pertencem ao progresso local da aplicação.

## 13. Futura skill `preparar-teste-estudante`

### 13.1 Finalidade

Transformar a matéria fornecida para um teste num pacote de estudo válido para a aplicação.

### 13.2 Entradas

- fotografias do caderno;
- páginas do manual;
- ficha com a matéria do teste;
- texto ou apontamentos;
- disciplina e ano escolar;
- data do teste.

### 13.3 Resultados

- ficheiro estruturado do teste;
- conjunto de flashcards;
- resumo em tópicos;
- esquemas e respetivas alternativas textuais;
- estimativa da dimensão da matéria;
- proposta pedagógica de tarefas;
- antecedência recomendada entre três e oito dias;
- lista de dúvidas, conteúdo ilegível ou informação a confirmar;
- relatório de validação.

### 13.4 Regras

A skill deverá:

- distinguir informação presente nas fontes de simplificações introduzidas;
- assinalar conteúdo duvidoso, ilegível ou incompleto;
- não publicar automaticamente conteúdo relevante que careça de confirmação;
- estimar o peso relativo dos temas;
- respeitar o máximo de oito dias de antecedência;
- avisar quando considerar difícil cobrir toda a matéria nesse intervalo;
- produzir ficheiros conformes ao esquema da aplicação.

O conteúdo deverá poder ser revisto pela estudante ou por um adulto antes de ficar disponível.

## 14. Arquitetura recomendada

O MVP deverá ser uma aplicação web instalável do tipo PWA:

- utilizável em computador, tablet e telemóvel;
- instalável como aplicação;
- disponível sem Internet depois do carregamento inicial;
- sem necessidade de conta;
- com progresso guardado localmente;
- capaz de carregar pacotes de estudo incluídos no projeto;
- adequada a alojamento como site estático.

Não são necessários no MVP:

- servidor próprio;
- base de dados remota;
- autenticação;
- sincronização entre dispositivos;
- editor complexo de conteúdos dentro da aplicação.

## 15. Requisitos de qualidade e acessibilidade

- Interface em português europeu.
- Linguagem adequada à idade e ao ano escolar da estudante.
- Funcionamento responsivo em computador, tablet e telemóvel.
- Botões suficientemente grandes para interação tátil.
- Navegação por teclado.
- Contraste legível.
- Possibilidade de aumentar o tamanho do texto.
- Informação não dependente exclusivamente da cor.
- Estados vazios e mensagens de erro compreensíveis.
- Funcionamento offline para conteúdos previamente carregados.
- Impressão legível a preto e branco.
- Tempos de carregamento reduzidos.
- Ausência de publicidade e rastreamento.

## 16. Âmbito do MVP

O primeiro lançamento deverá incluir:

- página inicial com disciplinas e testes;
- navegação pelas quatro áreas de cada teste;
- flashcards com pergunta, resposta, explicação e autoavaliação;
- filtros por tema e cartões difíceis;
- resumos em tópicos;
- esquemas básicos com alternativa textual;
- criação manual assistida do plano;
- tarefas diárias e registo de conclusão;
- progresso guardado localmente;
- estilos próprios para impressão;
- gravação como PDF através do navegador;
- carregamento de testes a partir de ficheiros estruturados;
- identidade visual inspirada em arquitetura e decoração;
- funcionamento responsivo e offline.

## 17. Evoluções previstas

### Evolução posterior — Estudo adaptativo

- reorganização assistida do plano;
- revisões programadas;
- estatísticas simples;
- objetivos diários;
- pesquisa e favoritos;
- melhor suporte para imagens e áudio;
- recomendações baseadas no histórico.

### Evolução posterior — Gestão e sincronização

- editor de conteúdos na aplicação;
- importação e exportação de pacotes;
- cópias de segurança;
- sincronização entre dispositivos;
- contas ou perfis, se vierem a ser necessários;
- progressão visual através da decoração de um quarto virtual.

## 18. Critérios de aceitação do MVP

O MVP será considerado funcional quando for possível:

1. adicionar um novo teste através de um pacote de estudo, sem alterar o código;
2. abrir o teste e consultar plano, resumo, esquemas e flashcards;
3. alternar entre pergunta, resposta e explicação;
4. classificar cartões e rever os cartões difíceis;
5. definir disponibilidade e confirmar um plano de estudo de três a oito dias;
6. concluir tarefas e manter o progresso após fechar a aplicação;
7. usar a aplicação sem Internet depois do primeiro carregamento;
8. utilizar as funções principais num computador, tablet e telemóvel;
9. imprimir ou guardar em PDF os principais materiais;
10. imprimir com boa legibilidade e consumo de tinta reduzido;
11. identificar visualmente a inspiração em arquitetura e decoração sem prejudicar o estudo.

## 19. Decisões ainda em aberto

Antes ou durante o início da implementação, deverão ser confirmados:

- idade e ano escolar da estudante;
- disciplinas da primeira versão;
- dispositivo utilizado com maior frequência;
- duração habitual de uma sessão;
- necessidade futura de sincronização entre dispositivos;
- processo exato de revisão e aprovação dos conteúdos;
- primeiro teste real que servirá de pacote-piloto;
- formato definitivo e esquema de validação dos pacotes YAML;
- tipos de esquema visual suportados inicialmente.

## 20. Fora do âmbito inicial

Salvo decisão posterior, o MVP não incluirá:

- rede social, classificações ou competição entre utilizadores;
- penalizações por tarefas não concluídas;
- geração automática sem revisão de conteúdos duvidosos;
- integração obrigatória com calendários externos;
- funcionalidades que exijam conta ou recolha de dados pessoais;
- gamificação complexa;
- algoritmo avançado de repetição espaçada.

## 21. Plano de implementação

### 21.1 Estratégia

A implementação será organizada em quatro fases. No fim de cada fase deverá existir uma versão utilizável e verificável da aplicação. As listas de trabalho apresentadas dentro de cada fase são grupos de tarefas e não constituem fases adicionais.

O primeiro teste real da estudante será usado como teste-piloto desde o início. Desta forma, o modelo de dados, a interface e a impressão serão validados com conteúdo real, em vez de dependerem apenas de exemplos artificiais.

### Fase 1 — Fundação e primeiro teste funcional

**Estado:** implementada.

Esta fase reúne a confirmação do conteúdo-piloto, a fundação técnica, a navegação e os flashcards. O resultado deverá ser uma aplicação simples, mas já utilizável para estudar um teste real.

#### Lista de trabalho: conteúdo-piloto

**Objetivo:** resolver as decisões essenciais antes da implementação técnica.

**Trabalho:**

- confirmar idade e ano escolar da estudante;
- escolher a primeira disciplina e o primeiro teste real;
- recolher a matéria desse teste;
- identificar os dispositivos prioritários;
- confirmar a duração habitual das sessões;
- definir quem revê e aprova os conteúdos;
- selecionar os tipos de esquema necessários para o teste-piloto.

**Entregáveis:**

- decisões em aberto registadas na especificação;
- conjunto de fontes do primeiro teste;
- exemplo inicial de flashcards, resumo e esquema;
- definição do conteúdo mínimo necessário para validar a aplicação.

**Critério de conclusão:** existe matéria real suficiente para construir e testar um pacote completo.

#### Lista de trabalho: fundação técnica e modelo de conteúdos

**Objetivo:** criar a base da aplicação e tornar os pacotes de estudo independentes do código.

**Trabalho:**

- escolher e configurar a tecnologia da aplicação web;
- criar a estrutura base do projeto;
- definir o esquema YAML definitivo;
- implementar validação dos pacotes;
- criar mensagens de erro compreensíveis para conteúdo inválido;
- converter o teste-piloto para o novo formato;
- definir o armazenamento local do progresso;
- estabelecer os estilos, cores, tipografia e componentes básicos;
- preparar a estrutura inicial de funcionamento offline.

**Entregáveis:**

- aplicação base executável;
- esquema documentado dos pacotes;
- validador de conteúdos;
- primeiro pacote de estudo válido;
- sistema visual inicial inspirado em arquitetura e decoração.

**Critérios de conclusão:**

- um pacote válido é carregado sem alterações ao código;
- um pacote inválido apresenta erros claros;
- a aplicação abre nos dispositivos prioritários;
- as decisões técnicas essenciais estão documentadas.

#### Lista de trabalho: navegação, disciplinas e testes

**Objetivo:** permitir encontrar e abrir os materiais de cada teste.

**Trabalho:**

- criar a página inicial;
- listar disciplinas e testes;
- ordenar testes futuros por data;
- apresentar a contagem decrescente;
- criar a página de cada teste;
- implementar a navegação entre Plano, Resumo, Esquemas e Flashcards;
- tratar estados sem conteúdo e testes anteriores.

**Entregáveis:**

- percurso completo desde a página inicial até cada área de um teste;
- apresentação responsiva em computador, tablet e telemóvel.

**Critério de conclusão:** a estudante consegue localizar um teste e chegar a qualquer uma das suas quatro áreas sem ajuda.

#### Lista de trabalho: flashcards e progresso local

**Objetivo:** disponibilizar a primeira experiência completa de estudo interativo.

**Trabalho:**

- mostrar pergunta, resposta e explicação alternadamente;
- implementar as classificações Ainda não sei, Quase e Já sei;
- apresentar o progresso da sessão;
- permitir filtros por tema;
- permitir ordem normal e aleatória;
- criar sessões apenas com cartões difíceis;
- suportar botões, teclado e interação tátil;
- guardar o progresso localmente;
- testar o comportamento quando os conteúdos forem atualizados.

**Entregáveis:**

- sessão completa de flashcards;
- persistência local das classificações;
- revisão prioritária dos cartões difíceis.

**Critérios de conclusão:**

- a estudante consegue completar uma sessão;
- o progresso permanece depois de fechar e voltar a abrir a aplicação;
- os cartões difíceis podem ser revistos separadamente;
- o fluxo funciona por teclado e em ecrã tátil.

### Fase 2 — Experiência completa de estudo

**Estado:** implementada em 17 de outubro de 2026 para o teste-piloto de Geografia.

Esta fase acrescenta os resumos, os esquemas e o planeamento. No final, a estudante deverá conseguir preparar e acompanhar o estudo completo de um teste dentro da aplicação.

#### Lista de trabalho: resumos e esquemas

**Objetivo:** disponibilizar os restantes materiais de compreensão e revisão.

**Trabalho:**

- apresentar resumos com tópicos e subtópicos;
- destacar a secção “O que preciso mesmo de saber”;
- implementar os tipos de esquema escolhidos para o MVP;
- incluir alternativas textuais;
- garantir leitura adequada em ecrãs pequenos;
- aplicar a linguagem visual de painéis, esboços e desenho técnico sem criar distração.

**Entregáveis:**

- resumo completo do teste-piloto;
- esquemas do teste-piloto;
- componentes reutilizáveis para testes futuros.

**Critério de conclusão:** toda a informação essencial continua compreensível tanto na versão visual como na alternativa textual.

#### Lista de trabalho: planeamento do estudo

**Objetivo:** criar com a estudante um plano realista de três a oito dias.

**Trabalho:**

- recolher disponibilidade, duração das sessões e dias indisponíveis;
- recolher a perceção de dificuldade por tema;
- gerar uma proposta de tarefas concretas;
- respeitar o máximo de oito dias de antecedência;
- permitir ajustes antes da confirmação;
- mostrar tarefa de hoje, plano completo e progresso por tema;
- registar tarefas concluídas, parciais ou não realizadas;
- registar se uma sessão foi fácil, adequada ou difícil;
- permitir reorganização manual do plano;
- avisar quando o tempo disponível parecer insuficiente.

**Entregáveis:**

- assistente de criação do plano;
- ecrã diário e calendário/lista do plano;
- registo local de conclusão e dificuldade;
- reorganização manual de tarefas.

**Critérios de conclusão:**

- é possível criar um plano completo para o teste-piloto;
- nenhuma proposta começa mais de oito dias antes do teste;
- cada sessão contém tarefas específicas e duração estimada;
- uma tarefa não concluída pode ser reorganizada sem perder o restante progresso.

### Fase 3 — Impressão, utilização diária e lançamento

Esta fase prepara a aplicação para utilização real em diferentes dispositivos, com impressão, PDF, funcionamento offline, acessibilidade e testes com a estudante.

#### Lista de trabalho: impressão e PDF

**Objetivo:** tornar todos os materiais úteis em papel e em PDF.

**Trabalho:**

- criar estilos de impressão A4;
- implementar flashcards para recortar;
- criar folhas separadas de perguntas e respostas;
- criar o caderno de estudo;
- imprimir o plano com caixas de conclusão;
- permitir seleção de temas e cartões difíceis;
- permitir incluir ou excluir explicações;
- criar modos a cores e económico;
- testar margens, quebras de página, linhas de corte e frente/verso;
- validar a opção Imprimir → Guardar como PDF nos navegadores prioritários.

**Entregáveis:**

- quatro formatos de impressão definidos na secção 10;
- versões a cores e de baixo consumo de tinta;
- PDFs de teste para revisão visual.

**Critérios de conclusão:**

- não existem textos cortados nem cartões divididos incorretamente;
- os materiais são legíveis a preto e branco;
- os flashcards frente e verso mantêm alinhamento aceitável;
- o plano cabe num formato prático para utilização diária.

#### Lista de trabalho: PWA, funcionamento offline e robustez

**Objetivo:** preparar a aplicação para utilização diária sem depender de uma ligação permanente à Internet.

**Trabalho:**

- concluir a configuração PWA;
- permitir instalação nos dispositivos suportados;
- disponibilizar offline os conteúdos já carregados;
- definir o comportamento de atualização da aplicação e dos pacotes;
- impedir perda de progresso durante atualizações;
- tratar falhas de armazenamento e conteúdos indisponíveis;
- verificar desempenho e tempos de carregamento.

**Entregáveis:**

- aplicação instalável;
- funcionamento offline;
- estratégia segura de atualização e preservação do progresso.

**Critérios de conclusão:**

- a aplicação abre offline depois do primeiro carregamento;
- o teste-piloto pode ser estudado sem Internet;
- uma atualização não elimina o progresso existente;
- os erros recuperáveis apresentam instruções compreensíveis.

#### Lista de trabalho: acessibilidade, testes com a estudante e lançamento do MVP

**Objetivo:** validar a experiência real e corrigir problemas antes do uso regular.

**Trabalho:**

- testar os principais percursos por teclado e toque;
- verificar contraste, tamanho do texto e ampliação;
- testar em computador, tablet e telemóvel prioritários;
- realizar sessões observadas com a estudante;
- recolher dificuldades de compreensão e navegação;
- rever a duração e clareza das tarefas;
- corrigir problemas críticos;
- preparar instruções mínimas de utilização e inclusão de novos pacotes.

**Entregáveis:**

- relatório curto dos testes de utilização;
- correções prioritárias;
- checklist de lançamento concluída;
- MVP disponibilizado para utilização regular.

**Critérios de conclusão:**

- os critérios de aceitação da secção 18 estão cumpridos;
- a estudante consegue realizar os percursos principais sem assistência contínua;
- não existem problemas conhecidos que impeçam estudar, guardar progresso ou imprimir.

### Fase 4 — Automatização de novos testes

Depois de o MVP estar comprovado com conteúdo real, esta fase cria a skill que permitirá transformar a matéria de novos testes em pacotes prontos para revisão e publicação.

#### Lista de trabalho: skill de preparação de testes

**Objetivo:** automatizar a transformação da matéria de novos testes em pacotes de estudo revistos e válidos.

Esta fase deverá começar apenas depois de o esquema dos pacotes ter sido comprovado com pelo menos um teste real. A skill pode ser planeada antes, mas a sua implementação prematura arriscaria automatizar um formato ainda instável.

**Trabalho:**

- criar a skill `preparar-teste-estudante`;
- ligar as instruções ao esquema definitivo;
- definir o processo de transcrição e tratamento das fontes;
- produzir flashcards, resumo, esquemas e proposta pedagógica;
- assinalar dúvidas e conteúdo ilegível;
- validar automaticamente o pacote gerado;
- estabelecer um passo obrigatório de revisão antes da publicação;
- testar a skill com um segundo teste real.

**Entregáveis:**

- skill validada;
- pacote de um segundo teste produzido através da skill;
- relatório de dúvidas e validação;
- instruções claras para revisão e publicação.

**Critérios de conclusão:**

- a skill produz um pacote tecnicamente válido;
- as fontes, dúvidas e simplificações ficam identificadas;
- o conteúdo pode ser revisto sem editar código;
- o pacote aprovado aparece corretamente na aplicação.

## 22. Prioridades de desenvolvimento

Para resolver conflitos de tempo ou âmbito, deverá ser usada esta ordem de prioridade:

1. correção e segurança pedagógica dos conteúdos;
2. flashcards e progresso;
3. plano de estudo;
4. resumos e esquemas;
5. impressão e PDF;
6. acessibilidade, funcionamento responsivo e offline;
7. decoração e recompensas visuais;
8. funcionalidades adaptativas avançadas.

A identidade visual básica faz parte do MVP, mas a progressão através de um quarto virtual não deverá atrasar o lançamento.

## 23. Validação contínua

Em cada fase deverão ser verificados:

- comportamento esperado com o pacote-piloto;
- apresentação em ecrãs pequenos e grandes;
- acessibilidade relevante para os componentes alterados;
- ausência de regressões nos percursos já concluídos;
- impressão, quando a fase alterar conteúdo imprimível;
- preservação do progresso local, quando a fase alterar dados ou armazenamento.

As decisões tomadas durante o desenvolvimento que alterem o produto deverão ser registadas nesta especificação antes ou ao mesmo tempo que a respetiva implementação.
