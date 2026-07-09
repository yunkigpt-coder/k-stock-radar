import type { DataMode, Sentiment } from "./types";

export const formatPrice = (value?: number | null) => {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return "-";
  return `${new Intl.NumberFormat("ko-KR").format(Math.round(value))}원`;
};

export const formatNumber = (value?: number | null) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-";
  return new Intl.NumberFormat("ko-KR").format(Math.round(value));
};

export const formatPercent = (value?: number | null) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-";
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
};

export const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
};

export const sentimentLabel: Record<Sentiment, string> = {
  positive: "긍정",
  neutral: "중립",
  negative: "부정"
};

export const dataModeLabel: Record<DataMode, string> = {
  mock: "Demo Mode",
  hybrid: "혼합 데이터",
  live: "시장 데이터"
};
