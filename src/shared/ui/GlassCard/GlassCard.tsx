import type React from "react";

export type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: "default" | "strong";
};

const joinClassNames = (
  ...classNames: Array<string | false | null | undefined>
) => classNames.filter(Boolean).join(" ");

export function GlassCard({
  children,
  className,
  onClick,
  variant = "default",
}: GlassCardProps) {
  const isInteractive = Boolean(onClick);
  const glassFilter =
    variant === "strong" ? "blur(16px) saturate(1.55)" : "blur(12px) saturate(1.4)";

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={joinClassNames(isInteractive && "cursor-pointer", className)}
      onClick={onClick}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      style={{
        background: "var(--color-surface)",
        backdropFilter: glassFilter,
        WebkitBackdropFilter: glassFilter,
        border:
          variant === "strong"
            ? "1px solid var(--color-border-strong)"
            : "1px solid var(--color-border)",
        borderRadius: "12px",
      }}
    >
      {/* HUD 패널의 유리 질감을 한곳에서 관리하고, Safari 호환을 위해 backdropFilter 쌍을 함께 유지한다. */}
      {children}
    </div>
  );
}
