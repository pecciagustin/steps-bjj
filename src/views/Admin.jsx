import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import Header, { BackButton } from '../components/Header.jsx';
import { BELTS } from '../lib/phases.js';

export default function Admin({ onBack }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setError('No hay sesión.'); setLoading(false); return; }

      const res = await fetch('/api/admin', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || 'Error desconocido.'); setLoading(false); return; }
      setUsers(json.users || []);
      setLoading(false);
    })();
  }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return !q
      || u.email?.toLowerCase().includes(q)
      || u.profile?.name?.toLowerCase().includes(q)
      || u.profile?.lastName?.toLowerCase().includes(q)
      || u.profile?.academy?.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-dvh">
      <Header left={<BackButton onClick={onBack} />} subtitle="Admin" />
      <main className="mx-auto max-w-2xl px-5 py-6 animate-fade-in">

        <div className="flex items-baseline justify-between mb-5">
          <h1 className="font-display text-4xl text-neutral-100">USUARIOS</h1>
          {!loading && !error && (
            <span className="text-sm text-muted">{users.length} cuenta{users.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {loading && (
          <p className="text-muted text-center mt-16 animate-pulse">Cargando…</p>
        )}

        {error && (
          <div className="card border-red-400/20 p-5 text-center">
            <p className="text-red-400">{error}</p>
            <p className="text-muted text-xs mt-2">Verificá que ADMIN_EMAIL y SUPABASE_SERVICE_KEY estén configurados en Vercel.</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <input className="input-field mb-4" placeholder="Buscar por email, nombre o academia…"
              value={search} onChange={(e) => setSearch(e.target.value)} />

            <div className="space-y-3">
              {filtered.map((u) => (
                <UserCard key={u.id} user={u} />
              ))}
              {filtered.length === 0 && (
                <p className="text-muted text-center py-8">Sin resultados.</p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function UserCard({ user: u }) {
  const p = u.profile || {};
  const belt = BELTS[p.belt];
  const joinDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-ES') : '—';
  const lastSeen = u.lastSignIn ? new Date(u.lastSignIn).toLocaleDateString('es-ES') : '—';

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-neutral-100 font-medium">
              {p.name || '—'} {p.lastName || ''}
            </span>
            {belt && (
              <span className="flex items-center gap-1 text-[11px] text-muted">
                <span className="inline-block w-4 h-1 rounded-full" style={{ background: belt.color }} />
                {belt.label}
              </span>
            )}
          </div>
          <div className="text-sm text-muted mt-0.5 truncate">{u.email}</div>
          {p.academy && <div className="text-xs text-neutral-400 mt-0.5">🥋 {p.academy}</div>}
        </div>
        <div className="text-right shrink-0">
          <div className="font-display text-3xl text-jade leading-none">{u.totalSessions}</div>
          <div className="text-[10px] text-muted">sesiones</div>
        </div>
      </div>
      <div className="flex gap-4 mt-3 text-[11px] text-muted border-t border-line pt-2.5">
        <span>Registro: {joinDate}</span>
        <span>Último acceso: {lastSeen}</span>
      </div>
    </div>
  );
}
