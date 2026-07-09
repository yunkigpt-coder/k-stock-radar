import { NextResponse } from "next/server";
import { getRecommendedCandidates } from "@/lib/dataProviders";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = Number(searchParams.get("limit") ?? "12");
  const sector = searchParams.get("sector");
  const sortParam = searchParams.get("sort");
  const sort = sortParam === "long" || sortParam === "risk" || sortParam === "short" ? sortParam : "short";
  const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(limitParam, 20)) : 12;

  const response = await getRecommendedCandidates({
    limit,
    sector,
    sort
  });

  return NextResponse.json(response);
}
