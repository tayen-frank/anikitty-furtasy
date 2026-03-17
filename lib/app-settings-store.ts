import { createHash } from "node:crypto";
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
  accessGate: {
    passCodeHash: string | null;
    updatedAt: string | null;
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
    accessGate: {
      passCodeHash: current?.accessGate?.passCodeHash ?? null,
      updatedAt: current?.accessGate?.updatedAt ?? null,
    },
  };

  await writeAppSettings(nextSettings);
  return nextSettings;
}

export async function saveAccessGateSettings(input: { passCode: string }) {
  const current = await getPersistedAppSettings();
  const trimmedPassCode = input.passCode.trim();

  if (!trimmedPassCode) {
    throw new Error("Pass code is required.");
  }

  const nextSettings: PersistedAppSettings = {
    version: 1,
    updatedAt: new Date().toISOString(),
    gemini: {
      modelName: current?.gemini?.modelName ?? "",
      promptTemplate: current?.gemini?.promptTemplate ?? geminiPromptTemplate,
      lastRotatedAt: current?.gemini?.lastRotatedAt ?? null,
    },
    accessGate: {
      passCodeHash: hashPassCode(trimmedPassCode),
      updatedAt: new Date().toISOString(),
    },
  };

  await writeAppSettings(nextSettings);
  return nextSettings;
}

export async function verifyAccessPassCode(passCode: string) {
  const settings = await getPersistedAppSettings();
  const savedHash = settings?.accessGate?.passCodeHash ?? null;

  if (!savedHash) {
    return {
      isConfigured: false,
      isValid: false,
    };
  }

  return {
    isConfigured: true,
    isValid: hashPassCode(passCode.trim()) === savedHash,
  };
}

export function getDefaultGeminiPromptTemplate() {
  return geminiPromptTemplate;
}

function hashPassCode(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

async function writeAppSettings(settings: PersistedAppSettings) {
  await writeJsonToR2({
    objectKey: APP_SETTINGS_OBJECT_KEY,
    value: settings,
    cacheControl: "no-store",
  });
}
