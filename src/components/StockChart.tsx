"use client";

import { useEffect, useMemo, useState } from "react";
import { Area, Bar, CartesianGrid, ComposedChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ChartDataSource, ChartStatus, PricePoint } from "@/lib/types";
import { formatDateTime, formatNumber, formatPrice } from "@/lib/format";
import { PriceTable } from "./PriceTable";

type ChartPeriod = "1M" | "3M" | "6M" | "1Y";

type ChartApiResponse =
  | {
      success: true;
      priceHistory: PricePoint[];
      source: string;
      symbol: string;
      period: ChartPeriod;
      chartSource?: string;
      quote?: { currentPrice: number; changeRate: number; priceUpdatedAt: string; quoteSource: string };
    }
  | { success: false; reason?: string; chartSource?: string; quote?: { currentPrice: number; changeRate: number; priceUpdatedAt: string; quoteSource: string } };

const periodLabels: Record<ChartPeriod, string> = {
  "1M": "1개월",
  "3M": "3개월",
  "6M": "6개월",
  "1Y": "1년"
};

export function StockChart({
  code,
  market,
  data,
  initialSource = "actual",
  chartSource = "사용 불가",
  chartStatus = "unavailable",
  currentPrice,
  priceUpdatedAt,
  quoteSource,
  isMarketData,
  fallbackReason
}: {
  code: string;
  market: string;
  data: PricePoint[];
  initialSource?: ChartDataSource;
  chartSource?: string;
  chartStatus?: ChartStatus;
  currentPrice?: number;
  priceUpdatedAt?: string;
  quoteSource?: string;
  isMarketData?: boolean;
  fallbackReason?: string;
}) {
  const [period, setPeriod] = useState<ChartPeriod>("3M");
  const [chartData, setChartData] = useState<PricePoint[]>(chartStatus === "market" ? data : []);
  const [dataSource, setDataSource] = useState<ChartDataSource>(initialSource);
  const [activeChartSource, setActiveChartSource] = useState(chartSource);
  const [activeChartStatus, setActiveChartStatus] = useState<ChartStatus>(chartStatus);
  const [status, setStatus] = useState<"idle" | "loading" | "unavailable">("idle");
  const [message, setMessage] = useState(fallbackReason ?? "");
  const [activeQuotePrice, setActiveQuotePrice] = useState(currentPrice);
  const [activeQuoteUpdatedAt, setActiveQuoteUpdatedAt] = useState(priceUpdatedAt);
  const [activeQuoteSource, setActiveQuoteSource] = useState(quoteSource);

  useEffect(() => {
    setChartData(chartStatus === "market" ? data : []);
    setDataSource(initialSource);
    setActiveChartSource(chartSource);
    setActiveChartStatus(chartStatus);
    setMessage(fallbackReason ?? "");
    setActiveQuotePrice(currentPrice);
    setActiveQuoteUpdatedAt(priceUpdatedAt);
    setActiveQuoteSource(quoteSource);
  }, [chartSource, chartStatus, currentPrice, data, fallbackReason, initialSource, priceUpdatedAt, quoteSource]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadChart() {
      if (!code || !market) return;

      setStatus("loading");
      try {
        const params = new URLSearchParams({ code, market, period });
        const response = await fetch(`/api/chart?${params.toString()}`, { signal: controller.signal, cache: "no-store" });
        const payload = (await response.json()) as ChartApiResponse;

        if (payload.quote) {
          setActiveQuotePrice(payload.quote.currentPrice);
          setActiveQuoteUpdatedAt(payload.quote.priceUpdatedAt);
          setActiveQuoteSource(payload.quote.quoteSource);
        }

        if (!response.ok || !payload.success || payload.priceHistory.length < 5) {
          throw new Error(payload.success ? "과거 시세 데이터가 부족합니다." : payload.reason ?? "과거 시세 데이터를 불러오지 못했습니다.");
        }

        setChartData(payload.priceHistory);
        setDataSource("actual");
        setActiveChartSource(payload.chartSource ?? "Yahoo Finance 일별 시세");
        setActiveChartStatus("market");
        setStatus("idle");
        setMessage("");
      } catch (error) {
        if (controller.signal.aborted) return;
        console.warn("chart load failed", error);
        setChartData([]);
        setDataSource("actual");
        setActiveChartSource("사용 불가");
        setActiveChartStatus("unavailable");
        setStatus("unavailable");
        setMessage(error instanceof Error ? error.message : "과거 시세 데이터를 불러오지 못했습니다.");
      }
    }

    void loadChart();

    return () => controller.abort();
  }, [code, market, period]);

  const canDrawChart = activeChartStatus === "market" && dataSource === "actual" && chartData.length >= 5;
  const visibleData = useMemo(() => {
    const count = period === "1M" ? 22 : period === "3M" ? 66 : period === "6M" ? 132 : 250;
    return canDrawChart ? chartData.slice(-count) : [];
  }, [canDrawChart, chartData, period]);
  const average = visibleData.length > 0 ? Math.round(visibleData.reduce((sum, item) => sum + item.close, 0) / visibleData.length) : 0;
  const lastClose = visibleData.at(-1)?.close;
  const quoteLabel = activeQuoteSource ?? (isMarketData ? "Yahoo Finance" : "데이터 없음");
  const quotePrice = activeQuotePrice && activeQuotePrice > 0 ? activeQuotePrice : undefined;

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-soft">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold text-zinc-500">일별 주가 / 거래량</p>
              <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${canDrawChart ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-zinc-200 bg-paper text-zinc-600"}`}>
                {canDrawChart ? "시장 데이터 차트" : "차트 데이터 없음"}
              </span>
              {status === "loading" ? <span className="text-[11px] font-bold text-zinc-500">불러오는 중</span> : null}
            </div>
            <p className="mt-2 text-xs font-bold text-zinc-500">현재가</p>
            <p className="text-2xl font-bold text-ink">{quotePrice ? formatPrice(quotePrice) : "가격 데이터 없음"}</p>
            <div className="mt-1 grid gap-1 text-xs font-medium text-zinc-500 sm:grid-cols-2">
              <span>현재가: {quotePrice ? formatPrice(quotePrice) : "-"}</span>
              <span>최근 종가: {canDrawChart && lastClose ? formatPrice(lastClose) : "-"}</span>
            </div>
            <div className="mt-1 grid gap-1 text-xs font-medium text-zinc-500 sm:grid-cols-2">
              <span>현재가 출처: {quoteLabel}</span>
              <span>차트 출처: {canDrawChart ? activeChartSource : "사용 불가"}</span>
            </div>
            {activeQuoteUpdatedAt ? <p className="mt-1 text-xs font-medium text-zinc-500">업데이트 {formatDateTime(activeQuoteUpdatedAt)}</p> : null}
            {canDrawChart ? <p className="mt-1 text-xs font-medium text-zinc-500">현재가는 지연 시세이며, 최근 종가는 일별 차트의 마지막 종가입니다.</p> : null}
          </div>
          <div className="flex rounded-md border border-zinc-200 bg-paper p-1">
            {(["1M", "3M", "6M", "1Y"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPeriod(item)}
                className={`rounded px-3 py-1.5 text-xs font-bold transition ${period === item ? "bg-white text-marine shadow-sm" : "text-zinc-500 hover:text-marine"}`}
              >
                {periodLabels[item]}
              </button>
            ))}
          </div>
        </div>
        <div className="h-80 w-full">
          {canDrawChart ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={visibleData} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid stroke="#e4e7e0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#68707a" }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="price" domain={["dataMin - 1500", "dataMax + 1500"]} tick={{ fontSize: 12, fill: "#68707a" }} tickLine={false} axisLine={false} width={58} />
                <YAxis yAxisId="volume" orientation="right" hide />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #d7dbd3", boxShadow: "0 10px 30px rgba(32, 45, 58, 0.12)", fontSize: 12 }}
                  formatter={(value: unknown, name: unknown) => [name === "volume" ? formatNumber(Number(value)) : formatPrice(Number(value)), name === "close" ? "종가" : "거래량"]}
                />
                <ReferenceLine yAxisId="price" y={average} stroke="#d99a34" strokeDasharray="4 4" label={{ value: "평균", fill: "#9a6a1f", fontSize: 11 }} />
                {lastClose ? <ReferenceLine yAxisId="price" y={lastClose} stroke="#0f5f68" strokeDasharray="3 5" label={{ value: "최근 종가", fill: "#0f5f68", fontSize: 11 }} /> : null}
                <Area yAxisId="price" type="monotone" dataKey="close" stroke="#0f5f68" fill="#62bda8" fillOpacity={0.16} strokeWidth={3} />
                <Bar yAxisId="volume" dataKey="volume" fill="#d99a34" opacity={0.22} barSize={16} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-md bg-paper px-4 text-center text-sm font-semibold leading-6 text-zinc-600">
              {status === "loading" ? "과거 시세 데이터를 불러오는 중입니다." : message || "과거 시세 데이터를 불러오지 못했습니다. 현재가만 표시합니다."}
            </div>
          )}
        </div>
      </section>

      {canDrawChart ? <PriceTable data={visibleData} /> : null}
    </div>
  );
}
