import { useState } from 'react';
import { supabase } from '../lib/supabase.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function send(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (err) {
      setError('No se pudo enviar el link. Revisá el email e intentá de nuevo.');
    } else {
      setSent(true);
    }
  }

  return (
    <div className="min-h-dvh bg-ink flex flex-col">
      <div className="mx-auto w-full max-w-md px-5 flex-1 flex flex-col justify-center animate-fade-in">
        <span className="font-display text-6xl leading-none text-neutral-100">
          STEPS <span className="text-jade">BJJ</span>
        </span>

        {!sent ? (
          <>
            <p className="mt-6 text-neutral-300 leading-relaxed">
              Ingresá tu email para acceder desde cualquier dispositivo. Te mandamos un link — sin contraseña.
            </p>
            <form onSubmit={send} className="mt-8 space-y-3">
              <input
                type="email"
                className="input-field"
                placeholder="tu@email.com"
                value={email}
                autoFocus
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
              />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={!email.trim() || loading}
              >
                {loading ? 'Enviando…' : 'Enviar link de acceso'}
              </button>
            </form>
          </>
        ) : (
          <div className="mt-8 card p-5 animate-fade-in">
            <div className="text-jade text-3xl mb-3">✓</div>
            <p className="text-neutral-100 font-medium mb-1">Revisá tu email</p>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Mandamos un link a <strong className="text-neutral-200">{email}</strong>. Hacé click ahí y vas a entrar directamente — funciona en cualquier dispositivo.
            </p>
            <button
              className="mt-5 text-sm text-muted"
              onClick={() => { setSent(false); setEmail(''); }}
            >
              Usar otro email
            </button>
          </div>
        )}
      </div>

      <div className="mx-auto w-full max-w-md px-5 pb-6">
        <p className="text-[11px] text-muted/70 text-center leading-relaxed">
          Steps BJJ es una herramienta de apoyo. No reemplaza a tu entrenador.
        </p>
      </div>
    </div>
  );
}
