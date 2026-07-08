import type { AnalysisResult } from "@/lib/analyzer";

function colorFor(score: number) {
  if (score >= 80) return "var(--success)";
  if (score >= 60) return "var(--primary)";
  if (score >= 40) return "var(--warning)";
  return "var(--destructive)";
}

export function TrustGauge({ result }: { result: AnalysisResult }) {
  const score = result.trustScore;
  const color = colorFor(score);
  const size = 220;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <div
          className="animate-pulse-ring absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
            opacity: 0.35,
          }}
        />
        <svg width={size} height={size} className="relative -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="var(--border)"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease, stroke 0.5s" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className="font-display text-5xl font-bold tabular-nums"
            style={{ color }}
          >
            {score}
          </div>
          <div className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Trust Score
          </div>
        </div>
      </div>
      <div
        className="mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold"
        style={{ borderColor: color, color }}
      >
        <span className="size-2 rounded-full" style={{ background: color }} />
        {result.riskLevel} Risk · {result.confidence}% confidence
      </div>
    </div>
  );
}
