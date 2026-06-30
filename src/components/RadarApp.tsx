"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Database,
  FileSearch,
  Loader2,
  Radar,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  type LucideIcon
} from "lucide-react";
import { kospiUniverseSectors } from "@/data/kospi-universe";
import type { AnalyzeResponse, CandidateStock, CompanyAnalysis, DataMode, RecommendResponse } from "@/lib/types";
import { dataModeLabel, formatDateTime, formatPercent, formatPrice } from "@/lib/format";
import { CandidateCard } from "./CandidateCard";
import { DataModeBadge, RiskBadge } from "./Badge";
import { DetailAnalysis } from "./DetailAnalysis";

type View = "radar" | "report";
type SortMode = "short" | "long" | "risk";

const navItems: Array<{ id: View; label: string; icon: LucideIcon }> = [
  { id: "radar", label: "48시간 Radar", icon: Radar },
  { id: "report", label: "Research Report", icon: FileSearch }
];

const sortLabels: Record<SortMode, string> = {
  short: "단기순",
  long: "장기순",
  risk: "리스크 낮은순"
};

const emptyAnalysis: CompanyAnalysis = {
  name: "삼성전자",
  code: "005930",
  corpCode: "00593000",
  market: "KOSPI",
  sector: "반도체",
  industry: "메모리 반도체",
  themeTags: ["AI 메모리", "HBM", "반도체"],
  currentPrice: 72000,
  changeRate: 1.8,
  marketCap: "4,200,000억원",
  overview: "기본 분석 결과를 불러오는 중입니다.",
  dataMode: "mock",
  generatedAt: new Date().toISOString(),
  confidence: 72,
  confidenceReason: "초기 상태입니다.",
  shortScore: { score: 68, label: "단기 모멘텀", explanation: "", breakdown: [] },
  longScore: { score: 78, label: "장기 펀더멘털", explanation: "", breakdown: [] },
  riskScore: { score: 39, label: "리스크 레벨", explanation: "", breakdown: [] },
  keyReasons: [],
  majorRisks: [],
  news: [],
  disclosures: [],
  financials: {
    revenue: "-",
    operatingProfit: "-",
    netIncome: "-",
    revenueGrowth: "-",
    operatingMargin: "-",
    debtRatio: "-",
    freeCashFlow: "-",
    roe: "-",
    per: "-",
    pbr: "-",
    valuationNote: "-"
  },
  priceHistory: [],
  threeC: { company: "-", customer: "-", competitor: "-" },
  swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
  shortComment: "-",
  longComment: "-",
  aiCounterOpinion: [],
  finalComment: "-"
};

const researchFeatures = ["뉴스 48h", "DART 공시", "재무/밸류에이션", "AI 리스크 코멘트"];

export function RadarApp() {
  const [activeView, setActiveView] = useState<View>("radar");
  const [candidates, setCandidates] = useState<CandidateStock[]>([]);
  const [recommendMeta, setRecommendMeta] = useState<Omit<RecommendResponse, "candidates">>({
    generatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dataMode: "mock",
    universeCount: 0,
    matchedCount: 0,
    candidateCount: 0
  });
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [query, setQuery] = useState("삼성전자");
  const [analysis, setAnalysis] = useState<CompanyAnalysis>(emptyAnalysis);
  const [error, setError] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("short");
  const [sectorFilter, setSectorFilter] = useState("전체");
  const [showMethod, setShowMethod] = useState(false);

  const sectors = useMemo(() => ["전체", ...kospiUniverseSectors], []);
  const topCandidate = candidates[0];
  const sourceCount = Math.max(...candidates.map((item) => item.sourceCount), 0);

  const loadRecommendations = async (next?: { sort?: SortMode; sector?: string }) => {
    const sort = next?.sort ?? sortMode;
    const sector = next?.sector ?? sectorFilter;

    setRecommendLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ limit: "12", sort });
      if (sector !== "전체") params.set("sector", sector);

      const response = await fetch(`/api/recommend?${params.toString()}`, { cache: "no-store" });
      if (!response.ok) throw new Error("recommend request failed");
      const payload = (await response.json()) as RecommendResponse;

      setCandidates(payload.candidates);
      setRecommendMeta({
        generatedAt: payload.generatedAt,
        updatedAt: payload.updatedAt,
        dataMode: payload.dataMode,
        universeCount: payload.universeCount,
        matchedCount: payload.matchedCount,
        candidateCount: payload.candidateCount
      });
      setActiveView("radar");
    } catch {
      setError("Radar 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setRecommendLoading(false);
    }
  };

  const runAnalysis = async (nextQuery?: string) => {
    const target = (nextQuery ?? query).trim() || "삼성전자";
    setQuery(target);
    setAnalysisLoading(true);
    setError(null);
    setActiveView("report");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: target })
      });

      if (!response.ok) throw new Error("analyze request failed");
      const payload = (await response.json()) as AnalyzeResponse;
      setAnalysis(payload.analysis);
    } catch {
      setError("상세 분석을 생성하지 못했습니다. 데모 데이터를 기준으로 다시 시도해주세요.");
    } finally {
      setAnalysisLoading(false);
    }
  };

  useEffect(() => {
    void loadRecommendations();
    void runAnalysis("삼성전자");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-marine text-white shadow-soft">
                <Radar className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-ink">K-Stock Radar</h1>
                <p className="text-sm text-zinc-600">국내 주식 뉴스, 공시, 재무, 가격 데이터를 바탕으로 주식 투자 후보를 정리하는 AI Research Agent</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveView(item.id)}
                    className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition ${
                      isActive ? "border-marine bg-marine text-white" : "border-zinc-200 bg-white text-zinc-700 hover:border-marine hover:text-marine"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <CommandCenter
          query={query}
          dataMode={recommendMeta.dataMode}
          generatedAt={recommendMeta.updatedAt}
          sourceCount={sourceCount}
          loading={recommendLoading || analysisLoading}
          onQueryChange={setQuery}
          onAnalyze={() => void runAnalysis()}
          onRadar={() => void loadRecommendations()}
        />

        {error ? <ErrorState message={error} /> : null}

        <MethodDisclosure open={showMethod} onToggle={() => setShowMethod((value) => !value)} />

        {activeView === "radar" ? (
          <RecommendationView
            candidates={candidates}
            meta={recommendMeta}
            loading={recommendLoading}
            topCandidate={topCandidate}
            sortMode={sortMode}
            sectorFilter={sectorFilter}
            sectors={sectors}
            onSortChange={(value) => {
              setSortMode(value);
              void loadRecommendations({ sort: value });
            }}
            onSectorChange={(value) => {
              setSectorFilter(value);
              void loadRecommendations({ sector: value });
            }}
            onRefresh={() => void loadRecommendations()}
            onDetail={(value) => void runAnalysis(value)}
          />
        ) : null}

        {activeView === "report" ? (
          <AnalyzeView
            analysis={analysis}
            query={query}
            loading={analysisLoading}
            onQueryChange={setQuery}
            onSubmit={() => void runAnalysis()}
          />
        ) : null}
      </div>
    </main>
  );
}

function CommandCenter({
  query,
  dataMode,
  generatedAt,
  sourceCount,
  loading,
  onQueryChange,
  onAnalyze,
  onRadar
}: {
  query: string;
  dataMode: DataMode;
  generatedAt: string;
  sourceCount: number;
  loading: boolean;
  onQueryChange: (value: string) => void;
  onAnalyze: () => void;
  onRadar: () => void;
}) {
  return (
    <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-lg shadow-slate-200/60 lg:p-7">
      <div className="mb-5 flex flex-wrap items-center gap-1.5">
        <StatusPill label={dataModeLabel[dataMode]} tone={dataMode === "mock" ? "amber" : "mint"} />
        <StatusPill label="LLM Ready" tone="mint" />
        <StatusPill label="DART Ready" tone="slate" />
        <StatusPill label={`Updated ${generatedAt ? formatDateTime(generatedAt) : "확인 중"}`} tone="slate" quiet />
      </div>

      <div className="grid max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-mint/30 bg-mint/10 px-3 py-1.5 text-xs font-bold text-marine">
            <Radar className="h-3.5 w-3.5" />
            K-Stock Radar
          </div>
          <h2 className="text-3xl font-bold leading-tight text-ink md:text-5xl">
            뉴스와 공시로 찾는
            <br />
            국내 주식 리서치 Agent
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-600 md:text-base md:leading-7">
            최근 48시간 이내의 뉴스와 공시 자료를 기반으로 투자 검토 후보를 선별하고, 기업별 리서치 리포트로 핵심 근거와 리스크를 확인해보세요.
          </p>
        </div>

        <form
          className="rounded-2xl border border-mint/20 bg-slatepanel/80 p-4 shadow-lg shadow-slate-200/70"
          onSubmit={(event) => {
            event.preventDefault();
            onAnalyze();
          }}
        >
          <label className="mb-2 block text-xs font-bold text-zinc-500" htmlFor="command-query">
            기업명 또는 종목코드
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                id="command-query"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="예: 삼성전자 또는 005930"
                className="min-h-12 w-full rounded-lg border border-zinc-200 bg-white py-3 pl-10 pr-4 text-sm font-semibold text-ink outline-none transition placeholder:text-zinc-400 focus:border-marine focus:ring-2 focus:ring-marine/10"
              />
            </div>
            <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-bold text-white transition hover:bg-marine">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSearch className="h-4 w-4" />}
              리포트 생성
            </button>
          </div>
          <button
            type="button"
            onClick={onRadar}
            className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-marine px-5 py-3 text-sm font-bold text-white transition hover:bg-ink"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            48시간 Radar 실행
          </button>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-zinc-600">
            {researchFeatures.map((feature) => (
              <span key={feature} className="rounded-full border border-zinc-200 bg-white px-2.5 py-1">
                {feature}
              </span>
            ))}
          </div>
          <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-zinc-500">
            <Database className="h-3.5 w-3.5" />
            데이터 출처 {sourceCount}종 · {dataModeLabel[dataMode]}
          </p>
        </form>
      </div>
    </section>
  );
}

function StatusPill({ label, tone, quiet = false }: { label: string; tone: "mint" | "amber" | "slate"; quiet?: boolean }) {
  const toneClass =
    tone === "mint" ? "border-mint/30 bg-mint/10 text-marine" : tone === "amber" ? "border-saffron/30 bg-saffron/10 text-amber-700" : "border-zinc-200 bg-paper text-zinc-600";
  return (
    <span className={`inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-bold ${toneClass} ${quiet ? "font-semibold" : ""}`}>
      <CheckCircle2 className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

function MethodDisclosure({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <section className="mb-6 rounded-lg border border-zinc-200 bg-white shadow-soft">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
        <span>
          <span className="block text-sm font-bold text-ink">분석 방법 보기</span>
          <span className="text-xs text-zinc-500">단기 모멘텀, 장기 펀더멘털, 리스크 레벨 산정 기준</span>
        </span>
        <ChevronDown className={`h-5 w-5 text-zinc-400 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div className="border-t border-zinc-100 px-5 py-4">
          <div className="grid gap-4 md:grid-cols-3">
            <MethodCard title="단기 모멘텀" body="최근 48시간 뉴스, DART 공시 영향, 주가 추세, 거래량 변화, 이벤트성 재료와 과열 여부를 함께 봅니다." />
            <MethodCard title="장기 펀더멘털" body="재무 안정성, 성장성, 현금흐름, 산업 전망, 경쟁우위, 밸류에이션, 거버넌스와 지속 가능성을 반영합니다." />
            <MethodCard title="정성 프레임" body="3C와 SWOT은 점수 산정의 메인이 아니라, 기업 구조와 리스크를 빠르게 이해하기 위한 보조 프레임으로 사용합니다." />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function MethodCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-lg bg-paper p-4">
      <h3 className="font-bold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{body}</p>
    </article>
  );
}

function RecommendationView({
  candidates,
  meta,
  loading,
  topCandidate,
  sortMode,
  sectorFilter,
  sectors,
  onSortChange,
  onSectorChange,
  onRefresh,
  onDetail
}: {
  candidates: CandidateStock[];
  meta: Omit<RecommendResponse, "candidates">;
  loading: boolean;
  topCandidate?: CandidateStock;
  sortMode: SortMode;
  sectorFilter: string;
  sectors: string[];
  onSortChange: (value: SortMode) => void;
  onSectorChange: (value: string) => void;
  onRefresh: () => void;
  onDetail: (query: string) => void;
}) {
  const averageShort = candidates.length ? Math.round(candidates.reduce((sum, item) => sum + item.shortScore.score, 0) / candidates.length) : 0;
  const averageRisk = candidates.length ? Math.round(candidates.reduce((sum, item) => sum + item.riskScore.score, 0) / candidates.length) : 0;

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-zinc-200 bg-slatepanel p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold text-ink">48시간 Radar</h2>
              <DataModeBadge mode={meta.dataMode} />
            </div>
            <p className="text-sm leading-6 text-zinc-700">KOSPI Universe를 1차 스크리닝해 최근 데이터상 우선 검토할 후보를 정리합니다. 결과는 리서치 보조용입니다.</p>
            <p className="mt-2 text-xs font-semibold text-zinc-500">업데이트 {formatDateTime(meta.updatedAt)} · 검토 후보 {meta.candidateCount}개</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select value={sectorFilter} onChange={(event) => onSectorChange(event.target.value)} className="min-h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700" aria-label="업종 필터">
              {sectors.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
            <select value={sortMode} onChange={(event) => onSortChange(event.target.value as SortMode)} className="min-h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700" aria-label="정렬 기준">
              {(Object.keys(sortLabels) as SortMode[]).map((item) => (
                <option key={item} value={item}>
                  {sortLabels[item]}
                </option>
              ))}
            </select>
            <button type="button" onClick={onRefresh} className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-marine">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              새로고침
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricTile label="KOSPI Universe" value={`${meta.universeCount}개`} caption="데모 모드 기준 샘플 상장사" />
          <MetricTile label="필터 적용" value={`${meta.matchedCount}개`} caption="선택 업종 기준 1차 매칭 결과" />
          <MetricTile label="최종 검토 후보" value={`${meta.candidateCount}개`} caption="스크리닝 상위 후보만 노출" />
          <MetricTile label="Last Updated" value={formatDateTime(meta.updatedAt)} caption="최근 생성 시각" />
        </div>

        {topCandidate ? (
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <MetricTile label="상위 검토 후보" value={topCandidate.name} caption={`단기 ${topCandidate.shortScore.score} · 장기 ${topCandidate.longScore.score}`} />
            <MetricTile label="평균 단기 모멘텀" value={`${averageShort}점`} caption="뉴스·공시·수급 신호 기준" />
            <MetricTile label="평균 리스크 레벨" value={`${averageRisk}점`} caption="낮을수록 해석 부담이 적음" />
          </div>
        ) : null}
      </section>

      {loading ? (
        <LoadingGrid />
      ) : candidates.length === 0 ? (
        <EmptyState />
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {candidates.map((candidate) => (
            <CandidateCard key={candidate.code} candidate={candidate} onDetail={onDetail} />
          ))}
        </section>
      )}

      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-marine" />
          <h3 className="text-lg font-bold text-ink">검토 후보 비교</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs font-bold text-zinc-500">
                <th className="py-3 pr-4">종목</th>
                <th className="py-3 pr-4">업종</th>
                <th className="py-3 pr-4">현재가</th>
                <th className="py-3 pr-4">등락률</th>
                <th className="py-3 pr-4">단기 모멘텀</th>
                <th className="py-3 pr-4">장기 펀더멘털</th>
                <th className="py-3 pr-4">리스크</th>
                <th className="py-3 pr-4">데이터</th>
                <th className="py-3 pr-4">리포트</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => (
                <tr key={candidate.code} className="border-b border-zinc-100">
                  <td className="py-3 pr-4">
                    <p className="font-bold text-ink">{candidate.name}</p>
                    <p className="text-xs text-zinc-500">{candidate.code}</p>
                  </td>
                  <td className="py-3 pr-4 text-zinc-700">{candidate.sector}</td>
                  <td className="py-3 pr-4 font-semibold text-ink">{formatPrice(candidate.currentPrice)}</td>
                  <td className={`py-3 pr-4 font-semibold ${candidate.changeRate >= 0 ? "text-rosewood" : "text-marine"}`}>{formatPercent(candidate.changeRate)}</td>
                  <td className="py-3 pr-4 font-semibold text-ink">{candidate.shortScore.score}</td>
                  <td className="py-3 pr-4 font-semibold text-ink">{candidate.longScore.score}</td>
                  <td className="py-3 pr-4">
                    <RiskBadge value={candidate.riskScore.score} />
                  </td>
                  <td className="py-3 pr-4 text-zinc-700">
                    뉴스 {candidate.newsCount} · 공시 {candidate.disclosureCount} · 출처 {candidate.sourceCount}
                  </td>
                  <td className="py-3 pr-4">
                    <button type="button" onClick={() => onDetail(candidate.name)} className="rounded-md border border-marine px-3 py-2 text-xs font-bold text-marine transition hover:bg-marine hover:text-white">
                      보기
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SoftNotice />
      </section>
    </div>
  );
}

function MetricTile({ label, value, caption }: { label: string; value: string; caption: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <p className="text-xs font-semibold text-zinc-500">{label}</p>
      <p className="mt-2 text-xl font-bold text-ink">{value}</p>
      <p className="mt-1 text-sm text-zinc-600">{caption}</p>
    </div>
  );
}

function AnalyzeView({
  analysis,
  query,
  loading,
  onQueryChange,
  onSubmit
}: {
  analysis: CompanyAnalysis;
  query: string;
  loading: boolean;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-soft">
        <form
          className="flex w-full flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="기업명 또는 종목코드"
            className="min-h-11 flex-1 rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-ink outline-none transition placeholder:text-zinc-400 focus:border-marine"
          />
          <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-marine px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            리포트 생성
          </button>
        </form>
      </section>

      {loading ? <ReportSkeleton /> : <DetailAnalysis analysis={analysis} />}
    </div>
  );
}

function LoadingGrid() {
  return (
    <section className="grid gap-4 xl:grid-cols-2">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="h-80 animate-pulse rounded-lg border border-zinc-200 bg-white p-5 shadow-soft">
          <div className="h-5 w-1/3 rounded bg-zinc-200" />
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="h-16 rounded bg-zinc-100" />
            <div className="h-16 rounded bg-zinc-100" />
            <div className="h-16 rounded bg-zinc-100" />
          </div>
          <div className="mt-6 h-32 rounded bg-zinc-100" />
        </div>
      ))}
    </section>
  );
}

function ReportSkeleton() {
  return (
    <section className="grid min-h-96 place-items-center rounded-lg border border-zinc-200 bg-white p-8 shadow-soft">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-marine" />
        <p className="mt-4 font-semibold text-ink">수집한 데이터를 바탕으로 리서치 리포트를 정리하는 중입니다.</p>
        <p className="mt-2 text-sm text-zinc-600">API 키가 없으면 Demo Mode 리포트로 자동 전환됩니다.</p>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <section className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center">
      <Activity className="mx-auto h-8 w-8 text-zinc-400" />
      <h3 className="mt-3 font-bold text-ink">조건에 맞는 검토 후보가 없습니다.</h3>
      <p className="mt-2 text-sm text-zinc-600">업종 필터를 전체로 바꾸거나 Radar를 다시 실행해보세요.</p>
    </section>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border border-saffron/30 bg-saffron/10 p-3 text-sm font-semibold text-amber-800">
      <ShieldAlert className="h-4 w-4" />
      {message}
    </div>
  );
}

function SoftNotice() {
  return (
    <div className="mt-4 rounded-lg border border-zinc-200 bg-paper p-3 text-xs font-medium leading-5 text-zinc-600">
      점수와 코멘트는 최근 뉴스, 공시, 재무, 주가 데이터를 정리한 리서치 요약입니다. 원문 공시와 최신 시세를 함께 확인해 해석하는 흐름을 권장합니다.
    </div>
  );
}
