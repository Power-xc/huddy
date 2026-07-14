# HUDdy

> AI 스피킹 네비게이터 — 영어 발표 중 화면에 조용히 표시되는 키워드·호흡·속도·흐름 안내 도구

HUDdy는 영어 발표를 12주에 걸쳐 체계적으로 연습하는 개인 훈련 도구입니다. 발표 중
긴장·호흡 끊김·대본 읽는 느낌을 극복하기 위해 화면 위에 HUD(Heads-Up Display)를 띄워
다음 키워드와 호흡 포인트를 안내하고, 카메라·음성 신호를 분석해 발표 후 Claude 기반
피드백을 제공합니다. 네비게이션이 운전을 돕듯, HUDdy는 발표를 돕되 발표 자체를
대신하지 않습니다.

## 소개

HUDdy는 다음 사용자 흐름을 구현합니다.

1. **홈** — 12주 진행 현황과 완료된 세션 기록 확인
2. **세션 생성** — 발표 주제(Work / Study / Life / Custom) 선택
3. **준비 단계** — 한국어 메모 또는 영어 스크립트 작성, 한국어 번역 생성
4. **키워드 생성** — Claude가 메모·스크립트에서 영어 키워드 카드 생성
5. **Breath Script** — 호흡 포인트가 표시된 발표 스크립트와 문장별 번역 생성
6. **연습(Practice Room)** — 웹캠 앞에서 발표하며 HUD 가이드와 음성 키워드 감지 확인
7. **리포트** — 잘한 점·개선점·다음 주 미션과 발음·시선·호흡 신호 요약 수신

진행 현황 페이지에서는 12주 전체 세션을 그리드로 시각화해 완료 상태를 추적합니다.

## 기능

- **12주 구조화된 연습 흐름** — 주차별 미션과 세션 추적
- **세션 관리** — 주제별 카테고리, 예상 시간 선택, 세션 이력 저장(localStorage)
- **AI 준비 도우미** — 한국어 메모나 영어 스크립트에서 키워드 카드·호흡 스크립트·한국어 번역을 Claude로 생성하며, 스크립트 길이에 따라 카드 수를 자동 조정
- **Breath Script** — 호흡 포인트(/)로 끊어 읽는 발표 가이드와 문장별 한국어 번역
- **실시간 발표 HUD** — 현재 키워드, 경과 타이머, 호흡·속도 큐, 자막을 glassmorphism 스타일로 표시하고 사운드 큐로 진행 안내
- **음성 키워드 감지** — Web Speech API 인식 결과에서 키워드를 매칭해 카드를 자동 전환하고 대본 낭독 일치도 계산
- **카메라 신호 분석** — MediaPipe FaceLandmarker로 시선·고개 안정성·입 움직임·읽는 자세 리스크 측정, 미지원 환경에서는 밝기 기반 폴백으로 동작
- **연습 리포트** — 발표 신호를 종합한 Claude 리포트(잘한 점, 개선점, 다음 주 미션)를 마크다운으로 내보내기
- **Progress 페이지** — 12주 현황 그리드와 과거 리포트 재열람

## 기술 스택

| 항목 | 버전 | 용도 |
| --- | --- | --- |
| Next.js | 16 | 풀스택 웹 프레임워크 (App Router) |
| React | 19 | UI 라이브러리 |
| TypeScript | 5 | 정적 타입 검사 (strict) |
| Claude SDK | 0.96 | AI 키워드·번역·리포트 생성 |
| MediaPipe Tasks Vision | 0.10 | 얼굴 랜드마크 기반 카메라 신호 분석 |
| Zustand | 5 | 클라이언트 상태 관리 |
| Tailwind CSS | 4 | 유틸리티 기반 스타일링 |
| Vitest | 4 | 단위 테스트 |
| ESLint | 9 | 코드 품질 검사 |

## 시작하기

### 요구사항

- Node.js 20 이상

### 설치

```bash
git clone https://github.com/Power-xc/huddy.git
cd huddy
npm install
```

### 환경 변수

`.env.local.example`을 복사해 `.env.local`을 만들고 값을 채웁니다.

```bash
cp .env.local.example .env.local
```

`ANTHROPIC_API_KEY`는 서버 라우트에서만 사용되며 클라이언트에 노출되지 않습니다.
`NEXT_PUBLIC_AI_MODE=real`로 두면 실제 Claude 코칭이 켜지고, 생략하면 목업 데이터로
동작합니다.

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.

### 스크립트

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run lint` | ESLint 검사 |
| `npm run typecheck` | 타입 검사 |
| `npm run test:run` | 단위 테스트 |

## 프로젝트 구조

```
src/
├── app/          # Next.js App Router 페이지와 서버 측 AI 라우트(api/ai/*)
├── screens/      # 라우트별 화면 컴포지션
├── widgets/      # HUD 오버레이·리포트 등 복합 UI 블록
├── features/     # 카메라·음성·HUD·리포트 도메인 로직
├── entities/     # 저장소·AI 코치 어댑터
└── shared/       # 공용 UI, 타입, 유틸, 설정
```

AI 호출은 서버 라우트에서만 이뤄지며 오리진 검증·본문 크기 제한·IP 레이트 리밋을
거칩니다.

## 라이선스

개인 학습·포트폴리오 목적으로 공개한 프로젝트입니다.
