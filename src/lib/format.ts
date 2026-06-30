import type { DataMode, Sentiment } from "./types";

export const formatPrice = (value: number) => `${new Intl.NumberFormat("ko-KR").format(value)}원`;

export const formatPercent = (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;

export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));

export const sentimentLabel: Record<Sentiment, string> = {
  positive: "긍정",
  neutral: "중립",
  negative: "주의"
};

export const dataModeLabel: Record<DataMode, string> = {
  mock: "Demo Mode",
  hybrid: "Hybrid Mode",
  live: "Live Mode"
};
