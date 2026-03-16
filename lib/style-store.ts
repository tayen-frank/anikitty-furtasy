import { styles as seededStyles } from "@/lib/mock-data";
import {
  STYLE_MANIFEST_OBJECT_KEY,
  doesR2ObjectExist,
  getR2Config,
  readJsonFromR2,
  writeJsonToR2,
} from "@/lib/r2";
import type { FantasyStyle } from "@/types/domain";

type PersistedStyleManifest = {
  version: 1;
  updatedAt: string;
  styles: unknown;
};

type UpdateStylePatch = Partial<
  Pick<FantasyStyle, "imageUrl" | "updatedAt" | "status" | "description" | "name">
> & {
  objectKey?: string;
};

export async function getAllStyles() {
  const manifest = await readStyleManifest();
  return normalizeStyles(manifest?.styles);
}

export async function getStyleById(styleId: string) {
  const styles = await getAllStyles();
  return styles.find((style) => style.id === styleId) ?? null;
}

export async function updateStyleAsset(styleId: string, patch: UpdateStylePatch) {
  const currentStyles = await getAllStyles();
  const current = currentStyles.find((style) => style.id === styleId);

  if (!current) {
    return null;
  }

  const { objectKey, ...stylePatch } = patch;

  if (objectKey) {
    if (!objectKey.startsWith("styles/")) {
      throw new Error("Style asset objectKey must be stored under the styles/ folder.");
    }

    const exists = await doesR2ObjectExist(objectKey);

    if (!exists) {
      throw new Error("The uploaded style asset could not be found in Cloudflare R2.");
    }
  }

  const updatedStyle: FantasyStyle = {
    ...current,
    ...stylePatch,
    updatedAt: stylePatch.updatedAt ?? new Date().toISOString(),
  };
  const nextStyles = currentStyles.map((style) => (style.id === styleId ? updatedStyle : style));

  await writeStyleManifest(nextStyles);
  return updatedStyle;
}

async function readStyleManifest() {
  if (!getR2Config().isConfigured) {
    return null;
  }

  return readJsonFromR2<PersistedStyleManifest>(STYLE_MANIFEST_OBJECT_KEY);
}

async function writeStyleManifest(styles: FantasyStyle[]) {
  await writeJsonToR2<{
    version: 1;
    updatedAt: string;
    styles: FantasyStyle[];
  }>({
    objectKey: STYLE_MANIFEST_OBJECT_KEY,
    value: {
      version: 1,
      updatedAt: new Date().toISOString(),
      styles,
    },
  });
}

function normalizeStyles(input: unknown): FantasyStyle[] {
  if (!Array.isArray(input)) {
    return seededStyles.map((style) => ({ ...style }));
  }

  const persistedById = new Map<string, Partial<FantasyStyle>>();

  for (const item of input) {
    if (!isRecord(item)) {
      continue;
    }

    const id = typeof item.id === "string" ? item.id : "";

    if (!id) {
      continue;
    }

    persistedById.set(id, {
      id,
      slug: typeof item.slug === "string" ? item.slug : undefined,
      name: typeof item.name === "string" ? item.name : undefined,
      description: typeof item.description === "string" ? item.description : undefined,
      imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : undefined,
      updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : undefined,
      status: item.status === "draft" ? "draft" : item.status === "active" ? "active" : undefined,
    });
  }

  return seededStyles.map((seededStyle) => {
    const persisted = persistedById.get(seededStyle.id);

    if (!persisted) {
      return { ...seededStyle };
    }

    return {
      ...seededStyle,
      ...persisted,
      id: seededStyle.id,
      slug: persisted.slug || seededStyle.slug,
      name: persisted.name || seededStyle.name,
      description: persisted.description || seededStyle.description,
      imageUrl: persisted.imageUrl || seededStyle.imageUrl,
      updatedAt: persisted.updatedAt || seededStyle.updatedAt,
      status: persisted.status || seededStyle.status,
    };
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
