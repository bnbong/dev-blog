---
name: codemaru
description: GitHub 프로필 README용 개발 역량 요약 SVG 카드 생성기. GitHub, solved.ac, LeetCode 데이터를 모아 점수화하고 8단계 티어로 표현합니다.
authors:
  - bnbong
tags:
  - Python
  - FastAPI
  - SVG
  - GitHub Actions
  - oss
  - personal
  - backend
language: Python
languageColor: "#3572A5"
stars: 4
period: 2026 - 진행중
role: 개인 OSS 운영, 스코어링 설계 / FastAPI 서버 / SVG 렌더 / GitHub Action
status: active
---

# codemaru

## 개요

codemaru는 개발자의 활동을 5개 축(Open Source, Impact, Consistency, Problem Solving, Depth)으로 요약해 GitHub 프로필 README에 붙일 수 있는 SVG 카드로 만들어 주는 오픈소스입니다. GitHub, Baekjoon/solved.ac, LeetCode 데이터를 모아 점수를 계산하고, 결과를 Seed부터 Maru까지 8단계 티어로 표현합니다.

### 저장소와 데모

<https://github.com/bnbong/codemaru>

<https://codemaru.bnbong.com>

## 주요 특징

- **멀티 플랫폼 집계**: GitHub, BOJ/solved.ac, LeetCode를 한 번에 모아 점수를 매깁니다.
- **신뢰도 가중치**: 표본이 적을 때 점수가 과대평가되지 않도록 confidence weighting을 적용합니다.
- **테마와 레이아웃**: default, dark, transparent 테마와 compact 레이아웃, 애니메이션 또는 정적 SVG 렌더를 지원합니다.
- **웹 제너레이터**: `codemaru.bnbong.com`에서 실시간 미리보기로 카드를 만듭니다.
- **GitHub Action 연동**: 워크플로로 카드를 자동 갱신합니다.

## 설계 노트

단순한 배지 합산이 아니라 "역량을 어떻게 검증 가능한 수치로 요약할 것인가"를 핵심 과제로 삼았습니다. 플랫폼별 신호(기여, 영향력, 꾸준함, 문제 해결, 깊이)를 정규화하고 가중치를 두어, 표본이 적은 계정도 과/저평가되지 않도록 점수 분포를 다듬었습니다. FastAPI 서버가 데이터를 모아 점수를 계산하고 SVG를 렌더링하며, 결과는 README에 바로 임베드할 수 있습니다.
