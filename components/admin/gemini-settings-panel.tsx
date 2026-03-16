"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AppSettings } from "@/types/domain";
import { formatDateTime } from "@/lib/utils";

export function GeminiSettingsPanel({ settings }: { settings: AppSettings }) {
  const [promptTemplate, setPromptTemplate] = useState(settings.gemini.promptTemplate);
  const [statusMessage, setStatusMessage] = useState(
    "Server-only Gemini configuration is mocked for this scaffold.",
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.26em] text-admin-brass">Gemini Settings</p>
        <h2 className="mt-2 text-3xl text-admin-ink">Server-side generation configuration</h2>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4 rounded-[1.75rem] border border-black/5 bg-white p-6 shadow-panel">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-admin-slate">
              Model Name
            </p>
            <p className="mt-2 text-xl text-admin-ink">{settings.gemini.modelName}</p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-admin-slate">
              API Key Status
            </p>
            <div className="mt-2 flex items-center gap-3">
              <Badge tone={settings.gemini.apiKeyConfigured ? "success" : "danger"}>
                {settings.gemini.apiKeyConfigured ? "Configured" : "Not configured"}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-admin-slate">
              Last Rotated
            </p>
            <p className="mt-2 text-base text-admin-ink">
              {settings.gemini.lastRotatedAt
                ? formatDateTime(settings.gemini.lastRotatedAt)
                : "No rotation recorded"}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="admin"
              onClick={() =>
                setStatusMessage("Mock action: replace key should open a secure server-side flow.")
              }
            >
              Replace Key
            </Button>
            <Button
              variant="admin"
              onClick={() =>
                setStatusMessage("Mock connection test passed. Wire this to a protected backend ping.")
              }
            >
              Test Connection
            </Button>
          </div>
        </div>

        <div className="space-y-4 rounded-[1.75rem] border border-black/5 bg-white p-6 shadow-panel">
          <div>
            <label className="text-sm font-semibold uppercase tracking-[0.18em] text-admin-slate">
              Prompt Template
            </label>
            <textarea
              value={promptTemplate}
              onChange={(event) => setPromptTemplate(event.target.value)}
              rows={16}
              className="mt-3 w-full rounded-[1.5rem] border border-slate-200 bg-admin-cloud px-4 py-4 text-sm leading-7 text-admin-ink outline-none focus:border-admin-brass"
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="admin"
              onClick={() =>
                setStatusMessage("Mock save complete. Persist Gemini settings in a secure backend store.")
              }
            >
              Save Settings
            </Button>
          </div>
          <p className="rounded-[1.25rem] bg-admin-cloud px-4 py-3 text-sm text-admin-slate">
            {statusMessage}
          </p>
        </div>
      </div>

      <p className="text-sm leading-6 text-admin-slate">
        TODO: Keep the raw Gemini API key in server secrets only, validate editor input, and add audit
        logs for config changes.
      </p>
    </div>
  );
}
