import YahooFinance from "yahoo-finance2";
import type { CandidateStock, PricePoint } from "./types";

export type ChartPeriod = "1M" | "3M" | "6M" | "1Y";

export type MarketQuote = {
  currentPrice: number;
  changeRate: number;
  priceUpdatedAt: string;
  quoteSource: string;
  symbol: string;
};

export type MarketSnapshot = {
  quote?: MarketQuote;
  priceHistory: PricePoint[];
  chartSource: string;
  chartReason?: string;
  symbol: string;
};

type YahooChartRow = {
  date?: unknown;
  open?: unknown;
  high?: unknown;
  low?: unknown;
  close?: unknown;
  volume?: unknown;
};

const yahooFinance = new YahooFinance();

const periodRanges: Record<ChartPeriod, { months: number; maxRows: number }> = {
  "1M": { months: 1, maxRows: 22 },
  "3M": { months: 3, maxRows: 66 },
  "6M": { months: 6, maxRows: 132 },
  "1Y": { months: 12, maxRows: 250 }
};

function normalizeCode(code: string) {
  return code.trim().padStart(6, "0");
}

export function getMarketSymbol(code: string, market?: string) {
  const normalizedCode = normalizeCode(code);
  const normalizedMarket = market?.trim().toUpperCase();
  if (normalizedMarket === "KOSDAQ") return `${normalizedCode}.KQ`;
  return `${normalizedCode}.KS`;
}

export const getYahooSymbol = getMarketSymbol;

function candidateSymbols(code: string, market?: string) {
  const preferred = getMarketSymbol(code, market);
  const fallback = preferred.endsWith(".KS") ? `${normalizeCode(code)}.KQ` : `${normalizeCode(code)}.KS`;
  return [preferred, fallback].filter((item, index, list) => list.indexOf(item) === index);
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function toDate(value: unknown) {
  if (value instanceof Date) return value;
  if (typeof value === "number" && Number.isFinite(value)) return new Date(value * 1000);
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

function toIsoDate(value: unknown) {
  const date = toDate(value);
  return date ? date.toISOString().slice(0, 10) : null;
}

function toUpdateTime(value: unknown) {
  return toDate(value)?.toISOString() ?? new Date().toISOString();
}

async function fetchQuoteBySymbol(symbol: string): Promise<MarketQuote> {
  const quote = await yahooFinance.quote(symbol, {}, { validateResult: false });
  const currentPrice = asNumber(quote.regularMarketPrice);
  if (currentPrice === null) throw new Error("quote price missing");

  return {
    currentPrice: Math.round(currentPrice),
    changeRate: asNumber(quote.regularMarketChangePercent) ?? 0,
    priceUpdatedAt: toUpdateTime(quote.regularMarketTime),
    quoteSource: "Yahoo Finance",
    symbol
  };
}

export async function fetchQuote(code: string, market?: string): Promise<MarketQuote> {
  let lastError: unknown;

  for (const symbol of candidateSymbols(code, market)) {
    try {
      return await fetchQuoteBySymbol(symbol);
    } catch (error) {
      lastError = error;
    }
  }

  console.warn("Yahoo Finance quote failed", lastError);
  throw new Error("현재가 데이터를 불러오지 못했습니다.");
}

export const fetchRealQuote = fetchQuote;

async function fetchHistoryBySymbol(symbol: string, period: ChartPeriod): Promise<PricePoint[]> {
  const config = periodRanges[period];
  const period1 = new Date();
  period1.setMonth(period1.getMonth() - config.months);
  period1.setDate(period1.getDate() - 7);

  const result = (await yahooFinance.chart(
    symbol,
    {
      period1,
      period2: new Date(),
      interval: "1d"
    },
    { validateResult: false }
  )) as { quotes?: YahooChartRow[] };

  const quotes = Array.isArray(result.quotes) ? result.quotes : [];
  const rows = quotes
    .map((row): PricePoint | null => {
      const date = toIsoDate(row.date);
      const close = asNumber(row.close);
      if (!date || close === null) return null;

      const open = asNumber(row.open);
      const high = asNumber(row.high);
      const low = asNumber(row.low);
      const volume = asNumber(row.volume);

      return {
        date,
        open: open === null ? undefined : Math.round(open),
        high: high === null ? undefined : Math.round(high),
        low: low === null ? undefined : Math.round(low),
        close: Math.round(close),
        volume: volume === null ? 0 : Math.round(volume)
      };
    })
    .filter((row): row is PricePoint => Boolean(row))
    .filter((row) => new Date(row.date).getTime() <= Date.now())
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-config.maxRows);

  if (rows.length < 5) throw new Error("과거 시세 데이터가 부족합니다.");
  return rows;
}

export async function fetchPriceHistory(code: string, market: string | undefined, period: ChartPeriod): Promise<PricePoint[]> {
  let lastError: unknown;

  for (const symbol of candidateSymbols(code, market)) {
    try {
      return await fetchHistoryBySymbol(symbol, period);
    } catch (error) {
      lastError = error;
    }
  }

  console.warn("Yahoo Finance chart failed", lastError);
  throw new Error("과거 시세 데이터를 불러오지 못했습니다.");
}

export const fetchRealPriceHistory = fetchPriceHistory;

export async function fetchMarketSnapshot(code: string, market: string | undefined, period: ChartPeriod): Promise<MarketSnapshot> {
  const [quoteResult, historyResult] = await Promise.allSettled([fetchQuote(code, market), fetchPriceHistory(code, market, period)]);

  const quote = quoteResult.status === "fulfilled" ? quoteResult.value : undefined;
  const priceHistory = historyResult.status === "fulfilled" ? historyResult.value : [];
  const symbol = quote?.symbol ?? getMarketSymbol(code, market);

  return {
    quote,
    priceHistory,
    chartSource: priceHistory.length >= 5 ? "Yahoo Finance 일별 시세" : "사용 불가",
    chartReason: priceHistory.length >= 5 ? undefined : "과거 시세 데이터를 불러오지 못했습니다. 현재가만 표시합니다.",
    symbol
  };
}

export async function fetchCandidateQuotes(candidates: CandidateStock[], maxCount = 20): Promise<CandidateStock[]> {
  const targets = candidates.slice(0, maxCount);
  const quotes = await Promise.allSettled(targets.map((candidate) => fetchQuote(candidate.code, candidate.market)));

  const quoteMap = new Map<string, MarketQuote>();
  quotes.forEach((result, index) => {
    if (result.status === "fulfilled") quoteMap.set(targets[index].code, result.value);
  });

  return candidates.map((candidate) => {
    const quote = quoteMap.get(candidate.code);
    if (!quote) {
      return {
        ...candidate,
        currentPrice: 0,
        changeRate: 0,
        quotePrice: undefined,
        quoteChangeRate: undefined,
        priceDataSource: "mock",
        quoteSource: undefined,
        isDemoPrice: true,
        isMarketData: false
      };
    }

    return {
      ...candidate,
      currentPrice: quote.currentPrice,
      changeRate: quote.changeRate,
      quotePrice: quote.currentPrice,
      quoteChangeRate: quote.changeRate,
      priceDataSource: "yahoo",
      priceUpdatedAt: quote.priceUpdatedAt,
      quoteUpdatedAt: quote.priceUpdatedAt,
      quoteSource: quote.quoteSource,
      isDemoPrice: false,
      isMarketData: true
    };
  });
}
