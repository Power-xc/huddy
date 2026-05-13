import type { BreathScript } from "@shared/types";

export type BreathScriptViewProps = {
  breathScript: BreathScript;
};

export function BreathScriptView({ breathScript }: BreathScriptViewProps) {
  return (
    <div className="flex flex-wrap gap-3 rounded-lg border border-border bg-surface p-4 leading-8">
      {breathScript.segments.map((segment) => (
        <span className="inline-flex items-center gap-3" key={segment.id}>
          <span className="text-text">{segment.text}</span>
          {segment.isBreathPoint && (
            <span
              className="rounded-full border border-border px-2 py-0.5 font-mono text-sm"
              style={{ color: "var(--color-accent)" }}
            >
              /
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
