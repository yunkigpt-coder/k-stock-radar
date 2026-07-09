"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ChevronRight, Database, ExternalLink, FileText, Newspaper, ShieldAlert, TrendingUp, X } from "lucide-react";
import { formatDateTime, formatPercent, formatPrice } from "@/lib/format";
import type { CandidateStock, DisclosureItem, NewsItem, NewsRange, Sentiment } from "@/lib/types";
import { DataModeBadge, RiskBadge, SentimentBadge } from "./Badge";
import { ScoreGauge } from "./ScoreGauge";

const sentimentText: Record<Sentiment, string> = {
  positive: "긍정",
  neutral: "중립",
  negative: "부정"
};

const rangeLabels: Record<NewsRange, string> = {
  "48h": "48시간 이내",
  "7d": "최근 7일",
  "30d": "최근 30일",
  latest: "참고 뉴스"
};

export function CandidateCard({ candidate, onDetail }: { candidate: CandidateStock; onDetail: (query: string) => void }) {
  const [newsOpen, setNewsOpen] = useState(false);
  const [dartOpen, setDartOpen] = useState(false);
  const hasQuote = Boolean(candidate.isMarketData && candidate.quotePrice && candidate.quotePrice > 0);
  const changeStyle = (candidate.quoteChangeRate ?? candidate.changeRate) >= 0 ? "text-rosewood" : "text-marine";
  const newsCounts = useMemo(() => countSentiments(candidate.news), [candidate.news]);
  const hasNewsEvidence = candidate.news.length > 0;
  const hasDisclosureEvidence = candidate.disclosures.length > 0;
  const news48hCount = hasNewsEvidence ? candidate.news.filter((item) => item.newsRange === "48h").length : candidate.newsCount;
  const referenceNewsCount = hasNewsEvidence ? Math.max(0, candidate.news.length - news48hCount) : 0;
  const majorDisclosureCount = hasDisclosureEvidence ? candidate.disclosures.filter((item) => item.isMajor).length : candidate.disclosureCount;
  const mainNews = candidate.news.slice(0, 2);
  const mainDisclosure = candidate.disclosures[0];

  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-bold text-ink">{candidate.name}</h3>
            <span className="text-sm font-semibold text-zinc-500">{candidate.code}</span>
            <DataModeBadge mode={candidate.dataMode} />
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            {candidate.sector} · {candidate.industry}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {candidate.themeTags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-md bg-paper px-2 py-1 text-xs font-semibold text-zinc-600">
                #{tag}
              </span>
            ))}
          </div>
        </div>
        <div className="text-right">
          {hasQuote ? (
            <>
              <p className="text-lg font-bold text-ink">{formatPrice(candidate.quotePrice)}</p>
              <p className={`text-sm font-semibold ${changeStyle}`}>{formatPercent(candidate.quoteChangeRate ?? candidate.changeRate)}</p>
              <span className="mt-1 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">지연 시세</span>
              <p className="mt-1 text-[11px] font-medium text-zinc-500">현재가 출처: {candidate.quoteSource ?? "Yahoo Finance"}</p>
            </>
          ) : (
            <p className="text-xs font-semibold text-zinc-400">가격 데이터 없음</p>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <ScoreGauge score={candidate.shortScore.score} label="단기 모멘텀" variant="short" compact />
        <ScoreGauge score={candidate.longScore.score} label="장기 잠재력" variant="long" compact />
        <ScoreGauge score={candidate.riskScore.score} label="리스크" variant="risk" compact />
      </div>

      <div className="mt-4 rounded-lg border border-zinc-100 bg-paper/80 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-bold text-ink">뉴스 근거</p>
          <p className="text-xs font-semibold text-zinc-500">
            뉴스 48h: {news48hCount}건 · 참고 뉴스: {referenceNewsCount}건
          </p>
        </div>
        <p className="mt-1 text-xs font-semibold text-zinc-500">
          긍정 {newsCounts.positive} / 중립 {newsCounts.neutral} / 부정 {newsCounts.negative}
        </p>
        {mainNews.length > 0 ? (
          <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-700">
            {mainNews.map((item) => (
              <li key={`${item.title}-${item.publishedAt}`} className="line-clamp-1">
                - {item.title}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs font-medium text-zinc-500">Universe 기반 뉴스 신호만 표시합니다.</p>
        )}
        {hasNewsEvidence ? (
          <button type="button" onClick={() => setNewsOpen(true)} className="mt-3 inline-flex items-center gap-2 rounded-md border border-marine px-3 py-2 text-xs font-bold text-marine transition hover:bg-marine hover:text-white">
            뉴스 근거 보기
          </button>
        ) : null}
      </div>

      <div className="mt-3 rounded-lg border border-zinc-100 bg-white p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-bold text-ink">공시 근거</p>
          <p className="text-xs font-semibold text-zinc-500">
            최신 공시: {candidate.disclosures.length}건 · 주요 공시: {majorDisclosureCount}건
          </p>
        </div>
        {mainDisclosure ? <p className="mt-2 line-clamp-1 text-xs leading-5 text-zinc-700">- {mainDisclosure.title}</p> : <p className="mt-2 text-xs font-medium text-zinc-500">Universe 기반 공시 신호만 표시합니다.</p>}
        {hasDisclosureEvidence ? (
          <button type="button" onClick={() => setDartOpen(true)} className="mt-3 inline-flex items-center gap-2 rounded-md border border-marine px-3 py-2 text-xs font-bold text-marine transition hover:bg-marine hover:text-white">
            공시 근거 보기
          </button>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-semibold text-zinc-600 sm:grid-cols-4">
        <span className="inline-flex items-center gap-1 rounded-md bg-paper px-2 py-2">
          <Newspaper className="h-3.5 w-3.5" />
          뉴스 {candidate.newsCount}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-paper px-2 py-2">
          <FileText className="h-3.5 w-3.5" />
          공시 {candidate.disclosureCount}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-paper px-2 py-2">
          <Database className="h-3.5 w-3.5" />
          출처 {candidate.sourceCount}
        </span>
        <span className="rounded-md bg-paper px-2 py-2">{formatDateTime(candidate.updatedAt)}</span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <EvidenceList title="주요 근거" icon={<TrendingUp className="h-4 w-4 text-marine" />} items={candidate.keyReasons.slice(0, 3)} />
        <EvidenceList title="주의 요인" icon={<ShieldAlert className="h-4 w-4 text-amber-700" />} items={candidate.majorRisks.slice(0, 3)} />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-4">
        <div className="flex items-center gap-2">
          <RiskBadge value={candidate.riskScore.score} />
          <span className="text-sm font-semibold text-zinc-600">검토 우선도 {candidate.confidence}</span>
        </div>
        <button type="button" onClick={() => onDetail(candidate.name)} className="inline-flex items-center gap-2 rounded-md bg-marine px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink">
          리서치 리포트 보기
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {newsOpen ? <NewsEvidenceModal candidate={candidate} onClose={() => setNewsOpen(false)} /> : null}
      {dartOpen ? <DisclosureEvidenceModal candidate={candidate} onClose={() => setDartOpen(false)} /> : null}
    </article>
  );
}

function EvidenceList({ title, icon, items }: { title: string; icon: ReactNode; items: string[] }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-ink">
        {icon}
        {title}
      </div>
      <ul className="space-y-2 text-sm leading-6 text-zinc-700">
        {items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </div>
  );
}

function countSentiments(news: NewsItem[]) {
  return news.reduce(
    (acc, item) => {
      acc[item.sentiment] += 1;
      return acc;
    },
    { positive: 0, neutral: 0, negative: 0 } satisfies Record<Sentiment, number>
  );
}

function DisclosureEvidenceModal({ candidate, onClose }: { candidate: CandidateStock; onClose: () => void }) {
  return (
    <Modal title={`${candidate.name} 공시 근거`} description="최신 DART/KRX 원문 링크가 확인된 공시만 표시합니다." onClose={onClose}>
      {candidate.disclosures.length > 0 ? (
        <div className="mt-4 space-y-3">
          {candidate.disclosures.slice(0, 5).map((item) => (
            <DisclosureModalItem key={`${item.title}-${item.reportedAt}-${item.url}`} item={item} />
          ))}
        </div>
      ) : (
        <EmptyModalText text="확인된 DART 공시가 없습니다." />
      )}
    </Modal>
  );
}

function DisclosureModalItem({ item }: { item: DisclosureItem }) {
  return (
    <article className="rounded-lg border border-zinc-200 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <SentimentBadge sentiment={item.sentiment} />
        <span className="text-xs font-semibold text-zinc-500">
          접수일 {item.reportedAt || "-"} · {item.type}
        </span>
      </div>
      <h4 className="mt-2 font-bold text-ink">{item.title}</h4>
      <p className="mt-2 text-sm leading-6 text-zinc-700">{item.summary}</p>
      <p className="mt-2 rounded-md bg-paper p-2 text-xs leading-5 text-zinc-600">
        <span className="font-bold text-marine">점수 반영 이유</span> · {item.impactReason ?? "공시명 기준 분류 결과입니다."}
      </p>
      {item.url ? <OriginalLink href={item.url} /> : null}
    </article>
  );
}

function NewsEvidenceModal({ candidate, onClose }: { candidate: CandidateStock; onClose: () => void }) {
  return (
    <Modal title={`${candidate.name} 뉴스 근거`} description="단기 모멘텀과 리스크 점수에 참고한 뉴스입니다." onClose={onClose}>
      {candidate.news.length > 0 ? (
        <div className="mt-4 space-y-3">
          {candidate.news.slice(0, 5).map((item) => (
            <NewsModalItem key={`${item.title}-${item.publishedAt}-${item.url}`} item={item} />
          ))}
        </div>
      ) : (
        <EmptyModalText text="확인된 뉴스가 없습니다." />
      )}
      <p className="mt-4 text-xs leading-5 text-zinc-500">뉴스 요약은 원문 확인을 돕기 위한 참고 정보입니다.</p>
    </Modal>
  );
}

function NewsModalItem({ item }: { item: NewsItem }) {
  return (
    <article className="rounded-lg border border-zinc-200 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <SentimentBadge sentiment={item.sentiment} />
        <span className="rounded-md border border-zinc-200 bg-paper px-2 py-1 text-xs font-semibold text-zinc-600">{rangeLabels[item.newsRange ?? "latest"]}</span>
        <span className="text-xs font-semibold text-zinc-500">
          {item.source} · {formatDateTime(item.publishedAt)}
        </span>
      </div>
      <h4 className="mt-2 font-bold text-ink">{item.title}</h4>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-700">{item.summary}</p>
      <p className="mt-2 rounded-md bg-paper p-2 text-xs leading-5 text-zinc-600">
        <span className="font-bold text-marine">점수 반영 이유</span> · {item.impactReason ?? `${sentimentText[item.sentiment]} 뉴스가 점수 산정의 보조 근거로 반영됐습니다.`}
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {(item.relatedKeywords ?? []).slice(0, 4).map((keyword) => (
            <span key={keyword} className="rounded-md bg-slatepanel px-2 py-1 text-xs font-semibold text-zinc-600">
              #{keyword}
            </span>
          ))}
        </div>
        {item.url ? <OriginalLink href={item.url} compact /> : null}
      </div>
    </article>
  );
}

function OriginalLink({ href, compact = false }: { href: string; compact?: boolean }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${compact ? "" : "mt-3 "}inline-flex items-center gap-1 text-xs font-bold text-marine underline-offset-4 hover:underline`}>
      원문 보기
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}

function Modal({ title, description, onClose, children }: { title: string; description: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 px-4 py-8">
      <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-5 shadow-lift">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-ink">{title}</h3>
            <p className="mt-1 text-sm text-zinc-600">{description}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-zinc-500 transition hover:bg-paper hover:text-ink" aria-label="근거 닫기">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function EmptyModalText({ text }: { text: string }) {
  return <div className="mt-5 rounded-lg border border-dashed border-zinc-300 bg-paper p-6 text-center text-sm font-semibold text-zinc-600">{text}</div>;
}
