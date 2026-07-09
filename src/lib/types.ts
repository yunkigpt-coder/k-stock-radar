export type Sentiment = "positive" | "neutral" | "negative";
export type DataMode = "mock" | "hybrid" | "live";
export type NewsRange = "48h" | "7d" | "30d" | "latest";

export type ScoreBreakdownItem = {
  label: string;
  value: number;
  reason: string;
};

export type ScoreBlock = {
  score: number;
  label: string;
  explanation: string;
  breakdown: ScoreBreakdownItem[];
};

export type NewsItem = {
  title: string;
  source: string;
  publishedAt: string;
  sentiment: Sentiment;
  summary: string;
  url?: string;
  impactReason?: string;
  relatedKeywords?: string[];
  isRecent?: boolean;
  newsRange?: NewsRange;
  evidenceSource?: "naver";
};

export type DisclosureItem = {
  title: string;
  corpName?: string;
  type: string;
  reportedAt: string;
  sentiment: Sentiment;
  impact: "high" | "medium" | "low";
  summary: string;
  url?: string;
  impactReason?: string;
  isMajor?: boolean;
  evidenceSource?: "opendart";
};

export type PricePoint = {
  date: string;
  open?: number;
  high?: number;
  low?: number;
  close: number;
  volume: number;
};

export type ChartDataSource = "actual" | "demo";
export type PriceDataSource = "mock" | "yahoo" | "api";
export type ChartStatus = "market" | "unavailable" | "demo";

export type FinancialSnapshot = {
  revenue: string;
  operatingProfit: string;
  netIncome: string;
  revenueGrowth: string;
  operatingMargin: string;
  debtRatio: string;
  freeCashFlow: string;
  roe: string;
  per: string;
  pbr: string;
  valuationNote: string;
};

export type ThreeCAnalysis = {
  company: string;
  customer: string;
  competitor: string;
};

export type SwotAnalysis = {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
};

export type StrategyCommentary = {
  shortTerm: string;
  longTerm: string;
  watchPoints: string;
  dataNote?: string;
};

export type CompanyAnalysis = {
  name: string;
  code: string;
  corpCode: string;
  market: string;
  sector: string;
  industry: string;
  themeTags: string[];
  currentPrice: number;
  changeRate: number;
  marketCap: string;
  overview: string;
  dataMode: DataMode;
  generatedAt: string;
  confidence: number;
  confidenceReason: string;
  shortScore: ScoreBlock;
  longScore: ScoreBlock;
  riskScore: ScoreBlock;
  keyReasons: string[];
  majorRisks: string[];
  news: NewsItem[];
  disclosures: DisclosureItem[];
  financials: FinancialSnapshot;
  priceHistory: PricePoint[];
  chartDataSource?: ChartDataSource;
  chartSource?: string;
  chartStatus?: ChartStatus;
  chartDataReason?: string;
  quotePrice?: number;
  quoteChangeRate?: number;
  priceDataSource?: PriceDataSource;
  priceUpdatedAt?: string;
  quoteUpdatedAt?: string;
  quoteSource?: string;
  isDemoPrice?: boolean;
  isMarketData?: boolean;
  threeC: ThreeCAnalysis;
  swot: SwotAnalysis;
  strategyCommentary?: StrategyCommentary;
  newsStatus?: "market" | "unavailable" | "demo";
  newsStatusMessage?: string;
  newsProvider?: "Naver News API" | "없음";
  dartStatus?: "market" | "unavailable" | "demo";
  dartStatusMessage?: string;
  dartProvider?: "OpenDART API" | "없음";
  shortComment: string;
  longComment: string;
  aiCounterOpinion: string[];
  finalComment: string;
};

export type CandidateStock = Pick<
  CompanyAnalysis,
  | "name"
  | "code"
  | "market"
  | "sector"
  | "industry"
  | "themeTags"
  | "currentPrice"
  | "changeRate"
  | "confidence"
  | "shortScore"
  | "longScore"
  | "riskScore"
  | "keyReasons"
  | "majorRisks"
  | "dataMode"
  | "priceHistory"
  | "priceDataSource"
  | "priceUpdatedAt"
  | "quoteSource"
  | "quotePrice"
  | "quoteChangeRate"
  | "quoteUpdatedAt"
  | "isDemoPrice"
  | "isMarketData"
> & {
  newsCount: number;
  disclosureCount: number;
  sourceCount: number;
  updatedAt: string;
  confidenceLabel: string;
  confidenceSummary: string;
  news: NewsItem[];
  disclosures: DisclosureItem[];
};

export type RecommendResponse = {
  generatedAt: string;
  updatedAt: string;
  dataMode: DataMode;
  universeCount: number;
  matchedCount: number;
  candidateCount: number;
  candidates: CandidateStock[];
};

export type AnalyzeResponse = {
  analysis: CompanyAnalysis;
};

export type KospiUniverseEntry = {
  name: string;
  code: string;
  market: string;
  sector: string;
  industry: string;
  themeTags: string[];
  marketCap: number;
  price: number;
  changeRate: number;
  volumeChangeRate: number;
  newsCount48h: number;
  disclosureCount48h: number;
  positiveNewsCount: number;
  negativeNewsCount: number;
  riskKeywords: string[];
  financialStrength: number;
  growthPotential: number;
  valuationAttractiveness: number;
  businessMoat: number;
};
