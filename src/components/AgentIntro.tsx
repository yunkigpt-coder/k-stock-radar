import { AlertTriangle, BarChart3, Brain, ClipboardList, FileText, Newspaper, Target } from "lucide-react";

const process = [
  { icon: Newspaper, title: "뉴스 수집", body: "최근 48시간 뉴스를 우선 확인하고, 없으면 최근 뉴스 범위를 단계적으로 넓혀 참고 근거를 표시합니다." },
  { icon: FileText, title: "DART 확인", body: "DART는 기간 기준 없이 해당 기업의 최신 공시를 확인하고 원문 링크를 제공합니다." },
  { icon: BarChart3, title: "재무와 주가 분석", body: "재무 안정성, 성장성, 밸류에이션, 지연 시세와 일별 차트를 함께 봅니다." },
  { icon: Brain, title: "AI 요약", body: "수집된 입력 데이터만 바탕으로 요약과 리스크 코멘트를 작성합니다." }
];

const methods = ["기본 분석", "재무지표 분석", "밸류에이션", "산업/경쟁 분석", "DART 공시", "뉴스 모멘텀", "3C", "SWOT"];

export function AgentIntro({ onStart }: { onStart: () => void }) {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-marine/20 bg-marine/10 px-3 py-2 text-sm font-semibold text-marine">
              <Target className="h-4 w-4" />
              국내 주식 리서치 Agent
            </div>
            <h2 className="text-3xl font-bold text-ink md:text-4xl">뉴스, 공시, 재무, 차트를 한 화면에서 검토합니다.</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-700">K-Stock Radar는 공개 데이터를 빠르게 정리해 검토 후보와 기업별 리서치 리포트로 이어주는 분석 보조 도구입니다.</p>
          </div>
          <button type="button" onClick={onStart} className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-marine">
            <ClipboardList className="h-4 w-4" />
            48시간 Radar 보기
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {process.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-soft">
              <Icon className="h-5 w-5 text-marine" />
              <h3 className="mt-4 text-base font-bold text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{item.body}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-soft">
          <h3 className="text-lg font-bold text-ink">단기 모멘텀과 장기 잠재력</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="border-l-4 border-marine pl-4">
              <p className="font-semibold text-ink">단기 모멘텀</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600">뉴스 모멘텀, 공시 영향, 가격 추세, 거래량 변화를 중심으로 계산합니다.</p>
            </div>
            <div className="border-l-4 border-mint pl-4">
              <p className="font-semibold text-ink">장기 잠재력</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600">재무 안정성, 성장성, 경쟁 우위, 밸류에이션을 중심으로 계산합니다.</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-zinc-600">3C와 SWOT은 점수표가 아니라 기업 구조와 리스크를 이해하기 위한 정성 분석 프레임입니다.</p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-soft">
          <h3 className="text-lg font-bold text-ink">사용 방법</h3>
          <ol className="mt-4 space-y-2 text-sm leading-6 text-zinc-700">
            <li>1. 48시간 Radar에서 최근 뉴스 중심 검토 후보를 확인합니다.</li>
            <li>2. 단기, 장기, 리스크 점수와 핵심 근거를 비교합니다.</li>
            <li>3. 기업명 또는 종목코드로 상세 리포트에서 뉴스, DART, 재무, 차트를 확인합니다.</li>
          </ol>
          <div className="mt-4 flex flex-wrap gap-2">
            {methods.map((method) => (
              <span key={method} className="rounded-md border border-zinc-200 bg-paper px-3 py-1 text-xs font-semibold text-zinc-700">
                {method}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-saffron/30 bg-saffron/10 p-5">
        <div className="flex gap-3">
          <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <h3 className="font-bold text-ink">리서치 참고 안내</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-700">점수와 코멘트는 투자 조언이 아니라 공개 데이터를 정리한 참고 정보입니다. 실제 판단 전 원문 공시와 최신 시세를 함께 확인해 주세요.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
