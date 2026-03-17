"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type StartStepProps = {
  catName: string;
  passCode: string;
  isVerifying?: boolean;
  errorMessage?: string | null;
  onCatNameChange: (value: string) => void;
  onPassCodeChange: (value: string) => void;
  onNext: () => void;
};

export function StartStep({
  catName,
  passCode,
  isVerifying = false,
  errorMessage,
  onCatNameChange,
  onPassCodeChange,
  onNext,
}: StartStepProps) {
  const isValid = catName.trim().length > 0 && passCode.trim().length > 0;
  const [isPassCodeVisible, setIsPassCodeVisible] = useState(false);

  return (
    <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
      <div className="space-y-6">
        <p className="text-sm uppercase tracking-[0.36em] text-fantasy-gold/80">
          Mystical Portrait Forge
        </p>
        <div className="space-y-4">
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            Welcome to Anikitty Furtasy
          </h1>
          <p className="max-w-2xl text-lg text-fantasy-mist/80 sm:text-xl">
            Ready to reveal your cat&apos;s secret identity?
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-fantasy-mist/70">
          <span className="rounded-full border border-fantasy-gold/25 px-4 py-2">
            Premium fantasy portraits
          </span>
          <span className="rounded-full border border-fantasy-gold/25 px-4 py-2">
            Crafted to keep your cat recognizable
          </span>
        </div>
      </div>

      <div className="ornate-border rounded-[2rem] bg-white/6 p-6 shadow-aurora backdrop-blur xl:p-8">
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm uppercase tracking-[0.18em] text-fantasy-rose/80">
              Cat&apos;s Name
            </label>
            <input
              value={catName}
              onChange={(event) => onCatNameChange(event.target.value)}
              placeholder="Sir Whiskerlot"
              className="w-full rounded-2xl border border-white/10 bg-[#120923] px-4 py-3 text-base text-white outline-none transition placeholder:text-white/35 focus:border-fantasy-gold/60"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm uppercase tracking-[0.18em] text-fantasy-rose/80">
              Pass Code
            </label>
            <div className="relative">
              <input
                type={isPassCodeVisible ? "text" : "password"}
                value={passCode}
                onChange={(event) => onPassCodeChange(event.target.value)}
                placeholder="Enter your invitation code"
                className="w-full rounded-2xl border border-white/10 bg-[#120923] px-4 py-3 pr-14 text-base text-white outline-none transition placeholder:text-white/35 focus:border-fantasy-gold/60"
              />
              <button
                type="button"
                aria-label={isPassCodeVisible ? "Hide pass code" : "Show pass code"}
                aria-pressed={isPassCodeVisible}
                onClick={() => setIsPassCodeVisible((current) => !current)}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-fantasy-mist/60 transition hover:text-fantasy-gold focus:outline-none focus:text-fantasy-gold"
              >
                {isPassCodeVisible ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
          {errorMessage && (
            <div className="rounded-2xl border border-rose-300/30 bg-rose-300/10 px-4 py-3 text-sm leading-6 text-rose-100">
              {errorMessage}
            </div>
          )}
          <Button onClick={onNext} disabled={!isValid || isVerifying} fullWidth>
            {isVerifying ? "Verifying..." : "Start"}
          </Button>
          <p className="text-sm leading-7 text-fantasy-mist/60">
            Enter your cat&apos;s name and your pass code to begin the transformation ritual.
          </p>
        </div>
      </div>
    </section>
  );
}

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 5.7A10 10 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a18.8 18.8 0 0 1-3 3.9" />
      <path d="M6.6 6.6A18.8 18.8 0 0 0 2.5 12S6 18.5 12 18.5a9.8 9.8 0 0 0 5.4-1.6" />
      <path d="M9.9 9.9A3.2 3.2 0 0 0 12 15.2" />
      <path d="M14.1 14.1A3.2 3.2 0 0 0 12 8.8" />
    </svg>
  );
}
