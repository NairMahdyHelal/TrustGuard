import type { AnalysisResult, GraphNode } from "@/lib/analyzer";

const TYPE_COLORS: Record<GraphNode["type"], string> = {
  user: "var(--primary)",
  recipient: "var(--warning)",
  website: "var(--chart-5)",
  message: "var(--chart-3)",
  scam: "var(--destructive)",
  amount: "var(--success)",
};

function riskColor(risk: number) {
  if (risk >= 70) return "var(--destructive)";
  if (risk >= 40) return "var(--warning)";
  if (risk >= 20) return "var(--primary)";
  return "var(--success)";
}

export function TrustGraph({ result }: { result: AnalysisResult }) {
  const { nodes, edges } = result.graph;
  const W = 640,
    H = 360;
  const cx = W / 2,
    cy = H / 2;

  // Place "user" left, others around
  const positions: Record<string, { x: number; y: number }> = {};
  const others = nodes.filter((n) => n.id !== "user");
  positions["user"] = { x: 90, y: cy };
  const radius = 150;
  others.forEach((n, i) => {
    const angle =
      -Math.PI / 2 + Math.PI * (i / Math.max(1, others.length - 1 || 1));
    positions[n.id] = {
      x: cx + 90 + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    };
  });

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border bg-[var(--surface)]/60">
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" />
      <svg viewBox={`0 0 ${W} ${H}`} className="relative h-full w-full">
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" opacity="0.5" />
          </marker>
        </defs>
        {edges.map((e, i) => {
          const a = positions[e.from],
            b = positions[e.to];
          if (!a || !b) return null;
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2 - 18;
          return (
            <g key={i} style={{ color: riskColor(e.risk) }}>
              <path
                d={`M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`}
                fill="none"
                stroke={riskColor(e.risk)}
                strokeWidth={1.5 + e.risk / 50}
                strokeOpacity={0.55}
                markerEnd="url(#arrow)"
              />
              {e.label && (
                <text
                  x={mx}
                  y={my - 4}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                  fontSize="10"
                >
                  {e.label}
                </text>
              )}
            </g>
          );
        })}
        {nodes.map((n) => {
          const p = positions[n.id];
          if (!p) return null;
          const fill = TYPE_COLORS[n.type];
          const r = n.type === "user" ? 26 : 22;
          return (
            <g key={n.id} transform={`translate(${p.x}, ${p.y})`}>
              <circle r={r + 6} fill={fill} opacity={0.15} />
              <circle r={r} fill={fill} opacity={0.95} />
              <text
                y={r + 16}
                textAnchor="middle"
                className="fill-foreground"
                fontSize="11"
                fontFamily="var(--font-mono)"
              >
                {n.label}
              </text>
              <text
                y={4}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill="oklch(0.16 0.03 260)"
              >
                {n.type.toUpperCase().slice(0, 4)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
