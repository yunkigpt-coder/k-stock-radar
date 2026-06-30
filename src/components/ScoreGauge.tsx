import type { ScoreBlock } from "@/lib/types";

type ScoreGaugeProps = {
  score: number;
  label: string;
  variant?: "short" | "long" | "risk" | "confidence";
  compact?: boolean;
};

const colors = {
  short: "#246b78",
  long: "#59b69b",
  risk: "#b55a61",
  confidence: "#e7a83f"
};

export function ScoreGauge({ score, label, variant = "short", compact = false }: ScoreGaugeProps) {
  const color = colors[variant];

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${compact ? "h-12 w-12" : "h-16 w-16"} grid shrink-0 place-items-center rounded-full`}
        style={{ background: `conic-gradient(${color} ${score * 3.6}deg, #e4e7e0 0deg)` }}
        aria-label={`${label} ${score}점`}
      >
        <div className={`${compact ? "h-9 w-9 text-xs" : "h-12 w-12 text-sm"} grid place-items-center rounded-full bg-white font-bold text-ink`}>{score}</div>
      </div>
      <div>
        <p className="text-xs font-semibold text-zinc-500">{label}</p>
        <p className="text-sm font-semibold text-ink">{score} / 100</p>
      </div>
    </div>
  );
}

export function ScorePanel({ score, variant = "short" }: { score: ScoreBlock; variant?: ScoreGaugeProps["variant"] }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-soft">
      <ScoreGauge
        score={score.score}
        label={variant === "short" ? "단기 모멘텀" : variant === "long" ? "장기 펀더멘털" : variant === "risk" ? "리스크" : score.label}
        variant={variant}
      />
      <p className="mt-4 text-sm leading-6 text-zinc-700">{score.explanation}</p>
      <div className="mt-4 space-y-3">
        {score.breakdown.slice(0, 5).map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between gap-3 text-xs font-semibold text-zinc-600">
              <span>{item.label}</span>
              <span>{item.value}</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-zinc-100">
              <div
                className="h-2 rounded-full"
                style={{ width: `${item.value}%`, backgroundColor: variant === "risk" ? colors.risk : variant === "long" ? colors.long : colors.short }}
              />
            </div>
            <p className="mt-1 text-xs leading-5 text-zinc-500">{item.reason}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
