"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { loadingPhrases } from "@/lib/mock-data";
import type { PortraitJobStatus } from "@/types/domain";

const MIN_ROTATION_DELAY_MS = 1800;
const MAX_ROTATION_DELAY_MS = 2500;
const FADE_DURATION_MS = 420;

type ProcessingStepProps = {
  catName: string;
  styleName: string;
  progress: number;
  loadingPhraseIndex?: number;
  phrases?: readonly string[];
  status: PortraitJobStatus;
  errorMessage?: string;
  onPrevious: () => void;
  onNext: () => void;
};

export function ProcessingStep({
  catName,
  styleName,
  progress,
  loadingPhraseIndex: _loadingPhraseIndex,
  phrases: _phrases,
  status,
  errorMessage,
  onPrevious,
  onNext,
}: ProcessingStepProps) {
  const [activePhraseIndex, setActivePhraseIndex] = useState(() =>
    getRandomPhraseIndex(-1, loadingPhrases.length),
  );
  const [isPhraseVisible, setIsPhraseVisible] = useState(true);
  const isRotating = status === "queued" || status === "processing";

  useEffect(() => {
    if (!isRotating || loadingPhrases.length <= 1) {
      setIsPhraseVisible(true);
      return;
    }

    let fadeTimeoutId: number | null = null;
    let swapTimeoutId: number | null = null;
    let isCancelled = false;

    const scheduleNextPhrase = () => {
      const nextDelay = getRandomDelay();

      fadeTimeoutId = window.setTimeout(() => {
        if (isCancelled) {
          return;
        }

        setIsPhraseVisible(false);

        swapTimeoutId = window.setTimeout(() => {
          if (isCancelled) {
            return;
          }

          setActivePhraseIndex((previousIndex) =>
            getRandomPhraseIndex(previousIndex, loadingPhrases.length),
          );
          setIsPhraseVisible(true);
          scheduleNextPhrase();
        }, FADE_DURATION_MS);
      }, nextDelay);
    };

    setIsPhraseVisible(true);
    scheduleNextPhrase();

    return () => {
      isCancelled = true;

      if (fadeTimeoutId) {
        window.clearTimeout(fadeTimeoutId);
      }

      if (swapTimeoutId) {
        window.clearTimeout(swapTimeoutId);
      }
    };
  }, [isRotating]);

  const activePhrase = loadingPhrases[activePhraseIndex] ?? loadingPhrases[0] ?? "";

  return (
    <section className="mx-auto max-w-4xl space-y-8 py-8 text-center">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.34em] text-fantasy-gold/80">Transformation Ritual</p>
        <h2 className="text-4xl text-white sm:text-5xl">
          Revealing {catName || "your cat"} as {styleName}
        </h2>
        <p className="mx-auto max-w-2xl text-base leading-7 text-fantasy-mist/70">
          The portrait is being shaped with your chosen fantasy essence. Stay close. The final reveal is almost ready.
        </p>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-8">
        <div className="relative overflow-hidden rounded-full bg-white/10 p-[3px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(248,215,156,0.18),transparent_68%)]" />
          <div className="h-4 overflow-hidden rounded-full bg-[#120923]/80">
            <div
              className={cn(
                "relative h-full rounded-full transition-all duration-700 after:absolute after:inset-y-0 after:right-0 after:w-24 after:bg-gradient-to-r after:from-white/0 after:via-white/35 after:to-white/0 after:opacity-70",
                status === "failed"
                  ? "bg-gradient-to-r from-rose-700 via-rose-500 to-orange-300"
                  : "bg-gradient-to-r from-fantasy-plum via-fantasy-gold to-fantasy-rose shadow-[0_0_24px_rgba(244,200,255,0.35)]",
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-sm text-fantasy-mist/60">
          <span>{status === "failed" ? "Ritual status: interrupted" : "Ritual in progress"}</span>
          <span>{progress}%</span>
        </div>

        {status === "failed" && errorMessage && (
          <div className="mt-6 rounded-[1.5rem] border border-rose-400/25 bg-rose-500/10 px-4 py-4 text-left text-sm leading-6 text-rose-100">
            {errorMessage}
          </div>
        )}

        <div className="mt-8 flex flex-col items-center justify-center">
          <div className="mb-4 h-px w-28 bg-gradient-to-r from-transparent via-fantasy-gold/60 to-transparent" />
          <p className="text-xs uppercase tracking-[0.34em] text-fantasy-mist/45">
            Arcane Whisper
          </p>
          <div className="relative mt-4 min-h-[3.5rem] w-full max-w-2xl px-4">
            <p
              className={cn(
                "text-center text-lg font-medium leading-8 text-fantasy-mist drop-shadow-[0_0_18px_rgba(244,200,255,0.16)] transition-all duration-[420ms] ease-out sm:text-[1.35rem]",
                isPhraseVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-1 opacity-0",
                status === "failed" && "text-rose-100 drop-shadow-none",
              )}
            >
              {activePhrase}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button variant="ghost" onClick={onPrevious}>
          Back
        </Button>
        <Button onClick={onNext} disabled={status !== "done"}>
          Reveal Portrait
        </Button>
      </div>
    </section>
  );
}

function getRandomDelay() {
  return Math.floor(
    MIN_ROTATION_DELAY_MS + Math.random() * (MAX_ROTATION_DELAY_MS - MIN_ROTATION_DELAY_MS),
  );
}

function getRandomPhraseIndex(previousIndex: number, total: number) {
  if (total <= 1) {
    return 0;
  }

  let nextIndex = previousIndex;

  while (nextIndex === previousIndex) {
    nextIndex = Math.floor(Math.random() * total);
  }

  return nextIndex;
}
