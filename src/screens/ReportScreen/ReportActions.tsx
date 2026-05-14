"use client";

import { useRouter } from "next/navigation";
import { buildReportMarkdown } from "@features/report";
import type { PracticeSession } from "@shared/types";
import { Button } from "@shared/ui";

type ReportActionsProps = {
  sessionId: string;
  session?: PracticeSession;
  showProgress?: boolean;
};

const createReportFileName = (title: string): string =>
  `${title.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-|-$/g, "") || "huddy-report"}.md`;

export function ReportActions({
  session,
  sessionId,
  showProgress = true,
}: ReportActionsProps) {
  const router = useRouter();
  const handleDownload = () => {
    if (!session) return;

    const blob = new Blob([buildReportMarkdown(session)], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = createReportFileName(session.title);
    link.click();
    URL.revokeObjectURL(url);
  };

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
      {session?.report && (
        <Button onClick={handleDownload} variant="ghost">
          Markdown 저장
        </Button>
      )}
    </div>
  );
}
