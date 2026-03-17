import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE_NAME, readAdminSession } from "@/lib/auth/admin-session";
import { saveAccessGateSettings } from "@/lib/app-settings-store";

type UpdateAccessGateBody = {
  passCode?: string;
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

  const body = (await request.json().catch(() => null)) as UpdateAccessGateBody | null;
  const passCode = String(body?.passCode ?? "").trim();

  if (!passCode) {
    return NextResponse.json({ error: "Pass code is required." }, { status: 400 });
  }

  const settings = await saveAccessGateSettings({ passCode });

  return NextResponse.json(
    {
      passCodeConfigured: Boolean(settings.accessGate.passCodeHash),
      updatedAt: settings.accessGate.updatedAt,
    },
    { status: 200 },
  );
}
