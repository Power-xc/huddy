"use client";

import { useRouter } from "next/navigation";
import { Button } from "@shared/ui";

type ReportActionsProps = {
  sessionId: string;
  showProgress?: boolean;
};

export function ReportActions({
  sessionId,
  showProgress = true,
}: ReportActionsProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button onClick={() => router.push("/")}>홈으로</Button>
      {showProgress && (
        <Button onClick={() => router.push("/progress")} variant="secondary">
          진행 현황 보기
        </Button>
      )}
      <Button
        onClick={() => router.push(`/session/${sessionId}/prepare`)}
        variant="ghost"
      >
        다시 연습
      </Button>
    </div>
  );
}
