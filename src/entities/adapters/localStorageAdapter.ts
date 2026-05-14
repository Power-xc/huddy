import type { AppConfig, PracticeSession } from "@shared/types";
import type { StorageAdapter } from "./storageAdapter";

const SESSIONS_KEY = "huddy-sessions";
const CONFIG_KEY = "huddy-config";

const createDefaultConfig = (): AppConfig => ({
  programStartDate: new Date().toISOString(),
  currentWeek: 1,
  totalSessionsCompleted: 0,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isPracticeSession = (value: unknown): value is PracticeSession => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.category === "string" &&
    typeof value.mode === "string" &&
    Array.isArray(value.focusAreas) &&
    typeof value.targetDurationMin === "number" &&
    typeof value.weekNumber === "number" &&
    typeof value.memoKo === "string" &&
    Array.isArray(value.keywordCards) &&
    (value.transcript === undefined ||
      typeof value.transcript === "string" ||
      value.transcript === null) &&
    typeof value.status === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string" &&
    (typeof value.completedAt === "string" || value.completedAt === null)
  );
};

const isPracticeSessionArray = (value: unknown): value is PracticeSession[] =>
  Array.isArray(value) && value.every(isPracticeSession);

const isAppConfig = (value: unknown): value is AppConfig => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.programStartDate === "string" &&
    typeof value.currentWeek === "number" &&
    typeof value.totalSessionsCompleted === "number"
  );
};

export class LocalStorageAdapter implements StorageAdapter {
  getSessions(): PracticeSession[] {
    return this.readJson(SESSIONS_KEY, [], isPracticeSessionArray).map(
      (session) => ({
        ...session,
        transcript: session.transcript ?? null,
      }),
    );
  }

  getSession(id: string): PracticeSession | null {
    return this.getSessions().find((session) => session.id === id) ?? null;
  }

  saveSession(session: PracticeSession): void {
    const sessions = this.getSessions();
    const existingIndex = sessions.findIndex((item) => item.id === session.id);

    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }

    this.writeJson(SESSIONS_KEY, sessions);
  }

  updateSession(
    id: string,
    partial: Partial<PracticeSession>,
  ): PracticeSession | null {
    const sessions = this.getSessions();
    const existingIndex = sessions.findIndex((session) => session.id === id);

    if (existingIndex < 0) {
      return null;
    }

    const updatedSession: PracticeSession = {
      ...sessions[existingIndex],
      ...partial,
      id,
      updatedAt: new Date().toISOString(),
    };

    sessions[existingIndex] = updatedSession;
    this.writeJson(SESSIONS_KEY, sessions);

    return updatedSession;
  }

  deleteSession(id: string): void {
    this.writeJson(
      SESSIONS_KEY,
      this.getSessions().filter((session) => session.id !== id),
    );
  }

  getConfig(): AppConfig {
    return this.readJson(CONFIG_KEY, createDefaultConfig(), isAppConfig);
  }

  saveConfig(config: Partial<AppConfig>): AppConfig {
    const nextConfig: AppConfig = {
      ...this.getConfig(),
      ...config,
    };

    this.writeJson(CONFIG_KEY, nextConfig);

    return nextConfig;
  }

  clear(): void {
    const storage = this.getLocalStorage();

    if (!storage) {
      return;
    }

    // HUDdy 외 데이터까지 지우면 사용자의 다른 로컬 상태를 손상시킬 수 있어 전용 키만 제거한다.
    try {
      storage.removeItem(SESSIONS_KEY);
      storage.removeItem(CONFIG_KEY);
    } catch (error) {
      console.error("Failed to clear HUDdy storage.", error);
    }
  }

  private getLocalStorage(): Storage | null {
    // Next.js 서버 렌더링 중에는 window가 없으므로 접근 전에 반드시 분기한다.
    if (typeof window === "undefined") {
      return null;
    }

    try {
      return window.localStorage;
    } catch (error) {
      console.error("Failed to access localStorage.", error);
      return null;
    }
  }

  private readJson<T>(
    key: string,
    fallback: T,
    isValid: (value: unknown) => value is T,
  ): T {
    const storage = this.getLocalStorage();

    if (!storage) {
      return fallback;
    }

    try {
      const rawValue = storage.getItem(key);

      if (rawValue === null) {
        return fallback;
      }

      const parsedValue: unknown = JSON.parse(rawValue);

      if (!isValid(parsedValue)) {
        console.error(`Invalid HUDdy storage value for key "${key}".`);
        return fallback;
      }

      return parsedValue;
    } catch (error) {
      // P0는 로컬 우선 MVP라 저장소 오류가 화면 전체를 깨지 않도록 안전 기본값으로 복구한다.
      console.error(`Failed to read HUDdy storage key "${key}".`, error);
      return fallback;
    }
  }

  private writeJson<T>(key: string, value: T): void {
    const storage = this.getLocalStorage();

    if (!storage) {
      return;
    }

    try {
      storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to save HUDdy storage key "${key}".`, error);
    }
  }
}
