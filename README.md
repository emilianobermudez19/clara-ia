# Clara IA

Crea una web app mobile-first, minimalista, empática y 100% orientada a la privacidad para una plataforma de educación, orientación y salud sexual enfocada en el contexto de México. El objetivo principal es democratizar el acceso a información confiable y apoyo preventivo de forma anónima, segura y descentralizada (pensando en usuarios sin acceso fácil a centros de salud o grandes ciudades).
La aplicación debe contar con los siguientes componentes y flujos críticos:
1. Pantalla de Bienvenida y Privacidad Absoluta:
- Interfaz limpia y sobria que transmita absoluta confianza y cero juicios morales.
- Acceso directo a "Consulta Anónima" (sin registros obligatorios que expongan datos personales) y una opción opcional de "Crear cuenta / Iniciar sesión".
- Botón de Salida Rápida ("Salir de inmediato"): Un botón flotante y visible en todo momento que cierre la app o redirija instantáneamente a una página neutral (como Google o el clima) por seguridad del usuario.
2. El Agente de IA Conversacional (Asistente Educativo):
- Una interfaz de chat limpia y fluida.
- El agente debe estar configurado por prompt para actuar como un orientador empático y basado en evidencia (centrado en métodos anticonceptivos, desmitificación, consentimiento, prevención de ETS y guías educativas).
- Protocolo de Emergencia / Botón Rojo automático: Si el usuario introduce palabras clave de crisis, autolesión, violencia o abuso, el chat debe cortar el tono casual y desplegar de inmediato tarjetas con números de ayuda oficiales y gratuitos en México (Línea de la Vida al 800 911 2000, CENSIDA y 911).
3. Módulos Educativos y Recursos (Fase Educativa):
- Sección de tarjetas interactivas y artículos cortos con guías paso a paso, mitos y realidades, y sección de divulgación científica accesible (papers y anotaciones de salud pública).
4. Métrica de Intención para Fase 2 (Telemedicina):
- Incluir al final de las interacciones educativas o de chat un llamado a la acción sutil tipo: "¿Quieres hablar con un especialista o buscar clínicas cercanas?". Esto servirá para medir la tasa de conversión e intención de derivación sin saturar el MVP con pasarelas de pago ni integraciones médicas complejas por ahora. ; importante el tema de que sea como inteligencia artificial (luego veré mas con master prompt y demás pero aja)

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1f6d5ab5-6c45-44ad-8233-9bb5d07cc1a1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
