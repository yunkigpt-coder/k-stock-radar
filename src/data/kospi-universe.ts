import type { KospiUniverseEntry } from "@/lib/types";

export const kospiUniverse: KospiUniverseEntry[] = [
  {
    name: "삼성전자",
    code: "005930",
    market: "KOSPI",
    sector: "반도체",
    industry: "메모리·시스템 반도체",
    themeTags: ["AI", "HBM", "메모리"],
    marketCap: 471,
    price: 78900,
    changeRate: 1.4,
    volumeChangeRate: 42,
    newsCount48h: 5,
    disclosureCount48h: 1,
    positiveNewsCount: 3,
    negativeNewsCount: 1,
    riskKeywords: ["memory_cycle", "currency"],
    financialStrength: 89,
    growthPotential: 83,
    valuationAttractiveness: 66,
    businessMoat: 90
  },
  {
    name: "SK하이닉스",
    code: "000660",
    market: "KOSPI",
    sector: "반도체",
    industry: "메모리 반도체",
    themeTags: ["AI", "HBM", "서버"],
    marketCap: 172,
    price: 236500,
    changeRate: 2.2,
    volumeChangeRate: 78,
    newsCount48h: 7,
    disclosureCount48h: 1,
    positiveNewsCount: 5,
    negativeNewsCount: 1,
    riskKeywords: ["overheating", "customer_concentration"],
    financialStrength: 72,
    growthPotential: 91,
    valuationAttractiveness: 60,
    businessMoat: 87
  },
  {
    name: "메리츠금융지주",
    code: "138040",
    market: "KOSPI",
    sector: "금융",
    industry: "금융지주·증권·보험",
    themeTags: ["배당", "자사주", "주주환원"],
    marketCap: 17,
    price: 98300,
    changeRate: 0.8,
    volumeChangeRate: 24,
    newsCount48h: 2,
    disclosureCount48h: 1,
    positiveNewsCount: 1,
    negativeNewsCount: 0,
    riskKeywords: ["regulation", "interest_rate"],
    financialStrength: 88,
    growthPotential: 64,
    valuationAttractiveness: 79,
    businessMoat: 78
  },
  {
    name: "현대차",
    code: "005380",
    market: "KOSPI",
    sector: "자동차",
    industry: "완성차",
    themeTags: ["전기차", "하이브리드", "수출"],
    marketCap: 57,
    price: 274000,
    changeRate: 1.1,
    volumeChangeRate: 31,
    newsCount48h: 4,
    disclosureCount48h: 1,
    positiveNewsCount: 2,
    negativeNewsCount: 1,
    riskKeywords: ["currency", "demand_slowdown"],
    financialStrength: 80,
    growthPotential: 71,
    valuationAttractiveness: 79,
    businessMoat: 79
  },
  {
    name: "기아",
    code: "000270",
    market: "KOSPI",
    sector: "자동차",
    industry: "완성차",
    themeTags: ["전기차", "판매 믹스", "수출"],
    marketCap: 48,
    price: 123500,
    changeRate: 0.9,
    volumeChangeRate: 22,
    newsCount48h: 3,
    disclosureCount48h: 1,
    positiveNewsCount: 2,
    negativeNewsCount: 0,
    riskKeywords: ["competition", "currency"],
    financialStrength: 82,
    growthPotential: 74,
    valuationAttractiveness: 78,
    businessMoat: 81
  },
  {
    name: "셀트리온",
    code: "068270",
    market: "KOSPI",
    sector: "바이오",
    industry: "바이오시밀러",
    themeTags: ["바이오", "허가", "파이프라인"],
    marketCap: 40,
    price: 184700,
    changeRate: -0.3,
    volumeChangeRate: 12,
    newsCount48h: 3,
    disclosureCount48h: 1,
    positiveNewsCount: 1,
    negativeNewsCount: 1,
    riskKeywords: ["clinical", "competition"],
    financialStrength: 68,
    growthPotential: 78,
    valuationAttractiveness: 54,
    businessMoat: 74
  },
  {
    name: "KB금융",
    code: "105560",
    market: "KOSPI",
    sector: "금융",
    industry: "은행지주",
    themeTags: ["배당", "금리", "자본비율"],
    marketCap: 36,
    price: 91100,
    changeRate: 0.6,
    volumeChangeRate: 16,
    newsCount48h: 2,
    disclosureCount48h: 1,
    positiveNewsCount: 1,
    negativeNewsCount: 0,
    riskKeywords: ["credit_cost", "regulation"],
    financialStrength: 86,
    growthPotential: 61,
    valuationAttractiveness: 84,
    businessMoat: 82
  },
  {
    name: "NAVER",
    code: "035420",
    market: "KOSPI",
    sector: "플랫폼",
    industry: "인터넷·광고",
    themeTags: ["AI", "광고", "커머스"],
    marketCap: 31,
    price: 192400,
    changeRate: -0.5,
    volumeChangeRate: 18,
    newsCount48h: 4,
    disclosureCount48h: 1,
    positiveNewsCount: 2,
    negativeNewsCount: 1,
    riskKeywords: ["regulation", "ad_cycle"],
    financialStrength: 72,
    growthPotential: 69,
    valuationAttractiveness: 58,
    businessMoat: 73
  }
];

export const kospiUniverseSectors = ["전체", ...Array.from(new Set(kospiUniverse.map((item) => item.sector)))];

const queryAliases: Record<string, string> = {
  "sk하이닉스": "000660",
  "하이닉스": "000660",
  "sk hynix": "000660",
  "삼성전자": "005930",
  "삼성": "005930",
  samsung: "005930",
  "메리츠금융지주": "138040",
  "메리츠": "138040",
  meritz: "138040",
  "현대차": "005380",
  "기아": "000270",
  "셀트리온": "068270",
  "kb금융": "105560",
  naver: "035420",
  "네이버": "035420"
};

export function findKospiUniverseEntry(query?: string) {
  const normalized = (query ?? "").trim().toLowerCase();
  if (!normalized) return kospiUniverse[1] ?? kospiUniverse[0];

  const aliasedCode = queryAliases[normalized];
  if (aliasedCode) return kospiUniverse.find((item) => item.code === aliasedCode) ?? kospiUniverse[0];

  return (
    kospiUniverse.find((item) => item.name.toLowerCase() === normalized) ??
    kospiUniverse.find((item) => item.code === normalized) ??
    kospiUniverse.find((item) => item.name.toLowerCase().includes(normalized) || item.code.includes(normalized)) ??
    kospiUniverse[0]
  );
}
