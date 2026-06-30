import { findKospiUniverseEntry, kospiUniverse } from "@/data/kospi-universe";
import { buildScoreBlock } from "./scoring";
import { candidateFromUniverse, screenKospiCandidates, type ScreenerSort } from "./screener";
import type {
  CompanyAnalysis,
  DataMode,
  DisclosureItem,
  FinancialSnapshot,
  KospiUniverseEntry,
  NewsItem,
  PricePoint,
  RecommendResponse
} from "./types";

const DART_BASE_URL = "https://opendart.fss.or.kr/api/list.json";

const toYmd = (date: Date) =>
  `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;

const fromYmd = (value?: string) => {
  if (!value || value.length !== 8) return new Date().toISOString();
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T09:00:00+09:00`;
};

const sectorIndustryOutlook: Record<string, string> = {
  반도체: "AI 인프라와 고성능 메모리 수요가 업황을 좌우하는 구간입니다.",
  자동차: "전동화, 믹스 개선, 환율이 실적 해석의 핵심 축입니다.",
  "2차전지": "증설 속도와 수요 정상화 시점, 원재료 가격이 중요합니다.",
  바이오: "임상 이벤트와 기술이전 가능성이 밸류 재평가의 핵심입니다.",
  금융: "금리 경로와 대손비용 안정화가 업종 방향성에 큰 영향을 줍니다.",
  플랫폼: "광고·커머스·구독 수익 다변화와 규제 해석이 중요합니다.",
  통신: "안정적 현금흐름과 신사업 확장성이 장기 관점 포인트입니다.",
  조선: "수주잔고와 후판가, 고부가 선종 비중이 핵심입니다.",
  화학: "스프레드 개선과 전방 수요 회복 여부가 실적을 좌우합니다.",
  철강: "원가와 판매단가, 중국 공급 환경이 변수가 됩니다.",
  유통: "소비 회복, 점포 효율화, 온라인 경쟁력이 동시에 중요합니다.",
  에너지: "정제마진, 전력 수요, 정책 방향성이 수익 변동성을 만듭니다."
};

const riskKeywordLabels: Record<string, string> = {
  litigation: "소송",
  recall: "리콜",
  regulation: "규제",
  debt: "차입부담",
  slowdown: "수요둔화",
  inventory: "재고조정",
  dilution: "희석",
  volatility: "변동성",
  currency: "환율",
  margin: "수익성압박",
  geopolitics: "지정학",
  commodity: "원자재",
  clinical: "임상",
  competition: "경쟁심화",
  governance: "거버넌스"
};

const hasEnv = (value?: string) => Boolean(value && value.trim().length > 0);

const detectSentiment = (text: string): NewsItem["sentiment"] => {
  const lower = text.toLowerCase();
  if (/(수주|확대|개선|성장|증가|호조|협력|계약|상향|안정)/.test(lower)) return "positive";
  if (/(둔화|소송|규제|부담|하락|감소|변동성|우려|리콜|차질)/.test(lower)) return "negative";
  return "neutral";
};

function buildPriceHistory(entry: KospiUniverseEntry): PricePoint[] {
  const monthSpan = 12;
  const base = entry.price * (1 - entry.changeRate / 100);

  return Array.from({ length: monthSpan }, (_, index) => {
    const ratio = index / (monthSpan - 1);
    const trend = base + (entry.price - base) * ratio;
    const cycle = Math.sin(index * 0.9) * (entry.price * 0.028);
    const volatility = entry.volumeChangeRate * 18 * ((index % 2 === 0 ? 1 : -1) * 0.18);
    const close = Math.max(1000, Math.round(trend + cycle + volatility));
    const month = String(index + 1).padStart(2, "0");

    return {
      date: `2026-${month}`,
      close,
      volume: Math.max(100000, Math.round((entry.marketCap / 30) * (0.8 + ratio * 0.4) + entry.volumeChangeRate * 25000))
    };
  });
}

function buildDemoNews(entry: KospiUniverseEntry): NewsItem[] {
  const now = Date.now();
  const themes = entry.themeTags.slice(0, 3);
  const positiveCount = Math.max(1, Math.min(entry.positiveNewsCount, 3));
  const negativeCount = Math.min(entry.negativeNewsCount, 2);
  const neutralCount = Math.max(1, Math.min(entry.newsCount48h - positiveCount - negativeCount, 2));
  const items: NewsItem[] = [];

  for (let index = 0; index < positiveCount; index += 1) {
    items.push({
      title: `${entry.name}, ${themes[index % themes.length] ?? entry.sector} 관련 기대감 부각`,
      source: ["연합인포맥스", "매일경제", "한국경제"][index % 3],
      publishedAt: new Date(now - index * 5 * 60 * 60 * 1000).toISOString(),
      sentiment: "positive",
      summary: `${entry.name}는 ${themes[index % themes.length] ?? entry.sector} 이슈와 연결되며 최근 데이터상 관심도가 높아졌습니다. 거래량과 뉴스 흐름이 동시에 증가해 단기 모멘텀 지표에 반영됐습니다.`
    });
  }

  for (let index = 0; index < negativeCount; index += 1) {
    const risk = riskKeywordLabels[entry.riskKeywords[index] ?? "volatility"] ?? "변동성";
    items.push({
      title: `${entry.name}, ${risk} 변수 점검 필요`,
      source: ["이데일리", "서울경제"][index % 2],
      publishedAt: new Date(now - (positiveCount + index + 1) * 6 * 60 * 60 * 1000).toISOString(),
      sentiment: "negative",
      summary: `${entry.name}는 최근 ${risk} 관련 해석이 필요하다는 점이 부각됐습니다. 리서치 관점에서는 이벤트의 일회성 여부와 후속 공시를 함께 확인하는 편이 좋습니다.`
    });
  }

  for (let index = 0; index < neutralCount; index += 1) {
    items.push({
      title: `${entry.name}, ${entry.industry} 업황 점검 리포트`,
      source: ["더벨", "아시아경제"][index % 2],
      publishedAt: new Date(now - (positiveCount + negativeCount + index + 1) * 7 * 60 * 60 * 1000).toISOString(),
      sentiment: "neutral",
      summary: `${entry.industry} 업황과 ${entry.name}의 포지셔닝을 함께 다룬 기사입니다. 방향성보다는 데이터 보강 성격이 강해 중립 근거로 반영했습니다.`
    });
  }

  return items.slice(0, Math.max(3, Math.min(entry.newsCount48h, 6)));
}

function buildDemoDisclosures(entry: KospiUniverseEntry): DisclosureItem[] {
  const types = ["수시공시", "주요사항보고", "실적발표", "사업보고"];

  return Array.from({ length: Math.max(1, Math.min(entry.disclosureCount48h, 4)) }, (_, index) => {
    const titleSeed =
      index === 0
        ? `${entry.name} ${entry.themeTags[0] ?? entry.sector} 관련 공시 점검`
        : index === 1
          ? `${entry.name} 실적 가이던스 및 투자 계획 공시`
          : `${entry.name} 일반 공시 업데이트`;
    const sentiment = detectSentiment(titleSeed);

    return {
      title: titleSeed,
      type: types[index % types.length],
      reportedAt: new Date(Date.now() - index * 9 * 60 * 60 * 1000).toISOString(),
      sentiment,
      impact: index === 0 ? "high" : index === 1 ? "medium" : "low",
      summary: `${entry.name}의 최근 공시 흐름을 기반으로 만든 데모 요약입니다. 실제 제출 환경에서는 OpenDART, KRX 공시 원문과 함께 해석하는 구조로 확장할 수 있습니다.`
    };
  });
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
    revenue: `${Math.round(revenue).toLocaleString("ko-KR")}억원`,
    operatingProfit: `${Math.round(operatingProfit).toLocaleString("ko-KR")}억원`,
    netIncome: `${Math.round(netIncome).toLocaleString("ko-KR")}억원`,
    revenueGrowth: `${Number(revenueGrowth) > 0 ? "+" : ""}${revenueGrowth}%`,
    operatingMargin: `${operatingMargin}%`,
    debtRatio: `${debtRatio}%`,
    freeCashFlow: `${Math.round(freeCashFlow).toLocaleString("ko-KR")}억원`,
    roe: `${roe}%`,
    per: `${per}배`,
    pbr: `${pbr}배`,
    valuationNote: `${entry.valuationAttractiveness}점의 밸류에이션 매력도는 ${entry.sector} 업종 내 상대 비교 관점에서 해석할 여지가 있습니다.`
  };
}

function buildThreeC(entry: KospiUniverseEntry) {
  return {
    company: `${entry.name}는 ${entry.industry} 내에서 ${entry.themeTags.slice(0, 2).join(", ")} 축에 강점을 둔 기업으로 해석됩니다.`,
    customer: `${entry.sector} 수요처는 가격 경쟁력보다 공급 안정성, 기술 대응, 납기 신뢰도를 중시하는 경향이 있습니다.`,
    competitor: `동일 업종 경쟁사와 비교할 때 ${entry.businessMoat}점의 경쟁우위는 점유율, 브랜드, 기술 포지션 관점에서 무난한 수준입니다.`
  };
}

function buildSwot(entry: KospiUniverseEntry) {
  return {
    strengths: [
      `${entry.financialStrength}점의 재무 안정성`,
      `${entry.businessMoat}점의 사업 경쟁력`,
      `${entry.themeTags[0] ?? entry.sector} 관련 노출`
    ],
    weaknesses: [
      entry.riskKeywords.length ? `${riskKeywordLabels[entry.riskKeywords[0]] ?? entry.riskKeywords[0]} 변수` : "데이터상 뚜렷한 약점 제한적",
      `단기 변동성 ${Math.abs(entry.changeRate).toFixed(1)}%`,
      `${entry.industry} 업황 민감도`
    ],
    opportunities: [
      sectorIndustryOutlook[entry.sector] ?? "산업 재평가 가능성",
      `${entry.themeTags.slice(0, 2).join(", ")} 관련 수요 확대`,
      "공시와 뉴스 흐름 개선 시 재평가 가능성"
    ],
    threats: [
      entry.riskKeywords.length ? `${riskKeywordLabels[entry.riskKeywords[0]] ?? entry.riskKeywords[0]} 확대 가능성` : "대외 변수 확대 가능성",
      "시장 변동성 확대",
      "예상보다 느린 업황 회복"
    ]
  };
}

function buildOverview(entry: KospiUniverseEntry) {
  const outlook = sectorIndustryOutlook[entry.sector] ?? `${entry.sector} 업황 변화가 중요한 기업입니다.`;
  return `${entry.name}는 ${entry.market} 상장 ${entry.industry} 기업으로, 최근 48시간 동안 뉴스 ${entry.newsCount48h}건과 공시 ${entry.disclosureCount48h}건이 포착됐습니다. ${outlook}`;
}

function buildDemoAnalysis(entry: KospiUniverseEntry, dataMode: DataMode): CompanyAnalysis {
  const candidate = candidateFromUniverse(entry, dataMode);
  const financials = buildFinancials(entry);
  const priceHistory = buildPriceHistory(entry);
  const news = buildDemoNews(entry);
  const disclosures = buildDemoDisclosures(entry);

  const confidenceReason = `${candidate.confidenceSummary} 최근 뉴스 ${entry.newsCount48h}건, 공시 ${entry.disclosureCount48h}건, 테마 ${entry.themeTags.length}개가 함께 반영됐습니다.`;

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
    overview: buildOverview(entry),
    dataMode,
    generatedAt: new Date().toISOString(),
    confidence: candidate.confidence,
    confidenceReason,
    shortScore: candidate.shortScore,
    longScore: candidate.longScore,
    riskScore: candidate.riskScore,
    keyReasons: candidate.keyReasons,
    majorRisks: candidate.majorRisks,
    news,
    disclosures,
    financials,
    priceHistory,
    threeC: buildThreeC(entry),
    swot: buildSwot(entry),
    shortComment: `${entry.name}의 단기 모멘텀은 뉴스와 거래량 변화가 만들어낸 관심 신호가 핵심입니다. 다만 ${candidate.majorRisks[0]} 여부를 함께 봐야 과열 해석을 피할 수 있습니다.`,
    longComment: `${entry.name}의 장기 해석은 재무 안정성 ${entry.financialStrength}점, 성장성 ${entry.growthPotential}점, 경쟁우위 ${entry.businessMoat}점을 중심으로 읽는 편이 합리적입니다.`,
    aiCounterOpinion: [
      "최근 뉴스 흐름이 강해 보여도 실제 실적 반영까지 시간이 걸릴 수 있습니다.",
      "업종 기대감이 선반영된 상태라면 밸류에이션 재평가 여지가 크지 않을 수 있습니다.",
      "공시 해석 방향이 바뀌면 단기 모멘텀과 장기 논리가 동시에 약해질 수 있습니다."
    ],
    finalComment: `${entry.name}는 최근 데이터상 검토 우선순위를 올려볼 만한 종목이지만, 이는 매수/매도 의견이 아니라 뉴스·공시·재무 신호를 정리한 리서치 스탠스입니다.`
  };
}

async function fetchOpenDartDisclosures(company: CompanyAnalysis): Promise<DisclosureItem[]> {
  const apiKey = process.env.OPEN_DART_API_KEY;
  if (!apiKey) return [];

  const end = new Date();
  const begin = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const url = new URL(DART_BASE_URL);
  url.searchParams.set("crtfc_key", apiKey);
  url.searchParams.set("corp_code", company.corpCode);
  url.searchParams.set("bgn_de", toYmd(begin));
  url.searchParams.set("end_de", toYmd(end));
  url.searchParams.set("page_count", "10");

  try {
    const response = await fetch(url, { next: { revalidate: 300 } });
    if (!response.ok) return [];
    const payload = (await response.json()) as {
      list?: Array<{ report_nm?: string; rcept_dt?: string; rcept_no?: string; rm?: string }>;
    };

    return (payload.list ?? []).slice(0, 6).map((item) => {
      const title = item.report_nm ?? "DART 공시";
      return {
        title,
        type: item.rm ?? "공시",
        reportedAt: fromYmd(item.rcept_dt),
        sentiment: detectSentiment(title),
        impact: /(계약|증자|실적|영업|소송|정정)/i.test(title) ? "high" : "medium",
        summary: "OpenDART에서 수집한 최근 공시입니다. 원문과 정정 여부를 함께 확인하는 편이 좋습니다.",
        url: item.rcept_no ? `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${item.rcept_no}` : undefined
      };
    });
  } catch {
    return [];
  }
}

async function fetchNews(company: CompanyAnalysis): Promise<NewsItem[]> {
  const apiKey = process.env.NEWS_API_KEY;
  const endpoint = process.env.NEWS_API_URL || "https://newsapi.org/v2/everything";
  if (!apiKey) return [];

  try {
    const url = new URL(endpoint);
    url.searchParams.set("q", `${company.name} 주식 OR ${company.code}`);
    url.searchParams.set("language", "ko");
    url.searchParams.set("from", new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString());
    url.searchParams.set("sortBy", "publishedAt");
    url.searchParams.set("pageSize", "8");
    url.searchParams.set("apiKey", apiKey);

    const response = await fetch(url, { next: { revalidate: 300 } });
    if (!response.ok) return [];
    const payload = (await response.json()) as {
      articles?: Array<{ title?: string; source?: { name?: string }; publishedAt?: string; description?: string; url?: string }>;
      items?: Array<{ title?: string; publisher?: string; pubDate?: string; description?: string; link?: string }>;
    };
    const articles =
      payload.articles?.map((article) => ({
        title: article.title,
        source: article.source?.name,
        publishedAt: article.publishedAt,
        description: article.description,
        url: article.url
      })) ??
      payload.items?.map((item) => ({
        title: item.title,
        source: item.publisher,
        publishedAt: item.pubDate,
        description: item.description,
        url: item.link
      })) ??
      [];

    return articles.slice(0, 6).map((article) => {
      const title = article.title ?? `${company.name} 관련 뉴스`;
      const summary = article.description ?? "외부 뉴스 API에서 수집한 기사입니다. 원문 출처와 게시 시각을 함께 확인하는 편이 좋습니다.";
      return {
        title,
        source: article.source ?? "News API",
        publishedAt: article.publishedAt ?? new Date().toISOString(),
        sentiment: detectSentiment(`${title} ${summary}`),
        summary,
        url: article.url
      };
    });
  } catch {
    return [];
  }
}

async function fetchStockChart(company: CompanyAnalysis): Promise<Partial<CompanyAnalysis>> {
  const baseUrl = process.env.STOCK_API_BASE_URL;
  const apiKey = process.env.STOCK_API_KEY;
  if (!baseUrl || !apiKey) return {};

  try {
    const quoteUrl = new URL(`${baseUrl.replace(/\/$/, "")}/quote`);
    quoteUrl.searchParams.set("symbol", company.code);
    const quoteResponse = await fetch(quoteUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 120 }
    });
    if (!quoteResponse.ok) return {};

    const quote = (await quoteResponse.json()) as {
      currentPrice?: number;
      price?: number;
      changeRate?: number;
      chart?: PricePoint[];
    };

    return {
      currentPrice: quote.currentPrice ?? quote.price ?? company.currentPrice,
      changeRate: quote.changeRate ?? company.changeRate,
      priceHistory: Array.isArray(quote.chart) && quote.chart.length > 0 ? quote.chart : company.priceHistory
    };
  } catch {
    return {};
  }
}

function rebuildNarrativeBlocks(base: CompanyAnalysis, entry: KospiUniverseEntry) {
  const liveNewsCount = base.news.filter((item) => item.sentiment === "positive").length;
  const liveNegativeCount = base.news.filter((item) => item.sentiment === "negative").length;
  const liveDisclosureCount = base.disclosures.length;
  const disclosureWeight = Math.min(20, liveDisclosureCount * 4);
  const sentimentDelta = (liveNewsCount - liveNegativeCount) * 5;

  const shortScore = buildScoreBlock("단기 모멘텀", "수집된 뉴스, 공시, 가격 데이터를 기준으로 재계산한 단기 점수입니다.", [
    { label: "뉴스 모멘텀", value: Math.max(0, Math.min(100, base.shortScore.score + sentimentDelta)), weight: 0.28, reason: `실제 수집 뉴스에서 긍정 ${liveNewsCount}건, 주의 ${liveNegativeCount}건이 확인됐습니다.` },
    { label: "공시 영향", value: Math.max(0, Math.min(100, 52 + disclosureWeight)), weight: 0.2, reason: `최근 공시 ${liveDisclosureCount}건을 반영했습니다.` },
    { label: "주가 추세", value: Math.max(0, Math.min(100, 50 + base.changeRate * 7)), weight: 0.18, reason: `현재 등락률 ${base.changeRate.toFixed(1)}%를 반영했습니다.` },
    { label: "거래량/관심도", value: Math.max(0, Math.min(100, base.shortScore.breakdown[3]?.value ?? 55)), weight: 0.12, reason: "데모 스크리닝 기반 관심도 항목을 유지했습니다." },
    { label: "이벤트성 재료", value: Math.max(0, Math.min(100, base.shortScore.breakdown[4]?.value ?? 55)), weight: 0.12, reason: "테마와 최근 기사 키워드를 함께 고려했습니다." },
    { label: "과열/리스크 공시", value: Math.max(0, Math.min(100, 100 - base.riskScore.score * 0.45)), weight: 0.1, reason: "리스크 점수와 공시 난도를 함께 반영했습니다." }
  ]);

  const confidenceReason = hasEnv(process.env.NEWS_API_KEY) || hasEnv(process.env.OPEN_DART_API_KEY) || hasEnv(process.env.STOCK_API_KEY)
    ? `실제 API 데이터가 일부 결합됐습니다. 뉴스 ${base.news.length}건, 공시 ${base.disclosures.length}건, 가격 데이터가 분석 근거에 포함됐습니다.`
    : base.confidenceReason;

  return {
    shortScore,
    confidenceReason,
    finalComment: `${entry.name}에 대한 현재 리서치 스탠스는 수집 데이터의 방향성을 압축한 결과입니다. 실제 투자 판단 전에는 원문 공시와 최신 체결 흐름을 함께 확인하는 편이 좋습니다.`
  };
}

export async function getRecommendedCandidates(options?: {
  limit?: number | null;
  sector?: string | null;
  sort?: ScreenerSort | null;
}): Promise<RecommendResponse> {
  const hasLiveKeys = Boolean(process.env.OPEN_DART_API_KEY || process.env.NEWS_API_KEY || process.env.STOCK_API_BASE_URL);
  const dataMode: DataMode = hasLiveKeys ? "hybrid" : "mock";

  return screenKospiCandidates(kospiUniverse, {
    limit: options?.limit,
    sector: options?.sector,
    sort: options?.sort,
    dataMode
  });
}

export async function getCompanyResearch(query?: string): Promise<CompanyAnalysis> {
  const entry = findKospiUniverseEntry(query);
  const hasLiveKeys = Boolean(process.env.OPEN_DART_API_KEY || process.env.NEWS_API_KEY || process.env.STOCK_API_BASE_URL);
  const baseMode: DataMode = hasLiveKeys ? "hybrid" : "mock";
  const base = buildDemoAnalysis(entry, baseMode);
  const [news, disclosures, market] = await Promise.all([
    fetchNews(base),
    fetchOpenDartDisclosures(base),
    fetchStockChart(base)
  ]);

  const merged: CompanyAnalysis = {
    ...base,
    ...market,
    news: news.length > 0 ? news : base.news,
    disclosures: disclosures.length > 0 ? disclosures : base.disclosures
  };

  if (news.length > 0 || disclosures.length > 0 || Object.keys(market).length > 0) {
    const rebuilt = rebuildNarrativeBlocks(merged, entry);
    return {
      ...merged,
      dataMode: "hybrid",
      shortScore: rebuilt.shortScore,
      confidenceReason: rebuilt.confidenceReason,
      finalComment: rebuilt.finalComment
    };
  }

  return merged;
}
