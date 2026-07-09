"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { AlertTriangle, BarChart3, Building2, ExternalLink, Newspaper, Scale, ShieldAlert, Sparkles, Tag, type LucideIcon } from "lucide-react";
import { formatDateTime, formatPercent, formatPrice } from "@/lib/format";
import type { CompanyAnalysis, DisclosureItem, NewsItem, NewsRange, PriceDataSource } from "@/lib/types";
import { DataModeBadge, SentimentBadge } from "./Badge";
import { ScorePanel } from "./ScoreGauge";
import { StockChart } from "./StockChart";

type DetailTab = "overview" | "news" | "dart" | "financials" | "chart" | "strategy" | "risk";

const tabs: Array<{ id: DetailTab; label: string }> = [
  { id: "overview", label: "요약" },
  { id: "news", label: "뉴스" },
  { id: "dart", label: "DART" },
  { id: "financials", label: "재무" },
  { id: "chart", label: "차트" },
  { id: "strategy", label: "전략 분석" },
  { id: "risk", label: "리스크" }
];

const financialRows: Array<[string, keyof CompanyAnalysis["financials"]]> = [
  ["매출", "revenue"],
  ["영업이익", "operatingProfit"],
  ["순이익", "netIncome"],
  ["매출 성장률", "revenueGrowth"],
  ["영업이익률", "operatingMargin"],
  ["부채비율", "debtRatio"],
  ["잉여현금흐름", "freeCashFlow"],
  ["ROE", "roe"],
  ["PER", "per"],
  ["PBR", "pbr"]
];

const rangeLabels: Record<NewsRange, string> = {
  "48h": "48시간 이내",
  "7d": "최근 7일",
  "30d": "최근 30일",
  latest: "참고 뉴스"
};

const impactLabels: Record<DisclosureItem["impact"], string> = {
  high: "높음",
  medium: "보통",
  low: "낮음"
};

export function DetailAnalysis({ analysis }: { analysis: CompanyAnalysis }) {
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const activeLabel = tabs.find((tab) => tab.id === activeTab)?.label ?? "요약";

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold text-ink">{analysis.name}</h2>
              <span className="text-sm font-semibold text-zinc-500">{analysis.code}</span>
              <DataModeBadge mode={analysis.dataMode} />
              <PriceBadge source={analysis.priceDataSource ?? "mock"} isMarketData={analysis.isMarketData} />
            </div>
            <p className="mt-1 text-sm font-semibold text-zinc-500">
              {analysis.sector} · {analysis.marketCap}
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-700">{analysis.overview}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-zinc-600">
              <SourcePill label={`뉴스: ${analysis.newsProvider ?? "없음"}`} active={analysis.newsProvider !== "없음"} />
              <SourcePill label={`DART: ${analysis.dartProvider ?? "없음"}`} active={analysis.dartProvider !== "없음"} />
            </div>
          </div>
          <div className="grid min-w-72 gap-3 rounded-lg border border-zinc-200 bg-slatepanel p-4 sm:grid-cols-2">
            <SummaryMetric label="현재가" value={analysis.isMarketData ? formatPrice(analysis.currentPrice) : "가격 데이터 없음"} caption={`현재가 출처: ${analysis.quoteSource ?? "없음"}`} />
            <SummaryMetric label="등락률" value={analysis.isMarketData ? formatPercent(analysis.changeRate) : "-"} tone={analysis.changeRate >= 0 ? "rose" : "teal"} caption={formatUpdateTime(analysis.priceUpdatedAt)} />
            <SummaryMetric label="신뢰도" value={`${analysis.confidence}점`} caption="공통 리서치 점수" />
            <SummaryMetric label="근거" value={`뉴스 ${analysis.news.length} · DART ${analysis.disclosures.length}`} caption="원문 링크 확인 자료만 표시" />
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <ScoreMini title="단기 모멘텀" score={analysis.shortScore.score} reason={analysis.shortScore.breakdown[0]?.reason} tone="teal" />
          <ScoreMini title="장기 잠재력" score={analysis.longScore.score} reason={analysis.longScore.breakdown[0]?.reason} tone="mint" />
          <ScoreMini title="리스크" score={analysis.riskScore.score} reason={analysis.riskScore.breakdown[0]?.reason} tone="amber" />
        </div>
      </section>

      <nav className="flex gap-2 overflow-x-auto rounded-lg border border-zinc-200 bg-white p-2 shadow-soft" role="tablist" aria-label="리서치 리포트 탭">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-bold transition ${activeTab === tab.id ? "bg-marine text-white" : "text-zinc-500 hover:bg-paper hover:text-marine"}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section role="tabpanel" className="space-y-3">
        <h3 className="text-lg font-bold text-ink">{activeLabel}</h3>
        {renderActiveTabContent(activeTab, analysis)}
      </section>

      <SoftNotice />
    </div>
  );
}

function formatUpdateTime(value?: string) {
  return value ? `업데이트 ${formatDateTime(value)}` : "업데이트 시각 없음";
}

function SourcePill({ label, active }: { label: string; active: boolean }) {
  return <span className={`rounded-full border px-2.5 py-1 ${active ? "border-marine/30 bg-marine/10 text-marine" : "border-zinc-200 bg-paper text-zinc-500"}`}>{label}</span>;
}

function PriceBadge({ source, isMarketData }: { source: PriceDataSource; isMarketData?: boolean }) {
  if (isMarketData || source === "yahoo" || source === "api") {
    return <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">지연 시세</span>;
  }
  return <span className="rounded-full border border-zinc-200 bg-paper px-2 py-0.5 text-[11px] font-bold text-zinc-600">가격 데이터 없음</span>;
}

function SummaryMetric({ label, value, caption, tone = "default" }: { label: string; value: string; caption?: string; tone?: "default" | "rose" | "teal" }) {
  const color = tone === "rose" ? "text-rosewood" : tone === "teal" ? "text-marine" : "text-ink";
  return (
    <div>
      <p className="text-xs font-semibold text-zinc-500">{label}</p>
      <p className={`mt-1 text-sm font-bold ${color}`}>{value}</p>
      {caption ? <p className="mt-1 text-[11px] font-medium leading-4 text-zinc-500">{caption}</p> : null}
    </div>
  );
}

function renderActiveTabContent(activeTab: DetailTab, analysis: CompanyAnalysis) {
  if (activeTab === "news") return <NewsTab news={analysis.news} message={analysis.newsStatusMessage} provider={analysis.newsProvider} />;
  if (activeTab === "dart") return <DartTab disclosures={analysis.disclosures} message={analysis.dartStatusMessage} provider={analysis.dartProvider} />;
  if (activeTab === "financials") return <FinancialsTab analysis={analysis} />;
  if (activeTab === "chart") return <ChartTab analysis={analysis} />;
  if (activeTab === "strategy") return <StrategyTab analysis={analysis} />;
  if (activeTab === "risk") return <RiskTab analysis={analysis} />;
  return <OverviewTab analysis={analysis} />;
}

function ScoreMini({ title, score, reason, tone }: { title: string; score: number; reason?: string; tone: "teal" | "mint" | "amber" }) {
  const bar = tone === "teal" ? "bg-marine" : tone === "mint" ? "bg-mint" : "bg-saffron";
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-ink">{title}</p>
        <p className="text-lg font-bold text-ink">{score}</p>
      </div>
      <div className="mt-2 h-2 rounded-full bg-zinc-100">
        <div className={`h-2 rounded-full ${bar}`} style={{ width: `${score}%` }} />
      </div>
      <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-600">{reason}</p>
    </div>
  );
}

function OverviewTab({ analysis }: { analysis: CompanyAnalysis }) {
  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
      <div className="grid gap-4 lg:grid-cols-3 xl:col-span-2">
        <ScorePanel score={analysis.shortScore} variant="short" />
        <ScorePanel score={analysis.longScore} variant="long" />
        <ScorePanel score={analysis.riskScore} variant="risk" />
      </div>
      <InfoCard title="기업 요약" icon={Building2}>
        <p>{analysis.overview}</p>
        <div className="mt-4 rounded-lg bg-paper p-3">
          <p className="text-xs font-bold text-marine">데이터 기준</p>
          <p className="mt-1">{analysis.confidenceReason}</p>
        </div>
      </InfoCard>
      <InfoCard title="핵심 근거" icon={Sparkles}>
        <ul className="space-y-2">
          {analysis.keyReasons.slice(0, 3).map((item) => (
            <li key={item}>- {item}</li>
          ))}
        </ul>
      </InfoCard>
      <InfoCard title="리스크 요약" icon={AlertTriangle}>
        <ul className="space-y-2">
          {analysis.majorRisks.slice(0, 3).map((item) => (
            <li key={item}>- {item}</li>
          ))}
        </ul>
      </InfoCard>
    </section>
  );
}

function NewsTab({ news, message, provider }: { news: NewsItem[]; message?: string; provider?: string }) {
  if (news.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center">
        <Newspaper className="mx-auto h-8 w-8 text-zinc-400" />
        <h3 className="mt-3 font-bold text-ink">확인된 뉴스가 없습니다.</h3>
        <p className="mt-2 text-sm text-zinc-600">{message ?? "검색 결과에서 신뢰할 수 있는 원문 링크를 찾지 못했습니다."}</p>
      </section>
    );
  }

  const providerLabel = provider && provider !== "없음" ? provider : "뉴스 API";
  const shouldShowMessage = Boolean(message && !message.includes("기반") && !message.includes("원문 링크가 확인된 뉴스"));

  return (
    <section className="space-y-4">
      <p className="rounded-lg border border-zinc-200 bg-paper p-3 text-xs font-semibold leading-5 text-zinc-600">
        {providerLabel} 기반으로 원문 링크가 확인된 뉴스만 표시합니다.
      </p>
      {shouldShowMessage ? <p className="rounded-lg border border-zinc-200 bg-paper p-3 text-xs font-semibold leading-5 text-zinc-600">{message}</p> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {news.map((item) => (
          <NewsArticleCard key={`${item.title}-${item.publishedAt}-${item.url}`} item={item} />
        ))}
      </div>
      <p className="rounded-lg border border-zinc-200 bg-paper p-3 text-xs font-medium leading-5 text-zinc-600">
        뉴스 요약은 원문 확인을 돕기 위한 참고 정보이며, 자세한 내용은 원문 링크에서 확인해 주세요.
      </p>
    </section>
  );
}

function NewsArticleCard({ item }: { item: NewsItem }) {
  const keywords = item.relatedKeywords ?? [];
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-soft">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <SentimentBadge sentiment={item.sentiment} />
        <span className="rounded-md border border-zinc-200 bg-paper px-2 py-1 text-xs font-semibold text-zinc-600">{rangeLabels[item.newsRange ?? "latest"]}</span>
      </div>
      <h3 className="text-base font-bold leading-6 text-ink">{item.title}</h3>
      <p className="mt-2 text-xs font-semibold text-zinc-500">
        출처: {item.source} · 발행 시각: {formatDateTime(item.publishedAt)}
      </p>
      <div className="mt-4 space-y-3 text-sm leading-6 text-zinc-700">
        <LabeledText label="요약">{item.summary}</LabeledText>
        <div className="rounded-lg bg-paper p-3">
          <p className="text-xs font-bold text-marine">점수 반영 이유</p>
          <p className="mt-1 text-xs leading-5 text-zinc-600">{item.impactReason}</p>
        </div>
        {keywords.length > 0 ? (
          <div>
            <p className="mb-2 flex items-center gap-1 text-xs font-bold text-zinc-500">
              <Tag className="h-3.5 w-3.5" />
              관련 키워드
            </p>
            <div className="flex flex-wrap gap-1.5">
              {keywords.map((keyword) => (
                <span key={keyword} className="rounded-md bg-slatepanel px-2 py-1 text-xs font-semibold text-zinc-600">
                  #{keyword}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      {item.url ? <ExternalButton href={item.url} /> : null}
    </article>
  );
}

function DartTab({ disclosures, message, provider }: { disclosures: DisclosureItem[]; message?: string; provider?: string }) {
  if (disclosures.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center">
        <ShieldAlert className="mx-auto h-8 w-8 text-zinc-400" />
        <h3 className="mt-3 font-bold text-ink">확인된 DART 공시가 없습니다.</h3>
        <p className="mt-2 text-sm text-zinc-600">{message ?? "검색 결과에서 신뢰할 수 있는 원문 링크를 찾지 못했습니다."}</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-zinc-200 bg-paper p-3 text-xs font-semibold leading-5 text-zinc-600">
        <p>{provider ?? "데이터 출처"} 기반으로 최신 공시 {disclosures.length}건을 확인했습니다.</p>
        <p>원문 링크가 확인된 자료만 표시합니다.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {disclosures.map((item) => (
          <DisclosureCard key={`${item.title}-${item.reportedAt}-${item.url}`} item={item} />
        ))}
      </div>
    </section>
  );
}

function DisclosureCard({ item }: { item: DisclosureItem }) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-ink">{item.title}</h3>
          <p className="mt-1 text-xs font-semibold text-zinc-500">
            기업명: {item.corpName ?? "-"} · 접수일: {item.reportedAt || "-"} · 공시 유형: {item.type} · 영향도: {impactLabels[item.impact]}
          </p>
        </div>
        <SentimentBadge sentiment={item.sentiment} />
      </div>
      <div className="mt-4 space-y-3 text-sm leading-6 text-zinc-700">
        <p>{item.summary}</p>
        <div className="rounded-lg bg-paper p-3 text-xs leading-5 text-zinc-600">
          <span className="font-bold text-marine">점수 반영 이유</span> · {item.impactReason}
        </div>
      </div>
      {item.url ? <ExternalButton href={item.url} /> : null}
    </article>
  );
}

function ExternalButton({ href }: { href: string }) {
  return (
    <div className="mt-5 border-t border-zinc-100 pt-4">
      <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md bg-marine px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink">
        원문 보기
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  );
}

function FinancialsTab({ analysis }: { analysis: CompanyAnalysis }) {
  return (
    <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <InfoCard title="재무 요약" icon={Building2}>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {financialRows.map(([label, key]) => (
            <div key={key} className="border-b border-zinc-100 pb-2">
              <p className="text-xs font-semibold text-zinc-500">{label}</p>
              <p className="mt-1 text-sm font-bold text-ink">{analysis.financials[key]}</p>
            </div>
          ))}
        </div>
        <p className="mt-4">{analysis.financials.valuationNote}</p>
      </InfoCard>
      <InfoCard title="장기 점수 근거" icon={BarChart3}>
        <div className="space-y-3">
          {analysis.longScore.breakdown.map((item) => (
            <ReasonRow key={item.label} label={item.label} value={item.value} reason={item.reason} />
          ))}
        </div>
      </InfoCard>
    </section>
  );
}

function ChartTab({ analysis }: { analysis: CompanyAnalysis }) {
  return (
    <StockChart
      code={analysis.code}
      market={analysis.market}
      data={analysis.priceHistory}
      initialSource={analysis.chartDataSource ?? "actual"}
      chartSource={analysis.chartSource ?? "사용 불가"}
      chartStatus={analysis.chartStatus ?? "unavailable"}
      currentPrice={analysis.currentPrice}
      priceUpdatedAt={analysis.priceUpdatedAt}
      quoteSource={analysis.quoteSource}
      isMarketData={analysis.isMarketData}
      fallbackReason={analysis.chartDataReason}
    />
  );
}

function StrategyTab({ analysis }: { analysis: CompanyAnalysis }) {
  const strategy = analysis.strategyCommentary ?? {
    shortTerm: analysis.shortComment,
    longTerm: analysis.longComment,
    watchPoints: "최근 실적 발표, DART 공시 원문, 업종 내 밸류에이션 비교를 함께 확인해야 합니다.",
    dataNote: "전략 분석은 업종, 뉴스, 공시, 재무 지표를 해석해 자동 생성했습니다."
  };

  return (
    <section className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-3">
        <InfoCard title="기업" icon={Building2}>
          <p>{analysis.threeC.company}</p>
        </InfoCard>
        <InfoCard title="고객" icon={Newspaper}>
          <p>{analysis.threeC.customer}</p>
        </InfoCard>
        <InfoCard title="경쟁" icon={Scale}>
          <p>{analysis.threeC.competitor}</p>
        </InfoCard>
      </div>
      <InfoCard title="SWOT 분석" icon={Sparkles}>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["강점", analysis.swot.strengths],
            ["약점", analysis.swot.weaknesses],
            ["기회", analysis.swot.opportunities],
            ["위협", analysis.swot.threats]
          ].map(([label, items]) => (
            <div key={label as string} className="rounded-lg border border-zinc-100 bg-paper p-4">
              <p className="font-bold text-ink">{label as string}</p>
              <ul className="mt-2 space-y-2">
                {(items as string[]).slice(0, 3).map((item) => (
                  <li key={item} className="text-sm leading-6 text-zinc-700">
                    - {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </InfoCard>
      <InfoCard title="전략적 해석" icon={BarChart3}>
        <div className="grid gap-4 md:grid-cols-3">
          <StrategyNote title="단기 관점" body={strategy.shortTerm} />
          <StrategyNote title="장기 관점" body={strategy.longTerm} />
          <StrategyNote title="확인 필요" body={strategy.watchPoints} />
        </div>
        {strategy.dataNote ? <p className="mt-4 rounded-lg bg-paper p-3 text-xs leading-5 text-zinc-500">{strategy.dataNote}</p> : null}
      </InfoCard>
    </section>
  );
}

function StrategyNote({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg bg-paper p-4">
      <p className="text-sm font-bold text-ink">{title}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-700">{body}</p>
    </div>
  );
}

function RiskTab({ analysis }: { analysis: CompanyAnalysis }) {
  return (
    <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <InfoCard title="AI 반대 의견" icon={ShieldAlert}>
        <ul className="space-y-2">
          {analysis.aiCounterOpinion.map((item) => (
            <li key={item}>- {item}</li>
          ))}
        </ul>
      </InfoCard>
      <InfoCard title="리스크 근거" icon={AlertTriangle}>
        <div className="space-y-3">
          {analysis.riskScore.breakdown.map((item) => (
            <ReasonRow key={item.label} label={item.label} value={item.value} reason={item.reason} />
          ))}
        </div>
      </InfoCard>
    </section>
  );
}

function LabeledText({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold text-zinc-500">{label}</p>
      <p className="mt-1 line-clamp-3">{children}</p>
    </div>
  );
}

function InfoCard({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5 text-sm leading-6 text-zinc-700 shadow-soft">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-marine" />
        <h3 className="text-lg font-bold text-ink">{title}</h3>
      </div>
      {children}
    </article>
  );
}

function ReasonRow({ label, value, reason }: { label: string; value: number; reason: string }) {
  return (
    <div className="rounded-lg bg-paper p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-ink">{label}</p>
        <p className="text-sm font-bold text-marine">{value}</p>
      </div>
      <p className="mt-1 text-xs leading-5 text-zinc-600">{reason}</p>
    </div>
  );
}

function SoftNotice() {
  return <div className="rounded-lg border border-zinc-200 bg-paper p-3 text-xs font-medium leading-5 text-zinc-600">이 리포트는 뉴스, 공시, 재무, 가격 데이터를 결합한 리서치 보조 자료입니다. 투자 조언이 아니며 원문 데이터 확인이 필요합니다.</div>;
}
