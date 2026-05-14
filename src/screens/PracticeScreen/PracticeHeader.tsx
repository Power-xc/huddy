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
    <header className="absolute left-0 right-0 top-0 z-20 grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-4">
      <div className="flex items-center gap-2 justify-self-start">
        <p className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-primary">
          Practice
        </p>
        {isSTTSupported && (
          <span
            className={[
              "h-2 w-2 rounded-full transition-colors",
              isListening ? "bg-primary" : "bg-border",
            ].join(" ")}
            title={isListening ? "마이크 인식 중" : "마이크 대기"}
          />
        )}
        <Button onClick={onToggleSound} size="sm" variant="ghost">
          {isSoundEnabled ? "Sound on" : "Sound off"}
        </Button>
      </div>
      <h1 className="max-w-lg truncate text-center font-heading text-lg font-semibold text-text">
        {title}
      </h1>
      <div className="justify-self-end">
        <Button onClick={onComplete} variant="secondary">
          완료하고 리포트
        </Button>
      </div>
    </header>
  );
}
