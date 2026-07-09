import type { CompanyAnalysis, StrategyCommentary, SwotAnalysis, ThreeCAnalysis } from "./types";

export type LlmNarrative = {
  shortExplanation: string;
  longExplanation: string;
  riskExplanation: string;
  confidenceReason: string;
  aiCounterOpinion: string[];
  finalComment: string;
  llmUsed: boolean;
};

export type StrategyNarrative = {
  threeC: ThreeCAnalysis;
  swot: SwotAnalysis;
  strategyCommentary: StrategyCommentary;
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

const fallbackStrategy = (company: CompanyAnalysis): StrategyNarrative => ({
  threeC: company.threeC,
  swot: company.swot,
  strategyCommentary:
    company.strategyCommentary ?? {
      shortTerm: company.shortComment,
      longTerm: company.longComment,
      watchPoints: "최근 실적 발표, DART 공시 원문, 업종 내 밸류에이션 비교를 함께 확인해야 합니다.",
      dataNote: "전략 분석은 업종, 뉴스, 공시, 재무 지표를 규칙 기반으로 해석해 생성했습니다."
    },
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

async function requestJson(model: string, schemaName: string, schema: object, system: string, task: string, company: CompanyAnalysis) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify({ task, company }) }
      ],
      text: {
        format: {
          type: "json_schema",
          name: schemaName,
          strict: true,
          schema
        }
      }
    })
  });

  if (!response.ok) return null;
  const outputText = parseOutputText(await response.json());
  return outputText ? JSON.parse(outputText) : null;
}

export async function generateLlmNarrative(company: CompanyAnalysis): Promise<LlmNarrative> {
  if (!process.env.OPENAI_API_KEY) return fallbackNarrative(company);

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
    const parsed = (await requestJson(
      model,
      "k_stock_radar_narrative",
      schema,
      "당신은 한국 주식 리서치 보조 Agent입니다. 제공된 데이터만 사용하고 매수 또는 매도 추천은 하지 마세요. 모든 문장은 한국어로 작성하세요.",
      "수집 데이터에 근거해 단기 모멘텀, 장기 잠재력, 리스크 점수 설명과 AI 반대 의견을 한국어로 작성해 주세요.",
      company
    )) as Omit<LlmNarrative, "llmUsed"> | null;

    if (!parsed) return fallbackNarrative(company);
    return { ...parsed, llmUsed: true };
  } catch (error) {
    console.warn("LLM narrative failed", error);
    return fallbackNarrative(company);
  }
}

export async function generateStrategyNarrative(company: CompanyAnalysis): Promise<StrategyNarrative> {
  if (!process.env.OPENAI_API_KEY) return fallbackStrategy(company);

  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      threeC: {
        type: "object",
        additionalProperties: false,
        properties: {
          company: { type: "string" },
          customer: { type: "string" },
          competitor: { type: "string" }
        },
        required: ["company", "customer", "competitor"]
      },
      swot: {
        type: "object",
        additionalProperties: false,
        properties: {
          strengths: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 3 },
          weaknesses: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 3 },
          opportunities: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 3 },
          threats: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 3 }
        },
        required: ["strengths", "weaknesses", "opportunities", "threats"]
      },
      strategyCommentary: {
        type: "object",
        additionalProperties: false,
        properties: {
          shortTerm: { type: "string" },
          longTerm: { type: "string" },
          watchPoints: { type: "string" },
          dataNote: { type: "string" }
        },
        required: ["shortTerm", "longTerm", "watchPoints", "dataNote"]
      }
    },
    required: ["threeC", "swot", "strategyCommentary"]
  };

  try {
    const parsed = (await requestJson(
      model,
      "k_stock_radar_strategy",
      schema,
      "당신은 한국 주식 전략 분석가입니다. 점수 숫자를 직접 나열하지 말고 업종, 뉴스, 공시, 재무, 리스크 키워드를 사업적 인사이트로 바꾸세요. 매수 또는 매도 추천은 금지합니다.",
      "3C, SWOT, 전략적 해석을 작성해 주세요. SWOT에는 점수 숫자나 등락률 숫자를 직접 쓰지 말고 정성 분석 문장으로 작성하세요.",
      company
    )) as Omit<StrategyNarrative, "llmUsed"> | null;

    if (!parsed) return fallbackStrategy(company);
    return { ...parsed, llmUsed: true };
  } catch (error) {
    console.warn("LLM strategy failed", error);
    return fallbackStrategy(company);
  }
}
