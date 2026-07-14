import type { BreathScript } from "@shared/types";

export type BreathScriptViewProps = {
  breathScript: BreathScript;
};

export function BreathScriptView({ breathScript }: BreathScriptViewProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="mb-3 text-xs uppercase text-text-muted">breath review</p>
      <div className="grid gap-3">
        {breathScript.segments.map((segment, index) => (
          <div
            className="rounded-lg border border-border bg-background/30 px-4 py-3"
            key={segment.id}
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 font-mono text-xs text-text-muted">
                {index + 1}
              </span>
              <p className="flex-1 leading-7 text-text">{segment.text}</p>
            {segment.isBreathPoint && (
              <span
                className="rounded-full border border-border-strong px-2 py-0.5 font-mono text-xs"
                style={{ color: "var(--color-accent)" }}
              >
                pause
              </span>
            )}
            </div>
            {segment.translationKo && (
              <p className="mt-2 border-t border-border/60 pt-2 pl-7 text-sm leading-6 text-text-secondary">
                {segment.translationKo}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
