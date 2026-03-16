import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE_NAME,
  getAdminAuthConfigState,
  readAdminSession,
} from "@/lib/auth/admin-session";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin/dashboard")) {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value ?? null;
    const session = await readAdminSession(token);

    if (!session) {
      const loginUrl = new URL("/admin", request.url);
      loginUrl.searchParams.set("from", request.nextUrl.pathname);

      return NextResponse.redirect(loginUrl);
    }
  }

  if (request.nextUrl.pathname === "/admin") {
    const configState = getAdminAuthConfigState();
    const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value ?? null;
    const session = await readAdminSession(token);

    if (configState.isConfigured && session) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/dashboard/:path*"],
};
