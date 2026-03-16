import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/admin/dashboard-shell";
import { ADMIN_SESSION_COOKIE_NAME, readAdminSession } from "@/lib/auth/admin-session";
import { getGeminiRuntimeSettings } from "@/lib/gemini";
import { getPortraitJobRecords } from "@/lib/mock-job-store";
import { getAllStyles } from "@/lib/style-store";
import type { AppSettings } from "@/types/domain";

export const dynamic = "force-dynamic";

function DashboardShellFallback() {
  return (
    <main className="admin-shell min-h-screen p-4 sm:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-[2rem] bg-[#20273a] p-5 text-white shadow-panel">
          <div className="border-b border-white/10 pb-5">
            <p className="text-sm uppercase tracking-[0.32em] text-[#d9ba7c]">Anikitty CMS</p>
            <h1 className="mt-3 text-3xl">Admin Dashboard</h1>
          </div>
        </aside>
        <section className="rounded-[2rem] border border-black/5 bg-[#fcfaf6] p-5 shadow-panel sm:p-7">
          <div className="rounded-[1.75rem] bg-admin-cloud px-4 py-6 text-admin-slate">
            Loading dashboard...
          </div>
        </section>
      </div>
    </main>
  );
}

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const session = await readAdminSession(
    cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value ?? null,
  );

  if (!session) {
    redirect("/admin");
  }

  const geminiSettings = getGeminiRuntimeSettings();
  const appSettings: AppSettings = {
    gemini: {
      modelName: geminiSettings.modelName,
      promptTemplate: geminiSettings.promptTemplate,
      apiKeyConfigured: geminiSettings.apiKeyConfigured,
      lastRotatedAt: null,
    },
  };

  return (
    <Suspense fallback={<DashboardShellFallback />}>
      <DashboardShell
        adminEmail={session.email}
        settings={appSettings}
        styles={await getAllStyles()}
        records={getPortraitJobRecords()}
      />
    </Suspense>
  );
}
