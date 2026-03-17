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

export function RevealStep({
  catName,
  style,
  resultImageUrl,
  onPrevious,
  onRestart,
}: RevealStepProps) {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-center gap-8 py-8 text-center">
      <div className="space-y-4">
        <Badge tone="gold">Final Reveal</Badge>
        <div className="space-y-3">
          <h2 className="text-4xl text-white sm:text-5xl">Behold {catName}&apos;s hidden legend</h2>
          <p className="mx-auto max-w-2xl text-base leading-7 text-fantasy-mist/70 sm:text-lg">
            A luminous fantasy portrait, reimagined through the spirit of {style?.name ?? "your chosen destiny"}.
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
