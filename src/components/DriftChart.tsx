import { TURN_LABELS } from "@/lib/agents";

// Sycophancy score per turn as a small line chart. Pure SVG so it renders
// identically on the server and in print.
export function DriftChart({
  scores,
  height = 160,
  showLabels = true,
  active,
  compact = false,
}: {
  scores: (number | undefined)[];
  height?: number;
  showLabels?: boolean;
  active?: number; // 1-based turn to highlight
  compact?: boolean; // narrower canvas so text stays legible in small cards
}) {
  const W = compact ? 300 : 440;
  const labels = compact ? ["Case", "Push", "Senior", "Rush", "Change"] : TURN_LABELS;
  const H = height;
  const padL = 26, padR = compact ? 22 : 18, padT = 16, padB = showLabels ? 30 : 12;
  const x = (i: number) => padL + (i * (W - padL - padR)) / (scores.length - 1);
  const y = (v: number) => padT + (1 - v / 100) * (H - padT - padB);
  const pts = scores.map((s, i) => (s === undefined ? null : ([x(i), y(s)] as const)));
  const path = pts
    .filter(Boolean)
    .map((p, i) => `${i === 0 ? "M" : "L"}${p![0].toFixed(1)},${p![1].toFixed(1)}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`Sycophancy score by turn: ${scores.map((s) => s ?? "n/a").join(", ")}`}>
      {/* Score above 40 is shaded: that is where the monitor flags a reply. */}
      <rect x={padL} y={y(100)} width={W - padL - padR} height={y(40) - y(100)} className="fill-ink/[0.035]" />
      {[0, 40, 100].map((v) => (
        <g key={v}>
          <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} className="stroke-line" />
          <text x={padL - 6} y={y(v) + 3.5} textAnchor="end" className="fill-muted text-[9px] font-mono">
            {v}
          </text>
        </g>
      ))}
      <path d={path} fill="none" className="stroke-ink" strokeWidth={1.5} strokeLinejoin="round" />
      {pts.map((p, i) =>
        p ? (
          <g key={i}>
            <circle cx={p[0]} cy={p[1]} r={active === i + 1 ? 4.5 : 3} className={active === i + 1 ? "fill-ink" : "fill-paper stroke-ink"} strokeWidth={1.5} />
            <text x={p[0]} y={p[1] - 9} textAnchor="middle" className="fill-ink text-[10px] font-mono">
              {scores[i]}
            </text>
          </g>
        ) : null,
      )}
      {showLabels &&
        labels.map((l, i) => (
          <text
            key={l}
            x={i === 0 ? x(i) - 4 : i === labels.length - 1 ? x(i) + 4 : x(i)}
            y={H - 10}
            textAnchor={i === 0 ? "start" : i === labels.length - 1 ? "end" : "middle"}
            className="fill-muted text-[9px]"
          >
            {l}
          </text>
        ))}
    </svg>
  );
}
