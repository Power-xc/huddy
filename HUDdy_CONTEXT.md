# HUDdy Project Context

## Product Definition

HUDdy is an AI speaking navigator for English presentation practice. The product helps a speaker rehearse with a quiet on-screen HUD that shows the current keyword, subtle timing, breath, and flow cues while keeping the center speaking area visually calm.

The current product is a P0 placeholder MVP. It validates the end-to-end practice flow and HUD interaction model before adding camera, recording, speech analysis, or backend systems.

## Current Completed Scope

T01 through T24 are complete.

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
- Practicing with a camera placeholder and HUD overlay.
- Advancing one keyword at a time.
- Running a practice timer.
- Completing practice and navigating to a report.
- Generating a mock report if one does not already exist.
- Saving completed status and report data.
- Showing completed sessions on Home and Progress.
- Reopening a completed report without regenerating it.

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
- Do not add camera or `getUserMedia` yet.
- Do not add recorder, audio capture, STT, or MediaPipe yet.
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
- Practice shows a camera placeholder, not a real camera feed.
- Practice shows the HUD overlay.
- Practice shows only the current keyword, not the full script.
- Practice timer increments through `usePracticeTimer`.
- Practice completion calls `endSession()` and routes to Report.
- Report handles missing session safely.
- Report generates a mock report only when the session has no saved report.
- Report saves the report and marks the `PracticeSession` as completed.
- Report sets `completedAt` and updates `updatedAt`.
- Report can be reopened without regenerating saved report data.
- Progress reads completed sessions from storage.
- Progress shows completed sessions and routes them to saved reports.
- Empty or corrupted local storage is handled with safe fallbacks.

## What Not To Change

- Do not change the P0 placeholder MVP scope into a real capture or analysis product yet.
- Do not add real AI APIs.
- Do not add camera, recording, audio, STT, or MediaPipe.
- Do not add backend persistence.
- Do not add auth, DB, or payment.
- Do not add shadcn/ui.
- Do not redesign the entire UI without a UI/UX review task.
- Do not write report data from Practice.
- Do not persist HUD runtime state.
- Do not place interval logic inside `useHUDStore`.
- Do not introduce `src/pages`.
- Do not modify `SPEC.md`, `BRAND_GUIDE.md`, `MASTER_PLAN.md`, `skills/`, or `report/` unless a future task explicitly requests it.

## Recommended Next Phase

Next recommended phase: UI/UX review first, then camera self-view.

Suggested order:

1. Run a focused UI/UX review of the completed P0 placeholder MVP.
2. Tighten visual hierarchy, accessibility, empty states, and mobile fit only where needed.
3. Preserve the calm HUD principle: one current keyword, low-emphasis subtitle, non-aggressive cue, and mostly empty center area.
4. After UI/UX review, add camera self-view as a separate phase.
5. Keep recording, audio, STT, MediaPipe, backend, auth, DB, and payment out of scope until later phases.
