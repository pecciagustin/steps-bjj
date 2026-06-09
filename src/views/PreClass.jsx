import Header, { BackButton } from '../components/Header.jsx';

export default function PreClass({ state, onBack }) {
  const { profile, sessions } = state;
  const last = sessions[sessions.length - 1];
  const d = last?.extractedData || {};

  // Focos: lo recomendado en la última sesión, si no, las trabas a atacar.
  const focos = (d.focusNext?.length ? d.focusNext : d.struggles || []).slice(0, 2);

  // Pregunta para llevar al tatami.
  const question = profile.styleHypothesis
    ? `Hoy, ¿se confirma o se contradice esto: "${profile.styleHypothesis}"?`
    : focos[0]
    ? `Hoy, ¿qué pasa si llevás conscientemente el roll hacia "${focos[0]}"?`
    : '¿En qué posición te sentís más vos, sin pensarlo?';

  return (
    <div className="min-h-dvh">
      <Header left={<BackButton onClick={onBack} />} subtitle="Antes de entrenar" />

      <main className="mx-auto max-w-md px-5 py-6 animate-fade-in space-y-6">
        <div>
          <h1 className="font-display text-4xl text-neutral-100 leading-none">TU FOCO DE HOY</h1>
          <p className="text-muted mt-2 text-sm">
            Leé esto en un minuto antes de pisar el tatami.
          </p>
        </div>

        {/* Resumen última sesión */}
        <section className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-widest text-muted">
              Tu última sesión
            </span>
            {last && <span className="text-xs text-muted">#{last.sessionNumber} · {last.date}</span>}
          </div>
          {last ? (
            <div className="space-y-3 text-[15px]">
              <Row label="Trabajaste" items={d.techniques} empty="—" />
              <Row label="Ganaste en" items={d.wins} empty="—" accent />
              <Row label="Te trabaste en" items={d.struggles} empty="—" />
            </div>
          ) : (
            <p className="text-muted">Todavía no registraste ninguna clase.</p>
          )}
        </section>

        {/* Focos recomendados */}
        {focos.length > 0 && (
          <section>
            <h2 className="text-sm text-muted mb-3">Para enfocarte hoy</h2>
            <ul className="space-y-2">
              {focos.map((f, i) => (
                <li key={i} className="card p-4 flex items-start gap-3">
                  <span className="font-display text-2xl text-jade leading-none mt-0.5">{i + 1}</span>
                  <span className="text-neutral-200 text-[15px]">{f}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Pregunta para el tatami */}
        <section className="card p-5 border-jade/30 bg-jade/5">
          <span className="text-xs uppercase tracking-widest text-jade">Llevá esta pregunta</span>
          <p className="text-lg text-neutral-100 leading-snug mt-2">{question}</p>
        </section>

        <p className="text-[11px] text-muted/70 leading-relaxed text-center">
          Estos focos salen de tus propios registros. Cualquier corrección técnica, validala con tu
          profesor — él decide qué entrenás hoy.
        </p>

        <button className="btn-secondary w-full" onClick={onBack}>
          Listo, a entrenar
        </button>
      </main>
    </div>
  );
}

function Row({ label, items, empty, accent }) {
  const list = items || [];
  return (
    <div>
      <div className="text-xs text-muted mb-1">{label}</div>
      {list.length ? (
        <div className="flex flex-wrap gap-1.5">
          {list.map((t, i) => (
            <span
              key={i}
              className={`text-[13px] rounded-full px-2.5 py-1 border ${
                accent
                  ? 'border-jade/40 bg-jade/10 text-jade'
                  : 'border-line bg-elevated text-neutral-300'
              }`}
            >
              {t}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-muted text-sm">{empty}</span>
      )}
    </div>
  );
}
