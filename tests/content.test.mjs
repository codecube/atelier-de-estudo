import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import YAML from "yaml";

const root = resolve(import.meta.dirname, "..");
const pack = YAML.parse(await readFile(resolve(root, "content/tests/geografia-demografia-2026-10-19.yaml"), "utf8"));

test("o plano nunca excede oito dias", () => {
  assert.ok(pack.planeamento.antecedencia.maximo_dias <= 8);
});

test("cada flashcard aponta para um tema existente", () => {
  const themes = new Set(pack.temas.map((theme) => theme.id));
  for (const card of pack.flashcards) assert.ok(themes.has(card.tema), `${card.id} tem um tema desconhecido`);
});

test("os identificadores dos flashcards são únicos", () => {
  const ids = pack.flashcards.map((card) => card.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("o pacote inclui resumo e esquemas com alternativa textual", () => {
  assert.ok(pack.resumo.secoes.length >= 4);
  assert.ok(pack.resumo.essencial.length >= 4);
  assert.ok(pack.esquemas.length >= 3);
  for (const diagram of pack.esquemas) assert.ok(diagram.alternativa_textual.length > 20);
});

test("a revisão identifica a fonte e cobre as taxas e a natalidade", () => {
  assert.ok(pack.resumo.alertas.some((alert) => alert.includes("resumo enviado pela estudante")));
  for (const theme of ["taxas-demograficas", "natalidade-mundo"]) {
    assert.ok(pack.resumo.secoes.some((section) => section.id === theme));
    assert.ok(pack.esquemas.some((diagram) => diagram.temas.includes(theme)));
    assert.ok(pack.flashcards.some((card) => card.tema === theme));
  }
  const phases = pack.esquemas.find((diagram) => diagram.id === "fases-populacao");
  assert.match(phases.blocos[1].titulo, /1750/);
  assert.match(phases.blocos[2].titulo, /1950/);
  assert.match(phases.blocos[2].titulo, /Expansão demográfica/);
});

test("resumos e esquemas estão associados a temas existentes", () => {
  const themes = new Set(pack.temas.map((theme) => theme.id));
  for (const section of pack.resumo.secoes) assert.ok(themes.has(section.id));
  for (const diagram of pack.esquemas) {
    assert.ok(diagram.temas.length > 0);
    for (const theme of diagram.temas) assert.ok(themes.has(theme));
  }
});
