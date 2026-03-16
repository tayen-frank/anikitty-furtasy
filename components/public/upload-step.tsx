"use client";

import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FantasyStyle } from "@/types/domain";

type UploadStepProps = {
  selectedStyle?: FantasyStyle;
  photoName: string;
  photoPreviewUrl: string | null;
  onFileChange: (file: File) => void;
  onChangeStyle: () => void;
  onPrevious: () => void;
  onNext: () => void;
  isSubmitting: boolean;
};

const photoTips = [
  "Use a bright, front-facing photo with both eyes visible.",
  "Avoid heavy filters, motion blur, or hidden ears.",
  "Keep only one cat in frame for the clearest identity match.",
];

export function UploadStep({
  selectedStyle,
  photoName,
  photoPreviewUrl,
  onFileChange,
  onChangeStyle,
  onPrevious,
  onNext,
  isSubmitting,
}: UploadStepProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-5">
        <Badge tone="gold">Upload Cat Photo</Badge>
        <div className="space-y-3">
          <h2 className="text-3xl text-white sm:text-4xl">Prepare the hero portrait reference</h2>
          <p className="max-w-2xl text-base text-fantasy-mist/70">
            Your selected style will stay attached to the portrait job while the real backend handles
            upload validation, storage, and AI generation orchestration.
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-fantasy-gold/20 bg-white/[0.04] p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-fantasy-gold/80">Selected Style</p>
          <div className="mt-3 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl text-white">{selectedStyle?.name ?? "Choose a style first"}</h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-fantasy-mist/65">
                {selectedStyle?.description ??
                  "Select one of the eight fantasy archetypes before uploading a photo."}
              </p>
            </div>
            <Button variant="secondary" onClick={onChangeStyle}>
              Change Style
            </Button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="group flex min-h-[18rem] w-full flex-col items-center justify-center rounded-[2rem] border border-dashed border-fantasy-plum/40 bg-white/[0.04] p-6 text-center transition hover:border-fantasy-gold/40 hover:bg-white/[0.07]"
        >
          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.heic,image/jpeg,image/png,image/heic"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) {
                onFileChange(file);
              }
            }}
          />
          {photoPreviewUrl ? (
            <div className="space-y-4">
              <img
                src={photoPreviewUrl}
                alt="Uploaded cat preview"
                className="mx-auto aspect-square max-h-64 rounded-[1.5rem] object-cover shadow-aurora"
              />
              <p className="text-sm uppercase tracking-[0.24em] text-fantasy-gold/80">{photoName}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-fantasy-gold/30 bg-fantasy-gold/10 text-3xl">
                *
              </div>
              <div className="space-y-2">
                <p className="text-xl text-white">Drop in your cat photo or click to browse</p>
                <p className="text-sm leading-6 text-fantasy-mist/65">
                  Supports `jpg`, `png`, and `heic` up to 10MB.
                </p>
              </div>
            </div>
          )}
        </button>
      </div>

      <div className="space-y-5 rounded-[2rem] border border-white/10 bg-[#120923]/70 p-6">
        <p className="text-sm uppercase tracking-[0.24em] text-fantasy-rose/80">Photo Tips</p>
        <div className="space-y-4">
          {photoTips.map((tip) => (
            <div
              key={tip}
              className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-4 text-sm leading-6 text-fantasy-mist/75"
            >
              {tip}
            </div>
          ))}
        </div>
        <p className="text-sm leading-6 text-fantasy-mist/55">
          TODO: Add client-side EXIF cleanup, HEIC conversion, and richer preflight checks before
          sending files to production APIs.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="ghost" onClick={onPrevious}>
            Previous Step
          </Button>
          <Button onClick={onNext} disabled={!photoName || isSubmitting}>
            {isSubmitting ? "Summoning..." : "Next Step"}
          </Button>
        </div>
      </div>
    </section>
  );
}
