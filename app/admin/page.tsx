import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import {
  ADMIN_SESSION_COOKIE_NAME,
  getAdminAuthConfigState,
  readAdminSession,
} from "@/lib/auth/admin-session";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = await readAdminSession(
    cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value ?? null,
  );

  if (session) {
    redirect("/admin/dashboard");
  }

  const authConfig = getAdminAuthConfigState();

  return <AdminLoginForm authConfigured={authConfig.isConfigured} />;
}
