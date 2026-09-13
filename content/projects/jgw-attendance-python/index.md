---
title: JaramGroupware Attendance - 학회원 출결 시스템 API
description: 학회 출결 도메인을 Django REST Framework로 재구성하고 스케줄러와 문서 체계를 정리한 프로젝트
authors:
  - bnbong
tags:
  - Python
  - Django
  - Django REST framework
  - API Server
  - team
  - backend
period: "2023"
role: 팀, 학회 / 백엔드 / 문서화 / 테스트 / 배포 자동화
status: archived
---

# JaramGroupware Attendance API

## 개요

자람 그룹웨어의 출결 관리 시스템입니다. 페널티 시스템과 마찬가지로, 기존 구조를 Python Django 기반으로 정리하고 운영 가능한 내부 API 형태로 재구성하는 작업의 일부였습니다.

### 저장소

<https://github.com/msng-devs/JGW-Attendance-Python>

## 프로젝트 특징

출결 시스템에서는 다음 세 가지 요소가

- 학회원 이벤트와 시간표
- 출결 상태 갱신
- 주기적인 정리 작업

서로 맞물려 동작합니다. 그래서 리팩터링을 진행하면서 단일 앱으로 구현하기보다 도메인별 앱 분리와 공통 모듈 정리에 더 집중했고, `attendance`, `event`, `timetable`, `utils`, `core`로 나누었습니다. 출결 로직을 한 파일에 몰아넣지 않고 역할을 기준으로 나누려는 의도였습니다.

## 왜 Django REST Framework였는가

출결 시스템은 복잡한 실시간성보다 명확한 관리 기능과 검증, 운영 편의성이 중요했습니다.
DRF는 다음 이유로 적합했습니다.

- 관리형 API를 빠르게 구성하기 쉽습니다.
- Serializer와 Permission 구조가 명확합니다.
- Django 생태계로 테스트와 운영을 정리하기 좋습니다.
- 당시에는 백엔드 경험이 부족했던 터라 Django가 제가 선택할 수 있는 가장 나은 스택이었습니다.
- 같은 그룹웨어 서비스의 핵심인 커뮤니티 서비스 'Hub'가 Django로 구현되어 있어서, 기술 스택을 통일하는 것도 고려했습니다.

## 스케줄러가 중요했던 이유

이 프로젝트에서 특징적이었던 부분은 주기적 갱신 작업입니다. 문서 기준으로 APScheduler를 사용해 학회원 출결 정보를 주기적으로 업데이트하도록 구성했습니다.

출결 도메인은 단순한 요청과 응답만으로 끝나지 않고 시간이 지나면서 상태를 갱신해야 하는 시스템이기 때문에, 이러한 구조를 선택했습니다.

## 역할

- Django REST Framework 기반 API 구현
- 테스트 코드 작성
- GitBook 기반 문서화
- 배포 자동화
- 스케줄링 로직 정리

## 배운 점

- 출결 같은 업무 도메인은 화면보다도 상태 전이와 주기 작업이 더 중요합니다.
- 작은 내부 서비스라도 앱 경계를 나눠 두면 이후 유지보수가 훨씬 편해집니다.
- 문서와 스케줄러를 함께 관리해 본 경험은 이후 운영을 고려해야 하는 백엔드 프로젝트에 도움이 되었습니다.
