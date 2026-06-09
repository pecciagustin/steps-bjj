import { useState } from 'react';
import { BELTS } from '../lib/phases.js';

const DISCLAIMER =
  'Steps BJJ no reemplaza a tu entrenador bajo ningún punto de vista. No es un sustituto del coaching ni del entrenamiento presencial. Es una herramienta para ayudarte a identificar patrones en tu propio juego y entender con qué estilo te sentís más cómodo. Lo que hacés en el tatami lo decidís vos y tu profesor.';

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0); // 0 welcome, 1 disclaimer, 2 datos, 3 por qué
  const [accepted, setAccepted] = useState(false);
  const [name, setName] = useState('');
  const [belt, setBelt] = useState('white');
  const [motivation, setMotivation] = useState('');

  function finish() {
    onComplete({
      name: name.trim(),
      belt,
      motivation: motivation.trim(),
      startDate: new Date().toISOString().slice(0, 10),
    });
  }

  return (
    <div className="min-h-dvh bg-ink text-neutral-200 flex flex-col">
      {/* Barra de pasos */}
      <div className="mx-auto w-full max-w-md px-5 pt-5">
        <div className="flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i <= step ? 'bg-jade' : 'bg-elevated'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-md px-5 flex-1 flex flex-col">
        {step === 0 && (
          <div key="s0" className="flex-1 flex flex-col justify-center animate-fade-in">
            <span className="font-display text-6xl leading-none text-neutral-100">
              STEPS <span className="text-jade">BJJ</span>
            </span>
            <p className="mt-6 text-lg text-neutral-300 leading-relaxed">
              Tu diario inteligente de Brazilian Jiu-Jitsu.
            </p>
            <p className="mt-3 text-muted leading-relaxed">
              Tu estilo ya está dentro tuyo. Esta app no te enseña qué hacer — te hace preguntas,
              observa tus patrones y te refleja lo que ya tenés adentro.
            </p>
            <button className="btn-primary mt-10" onClick={() => setStep(1)}>
              Empezar
            </button>
          </div>
        )}

        {step === 1 && (
          <div key="s1" className="flex-1 flex flex-col justify-center animate-fade-in">
            <h1 className="font-display text-4xl text-neutral-100">ANTES DE ARRANCAR</h1>
            <div className="card mt-6 p-5">
              <p className="text-neutral-300 leading-relaxed text-[15px]">{DISCLAIMER}</p>
            </div>
            <label className="mt-5 flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-jade rounded"
              />
              <span className="text-[15px] text-neutral-300">
                Entiendo que Steps BJJ es una herramienta de apoyo y no reemplaza a mi entrenador.
              </span>
            </label>
            <button className="btn-primary mt-8" disabled={!accepted} onClick={() => setStep(2)}>
              Acepto y continúo
            </button>
          </div>
        )}

        {step === 2 && (
          <div key="s2" className="flex-1 flex flex-col justify-center animate-fade-in">
            <h1 className="font-display text-4xl text-neutral-100">¿QUIÉN SOS EN EL TATAMI?</h1>
            <label className="block mt-8 text-sm text-muted mb-2">Tu nombre</label>
            <input
              className="input-field"
              placeholder="Ej: Agustín"
              value={name}
              autoFocus
              onChange={(e) => setName(e.target.value)}
            />
            <label className="block mt-6 text-sm text-muted mb-2">Tu cinturón</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(BELTS).map(([key, b]) => (
                <button
                  key={key}
                  onClick={() => setBelt(key)}
                  className={`rounded-xl py-3 border text-sm font-medium transition-colors ${
                    belt === key
                      ? 'border-jade bg-jade/10 text-neutral-100'
                      : 'border-line bg-elevated text-neutral-400'
                  }`}
                >
                  <span
                    className="block w-8 h-1.5 mx-auto mb-2 rounded-full"
                    style={{ background: b.color }}
                  />
                  {b.label}
                </button>
              ))}
            </div>
            <button
              className="btn-primary mt-10"
              disabled={!name.trim()}
              onClick={() => setStep(3)}
            >
              Continuar
            </button>
          </div>
        )}

        {step === 3 && (
          <div key="s3" className="flex-1 flex flex-col justify-center animate-fade-in">
            <h1 className="font-display text-4xl text-neutral-100 leading-tight">
              ¿POR QUÉ EMPEZASTE BJJ?
            </h1>
            <p className="mt-3 text-muted">
              No hay respuesta correcta. Esto ayuda a entender desde dónde venís.
            </p>
            <textarea
              className="input-field mt-6 min-h-32 resize-none"
              placeholder="Contame en tus palabras…"
              value={motivation}
              autoFocus
              onChange={(e) => setMotivation(e.target.value)}
            />
            <button className="btn-primary mt-8" disabled={!motivation.trim()} onClick={finish}>
              Entrar a Steps BJJ
            </button>
            <button className="mt-3 text-sm text-muted py-2" onClick={finish}>
              Prefiero saltear esto
            </button>
          </div>
        )}
      </div>

      <div className="mx-auto w-full max-w-md px-5 pb-6 pt-4">
        <p className="text-[11px] text-muted/70 text-center leading-relaxed">
          Steps BJJ es una herramienta de apoyo. No reemplaza a tu entrenador.
        </p>
      </div>
    </div>
  );
}
