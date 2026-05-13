<!-- 파일: skills/프로덕트/UI-컴포넌트.md | 스킬: UI Component Builder | 부서: 프로덕트부 | ID: ui -->

# UI 컴포넌트 빌더 스킬 (UI Component Builder Skill)

> **담당:** 프로덕트부
> **Tier:** 2 (Claude Sonnet)
> **Skill ID:** `ui`

## Purpose

IPAI 디자인 시스템 토큰을 기반으로 프로덕션 레디 TSX 컴포넌트를 생성한다.
색상·간격·타이포그래피·애니메이션 규칙을 자동 적용해 디자인 일관성을 보장한다.
디자이너가 Figma에서 설계한 패턴을 코드로 정확히 변환하는 것이 핵심 역할.

## Trigger

- `@ui build <컴포넌트명>` 명령 호출 시
- Figma 디자인 링크와 함께 "이거 구현해줘" 요청 시
- 기존 컴포넌트 리팩토링 (`@ui refactor <파일경로>`) 시

## 디자인 시스템 토큰 (내장)

> 이 섹션은 AI가 컴포넌트 생성 시 참조하는 기준값이다. 별도 파일을 읽지 않아도 된다.

### 색상

```
-- Primary (Sage) --
sage-50:    #F0F7F4   (라이트 배경, 구분 영역)
sage-light: #EBF5F0   (버튼 라이트 배경, 아이콘 원, 배지 배경)
sage:       #5BAD92   (주 색상: 버튼, 배지, 진행바, 금액 텍스트)
sage-dark:  #3E9070   (호버, 포커스, 그라디언트 끝)

-- Neutral (Gray) --
surface:    #F8FAF9   (앱 기본 배경)
gray-50:    #F9FAFB   (카드 내부 극소 구분)
gray-100:   #F3F4F6   (테두리, 비활성 배경)
gray-200:   #E5E7EB   (구분선, 비활성 진행바)
gray-400:   #9CA3AF   (보조 텍스트: 날짜, 헬퍼)
gray-500:   #6B7280   (일반 보조 텍스트)
gray-600:   #4B5563   (본문 텍스트)
gray-900:   #1C1C1E   (헤딩, 강조 텍스트)

-- 다크 배경 --
dark-hero:  #0A0A0A   (히어로/CTA 섹션)
dark-card:  #1a1a1a   (AI 감시 배너, 프로필 카드)

-- 상태 컬러 --
blue-50 / blue-500 / blue-700   (공고 예정)
orange-50 / orange-500 / orange-700  (마감임박, 경고)
red-50 / red-400 / red-500      (에러, 탈락)
(success는 별도 녹색 없음 → sage 사용)

-- 글래스 (다크 배경 위) --
카드 배경:  rgba(255,255,255,0.07~0.10)
테두리:     rgba(255,255,255,0.12~0.18)
인셋 빛:    rgba(255,255,255,0.14~0.20)
Sage 글로우: rgba(91,173,146,0.30~0.55)
```

### 타이포그래피

```
폰트: Pretendard (한국어/영문 통일)

크기 스케일:
  64px / 900   히어로 헤딩      letter-spacing: -0.03em
  34~40px / 800-900  섹션 헤딩  letter-spacing: -0.02em
  24~28px / 700-800  서브 섹션 제목
  20~22px / 800-900  카드 주요 수치 (금액)
  17~20px / 700-800  카드 제목
  15~16px / 600-700  버튼, 중요 본문
  13~14px / 400-600  일반 본문
  12px / 500-600     작은 보조 텍스트
  11px / 600-700     배지, 태그
  10px / 600-700     극소 배지, 보조 라벨

규칙:
  - 헤딩은 font-black(900) 또는 font-bold(700) — 중간값 없음
  - leading-snug(1.25) for 헤딩, leading-relaxed(1.625) for 본문
```

### 간격 (4px 배수 시스템)

```
4px   극소 인접 요소    8px   아이콘-텍스트
12px  카드 내부 아이템  16px  표준 패딩(p-4)
20px  카드 패딩(p-5)   24px  큰 카드 패딩(p-6)
32px  섹션 간 여백     80px  랜딩 섹션(py-20)
```

### 그림자

```
shadow-card:    0 2px 16px 0 rgba(0,0,0,0.07)
shadow-card-lg: 0 8px 40px 0 rgba(0,0,0,0.10)
shadow-sage:    0 4px 24px 0 rgba(91,173,146,0.30)
shadow-sage-lg: 0 8px 48px 0 rgba(91,173,146,0.40)
```

### 버튼 사이즈

```
XS   px-2.5 py-1    rounded-full  text-[11px] font-bold      (배지형 버튼)
SM   px-3   py-1.5  rounded-xl    text-[12px] font-semibold  (필터, 태그)
MD   px-5   py-3    rounded-2xl   text-[14px] font-bold      (기본 버튼)
LG   px-6   py-4    rounded-2xl   text-[15px] font-bold      (주요 CTA)
XL   w-full py-5    rounded-2xl   text-[16px] font-bold      (풀너비 CTA)
```

### 다크 섹션 텍스트 opacity

```
rgba(255,255,255,1.00)  헤딩, 수치 — 최대 강조
rgba(255,255,255,0.70)  본문, 설명
rgba(255,255,255,0.50)  보조 텍스트, 날짜
rgba(255,255,255,0.30)  구분선, 플레이스홀더
#5BAD92 (sage)          브랜드 강조 단어
```

### 애니메이션 (@keyframes — globals.css에 추가)

```css
/* 3D 카드 플로팅 */
@keyframes heroFloat1 {
  0%, 100% { transform: rotateX(-14deg) rotateY(-22deg) translateY(0px); }
  50%      { transform: rotateX(-14deg) rotateY(-22deg) translateY(-14px); }
}
@keyframes heroFloat2 {
  0%, 100% { transform: rotateX(10deg) rotateY(18deg) translateY(0px); }
  50%      { transform: rotateX(10deg) rotateY(18deg) translateY(14px); }
}

/* Sage 브랜드 글로우 오브 */
@keyframes orbPulse {
  0%, 100% { box-shadow: 0 0 30px 8px rgba(91,173,146,0.35), 0 0 60px 20px rgba(91,173,146,0.15); }
  50%      { box-shadow: 0 0 50px 16px rgba(91,173,146,0.55), 0 0 100px 40px rgba(91,173,146,0.20); }
}

/* 원화 기호 떠오르며 사라지기 */
@keyframes wonFloat {
  0%   { transform: translateY(0) rotate(-5deg); opacity: 0.9; }
  60%  { transform: translateY(-28px) rotate(8deg); opacity: 0.7; }
  100% { transform: translateY(-50px) rotate(-3deg); opacity: 0; }
}

/* 상태 도트 펄스 */
@keyframes dotPulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50%      { opacity: 0.8; transform: scale(1.4); }
}

/* 배경 블롭 흐름 */
@keyframes bgBlob {
  0%, 100% { transform: translate(0,0) scale(1); opacity: 0.7; }
  33%      { transform: translate(25px,-18px) scale(1.08); opacity: 1; }
  66%      { transform: translate(-15px,12px) scale(0.94); opacity: 0.8; }
}
```

## Input

```json
{
  "component": "컴포넌트 이름 또는 설명",
  // 예: "DdayBadge", "카드 목록", "결제 CTA 버튼", "마감임박 배너"

  "variant": "light | dark | glass",
  // light: 흰 배경 앱 컴포넌트 (기본값)
  // dark:  #0A0A0A 다크 섹션 컴포넌트
  // glass: 다크 배경 위 글래스모피즘 카드

  "props": {
    // 컴포넌트에 필요한 데이터 필드 (생략 가능)
    // 예: { "periodEnd": "string", "count": "number" }
  },

  "context": "app | landing | mobile",
  // app:     로그인 후 앱 화면 (max-w-2xl, space-y-4)
  // landing: 마케팅 랜딩 페이지 (max-w-6xl, 섹션 단위)
  // mobile:  React Native StyleSheet 형식

  "interactive": true,
  // true: 호버·포커스·클릭 상태 포함
  // false: 정적 표시용만 (기본값 true)

  "reference": "선택사항 — 참고할 기존 컴포넌트명이나 패턴"
  // 예: "ProgressBar 참고해서 세로 버전으로", "DdayBadge 색상 로직 재사용"
}
```

## Output

1. **TSX 컴포넌트 코드** — props 타입 정의 포함, 한국어 주석 달림
2. **Tailwind 클래스 사용 이유** — 왜 이 클래스를 선택했는지 한 줄 설명
3. **사용 예시 스니펫** — 실제 페이지에서 어떻게 쓰는지

## Process

```
1. variant 확인 → light/dark/glass 분기
   // 잘못된 variant 입력 시 light로 fallback + 경고 출력

2. 디자인 토큰에서 해당 컨텍스트 규칙 적용
   - light  → bg-white, shadow-card, gray 계열 텍스트
   - dark   → bg-[#0A0A0A], rgba 텍스트, sage 글로우
   - glass  → rgba 배경, backdrop-filter, border rgba

3. interactive=true 이면 hover/focus/disabled 상태 클래스 추가
   // transition-colors duration-200 기본 적용

4. context=mobile 이면 StyleSheet 형식으로 변환
   // Tailwind 클래스 → RN StyleSheet 상수로 자동 변환

5. 한국어 주석 삽입
   // 복잡한 로직, 계산식, 조건 분기마다 비전공자도 이해할 수 있게

6. 기존 컴포넌트와 중복 가능성 확인 → reference 있으면 재사용 우선
```

## Example

**Input:**
```json
{
  "component": "DdayBadge",
  "variant": "light",
  "props": { "periodEnd": "string | undefined" },
  "context": "app",
  "interactive": false
}
```

**Output:**
```tsx
// [ui 스킬 생성] D-Day 배지 컴포넌트
// 마감일까지 남은 일수를 계산해서 색상을 자동으로 바꿔줌
// 마감 지남 → 회색 / 3일 이하 → 빨간색 / 7일 이하 → 주황색 / 그 이상 → 회색

function DdayBadge({ periodEnd }: { periodEnd?: string }) {
  // 마감일이 없으면 배지 자체를 표시하지 않음
  if (!periodEnd) return null;

  // 오늘 기준으로 마감까지 며칠 남았는지 계산
  // 86400000 = 하루를 밀리초로 변환한 값 (24시간 × 60분 × 60초 × 1000)
  const dday = Math.ceil(
    (new Date(periodEnd).getTime() - Date.now()) / 86400000
  );

  // 남은 일수에 따라 배지 색상 결정
  const color =
    dday < 0  ? 'bg-gray-100 text-gray-400' :  // 마감 지남 → 회색
    dday <= 3 ? 'bg-red-50 text-red-500' :     // 3일 이하 → 긴급 빨간색
    dday <= 7 ? 'bg-orange-50 text-orange-500' : // 7일 이하 → 주의 주황색
                'bg-gray-100 text-gray-500';    // 그 이상 → 기본 회색

  return (
    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${color}`}>
      {dday < 0 ? '마감' : `D-${dday}`}
    </span>
  );
}
```

**사용 예시:**
```tsx
// 카드 내 우측 상단에 배치
<div className="flex items-center justify-between">
  <Badge label="진행중" variant="sage" />
  <DdayBadge periodEnd={item.period_end} />
</div>
```

## 컴포넌트 패턴 카탈로그

> 자주 쓰는 패턴 — Input에 이 이름을 그대로 넣으면 즉시 생성 가능

| 패턴명 | 설명 | variant |
|--------|------|---------|
| `Badge` | 상태 배지 (sage/blue/orange/red/gray) | light |
| `DdayBadge` | D-day 자동 계산 배지 | light |
| `GuaranteeBanner` | 환불 보증 배너 | light |
| `UrgentBanner` | 마감임박 경고 배너 | light |
| `SkeletonCard` | 로딩 스켈레톤 | light |
| `ProgressBar` | 가로 진행바 (sage 그라디언트) | light |
| `FilterTabs` | 필터 탭 (active = sage) | light |
| `ChatBubble` | Q&A 챗봇 말풍선 | light |
| `AppNav` | 전역 네비게이션 바 | light |
| `DarkHeroSection` | 히어로/CTA 다크 섹션 | dark |
| `DarkAIBanner` | AI 처리 중 배너 카드 | dark |
| `GlassCard` | 글래스모피즘 카드 | glass |
| `GlassCTA` | 다크 섹션 글래스 CTA 버튼 | glass |
| `SageTagline` | Sage 글로우 태그라인 뱃지 | dark |
| `LiveDot` | 라이브 상태 도트 (ping 애니메이션) | dark |

## Skill Chaining

- **upstream (이 스킬을 호출하는 스킬들):**
  - Brand Identity (`brand`) — 디자인 토큰 생성 후 실제 컴포넌트 구현 시 호출
  - Motion Director (`motion`) — Remotion 비디오 UI 컴포넌트 생성 시 호출
  - B2B Proposal Bot (`b2b`) — 제안서 내 UI 스크린샷 생성 시 호출
- **downstream (이 스킬이 호출하는 스킬들):**
  - Code Architect (`code`) — 생성된 컴포넌트를 FSD 레이어 구조에 배치할 때 호출

## Constraints

- Tailwind 커스텀 값은 `tailwind.config.ts`에 정의된 것만 사용 (`sage`, `surface`, `shadow-card` 등) `[PROD]`
- 임의의 hex 값을 인라인 Tailwind(`text-[#hex]`)로 쓰지 않음 — 토큰 우선 `[PROD]`
- 다크 배경 위 글래스 효과는 반드시 `backdropFilter` + `WebkitBackdropFilter` 둘 다 명시 (Safari 지원) `[ENG]`
- 모든 interactive 요소에 `transition-colors duration-200` 최소 적용 `[PROD]`
- `any` 타입 사용 금지 — props 타입은 항상 명시 `[ENG]`
- 컴포넌트 함수 100줄 초과 금지 — 초과 시 서브 컴포넌트로 분리 `[IPAI]`
- 한국어 주석: 조건 분기, 계산식, 외부 라이브러리 호출마다 필수 `[IPAI]`
- 새 컴포넌트 생성 전 카탈로그 확인 — 기존 패턴 재사용 우선 `[DRY]`

## Hard Gates

| ID | 조건 | FAIL 기준 |
|----|------|-----------|
| G1 | 토큰 사용 | 색상, 간격, radius가 임의값 중심임 |
| G2 | 상태 구현 | hover, focus, disabled, loading 중 필요한 상태가 빠짐 |
| G3 | 반응형 | 모바일/데스크톱 중 하나에서 레이아웃이 깨짐 |

## Soft Findings

| ID | 조건 | 조치 |
|----|------|------|
| S1 | 컴포넌트 재사용 | shared/ui 승격 후보 표시 |
| S2 | QA 연결 | 브라우저 테스트가 필요한 상호작용 표시 |

## Registry Metadata

```json
{
  "skill_id": "ui",
  "skill_name": "UI Component Builder Skill",
  "version": "1.0.0",
  "department": "프로덕트부",
  "owner": "프로덕트부",
  "tier": "2",
  "trigger_type": "manual",
  "dependencies": ["brand"],
  "estimated_cost_per_run_usd": 0.03,
  "last_updated": "2026-03-18"
}
```
