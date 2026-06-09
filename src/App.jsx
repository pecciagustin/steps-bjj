import { useEffect, useRef, useState } from 'react';
import { supabase } from './lib/supabase.js';
import { loadState, saveState, emptyState } from './lib/storage.js';
import { loadFromCloud, saveToCloud } from './lib/sync.js';
import { phaseForSessionCount } from './lib/phases.js';
import Login from './views/Login.jsx';
import Onboarding from './views/Onboarding.jsx';
import Dashboard from './views/Dashboard.jsx';
import PostClass from './views/PostClass.jsx';
import PreClass from './views/PreClass.jsx';
import History from './views/History.jsx';

const SAVE_DEBOUNCE_MS = 1500;

export default function App() {
  const [authUser, setAuthUser] = useState(undefined); // undefined = cargando
  const [state, setState] = useState(null);
  const [view, setView] = useState('dashboard');
  const [activeSession, setActiveSession] = useState(null);
  const saveTimer = useRef(null);

  // --- Auth: escuchar sesión de Supabase ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // --- Cargar datos cuando hay usuario autenticado ---
  useEffect(() => {
    if (!authUser) return;
    (async () => {
      const cloud = await loadFromCloud(authUser.id);
      if (cloud?.profile?.name) {
        // Nube tiene datos → úsalos y actualiza el cache local.
        setState(cloud);
        saveState(cloud);
      } else {
        // Nube vacía → migrar localStorage si existe, si no empezar de cero.
        const local = loadState();
        if (local?.profile?.name) {
          setState(local);
          await saveToCloud(authUser.id, local);
        } else {
          setState(emptyState());
        }
      }
    })();
  }, [authUser]);

  // --- Persistir cambios: localStorage inmediato + nube debounced ---
  useEffect(() => {
    if (!state || !authUser) return;
    saveState(state);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveToCloud(authUser.id, state);
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(saveTimer.current);
  }, [state, authUser]);

  // Pantalla de carga mientras resolvemos la sesión.
  if (authUser === undefined || (authUser && !state)) {
    return (
      <div className="min-h-dvh bg-ink flex items-center justify-center">
        <span className="font-display text-3xl text-jade animate-pulse">STEPS BJJ</span>
      </div>
    );
  }

  // Sin sesión → login.
  if (!authUser) return <Login />;

  // Sin perfil → onboarding.
  if (!state.profile?.name) {
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
      const profile = { ...prev.profile, totalSessions: sessionNumber };
      if (styleUpdate?.hypothesis) {
        profile.styleHypothesis = styleUpdate.hypothesis;
        profile.styleConfidence = styleUpdate.confidence || profile.styleConfidence;
        profile.styleHistory = [
          ...prev.profile.styleHistory,
          { date: newSession.date, hypothesis: styleUpdate.hypothesis, confidence: styleUpdate.confidence || 0 },
        ];
      }
      return { ...prev, profile, sessions: [...prev.sessions, newSession] };
    });
    setView('dashboard');
  }

  function deleteSession(sessionId) {
    setState((prev) => {
      const sessions = prev.sessions.filter((s) => s.id !== sessionId);
      return {
        ...prev,
        sessions,
        profile: { ...prev.profile, totalSessions: sessions.length },
      };
    });
  }

  function updateSession(sessionId, { conversation, extractedData }) {
    setState((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) =>
        s.id === sessionId
          ? { ...s, conversation, extractedData: extractedData ?? s.extractedData }
          : s
      ),
    }));
  }

  const common = { state, setState, currentPhase, goTo: setView };

  return (
    <div className="min-h-dvh bg-ink text-neutral-200">
      {view === 'dashboard' && (
        <Dashboard
          {...common}
          onOpenSession={(s) => { setActiveSession(s); setView('history'); }}
          onLogout={() => supabase.auth.signOut()}
        />
      )}
      {view === 'post' && (
        <PostClass {...common} onCommit={commitSession} onBack={() => setView('dashboard')} />
      )}
      {view === 'pre' && <PreClass {...common} onBack={() => setView('dashboard')} />}
      {view === 'history' && (
        <History
          {...common}
          initialSession={activeSession}
          onBack={() => setView('dashboard')}
          onDelete={deleteSession}
          onUpdate={updateSession}
        />
      )}
    </div>
  );
}
