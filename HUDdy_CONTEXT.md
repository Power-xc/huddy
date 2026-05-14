# HUDdy Project Context

## Product Definition

HUDdy is an AI speaking navigator for English presentation practice. The product helps a speaker rehearse with a quiet on-screen HUD that shows the current keyword, subtle timing, breath, and flow cues while keeping the center speaking area visually calm.

The product has completed the P0 placeholder MVP, the P0-B camera self-view milestone, the Breath Script HUD Mode, and the P3 usability signal layer. UI/UX polish and keyword progress tracking are also complete.

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
- Live speech recognition via Web Speech API (`useSpeechRecognition` in `src/features/speech`). Transcript shown in HUD subtitle bar. Mic status dot in practice header.
- Keyword detection (`detectKeyword` pure utility, `useKeywordDetection` hook). Auto-advances HUD keyword on speech match with 400 ms visual flash in keyword mode. Auto-advances breath cue when current segment phrase is detected in speech.
- STT transcript saved to `PracticeSession.transcript` at session end.
- Real AI integration: `/api/ai/keywords`, `/api/ai/breath-script`, `/api/ai/report` route handlers using `claude-haiku-4-5-20251001` for keywords/breath and `claude-sonnet-4-6` for report. Activated via `NEXT_PUBLIC_AI_MODE=real`. Mock fallback remains default.
- P3 usability layer: HUD sound cues, spoken keyword extraction from transcript, local MediaPipe-powered camera attention/mouth-movement analysis with fallback sampling, transcript timeline replay, auto/manual keyword progress tracking, and Practice Signal Report are implemented.

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
- `src/features/speech` owns STT (`useSpeechRecognition`) and detection (`detectKeyword`, `useKeywordDetection`).
- Transcript state lives in PracticeScreen local state, not Zustand.
- Transcript is persisted to `PracticeSession.transcript` only at session end.
- Practice signal summaries are persisted to `PracticeSession.practiceSignals` only at session end; raw camera frames are never saved.
- Transcript timeline replay is derived in `useTranscriptTimeline` from final STT text and stored only as text snippets plus matched route keywords.
- Keyword route progress is tracked in PracticeScreen as auto-detected vs manual advance events and persisted only at session end.
- AI routing: `aiCoachAdapter` from `src/entities/adapters/aiAdapter.ts` selects real vs mock based on `NEXT_PUBLIC_AI_MODE`. Import `aiCoachAdapter`, not `mockAiCoachAdapter`, in screens.
- Real AI calls are server-side only through Next.js route handlers. API keys never live in client components.
- `src/features/camera` owns local camera signal analysis (`useCameraSignalAnalysis`). It uses MediaPipe Tasks Vision in the browser when available, falls back to lightweight frame sampling when unavailable, and stores only aggregate scores and feedback text.
- `src/features/hud` owns HUD sound cues (`useHudSoundCue`). Sound cues are playback-only and do not capture audio.

## Important Constraints

- Do not recreate `src/pages`.
- Do not move screens out of `src/screens`.
- Do not move route files out of `src/app`.
- Do not replace `PracticeSession` with another canonical session type.
- Do not use Zustand persist, `createJSONStorage`, or `skipHydration` in P0.
- Do not persist HUD runtime state.
- Do not put timer side effects in `useHUDStore`.
- Camera self-view (getUserMedia, `video` only, `audio: false`) is now part of P0-B scope and is implemented.
- Do not add recorder, raw audio upload, remote video analysis, auth, DB, or payment.
- Do not add shadcn/ui.
- Do not use TypeScript `any`.
- Inline hex colors are forbidden outside token source files.
- Forbidden vision-identification terms must not appear in `src`.
- Transcript state must not be stored in Zustand or persisted mid-session.
- Raw camera frames, images, and streams must not be persisted or uploaded.
- Camera signal analysis must remain local and must not identify a person.
- MediaPipe usage is local browser-side signal analysis only; do not add identity, emotion, or person-identification features.
- `useKeywordDetection` must not be called in breath mode for keyword detection, and must not be called in keyword mode for breath detection.
- Never call Anthropic API directly from client components; use Next.js route handlers.
- `ANTHROPIC_API_KEY` is server-only. `NEXT_PUBLIC_AI_MODE` is the only public AI mode env var.
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
- Practice analyzes camera direction and mouth movement locally with MediaPipe landmarks when available, then falls back to lightweight frame sampling.
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
- Report shows Practice Signal analysis and a recent transcript replay with route keyword highlights when STT data exists.
- Progress shows aggregate keyword detection flow: auto-detected count, manual advance count, auto detection rate, and repeated missed route keywords.
- Report can be exported as a local-only Markdown file from the Report actions.
- Progress reads completed sessions from storage.
- Progress shows completed sessions and routes them to saved reports.
- Empty or corrupted local storage is handled with safe fallbacks.

## What Not To Change

- Do not call real AI APIs directly from client components.
- Do not add recording, raw audio upload, or remote video analysis.
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
- **P1-1 Web Speech API STT** — `useSpeechRecognition` hook, auto-start in PracticeScreen, live subtitle, mic status dot. Continuous with auto-restart.
- **P1-2/3 Keyword detection + auto-advance** — `detectKeyword` utility, `useKeywordDetection` hook, keyword mode auto-advance with 400 ms pulse flash.
- **P1-6 Breath cue auto-advance** — second `useKeywordDetection` call detects current `BreathSegment.text` in speech and calls `nextBreathCue` immediately.
- **P2-1 Transcript persistence** — `PracticeSession.transcript` field; saved at session end so ReportScreen can pass it to AI.
- **P2-2/3/4 Real AI (Claude)** — three Next.js route handlers; `aiCoachAdapter` factory with mock fallback; activated by `NEXT_PUBLIC_AI_MODE=real`.
- **P3 Usability Signals** — HUD sound cues, spoken keyword extraction, local camera attention/mouth-movement analysis, transcript timeline replay, auto/manual keyword progress tracking, and report-side Practice Signal analysis.
- **P3 MediaPipe Local Signals** — browser-only MediaPipe Tasks Vision landmark analysis for camera direction and mouth movement, with fallback sampling when model loading is unavailable.
- **P3 Progressive Keyword Insights** — Progress page shows aggregate auto detection rate, manual advances, and repeated missed route keywords across completed sessions.
- **P3 Local Report Export** — completed reports can be downloaded as Markdown without backend upload.

## Recommended Next Phase

Suggested order:

1. P3: Manual QA on Chrome and Safari for Web Speech API, camera permission, sound cue playback, MediaPipe model loading, and fallback sampling.
2. P3: Calibrate attention/mouth thresholds with real practice samples and adjust scoring copy.
3. P4: Multi-language support — allow memo input and hint display in languages other than Korean.
4. P4: PDF export for report summary if Markdown is not enough.
5. Keep recording, raw audio upload, remote video analysis, backend auth, DB, and payment out of scope until explicitly scoped.
