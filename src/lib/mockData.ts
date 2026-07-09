import { findKospiUniverseEntry, kospiUniverse } from "@/data/kospi-universe";
import { candidateFromUniverse } from "./screener";
import type { CandidateStock, CompanyAnalysis, DataMode } from "./types";

const nowIso = () => new Date().toISOString();

function buildMockCompany(query?: string): CompanyAnalysis {
  const entry = findKospiUniverseEntry(query);
  const candidate = candidateFromUniverse(entry, "mock");
  const now = nowIso();

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
    overview: `${entry.name}의 기본 리서치 상태입니다.`,
    dataMode: "mock",
    generatedAt: now,
    confidence: candidate.confidence,
    confidenceReason: candidate.confidenceSummary,
    shortScore: candidate.shortScore,
    longScore: candidate.longScore,
    riskScore: candidate.riskScore,
    keyReasons: candidate.keyReasons,
    majorRisks: candidate.majorRisks,
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
      valuationNote: "실제 재무 API가 없을 때는 참고용 기본 상태로 표시합니다."
    },
    priceHistory: [],
    chartDataSource: "actual",
    chartSource: "사용 불가",
    chartStatus: "unavailable",
    chartDataReason: "과거 시세 데이터를 불러오지 못했습니다.",
    priceDataSource: "mock",
    quoteSource: undefined,
    isDemoPrice: true,
    isMarketData: false,
    threeC: {
      company: `${entry.name}의 사업 구조를 확인해야 합니다.`,
      customer: "수요 환경과 고객 기반을 확인해야 합니다.",
      competitor: "경쟁사 대비 차별화 포인트를 확인해야 합니다."
    },
    swot: {
      strengths: ["핵심 사업의 경쟁력을 확인해야 합니다."],
      weaknesses: ["업황 민감도와 수익성 변동성을 확인해야 합니다."],
      opportunities: ["뉴스와 공시 모멘텀이 실적 개선으로 이어지는지 확인해야 합니다."],
      threats: ["규제, 환율, 경쟁 심화 등 외부 변수를 확인해야 합니다."]
    },
    shortComment: "단기 관점은 최신 뉴스와 가격 흐름 확인이 필요합니다.",
    longComment: "장기 관점은 재무 안정성과 경쟁력 확인이 필요합니다.",
    aiCounterOpinion: ["데이터가 부족할 때는 원문 자료와 최신 시세 확인이 우선입니다."],
    finalComment: "리서치 보조 자료로만 활용해 주세요."
  };
}

export const mockCompanies: CompanyAnalysis[] = kospiUniverse.slice(0, 5).map((entry) => buildMockCompany(entry.name));
export const mockCandidates: CandidateStock[] = kospiUniverse.slice(0, 5).map((entry) => candidateFromUniverse(entry, "mock"));
export const findMockCompany = (query?: string): CompanyAnalysis => buildMockCompany(query);

export const markDataMode = (company: CompanyAnalysis, dataMode: DataMode): CompanyAnalysis => ({
  ...company,
  dataMode,
  generatedAt: nowIso()
});
