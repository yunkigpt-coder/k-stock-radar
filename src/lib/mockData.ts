import { findKospiUniverseEntry, kospiUniverse } from "@/data/kospi-universe";
import { candidateFromUniverse } from "./screener";
import type { CandidateStock, CompanyAnalysis, DataMode } from "./types";

const nowIso = () => new Date().toISOString();

function buildMockCompany(query?: string): CompanyAnalysis {
  const entry = findKospiUniverseEntry(query);
  const candidate = candidateFromUniverse(entry, "mock");

  return {
    name: entry.name,
    code: entry.code,
    corpCode: entry.code.padStart(8, "0"),
    market: entry.market,
    sector: entry.sector,
    industry: entry.industry,
    themeTags: entry.themeTags,
    currentPrice: entry.price,
    changeRate: entry.changeRate,
    marketCap: `${entry.marketCap.toLocaleString("ko-KR")}억원`,
    overview: `${entry.name}는 ${entry.market} 상장 ${entry.industry} 기업으로, Demo Mode 기준 리서치 예시 데이터를 제공합니다.`,
    dataMode: "mock",
    generatedAt: nowIso(),
    confidence: candidate.confidence,
    confidenceReason: candidate.confidenceSummary,
    shortScore: candidate.shortScore,
    longScore: candidate.longScore,
    riskScore: candidate.riskScore,
    keyReasons: candidate.keyReasons,
    majorRisks: candidate.majorRisks,
    news: [
      {
        title: `${entry.name} 관련 최근 뉴스 요약`,
        source: "Demo Market News",
        publishedAt: nowIso(),
        sentiment: "neutral",
        summary: "Demo Mode에서는 수집 구조를 보여주기 위한 예시 뉴스가 사용됩니다."
      }
    ],
    disclosures: [
      {
        title: `${entry.name} 최근 공시 예시`,
        type: "공시",
        reportedAt: nowIso(),
        sentiment: "neutral",
        impact: "medium",
        summary: "Demo Mode에서는 공시 연동 구조를 보여주기 위한 예시 데이터가 사용됩니다."
      }
    ],
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
      valuationNote: "실제 API 연결 시 재무 요약이 상세하게 대체됩니다."
    },
    priceHistory: candidate.priceHistory,
    threeC: {
      company: "Demo company view",
      customer: "Demo customer view",
      competitor: "Demo competitor view"
    },
    swot: {
      strengths: ["Demo strength"],
      weaknesses: ["Demo weakness"],
      opportunities: ["Demo opportunity"],
      threats: ["Demo threat"]
    },
    shortComment: "Demo short comment",
    longComment: "Demo long comment",
    aiCounterOpinion: ["Demo counter opinion"],
    finalComment: "Demo Mode 리서치 스탠스입니다."
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
