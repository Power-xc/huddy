import { GlassCard } from "@shared/ui";

export type HUDCuePlaceholderProps = {
  label?: string;
};

export function HUDCuePlaceholder({
  label = "pace / breath",
}: HUDCuePlaceholderProps) {
  return (
    <GlassCard className="min-w-36 px-4 py-3">
      <p className="text-xs uppercase text-text-secondary">cue</p>
      <p className="mt-1 text-sm font-medium text-text">{label}</p>
    </GlassCard>
  );
}
