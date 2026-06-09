import { useEffect, useRef, useState } from 'react';
import Header, { BackButton } from '../components/Header.jsx';
import RichText from '../components/RichText.jsx';
import { PHASE_META } from '../lib/phases.js';
import { sendChat, splitSessionData } from '../lib/api.js';
import { buildSessionsSummary } from '../lib/phases.js';

export default function History({ state, initialSession, onBack, onDelete, onUpdate }) {
  const { sessions } = state;
  const ordered = [...sessions].reverse();
  const [open, setOpen] = useState(initialSession || null);
  const [continuing, setContinuing] = useState(false);

  function handleDelete(sessionId) {
    onDelete(sessionId);
    setOpen(null);
  }

  function handleSave(sessionId, updates) {
    onUpdate(sessionId, updates);
    // Reflejar los cambios en la sesión abierta localmente.
    setOpen((prev) => ({
      ...prev,
      conversation: updates.conversation,
      extractedData: updates.extractedData ?? prev.extractedData,
    }));
    setContinuing(false);
  }

  if (open && continuing) {
    return (
      <ContinueChat
        session={open}
        state={state}
        onSave={(updates) => handleSave(open.id, updates)}
        onCancel={() => setContinuing(false)}
      />
    );
  }

  if (open) {
    return (
      <SessionDetail
        session={open}
        onBack={() => setOpen(null)}
        onContinue={() => setContinuing(true)}
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

// --- Detalle de sesión ---

function SessionDetail({ session, onBack, onContinue, onDelete }) {
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
            onClick={onContinue}
            className="text-xs text-muted border border-line rounded-lg px-3 py-1.5 active:bg-elevated transition-colors"
          >
            + Agregar
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
          {session.conversation.map((m, i) => (
            <Bubble key={i} role={m.role} text={m.content} />
          ))}
        </div>

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

// --- Modo continuar chat ---

function ContinueChat({ session, state, onSave, onCancel }) {
  const { profile, sessions } = state;
  const [messages, setMessages] = useState(session.conversation || []);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [newExtracted, setNewExtracted] = useState(null);
  const endRef = useRef(null);

  const currentPhase = session.phase || 'discovery';

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);

    const raw = await sendChat({
      messages: next,
      profile,
      sessionsSummary: buildSessionsSummary(sessions),
      currentPhase,
    });

    const { visible, extracted } = splitSessionData(raw);
    setMessages((m) => [...m, { role: 'assistant', content: visible }]);
    setLoading(false);
    if (extracted) setNewExtracted(extracted);
  }

  function save() {
    onSave({ conversation: messages, extractedData: newExtracted });
  }

  function saveConversationOnly() {
    onSave({ conversation: messages, extractedData: null });
  }

  const canSave = messages.length > (session.conversation || []).length;

  return (
    <div className="flex flex-col h-dvh">
      <Header
        left={<BackButton onClick={onCancel} />}
        subtitle={`Sesión ${session.sessionNumber} — agregando`}
      />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto max-w-md px-5 py-5 space-y-4">
          {/* Conversación original (tenue) */}
          {session.conversation.map((m, i) => (
            <Bubble key={`orig-${i}`} role={m.role} text={m.content} dim />
          ))}

          {/* Separador */}
          {session.conversation.length > 0 && (
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-line" />
              <span className="text-[11px] text-muted">agregando ahora</span>
              <div className="flex-1 h-px bg-line" />
            </div>
          )}

          {/* Mensajes nuevos (normales) */}
          {messages.slice(session.conversation.length).map((m, i) => (
            <Bubble key={`new-${i}`} role={m.role} text={m.content} />
          ))}

          {loading && <Typing />}
          <div ref={endRef} />
        </div>
      </div>

      <div className="border-t border-line bg-ink">
        <div className="mx-auto max-w-md px-5 py-4 space-y-3">
          {newExtracted ? (
            <div className="animate-fade-in space-y-2">
              <p className="text-xs text-muted text-center">La app actualizó el resumen de la sesión.</p>
              <button className="btn-primary w-full" onClick={save}>
                Guardar cambios
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-end gap-2">
                <textarea
                  className="input-field resize-none max-h-32 py-3"
                  rows={1}
                  placeholder="Escribí lo que olvidaste…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
                  }}
                />
                <button
                  className="btn-primary px-4 py-3 shrink-0"
                  disabled={!input.trim() || loading}
                  onClick={send}
                  aria-label="Enviar"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              {canSave && (
                <button
                  onClick={saveConversationOnly}
                  className="w-full py-2.5 text-sm text-muted border border-line rounded-xl active:bg-elevated transition-colors"
                >
                  Guardar sin cerrar la conversación
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Bubble({ role, text, dim }) {
  const isUser = role === 'user';
  return (
    <div className={`flex animate-fade-in-fast ${isUser ? 'justify-end' : 'justify-start'} ${dim ? 'opacity-40' : ''}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${
        isUser
          ? 'bg-jade text-black rounded-br-md'
          : 'bg-surface border border-line text-neutral-200 rounded-bl-md'
      }`}>
        <RichText text={text} />
      </div>
    </div>
  );
}

function Typing() {
  return (
    <div className="flex justify-start animate-fade-in-fast">
      <div className="bg-surface border border-line rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
}
