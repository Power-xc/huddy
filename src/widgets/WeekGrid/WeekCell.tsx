export type WeekCellProps = {
  weekNumber: number;
  sessionCount: number;
  isCompleted: boolean;
  isCurrent: boolean;
  onClick?: () => void;
};

const joinClassNames = (
  ...classNames: Array<string | false | null | undefined>
) => classNames.filter(Boolean).join(" ");

export function WeekCell({
  weekNumber,
  sessionCount,
  isCompleted,
  isCurrent,
  onClick,
}: WeekCellProps) {
  const isInteractive = Boolean(onClick);
  const borderColor = isCurrent
    ? "var(--color-primary)"
    : isCompleted
      ? "var(--color-success)"
      : "var(--color-border)";
  const textColor = isCompleted
    ? "var(--color-text)"
    : "var(--color-text-secondary)";

  return (
    <button
      className={joinClassNames(
        "flex aspect-square min-h-20 flex-col items-start justify-between rounded-lg p-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        isInteractive && "cursor-pointer hover:bg-surface-hover",
        !isInteractive && "cursor-default",
      )}
      disabled={!isInteractive}
      onClick={onClick}
      style={{
        background: "var(--color-surface)",
        border: `1px solid ${borderColor}`,
        boxShadow: isCurrent ? "var(--glow-cyan)" : "none",
        color: textColor,
      }}
      type="button"
    >
      <span className="text-sm font-medium text-text-secondary">Week</span>
      <span className="text-2xl font-semibold">{weekNumber}</span>
      <span className="text-xs text-text-muted">
        {sessionCount > 0 ? `${sessionCount}회` : "준비 전"}
      </span>
    </button>
  );
}
