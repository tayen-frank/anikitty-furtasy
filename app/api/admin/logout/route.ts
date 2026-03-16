import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE_NAME,
  getExpiredAdminSessionCookieOptions,
} from "@/lib/auth/admin-session";

export async function POST() {
  const response = NextResponse.json({ ok: true }, { status: 200 });
  response.cookies.set(
    ADMIN_SESSION_COOKIE_NAME,
    "",
    getExpiredAdminSessionCookieOptions(),
  );

  return response;
}
