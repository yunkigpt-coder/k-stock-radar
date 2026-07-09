import type { KospiUniverseEntry } from "@/lib/types";

type UniverseSeed = {
  name: string;
  code: string;
  sector: string;
  industry: string;
  themeTags: string[];
  marketCap: number;
  price: number;
  risks?: string[];
  newsCount48h?: number;
  disclosureCount48h?: number;
  positiveNewsCount?: number;
  negativeNewsCount?: number;
};

const sectorProfiles: Record<
  string,
  {
    financialStrength: number;
    growthPotential: number;
    valuationAttractiveness: number;
    businessMoat: number;
    risks: string[];
  }
> = {
  반도체: { financialStrength: 78, growthPotential: 86, valuationAttractiveness: 61, businessMoat: 84, risks: ["memory_cycle", "customer_concentration"] },
  자동차: { financialStrength: 80, growthPotential: 72, valuationAttractiveness: 77, businessMoat: 78, risks: ["currency", "demand_slowdown"] },
  금융: { financialStrength: 84, growthPotential: 60, valuationAttractiveness: 82, businessMoat: 77, risks: ["credit_cost", "interest_rate", "regulation"] },
  "2차전지": { financialStrength: 67, growthPotential: 82, valuationAttractiveness: 54, businessMoat: 72, risks: ["competition", "demand_slowdown"] },
  바이오: { financialStrength: 66, growthPotential: 79, valuationAttractiveness: 55, businessMoat: 71, risks: ["clinical", "competition"] },
  플랫폼: { financialStrength: 72, growthPotential: 73, valuationAttractiveness: 58, businessMoat: 76, risks: ["regulation", "ad_cycle"] },
  통신: { financialStrength: 80, growthPotential: 57, valuationAttractiveness: 78, businessMoat: 73, risks: ["regulation", "competition"] },
  조선: { financialStrength: 70, growthPotential: 82, valuationAttractiveness: 62, businessMoat: 76, risks: ["currency", "demand_slowdown"] },
  화학: { financialStrength: 70, growthPotential: 66, valuationAttractiveness: 64, businessMoat: 68, risks: ["demand_slowdown", "currency"] },
  철강: { financialStrength: 73, growthPotential: 61, valuationAttractiveness: 72, businessMoat: 70, risks: ["demand_slowdown", "currency"] },
  유통: { financialStrength: 72, growthPotential: 59, valuationAttractiveness: 70, businessMoat: 67, risks: ["competition", "demand_slowdown"] },
  에너지: { financialStrength: 76, growthPotential: 63, valuationAttractiveness: 73, businessMoat: 70, risks: ["currency", "regulation"] },
  방산: { financialStrength: 75, growthPotential: 84, valuationAttractiveness: 60, businessMoat: 80, risks: ["regulation", "customer_concentration"] },
  지주: { financialStrength: 77, growthPotential: 61, valuationAttractiveness: 76, businessMoat: 70, risks: ["regulation", "interest_rate"] },
  음식료: { financialStrength: 78, growthPotential: 58, valuationAttractiveness: 71, businessMoat: 74, risks: ["currency", "competition"] },
  게임: { financialStrength: 69, growthPotential: 69, valuationAttractiveness: 57, businessMoat: 66, risks: ["competition", "regulation"] },
  엔터: { financialStrength: 67, growthPotential: 74, valuationAttractiveness: 56, businessMoat: 72, risks: ["competition", "regulation"] },
  운송: { financialStrength: 68, growthPotential: 62, valuationAttractiveness: 69, businessMoat: 67, risks: ["currency", "demand_slowdown"] },
  소비재: { financialStrength: 73, growthPotential: 60, valuationAttractiveness: 67, businessMoat: 71, risks: ["competition", "currency"] },
  전력기기: { financialStrength: 74, growthPotential: 81, valuationAttractiveness: 59, businessMoat: 76, risks: ["customer_concentration", "currency"] }
};

const seeds: UniverseSeed[] = [
  { name: "삼성전자", code: "005930", sector: "반도체", industry: "메모리·시스템 반도체", themeTags: ["AI", "HBM", "메모리"], marketCap: 471, price: 78900, newsCount48h: 5, disclosureCount48h: 1, positiveNewsCount: 3, negativeNewsCount: 1, risks: ["memory_cycle", "currency"] },
  { name: "SK하이닉스", code: "000660", sector: "반도체", industry: "메모리 반도체", themeTags: ["AI", "HBM", "서버"], marketCap: 172, price: 236500, newsCount48h: 7, disclosureCount48h: 1, positiveNewsCount: 5, negativeNewsCount: 1, risks: ["overheating", "customer_concentration"] },
  { name: "LG에너지솔루션", code: "373220", sector: "2차전지", industry: "배터리 셀", themeTags: ["전기차", "배터리", "북미"], marketCap: 84, price: 358000 },
  { name: "삼성바이오로직스", code: "207940", sector: "바이오", industry: "CDMO", themeTags: ["바이오", "위탁생산", "글로벌"], marketCap: 58, price: 812000 },
  { name: "현대차", code: "005380", sector: "자동차", industry: "완성차", themeTags: ["전기차", "하이브리드", "수출"], marketCap: 57, price: 274000, newsCount48h: 4, disclosureCount48h: 1, positiveNewsCount: 2, negativeNewsCount: 1 },
  { name: "기아", code: "000270", sector: "자동차", industry: "완성차", themeTags: ["전기차", "판매 믹스", "수출"], marketCap: 48, price: 123500, newsCount48h: 3, disclosureCount48h: 1, positiveNewsCount: 2, negativeNewsCount: 0 },
  { name: "셀트리온", code: "068270", sector: "바이오", industry: "바이오시밀러", themeTags: ["바이오", "허가", "파이프라인"], marketCap: 40, price: 184700, newsCount48h: 3, disclosureCount48h: 1, positiveNewsCount: 1, negativeNewsCount: 1 },
  { name: "KB금융", code: "105560", sector: "금융", industry: "은행지주", themeTags: ["배당", "금리", "자본비율"], marketCap: 36, price: 91100, newsCount48h: 2, disclosureCount48h: 1, positiveNewsCount: 1, negativeNewsCount: 0 },
  { name: "신한지주", code: "055550", sector: "금융", industry: "은행지주", themeTags: ["배당", "은행", "자본비율"], marketCap: 28, price: 55200 },
  { name: "하나금융지주", code: "086790", sector: "금융", industry: "은행지주", themeTags: ["배당", "은행", "환율"], marketCap: 19, price: 67400 },
  { name: "메리츠금융지주", code: "138040", sector: "금융", industry: "금융지주·증권·보험", themeTags: ["배당", "자사주", "주주환원"], marketCap: 17, price: 98300, newsCount48h: 2, disclosureCount48h: 1, positiveNewsCount: 1, negativeNewsCount: 0 },
  { name: "우리금융지주", code: "316140", sector: "금융", industry: "은행지주", themeTags: ["배당", "은행", "금리"], marketCap: 12, price: 15800 },
  { name: "기업은행", code: "024110", sector: "금융", industry: "은행", themeTags: ["배당", "정책금융", "금리"], marketCap: 11, price: 14300 },
  { name: "카카오뱅크", code: "323410", sector: "금융", industry: "인터넷은행", themeTags: ["플랫폼", "은행", "모바일"], marketCap: 10, price: 21400 },
  { name: "삼성생명", code: "032830", sector: "금융", industry: "생명보험", themeTags: ["보험", "배당", "금리"], marketCap: 17, price: 87200 },
  { name: "삼성화재", code: "000810", sector: "금융", industry: "손해보험", themeTags: ["보험", "배당", "금리"], marketCap: 16, price: 348000 },
  { name: "삼성증권", code: "016360", sector: "금융", industry: "증권", themeTags: ["증권", "배당", "거래대금"], marketCap: 4, price: 44500 },
  { name: "미래에셋증권", code: "006800", sector: "금융", industry: "증권", themeTags: ["증권", "자산관리", "해외"], marketCap: 5, price: 8300 },
  { name: "NAVER", code: "035420", sector: "플랫폼", industry: "인터넷·광고", themeTags: ["AI", "광고", "커머스"], marketCap: 31, price: 192400, newsCount48h: 4, disclosureCount48h: 1, positiveNewsCount: 2, negativeNewsCount: 1 },
  { name: "카카오", code: "035720", sector: "플랫폼", industry: "인터넷·모바일", themeTags: ["플랫폼", "광고", "콘텐츠"], marketCap: 18, price: 42300 },
  { name: "삼성에스디에스", code: "018260", sector: "플랫폼", industry: "IT 서비스", themeTags: ["클라우드", "AI", "물류IT"], marketCap: 12, price: 156000 },
  { name: "카카오페이", code: "377300", sector: "플랫폼", industry: "핀테크", themeTags: ["결제", "금융", "플랫폼"], marketCap: 4, price: 32800 },
  { name: "SK텔레콤", code: "017670", sector: "통신", industry: "무선통신", themeTags: ["AI", "배당", "통신"], marketCap: 12, price: 55200 },
  { name: "KT", code: "030200", sector: "통신", industry: "통신·미디어", themeTags: ["통신", "IDC", "배당"], marketCap: 10, price: 39200 },
  { name: "LG유플러스", code: "032640", sector: "통신", industry: "통신", themeTags: ["통신", "배당", "B2B"], marketCap: 5, price: 10400 },
  { name: "POSCO홀딩스", code: "005490", sector: "철강", industry: "철강·지주", themeTags: ["철강", "리튬", "배터리 소재"], marketCap: 34, price: 398000 },
  { name: "현대제철", code: "004020", sector: "철강", industry: "철강", themeTags: ["철강", "자동차강판", "건설"], marketCap: 4, price: 31500 },
  { name: "고려아연", code: "010130", sector: "철강", industry: "비철금속", themeTags: ["아연", "동박", "자원"], marketCap: 11, price: 548000 },
  { name: "LG화학", code: "051910", sector: "화학", industry: "화학·배터리 소재", themeTags: ["양극재", "석유화학", "배터리"], marketCap: 29, price: 412000 },
  { name: "롯데케미칼", code: "011170", sector: "화학", industry: "석유화학", themeTags: ["화학", "스프레드", "수소"], marketCap: 4, price: 105000 },
  { name: "금호석유", code: "011780", sector: "화학", industry: "합성고무", themeTags: ["화학", "라텍스", "배당"], marketCap: 4, price: 142000 },
  { name: "삼성SDI", code: "006400", sector: "2차전지", industry: "배터리", themeTags: ["전기차", "원통형", "ESS"], marketCap: 28, price: 406000 },
  { name: "포스코퓨처엠", code: "003670", sector: "2차전지", industry: "양극재·음극재", themeTags: ["양극재", "음극재", "배터리 소재"], marketCap: 22, price: 286000 },
  { name: "SK이노베이션", code: "096770", sector: "2차전지", industry: "정유·배터리", themeTags: ["배터리", "정유", "분리막"], marketCap: 12, price: 121000 },
  { name: "에코프로머티", code: "450080", sector: "2차전지", industry: "전구체", themeTags: ["전구체", "양극재", "배터리"], marketCap: 8, price: 118000 },
  { name: "LG전자", code: "066570", sector: "전력기기", industry: "가전·전장", themeTags: ["전장", "가전", "로봇"], marketCap: 16, price: 98500 },
  { name: "삼성전기", code: "009150", sector: "전력기기", industry: "전자부품", themeTags: ["MLCC", "전장", "AI 서버"], marketCap: 11, price: 148000 },
  { name: "LG이노텍", code: "011070", sector: "전력기기", industry: "전자부품", themeTags: ["카메라모듈", "전장", "애플"], marketCap: 5, price: 214000 },
  { name: "HD현대중공업", code: "329180", sector: "조선", industry: "조선", themeTags: ["LNG선", "수주", "방산"], marketCap: 12, price: 136000 },
  { name: "HD한국조선해양", code: "009540", sector: "조선", industry: "조선지주", themeTags: ["LNG선", "수주", "선가"], marketCap: 9, price: 127000 },
  { name: "한화오션", code: "042660", sector: "조선", industry: "조선·방산", themeTags: ["LNG선", "잠수함", "수주"], marketCap: 8, price: 26500 },
  { name: "삼성중공업", code: "010140", sector: "조선", industry: "조선", themeTags: ["LNG선", "해양플랜트", "수주"], marketCap: 7, price: 8500 },
  { name: "한국전력", code: "015760", sector: "에너지", industry: "전력", themeTags: ["전기요금", "원전", "배당"], marketCap: 14, price: 21800 },
  { name: "한국가스공사", code: "036460", sector: "에너지", industry: "가스", themeTags: ["가스", "요금", "배당"], marketCap: 3, price: 32100 },
  { name: "S-Oil", code: "010950", sector: "에너지", industry: "정유", themeTags: ["정유", "정제마진", "배당"], marketCap: 8, price: 70800 },
  { name: "GS", code: "078930", sector: "에너지", industry: "지주·에너지", themeTags: ["정유", "배당", "발전"], marketCap: 4, price: 43100 },
  { name: "SK", code: "034730", sector: "지주", industry: "지주", themeTags: ["반도체", "바이오", "배당"], marketCap: 12, price: 164000 },
  { name: "LG", code: "003550", sector: "지주", industry: "지주", themeTags: ["배당", "전장", "화학"], marketCap: 13, price: 84500 },
  { name: "한화", code: "000880", sector: "지주", industry: "방산·에너지 지주", themeTags: ["방산", "조선", "태양광"], marketCap: 3, price: 32200 },
  { name: "삼성물산", code: "028260", sector: "지주", industry: "상사·건설·바이오", themeTags: ["지배구조", "배당", "건설"], marketCap: 23, price: 127000 },
  { name: "두산에너빌리티", code: "034020", sector: "에너지", industry: "원전·발전기기", themeTags: ["원전", "SMR", "터빈"], marketCap: 12, price: 18900 },
  { name: "한화에어로스페이스", code: "012450", sector: "방산", industry: "항공·방산", themeTags: ["방산", "수출", "우주"], marketCap: 13, price: 258000 },
  { name: "현대로템", code: "064350", sector: "방산", industry: "철도·방산", themeTags: ["방산", "철도", "수출"], marketCap: 4, price: 38200 },
  { name: "LIG넥스원", code: "079550", sector: "방산", industry: "방산 전자", themeTags: ["미사일", "방산", "수출"], marketCap: 4, price: 178000 },
  { name: "현대모비스", code: "012330", sector: "자동차", industry: "자동차 부품", themeTags: ["전장", "부품", "자율주행"], marketCap: 21, price: 226000 },
  { name: "현대글로비스", code: "086280", sector: "자동차", industry: "물류·해운", themeTags: ["자동차 물류", "배당", "해운"], marketCap: 7, price: 184000 },
  { name: "HL만도", code: "204320", sector: "자동차", industry: "자동차 부품", themeTags: ["전장", "ADAS", "부품"], marketCap: 2, price: 40200 },
  { name: "HMM", code: "011200", sector: "운송", industry: "해운", themeTags: ["해운", "운임", "물류"], marketCap: 14, price: 19800 },
  { name: "대한항공", code: "003490", sector: "운송", industry: "항공", themeTags: ["항공", "화물", "여객"], marketCap: 8, price: 22800 },
  { name: "CJ대한통운", code: "000120", sector: "운송", industry: "물류", themeTags: ["택배", "물류", "이커머스"], marketCap: 2, price: 91200 },
  { name: "LG생활건강", code: "051900", sector: "소비재", industry: "화장품·생활용품", themeTags: ["화장품", "중국", "브랜드"], marketCap: 6, price: 362000 },
  { name: "아모레퍼시픽", code: "090430", sector: "소비재", industry: "화장품", themeTags: ["화장품", "중국", "면세"], marketCap: 8, price: 136000 },
  { name: "F&F", code: "383220", sector: "소비재", industry: "패션", themeTags: ["패션", "중국", "브랜드"], marketCap: 3, price: 74200 },
  { name: "코웨이", code: "021240", sector: "소비재", industry: "렌탈", themeTags: ["렌탈", "배당", "구독"], marketCap: 5, price: 67800 },
  { name: "호텔신라", code: "008770", sector: "소비재", industry: "면세·호텔", themeTags: ["면세", "여행", "중국"], marketCap: 2, price: 54800 },
  { name: "CJ제일제당", code: "097950", sector: "음식료", industry: "식품·바이오", themeTags: ["식품", "바이오", "환율"], marketCap: 5, price: 321000 },
  { name: "오리온", code: "271560", sector: "음식료", industry: "제과", themeTags: ["음식료", "중국", "원가"], marketCap: 4, price: 103000 },
  { name: "KT&G", code: "033780", sector: "음식료", industry: "담배·건기식", themeTags: ["배당", "방어주", "수출"], marketCap: 12, price: 94800 },
  { name: "롯데쇼핑", code: "023530", sector: "유통", industry: "백화점·마트", themeTags: ["유통", "소비", "구조조정"], marketCap: 2, price: 72400 },
  { name: "이마트", code: "139480", sector: "유통", industry: "대형마트", themeTags: ["유통", "온라인", "소비"], marketCap: 2, price: 67300 },
  { name: "신세계", code: "004170", sector: "유통", industry: "백화점·면세", themeTags: ["백화점", "면세", "소비"], marketCap: 2, price: 176000 },
  { name: "엔씨소프트", code: "036570", sector: "게임", industry: "게임", themeTags: ["게임", "신작", "글로벌"], marketCap: 4, price: 186000 },
  { name: "크래프톤", code: "259960", sector: "게임", industry: "게임", themeTags: ["게임", "배틀그라운드", "AI"], marketCap: 13, price: 272000 },
  { name: "하이브", code: "352820", sector: "엔터", industry: "엔터테인먼트", themeTags: ["K팝", "공연", "팬덤"], marketCap: 8, price: 194000 },
  { name: "SK바이오팜", code: "326030", sector: "바이오", industry: "신약", themeTags: ["신약", "미국", "파이프라인"], marketCap: 7, price: 89200 },
  { name: "유한양행", code: "000100", sector: "바이오", industry: "제약", themeTags: ["신약", "기술수출", "폐암"], marketCap: 8, price: 102000 },
  { name: "한미약품", code: "128940", sector: "바이오", industry: "제약", themeTags: ["신약", "비만", "파이프라인"], marketCap: 4, price: 318000 }
];

function hashText(text: string) {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) % 100000;
  }
  return Math.abs(hash);
}

function ranged(seed: number, min: number, max: number) {
  return min + (seed % (max - min + 1));
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function makeEntry(seed: UniverseSeed): KospiUniverseEntry {
  const hash = hashText(`${seed.code}${seed.name}`);
  const profile = sectorProfiles[seed.sector] ?? { financialStrength: 70, growthPotential: 65, valuationAttractiveness: 65, businessMoat: 68, risks: ["competition"] };
  const newsCount48h = seed.newsCount48h ?? ranged(hash, 0, 7);
  const positiveNewsCount = seed.positiveNewsCount ?? Math.min(newsCount48h, Math.max(0, Math.round(newsCount48h * 0.55) + ranged(hashText(seed.name), -1, 1)));
  const negativeNewsCount = seed.negativeNewsCount ?? Math.min(newsCount48h - positiveNewsCount, Math.max(0, ranged(hashText(seed.code), 0, 2)));

  return {
    name: seed.name,
    code: seed.code,
    market: "KOSPI",
    sector: seed.sector,
    industry: seed.industry,
    themeTags: seed.themeTags,
    marketCap: seed.marketCap,
    price: seed.price,
    changeRate: Number(((ranged(hash, -24, 31) / 10) + (positiveNewsCount - negativeNewsCount) * 0.18).toFixed(1)),
    volumeChangeRate: ranged(hashText(`${seed.name}${seed.sector}`), 4, 82),
    newsCount48h,
    disclosureCount48h: seed.disclosureCount48h ?? ranged(hashText(`${seed.code}dart`), 0, 2),
    positiveNewsCount,
    negativeNewsCount,
    riskKeywords: seed.risks ?? profile.risks,
    financialStrength: clamp(profile.financialStrength + ranged(hash, -5, 6)),
    growthPotential: clamp(profile.growthPotential + ranged(hashText(seed.industry), -6, 7)),
    valuationAttractiveness: clamp(profile.valuationAttractiveness + ranged(hashText(seed.name), -7, 8)),
    businessMoat: clamp(profile.businessMoat + ranged(hashText(seed.code), -5, 6))
  };
}

export const kospiUniverse: KospiUniverseEntry[] = seeds.map(makeEntry);

export const kospiUniverseSectors = ["전체", ...Array.from(new Set(kospiUniverse.map((item) => item.sector)))];

const queryAliases: Record<string, string> = {
  "sk하이닉스": "000660",
  "하이닉스": "000660",
  "sk hynix": "000660",
  "삼성전자": "005930",
  "삼성": "005930",
  samsung: "005930",
  "lg에너지솔루션": "373220",
  "삼성바이오로직스": "207940",
  "메리츠금융지주": "138040",
  "메리츠": "138040",
  meritz: "138040",
  "현대차": "005380",
  "기아": "000270",
  "셀트리온": "068270",
  "kb금융": "105560",
  "신한지주": "055550",
  "하나금융지주": "086790",
  naver: "035420",
  "네이버": "035420",
  "카카오": "035720",
  "posco홀딩스": "005490",
  "포스코홀딩스": "005490",
  "삼성sdi": "006400",
  "lg화학": "051910",
  "한화에어로스페이스": "012450"
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
