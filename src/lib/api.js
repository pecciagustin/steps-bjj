// Cliente del chat. Llama al serverless /api/chat (Gemini en Vercel).
// Si el endpoint no existe (p.ej. `vite dev` sin backend), cae a un guía local
// scripteado para que la app siga siendo usable en desarrollo/preview.

const SESSION_DATA_RE = /<session_data>([\s\S]*?)<\/session_data>/i;

const SESSION_DATA_DEFAULTS = {
  techniques: [],
  struggles: [],
  wins: [],
  focusNext: [],
  matQuestion: null,
  styleSignal: null,
  styleHypothesis: null,
  styleConfidence: 0,
  mood: 'normal',
};

const VALID_MOODS = ['great', 'normal', 'tired', 'bad'];

function sanitizeSessionData(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const arr = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []);
  const mood = VALID_MOODS.includes(raw.mood) ? raw.mood : 'normal';
  const confidence = Number.isFinite(raw.styleConfidence)
    ? Math.max(0, Math.min(100, raw.styleConfidence))
    : 0;
  return {
    ...SESSION_DATA_DEFAULTS,
    techniques: arr(raw.techniques),
    struggles: arr(raw.struggles),
    wins: arr(raw.wins),
    focusNext: arr(raw.focusNext),
    matQuestion: typeof raw.matQuestion === 'string' && raw.matQuestion.trim() ? raw.matQuestion.trim() : null,
    styleSignal: typeof raw.styleSignal === 'string' ? raw.styleSignal : null,
    styleHypothesis: typeof raw.styleHypothesis === 'string' ? raw.styleHypothesis : null,
    styleConfidence: confidence,
    mood,
  };
}

// Separa el texto visible del bloque <session_data> oculto y valida los campos.
export function splitSessionData(text) {
  const match = text.match(SESSION_DATA_RE);
  let extracted = null;
  if (match) {
    try {
      const parsed = JSON.parse(match[1].trim());
      extracted = sanitizeSessionData(parsed);
    } catch {
      // JSON malformado: el modelo no siguió el formato. No es un cierre de sesión.
      extracted = null;
    }
  }
  const visible = text.replace(SESSION_DATA_RE, '').trim();
  return { visible, extracted };
}

export async function sendChat({ messages, profile, sessionsSummary, currentPhase, isClosing = false }) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, profile, sessionsSummary, currentPhase, isClosing }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.text) throw new Error('Respuesta vacía');
    return data.text;
  } catch (err) {
    // Fallback local — no hay backend disponible.
    console.warn('Usando guía local (sin backend):', err.message);
    return localGuide({ messages, profile, currentPhase });
  }
}

// Genera una pregunta de auto-observación para el fallback de dev.
function buildMatQuestion(userText, prevSessions) {
  const low = userText.toLowerCase();
  if (low.includes('espalda')) return 'La próxima, fijate si buscás el control de espalda de forma instintiva o solo cuando te la dan — ¿lo iniciás vos?';
  if (low.includes('trab') || low.includes('guardia')) return 'Observá cuántas veces te encontrás en la misma posición incómoda — ¿hay un patrón que se repite?';
  if (low.includes('cómodo') || low.includes('control')) return 'La próxima clase prestá atención a en qué momento del roll te sentís más vos mismo — ¿qué posición es?';
  if (prevSessions >= 1) return 'Comparando con la última clase, ¿hay alguna situación que se repitió? ¿La manejaste diferente?';
  return 'La próxima vez fijate si hay alguna posición a la que volvés siempre — ¿la buscás vos o llegás ahí sin querer?';
}

// Devuelve los tags cuyo patrón aparece en el texto (solo para el fallback de dev).
function pickMatches(text, pairs) {
  const low = text.toLowerCase();
  const out = [];
  for (const [needle, tag] of pairs) {
    if (low.includes(needle) && !out.includes(tag)) out.push(tag);
  }
  return out;
}

// --- Guía local de respaldo (solo dev/preview) ---
function localGuide({ messages, profile, currentPhase }) {
  const turn = messages.filter((m) => m.role === 'user').length;
  const n = (profile.totalSessions || 0) + 1;
  const name = profile.name || 'crack';

  // Cierre: a partir del 3er intercambio del usuario.
  if (turn >= 3) {
    const prevSessions = profile.totalSessions || 0;
    const earlyTip = prevSessions >= 1
      ? `\n\nEstos consejos solo van a mejorar a medida que me contés más, pero por lo que me dijiste hasta acá: parece que te sentís más cómodo cuando lográs imponer tu posición desde arriba — la próxima clase fijate si buscás eso de forma instintiva o si llegás ahí por casualidad.`
      : '';
    const closing =
      currentPhase === 'discovery'
        ? `Buenísimo, ${name}. Me llevo una imagen más clara de cómo te movés hoy.\n\n**Insight:** ${prevSessions >= 1 ? 'ya empiezo a ver algunos patrones en cómo describís tu juego — eso es exactamente lo que necesito para ayudarte mejor.' : 'estás generando datos sobre tu juego cada vez que rolás — eso es lo que importa ahora.'}${earlyTip}\n\n**Focos para la próxima:**\n1. Prestá atención a en qué posición te sentís más cómodo sin pensarlo.\n2. Anotá una situación donde te trabaste.\n\nValidá cualquier corrección técnica con tu profe. Sesión ${n} de 5 registrada. Seguí contándome.`
        : `Gracias por el detalle, ${name}.\n\n**Insight:** empiezo a ver algo en vos — un patrón que se repite en cómo encarás los rolls.\n\n**Focos para la próxima:**\n1. Probá llevar conscientemente el roll a tu zona cómoda.\n2. Registrá si lo lográs o no.\n\nNada de esto reemplaza a tu profe. ¡A entrenar!`;
    // En dev no hay extracción real del modelo: derivamos tags simples de lo que escribió el usuario.
    const userText = messages
      .filter((m) => m.role === 'user')
      .map((m) => m.content)
      .join(' ');
    const data = {
      techniques: pickMatches(userText, [
        ['pasaje', 'pasaje de guardia'],
        ['guardia', 'guardia'],
        ['estrangul', 'estrangulaciones'],
        ['espalda', 'control de espalda'],
        ['montada', 'montada'],
        ['barrida', 'barridas'],
        ['raspaje', 'raspajes'],
      ]),
      struggles: pickMatches(userText, [
        ['trab', 'recomponer guardia'],
        ['incómod', 'zona incómoda'],
        ['cansad', 'gestión del cansancio'],
      ]),
      wins: pickMatches(userText, [
        ['cómodo', 'jugó cómodo'],
        ['control', 'mantuvo control'],
        ['logré', 'concretó posición'],
      ]),
      focusNext: ['recomponer la guardia', 'reconocer tu zona cómoda'],
      matQuestion: buildMatQuestion(userText, profile.totalSessions || 0),
      styleSignal: null,
      styleHypothesis: null,
      styleConfidence: 0,
      mood: 'normal',
    };
    return Promise.resolve(`${closing}\n<session_data>\n${JSON.stringify(data)}\n</session_data>`);
  }

  const prompts = [
    `Contame del entrenamiento de hoy, ${name}. ¿Qué fue lo primero que se te viene a la cabeza?`,
    `Buenísimo. ¿En qué momento del roll te sentiste más en control?`,
    `Entiendo. ¿Y hubo alguna posición donde te quedaste trabado o incómodo?`,
  ];
  return Promise.resolve(prompts[Math.min(turn, prompts.length - 1)]);
}
