import { geminiPromptTemplate } from "@/lib/mock-data";
import { getR2Config, readJsonFromR2, writeJsonToR2 } from "@/lib/r2";

export const APP_SETTINGS_OBJECT_KEY = "settings/app-settings.json";

type PersistedAppSettings = {
  version: 1;
  updatedAt: string;
  gemini: {
    modelName: string;
    promptTemplate: string;
    lastRotatedAt: string | null;
  };
};

export async function getPersistedAppSettings() {
  if (!getR2Config().isConfigured) {
    return null;
  }

  return readJsonFromR2<PersistedAppSettings>(APP_SETTINGS_OBJECT_KEY);
}

export async function saveGeminiAppSettings(input: {
  modelName: string;
  promptTemplate: string;
}) {
  const current = await getPersistedAppSettings();
  const nextSettings: PersistedAppSettings = {
    version: 1,
    updatedAt: new Date().toISOString(),
    gemini: {
      modelName: input.modelName.trim(),
      promptTemplate: input.promptTemplate.trim(),
      lastRotatedAt: current?.gemini?.lastRotatedAt ?? null,
    },
  };

  await writeJsonToR2({
    objectKey: APP_SETTINGS_OBJECT_KEY,
    value: nextSettings,
    cacheControl: "no-store",
  });

  return nextSettings;
}

export function getDefaultGeminiPromptTemplate() {
  return geminiPromptTemplate;
}
