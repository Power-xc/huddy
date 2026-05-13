import { GlassCard } from "@shared/ui";

export type HUDSubtitleProps = {
  label?: string;
};

export function HUDSubtitle({ label = "..." }: HUDSubtitleProps) {
  return (
    <GlassCard className="px-5 py-3 text-center">
      <p className="truncate text-sm text-text-secondary">{label}</p>
    </GlassCard>
  );
}
