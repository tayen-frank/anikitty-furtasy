"use client";

import { useMemo } from "react";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { GeminiSettingsPanel } from "@/components/admin/gemini-settings-panel";
import { GenerationRecordsPanel } from "@/components/admin/generation-records-panel";
import { StyleLibraryPanel } from "@/components/admin/style-library-panel";
import { Badge } from "@/components/ui/badge";
import { appSettings, dashboardTabs, generationRecords, styles } from "@/lib/mock-data";
import type { AdminDashboardTab } from "@/types/domain";
import { cn } from "@/lib/utils";

const DASHBOARD_ROUTE = "/admin/dashboard" as const;

export function DashboardShell({ adminEmail }: { adminEmail: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = (searchParams.get("tab") as AdminDashboardTab | null) ?? "style-library";

  const activeContent = useMemo(() => {
    if (activeTab === "gemini-settings") {
      return <GeminiSettingsPanel settings={appSettings} />;
    }

    if (activeTab === "generation-records") {
      return <GenerationRecordsPanel records={generationRecords} />;
    }

    return <StyleLibraryPanel initialStyles={styles} />;
  }, [activeTab]);

  return (
    <main className="admin-shell min-h-screen p-4 sm:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-[2rem] bg-[#20273a] p-5 text-white shadow-panel">
          <div className="border-b border-white/10 pb-5">
            <p className="text-sm uppercase tracking-[0.32em] text-[#d9ba7c]">Anikitty CMS</p>
            <h1 className="mt-3 text-3xl">Admin Dashboard</h1>
            <p className="mt-3 text-sm leading-6 text-white/65">
              Refined CMS shell for style assets, model settings, and generation history.
            </p>
          </div>

          <nav className="mt-5 space-y-2">
            {dashboardTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  const nextParams = new URLSearchParams(searchParams.toString());
                  nextParams.set("tab", tab.id);
                  const nextRoute = `${DASHBOARD_ROUTE}?${nextParams.toString()}` as Route;
                  router.replace(nextRoute);
                }}
                className={cn(
                  "w-full rounded-2xl px-4 py-4 text-left transition",
                  activeTab === tab.id
                    ? "bg-white text-admin-ink"
                    : "bg-white/5 text-white/75 hover:bg-white/10 hover:text-white",
                )}
              >
                <p className="text-base font-semibold">{tab.label}</p>
                <p
                  className={cn(
                    "mt-1 text-sm leading-6",
                    activeTab === tab.id ? "text-admin-slate" : "text-white/55",
                  )}
                >
                  {tab.description}
                </p>
              </button>
            ))}
          </nav>

          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <p className="text-sm uppercase tracking-[0.22em] text-[#d9ba7c]">Security</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="gold">Session protected</Badge>
              <Badge tone="violet">Server-only secrets</Badge>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/65">{adminEmail}</p>
            <div className="mt-4">
              <AdminLogoutButton />
            </div>
          </div>
        </aside>

        <section className="rounded-[2rem] border border-black/5 bg-[#fcfaf6] p-5 shadow-panel sm:p-7">
          {activeContent}
        </section>
      </div>
    </main>
  );
}
