# Criterios de contenido de Chía

El contenido educativo vive en `src/content/guides.ts`, separado de la interfaz.

## Antes de publicar una guía
1. **Fuentes:** al menos una fuente de salud pública (OMS, OPS, Secretaría de Salud, CDC) en `sources`.
2. **Revisión clínica:** un profesional de salud revisa el texto y se registra en `review` (nombre/cédula o institución y fecha). Sin `review`, la guía muestra "Revisión clínica pendiente".
3. **Lenguaje:** frases cortas, sin juicios, nombrando las cosas por su nombre. Probado con personas del público objetivo.

## Multimedia (`media`)
- Solo licencias verificadas: CC0, CC BY 4.0, CC BY-SA 4.0, dominio público o material propio. Se registran `credit`, `license` y `sourceUrl`; la app los muestra junto a la imagen.
- Archivos en `public/media/<id-de-guía>/`. Imágenes en WebP de máximo 1200 px de ancho (pocos datos móviles).
- Videos: MP4 H.264 corto (menos de 90 s) con imagen de portada (`poster`). Se cargan solo cuando la persona toca "Ver video".
- Nada de fotos de personas generadas con IA ni anatomía generada con IA.
- Fuentes candidatas: bancos de la OMS/OPS (revisar licencia de cada pieza), Wikimedia Commons, Pexels/Unsplash (solo para fotos de contexto, nunca para procedimientos).

Ejemplo:
```ts
media: [{
  kind: "image",
  src: "/media/condon-externo/empaque.webp",
  alt: { es: "Empaque de condón revisado contra la luz", en: "Condom wrapper checked against the light" },
  credit: "Nombre del autor", license: "CC BY 4.0", sourceUrl: "https://…",
}],
```
