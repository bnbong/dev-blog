---
name: BaekjoonHub
description: 백준, 프로그래머스, SWEA 풀이를 GitHub에 자동 커밋해 주는 브라우저 확장. SWEA 자동 업로드가 끊기던 버그를 수정했습니다.
authors:
  - bnbong
tags:
  - JavaScript
  - Browser Extension
  - oss
url: https://github.com/BaekjoonHub/BaekjoonHub
period: 2026.05
role: 외부 기여, 이슈 진단 보조(#333) / 버그 수정 PR(#334)
status: archived
---

# BaekjoonHub

## 개요

[BaekjoonHub](https://github.com/BaekjoonHub/BaekjoonHub)은 백준, 프로그래머스, SWEA에서 맞은 풀이를 자동으로 GitHub 저장소에 커밋해 주는 브라우저 확장입니다. 제가 SWEA에서 직접 쓰다가 마주친 자동 업로드 중단 버그를 수정해 기여했습니다.

## 기여 내용

SWEA 결과 페이지의 DOM 구조가 바뀌면서 `scripts/swexpertacademy/parsing.js`의 셀렉터가 더 이상 맞지 않아, 첫 제출만 올라가고 이후 제출은 업로드가 끊기는 문제였습니다(이슈 #333).

PR #334에서 다음과 같이 수정했습니다.

- DOM 변경에 대비한 selector fallback 추가
- 닉네임, 문제 번호, 제출 정보 파싱을 null-safe 하게 보강
- 파싱이 성공한 뒤에만 업로드 UI를 노출
- `problemId` 조회 실패 시 `contestProbId` 로 대체하는 fallback
- GitHub hook/token/stats에 대한 명시적 null 체크

### 관련 이슈와 PR

<https://github.com/BaekjoonHub/BaekjoonHub/issues/333>

<https://github.com/BaekjoonHub/BaekjoonHub/pull/334>

## 실수와 배운 점

PR이 머지된 직후 회귀(regression)가 생겼습니다. 새로 추가한 `safeText()` 헬퍼가 `.innerText` 대신 `.textContent` 를 사용한 것이 원인이었습니다.

- `.textContent` 는 숨겨진 자식 요소(`.badge` 등)의 텍스트와 공백, 개행까지 그대로 가져옵니다. 그 결과 제목에서 뽑아낸 값에 newline/tab이 섞여 파일 경로가 깨졌습니다.
- 메인테이너가 공백 정규화 + `.badge` 자식 제거로 핫픽스를 배포했습니다.

회고하며 두 가지를 정리했습니다.

- `.textContent` 와 `.innerText` 의 의미 차이를 정확히 몰랐습니다. 화면에 보이는 텍스트가 필요할 때와 원시 텍스트가 필요할 때를 구분해야 합니다.
- 테스트 격리가 부족했습니다. 두 개의 확장을 동시에 켠 채로 검증하는 바람에 버그가 가려졌습니다. 확장 프로그램은 격리된 단일 환경에서 검증해야 합니다.

기능을 고치는 것만큼이나 "왜 제 테스트에서는 안 잡혔는가"를 되짚는 과정이 남는 기여였습니다.
