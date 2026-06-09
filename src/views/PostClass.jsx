import { useEffect, useRef, useState } from 'react';
import Header, { BackButton } from '../components/Header.jsx';
import { sendChat, splitSessionData } from '../lib/api.js';
import { buildSessionsSummary } from '../lib/phases.js';
import RichText from '../components/RichText.jsx';

const MOODS = [
  { key: 'great', label: 'Genial' },
  { key: 'normal', label: 'Normal' },
  { key: 'tired', label: 'Cansado' },
  { key: 'bad', label: 'Mal' },
];

export default function PostClass({ state, currentPhase, onCommit, onBack }) {
  const { profile, sessions } = state;
  const opening = `¿Cómo estuvo el entrenamiento de hoy, ${profile.name}? Contame lo que se te venga.`;

  const [messages, setMessages] = useState([{ role: 'assistant', content: opening }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [closed, setClosed] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [mood, setMood] = useState('normal');
  const scrollRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading || closed) return;
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

    const { visible, extracted: data } = splitSessionData(raw);
    setMessages((m) => [...m, { role: 'assistant', content: visible }]);
    setLoading(false);

    if (data) {
      setExtracted(data);
      setClosed(true);
    }
  }

  function save() {
    const conversation = messages.map((m) => ({ role: m.role, content: m.content }));
    const ext = extracted || {};
    onCommit({
      conversation,
      extractedData: {
        techniques: ext.techniques || [],
        struggles: ext.struggles || [],
        wins: ext.wins || [],
        focusNext: ext.focusNext || [],
        mood,
      },
      styleUpdate: ext.styleHypothesis
        ? { hypothesis: ext.styleHypothesis, confidence: ext.styleConfidence || 0 }
        : null,
    });
  }

  return (
    <div className="flex flex-col h-dvh">
      <Header left={<BackButton onClick={onBack} />} subtitle="Registrar clase" />

      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto max-w-md px-5 py-5 space-y-4">
          {messages.map((m, i) => (
            <Bubble key={i} role={m.role} text={m.content} />
          ))}
          {loading && <Typing />}
          <div ref={endRef} />
        </div>
      </div>

      {/* Pie: chat o cierre */}
      <div className="border-t border-line bg-ink">
        <div className="mx-auto max-w-md px-5 py-4">
          {!closed ? (
            <div className="flex items-end gap-2">
              <textarea
                className="input-field resize-none max-h-32 py-3"
                rows={1}
                placeholder="Escribí tu respuesta…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
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
          ) : (
            <div className="animate-fade-in">
              <p className="text-sm text-muted mb-2">¿Cómo terminaste hoy?</p>
              <div className="grid grid-cols-4 gap-2 mb-4">
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
              <button className="btn-primary w-full" onClick={save}>
                Guardar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Bubble({ role, text }) {
  const isUser = role === 'user';
  return (
    <div className={`flex animate-fade-in-fast ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${
          isUser
            ? 'bg-jade text-black rounded-br-md'
            : 'bg-surface border border-line text-neutral-200 rounded-bl-md'
        }`}
      >
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
