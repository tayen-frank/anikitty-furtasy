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
  styles: FantasyStyle[];
};

type UpdateStylePatch = Partial<
  Pick<FantasyStyle, "imageUrl" | "updatedAt" | "status" | "description" | "name">
> & {
  objectKey?: string;
};

export async function getAllStyles() {
  const manifest = await readStyleManifest();
  return manifest?.styles?.length ? manifest.styles : seededStyles.map((style) => ({ ...style }));
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
  await writeJsonToR2<PersistedStyleManifest>({
    objectKey: STYLE_MANIFEST_OBJECT_KEY,
    value: {
      version: 1,
      updatedAt: new Date().toISOString(),
      styles,
    },
  });
}
