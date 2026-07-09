import { NextResponse } from "next/server";
import { fetchMarketSnapshot, getMarketSymbol, type ChartPeriod } from "@/lib/marketData";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const validPeriods = new Set<ChartPeriod>(["1M", "3M", "6M", "1Y"]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code")?.trim();
  const market = searchParams.get("market")?.trim() || "KOSPI";
  const periodParam = searchParams.get("period")?.trim().toUpperCase();
  const period = validPeriods.has(periodParam as ChartPeriod) ? (periodParam as ChartPeriod) : null;

  if (!code) {
    return NextResponse.json({ success: false, reason: "종목코드가 필요합니다.", chartSource: "사용 불가" }, { status: 400 });
  }

  if (!period) {
    return NextResponse.json({ success: false, reason: "차트 기간이 올바르지 않습니다.", chartSource: "사용 불가" }, { status: 400 });
  }

  try {
    const snapshot = await fetchMarketSnapshot(code, market, period);

    if (snapshot.priceHistory.length < 5) {
      return NextResponse.json({
        success: false,
        reason: snapshot.chartReason ?? "과거 시세 데이터를 불러오지 못했습니다.",
        quote: snapshot.quote,
        chartSource: "사용 불가",
        symbol: snapshot.symbol
      });
    }

    return NextResponse.json({
      success: true,
      source: "yahoo-finance2",
      symbol: snapshot.symbol,
      period,
      quote: snapshot.quote,
      priceHistory: snapshot.priceHistory,
      chartSource: snapshot.chartSource
    });
  } catch (error) {
    console.warn("chart route failed", error);
    return NextResponse.json({
      success: false,
      reason: "과거 시세 데이터를 불러오지 못했습니다.",
      chartSource: "사용 불가",
      symbol: getMarketSymbol(code, market)
    });
  }
}
