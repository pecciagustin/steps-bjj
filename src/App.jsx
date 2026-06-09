import { useEffect, useState } from 'react';
import { loadState, saveState, emptyState } from './lib/storage.js';
import { phaseForSessionCount } from './lib/phases.js';
import Onboarding from './views/Onboarding.jsx';
import Dashboard from './views/Dashboard.jsx';
import PostClass from './views/PostClass.jsx';
import PreClass from './views/PreClass.jsx';
import History from './views/History.jsx';

export default function App() {
  const [state, setState] = useState(() => loadState());
  const [view, setView] = useState('dashboard'); // dashboard | post | pre | history
  const [activeSession, setActiveSession] = useState(null);

  // Persistir en cada cambio.
  useEffect(() => {
    if (state) saveState(state);
  }, [state]);

  // Sin perfil => onboarding.
  if (!state || !state.profile?.name) {
    return (
      <Onboarding
        onComplete={(profile) => {
          const base = emptyState();
          setState({ ...base, profile: { ...base.profile, ...profile } });
          setView('dashboard');
        }}
      />
    );
  }

  const currentPhase = phaseForSessionCount(state.profile.totalSessions);

  // Guarda una sesión completa y actualiza el perfil/estilo.
  function commitSession({ conversation, extractedData, styleUpdate }) {
    setState((prev) => {
      const sessionNumber = prev.profile.totalSessions + 1;
      const newSession = {
        id: `s_${Date.now().toString(36)}`,
        date: new Date().toISOString().slice(0, 10),
        phase: phaseForSessionCount(prev.profile.totalSessions),
        conversation,
        extractedData,
        sessionNumber,
      };

      const profile = {
        ...prev.profile,
        totalSessions: sessionNumber,
      };

      if (styleUpdate?.hypothesis) {
        profile.styleHypothesis = styleUpdate.hypothesis;
        profile.styleConfidence = styleUpdate.confidence || profile.styleConfidence;
        profile.styleHistory = [
          ...prev.profile.styleHistory,
          {
            date: newSession.date,
            hypothesis: styleUpdate.hypothesis,
            confidence: styleUpdate.confidence || 0,
          },
        ];
      }

      return { ...prev, profile, sessions: [...prev.sessions, newSession] };
    });
    setView('dashboard');
  }

  const common = {
    state,
    setState,
    currentPhase,
    goTo: setView,
  };

  return (
    <div className="min-h-dvh bg-ink text-neutral-200">
      {view === 'dashboard' && (
        <Dashboard
          {...common}
          onOpenSession={(s) => {
            setActiveSession(s);
            setView('history');
          }}
        />
      )}
      {view === 'post' && (
        <PostClass {...common} onCommit={commitSession} onBack={() => setView('dashboard')} />
      )}
      {view === 'pre' && <PreClass {...common} onBack={() => setView('dashboard')} />}
      {view === 'history' && (
        <History {...common} initialSession={activeSession} onBack={() => setView('dashboard')} />
      )}
    </div>
  );
}
