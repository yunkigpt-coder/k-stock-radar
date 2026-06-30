import { buildScoreBlock } from "./scoring";
import type { CandidateStock, DataMode, KospiUniverseEntry, RecommendResponse } from "./types";

export type ScreenerSort = "short" | "long" | "risk";

type ScreenOptions = {
  sector?: string | null;
  sort?: ScreenerSort | null;
  limit?: number | null;
  dataMode?: DataMode;
};

type ScreenResult = Pick<
  RecommendResponse,
  "generatedAt" | "updatedAt" | "dataMode" | "universeCount" | "matchedCount" | "candidateCount" | "candidates"
>;

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(value)));

const riskKeywordWeights: Record<string, number> = {
  litigation: 10,
  recall: 8,
  regulation: 7,
  debt: 8,
  slowdown: 6,
  inventory: 6,
  dilution: 9,
  volatility: 7,
  currency: 5,
  margin: 5,
  geopolitics: 8,
  commodity: 5,
  clinical: 9,
  competition: 5,
  governance: 8
};

const riskKeywordLabels: Record<string, string> = {
  litigation: "소송 이슈",
  recall: "리콜 가능성",
  regulation: "규제 변수",
  debt: "차입 부담",
  slowdown: "수요 둔화",
  inventory: "재고 조정",
  dilution: "희석 가능성",
  volatility: "변동성 확대",
  currency: "환율 노출",
  margin: "수익성 압박",
  geopolitics: "지정학 변수",
  commodity: "원자재 부담",
  clinical: "임상 불확실성",
  competition: "경쟁 심화",
  governance: "거버넌스 이슈"
};

const toSourceCount = (entry: KospiUniverseEntry) => {
  const sourceFlags = [
    entry.newsCount48h > 0,
    entry.disclosureCount48h > 0,
    Math.abs(entry.changeRate) > 0.2,
    Math.abs(entry.volumeChangeRate) > 5
  ];

  return sourceFlags.filter(Boolean).length + 1;
};

function buildShortScore(entry: KospiUniverseEntry) {
  const newsMomentum = clamp(45 + entry.positiveNewsCount * 8 - entry.negativeNewsCount * 9 + entry.newsCount48h * 2);
  const disclosureImpact = clamp(48 + entry.disclosureCount48h * 11 - entry.riskKeywords.length * 3);
  const trend = clamp(50 + entry.changeRate * 7);
  const volume = clamp(50 + entry.volumeChangeRate * 0.35);
  const eventMaterial = clamp(42 + entry.themeTags.length * 7 + entry.newsCount48h * 2);
  const overheating = clamp(100 - Math.max(0, Math.abs(entry.changeRate) - 4) * 10);
  const riskDisclosure = clamp(88 - entry.riskKeywords.length * 10 - entry.negativeNewsCount * 4);

  return buildScoreBlock("단기 모멘텀", "최근 48시간 뉴스, 공시, 주가 흐름과 이벤트성 재료를 반영했습니다.", [
    { label: "뉴스 모멘텀", value: newsMomentum, weight: 0.22, reason: `48시간 내 뉴스 ${entry.newsCount48h}건 중 긍정 ${entry.positiveNewsCount}건, 부정 ${entry.negativeNewsCount}건을 반영했습니다.` },
    { label: "DART 공시 영향", value: disclosureImpact, weight: 0.18, reason: `최근 공시 ${entry.disclosureCount48h}건이 확인되어 단기 이벤트 강도를 점검했습니다.` },
    { label: "주가 추세", value: trend, weight: 0.18, reason: `최근 등락률 ${entry.changeRate.toFixed(1)}%를 기반으로 추세 강도를 계산했습니다.` },
    { label: "거래량 변화", value: volume, weight: 0.12, reason: `거래량 변화율 ${entry.volumeChangeRate.toFixed(1)}%가 단기 수급 신호에 반영됐습니다.` },
    { label: "이벤트성 재료", value: eventMaterial, weight: 0.12, reason: `테마 ${entry.themeTags.slice(0, 3).join(", ")}가 단기 관심도를 높이는 요인인지 확인했습니다.` },
    { label: "급등 과열 여부", value: overheating, weight: 0.10, reason: `짧은 기간 급등 시 과열 점수를 낮추도록 설계했습니다.` },
    { label: "리스크 공시 여부", value: riskDisclosure, weight: 0.08, reason: `리스크 키워드 ${entry.riskKeywords.length}개와 부정 뉴스 비중을 함께 반영했습니다.` }
  ]);
}

function buildLongScore(entry: KospiUniverseEntry) {
  return buildScoreBlock("장기 펀더멘털", "재무 안정성, 성장성, 산업 구조, 밸류에이션을 함께 본 장기 관점 점수입니다.", [
    { label: "재무 안정성", value: entry.financialStrength, weight: 0.2, reason: "기초 재무 체력과 안정성을 반영했습니다." },
    { label: "실적 성장성", value: entry.growthPotential, weight: 0.18, reason: "중기 이익 성장 가능성과 산업 사이클을 반영했습니다." },
    { label: "현금흐름", value: clamp(entry.financialStrength - 6 + entry.businessMoat * 0.08), weight: 0.12, reason: "재무 체력과 사업 안정성을 기반으로 현금흐름 지속성을 추정했습니다." },
    { label: "산업 전망", value: clamp(48 + entry.themeTags.length * 6 + entry.positiveNewsCount * 3 - entry.negativeNewsCount * 2), weight: 0.12, reason: `산업 테마 ${entry.themeTags.slice(0, 2).join(", ")}와 최근 뉴스 방향을 반영했습니다.` },
    { label: "경쟁우위", value: entry.businessMoat, weight: 0.14, reason: "점유율, 브랜드, 기술력, 고객 락인 가능성을 반영했습니다." },
    { label: "밸류에이션", value: entry.valuationAttractiveness, weight: 0.12, reason: "밸류에이션 매력도를 별도 항목으로 반영했습니다." },
    { label: "거버넌스/리스크", value: clamp(84 - entry.riskKeywords.length * 7), weight: 0.07, reason: "거버넌스 및 구조적 리스크 키워드를 차감 요소로 반영했습니다." },
    { label: "지속 가능성", value: clamp((entry.financialStrength + entry.businessMoat + entry.growthPotential) / 3), weight: 0.05, reason: "재무, 경쟁력, 성장성을 조합해 지속 가능성을 추정했습니다." }
  ]);
}

function buildRiskScore(entry: KospiUniverseEntry) {
  const weightedRisk = entry.riskKeywords.reduce((sum, keyword) => sum + (riskKeywordWeights[keyword] ?? 5), 0);
  const priceRisk = Math.max(0, Math.abs(entry.changeRate) - 3) * 5;
  const volumeRisk = Math.max(0, entry.volumeChangeRate - 35) * 0.5;
  const newsRisk = entry.negativeNewsCount * 6;
  const disclosureRisk = entry.disclosureCount48h > 2 ? 7 : 0;

  return buildScoreBlock("리스크 레벨", "높을수록 변동성, 불확실성, 해석상 주의가 필요한 구간입니다.", [
    { label: "리스크 키워드", value: clamp(35 + weightedRisk), weight: 0.34, reason: entry.riskKeywords.length ? `${entry.riskKeywords.map((keyword) => riskKeywordLabels[keyword] ?? keyword).join(", ")} 요인이 반영됐습니다.` : "뚜렷한 위험 키워드는 제한적입니다." },
    { label: "가격 변동성", value: clamp(40 + priceRisk), weight: 0.18, reason: `최근 등락률 ${entry.changeRate.toFixed(1)}%에 따른 변동성을 점검했습니다.` },
    { label: "거래량 과열", value: clamp(38 + volumeRisk), weight: 0.14, reason: `거래량 변화율 ${entry.volumeChangeRate.toFixed(1)}%가 과열 위험에 반영됐습니다.` },
    { label: "부정 뉴스", value: clamp(38 + newsRisk), weight: 0.16, reason: `48시간 내 부정 뉴스 ${entry.negativeNewsCount}건이 반영됐습니다.` },
    { label: "공시 해석 난도", value: clamp(36 + disclosureRisk + entry.disclosureCount48h * 4), weight: 0.1, reason: "공시 수가 많을수록 해석 난도가 높아질 수 있습니다." },
    { label: "사업/재무 완충력", value: clamp(100 - (entry.financialStrength * 0.45 + entry.businessMoat * 0.35)), weight: 0.08, reason: "재무 체력과 경쟁우위가 리스크 완충 요인으로 작동합니다." }
  ]);
}

function buildConfidence(entry: KospiUniverseEntry) {
  const freshness = clamp(60 + entry.newsCount48h * 4 + entry.disclosureCount48h * 8);
  const sourceDiversity = clamp(toSourceCount(entry) * 19);
  const dataDepth = clamp((entry.financialStrength + entry.businessMoat + entry.growthPotential) / 3);
  const confidence = clamp(freshness * 0.35 + sourceDiversity * 0.35 + dataDepth * 0.3);

  let confidenceLabel = "보통";
  if (confidence >= 80) confidenceLabel = "높음";
  else if (confidence >= 65) confidenceLabel = "양호";
  else if (confidence < 50) confidenceLabel = "제한적";

  const confidenceSummary =
    confidence >= 80
      ? "뉴스, 공시, 가격 데이터가 함께 들어와 근거 밀도가 높은 편입니다."
      : confidence >= 65
        ? "다수의 최근 데이터가 있어 리서치 참고용으로 무난합니다."
        : confidence >= 50
          ? "핵심 신호는 있으나 일부 항목은 보수적으로 해석할 필요가 있습니다."
          : "최근 근거 수가 많지 않아 탐색적 참고 수준으로 보는 편이 좋습니다.";

  return { confidence, confidenceLabel, confidenceSummary };
}

function buildReasons(entry: KospiUniverseEntry, shortScore: number, longScore: number) {
  const reasons = [
    `${entry.newsCount48h}건의 최근 뉴스 중 긍정 ${entry.positiveNewsCount}건이 반영돼 단기 관심도가 유지되고 있습니다.`,
    `거래량 변화율 ${entry.volumeChangeRate.toFixed(1)}%와 등락률 ${entry.changeRate.toFixed(1)}%가 수급 변화 가능성을 보여줍니다.`,
    `${entry.themeTags.slice(0, 2).join(", ")} 테마가 최근 산업 관심 축과 맞물려 있습니다.`,
    `재무 안정성 ${entry.financialStrength}점과 경쟁우위 ${entry.businessMoat}점이 장기 해석의 바탕이 됩니다.`,
    `밸류에이션 매력도 ${entry.valuationAttractiveness}점으로 상대 가치 재검토 여지가 있습니다.`,
    `공시 ${entry.disclosureCount48h}건이 있어 기업 이벤트를 함께 점검할 수 있습니다.`
  ];

  const sorted = [...reasons].sort((a, b) => {
    if (shortScore >= longScore) return a.length - b.length;
    return b.length - a.length;
  });

  return sorted.slice(0, 3);
}

function buildRisks(entry: KospiUniverseEntry) {
  const risks = [
    `${entry.riskKeywords.length ? entry.riskKeywords.map((keyword) => riskKeywordLabels[keyword] ?? keyword).slice(0, 2).join(", ") : "뚜렷한 위험 키워드 부재"} 관련 변수는 추가 확인이 필요합니다.`,
    `부정 뉴스 ${entry.negativeNewsCount}건과 공시 ${entry.disclosureCount48h}건은 해석 방향에 따라 단기 변동성을 키울 수 있습니다.`,
    `${entry.sector} 업종 특성상 업황 사이클과 대외 변수에 민감할 수 있습니다.`,
    `최근 등락률 ${entry.changeRate.toFixed(1)}% 구간이라 과열 또는 되돌림 여부를 함께 봐야 합니다.`,
    `밸류에이션 매력도 ${entry.valuationAttractiveness}점은 업종 평균과 비교 검증이 필요합니다.`
  ];

  return risks.slice(0, 3);
}

function buildSparkline(entry: KospiUniverseEntry) {
  const start = entry.price * (1 - entry.changeRate / 100);
  const drift = (entry.price - start) / 9;

  return Array.from({ length: 10 }, (_, index) => {
    const directionBias = entry.positiveNewsCount >= entry.negativeNewsCount ? 1 : -1;
    const noise = ((index % 3) - 1) * (entry.volumeChangeRate * 0.0025) * directionBias;
    const close = Math.max(1000, Math.round(start + drift * index + entry.price * noise * 0.08));

    return {
      date: `D-${9 - index}`,
      close,
      volume: Math.round(1000000 + index * 75000 + entry.volumeChangeRate * 12000)
    };
  });
}

export function candidateFromUniverse(entry: KospiUniverseEntry, dataMode: DataMode = "mock"): CandidateStock {
  const shortScore = buildShortScore(entry);
  const longScore = buildLongScore(entry);
  const riskScore = buildRiskScore(entry);
  const { confidence, confidenceLabel, confidenceSummary } = buildConfidence(entry);

  return {
    name: entry.name,
    code: entry.code,
    market: entry.market,
    sector: entry.sector,
    industry: entry.industry,
    themeTags: entry.themeTags,
    currentPrice: entry.price,
    changeRate: entry.changeRate,
    confidence,
    confidenceLabel,
    confidenceSummary,
    shortScore,
    longScore,
    riskScore,
    keyReasons: buildReasons(entry, shortScore.score, longScore.score),
    majorRisks: buildRisks(entry),
    dataMode,
    priceHistory: buildSparkline(entry),
    newsCount: entry.newsCount48h,
    disclosureCount: entry.disclosureCount48h,
    sourceCount: toSourceCount(entry),
    updatedAt: new Date().toISOString()
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
