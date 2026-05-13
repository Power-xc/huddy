import { GlassCard } from "@shared/ui";

type ReportTone = "strength" | "improvement" | "neutral";

export type ReportFeedbackListProps = {
  title: string;
  items: string[];
  tone?: ReportTone;
};

const toneClassNames: Record<ReportTone, string> = {
  strength: "bg-success",
  improvement: "bg-accent",
  neutral: "bg-primary",
};

export function ReportFeedbackList({
  title,
  items,
  tone = "neutral",
}: ReportFeedbackListProps) {
  return (
    <GlassCard className="grid gap-4 p-6">
      <h2 className="text-xl font-semibold text-text">{title}</h2>
      <ul className="grid gap-3">
        {items.map((item) => (
          <li className="flex gap-3 text-text-secondary" key={item}>
            <span
              className={`mt-2 h-2 w-2 shrink-0 rounded-full ${toneClassNames[tone]}`}
            />
            <span className="leading-7">{item}</span>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
