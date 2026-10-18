import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const port = Number(process.env.PORT || 4173);
const root = new URL("../dist/", import.meta.url);
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml" };

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
    let relative = normalize(pathname).replace(/^[/\\]+/, "") || "index.html";
    let file = new URL(relative, root);
    if (!(await stat(file)).isFile()) file = new URL("index.html", root);
    response.writeHead(200, { "Content-Type": types[extname(file.pathname)] || "application/octet-stream" });
    response.end(await readFile(file));
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Página não encontrada");
  }
}).listen(port, () => console.log(`Atelier de Estudo disponível em http://localhost:${port}`));
