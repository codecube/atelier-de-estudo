import { buildStudyPlan, refreshStudyPlan } from "./study-plan.js";

const main = document.querySelector("main");
const toast = document.querySelector("#toast");

const state = {
  packs: [],
  activePack: null,
  view: "home",
  tab: "visao-geral",
  cards: [],
  cardIndex: 0,
  revealed: false,
  theme: "todos",
  order: "normal",
  difficultOnly: false,
  diagramIndex: 0,
  planEditing: false,
  focusTheme: null,
  timer: null,
};

const storageKey = (testId) => `atelier-estudo:v1:${testId}`;

function readProgress(testId) {
  try { return JSON.parse(localStorage.getItem(storageKey(testId))) || { cards: {}, sessions: 0 }; }
  catch { return { cards: {}, sessions: 0 }; }
}

function saveProgress(testId, progress) {
  localStorage.setItem(storageKey(testId), JSON.stringify(progress));
}

function timerTasks(plan) {
  return plan?.days.flatMap((day) => day.tasks) || [];
}

function ensureTimer(pack, plan) {
  if (state.timer?.testId === pack.teste.id) return state.timer;
  const progress = readProgress(pack.teste.id);
  const tasks = timerTasks(plan);
  const stored = progress.timer;
  const selected = tasks.find((task) => task.id === stored?.taskId) || tasks.find((task) => !task.done) || tasks[0];
  if (!selected) return null;
  state.timer = {
    testId: pack.teste.id,
    taskId: selected.id,
    title: selected.title,
    totalSeconds: stored?.taskId === selected.id ? stored.totalSeconds : selected.minutes * 60,
    remainingSeconds: stored?.taskId === selected.id ? stored.remainingSeconds : selected.minutes * 60,
    running: false,
    intervalId: null,
  };
  return state.timer;
}

function persistTimer() {
  if (!state.timer) return;
  const progress = readProgress(state.timer.testId);
  progress.timer = {
    taskId: state.timer.taskId,
    title: state.timer.title,
    totalSeconds: state.timer.totalSeconds,
    remainingSeconds: state.timer.remainingSeconds,
  };
  saveProgress(state.timer.testId, progress);
}

function formatTime(seconds) {
  const safe = Math.max(0, seconds);
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

function updateTimerDisplay() {
  if (!state.timer) return;
  document.querySelectorAll("[data-timer-edit]").forEach((node) => {
    if (node !== document.activeElement) node.value = formatTime(state.timer.remainingSeconds);
  });
  const percent = state.timer.totalSeconds ? ((state.timer.totalSeconds - state.timer.remainingSeconds) / state.timer.totalSeconds) * 100 : 0;
  document.querySelectorAll("[data-timer-progress]").forEach((node) => { node.style.setProperty("--timer-progress", `${percent * 3.6}deg`); });
}

function refreshTimerControls() {
  if (state.tab === "plano") {
    rerenderTab();
    return;
  }
  const compact = document.querySelector(".study-timer.compact");
  if (compact && state.timer) compact.outerHTML = timerControlsMarkup(true);
}

function clearTimerInterval() {
  if (state.timer?.intervalId) window.clearInterval(state.timer.intervalId);
  if (state.timer) state.timer.intervalId = null;
}

let timerAudioContext;
let timerAlarmInterval;
const timerSoundNodes = new Set();

function prepareTimerAudio() {
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    timerAudioContext ||= new Audio();
    if (timerAudioContext.state === "suspended") timerAudioContext.resume().catch(() => {});
  } catch { /* The visual alarm remains available when audio is unavailable. */ }
}

function timerTone(frequency, offset, duration, volume = 0.12) {
  const context = timerAudioContext;
  if (!context || context.state !== "running") return;
  const start = context.currentTime + offset;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.008);
  gain.gain.setValueAtTime(volume, start + duration - 0.015);
  gain.gain.linearRampToValueAtTime(0, start + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  timerSoundNodes.add(oscillator);
  oscillator.onended = () => { timerSoundNodes.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
  oscillator.start(start);
  oscillator.stop(start + duration);
}

function silenceTimerAlarm() {
  window.clearInterval(timerAlarmInterval);
  timerAlarmInterval = null;
  for (const node of timerSoundNodes) { try { node.stop(); } catch {} }
  document.querySelector("#timer-alarm")?.remove();
}

function ringTimerAlarm() {
  silenceTimerAlarm();
  const dialog = document.createElement("dialog");
  dialog.id = "timer-alarm";
  dialog.className = "timer-alarm";
  dialog.setAttribute("aria-labelledby", "timer-alarm-title");
  dialog.innerHTML = `<div class="eyebrow">Fim da sessão</div><h2 id="timer-alarm-title">☎ O tempo terminou!</h2><p>${escapeHtml(state.timer?.title || "Boa sessão de estudo!")}</p><button class="primary-button" data-action="timer-silence" autofocus>Silenciar alarme</button>`;
  dialog.addEventListener("cancel", (event) => { event.preventDefault(); silenceTimerAlarm(); });
  document.body.append(dialog);
  dialog.showModal();
  const ring = () => {
    // Rapid paired bell tones, followed by a pause: an old telephone's ring.
    for (let pulse = 0; pulse < 10; pulse += 1) {
      timerTone(pulse % 2 ? 1050 : 850, pulse * 0.09, 0.075, 0.16);
      timerTone(pulse % 2 ? 1450 : 1250, pulse * 0.09, 0.075, 0.07);
    }
  };
  ring();
  timerAlarmInterval = window.setInterval(ring, 2400);
}

function startTimer() {
  if (!state.timer || state.timer.running) return;
  silenceTimerAlarm();
  prepareTimerAudio();
  if (timerAudioContext) {
    Promise.resolve(timerAudioContext.resume()).then(() => {
      timerTone(660, 0, 0.13);
      timerTone(880, 0.17, 0.19);
    }).catch(() => {});
  }
  if (state.timer.remainingSeconds <= 0) state.timer.remainingSeconds = state.timer.totalSeconds;
  state.timer.running = true;
  clearTimerInterval();
  state.timer.intervalId = window.setInterval(() => {
    state.timer.remainingSeconds -= 1;
    updateTimerDisplay();
    if (state.timer.remainingSeconds % 5 === 0) persistTimer();
    if (state.timer.remainingSeconds <= 0) {
      state.timer.remainingSeconds = 0;
      state.timer.running = false;
      clearTimerInterval();
      persistTimer();
      refreshTimerControls();
      ringTimerAlarm();
      showToast("Tempo concluído — boa sessão!");
    }
  }, 1000);
  persistTimer();
  refreshTimerControls();
}

function pauseTimer() {
  if (!state.timer) return;
  state.timer.running = false;
  clearTimerInterval();
  persistTimer();
  refreshTimerControls();
}

function adjustTimerSeconds(seconds) {
  if (!state.timer || !Number.isFinite(seconds)) return;
  const remaining = Math.min(180 * 60, Math.max(60, Math.round(seconds)));
  const elapsed = Math.max(0, state.timer.totalSeconds - state.timer.remainingSeconds);
  silenceTimerAlarm();
  state.timer.remainingSeconds = remaining;
  state.timer.totalSeconds = elapsed + remaining;
  persistTimer();
  updateTimerDisplay();
  showToast(`Tempo restante: ${formatTime(remaining)}`);
}

function stopTimer() {
  silenceTimerAlarm();
  if (!state.timer) return;
  state.timer.running = false;
  clearTimerInterval();
  state.timer.remainingSeconds = state.timer.totalSeconds;
  persistTimer();
  refreshTimerControls();
}

function selectTimerTask(pack, taskId) {
  const progress = readProgress(pack.teste.id);
  const task = timerTasks(progress.plan).find((item) => item.id === taskId);
  if (!task) return;
  silenceTimerAlarm();
  clearTimerInterval();
  state.timer = { testId: pack.teste.id, taskId: task.id, title: task.title, totalSeconds: task.minutes * 60, remainingSeconds: task.minutes * 60, running: false, intervalId: null };
  persistTimer();
  rerenderTab();
  showToast(`Temporizador preparado: ${task.title}`);
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("pt-PT", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

function daysUntil(value) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(`${value}T00:00:00`) - today) / 86400000);
}

function progressStats(pack) {
  const progress = readProgress(pack.teste.id);
  const values = pack.flashcards.map((card) => progress.cards[card.id]).filter(Boolean);
  const known = values.filter((value) => value === "known").length;
  const difficult = values.filter((value) => value === "hard" || value === "almost").length;
  return { known, difficult, seen: values.length, percent: Math.round((known / pack.flashcards.length) * 100) };
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function homeView() {
  const cards = state.packs.map((pack) => {
    const stats = progressStats(pack);
    const days = daysUntil(pack.teste.data);
    const countdown = days > 1 ? `${days} dias` : days === 1 ? "amanhã" : days === 0 ? "hoje" : "concluído";
    return `<button class="project-card" data-open-test="${pack.teste.id}">
      <span class="tag">${pack.teste.demonstracao ? "Demonstração" : "Próximo teste"}</span>
      <h3>${escapeHtml(pack.teste.titulo)}</h3>
      <div class="subject">${escapeHtml(pack.teste.disciplina)} · ${formatDate(pack.teste.data)}</div>
      <div class="project-meta"><span>${pack.flashcards.length} cartões</span><span>${countdown}</span></div>
      <div class="progress-track" aria-label="${stats.percent}% dominado"><span style="width:${stats.percent}%"></span></div>
    </button>`;
  }).join("");

  main.innerHTML = `<section class="page">
    <div class="hero">
      <div>
        <div class="eyebrow">O teu espaço para aprender</div>
        <h1>Desenha o teu caminho até ao teste.</h1>
        <p class="lead">Um atelier tranquilo para organizar a matéria, praticar com flashcards e ver o progresso ganhar forma.</p>
      </div>
      <div class="hero-illustration" aria-hidden="true">
        <img class="study-desk" src="assets/study-desk-terracotta.png" alt="" width="1776" height="886">
      </div>
    </div>
    <div class="section-heading"><div><div class="eyebrow">Pasta de projetos</div><h2>Testes em preparação</h2><p>Escolhe um projeto para continuar.</p></div></div>
    <div class="project-grid">${cards}<article class="project-card empty-project"><div><strong>O próximo projeto começa aqui</strong><p>Novos testes serão adicionados através de um pacote YAML.</p></div></article></div>
  </section>`;
}

function timerControlsMarkup(compact = false) {
  if (!state.timer) return "";
  return `<section class="study-timer ${compact ? "compact" : ""}" aria-label="Temporizador de estudo">
    <div class="timer-tools" role="group" aria-label="Controlos do temporizador">
      <input class="timer-time-edit" data-timer-edit type="text" inputmode="decimal" maxlength="6" value="${formatTime(state.timer.remainingSeconds)}" aria-label="Editar tempo restante, em minutos ou minutos e segundos" title="Clica para editar: 25 ou 25:00">
      <div class="timer-actions">
        ${state.timer.running ? '<button class="timer-button pause" data-action="timer-pause" aria-label="Pausar temporizador" title="Pausar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg></button>' : '<button class="timer-button start" data-action="timer-start" aria-label="Iniciar temporizador" title="Iniciar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7Z"/></svg></button>'}
        <button class="timer-button stop" data-action="timer-stop" aria-label="Parar temporizador" title="Parar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h12v12H6Z"/></svg></button>
      </div>
    </div>
    <div class="timer-copy"><span>${state.timer.running ? "A estudar agora" : state.timer.remainingSeconds < state.timer.totalSeconds ? "Sessão em pausa" : "Pronto para começar"}</span><strong>${escapeHtml(state.timer.title)}</strong></div>
  </section>`;
}

function compactTimerFor(pack) {
  const plan = readProgress(pack.teste.id).plan;
  if (!plan) return "";
  ensureTimer(pack, plan);
  return state.timer ? timerControlsMarkup(true) : "";
}

function testView() {
  const pack = state.activePack;
  const tabs = [
    ["visao-geral", "Visão geral"], ["plano", "Plano"], ["resumo", "Resumo"], ["esquemas", "Esquemas"], ["flashcards", "Flashcards"]
  ];
  main.innerHTML = `<section class="page">
    <button class="back-button" data-action="home">← Voltar aos projetos</button>
    <div class="test-header"><div><div class="eyebrow">${escapeHtml(pack.teste.disciplina)}</div><h1>${escapeHtml(pack.teste.titulo)}</h1><p>Teste a ${formatDate(pack.teste.data)}</p></div>${pack.teste.demonstracao ? '<div class="test-stamp">Conteúdo<br>de demonstração</div>' : ""}</div>
    <nav class="tabs" aria-label="Áreas do teste">${tabs.map(([id, label]) => `<button class="tab ${state.tab === id ? "active" : ""}" data-tab="${id}" ${state.tab === id ? 'aria-current="page"' : ""}>${label}</button>`).join("")}</nav>
    ${state.tab !== "plano" ? compactTimerFor(pack) : ""}
    <div id="tab-content">${tabContent(pack)}</div>
  </section>`;
}

function tabContent(pack) {
  if (state.tab === "visao-geral") return overview(pack);
  if (state.tab === "plano") return planView(pack);
  if (state.tab === "resumo") return summaryView(pack);
  if (state.tab === "esquemas") return diagramsView(pack);
  if (state.tab === "flashcards") return flashcardsView(pack);
  return "";
}

function overview(pack) {
  const stats = progressStats(pack);
  return `<div class="overview-grid">
    <article class="panel"><div class="eyebrow">Estado do projeto</div><h2>Preparar, praticar, dominar.</h2><div class="stat-row"><div class="stat"><strong>${pack.flashcards.length}</strong><small>flashcards</small></div><div class="stat"><strong>${stats.known}</strong><small>já sei</small></div><div class="stat"><strong>${stats.difficult}</strong><small>a rever</small></div></div><div class="button-row"><button class="primary-button" data-tab="plano">Ver plano de estudo</button><button class="secondary-button" data-tab="flashcards">Estudar flashcards</button>${stats.difficult ? '<button class="secondary-button" data-action="difficult">Rever «Ainda não sei» e «Quase»</button>' : ""}</div></article>
    <aside class="panel"><div class="eyebrow">Planta da matéria</div><h2>Temas</h2><ul class="theme-list">${pack.temas.map((theme) => `<li><span>${escapeHtml(theme.nome)}</span><span>${pack.flashcards.filter((card) => card.tema === theme.id).length} cartões</span></li>`).join("")}</ul></aside>
  </div>`;
}

function summarySectionPoints(section) {
  return section.pontos.map((point, index) => {
    const subtitle = section.subtitulos?.find((item) => item.antes_do_ponto === index + 1);
    const heading = subtitle ? `${index ? "</ul>" : ""}<h4>${escapeHtml(subtitle.titulo)}</h4><ul>` : index === 0 ? "<ul>" : "";
    return `${heading}<li>${escapeHtml(point)}</li>`;
  }).join("") + "</ul>";
}

function summaryView(pack) {
  const summary = pack.resumo;
  return `<div class="summary-page">
    <header class="content-intro"><div><div class="eyebrow">Painel de revisão</div><h2>A matéria, sem ruído.</h2></div><p>${escapeHtml(summary.introducao)}</p></header>
    <div class="summary-layout">
      <div class="summary-sections">${summary.secoes.map((section, index) => `<article id="summary-${section.id}" class="summary-card ${state.focusTheme === section.id ? "focused" : ""}"><div class="summary-number">0${index + 1}</div><div><h3>${escapeHtml(section.titulo)}</h3>${summarySectionPoints(section)}</div></article>`).join("")}</div>
      <aside class="summary-sidebar">
        <section class="essential-card"><div class="eyebrow">Checklist final</div><h3>O que preciso mesmo de saber</h3><ul>${summary.essencial.map((point) => `<li><span aria-hidden="true">✓</span>${escapeHtml(point)}</li>`).join("")}</ul></section>
        ${summary.alertas.length ? `<section class="source-alert"><strong>Antes do teste</strong>${summary.alertas.map((alert) => `<p>${escapeHtml(alert)}</p>`).join("")}</section>` : ""}
      </aside>
    </div>
  </div>`;
}

function diagramsView(pack) {
  const diagrams = pack.esquemas;
  state.diagramIndex = Math.min(state.diagramIndex, diagrams.length - 1);
  const active = diagrams[state.diagramIndex];
  return `<div class="diagrams-page">
    <header class="content-intro"><div><div class="eyebrow">Mesa de desenho</div><h2>Ver para compreender.</h2></div><p>Explora cada esquema e tenta explicá-lo em voz alta sem ler os textos.</p></header>
    <div class="diagram-tabs" role="tablist" aria-label="Esquemas da matéria">${diagrams.map((diagram, index) => `<button role="tab" aria-selected="${index === state.diagramIndex}" class="diagram-tab ${index === state.diagramIndex ? "active" : ""}" data-diagram="${index}"><span>0${index + 1}</span>${escapeHtml(diagram.titulo)}</button>`).join("")}</div>
    <article class="diagram-board diagram-${active.tipo}">
      <div class="diagram-title"><div><span class="tag">${escapeHtml(active.tipo)}</span><h3>${escapeHtml(active.titulo)}</h3></div><p>${escapeHtml(active.descricao)}</p></div>
      <div class="diagram-blocks">${active.blocos.map((block, index) => `<div class="diagram-block"><span class="block-index">${String(index + 1).padStart(2, "0")}</span><h4>${escapeHtml(block.titulo)}</h4><strong>${escapeHtml(block.destaque || "")}</strong><p>${escapeHtml(block.texto)}</p></div>`).join('<span class="diagram-connector" aria-hidden="true">→</span>')}</div>
      <details class="text-alternative"><summary>Ver alternativa textual</summary><p>${escapeHtml(active.alternativa_textual)}</p></details>
    </article>
  </div>`;
}

function localDateISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function studyDates(pack) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const testDate = new Date(`${pack.teste.data}T00:00:00`);
  const earliest = new Date(testDate); earliest.setDate(testDate.getDate() - Math.min(8, pack.planeamento.antecedencia.maximo_dias));
  const start = earliest > today ? earliest : today;
  const dates = [];
  for (const date = new Date(start); date < testDate; date.setDate(date.getDate() + 1)) dates.push(localDateISO(date));
  return dates;
}

function shortDate(value) {
  return new Intl.DateTimeFormat("pt-PT", { weekday: "long", day: "numeric", month: "long" }).format(new Date(`${value}T12:00:00`));
}

function planSetup(pack, existing) {
  const dates = studyDates(pack);
  if (!dates.length) return `<div class="coming-soon"><div class="completion-mark">✓</div><h2>A data do teste já chegou</h2><p>Usa os flashcards para uma revisão breve e confiante.</p><button class="primary-button" data-tab="flashcards">Revisão rápida</button></div>`;
  const selectedDates = new Set(existing?.availability || dates);
  const confidence = existing?.themeConfidence || {};
  return `<form id="plan-form" class="plan-builder">
    <header class="content-intro"><div><div class="eyebrow">Agenda do projeto</div><h2>Vamos desenhar o plano.</h2></div><p>Escolhe os dias possíveis e diz como te sentes em cada tema. O plano pode ser ajustado depois.</p></header>
    <div class="builder-grid">
      <section class="panel"><h3>1. Quando podes estudar?</h3><div class="available-days">${dates.map((date) => `<label class="day-choice"><input type="checkbox" name="study-day" value="${date}" ${selectedDates.has(date) ? "checked" : ""}><span><strong>${escapeHtml(shortDate(date))}</strong><small>Disponível para estudar</small></span></label>`).join("")}</div><label class="field-label" for="session-minutes">Duração aproximada de cada sessão</label><select id="session-minutes" name="session-minutes">${[15,20,25,30,40].map((minutes) => `<option value="${minutes}" ${(existing?.sessionMinutes || pack.planeamento.duracao_sessao_sugerida_minutos) === minutes ? "selected" : ""}>${minutes} minutos</option>`).join("")}</select></section>
      <section class="panel"><h3>2. Como está cada tema?</h3><div class="confidence-list">${pack.temas.map((theme) => `<label><span>${escapeHtml(theme.nome)}</span><select name="confidence-${theme.id}"><option value="dificil" ${confidence[theme.id] === "dificil" ? "selected" : ""}>Ainda não percebo</option><option value="praticar" ${!confidence[theme.id] || confidence[theme.id] === "praticar" ? "selected" : ""}>Preciso de praticar</option><option value="sei" ${confidence[theme.id] === "sei" ? "selected" : ""}>Já sei razoavelmente</option></select></label>`).join("")}</div></section>
    </div>
    <div class="builder-actions">${existing ? '<button type="button" class="secondary-button" data-action="cancel-plan-edit">Cancelar</button>' : ""}<button class="primary-button" type="submit">${existing ? "Atualizar plano" : "Criar o meu plano"}</button></div>
  </form>`;
}

function createPlan(pack, form) {
  const data = new FormData(form);
  const availability = data.getAll("study-day");
  if (!availability.length) { showToast("Escolhe pelo menos um dia para estudar"); return null; }
  const sessionMinutes = Number(data.get("session-minutes"));
  const themeConfidence = Object.fromEntries(pack.temas.map((theme) => [theme.id, data.get(`confidence-${theme.id}`)]));
  if (pack.planeamento.roteiro) return buildStudyPlan(pack, availability, sessionMinutes, readProgress(pack.teste.id).plan, themeConfidence);
  const rank = { dificil: 0, praticar: 1, sei: 2 };
  const minutes = { dificil: 12, praticar: 10, sei: 8 };
  const tasks = [...pack.temas].sort((a, b) => rank[themeConfidence[a.id]] - rank[themeConfidence[b.id]] || b.peso - a.peso).map((theme) => ({
    id: `tema-${theme.id}`,
    title: themeConfidence[theme.id] === "dificil" ? `Compreender ${theme.nome}` : `Rever ${theme.nome}`,
    detail: `Lê esta parte do resumo, observa o esquema relacionado e pratica os flashcards do tema.`,
    minutes: minutes[themeConfidence[theme.id]],
    theme: theme.id,
  }));
  const finalReview = { id: "revisao-final", title: "Revisão final", detail: "Revê os cartões difíceis e explica as fórmulas e as três fases sem consultar.", minutes: 8, theme: null };
  const days = availability.sort().map((date) => ({ date, tasks: [], rating: null }));
  const loads = days.map(() => 0);
  tasks.forEach((task) => {
    const dayIndex = loads.indexOf(Math.min(...loads));
    const previous = readProgress(pack.teste.id).plan?.days.flatMap((day) => day.tasks).find((item) => item.id === task.id);
    days[dayIndex].tasks.push({ ...task, done: previous?.done || false });
    loads[dayIndex] += task.minutes;
  });
  const previousFinal = readProgress(pack.teste.id).plan?.days.flatMap((day) => day.tasks).find((item) => item.id === finalReview.id);
  days[days.length - 1].tasks.push({ ...finalReview, done: previousFinal?.done || false });
  const oldRatings = Object.fromEntries((readProgress(pack.teste.id).plan?.days || []).map((day) => [day.date, day.rating]));
  days.forEach((day) => { day.rating = oldRatings[day.date] || null; });
  return { createdAt: new Date().toISOString(), availability, sessionMinutes, themeConfidence, days };
}

function taskResources(pack, task) {
  const theme = task.theme;
  const hasSummary = !theme || pack.resumo.secoes.some((section) => section.id === theme);
  const hasDiagram = !theme || pack.esquemas.some((diagram) => diagram.temas.includes(theme));
  const label = theme ? "do tema" : "geral";
  return `<div class="task-resources" aria-label="Recursos para ${escapeHtml(task.title)}">
    <button data-timer-task="${task.id}" class="resource-link timer-link" aria-pressed="${state.timer?.taskId === task.id}"><span aria-hidden="true">◷</span> Cronometrar</button>
    ${hasSummary ? `<button data-resource="resumo" data-resource-theme="${theme || ""}" class="resource-link"><span aria-hidden="true">☰</span> Resumo ${label}</button>` : ""}
    ${hasDiagram ? `<button data-resource="esquemas" data-resource-theme="${theme || ""}" class="resource-link"><span aria-hidden="true">◇</span> Esquema ${label}</button>` : ""}
    <button data-resource="flashcards" data-resource-theme="${theme || ""}" class="resource-link"><span aria-hidden="true">▱</span> Flashcards ${label}</button>
  </div>`;
}

function planView(pack) {
  const progress = readProgress(pack.teste.id);
  const plan = progress.plan;
  if (!plan || state.planEditing) return planSetup(pack, plan);
  const tasks = plan.days.flatMap((day) => day.tasks);
  const done = tasks.filter((task) => task.done).length;
  const percent = tasks.length ? Math.round(done / tasks.length * 100) : 0;
  const today = localDateISO(new Date());
  ensureTimer(pack, plan);
  return `<div class="plan-page">
    <header class="content-intro"><div><div class="eyebrow">Agenda do projeto</div><h2>${done === tasks.length ? "Plano concluído!" : "Um passo de cada vez."}</h2></div><div class="plan-progress"><strong>${percent}%</strong><span>${done} de ${tasks.length} tarefas</span></div></header>
    ${timerControlsMarkup()}
    ${pack.planeamento.roteiro ? `<p>Plano atualizado com toda a matéria. Faz uma pausa de ${pack.planeamento.roteiro.pausa_minutos} minutos entre sessões. Cada sessão dura até ${plan.sessionMinutes} minutos, salvo tarefas mais longas.</p>` : ""}
    <div class="progress-track plan-track"><span style="width:${percent}%"></span></div>
    <div class="plan-days">${plan.days.map((day, dayIndex) => `<article class="plan-day ${day.date === today ? "today" : ""}"><header><div><span>${day.date === today ? "Hoje" : `Sessão ${dayIndex + 1}`}</span><h3>${escapeHtml(shortDate(day.date))}</h3></div><strong>${day.tasks.reduce((sum, task) => sum + task.minutes, 0)} min</strong></header><div class="task-list">${day.tasks.map((task, taskIndex) => `${task.session && (taskIndex === 0 || day.tasks[taskIndex - 1].session !== task.session) ? `<p class="eyebrow">Sessão ${task.session} · ${day.tasks.filter((item) => item.session === task.session).reduce((sum, item) => sum + item.minutes, 0)} min</p>` : ""}<div class="study-task-wrap ${task.done ? "done" : ""}"><label class="study-task"><input type="checkbox" data-plan-task="${task.id}" ${task.done ? "checked" : ""}><span class="task-check" aria-hidden="true">✓</span><span><strong>${escapeHtml(task.title)}</strong><small>${escapeHtml(task.detail)} · ${task.minutes} min</small></span></label>${taskResources(pack, task)}</div>`).join("")}</div><div class="session-rating"><span>Como correu esta sessão?</span><div>${[["facil","Fácil"],["adequado","Adequada"],["dificil","Difícil"]].map(([value,label]) => `<button class="rating-chip ${day.rating === value ? "active" : ""}" aria-pressed="${day.rating === value}" data-session-rating="${value}" data-plan-date="${day.date}">${label}</button>`).join("")}</div></div></article>`).join("")}</div>
    <div class="builder-actions"><button class="secondary-button" data-action="adjust-plan">Ajustar dias e temas</button><button class="primary-button" data-tab="flashcards">Começar flashcards</button></div>
  </div>`;
}

function prepareCards(pack, resetIndex = true) {
  let cards = [...pack.flashcards];
  if (state.theme !== "todos") cards = cards.filter((card) => card.tema === state.theme);
  if (state.difficultOnly) {
    const progress = readProgress(pack.teste.id);
    cards = cards.filter((card) => progress.cards[card.id] === "hard" || progress.cards[card.id] === "almost");
  }
  if (state.order === "aleatoria") cards.sort(() => Math.random() - .5);
  state.cards = cards;
  if (resetIndex) state.cardIndex = 0;
  state.revealed = false;
}

function flashcardsView(pack) {
  if (!state.cards.length && !state.difficultOnly && state.theme === "todos") prepareCards(pack);
  const stats = progressStats(pack);
  const card = state.cards[state.cardIndex];
  return `<div class="study-layout">
    <aside class="panel study-controls">
      <div class="mini-progress"><div><strong>Domínio</strong><span>${stats.percent}%</span></div><div class="progress-track"><span style="width:${stats.percent}%"></span></div></div>
      <label for="theme-filter">Tema</label><select id="theme-filter"><option value="todos">Todos os temas</option>${pack.temas.map((theme) => `<option value="${theme.id}" ${state.theme === theme.id ? "selected" : ""}>${escapeHtml(theme.nome)}</option>`).join("")}</select>
      <label for="order-filter">Ordem</label><select id="order-filter"><option value="normal">Ordem original</option><option value="aleatoria" ${state.order === "aleatoria" ? "selected" : ""}>Aleatória</option></select>
      <button class="secondary-button" data-action="toggle-difficult">${state.difficultOnly ? "Ver todos os cartões" : `Rever «Ainda não sei» e «Quase» (${stats.difficult})`}</button>
      <button class="secondary-button" data-action="restart">Recomeçar sessão</button>
      <button class="secondary-button" data-action="toggle-sound" aria-pressed="${ratingSoundEnabled}">${ratingSoundEnabled ? "Som: ligado" : "Som: desligado"}</button>
    </aside>
    <div class="flashcard-area">${card ? cardMarkup(pack, card) : emptyCardsMarkup()}</div>
  </div>`;
}

function navigationMarkup() {
  return `<nav class="card-navigation" aria-label="Navegação dos flashcards">
    <button class="secondary-button" data-action="previous-card" aria-keyshortcuts="ArrowLeft" ${state.cardIndex === 0 ? "disabled" : ""}>← Anterior</button>
    <button class="secondary-button" data-action="next-card" aria-keyshortcuts="ArrowRight" ${state.cardIndex >= state.cards.length - 1 ? "disabled" : ""}>Seguinte →</button>
  </nav>`;
}

function navigateCard(direction) {
  const nextIndex = state.cardIndex + direction;
  if (nextIndex < 0 || nextIndex >= state.cards.length) return;
  state.cardIndex = nextIndex;
  state.revealed = false;
  rerenderTab();
  const action = direction < 0 ? "previous-card" : "next-card";
  const button = document.querySelector(`[data-action="${action}"]`);
  const fallback = document.querySelector(`[data-action="${direction < 0 ? "next-card" : "previous-card"}"]`);
  (button && !button.disabled ? button : fallback)?.focus({ preventScroll: true });
}

function cardMarkup(pack, card) {
  const theme = pack.temas.find((item) => item.id === card.tema);
  return `<article class="flashcard">
    <div class="card-top"><span class="tag">${escapeHtml(theme.nome)}</span><span class="card-number">${state.cardIndex + 1} / ${state.cards.length}</span></div>
    <div class="card-content">${state.revealed ? `<div class="answer-block"><h3>Resposta</h3><div class="answer">${escapeHtml(card.resposta)}</div><p class="explanation"><strong>Porquê?</strong> ${escapeHtml(card.explicacao)}</p></div>` : `<p class="prompt">${escapeHtml(card.pergunta)}</p>`}</div>
    <div class="card-actions">${state.revealed ? '<button class="rating hard" data-rate="hard">Ainda não sei · 1</button><button class="rating almost" data-rate="almost">Quase · 2</button><button class="rating known" data-rate="known">Já sei · 3</button>' : '<button class="primary-button" data-action="reveal">Ver resposta</button>'}</div>
  </article>${navigationMarkup()}<p class="keyboard-hint">← / → para navegar · ${state.revealed ? "Usa 1, 2 ou 3 para responder" : "Carrega na barra de espaço para revelar"}</p>`;
}

function emptyCardsMarkup() {
  const message = state.difficultOnly ? "Não há cartões «Ainda não sei» ou «Quase» neste filtro. Podes voltar a ver todos os cartões." : "Não existem cartões neste filtro.";
  return `<div class="panel completion"><div class="completion-mark">✓</div><h2>Sessão concluída</h2><p>${message}</p><button class="primary-button" data-action="restart">Estudar novamente</button></div>${state.cards.length ? navigationMarkup() : ""}`;
}

function rerenderTab() {
  const container = document.querySelector("#tab-content");
  if (container) container.innerHTML = tabContent(state.activePack);
}

function openStudyResource(type, theme) {
  state.focusTheme = theme || null;
  if (type === "resumo") {
    state.tab = "resumo";
    render();
    if (theme) window.requestAnimationFrame(() => document.querySelector(`#summary-${theme}`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
    return;
  }
  if (type === "esquemas") {
    state.diagramIndex = theme ? Math.max(0, state.activePack.esquemas.findIndex((diagram) => diagram.temas.includes(theme))) : 0;
    state.tab = "esquemas";
    render();
    return;
  }
  state.theme = theme || "todos";
  state.difficultOnly = false;
  state.tab = "flashcards";
  prepareCards(state.activePack);
  render();
}

let ratingAudioContext;
let ratingSoundEnabled = true;
try { ratingSoundEnabled = localStorage.getItem("atelier-estudo:sound") !== "off"; } catch {}

async function playRatingSound(rating) {
  if (!ratingSoundEnabled) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    ratingAudioContext ||= new AudioContext();
    if (ratingAudioContext.state === "suspended") await ratingAudioContext.resume();
    if (ratingAudioContext.state !== "running") return;
    const context = ratingAudioContext;
    const start = context.currentTime + 0.01;
    const tone = (frequency, offset, duration, type = "sine", volume = 0.12, endFrequency = frequency) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, start + offset);
      oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + offset + duration);
      gain.gain.setValueAtTime(0, start + offset);
      gain.gain.linearRampToValueAtTime(volume, start + offset + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, start + offset + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      oscillator.start(start + offset);
      oscillator.stop(start + offset + duration + 0.01);
    };
    if (rating === "known") {
      // A quick mechanical click followed by the bright double bell of a cash register.
      tone(1800, 0, 0.045, "square", 0.035, 700);
      [1318.5, 2637, 3955.5].forEach((frequency, index) => tone(frequency, 0.07, 0.18, "sine", 0.1 / (index + 1)));
      [1760, 3520, 5280].forEach((frequency, index) => tone(frequency, 0.19, 0.48, "sine", 0.13 / (index + 1)));
    } else if (rating === "almost") {
      [392, 440, 392, 523.25].forEach((frequency, index) => tone(frequency, index * 0.12, 0.11, "triangle", 0.15));
    } else if (rating === "hard") {
      tone(145, 0, 0.32, "sawtooth", 0.065, 95);
      tone(151, 0, 0.32, "sawtooth", 0.045, 100);
    }
  } catch {
    // Audio is optional; a browser audio failure must never interrupt studying.
  }
}

function rateCard(rating) {
  const card = state.cards[state.cardIndex];
  if (!card) return;
  const progress = readProgress(state.activePack.teste.id);
  progress.cards[card.id] = rating;
  if (state.cardIndex === state.cards.length - 1) progress.sessions = (progress.sessions || 0) + 1;
  saveProgress(state.activePack.teste.id, progress);
  void playRatingSound(rating);
  state.cardIndex += 1;
  state.revealed = false;
  rerenderTab();
  showToast("Progresso guardado");
}

function render() {
  if (state.view === "home") homeView(); else testView();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.addEventListener("click", (event) => {
  const open = event.target.closest("[data-open-test]");
  if (open) {
    state.activePack = state.packs.find((pack) => pack.teste.id === open.dataset.openTest);
    state.view = "test"; state.tab = "visao-geral"; state.cards = []; render(); return;
  }
  const tab = event.target.closest("[data-tab]");
  if (tab) { state.tab = tab.dataset.tab; if (state.tab === "flashcards" && !state.cards.length) prepareCards(state.activePack); render(); return; }
  const diagram = event.target.closest("[data-diagram]");
  if (diagram) { state.diagramIndex = Number(diagram.dataset.diagram); rerenderTab(); return; }
  const timerTask = event.target.closest("[data-timer-task]");
  if (timerTask) { selectTimerTask(state.activePack, timerTask.dataset.timerTask); return; }
  const resource = event.target.closest("[data-resource]");
  if (resource) { openStudyResource(resource.dataset.resource, resource.dataset.resourceTheme); return; }
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "home") { state.view = "home"; state.activePack = null; render(); }
  if (action === "toggle-sound") {
    ratingSoundEnabled = !ratingSoundEnabled;
    try { localStorage.setItem("atelier-estudo:sound", ratingSoundEnabled ? "on" : "off"); } catch {}
    rerenderTab();
    document.querySelector('[data-action="toggle-sound"]')?.focus({ preventScroll: true });
  }
  if (action === "previous-card") navigateCard(-1);
  if (action === "next-card") navigateCard(1);
  if (action === "reveal") { state.revealed = true; rerenderTab(); }
  if (action === "restart") { prepareCards(state.activePack); rerenderTab(); }
  if (action === "toggle-difficult") { state.difficultOnly = !state.difficultOnly; prepareCards(state.activePack); rerenderTab(); }
  if (action === "difficult") { state.tab = "flashcards"; state.difficultOnly = true; prepareCards(state.activePack); render(); }
  if (action === "adjust-plan") { state.planEditing = true; rerenderTab(); }
  if (action === "cancel-plan-edit") { state.planEditing = false; rerenderTab(); }
  if (action === "timer-start") startTimer();
  if (action === "timer-pause") pauseTimer();
  if (action === "timer-stop") stopTimer();
  if (action === "timer-silence") silenceTimerAlarm();
  const sessionRating = event.target.closest("[data-session-rating]");
  if (sessionRating) {
    const progress = readProgress(state.activePack.teste.id);
    const day = progress.plan?.days.find((item) => item.date === sessionRating.dataset.planDate);
    if (day) { day.rating = sessionRating.dataset.sessionRating; saveProgress(state.activePack.teste.id, progress); rerenderTab(); showToast("Avaliação da sessão guardada"); }
  }
  const rating = event.target.closest("[data-rate]")?.dataset.rate;
  if (rating) rateCard(rating);
});

document.addEventListener("change", (event) => {
  if (event.target.matches("[data-timer-edit]")) {
    const value = event.target.value.trim();
    const match = value.match(/^(\d{1,3})(?::([0-5]\d))?$/);
    if (match) adjustTimerSeconds(Number(match[1]) * 60 + Number(match[2] || 0));
    else showToast("Escreve os minutos (25) ou minutos e segundos (25:30).");
    event.target.value = formatTime(state.timer.remainingSeconds);
  }
  if (event.target.id === "theme-filter") { state.theme = event.target.value; prepareCards(state.activePack); rerenderTab(); }
  if (event.target.id === "order-filter") { state.order = event.target.value; prepareCards(state.activePack); rerenderTab(); }
  if (event.target.matches("[data-plan-task]")) {
    const progress = readProgress(state.activePack.teste.id);
    const task = progress.plan?.days.flatMap((day) => day.tasks).find((item) => item.id === event.target.dataset.planTask);
    if (task) { task.done = event.target.checked; saveProgress(state.activePack.teste.id, progress); rerenderTab(); showToast(event.target.checked ? "Tarefa concluída" : "Tarefa reaberta"); }
  }
});

document.addEventListener("submit", (event) => {
  if (event.target.id !== "plan-form") return;
  event.preventDefault();
  const plan = createPlan(state.activePack, event.target);
  if (!plan) return;
  const progress = readProgress(state.activePack.teste.id);
  progress.plan = plan;
  saveProgress(state.activePack.teste.id, progress);
  clearTimerInterval();
  state.timer = null;
  state.planEditing = false;
  rerenderTab();
  showToast("Plano de estudo criado");
});

document.addEventListener("keydown", (event) => {
  if (event.target.matches("[data-timer-edit]")) {
    if (event.key === "Enter") { event.preventDefault(); event.target.blur(); }
    if (event.key === "Escape") { event.target.value = formatTime(state.timer.remainingSeconds); event.target.blur(); }
    return;
  }
  if (state.view !== "test" || state.tab !== "flashcards") return;
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (event.target.closest("input, textarea, select, [contenteditable]:not([contenteditable='false'])")) return;
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    navigateCard(event.key === "ArrowLeft" ? -1 : 1);
    return;
  }
  if (!state.cards[state.cardIndex]) return;
  if (event.code === "Space" && event.target.closest("button, a")) return;
  if (event.code === "Space" && !state.revealed) { event.preventDefault(); state.revealed = true; rerenderTab(); }
  if (state.revealed && ["1", "2", "3"].includes(event.key)) rateCard({ "1": "hard", "2": "almost", "3": "known" }[event.key]);
});

document.querySelectorAll('[data-action="home"]').forEach((button) => button.addEventListener("click", () => { state.view = "home"; render(); }));

document.addEventListener("focusin", (event) => {
  if (event.target.matches("[data-timer-edit]")) event.target.select();
});

try {
  const response = await fetch("data/study-packs.json");
  if (!response.ok) throw new Error("Não foi possível carregar os conteúdos.");
  const data = await response.json();
  state.packs = data.packs;
  for (const pack of state.packs) {
    const progress = readProgress(pack.teste.id);
    if (refreshStudyPlan(pack, progress, studyDates(pack))) saveProgress(pack.teste.id, progress);
  }
  render();
} catch (error) {
  main.innerHTML = `<section class="page"><div class="panel"><div class="eyebrow">Erro de conteúdo</div><h1>O atelier não abriu.</h1><p>${escapeHtml(error.message)}</p><p>Confirma se a aplicação foi construída com <code>npm run build</code>.</p></div></section>`;
}
