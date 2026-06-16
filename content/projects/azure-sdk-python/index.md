---
title: Azure SDK Python
description: Azure SDK for Python 저장소에 코드 기여를 진행하며 OSS 기여 프로세스를 익힌 경험
authors:
  - bnbong
tags:
  - Python
  - Azure
  - Azure SDK
  - oss
  - backend
period: "2023"
role: 오픈소스 기여
---

# Azure SDK Python

## 개요

2023 OSSCA 활동 중 `Azure 클라우드 Python 오픈소스 SDK 도구 및 문서 팀`에 참여하며
Azure SDK for Python 저장소에 코드 기여를 진행했습니다.

### 저장소

<https://github.com/bnbong/azure-sdk-for-python>

## 기여 내용

- [:fontawesome-solid-code-pull-request: [Storage] Fixed cspell typos in storage-blob](https://github.com/Azure/azure-sdk-for-python/pull/31635)
- [:fontawesome-solid-code-pull-request: [eventhub] Fixed local variable's name typo in eventhub](https://github.com/Azure/azure-sdk-for-python/pull/32556)
- [:fontawesome-solid-code-pull-request: [Storage] Fixed cspell typos in storage-queue](https://github.com/Azure/azure-sdk-for-python/pull/31844)

## 왜 의미 있었는가

겉으로 보면 작은 수정 같지만, 이 경험에서 진짜 얻은 건 코드 한 줄이 아니라
대형 오픈소스 저장소의 구조와 리뷰 프로세스를 직접 겪어봤다는 점입니다.

- 모노레포 구조 파악
- 서비스별 패키지 경계 이해
- CI가 요구하는 규칙과 스타일 확인
- 리뷰 피드백을 반영하는 흐름 경험

작은 수정이라도 이런 저장소에서는 맥락을 읽지 못하면 기여하기 어렵습니다.

## 배운 점

- 오픈소스 기여는 구현 능력만이 아니라 기존 컨벤션을 읽는 능력이 중요합니다.
- 작은 수정부터 시작하는 편이 대형 저장소의 구조를 익히기에 가장 현실적이었습니다.
- 코드 변경량보다 리뷰어가 이해하기 쉬운 변경 단위를 만드는 게 중요하다는 걸 배웠습니다.

## 아쉬웠던 점

- Azure SDK Python 같은 초대형 프로젝트에서는 MS 내부적으로 코드 품질 및 개선 방향에 대해 회의에서 논의되고 이를 Auto Gen 이라는 코드 자동 생성 도구가 반영하는데, 이런 맥락까지 알기 어려웠을 뿐더러 Auto Gen 태그가 붙은 코드는 오픈소스임에도 외부 기여자가 코드 기여를 할 수 없도록 막아둬서 실질적으로 기여할 수 있는 코드가 많지 않았습니다.
