import { NextResponse } from "next/server";
import { verifyAccessPassCode } from "@/lib/app-settings-store";
import {
  PUBLIC_ACCESS_GATE_COOKIE_NAME,
  createPublicAccessGateToken,
  getPublicAccessGateCookieOptions,
} from "@/lib/auth/public-access-gate";

type VerifyAccessGateBody = {
  passCode?: string;
};

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as VerifyAccessGateBody | null;
  const passCode = String(body?.passCode ?? "").trim();

  if (!passCode) {
    return NextResponse.json(
      { isConfigured: true, isValid: false, error: "Pass code is required." },
      { status: 400 },
    );
  }

  const result = await verifyAccessPassCode(passCode);

  if (!result.isConfigured) {
    return NextResponse.json(
      {
        isConfigured: false,
        isValid: false,
        error: "The public access gate is not configured yet. Please contact the site owner.",
      },
      { status: 503 },
    );
  }

  if (!result.isValid) {
    return NextResponse.json(
      {
        isConfigured: true,
        isValid: false,
        error: "Incorrect pass code.",
      },
      { status: 401 },
    );
  }

  const response = NextResponse.json(
    {
      isConfigured: true,
      isValid: true,
    },
    { status: 200 },
  );

  response.cookies.set(
    PUBLIC_ACCESS_GATE_COOKIE_NAME,
    await createPublicAccessGateToken(),
    getPublicAccessGateCookieOptions(),
  );

  return response;
}
