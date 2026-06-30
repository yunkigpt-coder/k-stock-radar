import type { CompanyAnalysis } from "./types";

export type LlmNarrative = {
  shortExplanation: string;
  longExplanation: string;
  riskExplanation: string;
  confidenceReason: string;
  aiCounterOpinion: string[];
  finalComment: string;
  llmUsed: boolean;
};

const fallbackNarrative = (company: CompanyAnalysis): LlmNarrative => ({
  shortExplanation: company.shortScore.explanation,
  longExplanation: company.longScore.explanation,
  riskExplanation: company.riskScore.explanation,
  confidenceReason: company.confidenceReason,
  aiCounterOpinion: company.aiCounterOpinion,
  finalComment: company.finalComment,
  llmUsed: false
});

const parseOutputText = (payload: unknown): string | null => {
  if (!payload || typeof payload !== "object") return null;
  const maybe = payload as {
    output_text?: string;
    output?: Array<{ content?: Array<{ text?: string; type?: string }> }>;
  };
  if (typeof maybe.output_text === "string") return maybe.output_text;

  const text = maybe.output
    ?.flatMap((item) => item.content ?? [])
    .map((content) => content.text)
    .filter(Boolean)
    .join("\n");

  return text || null;
};

export async function generateLlmNarrative(company: CompanyAnalysis): Promise<LlmNarrative> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fallbackNarrative(company);

  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      shortExplanation: { type: "string" },
      longExplanation: { type: "string" },
      riskExplanation: { type: "string" },
      confidenceReason: { type: "string" },
      aiCounterOpinion: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
      finalComment: { type: "string" }
    },
    required: ["shortExplanation", "longExplanation", "riskExplanation", "confidenceReason", "aiCounterOpinion", "finalComment"]
  };

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "system",
            content:
              "You are a Korean equity research assistant. Use only the supplied news, disclosure, financial, and price data. Do not provide buy/sell recommendations. Explain evidence, risks, and uncertainty in Korean."
          },
          {
            role: "user",
            content: JSON.stringify({
              task:
                "수집된 데이터만 근거로 단기 모멘텀, 장기 펀더멘털, 리스크 점수의 이유와 반대 의견, 리서치 스탠스를 작성하세요. 투자 권유 표현은 금지합니다.",
              company
            })
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "k_stock_radar_narrative",
            strict: true,
            schema
          }
        }
      })
    });

    if (!response.ok) return fallbackNarrative(company);
    const payload = await response.json();
    const outputText = parseOutputText(payload);
    if (!outputText) return fallbackNarrative(company);

    const parsed = JSON.parse(outputText) as Omit<LlmNarrative, "llmUsed">;
    return {
      shortExplanation: parsed.shortExplanation,
      longExplanation: parsed.longExplanation,
      riskExplanation: parsed.riskExplanation,
      confidenceReason: parsed.confidenceReason,
      aiCounterOpinion: parsed.aiCounterOpinion,
      finalComment: parsed.finalComment,
      llmUsed: true
    };
  } catch {
    return fallbackNarrative(company);
  }
}
