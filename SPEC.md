# HUDdy MVP SPEC

> **작성자:** KK
> **작성일:** 2026-05-13
> **상태:** 확정

---

## 1. 왜 만드는가 (목적)

영어 발표 실력이 있어도, 막상 발표 순간에는 긴장·호흡 끊김·대본 읽는 느낌·문장 흐름 이탈이 겹쳐 실제 실력보다 못해 보인다. 이 문제를 해결하는 도구가 없으면 12주 동안 발표를 꾸준히 연습할 수 없고, 연습해도 무엇이 나빠졌는지 모른 채 반복하게 된다.

HUDdy는 판매용 제품이 아니라 **내가 12주 동안 실제로 쓸 개인 훈련 도구**로 시작한다. 시장 검증이 목적이 아니라, "발표 주훈련 + 드릴 보조훈련" 구조가 나에게 실제로 효과가 있는지를 먼저 확인하는 것이 목적이다.

핵심 은유: 내비게이션은 운전을 대신하지 않는다. 다음 방향과 속도를 조용히 알려줄 뿐이다. HUDdy도 발표를 대신하지 않는다. 발표 중 길을 잃지 않도록 시야 위에서 최소한의 cue만 띄운다.

---

## 2. 누가 쓰는가 (사용자)

**P0 주 사용자:** 나 자신 (KK)
- 영어 발표 연습이 필요한 단 한 명의 사용자
- 12주 발표 루틴을 처음부터 끝까지 실제로 완주할 사람

**P0 이후 확장 타깃:**
- 영어 PT/미팅/피칭/스터디 발표를 준비하는 직장인
- PM, 디자이너, 개발자, 창업자
- 영어 면접·글로벌 팀 발표 준비자

> P0에서는 타깃을 "나 자신" 한 명으로 제한한다. 온보딩, 다중 유저, 공유 기능은 범위 밖.

---

## 3. 어떻게 쓰는가 (사용자 흐름)

```
Home → Create Session → Prepare → Practice Room → Report → Progress
```

### Home
| 사용자 행동 | 시스템 제공 | 다음 조건 |
|------------|------------|----------|
| 앱 접속 | 12주 그리드, 완료 세션 수, 이번 주 미션, "새 세션 시작" CTA | "새 세션 시작" 클릭 |

### Create Session (세션 생성)
| 사용자 행동 | 시스템 제공 | 다음 조건 |
|------------|------------|----------|
| 오늘의 토픽 선택 또는 직접 입력 (예: Work / Study / Life / Custom) | 카테고리 선택 UI, 제목 입력 필드, 예상 발표 시간 선택 | 제목 입력 완료 후 "준비하기" 클릭 |

### Prepare (준비 단계)
| 사용자 행동 | 시스템 제공 | 다음 조건 |
|------------|------------|----------|
| 한국어로 오늘 말하고 싶은 내용을 자유롭게 입력 | 텍스트 입력 필드 | 입력 완료 후 "키워드 카드 생성" 클릭 |
| 생성된 영어 키워드 카드 확인·편집 | mock 키워드 카드 5–8개 (한국어 입력 기반, P0에서는 mock) | 카드 확인 후 "Breath Script 보기" 클릭 |
| Breath Script(문장 끊기 가이드) 확인 | mock Breath Script — 슬래시(/)로 호흡 포인트 표시 | "발표 시작" 클릭 |

### Practice Room (연습 — HUD 화면)
| 사용자 행동 | 시스템 제공 | 다음 조건 |
|------------|------------|----------|
| 웹캠 앞에 앉아 발표 시작 | 카메라 self-view 또는 placeholder (P0-A는 placeholder), HUD overlay (아래 참고) | 발표 완료 후 "완료" 버튼 클릭 |

**HUD 구성 (P0 — mock/placeholder 기반):**
- 중앙 상단: 현재 키워드 카드 1개 (순서대로 표시)
- 중앙 하단: 라이브 자막 placeholder (실제 STT 없음, P0)
- 좌하단: 발표 경과 타이머
- 우하단: pace / breath cue placeholder (정적 UI, P0)
- 전체: glassmorphism 다크 오버레이, 발표 흐름 방해 최소화

> **중요:** HUD는 teleprompter가 아니다. 전체 스크립트 스크롤 없음. 키워드 1개 + 상태 바만.

### Report (발표 후 리포트)
| 사용자 행동 | 시스템 제공 | 다음 조건 |
|------------|------------|----------|
| 발표 완료 후 리포트 확인 | mock 리포트: 잘한 점 3가지, 개선점 2가지, 다음 주 미션 1가지 | "저장하고 홈으로" 또는 "다시 연습" 클릭 |

### Progress (진행 현황)
| 사용자 행동 | 시스템 제공 | 다음 조건 |
|------------|------------|----------|
| 12주 현황 확인 | 12주 그리드, 완료/미완료 세션, 주차별 미션 기록 | 과거 세션 클릭 → 해당 Report 재열람 |

---

## 4. 범위

### 이번에 하는 것 ✅ (P0)

- 12주 발표 루틴 구조 (주차 추적 + 미션)
- 세션 생성 (토픽 선택 + 제목 입력)
- 한국어 메모 입력
- 영어 키워드 카드 **mock** 생성 (AI 미연동)
- Breath Script **mock** 생성 (슬래시 기반 호흡 가이드)
- Practice Room HUD UI (glassmorphism 다크 오버레이)
- **P0-A:** camera placeholder 기반 Practice Room (첫 구현 범위)
- **P0-B:** getUserMedia 기반 camera self-view (별도 Task로 분리)
- **P0-C:** audio-only recording (별도 Task로 분리)
- 발표 중 cue placeholder (키워드 카드 순차 표시)
- 발표 타이머
- 발표 후 **mock** report (잘한 점, 개선점, 다음 주 미션)
- localStorage 기반 세션 저장 및 불러오기
- Progress 화면 (12주 그리드)

> **카메라 구현 순서:** P0-A(placeholder) → P0-B(getUserMedia) → P0-C(audio-only recording) 순으로 진행.
> 첫 구현은 반드시 placeholder부터 시작한다.

### 이번에 하지 않는 것 ❌

- 실제 OpenAI / Azure / STT API 연동
- 실제 발음 평가
- 실제 MediaPipe face landmarks
- face recognition 또는 신원 식별 — 사용자-facing UI와 코드 변수/함수명에 표현 금지
- 영상·얼굴 데이터 서버 업로드
- 로그인 / 인증 (auth)
- 결제
- 커뮤니티 / 랭킹
- Supabase / DB
- 실시간 AI 튜터
- PDF export
- 다중 유저 / 공유 기능
- WebRTC (원격 코칭)
- Whisper 로컬 처리

---

## 5. 성공 기준

```
[ ] Home → Create → Prepare → Practice → Report → Progress 흐름이 끊기지 않고 완주된다.
[ ] 세션 하나를 생성하고, 완료 상태로 localStorage에 저장하고, 다시 불러올 수 있다.
[ ] Practice Room HUD가 Jarvis-style / navigation HUD 컨셉을 시각적으로 전달한다.
    — 전체 스크립트 스크롤이 없다.
    — 키워드 카드가 1개씩 순차 표시된다.
    — glassmorphism 다크 오버레이가 실제로 적용되어 있다.
[ ] Report 화면이 잘한 점, 개선점, 다음 주 미션을 표시한다.
[ ] Progress 화면이 12주 그리드를 표시하고, 완료된 세션이 반영된다.
[ ] 외부 API 없이 mock adapter만으로 전체 흐름이 동작한다.
[ ] 사용자-facing UI와 코드 변수/함수명에는 "face recognition" 또는 "얼굴 인식" 표현이 없다.
[ ] SPEC/기획 문서에서는 금지 개념 설명 용도로만 사용한다.
[ ] 브라우저 콘솔 에러 0개로 qa 통과한다.
```

---

## 6. 제약조건 (건드리면 안 되는 것)

**운영-프로토콜 필수 적용:**
- 구현 전 SPEC 확인 필수 `[SPEC]`
- FSD 레이어 구조 우선 (`app → pages → widgets → features → entities → shared`) `[ENG]`
- `any` 타입 절대 금지 `[ENG]`
- 파일 300줄 초과 금지 `[ENG]`
- 함수 100줄 초과 금지 `[ENG]`
- 디자인 토큰 우선 — 인라인 hex 금지 `[PROD]`
- 한국어 주석 필수 — "왜(WHY)"만, "무엇(WHAT)"은 금지 `[IPAI]`
- 크로스 레이어 import 금지 `[ENG]`
- feature별 `index.ts` barrel export 필수 `[DRY]`

**P0 하드 제약:**
- backend 없음 — localStorage만 `[P0]`
- auth 없음 `[P0]`
- DB 없음 (Supabase 포함) `[P0]`
- 실제 AI / STT / MediaPipe 없음 — mock adapter만 `[P0]`
- 영상·얼굴 데이터 서버 업로드 금지 `[SEC]`
- 사용자-facing UI와 코드 변수/함수명에 "face recognition" / "얼굴 인식" 표현 금지 — 대신 "face landmarks" `[SEC]`

---

## 7. 기술 결정사항

### 이미 결정된 것

| 항목 | 결정 |
|------|------|
| 프레임워크 | Next.js App Router |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS |
| 폴더 구조 | FSD (Feature-Sliced Design) |
| P0 저장 | localStorage |
| 어댑터 전략 | mock adapter 우선, 인터페이스 선정 후 실제 구현 교체 |
| Zustand | 필요 시 사용 (persist + skipHydration: true 필수) |
| 브랜드 토큰 | HUDdy dark navy / cyan / amber 계열로 별도 정의 (brand 스킬 실행 선행) |
| Tailwind CSS 방식 | create-next-app 기본값 확인 후 결정. v4 `@theme inline`을 우선 검토하되, shadcn/ui와 충돌 시 tailwind.config.ts 기반으로 조정한다. |

### 미결 — 구현 전 결정 필요

| 항목 | 현재 상태 |
|------|----------|
| Next.js 버전 | v14 vs v15 미결 |
| shadcn/ui 사용 범위 | 사용 여부 및 범위 미결 |
| P0-B 카메라 self-view 착수 시점 | P0-A 완료 후 별도 Task |
| P0-C audio-only 녹화 착수 시점 | P0-B 완료 후 별도 Task |
| IndexedDB 전환 시점 | localStorage 한계 도달 시점 미결 |

---

## 8. 관련 파일 힌트

```
skills/운영-프로토콜.md      — 필수 워크플로우 및 코드 품질 기준
skills/기능명세-양식.md      — 이 문서의 템플릿 원본
skills/코드-아키텍트.md      — FSD 보일러플레이트 생성 가이드
skills/브랜드-아이덴티티.md  — HUDdy 브랜드 토큰 생성 전 실행
skills/UI-컴포넌트.md        — 컴포넌트 작성 기준 (HUDdy 토큰 교체 후 사용)
report/deep-research-report.md — HUD UX 원칙, 12주 구조, 기술 스택 근거
```

---

## 9. 미결 사항 (구현 전 확인 필요)

```
[ ] Tailwind v4 @theme inline과 shadcn/ui가 충돌하는가?
    → create-next-app 실행 후 즉시 확인. 충돌 시 tailwind.config.ts로 전환.

[ ] FSD 구조를 Next.js App Router와 어떻게 혼합할 것인가?
    → app/ 디렉토리는 App Router 규칙, src/는 FSD — 경계 합의 후 SPEC 업데이트.

[ ] 첫 구현은 Claude Code가 할 것인가, Codex가 할 것인가?
    → 도구에 따라 IEXEC 방식이 달라진다.

[ ] Next.js 버전은 v14인가 v15인가?
    → create-next-app 실행 전 결정 필요.

[ ] shadcn/ui를 사용할 것인가?
    → 사용 시 컴포넌트 범위와 HUDdy 토큰 오버라이드 방식 결정 필요.
```
