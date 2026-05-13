# HUDdy Project Context

## Product Definition

HUDdy is an AI speaking navigator for English presentation practice. The product helps a speaker rehearse with a quiet on-screen HUD that shows the current keyword, subtle timing, breath, and flow cues while keeping the center speaking area visually calm.

The product has completed the P0 placeholder MVP, the P0-B camera self-view milestone, and the Breath Script HUD Mode. UI/UX polish and keyword progress tracking are also complete.

## Current Completed Scope

T01 through T24 are complete. Camera self-view reliability fix and Breath Script HUD Mode are also complete.

The complete P0 placeholder MVP flow is implemented:

1. Home
2. Create Session
3. Prepare
4. Practice Room
5. Report
6. Progress
7. Reopen completed report

The P0 flow supports:

- Creating a `PracticeSession`.
- Saving sessions to local storage.
- Preparing from a Korean memo.
- Generating mock keyword cards.
- Reviewing and editing keyword cards.
- Generating a mock Breath Script.
- Practicing with a live camera self-view (getUserMedia, browser-only, no recording) and HUD overlay.
- HUD auto-selects Breath Script mode when a `breathScript` with segments exists; falls back to Keyword mode otherwise.
- In Breath Script mode: shows current phrase (NOW), optional next phrase preview (NEXT), pause chip when `isBreathPoint`, Cue X/Y progress dots, and manual "다음 cue" advance.
- Advancing one keyword at a time (Keyword mode) or one cue at a time (Breath Script mode).
- Running a practice timer.
- Completing practice and navigating to a report.
- Generating a mock report if one does not already exist.
- Saving completed status and report data.
- Showing completed sessions on Home and Progress.
- Reopening a completed report without regenerating it.

## HUD Mode Selection

- `useHUDStore` tracks `hudMode: "keyword" | "breath"`, `currentBreathCueIndex`, and `allBreathCuesCompleted` as runtime state.
- `PracticeScreen` calls `setHudMode("breath")` after `startSession` when `session.breathScript?.segments.length > 0`; defaults to "keyword" otherwise.
- `HUDOverlay` conditionally renders `HUDBreathCue` (breath mode) or `HUDKeywordCard` (keyword mode) in the top-center safe zone.
- `nextBreathCue(totalCues)` advances the cue index; sets `allBreathCuesCompleted` when the last cue is reached.

## Current Architecture Decisions

- App Router route files live in `src/app`.
- `src/screens` is the screen layer.
- `src/pages` must not be recreated.
- Screen components live under `src/screens`.
- The canonical domain type is `PracticeSession`.
- `Session` must not be introduced as the canonical domain type.
- `localStorageAdapter` is the storage source of truth for P0.
- Zustand is used only for HUD runtime state.
- Zustand persist is not used in P0.
- `useHUDStore` has no side effects.
- `usePracticeTimer` owns timer side effects.
- Timer interval state is not stored in Zustand.
- HUD runtime state is not persisted.
- Report generation belongs to the Report screen, not Practice.
- Mock adapters are used for P0 AI-like behavior.

## Important Constraints

- Do not recreate `src/pages`.
- Do not move screens out of `src/screens`.
- Do not move route files out of `src/app`.
- Do not replace `PracticeSession` with another canonical session type.
- Do not use Zustand persist, `createJSONStorage`, or `skipHydration` in P0.
- Do not persist HUD runtime state.
- Do not put timer side effects in `useHUDStore`.
- Camera self-view (getUserMedia, `video` only, `audio: false`) is now part of P0-B scope and is implemented.
- Do not add recorder, audio capture, STT, or MediaPipe.
- Do not add backend, auth, DB, or payment.
- Do not add shadcn/ui.
- Do not use TypeScript `any`.
- Inline hex colors are forbidden outside token source files.
- Forbidden vision-identification terms must not appear in `src`.
- Existing docs and folders must be preserved unless explicitly requested:
  - `SPEC.md`
  - `BRAND_GUIDE.md`
  - `MASTER_PLAN.md`
  - `skills/`
  - `report/`

## Current Routes

- `/`
  - Route file: `src/app/page.tsx`
  - Screen: Home
- `/progress`
  - Route file: `src/app/progress/page.tsx`
  - Screen: Progress
- `/session/new`
  - Route file: `src/app/session/new/page.tsx`
  - Screen: Create Session
- `/session/[id]/prepare`
  - Route file: `src/app/session/[id]/prepare/page.tsx`
  - Screen: Prepare
- `/session/[id]/practice`
  - Route file: `src/app/session/[id]/practice/page.tsx`
  - Screen: Practice Room
- `/session/[id]/report`
  - Route file: `src/app/session/[id]/report/page.tsx`
  - Screen: Report

## Current Implementation Status

- Home loads safely with or without sessions.
- Home links to new session and progress.
- Home shows completed session state when available.
- Create Session creates and saves a `PracticeSession`.
- Create Session navigates to Prepare.
- Prepare handles missing session safely.
- Prepare Step 1 accepts a Korean memo.
- Prepare Step 1 generates mock keyword cards.
- Prepare Step 2 supports keyword card review and edit.
- Prepare Step 2 generates a mock Breath Script.
- Prepare Step 3 navigates to Practice.
- Practice handles missing session safely.
- Practice initializes HUD runtime state from a valid `PracticeSession`.
- Practice shows a live camera self-view via `getUserMedia` (`video` only, `audio: false`, no recording, no upload). Camera is entirely browser-local. If denied or unavailable, the practice room remains fully usable.
- Practice shows the HUD overlay.
- Practice shows only the current keyword, not the full script.
- Practice timer increments through `usePracticeTimer`.
- Practice completion calls `endSession()` and routes to Report.
- Report handles missing session safely.
- Report generates a mock report only when the session has no saved report.
- Report saves the report and marks the `PracticeSession` as completed.
- Report sets `completedAt` and updates `updatedAt`.
- Report can be reopened without regenerating saved report data.
- Report keyword progress shows real count from HUD runtime state (not `card.isUsed`, which is never set in P0).
- Progress reads completed sessions from storage.
- Progress shows completed sessions and routes them to saved reports.
- Empty or corrupted local storage is handled with safe fallbacks.

## What Not To Change

- Do not change the P0 placeholder MVP scope into a real capture or analysis product yet.
- Do not add real AI APIs.
- Do not add recording, audio capture, STT, or MediaPipe.
- Do not add backend persistence.
- Do not add auth, DB, or payment.
- Do not add shadcn/ui.
- Do not redesign the entire UI without a UI/UX review task.
- Do not write report data from Practice.
- Do not persist HUD runtime state.
- Do not place interval logic inside `useHUDStore`.
- Do not introduce `src/pages`.
- Do not modify `SPEC.md`, `BRAND_GUIDE.md`, `MASTER_PLAN.md`, `skills/`, or `report/` unless a future task explicitly requests it.

## Completed Milestones

- **P0 placeholder MVP** — full practice flow, mock AI, local storage, HUD overlay.
- **UI/UX polish** — route navigation, visual hierarchy, empty states.
- **Keyword progress patch** — ReportScreen reads HUD runtime state to compute real keyword count.
- **P0-B camera self-view** — `getUserMedia` live preview in PracticeScreen, browser-only, no recording. Camera `srcObject` reliability fix: `videoRef.current` is assigned via `useEffect([status])` after `<video>` mounts.
- **Breath Script HUD Mode** — `HUDBreathCue` component, `hudMode`/`currentBreathCueIndex`/`allBreathCuesCompleted` in `useHUDStore`, auto-mode-select in `PracticeScreen`.

## Recommended Next Phase

Suggested order:

1. P1: Real speech-to-text transcription (Web Speech API or Whisper).
2. P1: Keyword detection against live transcript.
3. P1: Auto-advance keyword on detection.
4. Keep recording, audio upload, MediaPipe, backend, auth, DB, and payment out of scope until later phases.
