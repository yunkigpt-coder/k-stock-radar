import type { NewsItem, NewsRange, Sentiment } from "./types";

type NaverNewsItem = {
  title?: string;
  originallink?: string;
  link?: string;
  description?: string;
  pubDate?: string;
};

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function cleanHtml(text: string) {
  return text
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseNaverPubDate(pubDate: string) {
  const date = new Date(pubDate);
  return Number.isNaN(date.getTime()) ? "발행 시각 확인 필요" : date.toISOString();
}

function sourceFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "네이버 뉴스";
  }
}

function summarizeDescription(description: string) {
  const cleaned = cleanHtml(description);
  if (!cleaned) return "기사 설명을 기반으로 한 요약 정보가 제공되지 않았습니다.";
  const sentences = cleaned.match(/[^.!?。]+[.!?。]?/g)?.slice(0, 3).join(" ").trim() ?? cleaned;
  return sentences.length > 240 ? `${sentences.slice(0, 237)}...` : sentences;
}

export function classifyNewsSentiment(title: string, description: string): Sentiment {
  const text = `${title} ${description}`.toLowerCase();
  const positive = ["수요", "기대", "성장", "호조", "수주", "상승", "증가", "개선", "배당", "자사주", "ai", "hbm", "계약"];
  const negative = ["우려", "하락", "감소", "부진", "리스크", "소송", "규제", "적자", "악화", "정정", "유상증자"];
  if (negative.some((keyword) => text.includes(keyword))) return "negative";
  if (positive.some((keyword) => text.includes(keyword))) return "positive";
  return "neutral";
}

function newsRangeFromDate(publishedAt: string): NewsRange {
  const time = new Date(publishedAt).getTime();
  if (!Number.isFinite(time)) return "latest";
  const ageHours = (Date.now() - time) / (60 * 60 * 1000);
  return ageHours <= 48 ? "48h" : "latest";
}

function relatedKeywords(companyName: string, stockCode: string, title: string, summary: string) {
  const seeds = [companyName, stockCode, "주식", "실적", "공시", "배당"];
  const text = `${title} ${summary}`.toLowerCase();
  return seeds.filter((keyword) => keyword && text.includes(keyword.toLowerCase())).slice(0, 5);
}

export function buildNewsImpactReason(news: NewsItem) {
  const prefix = news.newsRange === "48h" ? "48시간 이내 뉴스로 단기 모멘텀에 반영합니다." : "참고 뉴스로 단기 점수에는 약하게 반영합니다.";
  if (news.sentiment === "positive") return `${prefix} 긍정 신호가 확인된 기사입니다.`;
  if (news.sentiment === "negative") return `${prefix} 리스크 점검이 필요한 기사입니다.`;
  return `${prefix} 중립 근거로 확인한 기사입니다.`;
}

export function hasNaverNewsCredentials() {
  return Boolean(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET);
}

export async function fetchNaverNews(companyName: string, stockCode: string): Promise<NewsItem[]> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) return [];

  const queries = [`${companyName} 주식`, `${companyName} 실적`, `${companyName} 공시`, `${companyName} 배당`, `${companyName} ${stockCode}`];
  const seen = new Set<string>();
  const rows: NewsItem[] = [];

  for (const query of queries) {
    const url = new URL("https://openapi.naver.com/v1/search/news.json");
    url.searchParams.set("query", query);
    url.searchParams.set("display", "10");
    url.searchParams.set("start", "1");
    url.searchParams.set("sort", "date");

    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret
      }
    });

    if (!response.ok) throw new Error(`Naver News API failed: ${response.status}`);
    const payload = (await response.json()) as { items?: NaverNewsItem[] };

    for (const item of payload.items ?? []) {
      const title = cleanHtml(asString(item.title));
      const itemUrl = asString(item.originallink) || asString(item.link);
      if (!title || !itemUrl || seen.has(itemUrl)) continue;
      seen.add(itemUrl);

      const publishedAt = parseNaverPubDate(asString(item.pubDate));
      const summary = summarizeDescription(asString(item.description));
      const newsRange = newsRangeFromDate(publishedAt);
      const news: NewsItem = {
        title,
        source: sourceFromUrl(itemUrl),
        publishedAt,
        sentiment: classifyNewsSentiment(title, summary),
        summary,
        url: itemUrl,
        relatedKeywords: relatedKeywords(companyName, stockCode, title, summary),
        newsRange,
        isRecent: newsRange === "48h",
        evidenceSource: "naver"
      };

      rows.push({ ...news, impactReason: buildNewsImpactReason(news) });
    }
  }

  const sorted = rows.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  const recent = sorted.filter((item) => item.newsRange === "48h");
  return (recent.length > 0 ? recent : sorted).slice(0, 8);
}
