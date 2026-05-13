# HUDdy MVP Master Development Plan

```
버전: 0.2
작성자: Claude Code (Plan Mode)
작성일: 2026-05-13
상태: 사용자 승인 완료 — 구현 대기
```

---

## 섹션 0. 문서 정보

| 항목 | 값 |
|------|-----|
| 프로젝트 | HUDdy MVP P0 |
| 목적 | Claude Code(설계·감리) + Codex(구현) 협업 실행 계획 |
| 참조 | SPEC.md, BRAND_GUIDE.md, skills/ 10개, report/deep-research-report.md |
| 제약 | P0 하드 제약 전면 적용 — backend 없음, auth 없음, AI/STT 없음 |
| "face recognition" | 코드·UI 전면 금지. `faceLandmarkAdapter` / `PostureCue` 사용 |

---

## 섹션 1. 아키텍처 미결 사항 확정

SPEC.md 섹션 9의 미결 항목을 모두 결정한다.

| 미결 항목 | 결정 | 근거 |
|----------|------|------|
| Next.js 버전 | **v15** (App Router) | 최신 안정 릴리즈; React 19 준비 |
| shadcn/ui 사용 범위 | **사용 안 함** (P0) | HUDdy 전용 glassmorphism 토큰과 충돌 위험; FSD shared/ui 직접 작성 |
| Tailwind CSS 방식 | **기본 전략: v4 `@theme inline`** (tokens.css). create-next-app 기본 설정 또는 빌드 충돌 시 `tailwind.config.ts theme.extend`로 이전. shadcn/ui는 P0 미사용. | CSS vars 단일 진실 공급원 |
| FSD + App Router 경계 | `app/` = 라우팅 진입점만 (≤5줄/파일). 실제 컴포넌트는 `src/pages/` 이하 | App Router 규칙과 FSD 레이어 분리 |
| P0-B 카메라 착수 시점 | Master Plan P0-G 완료 이후 별도 Task | 지금은 placeholder만 |
| P0-C audio-only 착수 시점 | P0-B 완료 이후 별도 Task | |
| IndexedDB 전환 | localStorage 500KB 초과 시점 | P0에서는 미결 유지 |

---

## 섹션 2. 구현 단계 (P0-A → P0-G)

> SPEC.md의 카메라 P0-A/B/C와 **다른** 개념. Master Plan의 P0-A~G는 전체 앱 구현 페이즈.

| 페이즈 | 이름 | 핵심 산출물 | SPEC 연결 |
|--------|------|------------|----------|
| **P0-A** | Scaffolding | create-next-app, FSD 디렉토리, tokens.css, global layout | — |
| **P0-B** | Design System | GlassCard, Button, 10 공유 타입, StorageAdapter | — |
| **P0-C** | Home + Progress | Home 화면, 12주 ProgressGrid | Home, Progress |
| **P0-D** | Create + Prepare | 세션 생성, 메모 입력, 키워드 카드, Breath Script | Create Session, Prepare |
| **P0-E** | Practice Room | 카메라 placeholder, HUD overlay, 키워드 순차 표시, 타이머 | Practice Room (SPEC P0-A) |
| **P0-F** | Report + Persist | Report 화면, useSessionStore runtime cache, localStorage 전 생애주기 | Report |
| **P0-G** | Integration + QA | 전체 흐름 연결, 과거 세션 재열람, QA 0 에러 통과 | 전체 |

각 페이즈는 `IRESEARCH → IPLAN → 주석/검토 → IEXEC → edge hunt → qa` 사이클로 실행.

---

## 섹션 3. 시스템 아키텍처

```
┌─────────────────────────────────────────────────────┐
│                   Next.js App Router                │
│  app/ (라우팅 진입점만 — ≤5줄/파일)                   │
│    ├── page.tsx              → pages/HomePage        │
│    ├── progress/page.tsx     → pages/ProgressPage    │
│    ├── session/new/page.tsx  → pages/CreateSessionPage│
│    └── session/[id]/                                │
│         ├── prepare/page.tsx  → pages/PreparePage   │
│         ├── practice/page.tsx → pages/PracticePage  │
│         └── report/page.tsx   → pages/ReportPage   │
└─────────────────────────────────────────────────────┘
         ↓ import (단방향)
┌─────────────────────────────────────────────────────┐
│  src/pages/   (화면 조립 — widgets 조합)              │
│  src/widgets/ (복합 UI 섹션)                          │
│  src/features/(비즈니스 로직 + Zustand stores)        │
│    ├── session/   (세션 CRUD, useSessionStore)       │
│    ├── hud/       (HUD 상태, useHUDStore)            │
│    └── prepare/   (키워드/Breath Script 생성)         │
│  src/entities/(도메인 모델 + adapter 인터페이스)       │
│    ├── adapters/  (AICoach, Speech, FaceLandmark,   │
│    │              Storage — 인터페이스 + mock 구현)    │
│    └── models/    (PracticeSession, KeywordCard 등)  │
│  src/shared/  (디자인 시스템, 유틸, 전역 타입)         │
│    ├── ui/        (GlassCard, Button, etc.)          │
│    ├── types/     (session.ts — 10개 타입)            │
│    ├── tokens/    (tokens.css — @theme inline)       │
│    └── lib/       (storage, utils)                   │
└─────────────────────────────────────────────────────┘
```

**P0 저장 원칙:**
- Source of truth: `localStorageAdapter` (localStorage)
- Zustand store: 런타임 UI 상태와 현재 세션 캐시만 담당
- Zustand persist는 P0에서 사용하지 않음

**단방향 import 규칙:** `app → pages → widgets → features → entities → shared`
크로스 레이어 import 절대 금지. `shared`는 어느 레이어에서도 import 가능.

---

## 섹션 4. 데이터 모델 (10개 TypeScript 타입)

파일 경로: `src/shared/types/session.ts`

```typescript
// 세션 카테고리 — SPEC Work/Study/Life/Custom 그대로
type SessionCategory = 'work' | 'study' | 'life' | 'custom'

// 세션 생애주기 상태
type PracticeSessionStatus = 'draft' | 'in-progress' | 'completed'

// HUD에서 순차 표시되는 키워드 카드 1개
type KeywordCard = {
  id: string
  order: number        // 표시 순서 (0-based)
  keyword: string      // 영어 키워드
  hintKo: string       // 한국어 힌트 (준비 화면용)
  isUsed: boolean      // 발표 중 통과했는지 여부
}

// Breath Script 구성 요소 — 슬래시 구분 기반
type BreathSegment = {
  text: string
  isBreathPoint: boolean  // true이면 슬래시(/) 위치 = 호흡 포인트
}

// 전체 Breath Script
type BreathScript = {
  segments: BreathSegment[]
  fullText: string          // 원본 텍스트 (재편집용)
}

// 발표 후 리포트 — mock으로 생성
type SessionReport = {
  strengths: [string, string, string]   // 잘한 점 정확히 3개
  improvements: [string, string]         // 개선점 정확히 2개
  nextWeekMission: string                // 다음 주 미션 1개
  actualDurationSec: number
  keywordsUsedCount: number
}

// 세션 전체 — localStorage에 저장되는 최상위 엔티티
type PracticeSession = {
  id: string                            // crypto.randomUUID()
  title: string
  category: SessionCategory
  targetDurationMin: number
  weekNumber: number                    // 1-12
  memoKo: string                        // 한국어 메모 원문
  keywordCards: KeywordCard[]
  breathScript: BreathScript
  report: SessionReport | null          // 발표 완료 전 null
  status: PracticeSessionStatus
  createdAt: string                     // ISO 8601
  completedAt: string | null
}

// Progress 화면용 경량 요약 (전체 PracticeSession 불러오기 없이 그리드 렌더링)
type PracticeSessionSummary = {
  id: string
  title: string
  category: SessionCategory
  status: PracticeSessionStatus
  weekNumber: number
  completedAt: string | null
}

// Practice Room 실행 중 상태 — 런타임 전용 (새로고침 시 초기화 의도적)
type HUDState = {
  sessionId: string
  currentKeywordIndex: number   // 현재 표시 중인 키워드 인덱스
  elapsedSec: number
  isRunning: boolean
  isPaused: boolean
}

// 앱 전체 설정 — 12주 시작일 기준 주차 계산
type AppConfig = {
  programStartDate: string      // ISO 8601, 12주 기산점
  currentWeek: number           // 1-12, 자동 계산
  totalSessionsCompleted: number
}
```

---

## 섹션 5. 어댑터 경계 (Adapter Boundary)

P0에서는 mock 구현만 사용. P1 이후 실제 구현으로 교체 시 인터페이스 변경 없음.

파일 경로: `src/entities/adapters/`

```typescript
// ── aiCoachAdapter.ts ──────────────────────────────
interface AICoachAdapter {
  generateKeywordCards(
    memoKo: string,
    category: SessionCategory
  ): Promise<KeywordCard[]>

  generateBreathScript(
    memoKo: string,
    keywordCards: KeywordCard[]
  ): Promise<BreathScript>

  generateReport(session: PracticeSession): Promise<SessionReport>
}
// mockAiCoachAdapter.ts: 하드코딩된 mock 데이터 반환, 300ms delay 시뮬레이션

// ── speechAdapter.ts ───────────────────────────────
interface SpeechAdapter {
  startTranscription(audioStream: MediaStream): Promise<void>
  stopTranscription(): Promise<string>
  onPartialResult(callback: (text: string) => void): void
  dispose(): void
}
// P0: mockSpeechAdapter — STT 없음, 자막 placeholder 반환

// ── faceLandmarkAdapter.ts ─────────────────────────
// "face recognition" 표현 금지 — posture cue 감지 용도
type PostureCue = 'centered' | 'too-close' | 'too-far' | 'looking-away'

interface FaceLandmarkAdapter {
  initialize(videoElement: HTMLVideoElement): Promise<void>
  startDetection(): void
  stopDetection(): void
  onPostureCue(callback: (cue: PostureCue) => void): void
  dispose(): void
}
// P0: mockFaceLandmarkAdapter — 'centered' 고정 반환

// ── storageAdapter.ts ──────────────────────────────
interface StorageAdapter {
  getSessions(): PracticeSession[]
  getSession(id: string): PracticeSession | null
  saveSession(session: PracticeSession): void
  updateSession(id: string, partial: Partial<PracticeSession>): void
  deleteSession(id: string): void
  getConfig(): AppConfig
  saveConfig(config: Partial<AppConfig>): void
  clear(): void
}
// localStorageAdapter.ts: localStorage 키 'huddy-sessions', 'huddy-config'
```

---

## 섹션 6. 라우팅 구조

```
/ ───────────────────────── Home (12주 그리드 + 이번 주 미션 + CTA)
/progress ───────────────── Progress (12주 전체 세션 현황)
/session/new ────────────── Create Session (카테고리 + 제목 + 시간)
/session/[id]/prepare ───── Prepare (3-step: 메모 → 키워드 → Breath Script)
/session/[id]/practice ──── Practice Room (HUD + 카메라 placeholder)
/session/[id]/report ────── Report (잘한 점 3 + 개선점 2 + 다음 주 미션)
```

각 `app/` 파일은 해당 `src/pages/` 컴포넌트를 단순 re-export:
```typescript
// app/page.tsx — 5줄 이하
export { HomePage as default } from '@/pages/HomePage'
```

---

## 섹션 7. FSD 컴포넌트 아키텍처

```
src/
├── pages/
│   ├── HomePage/
│   │   ├── index.ts
│   │   └── HomePage.tsx          ← widgets/WeekGrid + widgets/MissionCard 조합
│   ├── ProgressPage/
│   ├── CreateSessionPage/
│   ├── PreparePage/
│   ├── PracticePage/
│   └── ReportPage/
│
├── widgets/
│   ├── WeekGrid/                 ← 12주 그리드 (Home + Progress 공유)
│   ├── SessionCard/              ← 세션 요약 카드
│   ├── HUDOverlay/               ← glassmorphism HUD 컨테이너
│   │   ├── HUDKeywordCard.tsx    ← 현재 키워드 1개 표시
│   │   ├── HUDTimer.tsx          ← 경과 타이머 (JetBrains Mono)
│   │   ├── HUDSubtitle.tsx       ← 자막 placeholder
│   │   └── HUDCuePlaceholder.tsx ← pace/breath cue placeholder
│   ├── KeywordCardList/          ← Prepare Step 2
│   └── BreathScriptView/         ← Prepare Step 3
│
├── features/
│   ├── session/
│   │   ├── model/
│   │   │   └── useSessionStore.ts  ← Zustand, 런타임 캐시만 (persist 없음)
│   │   ├── ui/
│   │   │   └── SessionForm.tsx
│   │   └── index.ts
│   ├── hud/
│   │   ├── model/
│   │   │   └── useHUDStore.ts      ← Zustand, 상태+action만 (persist 없음)
│   │   ├── lib/
│   │   │   └── usePracticeTimer.ts ← setInterval, Date.now() drift 보정
│   │   └── index.ts
│   └── prepare/
│       ├── api/
│       │   └── usePrepareActions.ts ← aiCoachAdapter 호출
│       └── index.ts
│
├── entities/
│   ├── adapters/
│   │   ├── aiCoachAdapter.ts
│   │   ├── mockAiCoachAdapter.ts
│   │   ├── speechAdapter.ts
│   │   ├── mockSpeechAdapter.ts
│   │   ├── faceLandmarkAdapter.ts
│   │   ├── mockFaceLandmarkAdapter.ts
│   │   ├── storageAdapter.ts
│   │   └── localStorageAdapter.ts
│   └── models/
│       └── practiceSession.ts    ← 도메인 생성 헬퍼 함수
│
└── shared/
    ├── ui/
    │   ├── GlassCard/
    │   │   ├── GlassCard.tsx
    │   │   └── index.ts
    │   ├── Button/
    │   │   ├── Button.tsx
    │   │   └── index.ts
    │   └── ... (10개 컴포넌트 타입)
    ├── types/
    │   └── session.ts            ← 섹션 4의 10개 타입
    ├── tokens/
    │   └── tokens.css            ← @theme inline
    ├── styles/
    │   └── globals.css
    └── lib/
        ├── storage.ts            ← localStorageAdapter 인스턴스 export
        └── weekCalc.ts           ← 주차 계산 유틸
```

---

## 섹션 8. 디자인 시스템

### tokens.css (`@theme inline` — 기본 전략)

```css
/* src/shared/tokens/tokens.css */
@theme inline {
  /* ── 색상 ─────────────────────────────── */
  --color-background:      #0A0F1E;
  --color-background-deep: #05080F;  /* primary Button 텍스트 색상용 */
  --color-surface:         rgba(13, 21, 38, 0.72);
  --color-surface-hover:   rgba(13, 21, 38, 0.85);

  /* primary-cyan: CTA, 현재 cue, active route, focus state 전용
     본문/일반 레이블 사용 금지. 화면당 glow+cyan 동시 1개 max */
  --color-primary:         #00D4FF;
  --color-primary-hover:   #00BDE8;
  --color-secondary:       #0099BB;
  --color-accent:          #F59E0B;  /* 앰버 — 경고, 강조 */

  --color-text:            #E2E8F0;
  --color-text-secondary:  #94A3B8;
  --color-text-muted:      #475569;  /* 중요 정보 사용 금지 */

  --color-error:           #EF4444;
  --color-success:         #10B981;
  --color-warning:         #F59E0B;

  /* ── 글로우 ────────────────────────────── */
  --glow-cyan:             0 0 20px 0 rgba(0, 212, 255, 0.30);
  --glow-cyan-strong:      0 0 32px 0 rgba(0, 212, 255, 0.50);

  /* ── 보더 ──────────────────────────────── */
  --color-border:          rgba(0, 212, 255, 0.15);
  --color-border-strong:   rgba(0, 212, 255, 0.35);

  /* ── 폰트 ──────────────────────────────── */
  /* Pretendard 전체 기본; Inter는 영어 전용 레이블만; mono는 HUD 숫자/타이머 */
  --font-heading: 'Pretendard', 'Inter', sans-serif;
  --font-body:    'Pretendard', 'Inter', sans-serif;
  --font-mono:    'JetBrains Mono', 'Courier New', monospace;

  /* ── HUD safe zone ─────────────────────── */
  --hud-safe-x:      20px;
  --hud-safe-top:    48px;   /* 상단 HUD 영역 */
  --hud-safe-bottom: 64px;   /* 하단 HUD 영역 */
  /* 중앙 얼굴 시야 보호 — Primary Prompt는 중앙 상단/하단 safe zone에만 */

  /* ── 모션 ──────────────────────────────── */
  --motion-keyword-swap: 250ms;
  --motion-breath-pulse: 3000ms;
  --motion-max:          400ms;
}
```

> Tailwind v4 빌드 충돌 발생 시: `tailwind.config.ts`의 `theme.extend`에 동일 값으로 이전.

### GlassCard glassmorphism 패턴

```typescript
// GlassCard.tsx — glassmorphism 필수 패턴
// Safari backdropFilter 쌍 필수 — 절대 한 쪽만 작성하지 않음
const glassStyle = {
  background: 'var(--color-surface)',
  backdropFilter: 'blur(12px) saturate(1.4)',
  WebkitBackdropFilter: 'blur(12px) saturate(1.4)',  // Safari 필수
  border: '1px solid var(--color-border)',
}
```

### 공유 컴포넌트 10개 타입

| # | 컴포넌트 | 위치 | 설명 |
|---|---------|------|------|
| 1 | GlassCard | shared/ui/GlassCard | glassmorphism 카드 컨테이너 |
| 2 | Button | shared/ui/Button | primary/secondary/ghost variant |
| 3 | Badge | shared/ui/Badge | 카테고리/상태 표시 |
| 4 | ProgressDot | shared/ui/ProgressDot | 12주 그리드 단일 셀 |
| 5 | KeywordPill | shared/ui/KeywordPill | 키워드 카드 Prepare 화면용 |
| 6 | BreathText | shared/ui/BreathText | 슬래시 기반 Breath Script 렌더 |
| 7 | Timer | shared/ui/Timer | HUD 타이머 (JetBrains Mono) |
| 8 | CueDot | shared/ui/CueDot | HUD pace/breath 상태 점 |
| 9 | SubtitleBar | shared/ui/SubtitleBar | HUD 자막 placeholder |
| 10 | ReportBlock | shared/ui/ReportBlock | Report 섹션 블록 |

---

## 섹션 9. 25-task Codex 로드맵 + 페이스트-레디 프롬프트

### 파트 A: P0-A — Scaffolding

---

**T01 | P0-A | create-next-app + FSD 디렉토리**

```
[Codex 프롬프트 T01]
Context:
- 프로젝트: HUDdy MVP P0 — 영어 발표 코칭 앱
- 프레임워크: Next.js v15, App Router, TypeScript strict
- 폴더 구조: FSD (Feature-Sliced Design)
- 현재 프로젝트 루트에 SPEC.md, BRAND_GUIDE.md, MASTER_PLAN.md, skills/, report/ 이미 존재

Task: 아래 순서대로 실행. 기존 파일 오염 금지.

Steps:
1. /tmp/huddy-next-template 디렉토리에 create-next-app 실행
   npx create-next-app@latest /tmp/huddy-next-template \
     --typescript --tailwind --app --src-dir \
     --import-alias "@/*"
   (디렉토리명은 lowercase npm-safe 이름 사용)

2. /tmp/huddy-next-template/package.json에서 name 필드를 "huddy"로 수정
   (npm-safe lowercase 이름 필수)

3. /tmp/huddy-next-template/ → 현재 HUDdy 프로젝트 루트로 복사
   복사 제외 항목:
   - .git/
   - node_modules/ (있을 경우)
   복사 후 반드시 보존 확인:
   - SPEC.md ✓
   - BRAND_GUIDE.md ✓
   - MASTER_PLAN.md ✓
   - skills/ ✓
   - report/ ✓

4. src/ 아래 FSD 디렉토리 생성:
   pages/ widgets/ features/ entities/ shared/
   shared/ 아래: ui/ types/ tokens/ styles/ lib/
   features/ 아래: session/ hud/ prepare/
   entities/ 아래: adapters/ models/

5. 각 빈 디렉토리에 .gitkeep 추가

6. app/ 디렉토리: Next.js App Router 라우팅 파일만 — 실제 컴포넌트 금지

Constraints:
- any 타입 금지
- 파일 300줄 초과 금지
- app/ 파일은 5줄 이하 (해당 pages/ 컴포넌트 re-export만)
- TypeScript strict: true 유지
```

---

**T02 | P0-A | Tailwind v4 + CSS custom properties**

```
[Codex 프롬프트 T02]
Context: T01 완료 상태. Next.js v15, Tailwind v4.
기본 전략: @theme inline. 빌드 충돌 시 tailwind.config.ts theme.extend로 이전.

Task: HUDdy 브랜드 토큰을 CSS @theme inline으로 정의한다.

File: src/shared/tokens/tokens.css

Content: MASTER_PLAN.md 섹션 8 tokens.css 전문 그대로 사용.
(--color-background-deep: #05080F 포함)

src/shared/styles/globals.css에서 tokens.css를 import.
인라인 hex 색상 절대 사용 금지 — CSS var()만 사용.
```

---

**T03 | P0-A | Global layout + 폰트 로딩**

```
[Codex 프롬프트 T03]
Context: T02 완료. tokens.css 정의됨.

Task: app/layout.tsx에서 Pretendard, JetBrains Mono 폰트를 로드하고
전체 배경색(--color-background)을 적용하는 루트 레이아웃을 구성한다.

- Pretendard: CDN (jsDelivr) 또는 next/font/local
- JetBrains Mono: Google Fonts (next/font/google)
- body: font-family var(--font-body), background var(--color-background), color var(--color-text)
- metadata: title "HUDdy", description "영어 발표 코칭 HUD"
```

---

### 파트 B: P0-B — Design System

---

**T04 | P0-B | GlassCard 공유 컴포넌트**

```
[Codex 프롬프트 T04]
Context: T03 완료. tokens.css 사용 가능.

Task: src/shared/ui/GlassCard/GlassCard.tsx 작성.

Props: { children: React.ReactNode; className?: string; onClick?: () => void }

Style (필수 — 절대 변경 금지):
  background: var(--color-surface)
  backdropFilter: blur(12px) saturate(1.4)
  WebkitBackdropFilter: blur(12px) saturate(1.4)   ← Safari 필수, 절대 생략 금지
  border: 1px solid var(--color-border)
  borderRadius: 12px

인라인 hex 금지. CSS var()만.
index.ts barrel export 포함.
```

---

**T05 | P0-B | Button 공유 컴포넌트**

```
[Codex 프롬프트 T05]
Context: T04 완료.

Task: src/shared/ui/Button/Button.tsx 작성.

Props: {
  variant: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
}

primary:   background var(--color-primary), color var(--color-background-deep)
           (인라인 hex 금지 — 반드시 CSS var() 사용)
secondary: border var(--color-border-strong), color var(--color-text)
ghost:     background transparent, color var(--color-text-secondary)

index.ts barrel export 포함.
any 타입 금지.
```

---

**T06 | P0-B | shared/types/session.ts — 10개 타입**

```
[Codex 프롬프트 T06]
Context: T05 완료.

Task: src/shared/types/session.ts에 MASTER_PLAN.md 섹션 4의 10개 타입을 정확히 작성.

핵심 타입명:
- PracticeSession (Session 아님)
- PracticeSessionSummary
- PracticeSessionStatus
- KeywordCard, BreathSegment, BreathScript, SessionReport, HUDState, AppConfig, SessionCategory

주의:
- any 타입 금지
- 모든 타입 export
- 파일 300줄 미만
```

---

**T07 | P0-B | StorageAdapter + localStorageAdapter**

```
[Codex 프롬프트 T07]
Context: T06 완료. PracticeSession, AppConfig 타입 사용 가능.

Task:
1. src/entities/adapters/storageAdapter.ts — StorageAdapter 인터페이스 정의
   (PracticeSession 기준으로 작성 — MASTER_PLAN.md 섹션 5 전문)
2. src/entities/adapters/localStorageAdapter.ts — localStorage 구현체
   - localStorage key: 'huddy-sessions' (PracticeSession[]), 'huddy-config' (AppConfig)
   - JSON.parse/stringify 사용
   - 파싱 실패 시 빈 배열/기본값 반환 (localStorage 접근 실패 대비)
3. src/shared/lib/storage.ts — localStorageAdapter 싱글턴 export
   export const storage: StorageAdapter = new LocalStorageAdapter()

any 타입 금지. SSR 환경(typeof window === 'undefined') 가드 필수.
```

---

### 파트 C: P0-C — Home + Progress

---

**T08 | P0-C | Home 화면**

```
[Codex 프롬프트 T08]
Context: T07 완료. storage, PracticeSession, AppConfig 사용 가능.

Task: src/pages/HomePage/HomePage.tsx 작성.

표시 내용:
1. "HUDdy" 로고 텍스트 (color: var(--color-primary), font-family: var(--font-heading))
2. 12주 그리드 (WeekGrid 위젯 — T09에서 작성하므로 placeholder 가능)
3. 이번 주 완료 세션 수 / 목표 세션 수
4. "새 세션 시작" CTA Button (primary variant, /session/new로 이동)

데이터: storage.getSessions()로 localStorage에서 불러오기.
SSR/CSR 분리: useEffect에서 데이터 로드 (localStorage는 클라이언트 전용).
```

---

**T09 | P0-C | ProgressGrid + Progress 화면**

```
[Codex 프롬프트 T09]
Context: T08 완료.

Task:
1. src/widgets/WeekGrid/WeekGrid.tsx — 12주 × n세션 그리드 컴포넌트
   Props: { sessions: PracticeSessionSummary[]; onSessionClick: (id: string) => void }
   완료 세션: 초록 dot (var(--color-success))
   미완료: 빈 dot
   draft: 회색 dot

2. src/pages/ProgressPage/ProgressPage.tsx
   - 전체 12주 그리드 표시
   - 세션 클릭 → /session/[id]/report 이동 (과거 리포트 재열람)
   - 총 완료 세션 수, 주차별 미션 표시 (mock 텍스트 허용)

app/progress/page.tsx: ProgressPage re-export.
```

---

### 파트 D: P0-D — Create Session + Prepare

---

**T10 | P0-D | Create Session 화면**

```
[Codex 프롬프트 T10]
Context: T09 완료. storage 사용 가능.

Task: src/pages/CreateSessionPage/CreateSessionPage.tsx 작성.

UI:
1. 카테고리 선택 (work / study / life / custom) — GlassCard 기반 선택 버튼
2. 세션 제목 입력 필드
3. 예상 발표 시간 선택 (3분 / 5분 / 7분 / 10분)
4. "준비하기" 버튼 — 클릭 시 storage.saveSession(newSession) 후 /session/[id]/prepare 이동

newSession 생성:
- id: crypto.randomUUID()
- status: 'draft'
- weekNumber: AppConfig.currentWeek
- createdAt: new Date().toISOString()
- report: null
- 타입: PracticeSession
```

---

**T11 | P0-D | aiCoachAdapter + mockAiCoachAdapter**

```
[Codex 프롬프트 T11]
Context: T10 완료. KeywordCard, BreathScript, PracticeSession 타입 사용 가능.

Task:
1. src/entities/adapters/aiCoachAdapter.ts — AICoachAdapter 인터페이스 정의
2. src/entities/adapters/mockAiCoachAdapter.ts — mock 구현체

mockAiCoachAdapter 동작:
- generateKeywordCards: 300ms delay 후 5~7개 하드코딩 키워드 반환
- generateBreathScript: 200ms delay 후 슬래시 기반 mock 스크립트 반환
- generateReport: 500ms delay 후 잘한 점 3/개선점 2/다음 미션 1 반환

any 타입 금지.
```

---

**T12 | P0-D | Prepare Step 1 — 한국어 메모 입력**

```
[Codex 프롬프트 T12]
Context: T11 완료.

Task: PreparePage Step 1 구현.

Step 1 UI:
- "오늘 발표할 내용을 한국어로 자유롭게 적어주세요" 안내 텍스트
- textarea (최소 4줄, 최대 500자)
- 현재 글자 수 표시 (var(--color-text-secondary))
- "키워드 카드 생성" 버튼 — mockAiCoachAdapter.generateKeywordCards() 호출
- 로딩 중 버튼 비활성화

3-step 진행 상태 표시 (Step 1/2/3).
```

---

**T13 | P0-D | Prepare Step 2 — 키워드 카드 확인·편집**

```
[Codex 프롬프트 T13]
Context: T12 완료. KeywordCard 타입 사용 가능.

Task: PreparePage Step 2 구현.

UI:
- 생성된 키워드 카드 5~7개 표시 (GlassCard 기반)
- 각 카드: 영어 키워드 (크게, var(--color-text)) + 한국어 힌트 (작게, var(--color-text-secondary))
- 카드 순서: 위/아래 화살표 버튼으로 변경
- 키워드 텍스트 직접 편집 (input)
- "Breath Script 보기" 버튼 — mockAiCoachAdapter.generateBreathScript() 호출
```

---

**T14 | P0-D | Prepare Step 3 — Breath Script 확인**

```
[Codex 프롬프트 T14]
Context: T13 완료. BreathScript 타입 사용 가능.

Task: PreparePage Step 3 구현.

UI:
- BreathScript 표시: 슬래시(/) 위치에 var(--color-accent) 강조 마커
- "발표 시작" 버튼 — storage.updateSession(id, { status: 'in-progress', keywordCards, breathScript })
  후 /session/[id]/practice 이동
```

---

### 파트 E: P0-E — Practice Room HUD

---

**T15 | P0-E | Practice Room 레이아웃 (카메라 placeholder)**

```
[Codex 프롬프트 T15]
Context: T14 완료.

Task: src/pages/PracticePage/PracticePage.tsx 레이아웃 구성.

레이아웃:
- 전체 화면 (100vw × 100vh)
- 중앙: 카메라 placeholder (div, 어두운 배경, 회색 테두리, "Camera" 텍스트)
  — getUserMedia 없음 (SPEC P0-A)
- 위에 HUDOverlay 절대 위치로 오버레이 (T16)
- 우상단: "완료" 버튼 (ghost variant)

PracticePage는 usePracticeTimer(T20B)를 호출만 한다 — setInterval 직접 관리 금지.
```

---

**T16 | P0-E | HUDOverlay 컨테이너 + glassmorphism**

```
[Codex 프롬프트 T16]
Context: T15 완료. GlassCard, tokens.css 사용 가능.

Task: src/widgets/HUDOverlay/ 구현.

HUD 영역 배치:
- 중앙 상단 (top: var(--hud-safe-top), left: 50%, translateX(-50%)): 현재 키워드 카드 (T17)
- 중앙 하단 (bottom: var(--hud-safe-bottom), left: 50%): 자막 placeholder (T19)
- 좌하단 (bottom: var(--hud-safe-bottom), left: var(--hud-safe-x)): 타이머 (T18)
- 우하단 (bottom: var(--hud-safe-bottom), right: var(--hud-safe-x)): cue placeholder (T19)

전체 오버레이:
- position: absolute, inset: 0, pointerEvents: none
- HUD 요소 각각은 pointerEvents: auto

전체 스크립트 스크롤 금지 — 키워드 1개만. 얼굴 중심 시야 보호.
```

---

**T17 | P0-E | HUDKeywordCard — 순차 표시**

```
[Codex 프롬프트 T17]
Context: T16 완료. KeywordCard 타입 사용 가능.

Task: src/widgets/HUDOverlay/HUDKeywordCard.tsx

Props: { currentCard: KeywordCard | null; onNext: () => void }

UI:
- GlassCard 안에 키워드 텍스트 (var(--color-primary), var(--font-heading))
- "다음" 버튼 또는 스페이스바로 다음 키워드 이동
- 카드 전환: opacity fade, duration var(--motion-keyword-swap)
- 마지막 카드 이후: onNext로 완료 신호

전체 스크립트 없음 — 카드 1개만.
```

---

**T18 | P0-E | HUDTimer**

```
[Codex 프롬프트 T18]
Context: T16 완료.

Task: src/widgets/HUDOverlay/HUDTimer.tsx

Props: { elapsedSec: number; targetDurationMin: number }

UI:
- mm:ss 형식 (var(--font-mono), JetBrains Mono)
- 목표 시간 초과 시 color: var(--color-accent)
- glassmorphism 배경 (GlassCard)
```

---

**T19 | P0-E | HUDCuePlaceholder + HUDSubtitle**

```
[Codex 프롬프트 T19]
Context: T16 완료.

Task:
1. src/widgets/HUDOverlay/HUDSubtitle.tsx — 자막 placeholder, glassmorphism, 중앙 하단
2. src/widgets/HUDOverlay/HUDCuePlaceholder.tsx — pace/breath cue 정적 UI, glassmorphism, 우하단

"face recognition" 관련 변수명/함수명/UI 텍스트 절대 금지.
```

---

**T20 | P0-E | useHUDStore Zustand (상태+action만)**

```
[Codex 프롬프트 T20]
Context: T19 완료. HUDState 타입 사용 가능.

Task: src/features/hud/model/useHUDStore.ts

Zustand store — 상태와 action만 관리. persist 없음. setInterval 없음.

state: HUDState (sessionId, currentKeywordIndex, elapsedSec, isRunning, isPaused)

actions:
- startSession(sessionId: string, keywordCards: KeywordCard[]): void
- nextKeyword(): void     — currentKeywordIndex += 1
- pauseResume(): void     — isRunning 토글
- tick(): void            — elapsedSec += 1 (usePracticeTimer에서 호출)
- endSession(): void      — isRunning: false

any 타입 금지. 함수 100줄 미만.
```

---

**T20B | P0-E | usePracticeTimer hook**

```
[Codex 프롬프트 T20B]
Context: T20 완료. useHUDStore 사용 가능.

Task: src/features/hud/lib/usePracticeTimer.ts

커스텀 훅 — setInterval 담당. useHUDStore와 분리.

동작:
- isRunning이 true일 때만 setInterval 실행
- Date.now() 기반 drift 보정:
  startTimeRef에 시작 시각 기록
  매 tick에서 실제 경과 시간 계산 (단순 카운터 대신)
- unmount 시 clearInterval 필수
- isRunning 변경 시 interval 재시작/정지

PracticePage는 usePracticeTimer()를 호출만 한다.
```

---

### 파트 F: P0-F — Report + Persistence

---

**T21 | P0-F | Report 화면**

```
[Codex 프롬프트 T21]
Context: T20B 완료. storage, SessionReport 사용 가능.

Task: src/pages/ReportPage/ReportPage.tsx

표시 내용:
1. 잘한 점 3가지 (var(--color-success) 아이콘)
2. 개선점 2가지 (var(--color-accent) 아이콘)
3. 다음 주 미션 1가지 (var(--color-primary) 강조)
4. 실제 발표 시간 (mm:ss)
5. "저장하고 홈으로" → storage.updateSession(id, { report, status: 'completed', completedAt }) 후 / 이동
6. "다시 연습" → /session/[id]/prepare 이동

과거 세션 재열람: 저장된 report 표시, 편집 버튼 없음.
```

---

**T22 | P0-F | useSessionStore runtime cache + session lifecycle helpers**

```
[Codex 프롬프트 T22]
Context: T21 완료. PracticeSession, storage 사용 가능.

Task: src/features/session/model/useSessionStore.ts

Zustand store — 런타임 UI 캐시 전용. persist 없음.
Source of truth는 localStorageAdapter (storage).

state:
- sessions: PracticeSession[]
- currentSession: PracticeSession | null

actions:
- loadSessions(): void        — storage.getSessions() → state 갱신
- createSession(data): void   — storage.saveSession() + state 갱신
- updateSession(id, partial): void — storage.updateSession() + state 갱신
- selectSession(id): void     — currentSession 설정

클라이언트 마운트 후 useEffect에서 loadSessions() 호출.
any 타입 금지.
```

---

### 파트 G: P0-G — Integration + QA

---

**T23 | P0-G | 전체 흐름 연결 + 과거 세션 재열람**

```
[Codex 프롬프트 T23]
Context: T22 완료. 모든 페이지 구현 완료.

Task: 전체 사용자 흐름 연결 검증 및 누락 연결 수정.

체크리스트:
1. Home → /session/new 이동 확인
2. CreateSession → /session/[id]/prepare 이동 + PracticeSession 생성 확인
3. Prepare Step 1→2→3 순차 이동 확인
4. Prepare Step 3 "발표 시작" → /session/[id]/practice 이동 확인
5. PracticeRoom "완료" → /session/[id]/report 이동 + report 생성 확인
6. Report "저장하고 홈으로" → / 이동 + localStorage 저장 확인
7. Progress 화면 세션 클릭 → /session/[id]/report 재열람 확인
8. 브라우저 뒤로가기 동작 확인
```

---

**T24 | P0-G | QA 체크리스트 실행**

```
[Codex 프롬프트 T24]
Context: T23 완료.

Task: @qa blind-test http://localhost:3000 실행.

SPEC 섹션 5 성공 기준 전체 확인:
1. Home → Create → Prepare → Practice → Report → Progress 흐름 완주
2. PracticeSession 생성 → localStorage 저장 → 재열람
3. HUD: 전체 스크립트 스크롤 없음
4. HUD: 키워드 카드 1개씩 순차 표시
5. HUD: glassmorphism 다크 오버레이 적용
6. Report: 잘한 점 3 + 개선점 2 + 다음 주 미션 1
7. Progress: 12주 그리드 + 완료 세션 반영
8. 브라우저 콘솔 에러 0개
9. grep "face recognition" → 0건
10. grep "any" (TS) → 0건 (tsc --noEmit clean)
```

---

**T25 | P0-G | usePracticeTimer drift 검증**

```
[Codex 프롬프트 T25]
Context: T24 완료.

Task: usePracticeTimer의 Date.now() 기반 drift 보정 검증.

확인:
- 1분 발표 후 HUDTimer 표시값이 실제 경과 시간과 ±1초 이내인지 확인
- 탭 비활성화 후 복귀 시 타이머 상태 확인 (isRunning 유지 여부)
- PracticePage unmount 시 clearInterval 실행 확인 (메모리 누수 없음)
```

---

## 섹션 10. 리스크 레지스터

| # | 리스크 | 가능성 | 영향 | 대응 |
|---|--------|--------|------|------|
| R1 | Tailwind v4 `@theme inline`과 Next.js v15 빌드 충돌 | 중 | 고 | `tailwind.config.ts theme.extend`로 폴백, 동일 값 유지 |
| R2 | SSR/CSR 불일치로 localStorage 접근 오류 | 고 | 고 | `typeof window` 가드. useEffect에서만 storage 로드 |
| R3 | GlassCard backdrop-filter Safari 렌더링 실패 | 중 | 중 | `-webkit-backdrop-filter` 쌍 항상 병기. 절대 한 쪽만 작성 금지 |
| R4 | FSD 크로스 레이어 import 실수 | 중 | 중 | eslint-plugin-boundaries 도입 검토. import 경로 우선 확인 |
| R5 | localStorage 500KB 한계 초과 | 저 | 중 | 세션 최대 50개 제한. P1에서 IndexedDB 전환 |
| R6 | usePracticeTimer setInterval drift | 중 | 저 | Date.now() 기반 보정 (T20B). T25에서 검증 |
| R7 | Codex가 `any` 타입 사용 | 고 | 중 | tsconfig `"strict": true`. T24 QA에서 tsc --noEmit 확인 |
| R8 | "face recognition" 문자열 코드 유입 | 저 | 고 | T24 QA grep 필수. PR 체크리스트에 포함 |

---

## 섹션 11. QA 체크리스트

### 기능 QA

```
[ ] Home: 12주 그리드, 이번 주 미션, "새 세션 시작" CTA
[ ] Create Session: 카테고리→제목→시간→"준비하기" 동작
[ ] Prepare Step 1: 메모 입력 → mock 키워드 카드 5~7개
[ ] Prepare Step 2: 카드 순서 변경, 편집, "Breath Script 보기"
[ ] Prepare Step 3: Breath Script → "발표 시작"
[ ] Practice Room: 카메라 placeholder, HUD overlay 표시
[ ] HUD: 키워드 카드 1개씩 (전체 스크립트 없음)
[ ] HUD: "다음" 또는 스페이스바로 카드 전환
[ ] HUD: 타이머 mm:ss 포맷, drift 보정 동작
[ ] HUD: 완료 후 Report 이동
[ ] Report: 잘한 점 3 + 개선점 2 + 다음 주 미션 1
[ ] Report "저장하고 홈으로": localStorage 저장 + Home 이동
[ ] Report "다시 연습": Prepare 이동
[ ] Progress: 12주 그리드, 완료 세션 반영, 클릭→Report 재열람
```

### 기술 QA

```
[ ] 브라우저 콘솔 에러 0개
[ ] localStorage 저장·불러오기 (새로고침 후 세션 유지)
[ ] SSR 하이드레이션 오류 없음
[ ] Safari: glassmorphism backdrop-filter 정상 렌더링
[ ] GlassCard WebkitBackdropFilter 누락 grep → 0건
[ ] grep "face recognition" → 0건 (코드 파일)
[ ] grep "얼굴 인식" → 0건 (코드 파일)
[ ] TypeScript any 타입 0건 (tsc --noEmit clean)
[ ] 파일 300줄 초과 파일 없음
[ ] 함수 100줄 초과 함수 없음
[ ] Button primary color: var(--color-background-deep), hex 금지
```

---

## 섹션 12. Definition of Done (P0)

```
[ ] SPEC.md 섹션 5 성공 기준 전체 통과
[ ] T01~T25 전체 완료
[ ] QA 체크리스트 전체 통과
[ ] 콘솔 에러 0개
[ ] "face recognition" / "얼굴 인식" 코드/UI 전무
[ ] any 타입 0건 (tsc --noEmit clean)
[ ] localStorage: PracticeSession 생성 → 저장 → 재열람 동작
[ ] Practice Room HUD: glassmorphism 다크 오버레이 시각 확인
[ ] Report: 잘한 점 3 + 개선점 2 + 다음 주 미션 1
[ ] Progress: 12주 그리드 완료 세션 반영
[ ] SPEC P0-A 카메라 placeholder 구현 완료
[ ] SPEC P0-B(getUserMedia), P0-C(audio-only): 별도 Task 분리 — 미구현
```

---

## 섹션 13. 다음 단계 (P1 이후)

| 단계 | 내용 | 전제 조건 |
|------|------|-----------|
| SPEC P0-B | getUserMedia 기반 카메라 self-view | P0 DoD 통과 |
| SPEC P0-C | audio-only 녹화 | SPEC P0-B 완료 |
| P1 | OpenAI Whisper STT 연동 → 실제 자막 | P0 완료 |
| P1 | mockAiCoachAdapter → 실제 GPT-4o | P0 완료 |
| P1 | mockFaceLandmarkAdapter → MediaPipe | P0 완료 |
| P1 | Zustand persist 도입 (skipHydration: true) | P0 완료 |
| P2 | IndexedDB 전환 (localStorage 한계 도달 시) | P1 완료 |
| P2 | Supabase 연동 (다중 기기 동기화) | P1 완료 |

---

## Appendix A. HUDdy 제품 원칙 10개

1. **Navigation, not teleprompter** — HUD는 전체 스크립트를 보여주지 않는다. 키워드 1개 + 상태만.
2. **Minimum viable cue** — 발표자의 시야를 최소한만 점유한다. 덜 보여줄수록 좋다.
3. **Practice makes permanent** — 연습이 실력을 굳힌다. 단기 암기가 아닌 12주 루틴.
4. **Fail safe locally** — 인터넷 없이도 동작. localStorage만으로 전체 흐름 완주.
5. **Mock first, integrate later** — 실제 AI 없이도 훈련 구조를 먼저 검증.
6. **Face center is sacred** — 얼굴 중심 시야는 보호 구역. UI 요소 배치 금지.
7. **One keyword at a time** — 멀티태스킹 불가. 지금 이 키워드에만 집중.
8. **Timer is truth** — 발표 시간을 속이지 않는다. 타이머는 항상 보인다.
9. **Report is a mirror** — 리포트는 평가가 아닌 거울. 잘한 것을 먼저 보여준다.
10. **Yours alone** — 영상·얼굴 데이터는 서버에 올라가지 않는다. 완전히 로컬.

---

## Appendix B. HUDdy 개발 원칙 15개

1. **any 타입 절대 금지** — TypeScript strict. unknown으로 좁혀라.
2. **파일 300줄 제한** — 초과 시 즉시 분리.
3. **함수 100줄 제한** — 초과 시 즉시 분리.
4. **순환 복잡도 ≤ 8** — 중첩 if/switch 최소화.
5. **파라미터 ≤ 5** — 초과 시 객체로 묶어라.
6. **중첩 ≤ 2** — 조기 반환(early return) 우선.
7. **인라인 hex 금지** — CSS var() 또는 Tailwind 토큰만.
8. **한국어 주석: WHY만** — WHAT은 코드 자체가 설명.
9. **FSD 단방향 import** — app → pages → widgets → features → entities → shared.
10. **크로스 레이어 import 금지** — features에서 pages를 import하지 않는다.
11. **barrel export 필수** — 각 feature/shared/ui에 index.ts.
12. **Safari 쌍 필수** — backdropFilter + WebkitBackdropFilter 항상 함께.
13. **SSR 가드 필수** — localStorage 접근은 typeof window !== 'undefined' 확인.
14. **Zustand persist는 P1 이후** — P0 store는 런타임 캐시만. skipHydration은 persist 도입 시 적용.
15. **"face recognition" 코드 금지** — faceLandmarkAdapter / PostureCue 사용.
