import { Button } from "@/components/ui/button";
import type { PortraitJobStatus } from "@/types/domain";
import { cn } from "@/lib/utils";

type ProcessingStepProps = {
  catName: string;
  styleName: string;
  progress: number;
  loadingPhraseIndex: number;
  phrases: string[];
  status: PortraitJobStatus;
  onPrevious: () => void;
  onNext: () => void;
};

export function ProcessingStep({
  catName,
  styleName,
  progress,
  loadingPhraseIndex,
  phrases,
  status,
  onPrevious,
  onNext,
}: ProcessingStepProps) {
  return (
    <section className="mx-auto max-w-4xl space-y-8 py-8 text-center">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.34em] text-fantasy-gold/80">Portrait Ritual</p>
        <h2 className="text-4xl text-white sm:text-5xl">
          Forging {catName || "your cat"} into {styleName}
        </h2>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
        <div className="h-4 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-fantasy-plum via-fantasy-gold to-fantasy-rose transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-fantasy-mist/60">
          <span>Status: {status}</span>
          <span>{progress}%</span>
        </div>

        <div className="mt-8 space-y-4 text-left">
          {phrases.map((phrase, index) => {
            const isVisible = index < loadingPhraseIndex;
            const isCurrent = index === loadingPhraseIndex - 1;

            return (
              <p
                key={phrase}
                className={cn(
                  "text-lg transition duration-500",
                  !isVisible && "opacity-20",
                  isVisible && !isCurrent && "opacity-45",
                  isCurrent && "animate-shimmer font-semibold text-fantasy-rose",
                )}
              >
                {phrase}
              </p>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button variant="ghost" onClick={onPrevious}>
          Previous Step
        </Button>
        <Button onClick={onNext} disabled={status !== "done"}>
          Reveal Portrait
        </Button>
      </div>
    </section>
  );
}
