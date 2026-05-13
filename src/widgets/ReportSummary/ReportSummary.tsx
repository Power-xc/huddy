import { formatTime } from "@shared/lib/formatTime";
import type { PracticeSession } from "@shared/types";
import { GlassCard } from "@shared/ui";

export type ReportSummaryProps = {
  session: PracticeSession;
};

export function ReportSummary({ session }: ReportSummaryProps) {
  const focusAreas =
    session.focusAreas.length > 0 ? session.focusAreas.join(" / ") : "none";

  return (
    <GlassCard className="grid gap-5 p-6">
      <div>
        <p className="text-sm text-text-secondary">Session</p>
        <h2 className="mt-2 font-heading text-2xl font-semibold text-text">
          {session.title}
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <p className="text-sm text-text-secondary">Week</p>
          <p className="mt-2 font-mono text-xl font-semibold text-primary">
            {session.weekNumber}
          </p>
        </div>
        <div>
          <p className="text-sm text-text-secondary">Mode</p>
          <p className="mt-2 font-semibold text-text">{session.mode}</p>
        </div>
        <div>
          <p className="text-sm text-text-secondary">Focus</p>
          <p className="mt-2 text-sm font-medium text-text">{focusAreas}</p>
        </div>
        <div>
          <p className="text-sm text-text-secondary">Target</p>
          <p className="mt-2 font-mono text-xl font-semibold text-text">
            {session.targetDurationMin} min
          </p>
        </div>
        <div>
          <p className="text-sm text-text-secondary">Actual</p>
          <p className="mt-2 font-mono text-xl font-semibold text-primary">
            {session.report ? formatTime(session.report.actualDurationSec) : "-"}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
