import { useState } from 'react';
import { supabase } from '../lib/supabase.js';
import Header, { BackButton } from '../components/Header.jsx';
import { BELTS } from '../lib/phases.js';

export default function Account({ state, setState, authUser, onBack }) {
  const { profile } = state;
  const [form, setForm] = useState({
    name: profile.name || '',
    lastName: profile.lastName || '',
    belt: profile.belt || 'white',
    academy: profile.academy || '',
  });
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [msg, setMsg] = useState({ profile: '', email: '', password: '' });

  function setField(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function saveProfile(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setState((prev) => ({ ...prev, profile: { ...prev.profile, ...form } }));
    await new Promise((r) => setTimeout(r, 400)); // deja que el sync corra
    setSaving(false);
    setMsg((m) => ({ ...m, profile: 'Guardado ✓' }));
    setTimeout(() => setMsg((m) => ({ ...m, profile: '' })), 2500);
  }

  async function saveEmail(e) {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim().toLowerCase() });
    setSavingEmail(false);
    if (error) setMsg((m) => ({ ...m, email: 'Error: ' + error.message }));
    else { setNewEmail(''); setMsg((m) => ({ ...m, email: 'Revisá tu nuevo email para confirmar el cambio.' })); }
    setTimeout(() => setMsg((m) => ({ ...m, email: '' })), 4000);
  }

  async function savePassword(e) {
    e.preventDefault();
    if (newPassword.length < 6) { setMsg((m) => ({ ...m, password: 'Mínimo 6 caracteres.' })); return; }
    if (newPassword !== confirmPassword) { setMsg((m) => ({ ...m, password: 'Las contraseñas no coinciden.' })); return; }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) setMsg((m) => ({ ...m, password: 'Error al actualizar.' }));
    else { setNewPassword(''); setConfirmPassword(''); setMsg((m) => ({ ...m, password: 'Contraseña actualizada ✓' })); }
    setTimeout(() => setMsg((m) => ({ ...m, password: '' })), 3000);
  }

  return (
    <div className="min-h-dvh">
      <Header left={<BackButton onClick={onBack} />} subtitle="Mi cuenta" />
      <main className="mx-auto max-w-md px-5 py-6 animate-fade-in space-y-6">

        {/* Perfil */}
        <section className="card p-5">
          <h2 className="text-xs uppercase tracking-widest text-muted mb-4">Perfil</h2>
          <form onSubmit={saveProfile} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted block mb-1">Nombre</label>
                <input className="input-field" value={form.name}
                  onChange={(e) => setField('name', e.target.value)} placeholder="Tu nombre" />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Apellido</label>
                <input className="input-field" value={form.lastName}
                  onChange={(e) => setField('lastName', e.target.value)} placeholder="Tu apellido" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Academia</label>
              <input className="input-field" value={form.academy}
                onChange={(e) => setField('academy', e.target.value)} placeholder="Nombre de tu academia" />
            </div>
            <div>
              <label className="text-xs text-muted block mb-2">Cinturón</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(BELTS).map(([key, b]) => (
                  <button key={key} type="button" onClick={() => setField('belt', key)}
                    className={`rounded-xl py-2.5 border text-xs font-medium transition-colors ${form.belt === key ? 'border-jade bg-jade/10 text-neutral-100' : 'border-line bg-elevated text-neutral-400'}`}>
                    <span className="block w-8 h-1.5 mx-auto mb-1.5 rounded-full" style={{ background: b.color }} />
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
            {msg.profile && <p className="text-jade text-sm">{msg.profile}</p>}
            <button type="submit" className="btn-primary w-full" disabled={!form.name.trim() || saving}>
              {saving ? 'Guardando…' : 'Guardar perfil'}
            </button>
          </form>
        </section>

        {/* Email */}
        <section className="card p-5">
          <h2 className="text-xs uppercase tracking-widest text-muted mb-1">Email</h2>
          <p className="text-sm text-neutral-400 mb-4">Actual: <span className="text-neutral-200">{authUser?.email}</span></p>
          <form onSubmit={saveEmail} className="space-y-3">
            <input type="email" className="input-field" placeholder="Nuevo email"
              value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            {msg.email && <p className={`text-sm ${msg.email.startsWith('Error') ? 'text-red-400' : 'text-jade'}`}>{msg.email}</p>}
            <button type="submit" className="btn-secondary w-full" disabled={!newEmail.trim() || savingEmail}>
              {savingEmail ? 'Actualizando…' : 'Cambiar email'}
            </button>
          </form>
        </section>

        {/* Contraseña */}
        <section className="card p-5">
          <h2 className="text-xs uppercase tracking-widest text-muted mb-4">Contraseña</h2>
          <form onSubmit={savePassword} className="space-y-3">
            <input type="password" className="input-field" placeholder="Nueva contraseña"
              value={newPassword} autoComplete="new-password" onChange={(e) => setNewPassword(e.target.value)} />
            <input type="password" className="input-field" placeholder="Repetir contraseña"
              value={confirmPassword} autoComplete="new-password" onChange={(e) => setConfirmPassword(e.target.value)} />
            {msg.password && <p className={`text-sm ${msg.password.startsWith('Error') || msg.password.includes('coinciden') || msg.password.includes('Mínimo') ? 'text-red-400' : 'text-jade'}`}>{msg.password}</p>}
            <button type="submit" className="btn-secondary w-full" disabled={!newPassword || !confirmPassword || savingPassword}>
              {savingPassword ? 'Actualizando…' : 'Cambiar contraseña'}
            </button>
          </form>
        </section>

      </main>
    </div>
  );
}
