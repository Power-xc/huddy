# HUDdy Brand Guide

> **작성자:** KK
> **작성일:** 2026-05-13
> **상태:** 확정 (P0 기준)
> **연계 파일:** SPEC.md, skills/브랜드-아이덴티티.md

---

## 1. 브랜드 철학

HUDdy는 발표를 대신하지 않는다. 발표 중 길을 잃지 않도록 시야 위에서 최소한의 cue만 띄운다.

**핵심 은유:** 내비게이션 HUD. 운전자는 여전히 운전한다. HUD는 다음 방향을 조용히 알려줄 뿐.

**비주얼 언어:** Jarvis-style dark glassmorphism. 정보는 공기처럼 존재하고, 발표 흐름을 방해하지 않는다.

---

## 2. Brand Input JSON

```json
{
  "brand_name": "HUDdy",
  "colors": {
    "primary": "#00D4FF",
    "secondary": "#0099BB",
    "accent": "#F59E0B",
    "background": "#0A0F1E",
    "text": "#F1F5F9",
    "error": "#EF4444",
    "success": "#10B981"
  },
  "typography": {
    "font_family_heading": "Pretendard, Inter, sans-serif",
    "font_family_body": "Pretendard, Inter, sans-serif",
    "scale": "compact"
  },
  "spacing": {
    "base_unit": 4,
    "scale": [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24]
  },
  "border_radius": {
    "sm": "6px",
    "md": "12px",
    "lg": "16px",
    "full": "9999px"
  },
  "shadows": {
    "sm": "0 8px 32px 0 rgba(0,0,0,0.40)",
    "md": "0 16px 64px 0 rgba(0,0,0,0.55)",
    "lg": "0 24px 80px 0 rgba(0,0,0,0.65)"
  },
  "extended_tokens": {
    "colors": {
      "background-deep": "#05080F",
      "surface": "#0D1526",
      "surface-glass": "rgba(13, 21, 38, 0.72)",
      "surface-glass-solid": "#0F1B30",
      "line": "rgba(255, 255, 255, 0.08)",
      "line-strong": "rgba(255, 255, 255, 0.16)",
      "text-secondary": "#94A3B8",
      "text-muted": "#475569",
      "primary-cyan-soft": "rgba(0, 212, 255, 0.14)",
      "primary-cyan-solid": "#003D4D",
      "stable-green": "#10B981",
      "stable-green-soft": "rgba(16, 185, 129, 0.14)",
      "warning-amber": "#F59E0B",
      "warning-amber-soft": "rgba(245, 158, 11, 0.14)",
      "danger-red": "#EF4444",
      "danger-red-soft": "rgba(239, 68, 68, 0.14)",
      "route-blue": "#3B82F6",
      "focus-purple": "#8B5CF6"
    },
    "typography": {
      "font_family_mono": "JetBrains Mono, ui-monospace, monospace",
      "font_family_korean_fallback": "Pretendard"
    },
    "shadows": {
      "glow-cyan": "0 0 20px 0 rgba(0,212,255,0.30)",
      "glow-cyan-strong": "0 0 40px 0 rgba(0,212,255,0.45)",
      "glow-amber-soft": "0 0 16px 0 rgba(245,158,11,0.28)",
      "glow-green-soft": "0 0 16px 0 rgba(16,185,129,0.25)"
    },
    "border_radius": {
      "xl": "24px"
    },
    "spacing": {
      "hud-safe-horizontal": "20px",
      "hud-safe-top": "48px",
      "hud-safe-bottom": "64px"
    },
    "motion": {
      "fade-in": "150ms ease-out",
      "fade-out": "120ms ease-in",
      "slide-up": "200ms ease-out",
      "breath-pulse": "3000ms ease-in-out infinite",
      "status-ping": "1500ms ease-in-out infinite",
      "keyword-swap": "250ms ease-out",
      "pace-bar-update": "500ms ease",
      "max-transition": "400ms"
    }
  }
}
```

---

## 3. 색상 시스템

### 3-1. 기본 팔레트

| 토큰 | 값 | 용도 |
|------|----|------|
| `background` | `#0A0F1E` | 전체 배경 (다크 네이비) |
| `background-deep` | `#05080F` | 가장 깊은 배경 — 모달 뒷면, 드롭다운 기반 |
| `surface` | `#0D1526` | 카드, 패널 배경 |
| `surface-glass` | `rgba(13, 21, 38, 0.72)` | glassmorphism 패널 — backdrop-filter 필수 |
| `surface-glass-solid` | `#0F1B30` | glassmorphism 미지원 환경 폴백 |
| `primary` | `#00D4FF` | 사이언 — HUD 주 강조색 (아래 사용 규칙 참고) |
| `secondary` | `#0099BB` | 짙은 사이언 — hover/active 상태 |
| `accent` | `#F59E0B` | 앰버 — 경고, pace 게이지 강조 |
| `text` (text-primary) | `#F1F5F9` | 가장 밝은 텍스트 |
| `text-secondary` | `#94A3B8` | 보조 레이블, 설명 텍스트 |
| `text-muted` | `#475569` | 타임스탬프, placeholder 등 최하위 텍스트 |
| `line` | `rgba(255, 255, 255, 0.08)` | 구분선 — 미세한 경계 |
| `line-strong` | `rgba(255, 255, 255, 0.16)` | 강조 구분선 |

### 3-2. 시맨틱 색상

| 토큰 | 값 | 용도 |
|------|----|------|
| `stable-green` | `#10B981` | 안정적인 pace, 성공 상태 |
| `stable-green-soft` | `rgba(16, 185, 129, 0.14)` | 배지 배경, 소프트 강조 |
| `warning-amber` | `#F59E0B` | 빠른 pace 경고, 주의 |
| `warning-amber-soft` | `rgba(245, 158, 11, 0.14)` | 경고 배지 배경 |
| `danger-red` | `#EF4444` | 매우 빠른 pace, 오류 상태 |
| `danger-red-soft` | `rgba(239, 68, 68, 0.14)` | 오류 배지 배경 |
| `route-blue` | `#3B82F6` | 내비게이션 경로 표시 |
| `focus-purple` | `#8B5CF6` | 집중 모드, 딥포커스 상태 |

### 3-3. 보조 색상 토큰

| 토큰 | 값 | 용도 |
|------|----|------|
| `primary-cyan-soft` | `rgba(0, 212, 255, 0.14)` | 활성 배지 배경, 소프트 강조 |
| `primary-cyan-solid` | `#003D4D` | 배지 테두리, 구분선 강조 |

### 3-4. Glow 효과

| 토큰 | 값 | 적용 조건 |
|------|----|----------|
| `glow-cyan` | `0 0 20px 0 rgba(0,212,255,0.30)` | 활성 키워드 카드, CTA 버튼 |
| `glow-cyan-strong` | `0 0 40px 0 rgba(0,212,255,0.45)` | 발표 중 현재 cue 강조 |
| `glow-amber-soft` | `0 0 16px 0 rgba(245,158,11,0.28)` | pace 경고 시 |
| `glow-green-soft` | `0 0 16px 0 rgba(16,185,129,0.25)` | 안정 pace 확인 시 |

> **Glow 제한 규칙:** 화면당 glow+cyan을 동시에 적용하는 요소는 최대 1개. 여러 요소에 동시 적용 시 시각적 위계 붕괴.

---

## 4. primary-cyan 사용 규칙

`#00D4FF` (primary-cyan)은 강한 시각적 에너지를 가진다. 남용 시 HUD의 조용한 내비게이션 철학을 해친다.

**허용 용도:**
- CTA 버튼 (발표 시작, 다음 단계 진행)
- 현재 키워드 카드 (현재 cue 표시)
- 활성 라우트 (네비게이션 active 상태)
- 포커스 링 (키보드 포커스 상태)

**금지 용도:**
- 본문 텍스트, 긴 설명 문장
- 일반 상태 레이블, 카테고리 태그
- 보조 정보, 타임스탬프
- 비활성 또는 과거 항목의 텍스트

> 일반 텍스트는 `text-primary` (`#F1F5F9`) 또는 `text-secondary` (`#94A3B8`) 사용.

> **text-muted** (`#475569`)는 중요 정보에 절대 사용하지 않는다. 타임스탬프, placeholder, 비활성 hint 전용.

---

## 5. 타이포그래피

### 5-1. 폰트 스택

| 역할 | 폰트 스택 |
|------|----------|
| heading | `Pretendard, Inter, sans-serif` |
| body | `Pretendard, Inter, sans-serif` |
| mono | `JetBrains Mono, ui-monospace, monospace` |

**적용 규칙:**
- 한국어가 포함되는 모든 화면: Pretendard 우선
- 영어 전용 레이블(기술 용어, 단위): Inter 허용
- mono는 HUD 숫자, 타이머, 게이지 수치 전용 — 일반 텍스트에 사용 금지
- Practice Room 포함 모든 화면: Pretendard 우선 (한국어 cue가 언제든 등장 가능)

### 5-2. 타입 스케일 (compact)

| 단계 | 크기 | 행간 | 용도 |
|------|------|------|------|
| `text-xs` | 11px | 16px | 타임스탬프, 메타 레이블 |
| `text-sm` | 13px | 20px | 보조 설명, 태그 |
| `text-base` | 15px | 24px | 본문 — 기본값 |
| `text-lg` | 18px | 28px | 섹션 소제목 |
| `text-xl` | 22px | 32px | 카드 제목 |
| `text-2xl` | 28px | 36px | 페이지 제목 |
| `text-3xl` | 36px | 44px | HUD 메인 키워드 |

---

## 6. 간격(Spacing)

- 기본 단위: `4px`
- 스케일: `0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px`

**HUD 안전 영역:**

| 토큰 | 값 | 의미 |
|------|----|------|
| `hud-safe-horizontal` | `20px` | 좌우 여백 — HUD 패널이 화면 끝에 붙지 않도록 |
| `hud-safe-top` | `48px` | 상단 여백 — 카메라 UI 아래 시작 |
| `hud-safe-bottom` | `64px` | 하단 여백 — 시스템 UI와 충돌 방지 |

---

## 7. 경계 반경(Border Radius)

| 토큰 | 값 | 용도 |
|------|----|------|
| `rounded-sm` | `6px` | 배지, 태그, 인라인 요소 |
| `rounded-md` | `12px` | 버튼, 입력 필드 |
| `rounded-lg` | `16px` | 카드, 패널 |
| `rounded-xl` | `24px` | 모달, 드로어 |
| `rounded-full` | `9999px` | 아이콘 버튼, 아바타 |

---

## 8. 모션(Motion)

**원칙:** HUD는 발표 중 시선을 뺏지 않는다. 전환은 조용하고 빠르게.

| 토큰 | 값 | 용도 |
|------|----|------|
| `fade-in` | `150ms ease-out` | 요소 등장 |
| `fade-out` | `120ms ease-in` | 요소 퇴장 |
| `slide-up` | `200ms ease-out` | 패널 슬라이드 등장 |
| `keyword-swap` | `250ms ease-out` | 키워드 카드 전환 |
| `pace-bar-update` | `500ms ease` | pace 게이지 업데이트 |
| `breath-pulse` | `3000ms ease-in-out infinite` | 호흡 cue 애니메이션 |
| `status-ping` | `1500ms ease-in-out infinite` | 상태 인디케이터 점멸 |
| `max-transition` | `400ms` | 어떤 전환도 이 값을 초과하지 않는다 |

---

## 9. Glassmorphism 구현 규칙

**표준 glassmorphism 패널 스타일:**

```css
background: rgba(13, 21, 38, 0.72);          /* surface-glass */
backdrop-filter: blur(12px) saturate(1.4);
-webkit-backdrop-filter: blur(12px) saturate(1.4);  /* Safari 필수 */
border: 1px solid rgba(255, 255, 255, 0.08); /* line 토큰 */
border-radius: 16px;                          /* rounded-lg */
```

**주의사항:**
- `-webkit-backdrop-filter` 누락 시 Safari에서 투명 배경만 렌더링됨 → 항상 쌍으로 작성
- `backdrop-filter` 미지원 환경에서는 `surface-glass-solid` (`#0F1B30`) 폴백 적용
- `saturate(1.4)` — blur만 적용 시 색상이 칙칙해지는 현상 보정
- Heavy glow(`glow-cyan-strong`)는 화면당 1개 요소에만 — 남용 금지

---

## 10. HUD 레이아웃 원칙

### 10-1. 영역 배치 기준

```
┌─────────────────────────────────────┐
│  [중앙 상단] Primary Prompt         │  ← 현재 키워드 카드 (hud-safe-top 기준)
│                                     │
│         [카메라 self-view]          │  ← 얼굴 중심 영역 — 패널 배치 금지
│                                     │
│  [좌하단] 타이머     [우하단] Pace  │  ← hud-safe-bottom 기준
└─────────────────────────────────────┘
```

### 10-2. 얼굴 중심 시야 보호 규칙

- 카메라 self-view의 얼굴 중심 영역은 비운다.
- Primary Prompt(키워드 카드)는 중앙 상단 또는 중앙 하단 safe zone에만 배치한다.
- 얼굴이 위치할 가능성이 높은 정중앙 영역에는 패널을 배치하지 않는다.
- 중앙 전체 금지가 아니라 **얼굴 중심 시야 보호**가 목적이다.

### 10-3. HUD 핵심 원칙

- 키워드 카드는 1개씩만 표시 — teleprompter(전체 스크립트 스크롤) 절대 금지
- 동시에 표시되는 정보 최대 4가지 (키워드 1 + 타이머 + pace + 자막)
- 자막은 하단에 한 줄만 — 여러 줄 금지
- 발표자가 HUD를 "보지 않아도" 발표가 가능해야 한다 — HUD는 보조, 주역이 아님

---

## 11. 색상 대비 검증 요구사항

구현 전 아래 색상 조합을 WCAG contrast checker로 반드시 검증한다.

| 전경 | 배경 | WCAG 기준 | 검증 시점 |
|------|------|-----------|----------|
| `text-primary` (`#F1F5F9`) | `surface` (`#0D1526`) | AA 이상 | tailwind 토큰 생성 직후 |
| `text-secondary` (`#94A3B8`) | `surface` (`#0D1526`) | AA 이상 | tailwind 토큰 생성 직후 |
| `warning-amber` (`#F59E0B`) | `surface-glass` | AA 이상 | Practice Room 구현 전 |
| `primary-cyan` (`#00D4FF`) | `background` (`#0A0F1E`) | AA 이상 | CTA 버튼 구현 전 |

> 위 수치가 확인되기 전까지 구체 contrast ratio는 문서에 확정값으로 적지 않는다.

> **text-muted** (`#475569`)는 중요 정보에 사용하지 않는다. AA 기준 미달이 예상되므로 타임스탬프, placeholder, 비활성 hint 전용으로 제한한다.

---

## 12. 구현 제약 (P0)

| 규칙 | 내용 |
|------|------|
| 인라인 hex 금지 | 모든 색상은 반드시 토큰으로 참조. `#00D4FF` 직접 사용 불가 |
| 구현 전 brand 스킬 실행 | tailwind.config.ts 또는 @theme inline 토큰 먼저 생성 |
| Tailwind v4 | @theme inline 우선 — shadcn/ui 충돌 시 tailwind.config.ts로 전환 |
| face recognition 표현 금지 | 사용자-facing UI와 코드 변수/함수명에 "face recognition" / "얼굴 인식" 사용 금지. 대신 "face landmarks" 사용 |
| glassmorphism -webkit 쌍 | backdrop-filter와 -webkit-backdrop-filter 항상 함께 |

---

## 13. 관련 파일

```
SPEC.md                        — HUDdy MVP 전체 기능 명세
skills/브랜드-아이덴티티.md   — brand 토큰 생성 스킬 (tailwind 파일 생성)
skills/UI-컴포넌트.md          — 컴포넌트 작성 기준 (HUDdy 토큰 교체 후 사용)
report/deep-research-report.md — HUD UX 원칙, 12주 구조, 기술 스택 근거
```
