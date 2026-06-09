// Lógica de fases y derivados del perfil.

export function phaseForSessionCount(count) {
  if (count < 5) return 'discovery'; // sesiones 1-5 (la próxima a registrar)
  if (count < 14) return 'hypothesis'; // sesiones 6-14
  return 'refinement'; // 15+
}

// Próximo hito y progreso hacia él, para la barra del dashboard.
export function milestone(count) {
  if (count < 5) {
    return {
      label: 'Primera hipótesis de estilo',
      target: 5,
      current: count,
      progress: count / 5,
      hint: `${5 - count} ${5 - count === 1 ? 'sesión' : 'sesiones'} para tu primera hipótesis`,
    };
  }
  if (count < 15) {
    return {
      label: 'Refinamiento constante',
      target: 15,
      current: count,
      progress: (count - 5) / 10,
      hint: `${15 - count} ${15 - count === 1 ? 'sesión' : 'sesiones'} para entrar en refinamiento`,
    };
  }
  // Hitos cada 10 sesiones en refinamiento.
  const next = Math.ceil((count + 1) / 10) * 10;
  return {
    label: `${next} sesiones`,
    target: next,
    current: count,
    progress: (count % 10) / 10,
    hint: `${next - count} para las ${next} sesiones`,
  };
}

export const PHASE_META = {
  discovery: { name: 'Descubrimiento', tag: 'Fase 1' },
  hypothesis: { name: 'Primera hipótesis', tag: 'Fase 2' },
  refinement: { name: 'Refinamiento', tag: 'Fase 3' },
};

export const BELTS = {
  white: { label: 'Blanco', color: '#e5e5e5' },
  blue: { label: 'Azul', color: '#3b82f6' },
  purple: { label: 'Violeta', color: '#8b5cf6' },
};

// Resumen compacto del historial para mandar al modelo.
export function buildSessionsSummary(sessions) {
  if (!sessions.length) return '';
  return sessions
    .slice(-8)
    .map((s) => {
      const d = s.extractedData || {};
      const parts = [`#${s.sessionNumber} (${s.date})`];
      if (d.techniques?.length) parts.push(`técnicas: ${d.techniques.join(', ')}`);
      if (d.struggles?.length) parts.push(`trabas: ${d.struggles.join(', ')}`);
      if (d.wins?.length) parts.push(`logros: ${d.wins.join(', ')}`);
      if (d.focusNext?.length) parts.push(`focos: ${d.focusNext.join(', ')}`);
      if (d.mood) parts.push(`ánimo: ${d.mood}`);
      return '- ' + parts.join(' | ');
    })
    .join('\n');
}
