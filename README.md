# Al Día

Las noticias del día contadas claras y sin tono de partido. Prototipo en pruebas.

## Cómo está hecho

- `index.html`: el diseño y el funcionamiento de la web. Casi nunca cambia.
- `noticias.js`: todo el contenido (las noticias de hoy, los 7 días anteriores y el resumen semanal). **Es el único archivo que cambia en cada edición.**
- `scripts/build-pages.js`: Netlify lo ejecuta solo en cada publicación y crea una página propia para cada noticia (`/noticias/<id>/`) y el `sitemap.xml`.
- `netlify.toml`: le dice a Netlify qué ejecutar y qué publicar.

## Publicar una edición

1. Se actualiza `noticias.js` y se sube a GitHub.
2. Netlify lo detecta, genera las páginas y publica en un minuto.

## Indexación

La web está abierta a Google y a los buscadores con IA (`INDEXAR = true` en `scripts/build-pages.js`). Para ocultarla otra vez, poner `INDEXAR = false` y añadir `<meta name="robots" content="noindex">` en `index.html`.

## Cómo trabajamos

`sobre/index.html`: fuentes, neutralidad, uso de IA, correcciones y privacidad.

## Analítica

GoatCounter (sin cookies): https://aldianoticias.goatcounter.com
