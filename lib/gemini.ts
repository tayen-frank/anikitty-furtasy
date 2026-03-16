import { getDefaultGeminiPromptTemplate, getPersistedAppSettings } from "@/lib/app-settings-store";

type GeneratePortraitInput = {
  catName: string;
  styleName: string;
  catImageUrl: string;
  styleReferenceUrl: string;
  promptTemplate?: string;
};

type GeneratedPortraitImage = {
  mimeType: string;
  base64Data: string;
};

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        inline_data?: {
          mime_type?: string;
          data?: string;
        };
        inlineData?: {
          mimeType?: string;
          data?: string;
        };
      }>;
    };
    finishReason?: string;
  }>;
  promptFeedback?: {
    blockReason?: string;
  };
  error?: {
    message?: string;
  };
};

export const DEFAULT_GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image";
export const CURATED_GEMINI_IMAGE_MODELS = [
  DEFAULT_GEMINI_IMAGE_MODEL,
  "gemini-3.1-flash-image-preview",
] as const;

export async function getGeminiRuntimeSettings() {
  const apiKey = process.env.GEMINI_API_KEY?.trim() ?? "";
  const persistedSettings = await getPersistedAppSettings();
  const envModelName = process.env.GEMINI_MODEL?.trim() ?? "";
  const persistedModelName = persistedSettings?.gemini?.modelName?.trim() ?? "";
  const persistedPromptTemplate = persistedSettings?.gemini?.promptTemplate?.trim() ?? "";
  const envPromptTemplate = process.env.GEMINI_PROMPT_TEMPLATE?.trim() ?? "";
  const modelName = persistedModelName || envModelName || DEFAULT_GEMINI_IMAGE_MODEL;
  const promptTemplate =
    persistedPromptTemplate || envPromptTemplate || getDefaultGeminiPromptTemplate();
  const availableModels = Array.from(
    new Set([modelName, ...CURATED_GEMINI_IMAGE_MODELS]),
  );

  return {
    apiKey,
    modelName,
    availableModels,
    promptTemplate,
    apiKeyConfigured: Boolean(apiKey),
    lastRotatedAt: persistedSettings?.gemini?.lastRotatedAt ?? null,
  };
}

export async function canUseGeminiImageGeneration() {
  return (await getGeminiRuntimeSettings()).apiKeyConfigured;
}

export async function generateFantasyCatPortrait({
  catName,
  styleName,
  catImageUrl,
  styleReferenceUrl,
  promptTemplate,
}: GeneratePortraitInput): Promise<GeneratedPortraitImage> {
  const settings = await getGeminiRuntimeSettings();

  if (!settings.apiKeyConfigured) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const [catImage, styleImage] = await Promise.all([
    fetchImageAsInlineData(catImageUrl),
    fetchImageAsInlineData(styleReferenceUrl),
  ]);
  const prompt = buildPortraitPrompt({
    catName,
    styleName,
    promptTemplate: promptTemplate ?? settings.promptTemplate,
  });
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${settings.modelName}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": settings.apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: catImage.mimeType,
                  data: catImage.base64Data,
                },
              },
              {
                inline_data: {
                  mime_type: styleImage.mimeType,
                  data: styleImage.base64Data,
                },
              },
            ],
          },
        ],
      }),
    },
  );
  const payload = (await response.json().catch(() => null)) as GeminiGenerateContentResponse | null;

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? "Gemini image generation request failed.");
  }

  const generatedImage = extractImageFromGeminiResponse(payload);

  if (!generatedImage) {
    throw new Error(
      payload?.promptFeedback?.blockReason
        ? `Gemini blocked the request: ${payload.promptFeedback.blockReason}`
        : "Gemini did not return an image output.",
    );
  }

  return generatedImage;
}

async function fetchImageAsInlineData(imageUrl: string) {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Unable to fetch image asset: ${imageUrl}`);
  }

  const mimeType =
    response.headers.get("content-type")?.split(";")[0].trim() || inferMimeTypeFromUrl(imageUrl);
  const arrayBuffer = await response.arrayBuffer();

  return {
    mimeType,
    base64Data: Buffer.from(arrayBuffer).toString("base64"),
  };
}

function buildPortraitPrompt({
  catName,
  styleName,
  promptTemplate,
}: {
  catName: string;
  styleName: string;
  promptTemplate: string;
}) {
  return `${promptTemplate}

Project context:
- Cat name: ${catName}
- Selected style: ${styleName}
- Use both provided images as mandatory inputs.
- The first image is the real cat photo.
- The second image is the fantasy style reference portrait.`;
}

function extractImageFromGeminiResponse(payload: GeminiGenerateContentResponse | null) {
  const parts =
    payload?.candidates?.flatMap((candidate) => candidate.content?.parts ?? []) ?? [];

  for (const part of parts) {
    if (part.inline_data?.data && part.inline_data.mime_type) {
      return {
        mimeType: part.inline_data.mime_type,
        base64Data: part.inline_data.data,
      };
    }

    if (part.inlineData?.data && part.inlineData.mimeType) {
      return {
        mimeType: part.inlineData.mimeType,
        base64Data: part.inlineData.data,
      };
    }
  }

  return null;
}

function inferMimeTypeFromUrl(imageUrl: string) {
  const normalizedUrl = imageUrl.toLowerCase();

  if (normalizedUrl.endsWith(".png")) {
    return "image/png";
  }

  if (normalizedUrl.endsWith(".webp")) {
    return "image/webp";
  }

  if (normalizedUrl.endsWith(".heic") || normalizedUrl.endsWith(".heif")) {
    return "image/heic";
  }

  if (normalizedUrl.endsWith(".svg")) {
    return "image/svg+xml";
  }

  return "image/jpeg";
}
