import { useState } from 'react';
import { supabase } from '../lib/supabase.js';

export default function Login() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'recover'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingConfirm, setPendingConfirm] = useState(false);
  const [recoverSent, setRecoverSent] = useState(false);

  function reset() {
    setError('');
    setPassword('');
    setConfirm('');
    setPendingConfirm(false);
    setRecoverSent(false);
  }

  function switchMode(m) { reset(); setMode(m); }

  async function submit(e) {
    e.preventDefault();
    setError('');

    if (mode === 'recover') {
      if (!email.trim()) return;
      setLoading(true);
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: window.location.origin,
      });
      setLoading(false);
      if (err) setError(mapError(err.message));
      else setRecoverSent(true);
      return;
    }

    if (!email.trim() || !password) return;

    if (mode === 'signup') {
      if (password.length < 6) { setError('La contraseña tiene que tener al menos 6 caracteres.'); return; }
      if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }
    }

    setLoading(true);
    if (mode === 'signin') {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(), password,
      });
      if (err) setError(mapError(err.message));
    } else {
      const { data, error: err } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(), password,
      });
      if (err) setError(mapError(err.message));
      else if (!data.session) setPendingConfirm(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-dvh bg-ink flex flex-col">
      <div className="mx-auto w-full max-w-md px-5 flex-1 flex flex-col justify-center animate-fade-in">
        <span className="font-display text-6xl leading-none text-neutral-100">
          STEPS <span className="text-jade">BJJ</span>
        </span>

        {mode !== 'recover' && (
          <div className="flex mt-8 bg-elevated rounded-xl p-1">
            {[['signin', 'Entrar'], ['signup', 'Crear cuenta']].map(([m, label]) => (
              <button key={m} onClick={() => switchMode(m)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === m ? 'bg-surface text-neutral-100' : 'text-muted'}`}>
                {label}
              </button>
            ))}
          </div>
        )}

        {pendingConfirm ? (
          <div className="mt-6 card p-5 animate-fade-in">
            <div className="text-jade text-3xl mb-3">✓</div>
            <p className="text-neutral-100 font-medium mb-1">Revisá tu email</p>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Mandamos un link de confirmación a <strong className="text-neutral-200">{email}</strong>. Hacé click ahí y ya podés entrar.
            </p>
            <p className="text-muted text-xs mt-3">Solo se hace una vez.</p>
            <button className="mt-4 text-sm text-muted" onClick={() => { reset(); setMode('signin'); }}>
              Ya confirmé, ir a entrar →
            </button>
          </div>
        ) : recoverSent ? (
          <div className="mt-6 card p-5 animate-fade-in">
            <div className="text-jade text-3xl mb-3">✓</div>
            <p className="text-neutral-100 font-medium mb-1">Email enviado</p>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Revisá tu bandeja de entrada en <strong className="text-neutral-200">{email}</strong> y seguí el link para crear una nueva contraseña.
            </p>
            <button className="mt-4 text-sm text-muted" onClick={() => { reset(); setMode('signin'); }}>
              ← Volver a entrar
            </button>
          </div>
        ) : mode === 'recover' ? (
          <div className="mt-8">
            <p className="text-neutral-300 text-sm mb-5 leading-relaxed">
              Ingresá tu email y te mandamos un link para crear una nueva contraseña.
            </p>
            <form onSubmit={submit} className="space-y-3">
              <input type="email" className="input-field" placeholder="Email" value={email}
                autoFocus autoComplete="email" onChange={(e) => setEmail(e.target.value)} />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button type="submit" className="btn-primary w-full" disabled={!email.trim() || loading}>
                {loading ? 'Enviando…' : 'Enviar link de recuperación'}
              </button>
              <button type="button" className="w-full text-sm text-muted py-2" onClick={() => switchMode('signin')}>
                ← Volver
              </button>
            </form>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-3">
            <input type="email" className="input-field" placeholder="Email" value={email}
              autoComplete="email" autoFocus onChange={(e) => setEmail(e.target.value)} />
            <input type="password" className="input-field" placeholder="Contraseña" value={password}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              onChange={(e) => setPassword(e.target.value)} />
            {mode === 'signup' && (
              <input type="password" className="input-field" placeholder="Repetir contraseña" value={confirm}
                autoComplete="new-password" onChange={(e) => setConfirm(e.target.value)} />
            )}
            {error && <p className="text-red-400 text-sm leading-snug">{error}</p>}
            <button type="submit" className="btn-primary w-full" disabled={!email.trim() || !password || loading}>
              {loading ? 'Cargando…' : mode === 'signin' ? 'Entrar' : 'Crear cuenta'}
            </button>
            {mode === 'signin' && (
              <button type="button" className="w-full text-sm text-muted py-1" onClick={() => switchMode('recover')}>
                ¿Olvidaste tu contraseña?
              </button>
            )}
          </form>
        )}
      </div>

      <div className="mx-auto w-full max-w-md px-5 pb-6">
        <p className="text-[11px] text-muted/70 text-center">
          Steps BJJ es una herramienta de apoyo. No reemplaza a tu entrenador.
        </p>
      </div>
    </div>
  );
}

function mapError(msg) {
  if (msg.includes('Invalid login credentials')) return 'Email o contraseña incorrectos.';
  if (msg.includes('Email not confirmed')) return 'Confirmá tu email antes de entrar.';
  if (msg.includes('User already registered')) return 'Ya existe una cuenta con ese email.';
  if (msg.includes('Password should be')) return 'La contraseña tiene que tener al menos 6 caracteres.';
  return 'Algo salió mal. Intentá de nuevo.';
}
