import { buildScoreBlock } from "./scoring";
import type { CandidateStock, DataMode, KospiUniverseEntry, RecommendResponse } from "./types";

export type ScreenerSort = "short" | "long" | "risk";

type ScreenOptions = {
  sector?: string | null;
  sort?: ScreenerSort | null;
  limit?: number | null;
  dataMode?: DataMode;
};

type ScreenResult = Pick<RecommendResponse, "generatedAt" | "updatedAt" | "dataMode" | "universeCount" | "matchedCount" | "candidateCount" | "candidates">;

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(value)));

const riskKeywordLabels: Record<string, string> = {
  memory_cycle: "메모리 가격 사이클",
  currency: "환율 변동",
  overheating: "단기 과열",
  customer_concentration: "고객사 집중",
  regulation: "규제 노출",
  interest_rate: "금리 민감도",
  demand_slowdown: "수요 둔화",
  competition: "경쟁 심화",
  clinical: "임상 불확실성",
  credit_cost: "대손비용",
  ad_cycle: "광고 경기"
};

const labelRiskKeyword = (keyword: string) => riskKeywordLabels[keyword] ?? keyword;

const toSourceCount = (entry: KospiUniverseEntry) => {
  const flags = [entry.newsCount48h > 0, entry.disclosureCount48h > 0, Math.abs(entry.changeRate) > 0.2, Math.abs(entry.volumeChangeRate) > 5];
  return flags.filter(Boolean).length + 1;
};

function buildShortScore(entry: KospiUniverseEntry) {
  const newsMomentum = clamp(45 + entry.positiveNewsCount * 8 - entry.negativeNewsCount * 9 + entry.newsCount48h * 2);
  const disclosureImpact = clamp(48 + entry.disclosureCount48h * 8 - entry.riskKeywords.length * 2);
  const trend = clamp(50 + entry.changeRate * 7);
  const volume = clamp(50 + entry.volumeChangeRate * 0.35);
  const eventMaterial = clamp(42 + entry.themeTags.length * 7 + entry.newsCount48h * 2);
  const overheating = clamp(100 - Math.max(0, Math.abs(entry.changeRate) - 4) * 10);

  return buildScoreBlock("단기 모멘텀", "최근 뉴스, 주요 공시, 가격 흐름, 거래량 변화를 함께 반영합니다.", [
    { label: "뉴스 모멘텀", value: newsMomentum, weight: 0.28, reason: `48시간 뉴스 ${entry.newsCount48h}건 중 긍정 ${entry.positiveNewsCount}건, 부정 ${entry.negativeNewsCount}건을 반영했습니다.` },
    { label: "DART 공시 영향", value: disclosureImpact, weight: 0.16, reason: "주요 공시 여부를 단기 이벤트 강도에 보조 반영했습니다." },
    { label: "가격 흐름", value: trend, weight: 0.2, reason: `기준 등락률 ${entry.changeRate.toFixed(1)}%를 바탕으로 추세 강도를 계산했습니다.` },
    { label: "거래량 변화", value: volume, weight: 0.14, reason: `거래량 변화율 ${entry.volumeChangeRate.toFixed(1)}%를 수급 신호로 반영했습니다.` },
    { label: "이벤트 선명도", value: eventMaterial, weight: 0.12, reason: `테마 ${entry.themeTags.slice(0, 3).join(", ")}와 최근 관심도를 반영했습니다.` },
    { label: "과열 여부", value: overheating, weight: 0.1, reason: "단기 급등 구간은 과열 가능성을 차감했습니다." }
  ]);
}

function buildLongScore(entry: KospiUniverseEntry) {
  return buildScoreBlock("장기 잠재력", "재무 안정성, 성장성, 경쟁력, 밸류에이션 매력을 공통 기준으로 점수화합니다.", [
    { label: "재무 안정성", value: entry.financialStrength, weight: 0.22, reason: "기초 재무 체력과 안정성을 반영했습니다." },
    { label: "성장 잠재력", value: entry.growthPotential, weight: 0.2, reason: "중기 이익 성장 가능성과 산업 사이클을 반영했습니다." },
    { label: "경쟁 우위", value: entry.businessMoat, weight: 0.18, reason: "기술력, 브랜드, 고객 기반 등 경쟁 지위를 반영했습니다." },
    { label: "밸류에이션", value: entry.valuationAttractiveness, weight: 0.16, reason: "상대적인 가격 매력도를 반영했습니다." },
    { label: "산업 전망", value: clamp(50 + entry.themeTags.length * 6 + entry.positiveNewsCount * 3 - entry.negativeNewsCount * 2), weight: 0.14, reason: `산업 테마 ${entry.themeTags.slice(0, 2).join(", ")}와 뉴스 방향을 반영했습니다.` },
    { label: "지속 가능성", value: clamp((entry.financialStrength + entry.businessMoat + entry.growthPotential) / 3), weight: 0.1, reason: "재무, 경쟁력, 성장성을 종합했습니다." }
  ]);
}

function buildRiskScore(entry: KospiUniverseEntry) {
  const keywordRisk = clamp(35 + entry.riskKeywords.length * 9);
  const priceRisk = clamp(40 + Math.max(0, Math.abs(entry.changeRate) - 3) * 5);
  const volumeRisk = clamp(38 + Math.max(0, entry.volumeChangeRate - 35) * 0.5);
  const newsRisk = clamp(38 + entry.negativeNewsCount * 8);
  const disclosureRisk = clamp(36 + entry.disclosureCount48h * 4);

  return buildScoreBlock("리스크 점수", "높을수록 변동성, 불확실성, 해석 부담이 큰 구간입니다.", [
    { label: "리스크 키워드", value: keywordRisk, weight: 0.34, reason: entry.riskKeywords.length ? `${entry.riskKeywords.map(labelRiskKeyword).join(", ")} 요인을 반영했습니다.` : "뚜렷한 위험 키워드는 제한적입니다." },
    { label: "가격 변동성", value: priceRisk, weight: 0.18, reason: `기준 등락률 ${entry.changeRate.toFixed(1)}%에 따른 변동성을 평가했습니다.` },
    { label: "거래량 과열", value: volumeRisk, weight: 0.14, reason: `거래량 변화율 ${entry.volumeChangeRate.toFixed(1)}%가 과열 위험에 미치는 영향을 반영했습니다.` },
    { label: "부정 뉴스", value: newsRisk, weight: 0.18, reason: `48시간 내 부정 뉴스 ${entry.negativeNewsCount}건을 반영했습니다.` },
    { label: "공시 해석 부담", value: disclosureRisk, weight: 0.16, reason: "주요 공시가 있을 경우 해석 부담이 커질 수 있습니다." }
  ]);
}

function buildConfidence(entry: KospiUniverseEntry) {
  const freshness = clamp(60 + entry.newsCount48h * 4 + entry.disclosureCount48h * 5);
  const sourceDiversity = clamp(toSourceCount(entry) * 19);
  const dataDepth = clamp((entry.financialStrength + entry.businessMoat + entry.growthPotential) / 3);
  const confidence = clamp(freshness * 0.35 + sourceDiversity * 0.35 + dataDepth * 0.3);
  const confidenceLabel = confidence >= 80 ? "높음" : confidence >= 65 ? "양호" : confidence < 50 ? "제한적" : "보통";
  const confidenceSummary =
    confidence >= 80
      ? "뉴스, 공시, 가격 데이터가 함께 있어 근거 기반 비교가 높습니다."
      : confidence >= 65
        ? "여러 데이터 신호가 있어 리서치 참고용으로 무난합니다."
        : confidence >= 50
          ? "일부 신호가 있으나 보수적인 해석이 필요합니다."
          : "최근 근거가 많지 않아 탐색 후보로 보는 편이 좋습니다.";
  return { confidence, confidenceLabel, confidenceSummary };
}

function buildReasons(entry: KospiUniverseEntry) {
  return [
    `48시간 뉴스 ${entry.newsCount48h}건과 긍정 뉴스 ${entry.positiveNewsCount}건이 단기 관심도에 반영됐습니다.`,
    `거래량 변화율 ${entry.volumeChangeRate.toFixed(1)}%와 등락률 ${entry.changeRate.toFixed(1)}%가 수급 변화를 보여줍니다.`,
    `${entry.themeTags.slice(0, 2).join(", ")} 테마가 업종 관심과 연결됩니다.`
  ];
}

function buildRisks(entry: KospiUniverseEntry) {
  return [
    `${entry.riskKeywords.length ? entry.riskKeywords.map(labelRiskKeyword).slice(0, 2).join(", ") : "뚜렷한 위험 키워드 부족"} 관련 변화는 추가 확인이 필요합니다.`,
    `부정 뉴스 ${entry.negativeNewsCount}건과 주요 공시 여부에 따라 단기 변동성이 커질 수 있습니다.`,
    `${entry.sector} 업종 특성상 업황 사이클과 외부 변수에 민감할 수 있습니다.`
  ];
}

export function candidateFromUniverse(entry: KospiUniverseEntry, dataMode: DataMode = "mock"): CandidateStock {
  const shortScore = buildShortScore(entry);
  const longScore = buildLongScore(entry);
  const riskScore = buildRiskScore(entry);
  const { confidence, confidenceLabel, confidenceSummary } = buildConfidence(entry);
  const now = new Date().toISOString();

  return {
    name: entry.name,
    code: entry.code,
    market: entry.market,
    sector: entry.sector,
    industry: entry.industry,
    themeTags: entry.themeTags,
    currentPrice: 0,
    changeRate: 0,
    confidence,
    confidenceLabel,
    confidenceSummary,
    shortScore,
    longScore,
    riskScore,
    keyReasons: buildReasons(entry),
    majorRisks: buildRisks(entry),
    dataMode,
    priceHistory: [],
    priceDataSource: "mock",
    priceUpdatedAt: now,
    quoteSource: undefined,
    quotePrice: undefined,
    quoteChangeRate: undefined,
    quoteUpdatedAt: undefined,
    isDemoPrice: true,
    isMarketData: false,
    newsCount: entry.newsCount48h,
    disclosureCount: entry.disclosureCount48h,
    sourceCount: toSourceCount(entry),
    updatedAt: now,
    news: [],
    disclosures: []
  };
}

export function screenKospiCandidates(universe: KospiUniverseEntry[], options: ScreenOptions = {}): ScreenResult {
  const dataMode = options.dataMode ?? "mock";
  const generatedAt = new Date().toISOString();
  const normalizedSector = options.sector && options.sector !== "전체" ? options.sector : null;
  const sort = options.sort ?? "short";
  const limit = Math.max(1, Math.min(options.limit ?? 12, 24));

  const matchedUniverse = normalizedSector ? universe.filter((entry) => entry.sector === normalizedSector) : universe;
  const screened = matchedUniverse.map((entry) => candidateFromUniverse(entry, dataMode));

  screened.sort((a, b) => {
    if (sort === "long") return b.longScore.score - a.longScore.score || b.confidence - a.confidence;
    if (sort === "risk") return a.riskScore.score - b.riskScore.score || b.longScore.score - a.longScore.score;
    return b.shortScore.score - a.shortScore.score || b.confidence - a.confidence;
  });

  const candidates = screened.slice(0, limit);

  return {
    generatedAt,
    updatedAt: generatedAt,
    dataMode,
    universeCount: universe.length,
    matchedCount: matchedUniverse.length,
    candidateCount: candidates.length,
    candidates
  };
}
