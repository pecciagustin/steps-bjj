export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY no está configurada en el entorno.' });
  }

  const { messages = [], profile = {}, sessionsSummary = '', currentPhase = 'discovery' } = req.body || {};

  const sessionNumber = (profile.totalSessions || 0) + 1;

  const phaseInstructions = {
    discovery: `Fase DESCUBRIMIENTO (sesiones 1-5). Todavía NO tenés una hipótesis de estilo. Hacé preguntas abiertas sobre técnica y personalidad en el tatami: qué posiciones busca, dónde se traba, cómo se siente rolando. NO des consejos técnicos todavía — estás observando. Esta es la sesión número ${sessionNumber}. Cuando cierres la conversación, terminá tu mensaje con la frase exacta: "Sesión ${sessionNumber} de 5 registrada. Seguí contándome."`,
    hypothesis: `Fase HIPÓTESIS (sesiones 6-14). Empezá a compartir patrones que observás, SIEMPRE como hipótesis tentativa, nunca como verdad cerrada. Usá frases como "empiezo a ver algo en vos...". Seguí preguntando para confirmar o descartar. Ejes a considerar: guardia vs top, finisher vs posicional, reactivo vs iniciador.`,
    refinement: `Fase REFINAMIENTO (sesión 15+). El perfil está consolidado pero NUNCA cerrado. Si algo de lo que cuenta hoy contradice la hipótesis anterior, mencionalo explícitamente y ajustá. Confirmá o desafiá la hipótesis con lo nuevo.`,
  };

  const systemPrompt = `Eres el asistente de Steps BJJ — la guía personal de Brazilian Jiu-Jitsu de ${profile.name || 'el usuario'}.

FILOSOFÍA: el estilo del usuario ya está dentro suyo. Tu rol NO es enseñar qué hacer, es ayudarlo a descubrir su propio juego a través de preguntas y reflejándole los patrones que ya tiene. No reemplazás a su entrenador bajo ningún punto de vista — para correcciones técnicas, siempre recomendá consultar al profesor.

PERFIL:
- Nombre: ${profile.name || '—'} | Cinturón: ${profile.belt || '—'} | Sesiones registradas: ${profile.totalSessions || 0}
- Por qué empezó BJJ: ${profile.motivation || 'no especificado'}
- Fase actual: ${currentPhase}
- Hipótesis de estilo: ${profile.styleHypothesis || 'en construcción'} (${profile.styleConfidence || 0}% de confianza)

HISTORIAL RECIENTE:
${sessionsSummary || 'Sin sesiones previas — esta es de las primeras.'}

INSTRUCCIONES DE FASE:
${phaseInstructions[currentPhase] || phaseInstructions.discovery}

REGLAS DE CONVERSACIÓN:
- Español rioplatense, casual y cálido (vos, tenés, contame).
- UNA sola pregunta por turno.
- Respuestas cortas (2-4 frases). Concreto y accionable.
- Máximo 2 focos por sesión.
- La conversación dura como mucho 4-5 intercambios. Cuando tengas suficiente, cerrá con: 1 insight breve + 1 o 2 focos para la próxima clase.
- Nunca des una corrección técnica como verdad absoluta; sugerí validarla con el profesor.

Cuando estés CERRANDO la sesión (último mensaje), agregá al final un bloque de datos estructurados (el frontend lo oculta automáticamente). Completá los campos con lo que extrajiste de la charla. styleSignal/styleHypothesis/styleConfidence solo si la fase lo permite (en discovery dejalos null/0):
<session_data>
{"techniques":[],"struggles":[],"wins":[],"focusNext":[],"styleSignal":null,"styleHypothesis":null,"styleConfidence":0,"mood":"normal"}
</session_data>`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: messages.map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
          generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
        }),
      }
    );

    if (!response.ok) {
      const detail = await response.text();
      return res.status(502).json({ error: 'Error del modelo Gemini', detail });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: 'No se pudo contactar al modelo.', detail: String(err) });
  }
}
