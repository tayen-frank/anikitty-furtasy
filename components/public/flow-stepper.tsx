import { cn } from "@/lib/utils";

type FlowStep = {
  id: string;
  label: string;
};

export function FlowStepper({
  steps,
  activeStep,
}: {
  steps: FlowStep[];
  activeStep: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-5">
      {steps.map((step, index) => {
        const isActive = step.id === activeStep;
        const isPast = steps.findIndex((item) => item.id === activeStep) > index;

        return (
          <div
            key={step.id}
            className={cn(
              "rounded-2xl border px-4 py-3 text-left backdrop-blur transition",
              isActive
                ? "border-fantasy-gold/60 bg-fantasy-gold/10 text-white"
                : isPast
                  ? "border-fantasy-plum/20 bg-white/5 text-fantasy-mist"
                  : "border-white/10 bg-white/[0.03] text-white/55",
            )}
          >
            <p className="text-[0.65rem] uppercase tracking-[0.24em] text-fantasy-gold/80">
              Step {index + 1}
            </p>
            <p className="mt-1 text-sm font-semibold">{step.label}</p>
          </div>
        );
      })}
    </div>
  );
}
