import { Button } from "@shared/ui";

export type PracticeHeaderProps = {
  title: string;
  isListening: boolean;
  isSoundEnabled: boolean;
  isSTTSupported: boolean;
  onComplete: () => void;
  onToggleSound: () => void;
};

export function PracticeHeader({
  title,
  isListening,
  isSoundEnabled,
  isSTTSupported,
  onComplete,
  onToggleSound,
}: PracticeHeaderProps) {
  return (
    <header className="absolute left-0 right-0 top-0 z-20 flex flex-col gap-2 px-3 py-3 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4 sm:px-5 sm:py-4">
      <div className="flex min-w-0 items-center gap-2 justify-self-start overflow-x-auto">
        <p className="shrink-0 rounded-full border border-border px-3 py-1.5 text-sm font-semibold text-primary sm:px-4 sm:py-2">
          Practice
        </p>
        {isSTTSupported && (
          <span
            className={[
              "rounded-full border px-3 py-1 font-mono text-xs transition-colors",
              isListening
                ? "border-primary text-primary"
                : "border-border text-text-muted",
            ].join(" ")}
            title={isListening ? "마이크 인식 중" : "마이크 대기"}
          >
            {isListening ? "MIC LIVE" : "MIC IDLE"}
          </span>
        )}
        <Button onClick={onToggleSound} size="sm" variant="ghost">
          {isSoundEnabled ? "Sound on" : "Sound off"}
        </Button>
      </div>
      <h1 className="order-first max-w-full truncate pr-32 text-left font-heading text-base font-semibold text-text sm:order-none sm:max-w-lg sm:pr-0 sm:text-center sm:text-lg">
        {title}
      </h1>
      <div className="absolute right-3 top-3 justify-self-end sm:static">
        <Button onClick={onComplete} size="sm" variant="secondary">
          완료하고 리포트
        </Button>
      </div>
    </header>
  );
}
