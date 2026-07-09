import { findKospiUniverseEntry, kospiUniverse } from "@/data/kospi-universe";
import { candidateFromUniverse, screenKospiCandidates, type ScreenerSort } from "./screener";
import { fetchMarketSnapshot } from "./marketData";
import { generateStrategyNarrative } from "./llm";
import { fetchNaverNews, hasNaverNewsCredentials } from "./newsProvider";
import { fetchLatestDartDisclosures, hasOpenDartCredentials } from "./dartProvider";
import type {
  CompanyAnalysis,
  DataMode,
  DisclosureItem,
  FinancialSnapshot,
  KospiUniverseEntry,
  NewsItem,
  RecommendResponse,
  StrategyCommentary,
  SwotAnalysis,
  ThreeCAnalysis
} from "./types";

type ProviderName = NonNullable<CompanyAnalysis["newsProvider"]> | NonNullable<CompanyAnalysis["dartProvider"]>;

type EvidenceResult<T> = {
  items: T[];
  status: "market" | "unavailable";
  message?: string;
  provider?: ProviderName;
};

const NONE = "없음";
const CHART_UNAVAILABLE = "과거 시세 데이터를 불러오지 못했습니다. 현재가만 표시합니다.";

async function fetchNewsEvidence(entry: KospiUniverseEntry): Promise<EvidenceResult<NewsItem>> {
  if (!hasNaverNewsCredentials()) {
    return {
      items: [],
      status: "unavailable",
      message: "네이버 뉴스 API 키가 설정되지 않았습니다.",
      provider: NONE
    };
  }

  try {
    const items = await fetchNaverNews(entry.name, entry.code);
    return {
      items,
      status: items.length > 0 ? "market" : "unavailable",
      message: items.length > 0 ? "Naver News API 기반으로 원문 링크가 확인된 뉴스만 표시합니다." : "확인된 뉴스가 없습니다.",
      provider: items.length > 0 ? "Naver News API" : NONE
    };
  } catch (error) {
    console.warn("Naver News API failed", error);
    return {
      items: [],
      status: "unavailable",
      message: "네이버 뉴스 데이터를 불러오지 못했습니다.",
      provider: NONE
    };
  }
}

async function fetchDartEvidence(entry: KospiUniverseEntry): Promise<EvidenceResult<DisclosureItem>> {
  if (!hasOpenDartCredentials()) {
    return {
      items: [],
      status: "unavailable",
      message: "OpenDART API 키가 설정되지 않았습니다.",
      provider: NONE
    };
  }

  try {
    const items = await fetchLatestDartDisclosures(entry.name, entry.code);
    return {
      items,
      status: items.length > 0 ? "market" : "unavailable",
      message: items.length > 0 ? "OpenDART API 기반으로 최신 공시를 표시합니다." : "확인된 DART 공시가 없습니다.",
      provider: items.length > 0 ? "OpenDART API" : NONE
    };
  } catch (error) {
    console.warn("OpenDART fetch failed", error);
    const message = error instanceof Error && error.message === "DART_CORP_CODE_NOT_FOUND" ? "해당 기업의 DART 고유번호를 찾지 못했습니다." : "DART 공시 데이터를 불러오지 못했습니다.";
    return {
      items: [],
      status: "unavailable",
      message,
      provider: NONE
    };
  }
}

function sectorKind(entry: KospiUniverseEntry) {
  const text = `${entry.sector} ${entry.industry} ${entry.themeTags.join(" ")}`;
  if (/금융|은행|증권|보험/.test(text)) return "finance";
  if (/반도체|메모리|HBM|AI/.test(text)) return "semiconductor";
  if (/자동차|전기차/.test(text)) return "auto";
  if (/바이오|제약|임상|파이프라인/.test(text)) return "bio";
  return "general";
}

function buildThreeC(entry: KospiUniverseEntry): ThreeCAnalysis {
  const kind = sectorKind(entry);
  if (kind === "finance") {
    return {
      company: `${entry.name}은 자본 효율성과 주주환원 정책이 핵심 경쟁력입니다.`,
      customer: "고객 수요는 금리, 자본시장 거래대금, 신용 사이클에 민감합니다.",
      competitor: "동종 금융지주 대비 배당 지속성, 비용 관리, 자본비율이 비교 포인트입니다."
    };
  }
  if (kind === "semiconductor") {
    return {
      company: `${entry.name}은 메모리와 AI 인프라 수요에 연결된 제품 경쟁력이 중요합니다.`,
      customer: "클라우드, AI 서버, 모바일, PC 수요와 재고 사이클이 실적 방향을 좌우합니다.",
      competitor: "글로벌 메모리 경쟁사 대비 고부가 제품 비중과 투자 속도가 핵심 비교 요소입니다."
    };
  }
  return {
    company: `${entry.name}은 ${entry.industry} 내 수익 구조와 비용 효율성을 함께 봐야 합니다.`,
    customer: "수요 환경은 업황 사이클, 최종 고객 투자 여력, 가격 전가력에 따라 달라집니다.",
    competitor: "경쟁사 대비 차별화 포인트는 제품력, 고객 기반, 재무 체력의 조합에서 확인해야 합니다."
  };
}

function buildSwot(entry: KospiUniverseEntry): SwotAnalysis {
  const kind = sectorKind(entry);
  if (kind === "finance") {
    return {
      strengths: ["안정적인 이익 체력과 주주환원 기대가 금융 섹터 내 방어적 매력으로 작용합니다.", "자본 효율성이 유지되면 배당과 자사주 정책의 지속성을 기대할 수 있습니다."],
      weaknesses: ["금리와 자본시장 환경 변화에 따라 실적 변동성이 확대될 수 있습니다.", "규제와 대손비용 확대는 이익 가시성을 낮출 수 있습니다."],
      opportunities: ["주주환원 정책이 강화될 경우 밸류에이션 재평가 가능성이 있습니다.", "금리 안정과 거래대금 회복은 금융주 수급 개선의 계기가 될 수 있습니다."],
      threats: ["금융 규제와 신용 리스크 확대는 수익성에 부담으로 작용할 수 있습니다.", "부동산 PF와 경기 둔화는 투자심리를 약화시킬 수 있습니다."]
    };
  }
  return {
    strengths: ["핵심 사업의 수익 구조와 시장 지위가 유지되면 방어력이 생길 수 있습니다.", "비용 효율성과 고객 기반은 실적 안정성을 높이는 요소입니다."],
    weaknesses: ["업황 사이클과 특정 고객 의존도는 실적 변동성을 키울 수 있습니다.", "마진 압박과 투자 부담은 단기 수익성에 영향을 줄 수 있습니다."],
    opportunities: ["수요 회복과 신규 사업 성과가 확인되면 밸류에이션 재평가가 가능합니다.", "뉴스와 공시 모멘텀이 실제 실적 개선으로 이어지는지 확인할 필요가 있습니다."],
    threats: ["경기 둔화와 경쟁 심화는 가격 결정력에 부담으로 작용할 수 있습니다.", "규제, 환율, 원가 변동은 이익 가시성을 낮출 수 있습니다."]
  };
}

function buildStrategyCommentary(news: NewsItem[], disclosures: DisclosureItem[]): StrategyCommentary {
  const hasRecentNews = news.some((item) => item.newsRange === "48h");
  const hasMajorDisclosure = disclosures.some((item) => item.isMajor);
  return {
    shortTerm: hasRecentNews || hasMajorDisclosure ? "실제 URL이 확인된 뉴스와 주요 공시가 단기 관심도를 높일 수 있으나, 주가 반응은 수급과 업종 흐름에 따라 달라질 수 있습니다." : "확인된 최신 이슈가 제한적이므로 가격 흐름과 거래량 변화를 함께 봐야 합니다.",
    longTerm: "장기적으로는 이익 안정성, 산업 성장성, 경쟁력, 주주환원 또는 투자 효율성이 핵심 평가 요소입니다.",
    watchPoints: "뉴스 원문, DART 원문, 최근 실적 발표, 업종 내 밸류에이션 비교를 함께 확인해야 합니다.",
    dataNote: "전략 분석은 업종, 실제 URL이 확인된 뉴스와 공시, 재무 지표를 규칙 기반으로 해석해 생성했습니다."
  };
}

function buildFinancials(entry: KospiUniverseEntry): FinancialSnapshot {
  const revenue = entry.marketCap * (0.62 + entry.growthPotential / 180);
  const operatingProfit = revenue * (0.07 + entry.businessMoat / 700);
  const netIncome = operatingProfit * 0.74;
  const revenueGrowth = ((entry.growthPotential - 55) / 3.4).toFixed(1);
  const operatingMargin = ((operatingProfit / revenue) * 100).toFixed(1);
  const debtRatio = Math.max(25, 150 - entry.financialStrength).toFixed(0);
  const freeCashFlow = operatingProfit * (0.52 + entry.financialStrength / 300);
  const roe = Math.max(4, (entry.financialStrength + entry.growthPotential) / 11).toFixed(1);
  const per = Math.max(7, 28 - entry.valuationAttractiveness / 4).toFixed(1);
  const pbr = Math.max(0.8, 3.6 - entry.valuationAttractiveness / 35).toFixed(1);

  return {
    revenue: `${Math.round(revenue).toLocaleString("ko-KR")}조원`,
    operatingProfit: `${Math.round(operatingProfit).toLocaleString("ko-KR")}조원`,
    netIncome: `${Math.round(netIncome).toLocaleString("ko-KR")}조원`,
    revenueGrowth: `${Number(revenueGrowth) > 0 ? "+" : ""}${revenueGrowth}%`,
    operatingMargin: `${operatingMargin}%`,
    debtRatio: `${debtRatio}%`,
    freeCashFlow: `${Math.round(freeCashFlow).toLocaleString("ko-KR")}조원`,
    roe: `${roe}%`,
    per: `${per}배`,
    pbr: `${pbr}배`,
    valuationNote: "재무 항목은 데모 유니버스의 기초 지표를 바탕으로 만든 참고용 추정치입니다."
  };
}

function buildBaseAnalysis(entry: KospiUniverseEntry, dataMode: DataMode, newsResult: EvidenceResult<NewsItem>, dartResult: EvidenceResult<DisclosureItem>): CompanyAnalysis {
  const candidate = candidateFromUniverse(entry, dataMode);
  const now = new Date().toISOString();
  const strategyCommentary = buildStrategyCommentary(newsResult.items, dartResult.items);

  return {
    name: entry.name,
    code: entry.code,
    corpCode: entry.code.padStart(8, "0"),
    market: entry.market,
    sector: entry.sector,
    industry: entry.industry,
    themeTags: entry.themeTags,
    currentPrice: 0,
    changeRate: 0,
    marketCap: `${entry.marketCap.toLocaleString("ko-KR")}조원`,
    overview: `${entry.name}은 ${entry.market} 상장 ${entry.industry} 기업입니다. 이 리포트는 실제 URL이 확인된 뉴스와 공시, 공통 스크리닝 점수, 시장 데이터를 결합해 보여줍니다.`,
    dataMode,
    generatedAt: now,
    confidence: candidate.confidence,
    confidenceReason: candidate.confidenceSummary,
    shortScore: candidate.shortScore,
    longScore: candidate.longScore,
    riskScore: candidate.riskScore,
    keyReasons: candidate.keyReasons,
    majorRisks: candidate.majorRisks,
    news: newsResult.items,
    disclosures: dartResult.items,
    financials: buildFinancials(entry),
    priceHistory: [],
    chartDataSource: "actual",
    chartSource: "사용 불가",
    chartStatus: "unavailable",
    chartDataReason: CHART_UNAVAILABLE,
    quotePrice: undefined,
    quoteChangeRate: undefined,
    priceDataSource: "mock",
    priceUpdatedAt: undefined,
    quoteUpdatedAt: undefined,
    quoteSource: undefined,
    isDemoPrice: true,
    isMarketData: false,
    threeC: buildThreeC(entry),
    swot: buildSwot(entry),
    strategyCommentary,
    newsStatus: newsResult.status,
    newsStatusMessage: newsResult.message,
    newsProvider: (newsResult.provider as CompanyAnalysis["newsProvider"]) ?? NONE,
    dartStatus: dartResult.status,
    dartStatusMessage: dartResult.message,
    dartProvider: (dartResult.provider as CompanyAnalysis["dartProvider"]) ?? NONE,
    shortComment: strategyCommentary.shortTerm,
    longComment: strategyCommentary.longTerm,
    aiCounterOpinion: [
      "뉴스와 공시가 단기 관심을 만들더라도 실제 실적 영향은 제한적일 수 있습니다.",
      "업종 평균 대비 밸류에이션과 원문 공시 확인이 필요합니다.",
      "시장 금리, 수급, 경기 사이클 변화가 해석을 바꿀 수 있습니다."
    ],
    finalComment: `${entry.name}은 매수 또는 매도 추천이 아니라 검토 후보입니다. 리포트는 구조화된 체크리스트로 사용하세요.`
  };
}

async function fetchSelectedMarketData(company: CompanyAnalysis): Promise<Partial<CompanyAnalysis>> {
  const snapshot = await fetchMarketSnapshot(company.code, company.market, "1Y");
  const hasQuote = Boolean(snapshot.quote);
  const hasMarketChart = snapshot.priceHistory.length >= 5;

  return {
    currentPrice: snapshot.quote?.currentPrice ?? 0,
    changeRate: snapshot.quote?.changeRate ?? 0,
    quotePrice: snapshot.quote?.currentPrice,
    quoteChangeRate: snapshot.quote?.changeRate,
    priceDataSource: hasQuote ? "yahoo" : "mock",
    priceUpdatedAt: snapshot.quote?.priceUpdatedAt,
    quoteUpdatedAt: snapshot.quote?.priceUpdatedAt,
    quoteSource: snapshot.quote?.quoteSource,
    isDemoPrice: !hasQuote,
    isMarketData: hasQuote,
    priceHistory: hasMarketChart ? snapshot.priceHistory : [],
    chartDataSource: "actual",
    chartSource: hasMarketChart ? snapshot.chartSource : "사용 불가",
    chartStatus: hasMarketChart ? "market" : "unavailable",
    chartDataReason: hasMarketChart ? undefined : snapshot.chartReason ?? CHART_UNAVAILABLE
  };
}

export async function getRecommendedCandidates(options?: { limit?: number | null; sector?: string | null; sort?: ScreenerSort | null }): Promise<RecommendResponse> {
  return screenKospiCandidates(kospiUniverse, {
    limit: options?.limit,
    sector: options?.sector,
    sort: options?.sort,
    dataMode: "mock"
  });
}

export async function getCompanyResearch(query?: string): Promise<CompanyAnalysis> {
  const entry = findKospiUniverseEntry(query);
  const [newsResult, dartResult] = await Promise.all([fetchNewsEvidence(entry), fetchDartEvidence(entry)]);
  const base = buildBaseAnalysis(entry, "hybrid", newsResult, dartResult);

  try {
    const market = await fetchSelectedMarketData(base);
    const merged: CompanyAnalysis = {
      ...base,
      ...market,
      dataMode: market.isMarketData || newsResult.status === "market" || dartResult.status === "market" ? "hybrid" : "mock",
      confidenceReason:
        newsResult.status === "market" || dartResult.status === "market"
          ? `${base.confidenceReason} 뉴스와 DART 근거는 실제 원문 링크가 확인된 경우에만 표시합니다.`
          : base.confidenceReason
    };
    const strategy = await generateStrategyNarrative(merged);
    return { ...merged, threeC: strategy.threeC, swot: strategy.swot, strategyCommentary: strategy.strategyCommentary };
  } catch (error) {
    console.warn("selected market data failed", error);
    const fallback: CompanyAnalysis = {
      ...base,
      dataMode: newsResult.status === "market" || dartResult.status === "market" ? "hybrid" : "mock",
      chartDataReason: CHART_UNAVAILABLE
    };
    const strategy = await generateStrategyNarrative(fallback);
    return { ...fallback, threeC: strategy.threeC, swot: strategy.swot, strategyCommentary: strategy.strategyCommentary };
  }
}
