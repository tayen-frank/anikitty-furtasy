import { Button } from "@/components/ui/button";

type StartStepProps = {
  catName: string;
  passCode: string;
  onCatNameChange: (value: string) => void;
  onPassCodeChange: (value: string) => void;
  onNext: () => void;
};

export function StartStep({
  catName,
  passCode,
  onCatNameChange,
  onPassCodeChange,
  onNext,
}: StartStepProps) {
  const isValid = catName.trim().length > 0 && passCode.trim().length > 0;

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
            Identity-preserving AI pipeline
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
            <input
              type="password"
              value={passCode}
              onChange={(event) => onPassCodeChange(event.target.value)}
              placeholder="Moonlit access code"
              className="w-full rounded-2xl border border-white/10 bg-[#120923] px-4 py-3 text-base text-white outline-none transition placeholder:text-white/35 focus:border-fantasy-gold/60"
            />
          </div>
          <Button onClick={onNext} disabled={!isValid} fullWidth>
            Start
          </Button>
          <p className="text-sm leading-7 text-fantasy-mist/60">
            TODO: Wire the pass code into your real purchase, access, or invite gate once backend auth
            and order validation exist.
          </p>
        </div>
      </div>
    </section>
  );
}
