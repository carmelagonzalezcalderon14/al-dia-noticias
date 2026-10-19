/*
  Al Día · genera una página propia para cada noticia (/noticias/<id>/) y el sitemap.xml.
  Netlify lo ejecuta solo en cada publicación (ver netlify.toml). No necesita instalar nada.
  Lee el contenido de noticias.js, que es el único archivo que cambia en cada edición.
*/
const fs = require("fs");
const path = require("path");
const vm = require("vm");

// Mientras sea una prueba, no queremos que Google lo indexe. Cambiar a true al lanzar.
const INDEXAR = true;

const root = path.join(__dirname, "..");
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "noticias.js"), "utf8"), sandbox);
const DATA = sandbox.window.AL_DIA;
const SITE = (process.env.URL || "").replace(/\/$/, "");

const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const topic = (it) => it.tag.split(" · ")[0];

const CSS = `
:root{--bg:#f4f5f8;--surface:#fff;--ink:#0d1321;--muted:#5b6475;--line:#e1e5ec;--accent:#2b3dff;--pop:#ffd12e;--soft:#eef1fb;--tc:#2b3dff;
--f-display:"Source Serif 4",Georgia,serif;--f-body:"Geist","Segoe UI",system-ui,sans-serif;--f-mono:"Geist Mono",ui-monospace,monospace;color-scheme:light}
@media (prefers-color-scheme:dark){:root{--bg:#0b0f17;--surface:#121826;--ink:#e9edf5;--muted:#98a2b5;--line:#232b3b;--accent:#8b97ff;--soft:#1a2240;color-scheme:dark}}
[data-topic="España"]{--tc:#ff5a36}[data-topic="Mundo"]{--tc:#7b5cff}[data-topic="Deporte"]{--tc:#00a862}[data-topic="Música"]{--tc:#ff3d9a}[data-topic="Moda"]{--tc:#ffc21a}[data-topic="Cultura"]{--tc:#00a0f0}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--f-body);font-size:17px;line-height:1.7;
padding:env(safe-area-inset-top,0px) max(16px,env(safe-area-inset-right,0px)) 64px max(16px,env(safe-area-inset-left,0px))}
main{max-width:680px;margin:0 auto;display:flex;flex-direction:column;gap:16px;padding-top:18px}
a{color:var(--accent)}header{display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap;padding:14px 0 10px;border-bottom:1px solid var(--line)}
.brand{font-family:var(--f-display);font-weight:700;font-size:28px;color:var(--ink);text-decoration:none}.brand span{color:#fff;background:var(--accent);padding:0 4px 2px;border-radius:6px;display:inline-block;transform:rotate(-4deg)}
.meta{font-size:13px;color:var(--muted);display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.tag{background:var(--soft);color:var(--ink);padding:3px 10px 3px 8px;border-radius:999px;font-weight:600;font-size:12px;display:inline-flex;gap:6px;align-items:center}
.tag::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--tc)}
h1{font-family:var(--f-display);font-size:34px;line-height:1.15;margin:0;text-wrap:balance}
.desc{color:var(--muted);font-size:18.5px;margin:0}.body p{margin:0 0 14px}.body p:first-child{font-weight:500;font-size:18.5px}
.idea{background:var(--pop);color:#1a1300;border-radius:16px;padding:18px 20px}.idea h2{margin:0 0 8px;font-family:var(--f-display);font-size:19px}
.idea p{margin:0 0 8px;padding-left:14px;border-left:3px solid rgba(26,19,0,.25)}
section{border-top:1px solid var(--line);padding-top:14px}section h2{margin:0 0 8px;font-size:13px;letter-spacing:.06em;text-transform:uppercase}
section h2::before{content:"";display:inline-block;width:10px;height:10px;border-radius:50%;background:var(--tc);margin-right:8px}
.tl{list-style:none;margin:0;padding:0}.tl li{display:grid;grid-template-columns:82px 1fr;gap:10px;padding:6px 0;border-bottom:1px solid var(--line)}
.tl li:last-child{border-bottom:0}.tl b{font-family:var(--f-mono);font-size:12px;font-weight:500;color:var(--accent);text-transform:uppercase}
.note{color:var(--muted);font-size:15px}.links{font-size:13px;color:var(--muted)}.links a{color:var(--muted);margin-right:12px}
h2.q{font-family:var(--f-display);font-size:22px;line-height:1.25;margin:6px 0 0}
.faq h3{font-size:16px;margin:12px 0 4px}.faq p{margin:0}
.cta{display:inline-block;background:var(--accent);color:#fff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:999px;align-self:flex-start}
@media (max-width:420px){h1{font-size:27px}.tl li{grid-template-columns:1fr;gap:0}}`;

function page(it, day) {
  const url = `/noticias/${it.id}/`;
  const parts = [];
  const body = it.body && it.body.length ? it.body : [it.what];
  if (it.q) parts.push(`<h2 class="q">${esc(it.q)}</h2>`);
  parts.push(`<div class="body">${body.map((p) => `<p>${esc(p)}</p>`).join("")}</div>`);
  if (it.idea && it.idea.length) parts.push(`<aside class="idea"><h2>Para que te hagas una idea</h2>${it.idea.map((p) => `<p>${esc(p)}</p>`).join("")}</aside>`);
  if (it.how && it.how.length) {
    const inner = Array.isArray(it.how[0])
      ? `<ul class="tl">${it.how.map((r) => `<li><b>${esc(r[0])}</b><span>${esc(r[1])}</span></li>`).join("")}</ul>`
      : it.how.map((p) => `<p>${esc(p)}</p>`).join("");
    parts.push(`<section><h2>¿Cómo se ha llegado hasta aquí?</h2>${inner}</section>`);
  }
  if (it.next && ((it.next.rows && it.next.rows.length) || it.next.note)) {
    let inner = "";
    if (it.next.rows && it.next.rows.length) inner += `<ul class="tl">${it.next.rows.map((r) => `<li><b>${esc(r[0])}</b><span>${esc(r[1])}</span></li>`).join("")}</ul>`;
    if (it.next.note) inner += `<p class="note">${esc(it.next.note)}</p>`;
    parts.push(`<section><h2>¿Qué va a pasar ahora?</h2>${inner}</section>`);
  }
  if (it.terms && it.terms.length) parts.push(`<section><h2>Claves para entenderlo</h2>${it.terms.map((t) => `<p><b>${esc(t[0])}:</b> ${esc(t[1])}</p>`).join("")}</section>`);
  if (it.ctx && it.ctx.length) parts.push(`<p class="links"><b>Antes:</b> ${it.ctx.map((c) => `<a href="${esc(c[1])}" rel="noopener">${esc(c[0])}</a>`).join("")}</p>`);
  parts.push(`<p class="links"><b>Fuentes:</b> ${it.src.map((c) => `<a href="${esc(c[1])}" rel="noopener">${esc(c[0])}</a>`).join("")}</p>`);

  // Preguntas y respuestas: lo que más fácil extraen ChatGPT, Perplexity y los resúmenes con IA de Google.
  const faq = [];
  if (it.q) faq.push([it.q, body.slice(0, 2).join(" ")]);
  if (it.q2) faq.push([it.q2, it.desc]);
  if (it.next && ((it.next.rows && it.next.rows.length) || it.next.note)) {
    const ans = (it.next.rows || []).map((r) => `${r[0]}: ${r[1]}.`).join(" ") + (it.next.note ? " " + it.next.note : "");
    faq.push(["¿Qué va a pasar ahora?", ans.trim()]);
  }
  if (faq.length > 1) parts.push(`<section class="faq"><h2>Preguntas rápidas</h2>${faq.slice(1).map((f) => `<h3>${esc(f[0])}</h3><p>${esc(f[1])}</p>`).join("")}</section>`);

  const ld = [{ "@context": "https://schema.org", "@type": "NewsArticle", headline: it.title, description: it.desc, datePublished: day.iso, dateModified: (DATA.edicion && DATA.edicion.iso) || day.iso, inLanguage: "es-ES", articleSection: it.tag, publisher: { "@type": "Organization", name: "Al Día", url: SITE || undefined }, publishingPrinciples: SITE ? SITE + "/sobre/" : undefined, author: { "@type": "Organization", name: "Redacción de Al Día" }, isBasedOn: it.src.map((s) => s[1]) }];
  if (SITE) ld[0].mainEntityOfPage = SITE + url;
  if (faq.length) ld.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f[0], acceptedAnswer: { "@type": "Answer", text: f[1] } })) });

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(it.title)} · Al Día</title>
<meta name="description" content="${esc(it.desc)}">
${INDEXAR ? "" : '<meta name="robots" content="noindex">'}
${SITE ? `<link rel="canonical" href="${SITE + url}">` : ""}
<meta property="og:type" content="article">
<meta property="og:locale" content="es_ES">
<meta property="og:site_name" content="Al Día">
<meta property="og:title" content="${esc(it.title)}">
<meta property="og:description" content="${esc(it.desc)}">
${SITE ? `<meta property="og:url" content="${SITE + url}">` : ""}
<meta name="twitter:card" content="summary">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,600;8..60,700&family=Geist:wght@400;500;600&family=Geist+Mono:wght@500&display=swap">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>
<style>${CSS}</style>
</head>
<body data-topic="${esc(topic(it))}">
<header><a class="brand" href="/">Al D<span>í</span>a</a><a href="/">Ver todas las noticias de hoy →</a></header>
<main>
<div class="meta"><span class="tag">${esc(it.tag)}</span><span>${esc(day.title)}</span></div>
<h1>${esc(it.title)}</h1>
<p class="desc">${esc(it.desc)}</p>
${parts.join("\n")}
<a class="cta" href="/#n-${esc(it.id)}">Abrir en Al Día y votar</a>
<p class="links">Redacción de Al Día, con ayuda de IA y a partir de las fuentes enlazadas. <a href="/sobre/">Cómo hacemos Al Día</a> · ¿Ves un error? <a href="/sobre/#correcciones">Avísanos</a></p>
</main>
</body>
</html>
`;
}

const outDir = path.join(root, "noticias");
fs.rmSync(outDir, { recursive: true, force: true });
const urls = ["/", "/sobre/"];
let n = 0;
DATA.days.forEach((day) => day.items.forEach((it) => {
  const dir = path.join(outDir, it.id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), page(it, day));
  urls.push(`/noticias/${it.id}/`);
  n++;
}));

if (SITE) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE + u}</loc></url>`).join("\n")}\n</urlset>\n`;
  fs.writeFileSync(path.join(root, "sitemap.xml"), xml);
}
// robots.txt: dejamos entrar a buscadores y a los robots de las IAs (ChatGPT, Perplexity, Claude, Google).
const bots = ["Googlebot", "Google-Extended", "Bingbot", "OAI-SearchBot", "ChatGPT-User", "GPTBot", "PerplexityBot", "Claude-SearchBot", "Claude-User", "ClaudeBot", "Applebot"];
fs.writeFileSync(path.join(root, "robots.txt"),
  bots.map((b) => `User-agent: ${b}\nAllow: /\n`).join("\n") + `\nUser-agent: *\nAllow: /\n` + (SITE ? `\nSitemap: ${SITE}/sitemap.xml\n` : ""));

// llms.txt: índice en texto plano pensado para asistentes de IA.
const llms = [
  "# Al Día",
  "",
  "> Las noticias del día contadas claras y sin tono de partido: qué ha pasado, por qué importa y qué viene después. En español, para gente joven. Cada noticia cita sus fuentes. Cómo trabajamos: " + SITE + "/sobre/",
  "",
  ...DATA.days.filter((d) => d.items.length).map((d) => [`## ${d.title}`, "", ...d.items.map((it) => `- [${it.q || it.title}](${SITE}/noticias/${it.id}/): ${it.desc}`), ""].join("\n")),
].join("\n");
fs.writeFileSync(path.join(root, "llms.txt"), llms + "\n");

console.log(`Al Día: ${n} páginas de noticia generadas${SITE ? " + sitemap.xml" : ""} + robots.txt + llms.txt.`);

// Página propia del apartado de elecciones (para buscadores y asistentes de IA).
if (DATA.elecciones) {
  const E = DATA.elecciones;
  const dir = path.join(root, "elecciones");
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const q = "¿Qué está pasando hoy en la campaña del 29N?";
  const faq = [{ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: E.hoy.filter((x) => !/^Sin novedades/.test(x.t)).map((x) => `${x.p}: ${x.t}`).join(" ") } },
    { "@type": "Question", name: "¿Cuándo son las elecciones generales y cuándo empieza la campaña?", acceptedAnswer: { "@type": "Answer", text: E.calendario.map((r) => `${r[0]}: ${r[1]}.`).join(" ") } }];
  const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Elecciones 29-N: así va la campaña · Al Día</title>
<meta name="description" content="${esc(E.intro)}">
${INDEXAR ? "" : '<meta name="robots" content="noindex">'}
${SITE ? `<link rel="canonical" href="${SITE}/elecciones/">` : ""}
<meta property="og:title" content="Elecciones 29-N: así va la campaña · Al Día"><meta property="og:description" content="${esc(E.intro)}">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,600;8..60,700&family=Geist:wght@400;500;600&family=Geist+Mono:wght@500&display=swap">
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq }).replace(/</g, "\\u003c")}</script>
<style>${CSS}</style></head>
<body data-topic="España"><header><a class="brand" href="/">Al D<span>í</span>a</a><a href="/">Ver todas las noticias →</a></header>
<main>
<h1>${esc(E.titulo)}</h1>
<p class="desc">${esc(E.intro)}</p>
<h2 class="q">${q}</h2>
<p class="note">${esc(E.orden)}</p>
${E.hoy.map((x) => `<p><b>${esc(x.p)}:</b> ${esc(x.t)}</p>`).join("\n")}
<section><h2>Quién ha dicho qué de quién</h2>${E.dardos.map((d) => `<p><b>${esc(d.de)}</b> sobre ${esc(d.a)}: ${esc(d.q)}</p>`).join("")}</section>
<section><h2>¿Cuándo es cada cosa?</h2><ul class="tl">${E.calendario.map((r) => `<li><b>${esc(r[0])}</b><span>${esc(r[1])}</span></li>`).join("")}</ul></section>
<p class="links"><b>Fuentes:</b> ${E.src.map((c) => `<a href="${esc(c[1])}" rel="noopener">${esc(c[0])}</a>`).join("")}</p>
<a class="cta" href="/">Abrir Al Día</a>
</main></body></html>
`;
  fs.writeFileSync(path.join(dir, "index.html"), html);
  if (SITE && fs.existsSync(path.join(root, "sitemap.xml"))) {
    fs.writeFileSync(path.join(root, "sitemap.xml"), fs.readFileSync(path.join(root, "sitemap.xml"), "utf8").replace("</urlset>", `  <url><loc>${SITE}/elecciones/</loc></url>\n</urlset>`));
  }
  fs.appendFileSync(path.join(root, "llms.txt"), `\n## Elecciones 29-N\n\n- [${q}](${SITE}/elecciones/): ${E.intro}\n`);
  console.log("Al Día: página de elecciones generada.");
}
