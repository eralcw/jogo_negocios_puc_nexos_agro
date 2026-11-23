/* Gera jogo.html (arquivo único) a partir de index.html + style.css + sim.js + app.js.
 * Usa split/join (literal) em vez de String.replace para NÃO interpretar "$$".
 * Uso: node build.js
 */
const fs = require("fs");

const html0 = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("style.css", "utf8");
const sim = fs.readFileSync("sim.js", "utf8");
const app = fs.readFileSync("app.js", "utf8");

let html = html0;
html = html.split('<link rel="stylesheet" href="style.css">').join("<style>\n" + css + "\n</style>");
html = html.split('<script src="sim.js"></script>').join("<script>\n" + sim + "\n</script>");
html = html.split('<script src="app.js"></script>').join("<script>\n" + app + "\n</script>");

fs.writeFileSync("jogo.html", html);

if (html.indexOf("function $$(") === -1) {
  console.error("ERRO: a função $$ foi corrompida na geração.");
  process.exit(1);
}
console.log("jogo.html gerado:", Math.round(html.length / 1024) + " KB");
