<!-- 파일: skills/개발/QA-블라인드테스트.md | 스킬: QA Blind Test | 부서: 개발부 | ID: qa -->

# QA 블라인드 테스트 스킬 (QA Blind Test Skill)

> **담당:** 개발부
> **Tier:** 2 (Claude Sonnet + Browser Subagent)
> **Skill ID:** `qa`

## Purpose

개발 완료 후 `IEXEC` 마지막 단계나 명시적 요청 시, 기계적인 코드 테스트를 넘어 **브라우저 서브에이전트(Browser Subagent)**를 활용하여 사용자가 겪을 수 있는 프론트엔드 결함과 엣지 케이스를 자가 점검한다.

## Trigger

- `@qa blind-test {URL}` — 특정 URL 또는 기본 개발 서버(http://localhost:3000) 진입 후 자동화 테스트 시작
- `@qa blind-test {URL} {시나리오}` — 회원가입, 결제 등 특정 사용자 플로우 직접 테스트 지시

## Input

```json
{
  "target_url": "http://localhost:3000 (환경변수 또는 CLI 인자로 넘겨받음)",
  "scenario": "결제 플로우 검증",
  "focus": ["layout", "interaction", "console-errors", "responsive"]
}
```

## Process

1. **브라우저 서브에이전트 호출**
   - AI 에이전트가 `default_api:browser_subagent` 도구를 사용해 테스트 지시.
   - 설정된 URL로 접속 후 DOM을 스캔하여 요소(버튼, 입력 폼 등) 식별.

2. **사용자 행동 시뮬레이션**
   - 의미를 알 수 없는 상태("블라인드")에서 인간처럼 행동(클릭, 스크롤, 타이핑, 호버) 반복.
   - 미구현된 버튼이나 상호작용이 깨지는 구간 탐색.

3. **결함 식별 (Defect Identification)**
   - 클릭했는데 아무 반응이 없는 경우 (피드백 부재)
   - 입력 폼에 특수 기호나 이모지 입력 시 프론트/서버가 죽는 경우
   - 화면 레이아웃 깨짐 현상

4. **산출물 및 리포트 작성**
   - 개발자 도구(Console) 에러 로그 취합
   - 에이전트가 캡처한 문제를 스크린샷 묘사 등과 함께 Markdown으로 작성
   - 하단에 [표준 JSON Payload] 추가 -> `sec audit` 등과 연계 가능

## Expected Output Format

```markdown
## QA 블라인드 테스트 결과

- **URL:** `http://localhost:3000`
- **시나리오:** 전체 둘러보기 (탐색적 테스팅)

### 발견된 이슈
1. 🔴 **[결제창] "이전으로" 버튼 동작 안 함**
   - 증상: 버튼 클릭 시 콘솔에 `Cannot read properties of undefined` 에러 발생. 페이지 멈춤.
   - 조치 필요: `onClick` 핸들러 바인딩 수정 필요.

2. 🟡 **[로그인 폼] 이모지 입력 시 Validation 에러 문구 없음**
   - 증상: 이메일 필드에 이모지가 들어가지만 Zod 유효성 검사 에러 라벨이 DOM에 노출되지 않음.
   - 조치 필요: `error.message` UI 노출 로직 확인.

...
```

```json
{
  "action": "@code audit",
  "bottleneck": "결제창 UI 로직 파손",
  "issues": [
    {
      "severity": "high",
      "area": "checkout",
      "summary": "이전으로 버튼 클릭 시 페이지 멈춤"
    }
  ]
}
```

## Hard Gates

| ID | 조건 | FAIL 기준 |
|----|------|-----------|
| G1 | 실제 플로우 | 사용자가 도달하는 핵심 화면/CTA를 테스트하지 않음 |
| G2 | 콘솔 에러 | 브라우저 콘솔 에러를 확인하지 않음 |
| G3 | 반응형 | 모바일 또는 작은 화면 검증이 없음 |

## Soft Findings

| ID | 조건 | 조치 |
|----|------|------|
| S1 | 접근성 | 키보드 포커스와 라벨 누락을 권장 이슈로 기록 |
| S2 | 시각 회귀 | 스크린샷 비교가 필요한 화면 표시 |

## Registry Metadata

```json
{
  "skill_id": "qa",
  "skill_name": "QA Blind Test Skill",
  "version": "1.0.0",
  "department": "개발부",
  "owner": "개발부",
  "tier": "2",
  "trigger": "@qa blind-test {URL}",
  "trigger_type": "manual | post-implementation",
  "dependencies": ["code", "edge"],
  "model": "claude-sonnet-4-6 + browser-subagent",
  "last_updated": "2026-04-22"
}
```
