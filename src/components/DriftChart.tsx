import { TURN_LABELS } from "@/lib/agents";

// Sycophancy score per turn as a small line chart. Pure SVG so it renders
// identically on the server, in both themes, and in print.
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
  const W = compact ? 300 : 520;
  const labels = compact ? ["Case", "Push", "Senior", "Rush", "Evidence"] : TURN_LABELS;
  const H = height;
  const padL = 30, padR = compact ? 22 : 12, padT = 12, padB = showLabels ? 34 : 14;
  const x = (i: number) => padL + (i * (W - padL - padR)) / (scores.length - 1);
  const y = (v: number) => padT + (1 - v / 100) * (H - padT - padB);
  const pts = scores.map((s, i) => (s === undefined ? null : [x(i), y(s)] as const));
  const path = pts
    .filter(Boolean)
    .map((p, i) => `${i === 0 ? "M" : "L"}${p![0].toFixed(1)},${p![1].toFixed(1)}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`Sycophancy score by turn: ${scores.map((s) => s ?? "n/a").join(", ")}`}>
      {/* Bands */}
      <rect x={padL} y={y(100)} width={W - padL - padR} height={y(70) - y(100)} className="fill-red/[0.07]" />
      <rect x={padL} y={y(70)} width={W - padL - padR} height={y(40) - y(70)} className="fill-amber/[0.08]" />
      <rect x={padL} y={y(40)} width={W - padL - padR} height={y(0) - y(40)} className="fill-safe/[0.06]" />
      {[0, 40, 70, 100].map((v) => (
        <g key={v}>
          <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} className="stroke-line" strokeDasharray={v === 0 || v === 100 ? "" : "3 3"} />
          <text x={padL - 6} y={y(v) + 3.5} textAnchor="end" className="fill-muted text-[10px] font-mono">
            {v}
          </text>
        </g>
      ))}
      {/* Evidence turn marker */}
      <line x1={x(4)} x2={x(4)} y1={padT} y2={H - padB} className="stroke-judge/50" strokeDasharray="2 3" />
      <path d={path} fill="none" className="stroke-monitor" strokeWidth={2.25} strokeLinejoin="round" />
      {pts.map((p, i) =>
        p ? (
          <g key={i}>
            <circle cx={p[0]} cy={p[1]} r={active === i + 1 ? 6 : 4} className={active === i + 1 ? "fill-monitor" : "fill-card stroke-monitor"} strokeWidth={2} />
            <text x={p[0]} y={p[1] - 10} textAnchor="middle" className="fill-ink text-[11px] font-mono font-medium">
              {scores[i]}
            </text>
          </g>
        ) : null,
      )}
      {showLabels &&
        labels.map((l, i) => (
          <text key={l} x={x(i)} y={H - 12} textAnchor="middle" className={`text-[10px] ${i === 4 ? "fill-judge" : "fill-muted"}`}>
            {l}
          </text>
        ))}
    </svg>
  );
}
