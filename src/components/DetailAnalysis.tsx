"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { AlertTriangle, BarChart3, Building2, Newspaper, Scale, ShieldAlert, Sparkles, type LucideIcon } from "lucide-react";
import { formatDateTime, formatPercent, formatPrice } from "@/lib/format";
import type { CompanyAnalysis, DisclosureItem, NewsItem } from "@/lib/types";
import { DataModeBadge, SentimentBadge } from "./Badge";
import { ScorePanel } from "./ScoreGauge";
import { StockChart } from "./StockChart";

type DetailTab = "overview" | "news" | "dart" | "financials" | "chart" | "strategy" | "risk";

const tabs: Array<{ id: DetailTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "news", label: "News" },
  { id: "dart", label: "DART" },
  { id: "financials", label: "Financials" },
  { id: "chart", label: "Chart" },
  { id: "strategy", label: "Strategy" },
  { id: "risk", label: "Risk" }
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

export function DetailAnalysis({ analysis }: { analysis: CompanyAnalysis }) {
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");

  return (
    <div className="space-y-6">
      <section className="sticky top-0 z-10 rounded-lg border border-zinc-200 bg-white/95 p-5 shadow-soft backdrop-blur">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold text-ink">{analysis.name}</h2>
              <span className="text-sm font-semibold text-zinc-500">{analysis.code}</span>
              <DataModeBadge mode={analysis.dataMode} />
            </div>
            <p className="mt-1 text-sm font-semibold text-zinc-500">
              {analysis.sector} · {analysis.marketCap}
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-700">{analysis.overview}</p>
          </div>
          <div className="grid min-w-72 gap-3 rounded-lg border border-zinc-200 bg-slatepanel p-4 sm:grid-cols-2">
            <SummaryMetric label="현재가" value={formatPrice(analysis.currentPrice)} />
            <SummaryMetric label="등락률" value={formatPercent(analysis.changeRate)} tone={analysis.changeRate >= 0 ? "rose" : "teal"} />
            <SummaryMetric label="신뢰도" value={`${analysis.confidence}점`} />
            <SummaryMetric label="근거 수" value={`뉴스 ${analysis.news.length} · 공시 ${analysis.disclosures.length}`} />
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <ScoreMini title="단기 모멘텀" score={analysis.shortScore.score} reason={analysis.shortScore.breakdown[0]?.reason} tone="teal" />
          <ScoreMini title="장기 펀더멘털" score={analysis.longScore.score} reason={analysis.longScore.breakdown[0]?.reason} tone="mint" />
          <ScoreMini title="리스크 레벨" score={analysis.riskScore.score} reason={analysis.riskScore.breakdown[0]?.reason} tone="amber" />
        </div>
      </section>

      <nav className="flex gap-2 overflow-x-auto rounded-lg border border-zinc-200 bg-white p-2 shadow-soft">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-bold transition ${activeTab === tab.id ? "bg-marine text-white" : "text-zinc-500 hover:bg-paper hover:text-marine"}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "overview" ? <OverviewTab analysis={analysis} /> : null}
      {activeTab === "news" ? <NewsTab news={analysis.news} /> : null}
      {activeTab === "dart" ? <DartTab disclosures={analysis.disclosures} /> : null}
      {activeTab === "financials" ? <FinancialsTab analysis={analysis} /> : null}
      {activeTab === "chart" ? <ChartTab analysis={analysis} /> : null}
      {activeTab === "strategy" ? <StrategyTab analysis={analysis} /> : null}
      {activeTab === "risk" ? <RiskTab analysis={analysis} /> : null}

      <SoftNotice />
    </div>
  );
}

function SummaryMetric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "rose" | "teal" }) {
  const color = tone === "rose" ? "text-rosewood" : tone === "teal" ? "text-marine" : "text-ink";
  return (
    <div>
      <p className="text-xs font-semibold text-zinc-500">{label}</p>
      <p className={`mt-1 text-sm font-bold ${color}`}>{value}</p>
    </div>
  );
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
          <p className="text-xs font-bold text-marine">데이터 기반 해석</p>
          <p className="mt-1">{analysis.confidenceReason}</p>
        </div>
      </InfoCard>
      <InfoCard title="리서치 스탠스" icon={Scale}>
        <p>{analysis.finalComment}</p>
        <div className="mt-4 rounded-lg border border-saffron/30 bg-saffron/10 p-3">
          <p className="text-xs font-bold text-amber-700">LLM 해석</p>
          <p className="mt-1">LLM은 수집된 입력 데이터를 정리하고 설명하는 역할만 수행합니다.</p>
        </div>
      </InfoCard>
    </section>
  );
}

function NewsTab({ news }: { news: NewsItem[] }) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {news.map((item) => (
        <EvidenceCard
          key={`${item.title}-${item.publishedAt}`}
          title={item.title}
          source={item.source}
          date={item.publishedAt}
          sentiment={item.sentiment}
          impact="뉴스 모멘텀"
          summary={item.summary}
          reason={
            item.sentiment === "positive"
              ? "단기 모멘텀에 우호적인 신호로 반영했습니다."
              : item.sentiment === "negative"
                ? "리스크와 변동성 항목에 주의 신호로 반영했습니다."
                : "중립 근거로 분류하고 추가 확인 대상으로 남겼습니다."
          }
        />
      ))}
    </section>
  );
}

function DartTab({ disclosures }: { disclosures: DisclosureItem[] }) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {disclosures.map((item) => (
        <EvidenceCard
          key={`${item.title}-${item.reportedAt}`}
          title={item.title}
          source={item.type}
          date={item.reportedAt}
          sentiment={item.sentiment}
          impact={`공시 영향도 ${item.impact}`}
          summary={item.summary}
          reason={item.impact === "high" ? "점수 반영 강도를 높여 보고, 원문 확인 우선순위도 함께 올렸습니다." : "보조 근거로 반영했습니다."}
        />
      ))}
    </section>
  );
}

function FinancialsTab({ analysis }: { analysis: CompanyAnalysis }) {
  return (
    <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <InfoCard title="재무 및 밸류에이션" icon={Building2}>
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
      <InfoCard title="장기 펀더멘털 근거" icon={BarChart3}>
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
    <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <StockChart data={analysis.priceHistory} />
      <InfoCard title="차트 해석" icon={BarChart3}>
        <p>{analysis.shortComment}</p>
        <div className="mt-4 space-y-3">
          {analysis.shortScore.breakdown.slice(0, 4).map((item) => (
            <ReasonRow key={item.label} label={item.label} value={item.value} reason={item.reason} />
          ))}
        </div>
      </InfoCard>
    </section>
  );
}

function StrategyTab({ analysis }: { analysis: CompanyAnalysis }) {
  return (
    <section className="grid gap-5 lg:grid-cols-2">
      <InfoCard title="3C 분석" icon={Sparkles}>
        <p>
          <span className="font-bold text-ink">Company</span> · {analysis.threeC.company}
        </p>
        <p className="mt-3">
          <span className="font-bold text-ink">Customer</span> · {analysis.threeC.customer}
        </p>
        <p className="mt-3">
          <span className="font-bold text-ink">Competitor</span> · {analysis.threeC.competitor}
        </p>
      </InfoCard>
      <InfoCard title="SWOT 분석" icon={Scale}>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Strengths", analysis.swot.strengths],
            ["Weaknesses", analysis.swot.weaknesses],
            ["Opportunities", analysis.swot.opportunities],
            ["Threats", analysis.swot.threats]
          ].map(([label, items]) => (
            <div key={label as string}>
              <p className="font-bold text-ink">{label as string}</p>
              <ul className="mt-2 space-y-1">
                {(items as string[]).map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </InfoCard>
      <InfoCard title="단기 관점" icon={Newspaper}>
        <p>{analysis.shortComment}</p>
      </InfoCard>
      <InfoCard title="장기 관점" icon={Building2}>
        <p>{analysis.longComment}</p>
      </InfoCard>
    </section>
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

function EvidenceCard({
  title,
  source,
  date,
  sentiment,
  impact,
  summary,
  reason
}: {
  title: string;
  source: string;
  date: string;
  sentiment: NewsItem["sentiment"];
  impact: string;
  summary: string;
  reason: string;
}) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-ink">{title}</h3>
          <p className="mt-1 text-xs font-semibold text-zinc-500">
            {source} · {formatDateTime(date)} · {impact}
          </p>
        </div>
        <SentimentBadge sentiment={sentiment} />
      </div>
      <p className="mt-4 text-sm leading-6 text-zinc-700">{summary}</p>
      <div className="mt-4 rounded-lg bg-paper p-3 text-xs leading-5 text-zinc-600">
        <span className="font-bold text-marine">점수 반영 이유</span> · {reason}
      </div>
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
  return (
    <div className="rounded-lg border border-zinc-200 bg-paper p-3 text-xs font-medium leading-5 text-zinc-600">
      데이터 기반 항목은 뉴스, 공시, 재무, 주가 입력을 정리한 결과이고, LLM 해석 항목은 해당 입력을 바탕으로 생성된 설명입니다.
    </div>
  );
}
