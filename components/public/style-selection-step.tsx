import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FantasyStyle } from "@/types/domain";
import { cn } from "@/lib/utils";

type StyleSelectionStepProps = {
  styles: FantasyStyle[];
  selectedStyleId: string;
  onSelect: (styleId: string) => void;
  onPrevious: () => void;
  onNext: () => void;
};

export function StyleSelectionStep({
  styles,
  selectedStyleId,
  onSelect,
  onPrevious,
  onNext,
}: StyleSelectionStepProps) {
  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <Badge tone="violet">Choose One Fantasy Destiny</Badge>
        <h2 className="text-3xl text-white sm:text-4xl">Select your cat&apos;s transformation style</h2>
        <p className="max-w-3xl text-base text-fantasy-mist/70">
          Each style will be used as the artistic reference for the generated portrait. The production
          backend should map the selected style ID to a secure server-side reference asset.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {styles.map((style) => {
          const isSelected = selectedStyleId === style.id;

          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onSelect(style.id)}
              className={cn(
                "group rounded-[1.75rem] border p-4 text-left transition duration-200",
                isSelected
                  ? "border-fantasy-gold/60 bg-white/10 shadow-aurora"
                  : "border-white/10 bg-white/[0.04] hover:border-fantasy-plum/40 hover:bg-white/[0.08]",
              )}
            >
              <div
                className={cn(
                  "flex aspect-[4/5] items-end rounded-[1.25rem] border border-white/10 bg-cover bg-center p-4 transition duration-300",
                  isSelected
                    ? "scale-[1.01] shadow-[0_18px_40px_rgba(244,200,255,0.18)]"
                    : "brightness-[0.78] saturate-[0.9] group-hover:brightness-[0.9] group-hover:saturate-100",
                )}
                style={{
                  backgroundImage: isSelected
                    ? `linear-gradient(180deg, rgba(17, 7, 34, 0.02), rgba(17, 7, 34, 0.42)), url('${style.imageUrl}')`
                    : `linear-gradient(180deg, rgba(17, 7, 34, 0.18), rgba(17, 7, 34, 0.9)), url('${style.imageUrl}')`,
                }}
              >
                <Badge tone={isSelected ? "gold" : "violet"}>
                  {isSelected ? "Selected" : "Tap to select"}
                </Badge>
              </div>
              <div className="mt-4 space-y-2">
                <h3 className="text-xl text-white">{style.name}</h3>
                <p className="text-sm leading-6 text-fantasy-mist/65">{style.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="ghost" onClick={onPrevious}>
          Previous Step
        </Button>
        <Button onClick={onNext} disabled={!selectedStyleId}>
          Next Step
        </Button>
      </div>
    </section>
  );
}
