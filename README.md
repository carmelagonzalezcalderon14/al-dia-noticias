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

## Antes de lanzar

En `scripts/build-pages.js` y en `index.html` hay un `noindex` para que Google no indexe la prueba. Al lanzar, poner `INDEXAR = true` y quitar la etiqueta `robots` de `index.html`.

## Analítica

GoatCounter (sin cookies): https://aldianoticias.goatcounter.com
