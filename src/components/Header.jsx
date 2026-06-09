// Header con el wordmark "Steps BJJ" en Bebas Neue.
export default function Header({ left, right, subtitle }) {
  return (
    <header className="sticky top-0 z-10 bg-ink/90 backdrop-blur border-b border-line">
      <div className="mx-auto max-w-md px-5 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {left}
          <div className="leading-none">
            <span className="font-display text-2xl text-neutral-100 tracking-wide">
              STEPS <span className="text-jade">BJJ</span>
            </span>
            {subtitle && <div className="text-[11px] text-muted mt-0.5">{subtitle}</div>}
          </div>
        </div>
        {right}
      </div>
    </header>
  );
}

export function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Volver"
      className="w-9 h-9 -ml-2 flex items-center justify-center rounded-lg text-neutral-400 active:bg-elevated transition-colors"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
