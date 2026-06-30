import { ChevronRight, Database, FileText, Newspaper, ShieldAlert, TrendingUp } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatDateTime, formatPercent, formatPrice } from "@/lib/format";
import type { CandidateStock } from "@/lib/types";
import { DataModeBadge, RiskBadge } from "./Badge";
import { ScoreGauge } from "./ScoreGauge";

export function CandidateCard({ candidate, onDetail }: { candidate: CandidateStock; onDetail: (query: string) => void }) {
  const changeStyle = candidate.changeRate >= 0 ? "text-rosewood" : "text-marine";

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
          <p className="text-lg font-bold text-ink">{formatPrice(candidate.currentPrice)}</p>
          <p className={`text-sm font-semibold ${changeStyle}`}>{formatPercent(candidate.changeRate)}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_160px]">
        <div className="grid gap-4 sm:grid-cols-3">
          <ScoreGauge score={candidate.shortScore.score} label="단기 모멘텀" variant="short" compact />
          <ScoreGauge score={candidate.longScore.score} label="장기 펀더멘털" variant="long" compact />
          <ScoreGauge score={candidate.riskScore.score} label="리스크 레벨" variant="risk" compact />
        </div>
        <div className="h-20 rounded-lg border border-zinc-100 bg-slatepanel/60 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={candidate.priceHistory.slice(-10)}>
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #d7dbd3", fontSize: 12 }}
                formatter={(value: unknown) => [formatPrice(Number(value)), "종가"]}
                labelFormatter={(label) => `${label}`}
              />
              <Line type="monotone" dataKey="close" stroke="#0f5f68" strokeWidth={2.4} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
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

      <div className="mt-4 rounded-lg border border-zinc-100 bg-paper/80 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-bold text-zinc-600">데이터 신뢰도</p>
          <span className="text-xs font-bold text-marine">
            {candidate.confidenceLabel} · {candidate.confidence}점
          </span>
        </div>
        <p className="mt-1 text-xs leading-5 text-zinc-600">{candidate.confidenceSummary}</p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-ink">
            <TrendingUp className="h-4 w-4 text-marine" />
            주요 근거 3개
          </div>
          <ul className="space-y-2 text-sm leading-6 text-zinc-700">
            {candidate.keyReasons.slice(0, 3).map((reason) => (
              <li key={reason}>- {reason}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-ink">
            <ShieldAlert className="h-4 w-4 text-amber-700" />
            주의 요인 3개
          </div>
          <ul className="space-y-2 text-sm leading-6 text-zinc-700">
            {candidate.majorRisks.slice(0, 3).map((risk) => (
              <li key={risk}>- {risk}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-4">
        <div className="flex items-center gap-2">
          <RiskBadge value={candidate.riskScore.score} />
          <span className="text-sm font-semibold text-zinc-600">검토 우선도 {candidate.confidence}</span>
        </div>
        <button
          type="button"
          onClick={() => onDetail(candidate.name)}
          className="inline-flex items-center gap-2 rounded-md bg-marine px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink"
        >
          리서치 리포트 보기
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
