// Persistencia en localStorage bajo la key "steps_bjj".

const KEY = 'steps_bjj';

export const emptyState = () => ({
  profile: {
    name: '',
    belt: 'white',
    startDate: '',
    motivation: '',
    totalSessions: 0,
    styleHypothesis: null,
    styleConfidence: 0,
    styleHistory: [],
  },
  sessions: [],
});

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Merge defensivo por si cambia el esquema.
    return {
      ...emptyState(),
      ...parsed,
      profile: { ...emptyState().profile, ...(parsed.profile || {}) },
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
    };
  } catch {
    return null;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (err) {
    console.error('No se pudo guardar el estado', err);
  }
}

export function clearState() {
  localStorage.removeItem(KEY);
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
