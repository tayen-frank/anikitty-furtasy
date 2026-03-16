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
  errorMessage?: string;
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
  errorMessage,
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
            className={cn(
              "h-full rounded-full transition-all duration-700",
              status === "failed"
                ? "bg-gradient-to-r from-rose-700 via-rose-500 to-orange-300"
                : "bg-gradient-to-r from-fantasy-plum via-fantasy-gold to-fantasy-rose",
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-fantasy-mist/60">
          <span>Status: {status}</span>
          <span>{progress}%</span>
        </div>

        {status === "failed" && errorMessage && (
          <div className="mt-6 rounded-[1.5rem] border border-rose-400/25 bg-rose-500/10 px-4 py-4 text-left text-sm leading-6 text-rose-100">
            {errorMessage}
          </div>
        )}

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
                  isCurrent && status !== "failed" && "animate-shimmer font-semibold text-fantasy-rose",
                  isCurrent && status === "failed" && "font-semibold text-rose-200",
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
