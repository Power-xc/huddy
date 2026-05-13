import { create } from "zustand";
import type { HUDState, KeywordCard } from "@shared/types";

export type HUDStoreState = {
  hudState: HUDState | null;
  keywordCards: KeywordCard[];
  allKeywordsCompleted: boolean;
  startSession: (sessionId: string, keywordCards: KeywordCard[]) => void;
  nextKeyword: () => void;
  pauseResume: () => void;
  tick: () => void;
  endSession: () => void;
  reset: () => void;
};

const createInitialHUDState = (sessionId: string): HUDState => ({
  sessionId,
  currentKeywordIndex: 0,
  elapsedSec: 0,
  isRunning: true,
  isPaused: false,
});

export const useHUDStore = create<HUDStoreState>((set) => ({
  // HUD 런타임 상태는 저장 모델이 아니라 발표 화면의 일시 상태라 브라우저 저장소에 남기지 않는다.
  hudState: null,
  keywordCards: [],
  allKeywordsCompleted: false,

  startSession: (sessionId, keywordCards) =>
    set({
      hudState: createInitialHUDState(sessionId),
      keywordCards: [...keywordCards],
      allKeywordsCompleted: false,
    }),

  nextKeyword: () =>
    set((state) => {
      if (!state.hudState) {
        return state;
      }

      if (state.keywordCards.length === 0) {
        return { allKeywordsCompleted: true };
      }

      if (state.hudState.currentKeywordIndex < state.keywordCards.length - 1) {
        return {
          hudState: {
            ...state.hudState,
            currentKeywordIndex: state.hudState.currentKeywordIndex + 1,
          },
          allKeywordsCompleted: false,
        };
      }

      const lastKeywordIndex = state.keywordCards.length - 1;

      return {
        hudState: {
          ...state.hudState,
          // 카드 수가 바뀌어도 HUD가 없는 키워드를 가리키지 않도록 마지막 인덱스로 고정한다.
          currentKeywordIndex: lastKeywordIndex,
        },
        allKeywordsCompleted: true,
      };
    }),

  pauseResume: () =>
    set((state) => {
      if (!state.hudState || !state.hudState.isRunning) {
        return state;
      }

      return {
        hudState: {
          ...state.hudState,
          isRunning: true,
          isPaused: !state.hudState.isPaused,
        },
      };
    }),

  tick: () =>
    set((state) => {
      if (
        !state.hudState ||
        !state.hudState.isRunning ||
        state.hudState.isPaused
      ) {
        return state;
      }

      return {
        hudState: {
          ...state.hudState,
          // 타이머 구동은 다음 훅에서 맡고, store는 수동 tick 액션만 제공한다.
          elapsedSec: state.hudState.elapsedSec + 1,
        },
      };
    }),

  endSession: () =>
    set((state) => {
      if (!state.hudState) {
        return state;
      }

      return {
        hudState: {
          ...state.hudState,
          isRunning: false,
          isPaused: false,
        },
      };
    }),

  reset: () =>
    set({
      hudState: null,
      keywordCards: [],
      allKeywordsCompleted: false,
    }),
}));
