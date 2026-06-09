import Header from '../components/Header.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { milestone, PHASE_META, BELTS } from '../lib/phases.js';

export default function Dashboard({ state, currentPhase, goTo, onOpenSession, onLogout }) {
  const { profile, sessions } = state;
  const count = profile.totalSessions;
  const ms = milestone(count);
  const phase = PHASE_META[currentPhase];
  const recent = [...sessions].slice(-3).reverse();

  return (
    <div className="pb-10">
      <Header
        subtitle={`Hola, ${profile.name}`}
        right={
          <div className="flex items-center gap-2">
            <button
              onClick={() => goTo('history')}
              className="text-xs text-muted border border-line rounded-lg px-3 py-1.5 active:bg-elevated transition-colors"
            >
              Historial
            </button>
            <button
              onClick={onLogout}
              className="text-xs text-muted border border-line rounded-lg px-3 py-1.5 active:bg-elevated transition-colors"
              title="Cerrar sesión"
            >
              Salir
            </button>
          </div>
        }
      />

      <main className="mx-auto max-w-md px-5 animate-fade-in">
        {/* Contador grande */}
        <section className="pt-8 pb-2 text-center">
          <div className="font-display text-[120px] leading-[0.85] text-neutral-100">{count}</div>
          <div className="text-sm uppercase tracking-[0.2em] text-muted mt-1">
            {count === 1 ? 'sesión registrada' : 'sesiones registradas'}
          </div>
          <div className="inline-flex items-center gap-2 mt-4 text-xs">
            <span className="text-jade font-medium">{phase.tag}</span>
            <span className="text-muted">·</span>
            <span className="text-neutral-400">{phase.name}</span>
            <span className="text-muted">·</span>
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: BELTS[profile.belt]?.color }}
            />
          </div>
        </section>

        {/* Progreso al próximo hito */}
        <section className="card p-4 mt-6">
          <div className="flex justify-between items-baseline mb-2.5">
            <span className="text-sm text-neutral-300">{ms.hint}</span>
            <span className="text-xs text-muted">
              {ms.current}/{ms.target}
            </span>
          </div>
          <ProgressBar value={ms.progress} />
        </section>

        {/* Card de estilo (si hay hipótesis) */}
        {profile.styleHypothesis ? (
          <section className="card p-5 mt-4 border-jade/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-widest text-jade">Tu estilo (hipótesis)</span>
              <span className="text-xs text-muted">{profile.styleConfidence}% confianza</span>
            </div>
            <p className="text-lg text-neutral-100 leading-snug">{profile.styleHypothesis}</p>
            <p className="text-[11px] text-muted mt-3">
              Es una hipótesis, no una verdad cerrada. Se ajusta con cada sesión.
            </p>
          </section>
        ) : (
          <section className="card p-5 mt-4">
            <span className="text-xs uppercase tracking-widest text-muted">Tu estilo</span>
            <p className="text-neutral-300 mt-2 leading-snug">
              Todavía estamos en construcción. Después de 5 sesiones vas a recibir tu primera
              hipótesis de estilo.
            </p>
          </section>
        )}

        {/* Acciones */}
        <section className="grid grid-cols-1 gap-3 mt-6">
          <button className="btn-primary flex items-center justify-center gap-2" onClick={() => goTo('post')}>
            Registrar clase
          </button>
          <button
            className="btn-secondary flex items-center justify-center gap-2"
            disabled={!sessions.length}
            onClick={() => goTo('pre')}
          >
            Preparar próxima clase
          </button>
          {!sessions.length && (
            <p className="text-[11px] text-muted text-center -mt-1">
              Registrá tu primera clase para desbloquear el briefing.
            </p>
          )}
        </section>

        {/* Últimas 3 sesiones */}
        {recent.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm text-muted mb-3">Últimas sesiones</h2>
            <ul className="space-y-2">
              {recent.map((s) => {
                const tags = [
                  ...(s.extractedData?.techniques || []),
                  ...(s.extractedData?.struggles || []),
                ].slice(0, 3);
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => onOpenSession(s)}
                      className="card w-full text-left p-4 active:bg-elevated transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-display text-xl text-neutral-200">
                          SESIÓN {s.sessionNumber}
                        </span>
                        <span className="text-xs text-muted">{s.date}</span>
                      </div>
                      {tags.length > 0 ? (
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
                      ) : (
                        <p className="text-xs text-muted mt-1.5">Sesión registrada</p>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <p className="text-[11px] text-muted/60 text-center leading-relaxed mt-10">
          Steps BJJ es una herramienta de apoyo para identificar patrones en tu juego. No reemplaza
          a tu entrenador ni al entrenamiento presencial.
        </p>
      </main>
    </div>
  );
}
