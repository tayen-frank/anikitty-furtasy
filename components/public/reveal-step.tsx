import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import type { FantasyStyle } from "@/types/domain";

type RevealStepProps = {
  catName: string;
  style?: FantasyStyle;
  resultImageUrl: string;
  onPrevious: () => void;
  onRestart: () => void;
};

const revealSubheadlineTemplates: Record<string, string> = {
  "Arcane Spellcaster":
    "{petName} emerges as the Arcane Spellcaster, channeling ancient magic with wisdom, precision, and quiet power.",
  "Flame Mage":
    "{petName} emerges as the Flame Mage, blazing with fierce elegance and an unstoppable will.",
  "Dragon Rider":
    "{petName} emerges as the Dragon Rider, bound for legend beside a loyal dragon companion.",
  "Feline Samurai":
    "{petName} emerges as the Feline Samurai, guided by calm honor, discipline, and razor-sharp skill.",
  "Forest Guardian":
    "{petName} emerges as the Forest Guardian, radiant with gentle strength and natural magic.",
  "Royal Aristocat":
    "{petName} emerges as the Royal Aristocat, crowned with grace, intelligence, and noble authority.",
  "Shadow Assassin":
    "{petName} emerges as the Shadow Assassin, slipping through darkness with silent, deadly precision.",
  "Sky Pirate Captain":
    "{petName} emerges as the Sky Pirate Captain, chasing freedom across the skies with fearless charm.",
};

export function RevealStep({
  catName,
  style,
  resultImageUrl,
  onPrevious,
  onRestart,
}: RevealStepProps) {
  const petName = catName || "Your Cat";
  const headline = `Behold ${petName}'s fantasy alter ego`;
  const subheadline = getRevealSubheadline(style?.name, petName);

  return (
    <section className="mx-auto flex max-w-6xl flex-col items-center gap-8 py-8 text-center">
      <div className="space-y-4">
        <Badge tone="gold">Final Reveal</Badge>
        <div className="space-y-3">
          <h2 className="text-4xl text-white sm:text-5xl">{headline}</h2>
          <p className="mx-auto max-w-2xl text-base leading-7 text-fantasy-mist/70 sm:text-lg">
            {subheadline}
          </p>
        </div>
      </div>

      <div className="ornate-border rounded-[2rem] bg-white/[0.04] p-4 shadow-aurora sm:p-6">
        <img
          src={resultImageUrl}
          alt={`${catName} fantasy portrait`}
          className="aspect-[2/3] w-full max-w-md rounded-[1.5rem] object-cover"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="ghost" onClick={onPrevious}>
          Back
        </Button>
        <a
          href={resultImageUrl}
          download={`${catName || "anikitty"}-portrait.svg`}
          className={buttonStyles({ variant: "public" })}
        >
          Download Portrait
        </a>
        <Button variant="secondary" onClick={onRestart}>
          Create Another Legend
        </Button>
      </div>
    </section>
  );
}

function getRevealSubheadline(styleName: string | undefined, petName: string) {
  const template =
    (styleName ? revealSubheadlineTemplates[styleName] : undefined) ??
    "{petName} emerges in a fantasy form shaped by your chosen destiny.";

  return template.replaceAll("{petName}", petName);
}
