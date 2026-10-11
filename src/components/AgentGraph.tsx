import { AGENTS, type AgentMeta } from "@/lib/agents";

type NodeId = AgentMeta["id"];

// Layout: the conversation side on the left, the blind side on the right,
// separated by the Case Extractor, which is the only bridge between them.
const NODES: { id: NodeId; x: number; y: number }[] = [
  { id: "clinician", x: 70, y: 52 },
  { id: "reframe-assistant", x: 70, y: 152 },
  { id: "reframe-monitor", x: 70, y: 262 },
  { id: "reframe-extractor", x: 250, y: 152 },
  { id: "reframe-shadow", x: 430, y: 66 },
  { id: "reframe-advocate", x: 430, y: 152 },
  { id: "reframe-judge", x: 430, y: 250 },
];

const EDGES: [NodeId, NodeId][] = [
  ["clinician", "reframe-assistant"],
  ["reframe-assistant", "reframe-monitor"],
  ["reframe-assistant", "reframe-extractor"],
  ["clinician", "reframe-extractor"],
  ["reframe-extractor", "reframe-shadow"],
  ["reframe-extractor", "reframe-advocate"],
  ["reframe-advocate", "reframe-judge"],
  ["reframe-extractor", "reframe-judge"],
  ["reframe-shadow", "reframe-monitor"],
];

const pos = (id: NodeId) => NODES.find((n) => n.id === id)!;

export function AgentGraph({ active = [], compact = false }: { active?: NodeId[]; compact?: boolean }) {
  const lit = new Set(active);
  return (
    <svg viewBox="0 0 500 320" className="w-full h-auto" role="img" aria-label="Reframe agent architecture">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" className="fill-muted/60" />
        </marker>
      </defs>
      {/* Blind side */}
      <rect x={340} y={8} width={152} height={304} rx={14} className="fill-judge/[0.05] stroke-judge/30" strokeDasharray="4 4" />
      <text x={416} y={24} textAnchor="middle" className="fill-judge text-[9px] font-medium tracking-widest uppercase">
        Blind side
      </text>
      {/* Barrier */}
      <line x1={330} x2={330} y1={14} y2={306} className="stroke-extractor" strokeWidth={2} strokeDasharray="1 5" strokeLinecap="round" />
      {!compact && (
        <text x={330} y={14} textAnchor="middle" className="fill-extractor text-[9px] font-medium tracking-widest uppercase">
          barrier
        </text>
      )}
      {EDGES.map(([a, b]) => {
        const p = pos(a), q = pos(b);
        const on = lit.has(a) && lit.has(b);
        const dx = q.x - p.x, dy = q.y - p.y, len = Math.hypot(dx, dy);
        const r = 30;
        return (
          <line
            key={`${a}-${b}`}
            x1={p.x + (dx / len) * r}
            y1={p.y + (dy / len) * r}
            x2={q.x - (dx / len) * (r + 4)}
            y2={q.y - (dy / len) * (r + 4)}
            className={on ? "stroke-ink" : "stroke-muted/40"}
            strokeWidth={on ? 1.8 : 1.2}
            markerEnd="url(#arrow)"
          />
        );
      })}
      {NODES.map((n) => {
        const meta = AGENTS[n.id];
        const on = lit.size === 0 || lit.has(n.id);
        return (
          <g key={n.id} opacity={on ? 1 : 0.32} className="transition-opacity duration-300">
            <circle cx={n.x} cy={n.y} r={28} className={`fill-card stroke-${meta.colour}`} strokeWidth={lit.has(n.id) ? 3 : 1.6} />
            <circle cx={n.x} cy={n.y} r={6} className={`fill-${meta.colour}`} />
            <text x={n.x} y={n.y + 44} textAnchor="middle" className="fill-ink text-[11px] font-medium">
              {meta.short}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
