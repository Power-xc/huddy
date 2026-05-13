import { GlassCard } from "@shared/ui";

export type HUDSubtitleProps = {
  label?: string;
};

export function HUDSubtitle({ label = "..." }: HUDSubtitleProps) {
  const isPlaceholder = label.trim() === "...";

  return (
    <GlassCard
      className={[
        "px-5 py-2 text-center",
        isPlaceholder ? "opacity-45" : "opacity-70",
      ].join(" ")}
    >
      <p className="truncate text-xs text-text-muted">{label}</p>
    </GlassCard>
  );
}
