import type { PracticeSessionSummary } from "@shared/types";
import { WeekCell } from "./WeekCell";

export type WeekGridProps = {
  sessions: PracticeSessionSummary[];
  currentWeek: number;
  onWeekClick?: (weekNumber: number) => void;
};

const WEEKS = Array.from({ length: 12 }, (_, index) => index + 1);

export function WeekGrid({
  sessions,
  currentWeek,
  onWeekClick,
}: WeekGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      {WEEKS.map((weekNumber) => {
        const weekSessions = sessions.filter(
          (session) => session.weekNumber === weekNumber,
        );
        const isCompleted = weekSessions.some(
          (session) => session.status === "completed",
        );

        return (
          <WeekCell
            isCompleted={isCompleted}
            isCurrent={weekNumber === currentWeek}
            key={weekNumber}
            onClick={
              onWeekClick ? () => onWeekClick(weekNumber) : undefined
            }
            sessionCount={weekSessions.length}
            weekNumber={weekNumber}
          />
        );
      })}
    </div>
  );
}
