import { useState } from 'react';
import { supabase } from '../lib/supabase.js';

export default function ResetPassword({ onDone }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (password.length < 6) { setError('Mínimo 6 caracteres.'); return; }
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) setError('No se pudo actualizar. Pedí el link de nuevo.');
    else setDone(true);
  }

  return (
    <div className="min-h-dvh bg-ink flex flex-col">
      <div className="mx-auto w-full max-w-md px-5 flex-1 flex flex-col justify-center animate-fade-in">
        <span className="font-display text-6xl leading-none text-neutral-100">
          STEPS <span className="text-jade">BJJ</span>
        </span>

        {done ? (
          <div className="mt-8 card p-5 animate-fade-in">
            <div className="text-jade text-3xl mb-3">✓</div>
            <p className="text-neutral-100 font-medium mb-1">Contraseña actualizada</p>
            <p className="text-neutral-400 text-sm">Ya podés usar tu nueva contraseña para entrar.</p>
            <button className="btn-primary w-full mt-5" onClick={onDone}>Ir a la app</button>
          </div>
        ) : (
          <>
            <p className="mt-6 text-neutral-300 text-sm">Elegí tu nueva contraseña.</p>
            <form onSubmit={submit} className="mt-5 space-y-3">
              <input type="password" className="input-field" placeholder="Nueva contraseña"
                value={password} autoFocus autoComplete="new-password"
                onChange={(e) => setPassword(e.target.value)} />
              <input type="password" className="input-field" placeholder="Repetir contraseña"
                value={confirm} autoComplete="new-password"
                onChange={(e) => setConfirm(e.target.value)} />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button type="submit" className="btn-primary w-full" disabled={!password || !confirm || loading}>
                {loading ? 'Guardando…' : 'Guardar nueva contraseña'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
