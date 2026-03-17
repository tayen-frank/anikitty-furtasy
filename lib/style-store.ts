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

const LEGACY_STYLE_DEFAULTS: Record<
  string,
  {
    slug: string;
    name: string;
    description: string;
    imageUrl: string;
  }
> = {
  style_feline_samurai: {
    slug: "feline-samurai",
    name: "Feline Samurai",
    description: "Blade-ready regalia, disciplined posture, and moonlit armor detailing.",
    imageUrl: "/placeholders/feline-samurai.svg",
  },
  style_royal_aristocat: {
    slug: "royal-aristocat",
    name: "Royal Aristocat",
    description: "Grand court portraiture with velvet tailoring, gold filigree, and noble poise.",
    imageUrl: "/placeholders/royal-aristocat.svg",
  },
  style_arcane_spellcaster: {
    slug: "arcane-spellcaster",
    name: "Arcane Spellcaster",
    description: "Mystic sigils, enchanted fabrics, and elegant spellbound intensity.",
    imageUrl: "/placeholders/arcane-spellcaster.svg",
  },
  style_forest_guardian: {
    slug: "forest-guardian",
    name: "Forest Guardian",
    description: "Ancient woodland motifs, druidic ornament, and protective natural power.",
    imageUrl: "/placeholders/forest-guardian.svg",
  },
  style_sky_pirate_captain: {
    slug: "sky-pirate-captain",
    name: "Sky Pirate Captain",
    description: "Cloud-swept swagger, tailored coats, brass trims, and airborne adventure.",
    imageUrl: "/placeholders/sky-pirate-captain.svg",
  },
  style_celestial_oracle: {
    slug: "celestial-oracle",
    name: "Celestial Oracle",
    description: "Starwoven robes, luminous accents, and a serene cosmic presence.",
    imageUrl: "/placeholders/celestial-oracle.svg",
  },
  style_dragon_rider: {
    slug: "dragon-rider",
    name: "Dragon Rider",
    description: "Heroic battle leathers, embers, and windswept high-fantasy momentum.",
    imageUrl: "/placeholders/dragon-rider.svg",
  },
  style_shadow_assassin: {
    slug: "shadow-assassin",
    name: "Shadow Assassin",
    description: "Stealthy silhouettes, midnight fabrics, and razor-focused elegance.",
    imageUrl: "/placeholders/shadow-assassin.svg",
  },
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

    persistedById.set(
      id,
      normalizeLegacyStyleFields(id, {
        id,
        slug: typeof item.slug === "string" ? item.slug : undefined,
        name: typeof item.name === "string" ? item.name : undefined,
        description: typeof item.description === "string" ? item.description : undefined,
        imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : undefined,
        updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : undefined,
        status:
          item.status === "draft" ? "draft" : item.status === "active" ? "active" : undefined,
      }),
    );
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

function normalizeLegacyStyleFields(styleId: string, persisted: Partial<FantasyStyle>) {
  const legacyDefaults = LEGACY_STYLE_DEFAULTS[styleId];
  const seededStyle = seededStyles.find((style) => style.id === styleId);

  if (!legacyDefaults || !seededStyle) {
    return persisted;
  }

  return {
    ...persisted,
    slug:
      !persisted.slug || persisted.slug === legacyDefaults.slug
        ? seededStyle.slug
        : persisted.slug,
    name:
      !persisted.name || persisted.name === legacyDefaults.name
        ? seededStyle.name
        : persisted.name,
    description:
      !persisted.description || persisted.description === legacyDefaults.description
        ? seededStyle.description
        : persisted.description,
    imageUrl:
      !persisted.imageUrl || persisted.imageUrl === legacyDefaults.imageUrl
        ? seededStyle.imageUrl
        : persisted.imageUrl,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
