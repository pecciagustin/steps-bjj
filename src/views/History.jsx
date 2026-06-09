import { useState } from 'react';
import Header, { BackButton } from '../components/Header.jsx';
import { PHASE_META } from '../lib/phases.js';
import RichText from '../components/RichText.jsx';

export default function History({ state, initialSession, onBack }) {
  const { sessions } = state;
  const ordered = [...sessions].reverse();
  const [open, setOpen] = useState(initialSession || null);

  if (open) {
    return <SessionDetail session={open} onBack={() => setOpen(null)} />;
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
                    <div className="text-[11px] text-jade mt-0.5">
                      {PHASE_META[s.phase]?.name}
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {tags.map((t, i) => (
                          <span
                            key={i}
                            className="text-[11px] bg-elevated border border-line rounded-full px-2 py-0.5 text-neutral-400"
                          >
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

function SessionDetail({ session, onBack }) {
  const d = session.extractedData || {};
  const groups = [
    ['Técnicas', d.techniques],
    ['Trabas', d.struggles],
    ['Logros', d.wins],
    ['Focos próximos', d.focusNext],
  ].filter(([, v]) => v && v.length);

  return (
    <div className="min-h-dvh">
      <Header left={<BackButton onClick={onBack} />} subtitle={`Sesión ${session.sessionNumber}`} />
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
                    <span
                      key={i}
                      className="text-[13px] bg-elevated border border-line rounded-full px-2.5 py-1 text-neutral-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {d.mood && (
              <div className="text-xs text-muted pt-1">Ánimo: <span className="text-neutral-300">{d.mood}</span></div>
            )}
          </div>
        )}

        <h2 className="text-sm text-muted mb-3">Conversación</h2>
        <div className="space-y-3">
          {session.conversation.map((m, i) => {
            const isUser = m.role === 'user';
            return (
              <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${
                    isUser
                      ? 'bg-jade text-black rounded-br-md'
                      : 'bg-surface border border-line text-neutral-200 rounded-bl-md'
                  }`}
                >
                  <RichText text={m.content} />
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
