import type { AppConfig, PracticeSession } from "@shared/types";

export interface StorageAdapter {
  getSessions(): PracticeSession[];
  getSession(id: string): PracticeSession | null;
  saveSession(session: PracticeSession): void;
  updateSession(
    id: string,
    partial: Partial<PracticeSession>,
  ): PracticeSession | null;
  deleteSession(id: string): void;
  getConfig(): AppConfig;
  saveConfig(config: Partial<AppConfig>): AppConfig;
  clear(): void;
}
