import { readFile, readdir, rm, mkdir, cp, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import YAML from "yaml";
import Ajv from "ajv/dist/2020.js";

const root = resolve(import.meta.dirname, "..");
const sourceDir = join(root, "src");
const contentDir = join(root, "content", "tests");
const schemaPath = join(root, "content", "schema", "study-pack.schema.json");
const distDir = join(root, "dist");

export async function build() {
  const schema = JSON.parse(await readFile(schemaPath, "utf8"));
  const ajv = new Ajv({ allErrors: true, strict: false, formats: { date: /^\d{4}-\d{2}-\d{2}$/ } });
  const validate = ajv.compile(schema);
  const files = (await readdir(contentDir)).filter((file) => file.endsWith(".yaml") || file.endsWith(".yml")).sort();
  if (!files.length) throw new Error("Não existem pacotes de estudo em content/tests.");

  const packs = [];
  const ids = new Set();
  for (const file of files) {
    const pack = YAML.parse(await readFile(join(contentDir, file), "utf8"));
    if (!validate(pack)) {
      const details = validate.errors.map((error) => `${error.instancePath || "/"} ${error.message}`).join("\n");
      throw new Error(`Pacote inválido: ${file}\n${details}`);
    }
    if (pack.planeamento.antecedencia.minimo_dias > pack.planeamento.antecedencia.maximo_dias) {
      throw new Error(`Pacote inválido: ${file}\nO mínimo de antecedência não pode exceder o máximo.`);
    }
    if (ids.has(pack.teste.id)) throw new Error(`ID de teste repetido: ${pack.teste.id}`);
    ids.add(pack.teste.id);
    const themeIds = new Set(pack.temas.map((theme) => theme.id));
    const taskIds = new Set();
    for (const task of pack.planeamento.roteiro?.tarefas || []) {
      if (taskIds.has(task.id)) throw new Error(`Tarefa repetida em ${file}: ${task.id}`);
      taskIds.add(task.id);
      if (task.tema !== null && !themeIds.has(task.tema)) throw new Error(`Tema desconhecido na tarefa ${task.id} em ${file}: ${task.tema}`);
    }
    for (const section of pack.resumo.secoes) {
      if (!themeIds.has(section.id)) throw new Error(`Secção do resumo sem tema correspondente em ${file}: ${section.id}`);
    }
    for (const diagram of pack.esquemas) {
      for (const theme of diagram.temas) {
        if (!themeIds.has(theme)) throw new Error(`Tema desconhecido no esquema ${diagram.id} em ${file}: ${theme}`);
      }
    }
    const cardIds = new Set();
    for (const card of pack.flashcards) {
      if (!themeIds.has(card.tema)) throw new Error(`Tema desconhecido em ${file}: ${card.tema}`);
      if (cardIds.has(card.id)) throw new Error(`ID de flashcard repetido em ${file}: ${card.id}`);
      cardIds.add(card.id);
    }
    packs.push(pack);
  }

  await rm(distDir, { recursive: true, force: true });
  await mkdir(join(distDir, "data"), { recursive: true });
  await cp(sourceDir, distDir, { recursive: true });
  await writeFile(join(distDir, "data", "study-packs.json"), JSON.stringify({ generatedAt: new Date().toISOString(), packs }, null, 2));
  return packs;
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const packs = await build();
  console.log(`Construção concluída: ${packs.length} pacote(s), ${packs.reduce((sum, pack) => sum + pack.flashcards.length, 0)} flashcard(s).`);
}
