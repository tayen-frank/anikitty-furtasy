import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "gold" | "violet" | "admin" | "success" | "danger";

const toneClasses: Record<BadgeTone, string> = {
  gold: "bg-fantasy-gold/15 text-fantasy-gold border-fantasy-gold/30",
  violet: "bg-fantasy-plum/15 text-fantasy-rose border-fantasy-plum/30",
  admin: "bg-admin-ink/10 text-admin-ink border-admin-ink/10",
  success: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  danger: "bg-rose-500/10 text-rose-700 border-rose-500/20",
};

export function Badge({
  children,
  tone = "gold",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
