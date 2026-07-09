import { clsx } from "clsx";
import { dataModeLabel, sentimentLabel } from "@/lib/format";
import type { DataMode, Sentiment } from "@/lib/types";

const sentimentStyles: Record<Sentiment, string> = {
  positive: "border-mint/30 bg-mint/10 text-marine",
  neutral: "border-saffron/30 bg-saffron/10 text-amber-700",
  negative: "border-rosewood/25 bg-rosewood/10 text-rosewood"
};

const modeStyles: Record<DataMode, string> = {
  mock: "border-zinc-200 bg-white text-zinc-600",
  hybrid: "border-marine/30 bg-marine/10 text-marine",
  live: "border-emerald-200 bg-emerald-50 text-emerald-700"
};

export function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  return <span className={clsx("inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold", sentimentStyles[sentiment])}>{sentimentLabel[sentiment]}</span>;
}

export function DataModeBadge({ mode }: { mode: DataMode }) {
  return <span className={clsx("inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold", modeStyles[mode])}>{dataModeLabel[mode]}</span>;
}

export function RiskBadge({ value }: { value: number }) {
  const style =
    value >= 70
      ? "border-rosewood/25 bg-rosewood/10 text-rosewood"
      : value >= 45
        ? "border-saffron/30 bg-saffron/10 text-amber-700"
        : "border-mint/30 bg-mint/10 text-marine";

  const label = value >= 70 ? "리스크 높음" : value >= 45 ? "리스크 보통" : "리스크 낮음";

  return <span className={clsx("inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold", style)}>{label}</span>;
}
