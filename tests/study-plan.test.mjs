import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import YAML from 'yaml';
import { buildStudyPlan, refreshStudyPlan } from '../src/study-plan.js';
const pack = YAML.parse(await readFile(new URL('../content/tests/geografia-demografia-2026-10-19.yaml', import.meta.url), 'utf8'));
const dates = ['2026-10-17', '2026-10-18'];

test('o plano cobre toda a matéria em quatro sessões de 25 minutos', () => {
  const plan = buildStudyPlan(pack, dates, 25);
  assert.deepEqual(plan.days.map(day => day.tasks.reduce((sum, task) => sum + task.minutes, 0)), [50, 50]);
  const themes = new Set(plan.days.flatMap(day => day.tasks.map(task => task.theme)));
  for (const theme of pack.temas) assert.ok(themes.has(theme.id));
  for (const day of plan.days) {
    for (const session of [1, 2]) assert.equal(day.tasks.filter(task => task.session === session).reduce((sum, task) => sum + task.minutes, 0), 25);
  }
  assert.equal(plan.days.at(-1).tasks.at(-1).id, 'revisao-final');
  assert.ok(plan.days[0].tasks.some(task => task.id === 'calculos-crescimento'));
  assert.ok(plan.days[1].tasks.some(task => task.theme === 'taxas-demograficas'));
});

test('atualiza planos antigos preservando disponibilidade e progresso dos cartões', () => {
  const progress = { cards: { 'geo-demografia-01': 'known' }, sessions: 2, timer: { taskId: 'old' }, plan: { availability: [dates[1]], sessionMinutes: 20, days: [{ date: dates[1], tasks: [], rating: 'facil' }] } };
  assert.equal(refreshStudyPlan(pack, progress, dates), true);
  assert.deepEqual(progress.plan.availability, [dates[1]]);
  assert.equal(progress.plan.sessionMinutes, 20);
  assert.equal(progress.plan.days[0].tasks.length, 8);
  assert.equal(progress.cards['geo-demografia-01'], 'known');
  assert.equal(progress.sessions, 2);
  assert.equal(progress.timer, undefined);
  assert.equal(refreshStudyPlan(pack, progress, dates), false);
});

test('reorganizar mantém conclusões apenas quando o conteúdo da tarefa se mantém', () => {
  const previous = buildStudyPlan(pack, dates, 25);
  previous.days[0].tasks[0].done = true;
  previous.days[0].tasks[1].done = true;
  previous.days[0].tasks[1].detail = 'Matéria antiga incompleta';
  const plan = buildStudyPlan(pack, dates, 25, previous);
  assert.equal(plan.days[0].tasks[0].done, true);
  assert.equal(plan.days[0].tasks[1].done, false);
});

test('sem dias disponíveis não cria um plano e um novo plano usa os dois dias', () => {
  assert.equal(buildStudyPlan(pack, [], 25), null);
  const progress = { cards: {}, sessions: 0 };
  assert.equal(refreshStudyPlan(pack, progress, dates), true);
  assert.deepEqual(progress.plan.availability, dates);
});
