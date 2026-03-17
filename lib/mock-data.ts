import type {
  AdminDashboardTabConfig,
  AppSettings,
  FantasyStyle,
  PortraitJobRecord,
} from "@/types/domain";

export const loadingPhrases = [
  "Distilling moonlit potions...",
  "Gathering dragon bones...",
  "Polishing ancient runes...",
  "Summoning hidden flames...",
  "Reading the star charts...",
  "Weaving fate threads...",
  "Awakening arcane sparks...",
  "Decoding whisker destiny...",
  "Brewing heroic essence...",
  "Forging enchanted armor...",
  "Tracing celestial marks...",
  "Infusing mythical power...",
  "Calling the ancient winds...",
  "Unsealing secret lineage...",
  "Aligning the astral paths...",
  "Charging the crystal core...",
  "Mapping the soul sigils...",
  "Gathering phoenix ash...",
  "Tuning the magic circle...",
  "Revealing noble bloodlines...",
] as const;

export const publicFlowSteps = [
  { id: "start", label: "Start" },
  { id: "style", label: "Style" },
  { id: "upload", label: "Upload" },
  { id: "processing", label: "Processing" },
  { id: "reveal", label: "Reveal" },
] as const;

export const styles: FantasyStyle[] = [
  {
    id: "style_feline_samurai",
    slug: "feline-samurai",
    name: "Feline Samurai",
    description: "Blade-ready regalia, disciplined posture, and moonlit armor detailing.",
    imageUrl: "/placeholders/feline-samurai.svg",
    updatedAt: "2026-03-10T10:10:00.000Z",
    status: "active",
  },
  {
    id: "style_royal_aristocat",
    slug: "royal-aristocat",
    name: "Royal Aristocat",
    description: "Grand court portraiture with velvet tailoring, gold filigree, and noble poise.",
    imageUrl: "/placeholders/royal-aristocat.svg",
    updatedAt: "2026-03-09T08:30:00.000Z",
    status: "active",
  },
  {
    id: "style_arcane_spellcaster",
    slug: "arcane-spellcaster",
    name: "Arcane Spellcaster",
    description: "Mystic sigils, enchanted fabrics, and elegant spellbound intensity.",
    imageUrl: "/placeholders/arcane-spellcaster.svg",
    updatedAt: "2026-03-11T12:15:00.000Z",
    status: "active",
  },
  {
    id: "style_forest_guardian",
    slug: "forest-guardian",
    name: "Forest Guardian",
    description: "Ancient woodland motifs, druidic ornament, and protective natural power.",
    imageUrl: "/placeholders/forest-guardian.svg",
    updatedAt: "2026-03-12T05:45:00.000Z",
    status: "active",
  },
  {
    id: "style_sky_pirate_captain",
    slug: "sky-pirate-captain",
    name: "Sky Pirate Captain",
    description: "Cloud-swept swagger, tailored coats, brass trims, and airborne adventure.",
    imageUrl: "/placeholders/sky-pirate-captain.svg",
    updatedAt: "2026-03-08T14:20:00.000Z",
    status: "active",
  },
  {
    id: "style_celestial_oracle",
    slug: "flame-mage",
    name: "Flame Mage",
    description: "Inferno-woven robes, ember sigils, and controlled pyromancy with regal intensity.",
    imageUrl: "/placeholders/flame-mage.svg",
    updatedAt: "2026-03-14T09:00:00.000Z",
    status: "active",
  },
  {
    id: "style_dragon_rider",
    slug: "dragon-rider",
    name: "Dragon Rider",
    description: "Heroic battle leathers, embers, and windswept high-fantasy momentum.",
    imageUrl: "/placeholders/dragon-rider.svg",
    updatedAt: "2026-03-13T18:05:00.000Z",
    status: "active",
  },
  {
    id: "style_shadow_assassin",
    slug: "shadow-assassin",
    name: "Shadow Assassin",
    description: "Stealthy silhouettes, midnight fabrics, and razor-focused elegance.",
    imageUrl: "/placeholders/shadow-assassin.svg",
    updatedAt: "2026-03-07T03:55:00.000Z",
    status: "active",
  },
];

export const dashboardTabs: AdminDashboardTabConfig[] = [
  {
    id: "style-library",
    label: "Style Library",
    description: "Upload, replace, and review the eight style assets.",
  },
  {
    id: "gemini-settings",
    label: "Gemini Settings",
    description: "Manage the prompt template and server-only key state.",
  },
  {
    id: "generation-records",
    label: "Generation Records",
    description: "Review mock history, statuses, and retained outputs.",
  },
];

export const geminiPromptTemplate = `Merge the first image (real cat photo) with the second image (anthropomorphic fantasy cat portrait style reference).

Goal:
Create a fantasy anthropomorphic cat portrait that clearly preserves the real cat's identity.

Requirements:
- Preserve the real cat's unique facial features, fur pattern, face shape, eye shape, nose, and overall recognizable appearance.
- The final character must still look unmistakably like the same cat from the real photo.
- Strictly follow the aesthetic style, costume language, mood, composition, and rendering quality of the reference portrait.
- Keep the output elegant, cohesive, and premium.
- Do not copy the reference face literally; transfer only its artistic style and character design language.
- Output a polished vertical portrait in 2:3 aspect ratio.`;

export const appSettings: AppSettings = {
  gemini: {
    modelName: "gemini-2.5-flash-image",
    availableModels: ["gemini-2.5-flash-image", "gemini-3.1-flash-image-preview"],
    promptTemplate: geminiPromptTemplate,
    apiKeyConfigured: true,
    lastRotatedAt: "2026-03-01T06:30:00.000Z",
  },
  accessGate: {
    passCodeConfigured: true,
    updatedAt: "2026-03-01T06:30:00.000Z",
  },
};

export const generationRecords: PortraitJobRecord[] = [
  {
    id: "job_01HZX8C5X7FQ1Q2A3A",
    catName: "Mochi",
    styleId: "style_celestial_oracle",
    styleName: "Flame Mage",
    status: "done",
    createdAt: "2026-03-14T10:20:00.000Z",
    previewImageUrl: "/placeholders/result-portrait.svg",
  },
  {
    id: "job_01HZX8CB4S1YMK7D5B",
    catName: "Nimbus",
    styleId: "style_dragon_rider",
    styleName: "Dragon Rider",
    status: "processing",
    createdAt: "2026-03-15T04:55:00.000Z",
    previewImageUrl: "/placeholders/result-portrait.svg",
  },
  {
    id: "job_01HZX8CG9R6P4H8L1C",
    catName: "Poppy",
    styleId: "style_feline_samurai",
    styleName: "Feline Samurai",
    status: "queued",
    createdAt: "2026-03-15T09:10:00.000Z",
    previewImageUrl: "/placeholders/result-portrait.svg",
  },
  {
    id: "job_01HZX8CM5D2WQ6S9VD",
    catName: "Rune",
    styleId: "style_shadow_assassin",
    styleName: "Shadow Assassin",
    status: "failed",
    createdAt: "2026-03-12T13:50:00.000Z",
    previewImageUrl: "/placeholders/result-portrait.svg",
  },
];

export function getStyleById(styleId: string) {
  return styles.find((style) => style.id === styleId);
}

export function createMockPortraitDataUri(catName: string, styleName: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1200">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1b0d34" />
          <stop offset="45%" stop-color="#5d35a0" />
          <stop offset="100%" stop-color="#d6b25e" />
        </linearGradient>
        <linearGradient id="halo" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#f8d79c" stop-opacity="0.15" />
          <stop offset="50%" stop-color="#f4c8ff" stop-opacity="0.95" />
          <stop offset="100%" stop-color="#f8d79c" stop-opacity="0.15" />
        </linearGradient>
      </defs>
      <rect width="800" height="1200" rx="48" fill="url(#bg)" />
      <circle cx="400" cy="350" r="220" fill="url(#halo)" opacity="0.45" />
      <path d="M215 330C248 178 349 112 400 112C451 112 552 178 585 330C611 450 573 609 505 710C462 775 433 830 433 952H367C367 830 338 775 295 710C227 609 189 450 215 330Z" fill="#261045" opacity="0.75" />
      <path d="M280 276L330 180L365 296Z" fill="#f4c8ff" opacity="0.58" />
      <path d="M520 276L470 180L435 296Z" fill="#f4c8ff" opacity="0.58" />
      <ellipse cx="400" cy="430" rx="170" ry="190" fill="#f3dfc1" />
      <ellipse cx="334" cy="420" rx="24" ry="34" fill="#1a1030" />
      <ellipse cx="466" cy="420" rx="24" ry="34" fill="#1a1030" />
      <ellipse cx="334" cy="410" rx="8" ry="10" fill="#fff7ed" />
      <ellipse cx="466" cy="410" rx="8" ry="10" fill="#fff7ed" />
      <path d="M400 470L378 502H422Z" fill="#9d5f6e" />
      <path d="M350 538C374 564 426 564 450 538" stroke="#8a445d" stroke-width="16" stroke-linecap="round" fill="none" />
      <path d="M200 980C274 856 324 806 400 806C476 806 526 856 600 980V1160H200Z" fill="#12081f" />
      <path d="M260 960C330 870 470 870 540 960" stroke="#d6b25e" stroke-width="16" fill="none" opacity="0.75" />
      <rect x="96" y="72" width="608" height="1056" rx="36" fill="none" stroke="#f6d287" stroke-width="10" opacity="0.65" />
      <text x="400" y="96" fill="#f9e7b6" font-family="Palatino Linotype, Georgia, serif" font-size="30" text-anchor="middle" letter-spacing="8">ANIKITTY FURTASY</text>
      <text x="400" y="1040" fill="#ffffff" font-family="Palatino Linotype, Georgia, serif" font-size="46" text-anchor="middle">${escapeSvg(
        catName || "Mystic Cat",
      )}</text>
      <text x="400" y="1088" fill="#f8d79c" font-family="Segoe UI, Arial, sans-serif" font-size="24" text-anchor="middle" letter-spacing="4">${escapeSvg(
        styleName,
      )}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function escapeSvg(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
