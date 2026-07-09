import type { ScoreBlock, ScoreBreakdownItem, Sentiment } from "./types";

type WeightedSignal = {
  label: string;
  value: number;
  weight: number;
  reason: string;
};

const clampScore = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export const sentimentScore = (sentiment: Sentiment) => {
  if (sentiment === "positive") return 78;
  if (sentiment === "negative") return 32;
  return 55;
};

export function buildScoreBlock(label: string, explanation: string, signals: WeightedSignal[]): ScoreBlock {
  const weightedSum = signals.reduce((sum, signal) => sum + signal.value * signal.weight, 0);
  const weightTotal = signals.reduce((sum, signal) => sum + signal.weight, 0);
  const score = clampScore(weightedSum / Math.max(weightTotal, 1));
  const breakdown: ScoreBreakdownItem[] = signals.map((signal) => ({
    label: signal.label,
    value: clampScore(signal.value),
    reason: signal.reason
  }));

  return { score, label, explanation, breakdown };
}

export function scoreTone(score: number) {
  if (score >= 75) return "긍정 우위";
  if (score >= 60) return "관찰 필요";
  if (score >= 45) return "중립";
  return "보수적 해석";
}

export function riskTone(score: number) {
  if (score >= 70) return "높음";
  if (score >= 45) return "보통";
  return "낮음";
}
