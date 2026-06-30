import type { KospiUniverseEntry } from "@/lib/types";

type SectorSeed = {
  sector: string;
  industry: string;
  themeTags: string[];
  companies: Array<{
    name: string;
    code: string;
    marketCap: number;
    price: number;
    financialStrength: number;
    growthPotential: number;
    valuationAttractiveness: number;
    businessMoat: number;
    riskKeywords: string[];
  }>;
};

const sectorSeeds: SectorSeed[] = [
  {
    sector: "반도체",
    industry: "메모리/로직 반도체",
    themeTags: ["AI", "HBM", "메모리", "서버"],
    companies: [
      { name: "삼성전자", code: "005930", marketCap: 471, price: 78900, financialStrength: 89, growthPotential: 83, valuationAttractiveness: 66, businessMoat: 90, riskKeywords: ["메모리사이클", "환율"] },
      { name: "SK하이닉스", code: "000660", marketCap: 172, price: 236500, financialStrength: 72, growthPotential: 91, valuationAttractiveness: 60, businessMoat: 87, riskKeywords: ["과열", "고객집중"] },
      { name: "한미반도체", code: "042700", marketCap: 15, price: 154800, financialStrength: 74, growthPotential: 88, valuationAttractiveness: 52, businessMoat: 78, riskKeywords: ["밸류부담", "수주변동"] },
      { name: "DB하이텍", code: "000990", marketCap: 2.3, price: 48400, financialStrength: 80, growthPotential: 69, valuationAttractiveness: 73, businessMoat: 71, riskKeywords: ["수요둔화"] },
      { name: "LX세미콘", code: "108320", marketCap: 1.8, price: 79200, financialStrength: 78, growthPotential: 68, valuationAttractiveness: 71, businessMoat: 69, riskKeywords: ["판가압박"] },
      { name: "리노공업", code: "058470", marketCap: 3.2, price: 228000, financialStrength: 92, growthPotential: 76, valuationAttractiveness: 55, businessMoat: 84, riskKeywords: ["밸류부담"] },
      { name: "솔브레인", code: "357780", marketCap: 1.9, price: 298000, financialStrength: 83, growthPotential: 72, valuationAttractiveness: 58, businessMoat: 74, riskKeywords: ["고객집중"] },
      { name: "원익IPS", code: "240810", marketCap: 1.6, price: 32850, financialStrength: 71, growthPotential: 75, valuationAttractiveness: 67, businessMoat: 68, riskKeywords: ["수주공백"] }
    ]
  },
  {
    sector: "자동차",
    industry: "완성차/부품",
    themeTags: ["EV", "하이브리드", "자율주행", "수출"],
    companies: [
      { name: "현대차", code: "005380", marketCap: 57, price: 274000, financialStrength: 80, growthPotential: 71, valuationAttractiveness: 79, businessMoat: 79, riskKeywords: ["수요둔화", "환율"] },
      { name: "기아", code: "000270", marketCap: 48, price: 123500, financialStrength: 82, growthPotential: 74, valuationAttractiveness: 78, businessMoat: 81, riskKeywords: ["가격경쟁"] },
      { name: "현대모비스", code: "012330", marketCap: 22, price: 248000, financialStrength: 84, growthPotential: 68, valuationAttractiveness: 72, businessMoat: 82, riskKeywords: ["전동화투자"] },
      { name: "현대위아", code: "011210", marketCap: 1.4, price: 55300, financialStrength: 68, growthPotential: 67, valuationAttractiveness: 74, businessMoat: 65, riskKeywords: ["수익성압박"] },
      { name: "한국타이어앤테크놀로지", code: "161390", marketCap: 5.5, price: 44500, financialStrength: 76, growthPotential: 66, valuationAttractiveness: 75, businessMoat: 74, riskKeywords: ["원재료"] },
      { name: "한온시스템", code: "018880", marketCap: 2.1, price: 5370, financialStrength: 58, growthPotential: 63, valuationAttractiveness: 69, businessMoat: 72, riskKeywords: ["부채", "수익성"] },
      { name: "HL만도", code: "204320", marketCap: 2.2, price: 47600, financialStrength: 70, growthPotential: 71, valuationAttractiveness: 68, businessMoat: 70, riskKeywords: ["고객수요"] },
      { name: "에스엘", code: "005850", marketCap: 1.7, price: 34300, financialStrength: 79, growthPotential: 69, valuationAttractiveness: 76, businessMoat: 68, riskKeywords: ["미국수요"] }
    ]
  },
  {
    sector: "2차전지",
    industry: "배터리/소재",
    themeTags: ["배터리", "양극재", "리사이클", "ESS"],
    companies: [
      { name: "LG에너지솔루션", code: "373220", marketCap: 85, price: 362500, financialStrength: 79, growthPotential: 87, valuationAttractiveness: 54, businessMoat: 86, riskKeywords: ["증설부담", "수요둔화"] },
      { name: "삼성SDI", code: "006400", marketCap: 27, price: 331000, financialStrength: 81, growthPotential: 79, valuationAttractiveness: 59, businessMoat: 83, riskKeywords: ["고객다변화"] },
      { name: "포스코퓨처엠", code: "003670", marketCap: 19, price: 257500, financialStrength: 66, growthPotential: 85, valuationAttractiveness: 50, businessMoat: 74, riskKeywords: ["밸류부담", "원재료"] },
      { name: "에코프로머티", code: "450080", marketCap: 9.5, price: 109200, financialStrength: 61, growthPotential: 84, valuationAttractiveness: 47, businessMoat: 71, riskKeywords: ["변동성", "증설"] },
      { name: "SK이노베이션", code: "096770", marketCap: 10.7, price: 115400, financialStrength: 54, growthPotential: 73, valuationAttractiveness: 66, businessMoat: 72, riskKeywords: ["부채", "정유시황"] },
      { name: "금양", code: "001570", marketCap: 4.3, price: 71500, financialStrength: 42, growthPotential: 78, valuationAttractiveness: 35, businessMoat: 55, riskKeywords: ["변동성", "자금조달"] },
      { name: "코스모신소재", code: "005070", marketCap: 4.1, price: 109600, financialStrength: 62, growthPotential: 80, valuationAttractiveness: 48, businessMoat: 64, riskKeywords: ["판가변동"] },
      { name: "엘앤에프", code: "066970", marketCap: 5.2, price: 144800, financialStrength: 58, growthPotential: 82, valuationAttractiveness: 46, businessMoat: 67, riskKeywords: ["실적변동", "수요둔화"] }
    ]
  },
  {
    sector: "바이오",
    industry: "바이오시밀러/제약",
    themeTags: ["바이오시밀러", "신약", "임상", "해외판매"],
    companies: [
      { name: "셀트리온", code: "068270", marketCap: 40, price: 184700, financialStrength: 68, growthPotential: 78, valuationAttractiveness: 54, businessMoat: 74, riskKeywords: ["임상", "약가경쟁"] },
      { name: "유한양행", code: "000100", marketCap: 6.2, price: 80700, financialStrength: 82, growthPotential: 72, valuationAttractiveness: 67, businessMoat: 78, riskKeywords: ["R&D비용"] },
      { name: "삼성바이오로직스", code: "207940", marketCap: 71, price: 998000, financialStrength: 86, growthPotential: 84, valuationAttractiveness: 49, businessMoat: 89, riskKeywords: ["고밸류"] },
      { name: "한미약품", code: "128940", marketCap: 3.9, price: 307000, financialStrength: 72, growthPotential: 76, valuationAttractiveness: 58, businessMoat: 73, riskKeywords: ["임상", "기술수출"] },
      { name: "녹십자", code: "006280", marketCap: 1.7, price: 143900, financialStrength: 63, growthPotential: 67, valuationAttractiveness: 63, businessMoat: 69, riskKeywords: ["수익성"] },
      { name: "대웅제약", code: "069620", marketCap: 1.4, price: 111300, financialStrength: 71, growthPotential: 68, valuationAttractiveness: 64, businessMoat: 68, riskKeywords: ["소송"] },
      { name: "종근당", code: "185750", marketCap: 1.6, price: 112400, financialStrength: 70, growthPotential: 65, valuationAttractiveness: 68, businessMoat: 67, riskKeywords: ["약가인하"] },
      { name: "SK바이오사이언스", code: "302440", marketCap: 4.4, price: 56700, financialStrength: 64, growthPotential: 71, valuationAttractiveness: 57, businessMoat: 70, riskKeywords: ["실적공백"] }
    ]
  },
  {
    sector: "금융",
    industry: "은행/보험/증권",
    themeTags: ["배당", "금리", "자사주", "밸류업"],
    companies: [
      { name: "KB금융", code: "105560", marketCap: 36, price: 91100, financialStrength: 86, growthPotential: 61, valuationAttractiveness: 84, businessMoat: 82, riskKeywords: ["대손충당금"] },
      { name: "신한지주", code: "055550", marketCap: 28, price: 61500, financialStrength: 85, growthPotential: 60, valuationAttractiveness: 82, businessMoat: 81, riskKeywords: ["금리하락"] },
      { name: "하나금융지주", code: "086790", marketCap: 19, price: 63400, financialStrength: 84, growthPotential: 59, valuationAttractiveness: 83, businessMoat: 80, riskKeywords: ["부동산PF"] },
      { name: "우리금융지주", code: "316140", marketCap: 12, price: 16200, financialStrength: 78, growthPotential: 55, valuationAttractiveness: 81, businessMoat: 74, riskKeywords: ["자본정책"] },
      { name: "메리츠금융지주", code: "138040", marketCap: 17, price: 98300, financialStrength: 88, growthPotential: 64, valuationAttractiveness: 79, businessMoat: 78, riskKeywords: ["규제"] },
      { name: "삼성화재", code: "000810", marketCap: 18, price: 364500, financialStrength: 90, growthPotential: 58, valuationAttractiveness: 76, businessMoat: 86, riskKeywords: ["손해율"] },
      { name: "미래에셋증권", code: "006800", marketCap: 5.8, price: 9030, financialStrength: 73, growthPotential: 57, valuationAttractiveness: 74, businessMoat: 66, riskKeywords: ["증시변동"] },
      { name: "NH투자증권", code: "005940", marketCap: 4.1, price: 14520, financialStrength: 75, growthPotential: 56, valuationAttractiveness: 75, businessMoat: 65, riskKeywords: ["IB경기"] }
    ]
  },
  {
    sector: "플랫폼",
    industry: "인터넷/콘텐츠",
    themeTags: ["AI", "광고", "커머스", "콘텐츠"],
    companies: [
      { name: "NAVER", code: "035420", marketCap: 31, price: 192400, financialStrength: 72, growthPotential: 69, valuationAttractiveness: 58, businessMoat: 73, riskKeywords: ["규제", "광고경기"] },
      { name: "카카오", code: "035720", marketCap: 18, price: 41450, financialStrength: 61, growthPotential: 67, valuationAttractiveness: 55, businessMoat: 68, riskKeywords: ["규제", "성장둔화"] },
      { name: "더존비즈온", code: "012510", marketCap: 2.2, price: 70700, financialStrength: 80, growthPotential: 72, valuationAttractiveness: 61, businessMoat: 76, riskKeywords: ["공공사업"] },
      { name: "아프리카TV", code: "067160", marketCap: 1.2, price: 113700, financialStrength: 77, growthPotential: 66, valuationAttractiveness: 64, businessMoat: 69, riskKeywords: ["콘텐츠비용"] },
      { name: "엔씨소프트", code: "036570", marketCap: 4.3, price: 193800, financialStrength: 74, growthPotential: 51, valuationAttractiveness: 60, businessMoat: 72, riskKeywords: ["신작흥행"] },
      { name: "넷마블", code: "251270", marketCap: 4.9, price: 57400, financialStrength: 57, growthPotential: 63, valuationAttractiveness: 62, businessMoat: 64, riskKeywords: ["실적변동"] },
      { name: "크래프톤", code: "259960", marketCap: 16, price: 336000, financialStrength: 89, growthPotential: 71, valuationAttractiveness: 63, businessMoat: 85, riskKeywords: ["흥행의존"] },
      { name: "카카오페이", code: "377300", marketCap: 3.4, price: 25150, financialStrength: 48, growthPotential: 70, valuationAttractiveness: 45, businessMoat: 60, riskKeywords: ["적자", "규제"] }
    ]
  },
  {
    sector: "통신",
    industry: "통신/인프라",
    themeTags: ["5G", "배당", "AI IDC", "통신비"],
    companies: [
      { name: "SK텔레콤", code: "017670", marketCap: 11, price: 54500, financialStrength: 84, growthPotential: 58, valuationAttractiveness: 81, businessMoat: 82, riskKeywords: ["규제"] },
      { name: "KT", code: "030200", marketCap: 10.2, price: 39650, financialStrength: 83, growthPotential: 57, valuationAttractiveness: 79, businessMoat: 80, riskKeywords: ["통신비"] },
      { name: "LG유플러스", code: "032640", marketCap: 4.6, price: 11350, financialStrength: 76, growthPotential: 54, valuationAttractiveness: 78, businessMoat: 73, riskKeywords: ["마케팅비"] },
      { name: "쏠리드", code: "050890", marketCap: 0.4, price: 6100, financialStrength: 58, growthPotential: 63, valuationAttractiveness: 65, businessMoat: 56, riskKeywords: ["수주변동"] },
      { name: "와이솔", code: "122990", marketCap: 0.35, price: 9150, financialStrength: 62, growthPotential: 61, valuationAttractiveness: 67, businessMoat: 57, riskKeywords: ["스마트폰수요"] },
      { name: "인텔리안테크", code: "189300", marketCap: 0.8, price: 48700, financialStrength: 69, growthPotential: 72, valuationAttractiveness: 62, businessMoat: 67, riskKeywords: ["환율"] },
      { name: "에치에프알", code: "230240", marketCap: 0.6, price: 17200, financialStrength: 63, growthPotential: 64, valuationAttractiveness: 69, businessMoat: 60, riskKeywords: ["투자지연"] },
      { name: "다산네트웍스", code: "039560", marketCap: 0.25, price: 3880, financialStrength: 49, growthPotential: 55, valuationAttractiveness: 58, businessMoat: 50, riskKeywords: ["적자", "부채"] }
    ]
  },
  {
    sector: "조선",
    industry: "조선/해양",
    themeTags: ["LNG선", "방산", "수주잔고", "친환경선박"],
    companies: [
      { name: "HD한국조선해양", code: "009540", marketCap: 12.8, price: 181700, financialStrength: 76, growthPotential: 82, valuationAttractiveness: 72, businessMoat: 79, riskKeywords: ["후판가"] },
      { name: "한화오션", code: "042660", marketCap: 10.9, price: 30750, financialStrength: 54, growthPotential: 80, valuationAttractiveness: 58, businessMoat: 75, riskKeywords: ["유상증자", "수익성"] },
      { name: "HD현대중공업", code: "329180", marketCap: 16.5, price: 186300, financialStrength: 71, growthPotential: 79, valuationAttractiveness: 64, businessMoat: 81, riskKeywords: ["원가"] },
      { name: "삼성중공업", code: "010140", marketCap: 8.7, price: 10300, financialStrength: 57, growthPotential: 76, valuationAttractiveness: 69, businessMoat: 72, riskKeywords: ["부채", "원가"] },
      { name: "HD현대미포", code: "010620", marketCap: 3.9, price: 98500, financialStrength: 74, growthPotential: 72, valuationAttractiveness: 73, businessMoat: 70, riskKeywords: ["환율"] },
      { name: "세진중공업", code: "075580", marketCap: 0.7, price: 7600, financialStrength: 62, growthPotential: 68, valuationAttractiveness: 71, businessMoat: 57, riskKeywords: ["수주집중"] },
      { name: "동성화인텍", code: "033500", marketCap: 0.55, price: 20150, financialStrength: 71, growthPotential: 70, valuationAttractiveness: 70, businessMoat: 61, riskKeywords: ["원재료"] },
      { name: "한국카본", code: "017960", marketCap: 0.62, price: 13200, financialStrength: 68, growthPotential: 69, valuationAttractiveness: 72, businessMoat: 59, riskKeywords: ["LNG사이클"] }
    ]
  },
  {
    sector: "화학",
    industry: "정유/석유화학",
    themeTags: ["정제마진", "석유화학", "친환경소재", "원재료"],
    companies: [
      { name: "LG화학", code: "051910", marketCap: 26, price: 322000, financialStrength: 77, growthPotential: 74, valuationAttractiveness: 61, businessMoat: 82, riskKeywords: ["배터리분사", "화학시황"] },
      { name: "롯데케미칼", code: "011170", marketCap: 3.1, price: 94400, financialStrength: 55, growthPotential: 57, valuationAttractiveness: 72, businessMoat: 67, riskKeywords: ["업황부진", "부채"] },
      { name: "금호석유", code: "011780", marketCap: 4.3, price: 141600, financialStrength: 84, growthPotential: 56, valuationAttractiveness: 77, businessMoat: 75, riskKeywords: ["합성고무시황"] },
      { name: "한화솔루션", code: "009830", marketCap: 4.8, price: 28050, financialStrength: 58, growthPotential: 67, valuationAttractiveness: 63, businessMoat: 68, riskKeywords: ["태양광시황"] },
      { name: "S-Oil", code: "010950", marketCap: 7.2, price: 66400, financialStrength: 73, growthPotential: 59, valuationAttractiveness: 75, businessMoat: 72, riskKeywords: ["정제마진"] },
      { name: "SKC", code: "011790", marketCap: 3.4, price: 114700, financialStrength: 61, growthPotential: 69, valuationAttractiveness: 59, businessMoat: 66, riskKeywords: ["투자부담"] },
      { name: "효성첨단소재", code: "298050", marketCap: 1.7, price: 302500, financialStrength: 74, growthPotential: 70, valuationAttractiveness: 65, businessMoat: 71, riskKeywords: ["원가상승"] },
      { name: "대한유화", code: "006650", marketCap: 0.9, price: 142800, financialStrength: 72, growthPotential: 52, valuationAttractiveness: 78, businessMoat: 60, riskKeywords: ["화학시황"] }
    ]
  },
  {
    sector: "철강",
    industry: "철강/금속",
    themeTags: ["철강가격", "원재료", "수출", "인프라"],
    companies: [
      { name: "POSCO홀딩스", code: "005490", marketCap: 31, price: 356500, financialStrength: 85, growthPotential: 67, valuationAttractiveness: 73, businessMoat: 84, riskKeywords: ["중국수요"] },
      { name: "현대제철", code: "004020", marketCap: 3.8, price: 28250, financialStrength: 70, growthPotential: 58, valuationAttractiveness: 76, businessMoat: 71, riskKeywords: ["자동차강판"] },
      { name: "KG스틸", code: "016380", marketCap: 0.8, price: 6740, financialStrength: 63, growthPotential: 54, valuationAttractiveness: 74, businessMoat: 58, riskKeywords: ["원가"] },
      { name: "동국제강", code: "460860", marketCap: 1.2, price: 9610, financialStrength: 72, growthPotential: 56, valuationAttractiveness: 77, businessMoat: 64, riskKeywords: ["건설수요"] },
      { name: "세아베스틸지주", code: "001430", marketCap: 0.95, price: 25250, financialStrength: 74, growthPotential: 55, valuationAttractiveness: 75, businessMoat: 65, riskKeywords: ["특수강수요"] },
      { name: "풍산", code: "103140", marketCap: 1.3, price: 58100, financialStrength: 78, growthPotential: 59, valuationAttractiveness: 73, businessMoat: 68, riskKeywords: ["구리가격"] },
      { name: "고려아연", code: "010130", marketCap: 10.1, price: 524000, financialStrength: 91, growthPotential: 62, valuationAttractiveness: 57, businessMoat: 88, riskKeywords: ["금속가격"] },
      { name: "포스코스틸리온", code: "058430", marketCap: 0.35, price: 42850, financialStrength: 69, growthPotential: 57, valuationAttractiveness: 70, businessMoat: 58, riskKeywords: ["건설수요"] }
    ]
  },
  {
    sector: "유통",
    industry: "백화점/소매",
    themeTags: ["소비", "오프라인", "면세", "리오프닝"],
    companies: [
      { name: "이마트", code: "139480", marketCap: 1.8, price: 65900, financialStrength: 58, growthPotential: 55, valuationAttractiveness: 79, businessMoat: 72, riskKeywords: ["소비둔화", "이커머스"] },
      { name: "롯데쇼핑", code: "023530", marketCap: 1.7, price: 62700, financialStrength: 60, growthPotential: 53, valuationAttractiveness: 78, businessMoat: 70, riskKeywords: ["점포효율"] },
      { name: "BGF리테일", code: "282330", marketCap: 2.1, price: 109500, financialStrength: 80, growthPotential: 61, valuationAttractiveness: 68, businessMoat: 76, riskKeywords: ["최저임금"] },
      { name: "GS리테일", code: "007070", marketCap: 1.4, price: 21550, financialStrength: 72, growthPotential: 58, valuationAttractiveness: 72, businessMoat: 69, riskKeywords: ["비용상승"] },
      { name: "신세계", code: "004170", marketCap: 1.3, price: 145700, financialStrength: 77, growthPotential: 57, valuationAttractiveness: 71, businessMoat: 74, riskKeywords: ["면세"] },
      { name: "호텔신라", code: "008770", marketCap: 1.9, price: 48750, financialStrength: 64, growthPotential: 63, valuationAttractiveness: 66, businessMoat: 68, riskKeywords: ["중국관광"] },
      { name: "현대백화점", code: "069960", marketCap: 1.1, price: 54200, financialStrength: 75, growthPotential: 55, valuationAttractiveness: 74, businessMoat: 70, riskKeywords: ["소비둔화"] },
      { name: "CJ", code: "001040", marketCap: 4.2, price: 137300, financialStrength: 73, growthPotential: 60, valuationAttractiveness: 69, businessMoat: 71, riskKeywords: ["자회사"] }
    ]
  },
  {
    sector: "에너지",
    industry: "전력/가스/신재생",
    themeTags: ["원전", "전력기기", "태양광", "전력망"],
    companies: [
      { name: "한국전력", code: "015760", marketCap: 13, price: 20450, financialStrength: 34, growthPotential: 51, valuationAttractiveness: 64, businessMoat: 83, riskKeywords: ["요금정책", "적자"] },
      { name: "한전KPS", code: "051600", marketCap: 1.9, price: 44100, financialStrength: 78, growthPotential: 63, valuationAttractiveness: 72, businessMoat: 73, riskKeywords: ["정책"] },
      { name: "LS ELECTRIC", code: "010120", marketCap: 7.6, price: 242000, financialStrength: 81, growthPotential: 83, valuationAttractiveness: 61, businessMoat: 79, riskKeywords: ["설비투자사이클"] },
      { name: "두산에너빌리티", code: "034020", marketCap: 12.2, price: 22150, financialStrength: 58, growthPotential: 79, valuationAttractiveness: 67, businessMoat: 76, riskKeywords: ["원전정책", "부채"] },
      { name: "씨에스윈드", code: "112610", marketCap: 2.3, price: 57900, financialStrength: 63, growthPotential: 70, valuationAttractiveness: 60, businessMoat: 68, riskKeywords: ["해상풍력지연"] },
      { name: "SK가스", code: "018670", marketCap: 1.5, price: 185300, financialStrength: 84, growthPotential: 58, valuationAttractiveness: 73, businessMoat: 72, riskKeywords: ["LPG가격"] },
      { name: "HD현대일렉트릭", code: "267260", marketCap: 13.7, price: 378500, financialStrength: 83, growthPotential: 86, valuationAttractiveness: 56, businessMoat: 82, riskKeywords: ["밸류부담"] },
      { name: "OCI홀딩스", code: "010060", marketCap: 1.8, price: 77800, financialStrength: 76, growthPotential: 64, valuationAttractiveness: 70, businessMoat: 66, riskKeywords: ["폴리실리콘"] }
    ]
  },
  {
    sector: "통합산업",
    industry: "건설/방산/기계",
    themeTags: ["방산", "인프라", "수주", "플랜트"],
    companies: [
      { name: "한화에어로스페이스", code: "012450", marketCap: 18.5, price: 358500, financialStrength: 79, growthPotential: 88, valuationAttractiveness: 63, businessMoat: 83, riskKeywords: ["수주일정"] },
      { name: "현대로템", code: "064350", marketCap: 5.4, price: 49250, financialStrength: 70, growthPotential: 85, valuationAttractiveness: 61, businessMoat: 74, riskKeywords: ["수출정책"] },
      { name: "LIG넥스원", code: "079550", marketCap: 5.8, price: 256500, financialStrength: 77, growthPotential: 82, valuationAttractiveness: 60, businessMoat: 76, riskKeywords: ["수주변동"] },
      { name: "HD현대인프라코어", code: "042670", marketCap: 1.9, price: 8610, financialStrength: 69, growthPotential: 64, valuationAttractiveness: 73, businessMoat: 64, riskKeywords: ["중국경기"] },
      { name: "두산밥캣", code: "241560", marketCap: 5.2, price: 51300, financialStrength: 82, growthPotential: 61, valuationAttractiveness: 77, businessMoat: 78, riskKeywords: ["북미경기"] },
      { name: "대우건설", code: "047040", marketCap: 1.7, price: 3750, financialStrength: 63, growthPotential: 57, valuationAttractiveness: 72, businessMoat: 58, riskKeywords: ["PF", "원가"] },
      { name: "DL이앤씨", code: "375500", marketCap: 1.5, price: 34850, financialStrength: 71, growthPotential: 54, valuationAttractiveness: 76, businessMoat: 61, riskKeywords: ["주택경기"] },
      { name: "삼성물산", code: "028260", marketCap: 26, price: 160400, financialStrength: 88, growthPotential: 65, valuationAttractiveness: 72, businessMoat: 84, riskKeywords: ["지배구조"] }
    ]
  }
];

type Variation = {
  change: number;
  volume: number;
  news: number;
  disclosure: number;
  positive: number;
  negative: number;
};

const variations: Variation[] = [
  { change: 2.4, volume: 84, news: 8, disclosure: 2, positive: 6, negative: 1 },
  { change: 1.7, volume: 52, news: 6, disclosure: 1, positive: 4, negative: 1 },
  { change: 0.9, volume: 33, news: 5, disclosure: 2, positive: 3, negative: 1 },
  { change: -0.4, volume: 18, news: 4, disclosure: 1, positive: 2, negative: 1 },
  { change: 3.2, volume: 96, news: 9, disclosure: 3, positive: 7, negative: 1 },
  { change: -1.1, volume: -12, news: 3, disclosure: 1, positive: 1, negative: 2 },
  { change: 1.1, volume: 41, news: 5, disclosure: 2, positive: 3, negative: 0 },
  { change: -0.8, volume: 9, news: 4, disclosure: 2, positive: 2, negative: 2 }
];

export const kospiUniverse: KospiUniverseEntry[] = sectorSeeds.flatMap((seed) =>
  seed.companies.map((company, index) => {
    const variation = variations[index % variations.length];
    return {
      name: company.name,
      code: company.code,
      market: "KOSPI",
      sector: seed.sector,
      industry: seed.industry,
      themeTags: [...seed.themeTags.slice(0, 3), company.name.slice(0, 2)],
      marketCap: company.marketCap,
      price: company.price,
      changeRate: Number((company.price > 100000 ? variation.change * 0.9 : variation.change).toFixed(1)),
      volumeChangeRate: variation.volume,
      newsCount48h: variation.news,
      disclosureCount48h: variation.disclosure,
      positiveNewsCount: variation.positive,
      negativeNewsCount: variation.negative,
      riskKeywords: company.riskKeywords,
      financialStrength: company.financialStrength,
      growthPotential: company.growthPotential,
      valuationAttractiveness: company.valuationAttractiveness,
      businessMoat: company.businessMoat
    };
  })
);

export const kospiUniverseSectors = ["전체", ...Array.from(new Set(kospiUniverse.map((item) => item.sector)))];

export function findKospiUniverseEntry(query?: string) {
  const normalized = (query ?? "").trim().toLowerCase();
  if (!normalized) return kospiUniverse[0];

  return (
    kospiUniverse.find((item) => item.name.toLowerCase() === normalized) ??
    kospiUniverse.find((item) => item.code === normalized) ??
    kospiUniverse.find((item) => item.name.toLowerCase().includes(normalized) || item.code.includes(normalized)) ??
    kospiUniverse[0]
  );
}
