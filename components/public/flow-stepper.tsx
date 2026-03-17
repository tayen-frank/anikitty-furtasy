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
  const activeIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === activeStep),
  );

  return (
    <>
      <div className="sm:hidden">
        <div className="flex items-center gap-2">
          {steps.map((step, index) => {
            const isActive = index === activeIndex;
            const isPast = index < activeIndex;

            return (
              <div key={step.id} className="flex min-w-0 flex-1 items-center gap-2">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition",
                    isActive
                      ? "border-fantasy-gold/80 bg-fantasy-gold/20 text-white shadow-[0_0_20px_rgba(214,178,94,0.22)]"
                      : isPast
                        ? "border-fantasy-plum/50 bg-fantasy-plum/25 text-fantasy-mist"
                        : "border-white/12 bg-white/[0.03] text-white/55",
                  )}
                >
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-px min-w-0 flex-1 transition",
                      isPast ? "bg-fantasy-plum/45" : "bg-white/10",
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-3 text-center">
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-fantasy-gold/70">
            Step {activeIndex + 1} of {steps.length}
          </p>
          <p className="mt-1 text-sm font-semibold text-white">{steps[activeIndex]?.label}</p>
        </div>
      </div>

      <div className="hidden gap-3 sm:grid sm:grid-cols-5">
        {steps.map((step, index) => {
          const isActive = step.id === activeStep;
          const isPast = activeIndex > index;

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
    </>
  );
}
