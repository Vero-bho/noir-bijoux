// Кнопка проекта: три варианта оформления. Если передан `to` — рендерится ссылка.
import { Link } from "react-router";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  /** если указан — кнопка становится ссылкой (переход без перезагрузки) */
  to?: string;
  fullWidth?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand-mauve text-brand-bg hover:bg-brand-white",
  outline: "border border-brand-mauve text-brand-mauve hover:bg-brand-mauve hover:text-brand-bg",
  ghost: "text-brand-mauve hover:text-brand-white",
};

const SIZES: Record<Size, string> = {
  sm: "px-4 py-2 text-base",
  md: "px-6 py-3 text-lg",
  lg: "px-8 py-4 text-xl",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  to,
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  const classes = [
    "inline-flex items-center justify-center gap-2 rounded-xl transition-colors duration-200",
    "disabled:cursor-not-allowed disabled:opacity-45",
    VARIANTS[variant],
    SIZES[size],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
