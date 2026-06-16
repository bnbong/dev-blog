---
title: JaramGroupware Penalty - 학회원 페널티 시스템 API
description: 학회 그룹웨어의 페널티 도메인을 Django REST Framework로 재구성하고 문서화한 프로젝트
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
---

# JaramGroupware Penalty API

## 개요

자람 그룹웨어에서 학회원의 페널티를 관리하기 위한 시스템입니다. 기존 Java Spring 기반 시스템을 Python Django로 재구성하는 흐름의 일부로 진행했습니다.

### 저장소

<https://github.com/msng-devs/JGW-Penalty-Python>

## 프로젝트 목적

페널티 시스템은 단순 CRUD 구조에 그치지 않습니다. 규칙에 맞는 권한 처리, 일관된 예외 메시지, 관리자가 보기 쉬운 응답 구조가 중요했습니다. 그래서 이 프로젝트에서는 기능 자체보다 운영 가능한 내부 API로 다시 정리하는 데 초점을 맞췄습니다.

## 왜 Django REST Framework였는가

이 프로젝트는 팀 단위로 빠르게 안정적인 API 서버를 만들어야 했습니다. DRF는 익숙한 Django 생태계, Serializer 기반 응답 구조 정리, 관리자/권한/예외 처리 확장성 측면에서 잘 맞았습니다.

당시 백엔드 경험이 부족했던 터라 Django가 제가 고를 수 있던 가장 나은 stack이기도 했습니다. 같은 그룹웨어 서비스의 핵심인 커뮤니티 서비스 'Hub'가 Django로 구현돼 있어서 기술 스택을 통일하려는 의도도 있었습니다. 새로운 기술을 시험하기보다 빠르게 신뢰할 만한 API를 제공하는 쪽이 더 중요했습니다.

## 구현 포인트

README 구조 기준으로 공통 모듈, 예외 처리, 권한 처리, 문서 정리를 별도로 두고 작업했습니다.
페널티 시스템이 작아 보여도, 이후 비슷한 내부 서비스와 규칙을 공유할 가능성이 높았기 때문입니다.

- 공통 모델/유틸 분리
- 그룹웨어 규격에 맞는 예외 메시지 형식 정리
- GitBook 기반 API 문서 운영
- Docker 기반 실행 환경과 배포 자동화 정리

## 역할

- Django REST Framework 기반 API 구현
- 테스트 코드 작성
- 문서화 및 배포 자동화

## 배운 점

- 내부 서비스일수록 "기능을 구현했다"보다 규칙을 일관되게 표현했는지가 더 중요합니다.
- 작은 API여도 문서와 예외 형식을 먼저 정리하면 유지보수가 훨씬 쉬워집니다.
