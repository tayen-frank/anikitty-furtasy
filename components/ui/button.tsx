import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "public" | "secondary" | "ghost" | "admin";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  public:
    "bg-gradient-to-r from-fantasy-gold via-[#f4d48f] to-fantasy-gold text-[#211030] shadow-lg shadow-[#d6b25e]/20 hover:brightness-105 disabled:brightness-75",
  secondary:
    "border border-fantasy-gold/40 bg-white/5 text-fantasy-mist hover:bg-white/10 disabled:opacity-50",
  ghost:
    "border border-white/10 bg-white/5 text-white hover:border-fantasy-rose/40 hover:bg-white/10 disabled:opacity-50",
  admin:
    "bg-admin-ink text-white hover:bg-[#293249] disabled:bg-admin-slate/60",
};

export function buttonStyles({
  variant = "public",
  fullWidth = false,
  className,
}: {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  className?: string;
}) {
  return cn(
    "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold tracking-[0.14em] uppercase transition duration-200",
    fullWidth && "w-full",
    variantClasses[variant],
    className,
  );
}

export function Button({
  className,
  variant = "public",
  fullWidth = false,
  ...props
}: ButtonProps) {
  return <button className={buttonStyles({ variant, fullWidth, className })} {...props} />;
}
