import { GlassCard } from "@shared/ui";

const cueLabels = ["PACE", "BREATH", "FOCUS"];

export function HUDCuePlaceholder() {
  return (
    <GlassCard className="min-w-44 px-4 py-3">
      <p className="text-xs uppercase text-text-muted">cue lane</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {cueLabels.map((label) => (
          <span
            className="rounded-full border border-border px-2 py-1 font-mono text-xs text-text-secondary"
            key={label}
          >
            {label}
          </span>
        ))}
      </div>
    </GlassCard>
  );
}
