# Steps BJJ

Diario inteligente de Brazilian Jiu-Jitsu. Una guía personal que te ayuda a descubrir tu
estilo de juego natural a través de preguntas y patrones — **no reemplaza a tu entrenador**.

PWA mobile-first. React + Vite + Tailwind, persistencia en `localStorage`, y un asistente
conversacional con Google Gemini 2.0 Flash vía un serverless function de Vercel.

## Stack

- React 18 + Vite 6 (PWA, mobile-first)
- Tailwind CSS 3
- `localStorage` (sin backend de datos)
- Gemini 2.0 Flash a través de `/api/chat` (serverless de Vercel)

## Desarrollo local

```bash
npm install
npm run dev
```

> En `vite dev` no corre el serverless de Vercel, así que el chat usa una **guía local de
> respaldo** scripteada (ver `src/lib/api.js`). Sirve para probar toda la UX sin backend.
> Con la app desplegada en Vercel, el chat usa Gemini de verdad.

## Deploy en Vercel

1. Subí el repo a Vercel (framework: Vite, detectado solo).
2. En **Project Settings → Environment Variables** agregá:
   - `GEMINI_API_KEY` = tu clave de Google AI Studio (`AIza...`)
3. Deploy. El serverless `api/chat.js` lee la key desde el entorno; nunca se expone al cliente.

## Las tres fases

| Fase | Sesiones | Qué hace |
|------|----------|----------|
| Descubrimiento | 1–5 | Preguntas abiertas, sin consejos. Cierra con "Sesión X de 5 registrada." |
| Hipótesis | 6–14 | Primera hipótesis tentativa de estilo. |
| Refinamiento | 15+ | Perfil siempre abierto; confirma o contradice. |

## Vistas

- **Onboarding** — bienvenida, disclaimer obligatorio, nombre/cinturón, "¿Por qué empezaste BJJ?"
- **Dashboard** — contador de sesiones, progreso al próximo hito, hipótesis de estilo, accesos.
- **Registrar clase** — chat post-entrenamiento (4-5 intercambios → insight + focos).
- **Preparar próxima clase** — briefing de lectura con focos y una pregunta para el tatami.
- **Historial** — lista de sesiones con tags; conversación completa al abrir.

## Estructura

```
api/chat.js            serverless (Gemini)
src/
  App.jsx              estado global + ruteo de vistas
  lib/storage.js       persistencia localStorage
  lib/phases.js        fases, hitos, resumen de historial
  lib/api.js           cliente de chat + fallback local
  components/          Header, ProgressBar, RichText
  views/               Onboarding, Dashboard, PostClass, PreClass, History
```

---

**Steps BJJ es una herramienta de apoyo. No reemplaza a tu entrenador ni al entrenamiento presencial.**
