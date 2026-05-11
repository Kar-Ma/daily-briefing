export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
      <svg
        viewBox="0 0 100 100"
        className="w-16 h-16 animate-[spin_3s_linear_infinite]"
        aria-label="Loading your briefing"
      >
        <circle cx="50" cy="50" r="18" fill="#fbbf24" />
        <g stroke="#fbbf24" strokeWidth="3" strokeLinecap="round">
          <line x1="50" y1="8" x2="50" y2="20" />
          <line x1="50" y1="80" x2="50" y2="92" />
          <line x1="8" y1="50" x2="20" y2="50" />
          <line x1="80" y1="50" x2="92" y2="50" />
          <line x1="20" y1="20" x2="28" y2="28" />
          <line x1="80" y1="80" x2="72" y2="72" />
          <line x1="20" y1="80" x2="28" y2="72" />
          <line x1="80" y1="20" x2="72" y2="28" />
        </g>
      </svg>
    </div>
  );
}
