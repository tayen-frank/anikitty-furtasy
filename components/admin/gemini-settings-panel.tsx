"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AppSettings } from "@/types/domain";
import { formatDateTime } from "@/lib/utils";

type GeminiModelsResponse = {
  models?: string[];
  discoveredAt?: string;
  error?: string;
};

export function GeminiSettingsPanel({ settings }: { settings: AppSettings }) {
  const [availableModels, setAvailableModels] = useState(settings.gemini.availableModels);
  const [modelName, setModelName] = useState(settings.gemini.modelName);
  const [promptTemplate, setPromptTemplate] = useState(settings.gemini.promptTemplate);
  const [passCode, setPassCode] = useState("");
  const [isPassCodeConfigured, setIsPassCodeConfigured] = useState(
    settings.accessGate.passCodeConfigured,
  );
  const [passCodeUpdatedAt, setPassCodeUpdatedAt] = useState(settings.accessGate.updatedAt);
  const [statusMessage, setStatusMessage] = useState(
    settings.gemini.apiKeyConfigured
      ? "Server runtime detected a configured Gemini key. Prompt, model, and access gate settings can now be saved from this panel."
      : "Gemini is not configured yet. Add GEMINI_API_KEY in Vercel before enabling live generation.",
  );
  const [isReplaceKeyPanelOpen, setIsReplaceKeyPanelOpen] = useState(false);
  const [isSavingGeminiSettings, setIsSavingGeminiSettings] = useState(false);
  const [isSavingPassCode, setIsSavingPassCode] = useState(false);
  const [isRefreshingModels, setIsRefreshingModels] = useState(false);

  useEffect(() => {
    setAvailableModels(settings.gemini.availableModels);
    setModelName(settings.gemini.modelName);
    setPromptTemplate(settings.gemini.promptTemplate);
  }, [
    settings.gemini.availableModels,
    settings.gemini.modelName,
    settings.gemini.promptTemplate,
  ]);

  useEffect(() => {
    setIsPassCodeConfigured(settings.accessGate.passCodeConfigured);
    setPassCodeUpdatedAt(settings.accessGate.updatedAt);
  }, [settings.accessGate.passCodeConfigured, settings.accessGate.updatedAt]);

  useEffect(() => {
    if (!settings.gemini.apiKeyConfigured) {
      return;
    }

    void refreshModels(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.gemini.apiKeyConfigured]);

  async function refreshModels(isSilent = false) {
    setIsRefreshingModels(true);

    try {
      const response = await fetch("/api/admin/gemini-models", {
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => null)) as GeminiModelsResponse | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to load Gemini models.");
      }

      const nextModels = payload?.models?.length ? payload.models : settings.gemini.availableModels;
      setAvailableModels(nextModels);

      if (!nextModels.includes(modelName)) {
        setModelName(nextModels[0] ?? settings.gemini.modelName);
      }

      if (!isSilent) {
        setStatusMessage(
          `Loaded ${nextModels.length} available Gemini model${
            nextModels.length === 1 ? "" : "s"
          } from Google.`,
        );
      }
    } catch (error) {
      if (!isSilent) {
        setStatusMessage(
          error instanceof Error ? error.message : "Unable to load Gemini models.",
        );
      }
    } finally {
      setIsRefreshingModels(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.26em] text-admin-brass">Gemini Settings</p>
        <h2 className="mt-2 text-3xl text-admin-ink">Server-side generation configuration</h2>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4 rounded-[1.75rem] border border-black/5 bg-white p-6 shadow-panel">
          <div>
            <label className="text-sm font-semibold uppercase tracking-[0.18em] text-admin-slate">
              Model Name
            </label>
            <select
              value={modelName}
              onChange={(event) => setModelName(event.target.value)}
              className="mt-3 w-full rounded-[1.25rem] border border-slate-200 bg-admin-cloud px-4 py-3 text-base text-admin-ink outline-none focus:border-admin-brass"
            >
              {availableModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
            <div className="mt-3 flex flex-wrap gap-3">
              <Button
                variant="admin"
                type="button"
                disabled={!settings.gemini.apiKeyConfigured || isRefreshingModels}
                onClick={() => {
                  void refreshModels();
                }}
              >
                {isRefreshingModels ? "Refreshing..." : "Refresh Models"}
              </Button>
            </div>
            <p className="mt-3 text-sm leading-6 text-admin-slate">
              The list is fetched server-side from Google using your configured `GEMINI_API_KEY`.
            </p>
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
              onClick={() => {
                setIsReplaceKeyPanelOpen((current) => !current);
                setStatusMessage(
                  "Open the Replace Key panel below to rotate GEMINI_API_KEY securely in Vercel.",
                );
              }}
            >
              {isReplaceKeyPanelOpen ? "Hide Key Steps" : "Replace Key"}
            </Button>
            <Button
              variant="admin"
              onClick={() =>
                setStatusMessage(
                  settings.gemini.apiKeyConfigured
                    ? "Server sees a Gemini key. Use Refresh Models to pull the latest list from Google."
                    : "No Gemini key is configured yet, so a live connection test cannot run.",
                )
              }
            >
              Test Connection
            </Button>
          </div>

          {isReplaceKeyPanelOpen && (
            <div className="rounded-[1.5rem] border border-admin-brass/25 bg-admin-cloud px-4 py-4 text-sm leading-6 text-admin-ink">
              <p className="font-semibold uppercase tracking-[0.14em] text-admin-brass">
                Replace Gemini Key
              </p>
              <p className="mt-3">
                This admin panel does not write secrets from the browser. Rotate the key in Vercel so
                it stays server-side only.
              </p>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-admin-slate">
                <li>Open your Vercel project settings.</li>
                <li>Go to `Environment Variables`.</li>
                <li>Update the value of `GEMINI_API_KEY`.</li>
                <li>Redeploy the latest production build.</li>
                <li>Refresh this dashboard and click `Refresh Models`.</li>
              </ol>
              <p className="mt-3 rounded-2xl border border-black/5 bg-white px-3 py-3 text-admin-slate">
                TODO: replace this guide with a protected server-side key rotation flow backed by
                encrypted storage and audit logs.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-[1.75rem] border border-black/5 bg-white p-6 shadow-panel">
          <div>
            <label className="text-sm font-semibold uppercase tracking-[0.18em] text-admin-slate">
              Prompt Template
            </label>
            <textarea
              value={promptTemplate}
              onChange={(event) => setPromptTemplate(event.target.value)}
              rows={12}
              className="mt-3 w-full rounded-[1.5rem] border border-slate-200 bg-admin-cloud px-4 py-4 text-sm leading-7 text-admin-ink outline-none focus:border-admin-brass"
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="admin"
              disabled={isSavingGeminiSettings}
              onClick={async () => {
                setIsSavingGeminiSettings(true);

                try {
                  const response = await fetch("/api/admin/gemini-settings", {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      modelName,
                      promptTemplate,
                    }),
                  });
                  const payload = (await response.json().catch(() => null)) as
                    | { error?: string; modelName?: string; availableModels?: string[] }
                    | null;

                  if (!response.ok) {
                    throw new Error(payload?.error ?? "Unable to save Gemini settings.");
                  }

                  if (payload?.availableModels?.length) {
                    setAvailableModels(payload.availableModels);
                  }

                  setStatusMessage(
                    `Saved Gemini settings. Active model is now ${payload?.modelName ?? modelName}.`,
                  );
                } catch (error) {
                  setStatusMessage(
                    error instanceof Error ? error.message : "Unable to save Gemini settings.",
                  );
                } finally {
                  setIsSavingGeminiSettings(false);
                }
              }}
            >
              {isSavingGeminiSettings ? "Saving..." : "Save Gemini Settings"}
            </Button>
          </div>

          <div className="rounded-[1.5rem] border border-black/5 bg-admin-cloud px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-admin-slate">
                  Public Access Gate
                </p>
                <p className="mt-2 text-sm leading-6 text-admin-slate">
                  Require customers to enter the correct pass code before they can continue the public
                  flow.
                </p>
              </div>
              <Badge tone={isPassCodeConfigured ? "success" : "danger"}>
                {isPassCodeConfigured ? "Configured" : "Not configured"}
              </Badge>
            </div>
            <div className="mt-4">
              <label className="text-sm font-semibold uppercase tracking-[0.18em] text-admin-slate">
                Pass Code
              </label>
              <input
                type="password"
                value={passCode}
                onChange={(event) => setPassCode(event.target.value)}
                placeholder={
                  isPassCodeConfigured
                    ? "Enter a new pass code to replace the current one"
                    : "Enter a pass code for the public gate"
                }
                className="mt-3 w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 text-base text-admin-ink outline-none focus:border-admin-brass"
              />
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-admin-slate">
                Last updated:{" "}
                {passCodeUpdatedAt
                  ? formatDateTime(passCodeUpdatedAt)
                  : "No pass code saved yet"}
              </p>
              <Button
                variant="admin"
                disabled={isSavingPassCode}
                onClick={async () => {
                  setIsSavingPassCode(true);

                  try {
                    const response = await fetch("/api/admin/access-gate", {
                      method: "PATCH",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        passCode,
                      }),
                    });
                    const payload = (await response.json().catch(() => null)) as
                      | { error?: string; passCodeConfigured?: boolean; updatedAt?: string | null }
                      | null;

                    if (!response.ok) {
                      throw new Error(payload?.error ?? "Unable to save pass code.");
                    }

                    setPassCode("");
                    setIsPassCodeConfigured(Boolean(payload?.passCodeConfigured));
                    setPassCodeUpdatedAt(payload?.updatedAt ?? null);
                    setStatusMessage(
                      "Saved the public access pass code. Customers must now pass server-side verification before entering.",
                    );
                  } catch (error) {
                    setStatusMessage(
                      error instanceof Error ? error.message : "Unable to save pass code.",
                    );
                  } finally {
                    setIsSavingPassCode(false);
                  }
                }}
              >
                {isSavingPassCode ? "Saving..." : "Save Pass Code"}
              </Button>
            </div>
          </div>

          <p className="rounded-[1.25rem] bg-white px-4 py-3 text-sm text-admin-slate">
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
