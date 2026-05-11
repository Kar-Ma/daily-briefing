export default function Loading() {
  const RAY_COUNT = 16;
  const INNER_R = 22;
  const LONG_R = 47;

  const rays = Array.from({ length: RAY_COUNT }, (_, i) => {
    const angle = (i / RAY_COUNT) * 2 * Math.PI;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const x1 = (50 + INNER_R * cos).toFixed(2);
    const y1 = (50 - INNER_R * sin).toFixed(2);
    const x2 = (50 + LONG_R * cos).toFixed(2);
    const y2 = (50 - LONG_R * sin).toFixed(2);

    // Pseudo-random duration (1.8–3.2s) and stagger (0–2s) per ray
    const duration = (1.8 + ((i * 0.43) % 1.4)).toFixed(2);
    const delay = ((i * 0.31) % 2).toFixed(2);

    return (
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        pathLength={100}
        style={{
          animation: `ray-pulse ${duration}s ease-in-out ${delay}s infinite`,
        }}
      />
    );
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
      <style>{`
        @keyframes ray-pulse {
          0%, 100% { stroke-dasharray: 60 100; }
          50% { stroke-dasharray: 100 100; }
        }
      `}</style>
      <svg
        viewBox="0 0 100 100"
        className="w-16 h-16 animate-[spin_8.2s_linear_infinite]"
        aria-label="Loading your briefing"
      >
        <circle cx="50" cy="50" r="22" fill="#9a3412" />
        <g stroke="#9a3412" strokeWidth="5" strokeLinecap="round">
          {rays}
        </g>
      </svg>
    </div>
  );
}
