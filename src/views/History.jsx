import { useState } from 'react';
import Header, { BackButton } from '../components/Header.jsx';
import { PHASE_META } from '../lib/phases.js';
import RichText from '../components/RichText.jsx';

const MOODS = [
  { key: 'great', label: 'Genial' },
  { key: 'normal', label: 'Normal' },
  { key: 'tired', label: 'Cansado' },
  { key: 'bad', label: 'Mal' },
];

export default function History({ state, initialSession, onBack, onDelete, onEdit }) {
  const { sessions } = state;
  const ordered = [...sessions].reverse();
  const [open, setOpen] = useState(initialSession || null);
  const [editing, setEditing] = useState(false);

  function handleDelete(sessionId) {
    onDelete(sessionId);
    setOpen(null);
    setEditing(false);
  }

  function handleSave(sessionId, updates) {
    onEdit(sessionId, updates);
    // Actualizar la sesión abierta con los cambios para que se vea en detalle.
    setOpen((prev) => ({
      ...prev,
      date: updates.date ?? prev.date,
      extractedData: { ...prev.extractedData, ...updates.extractedData },
    }));
    setEditing(false);
  }

  if (open && editing) {
    return (
      <EditSession
        session={open}
        onSave={(updates) => handleSave(open.id, updates)}
        onCancel={() => setEditing(false)}
      />
    );
  }

  if (open) {
    return (
      <SessionDetail
        session={open}
        onBack={() => { setOpen(null); setEditing(false); }}
        onEdit={() => setEditing(true)}
        onDelete={() => handleDelete(open.id)}
      />
    );
  }

  return (
    <div className="min-h-dvh">
      <Header left={<BackButton onClick={onBack} />} subtitle="Historial" />
      <main className="mx-auto max-w-md px-5 py-6 animate-fade-in">
        {ordered.length === 0 ? (
          <p className="text-muted text-center mt-16">
            Todavía no hay sesiones. Registrá tu primera clase desde el inicio.
          </p>
        ) : (
          <ul className="space-y-2">
            {ordered.map((s) => {
              const tags = [
                ...(s.extractedData?.techniques || []),
                ...(s.extractedData?.struggles || []),
                ...(s.extractedData?.wins || []),
              ].slice(0, 4);
              return (
                <li key={s.id}>
                  <button
                    onClick={() => setOpen(s)}
                    className="card w-full text-left p-4 active:bg-elevated transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-display text-2xl text-neutral-100">
                        SESIÓN {s.sessionNumber}
                      </span>
                      <span className="text-xs text-muted">{s.date}</span>
                    </div>
                    <div className="text-[11px] text-jade mt-0.5">{PHASE_META[s.phase]?.name}</div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {tags.map((t, i) => (
                          <span key={i} className="text-[11px] bg-elevated border border-line rounded-full px-2 py-0.5 text-neutral-400">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}

// --- Vista de detalle ---

function SessionDetail({ session, onBack, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const d = session.extractedData || {};
  const groups = [
    ['Técnicas', d.techniques],
    ['Trabas', d.struggles],
    ['Logros', d.wins],
    ['Focos próximos', d.focusNext],
  ].filter(([, v]) => v && v.length);

  return (
    <div className="min-h-dvh">
      <Header
        left={<BackButton onClick={onBack} />}
        subtitle={`Sesión ${session.sessionNumber}`}
        right={
          <button
            onClick={onEdit}
            className="text-xs text-muted border border-line rounded-lg px-3 py-1.5 active:bg-elevated transition-colors"
          >
            Editar
          </button>
        }
      />
      <main className="mx-auto max-w-md px-5 py-6 animate-fade-in">
        <div className="flex items-baseline justify-between mb-4">
          <h1 className="font-display text-5xl text-neutral-100">SESIÓN {session.sessionNumber}</h1>
          <span className="text-xs text-muted">{session.date}</span>
        </div>

        {groups.length > 0 && (
          <div className="card p-4 mb-5 space-y-3">
            {groups.map(([label, items]) => (
              <div key={label}>
                <div className="text-xs text-muted mb-1">{label}</div>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((t, i) => (
                    <span key={i} className="text-[13px] bg-elevated border border-line rounded-full px-2.5 py-1 text-neutral-300">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {d.mood && (
              <div className="text-xs text-muted pt-1">
                Ánimo: <span className="text-neutral-300">{d.mood}</span>
              </div>
            )}
          </div>
        )}

        {d.matQuestion && (
          <div className="rounded-2xl border border-jade/40 bg-jade/8 p-4 mb-5">
            <div className="text-[11px] uppercase tracking-widest text-jade mb-1">Pregunta del tatami</div>
            <p className="text-[15px] text-neutral-100 leading-snug">{d.matQuestion}</p>
          </div>
        )}

        <h2 className="text-sm text-muted mb-3">Conversación</h2>
        <div className="space-y-3 mb-8">
          {session.conversation.map((m, i) => {
            const isUser = m.role === 'user';
            return (
              <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${
                  isUser
                    ? 'bg-jade text-black rounded-br-md'
                    : 'bg-surface border border-line text-neutral-200 rounded-bl-md'
                }`}>
                  <RichText text={m.content} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Borrar sesión */}
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-full py-3 text-sm text-red-400 border border-red-400/20 rounded-xl active:bg-red-400/10 transition-colors"
          >
            Eliminar sesión
          </button>
        ) : (
          <div className="card border-red-400/20 p-4 animate-fade-in">
            <p className="text-sm text-neutral-300 mb-3">
              ¿Seguro? Esta sesión se va a borrar y el contador va a bajar uno.
            </p>
            <div className="flex gap-2">
              <button
                onClick={onDelete}
                className="flex-1 py-2.5 text-sm font-medium text-red-400 bg-red-400/10 border border-red-400/30 rounded-xl active:bg-red-400/20 transition-colors"
              >
                Sí, borrar
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2.5 text-sm font-medium text-neutral-400 bg-elevated border border-line rounded-xl active:bg-surface transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// --- Vista de edición ---

function EditSession({ session, onSave, onCancel }) {
  const d = session.extractedData || {};
  const [date, setDate] = useState(session.date);
  const [mood, setMood] = useState(d.mood || 'normal');
  const [techniques, setTechniques] = useState(d.techniques || []);
  const [struggles, setStruggles] = useState(d.struggles || []);
  const [wins, setWins] = useState(d.wins || []);
  const [focusNext, setFocusNext] = useState(d.focusNext || []);
  const [matQuestion, setMatQuestion] = useState(d.matQuestion || '');

  function save() {
    onSave({
      date,
      extractedData: { mood, techniques, struggles, wins, focusNext, matQuestion: matQuestion.trim() || null },
    });
  }

  return (
    <div className="min-h-dvh">
      <Header
        left={<BackButton onClick={onCancel} />}
        subtitle={`Editando sesión ${session.sessionNumber}`}
        right={
          <button onClick={save} className="text-sm font-semibold text-jade px-3 py-1.5 active:opacity-70 transition-opacity">
            Guardar
          </button>
        }
      />
      <main className="mx-auto max-w-md px-5 py-6 animate-fade-in space-y-6">
        {/* Fecha */}
        <div>
          <label className="block text-xs text-muted mb-2">Fecha</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-field"
            style={{ colorScheme: 'dark' }}
          />
        </div>

        {/* Ánimo */}
        <div>
          <label className="block text-xs text-muted mb-2">Ánimo</label>
          <div className="grid grid-cols-4 gap-2">
            {MOODS.map((mo) => (
              <button
                key={mo.key}
                onClick={() => setMood(mo.key)}
                className={`rounded-xl py-2.5 text-xs font-medium border transition-colors ${
                  mood === mo.key
                    ? 'border-jade bg-jade/10 text-neutral-100'
                    : 'border-line bg-elevated text-neutral-400'
                }`}
              >
                {mo.label}
              </button>
            ))}
          </div>
        </div>

        <TagEditor label="Técnicas trabajadas" tags={techniques} onChange={setTechniques} />
        <TagEditor label="Trabas" tags={struggles} onChange={setStruggles} />
        <TagEditor label="Logros" tags={wins} onChange={setWins} />
        <TagEditor label="Focos para la próxima" tags={focusNext} onChange={setFocusNext} />

        {/* Pregunta del tatami */}
        <div>
          <label className="block text-xs text-muted mb-2">Pregunta para el tatami</label>
          <textarea
            className="input-field resize-none"
            rows={3}
            placeholder="Pregunta de auto-observación…"
            value={matQuestion}
            onChange={(e) => setMatQuestion(e.target.value)}
          />
        </div>

        <button onClick={save} className="btn-primary w-full">
          Guardar cambios
        </button>
      </main>
    </div>
  );
}

// --- Editor de tags (chips) ---

function TagEditor({ label, tags, onChange }) {
  const [input, setInput] = useState('');

  function add() {
    const v = input.trim();
    if (!v || tags.includes(v)) return;
    onChange([...tags, v]);
    setInput('');
  }

  function remove(tag) {
    onChange(tags.filter((t) => t !== tag));
  }

  return (
    <div>
      <label className="block text-xs text-muted mb-2">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((t) => (
          <span key={t} className="flex items-center gap-1 text-[13px] bg-elevated border border-line rounded-full pl-2.5 pr-1.5 py-1 text-neutral-300">
            {t}
            <button
              onClick={() => remove(t)}
              className="w-4 h-4 flex items-center justify-center rounded-full text-muted hover:text-neutral-200 transition-colors"
              aria-label={`Eliminar ${t}`}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
              </svg>
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="input-field flex-1 py-2.5 text-sm"
          placeholder="Agregar…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        />
        <button
          onClick={add}
          disabled={!input.trim()}
          className="px-3 py-2.5 text-sm font-medium text-jade border border-jade/40 rounded-xl disabled:opacity-30 active:bg-jade/10 transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}
