import { NextResponse } from "next/server";
import { getCompanyResearch } from "@/lib/dataProviders";
import { generateLlmNarrative } from "@/lib/llm";
import type { AnalyzeResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { query?: string };
  const company = await getCompanyResearch(body.query);
  const narrative = await generateLlmNarrative(company);

  const response: AnalyzeResponse = {
    analysis: {
      ...company,
      confidenceReason: narrative.confidenceReason,
      shortScore: {
        ...company.shortScore,
        explanation: narrative.shortExplanation
      },
      longScore: {
        ...company.longScore,
        explanation: narrative.longExplanation
      },
      riskScore: {
        ...company.riskScore,
        explanation: narrative.riskExplanation
      },
      aiCounterOpinion: narrative.aiCounterOpinion,
      finalComment: narrative.llmUsed
        ? `${narrative.finalComment} AI 요약은 서버에서 수집한 입력 데이터만을 기준으로 생성됐습니다.`
        : narrative.finalComment
    }
  };

  return NextResponse.json(response);
}
