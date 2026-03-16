import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE_NAME, readAdminSession } from "@/lib/auth/admin-session";
import { saveGeminiAppSettings } from "@/lib/app-settings-store";
import { getGeminiRuntimeSettings } from "@/lib/gemini";

type UpdateGeminiSettingsBody = {
  modelName?: string;
  promptTemplate?: string;
};

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const session = await readAdminSession(
    cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value ?? null,
  );

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as UpdateGeminiSettingsBody | null;
  const modelName = String(body?.modelName ?? "").trim();
  const promptTemplate = String(body?.promptTemplate ?? "").trim();

  if (!modelName || !promptTemplate) {
    return NextResponse.json(
      { error: "Both modelName and promptTemplate are required." },
      { status: 400 },
    );
  }

  await saveGeminiAppSettings({
    modelName,
    promptTemplate,
  });

  const settings = await getGeminiRuntimeSettings();

  return NextResponse.json(
    {
      modelName: settings.modelName,
      availableModels: settings.availableModels,
      promptTemplate: settings.promptTemplate,
      apiKeyConfigured: settings.apiKeyConfigured,
      lastRotatedAt: settings.lastRotatedAt,
    },
    { status: 200 },
  );
}
