import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE_NAME, readAdminSession } from "@/lib/auth/admin-session";
import { CURATED_GEMINI_IMAGE_MODELS } from "@/lib/gemini";

type GeminiModelListResponse = {
  models?: Array<{
    name?: string;
    baseModelId?: string;
    displayName?: string;
    supportedGenerationMethods?: string[];
  }>;
};

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  const session = await readAdminSession(
    cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value ?? null,
  );

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim() ?? "";

  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured." }, { status: 400 });
  }

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=200", {
    headers: {
      "x-goog-api-key": apiKey,
    },
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => null)) as GeminiModelListResponse | null;

  if (!response.ok) {
    return NextResponse.json(
      { error: "Unable to load Gemini models from Google." },
      { status: response.status || 500 },
    );
  }

  const discoveredModelIds =
    payload?.models
      ?.filter((model) => model.supportedGenerationMethods?.includes("generateContent"))
      .map((model) => model.baseModelId?.trim() || model.name?.replace(/^models\//, "").trim() || "")
      .filter(Boolean)
      .filter((modelId) => modelId.includes("image")) ?? [];
  const availableModels = Array.from(
    new Set([...CURATED_GEMINI_IMAGE_MODELS, ...discoveredModelIds]),
  );

  return NextResponse.json(
    {
      models: availableModels,
      discoveredAt: new Date().toISOString(),
    },
    { status: 200 },
  );
}
