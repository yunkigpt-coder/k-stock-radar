import { inflateRawSync } from "zlib";
import type { DisclosureItem, Sentiment } from "./types";

type CorpCodeRow = {
  corpCode: string;
  corpName: string;
  stockCode: string;
};

type DartListItem = {
  report_nm?: string;
  rcept_dt?: string;
  rcept_no?: string;
  corp_name?: string;
  rm?: string;
};

let corpCodeCache: { expiresAt: number; map: Map<string, CorpCodeRow> } | null = null;
const CORP_CODE_TTL_MS = 24 * 60 * 60 * 1000;

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanXmlText(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function xmlText(block: string, tag: string) {
  const match = block.match(new RegExp(`<${tag}>\\s*([\\s\\S]*?)\\s*</${tag}>`));
  return match ? cleanXmlText(match[1]) : "";
}

function extractZipEntry(buffer: Buffer, wantedName: string) {
  const eocdSignature = 0x06054b50;
  let eocdOffset = -1;
  for (let offset = buffer.length - 22; offset >= 0; offset -= 1) {
    if (buffer.readUInt32LE(offset) === eocdSignature) {
      eocdOffset = offset;
      break;
    }
  }
  if (eocdOffset < 0) throw new Error("Invalid ZIP file");

  const entryCount = buffer.readUInt16LE(eocdOffset + 10);
  const centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16);
  let offset = centralDirectoryOffset;

  for (let index = 0; index < entryCount; index += 1) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) break;

    const compression = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const fileNameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const fileName = buffer.toString("utf8", offset + 46, offset + 46 + fileNameLength);

    if (fileName.toLowerCase() === wantedName.toLowerCase()) {
      const localNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
      const localExtraLength = buffer.readUInt16LE(localHeaderOffset + 28);
      const dataOffset = localHeaderOffset + 30 + localNameLength + localExtraLength;
      const compressed = buffer.subarray(dataOffset, dataOffset + compressedSize);
      if (compression === 0) return compressed.toString("utf8");
      if (compression === 8) return inflateRawSync(compressed).toString("utf8");
      throw new Error("Unsupported ZIP compression");
    }

    offset += 46 + fileNameLength + extraLength + commentLength;
  }

  throw new Error("CORPCODE.xml not found");
}

export function hasOpenDartCredentials() {
  return Boolean(process.env.OPEN_DART_API_KEY);
}

export async function fetchCorpCodeMap(): Promise<Record<string, string>> {
  const apiKey = process.env.OPEN_DART_API_KEY;
  if (!apiKey) return {};

  if (corpCodeCache && corpCodeCache.expiresAt > Date.now()) {
    return Object.fromEntries([...corpCodeCache.map.entries()].map(([stockCode, row]) => [stockCode, row.corpCode]));
  }

  const url = new URL("https://opendart.fss.or.kr/api/corpCode.xml");
  url.searchParams.set("crtfc_key", apiKey);
  const response = await fetch(url, { cache: "force-cache" });
  if (!response.ok) throw new Error("corpCode.xml download failed");

  const zipBuffer = Buffer.from(await response.arrayBuffer());
  const xml = extractZipEntry(zipBuffer, "CORPCODE.xml");
  const map = new Map<string, CorpCodeRow>();

  for (const match of xml.matchAll(/<list>([\s\S]*?)<\/list>/g)) {
    const block = match[1];
    const stockCode = xmlText(block, "stock_code");
    const corpCode = xmlText(block, "corp_code");
    const corpName = xmlText(block, "corp_name");
    if (stockCode && corpCode) map.set(stockCode, { stockCode, corpCode, corpName });
  }

  corpCodeCache = { expiresAt: Date.now() + CORP_CODE_TTL_MS, map };
  return Object.fromEntries([...map.entries()].map(([stockCode, row]) => [stockCode, row.corpCode]));
}

async function getCorpCodeRow(stockCode: string) {
  await fetchCorpCodeMap();
  return corpCodeCache?.map.get(stockCode) ?? null;
}

export async function getCorpCodeByStockCode(stockCode: string): Promise<string | null> {
  const row = await getCorpCodeRow(stockCode);
  return row?.corpCode ?? null;
}

export function classifyDisclosureType(reportName: string) {
  if (/단일판매|공급계약|수주|배당|자사주|주요사항|실적|잠정/.test(reportName)) return "주요 공시";
  if (/유상증자|전환사채|소송|정정|불성실|감자|횡령|배임|최대주주/.test(reportName)) return "주의 공시";
  if (/사업보고서|분기보고서|반기보고서|정기보고서/.test(reportName)) return "정기보고서";
  return "일반 공시";
}

export function classifyDisclosureImpact(reportName: string): DisclosureItem["impact"] {
  if (/유상증자|전환사채|소송|정정|불성실|감자|횡령|배임|최대주주/.test(reportName)) return "high";
  if (/단일판매|공급계약|수주|배당|자사주|주요사항|실적|잠정|사업보고서|분기보고서|반기보고서/.test(reportName)) return "medium";
  return "low";
}

export function classifyDisclosureSentiment(reportName: string): Sentiment {
  if (/단일판매|공급계약|수주|배당|자사주|실적|잠정/.test(reportName)) return "positive";
  if (/유상증자|전환사채|소송|정정|불성실|감자|횡령|배임|최대주주/.test(reportName)) return "negative";
  return "neutral";
}

export function buildDisclosureImpactReason(disclosure: DisclosureItem) {
  if (disclosure.isMajor) return "공시 유형과 중요도 기준으로 단기 이벤트와 리스크 점검에 반영합니다.";
  return "최신 공식 자료로 리서치 참고 정보에 반영합니다.";
}

function buildDisclosureSummary(reportName: string) {
  if (/사업보고서|분기보고서|반기보고서|정기보고서/.test(reportName)) return "공시명 기준 1차 분류입니다. 원문에서 실적과 재무 항목을 확인해야 합니다.";
  if (/유상증자|전환사채|소송|정정|불성실|감자|횡령|배임|최대주주/.test(reportName)) return "공시명 기준 1차 분류입니다. 주주가치 희석, 법적 불확실성 또는 지배구조 변화를 확인해야 합니다.";
  if (/단일판매|공급계약|수주|배당|자사주|주요사항|실적|잠정/.test(reportName)) return "공시명 기준 1차 분류입니다. 영업 성과, 주주환원 또는 실적 관련 가능성을 원문에서 확인해야 합니다.";
  return "공시명 기준 1차 분류입니다. 세부 내용은 원문에서 확인해야 합니다.";
}

export async function fetchLatestDartDisclosures(companyName: string, stockCode: string): Promise<DisclosureItem[]> {
  const apiKey = process.env.OPEN_DART_API_KEY;
  if (!apiKey) return [];

  const corp = await getCorpCodeRow(stockCode);
  if (!corp) throw new Error("DART_CORP_CODE_NOT_FOUND");

  const url = new URL("https://opendart.fss.or.kr/api/list.json");
  url.searchParams.set("crtfc_key", apiKey);
  url.searchParams.set("corp_code", corp.corpCode);
  url.searchParams.set("bgn_de", "19990101");
  url.searchParams.set("page_count", "10");
  url.searchParams.set("page_no", "1");
  url.searchParams.set("sort", "date");
  url.searchParams.set("sort_mth", "desc");

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`OpenDART list failed: ${response.status}`);
  const payload = (await response.json()) as {
    status?: string;
    message?: string;
    list?: DartListItem[];
  };

  if (payload.status && payload.status !== "000") {
    if (payload.status === "013") return [];
    throw new Error(payload.message || "OpenDART error");
  }

  return (payload.list ?? [])
    .map((item): DisclosureItem | null => {
      const title = asString(item.report_nm);
      const rceptNo = asString(item.rcept_no);
      if (!title || !rceptNo) return null;

      const disclosure: DisclosureItem = {
        title,
        corpName: asString(item.corp_name) || corp.corpName || companyName,
        reportedAt: asString(item.rcept_dt) || "접수일 확인 필요",
        url: `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${rceptNo}`,
        type: classifyDisclosureType(title),
        sentiment: classifyDisclosureSentiment(title),
        impact: classifyDisclosureImpact(title),
        summary: buildDisclosureSummary(title),
        isMajor: /단일판매|공급계약|수주|배당|자사주|주요사항|실적|잠정|유상증자|전환사채|소송|정정|불성실|감자|횡령|배임|최대주주/.test(title),
        evidenceSource: "opendart"
      };

      return { ...disclosure, impactReason: buildDisclosureImpactReason(disclosure) };
    })
    .filter((item): item is DisclosureItem => item !== null)
    .slice(0, 10);
}
