import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE_NAME,
  createAdminSessionToken,
  getAdminAuthConfigState,
  getAdminSessionCookieOptions,
  verifyAdminCredentials,
} from "@/lib/auth/admin-session";

export async function POST(request: Request) {
  // TODO: Replace env-based password comparison with hashed credentials or SSO.
  // TODO: Add audit logs, rate limiting, and lockout rules for repeated failures.
  const body = (await request.json().catch(() => null)) as
    | { email?: string; password?: string }
    | null;

  const email = String(body?.email ?? "");
  const password = String(body?.password ?? "");
  const configState = getAdminAuthConfigState();

  if (!configState.isConfigured) {
    return NextResponse.json(
      {
        error:
          "Admin authentication is not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_SESSION_SECRET on the server.",
      },
      { status: 500 },
    );
  }

  const verifiedEmail = verifyAdminCredentials({ email, password });

  if (!verifiedEmail) {
    return NextResponse.json({ error: "Invalid admin credentials." }, { status: 401 });
  }

  const sessionToken = await createAdminSessionToken(verifiedEmail);
  const response = NextResponse.json({ ok: true }, { status: 200 });
  response.cookies.set(
    ADMIN_SESSION_COOKIE_NAME,
    sessionToken,
    getAdminSessionCookieOptions(),
  );

  return response;
}
