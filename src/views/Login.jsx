import { useState } from 'react';
import { supabase } from '../lib/supabase.js';

export default function Login() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function reset() {
    setError('');
    setPassword('');
    setConfirm('');
  }

  function switchMode(m) {
    reset();
    setMode(m);
  }

  async function submit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) return;

    if (mode === 'signup') {
      if (password.length < 6) {
        setError('La contraseña tiene que tener al menos 6 caracteres.');
        return;
      }
      if (password !== confirm) {
        setError('Las contraseñas no coinciden.');
        return;
      }
    }

    setLoading(true);

    if (mode === 'signin') {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (err) setError(mapError(err.message));
    } else {
      const { error: err } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });
      if (err) setError(mapError(err.message));
      // Si no hay error, Supabase crea la sesión automáticamente y App.jsx detecta el cambio.
    }

    setLoading(false);
  }

  return (
    <div className="min-h-dvh bg-ink flex flex-col">
      <div className="mx-auto w-full max-w-md px-5 flex-1 flex flex-col justify-center animate-fade-in">
        <span className="font-display text-6xl leading-none text-neutral-100">
          STEPS <span className="text-jade">BJJ</span>
        </span>

        {/* Tabs */}
        <div className="flex mt-8 bg-elevated rounded-xl p-1">
          {[['signin', 'Entrar'], ['signup', 'Crear cuenta']].map(([m, label]) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                mode === m
                  ? 'bg-surface text-neutral-100 shadow-sm'
                  : 'text-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-5 space-y-3">
          <input
            type="email"
            className="input-field"
            placeholder="Email"
            value={email}
            autoComplete="email"
            autoFocus
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="input-field"
            placeholder="Contraseña"
            value={password}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            onChange={(e) => setPassword(e.target.value)}
          />
          {mode === 'signup' && (
            <input
              type="password"
              className="input-field"
              placeholder="Repetir contraseña"
              value={confirm}
              autoComplete="new-password"
              onChange={(e) => setConfirm(e.target.value)}
            />
          )}

          {error && (
            <p className="text-red-400 text-sm leading-snug">{error}</p>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={!email.trim() || !password || loading}
          >
            {loading ? 'Cargando…' : mode === 'signin' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>
      </div>

      <div className="mx-auto w-full max-w-md px-5 pb-6">
        <p className="text-[11px] text-muted/70 text-center leading-relaxed">
          Steps BJJ es una herramienta de apoyo. No reemplaza a tu entrenador.
        </p>
      </div>
    </div>
  );
}

function mapError(msg) {
  if (msg.includes('Invalid login credentials')) return 'Email o contraseña incorrectos.';
  if (msg.includes('Email not confirmed')) return 'Confirmá tu email antes de entrar.';
  if (msg.includes('User already registered')) return 'Ya existe una cuenta con ese email. Entrá con tu contraseña.';
  if (msg.includes('Password should be')) return 'La contraseña tiene que tener al menos 6 caracteres.';
  return 'Algo salió mal. Intentá de nuevo.';
}
