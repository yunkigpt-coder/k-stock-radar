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
        explanation: narrative.shortExplanation || company.shortScore.explanation
      },
      longScore: {
        ...company.longScore,
        explanation: narrative.longExplanation || company.longScore.explanation
      },
      riskScore: {
        ...company.riskScore,
        explanation: narrative.riskExplanation || company.riskScore.explanation
      },
      aiCounterOpinion: narrative.aiCounterOpinion.length > 0 ? narrative.aiCounterOpinion : company.aiCounterOpinion,
      finalComment: narrative.llmUsed ? `${narrative.finalComment} AI 요약은 서버에서 수집된 입력 데이터만 기준으로 생성했습니다.` : narrative.finalComment
    }
  };

  return NextResponse.json(response);
}
