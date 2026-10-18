// Keep the study sequence intact: learn the concepts before the calculations,
// then finish with recall. Session boundaries never split a task.
export function buildStudyPlan(pack, availability, sessionMinutes, previous = null, themeConfidence = {}) {
  const dates = [...new Set(availability)].sort();
  if (!dates.length || !pack.planeamento.roteiro) return null;
  const roteiro = pack.planeamento.roteiro;
  const sessions = [];
  for (const source of roteiro.tarefas) {
    let session = sessions.at(-1);
    if (!session || session.minutes + source.minutos > sessionMinutes) {
      session = { minutes: 0, tasks: [] };
      sessions.push(session);
    }
    const old = previous?.days.flatMap((day) => day.tasks).find((task) => task.id === source.id);
    session.tasks.push({
      id: source.id, title: source.titulo, detail: source.descricao,
      minutes: source.minutos, theme: source.tema,
      done: Boolean(old?.done && old.detail === source.descricao),
    });
    session.minutes += source.minutos;
  }
  const days = dates.map((date) => ({ date, tasks: [], rating: null }));
  sessions.forEach((session, index) => {
    const dayIndex = Math.min(dates.length - 1, Math.floor(index * dates.length / sessions.length));
    const sessionNumber = new Set(days[dayIndex].tasks.map((task) => task.session)).size + 1;
    days[dayIndex].tasks.push(...session.tasks.map((task) => ({ ...task, session: sessionNumber })));
  });
  for (const day of days) {
    const old = previous?.days.find((item) => item.date === day.date);
    if (old && JSON.stringify(old.tasks) === JSON.stringify(day.tasks)) day.rating = old.rating;
  }
  return {
    createdAt: previous?.createdAt || new Date().toISOString(),
    contentVersion: roteiro.versao, availability: dates, sessionMinutes,
    themeConfidence: Object.fromEntries(pack.temas.map((theme) => [theme.id, themeConfidence[theme.id] || 'praticar'])),
    days,
  };
}

export function refreshStudyPlan(pack, progress, defaultDates) {
  if (!pack.planeamento.roteiro || progress.plan?.contentVersion === pack.planeamento.roteiro.versao) return false;
  const old = progress.plan;
  const dates = old?.availability?.length ? old.availability : defaultDates;
  const plan = buildStudyPlan(pack, dates, old?.sessionMinutes || pack.planeamento.duracao_sessao_sugerida_minutos, old, old?.themeConfidence);
  if (!plan) return false;
  progress.plan = plan;
  // An old timer may refer to a task whose content or duration changed.
  delete progress.timer;
  return true;
}
