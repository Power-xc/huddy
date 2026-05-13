import type React from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
};

const joinClassNames = (
  ...classNames: Array<string | false | null | undefined>
) => classNames.filter(Boolean).join(" ");

const variantClassNames: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-background-deep hover:bg-primary-hover focus-visible:outline-primary",
  secondary:
    "border border-border-strong bg-surface text-text hover:border-primary focus-visible:outline-primary",
  ghost:
    "border border-transparent bg-transparent text-text-secondary hover:border-border hover:bg-surface focus-visible:outline-primary",
};

const sizeClassNames: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-sm",
  md: "min-h-11 px-5 text-base",
  lg: "min-h-13 px-7 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  onClick,
  disabled = false,
  loading = false,
  type = "button",
  className,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      aria-busy={loading ? "true" : undefined}
      className={joinClassNames(
        "inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-55",
        variantClassNames[variant],
        sizeClassNames[size],
        className,
      )}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : onClick}
      type={type}
    >
      {/* 버튼 변형을 한곳에서 관리해 HUDdy CTA와 보조 액션을 일관되게 유지하고, primary cyan은 주 행동에만 쓰도록 제한한다. */}
      {loading ? "처리 중..." : children}
    </button>
  );
}
