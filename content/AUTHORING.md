# 글/프로젝트 작성 가이드

> 이 파일은 `content/` 루트에 있어 사이트 빌드에서 무시됨. (리더는 `content/blog`, `content/projects`만 스캔)

## 핵심: 포스트별 폴더에 글 + 이미지를 함께

글과 이미지를 **같은 폴더 안에** 두어 포스팅.

```
content/blog/<slug>/
  index.md          ← 글 (폴더 이름이 URL slug → /blog/<slug>)
  cover.png         ← 이미지를 바로 옆에
  diagram.png
```

본문에서는 **상대경로**로 임베드. 빌드 시 `content/`의 이미지가 `public/`으로 자동 복사되고,리더가 `cover.png` → `/blog/<slug>/cover.png`로 자동 치환.

```markdown
![아키텍처 다이어그램](diagram.png)
<!-- 또는 raw <img src="diagram.png">, <figure markdown> 안에서도 동작 -->
```

## 블로그 글 frontmatter

기존 github.io(MkDocs) frontmatter를 **그대로 붙여넣어도 동작(기존 github.io때 블로그 호환성을 위함).** 리더가 두 방식을 모두 인식.

```markdown
---
title: '[Algorithm] 글 제목'
description: 한 줄 요약 (목록/메타 설명에 사용)   # 또는 excerpt:
authors: [bnbong]
date:
  created: 2026-06-14
  updated: 2026-06-14
categories: [Algorithm]                          # 또는 category: Algorithm
tags: [Python, Algorithm]
comments: true
---

본문은 표준 Markdown. MkDocs 문법도 지원:

!!! tip "팁 제목"
    admonition 블록도 그대로 렌더링됩니다.

<!-- more -->  ← 프리뷰 구분자는 자동 제거.
```

- **읽는 시간**: `readingTime: "8 min read"`를 넣으면 그대로, 없으면 본문 길이로 자동 계산.
- **사이드바 한 줄 소개**: `intro:`로 글마다 다르게 줄 수 있고, 없으면 프로필 기본값을 씀.

## 프로젝트

```
content/projects/<slug>/
  index.md
  demo.png
```

레거시 frontmatter(`title`, `description`, `tags`, `featured`, `period`, `role`)에서 `name / stack / year / status`가 자동 파생되고, 본문 첫 GitHub URL이 RepoCard 링크가 됨.

GitHub 소셜 카드에 별/포크/언어를 표시하려면 frontmatter에 `stars`, `forks`, `language`, `languageColor`를 추가할 것, 이미지는 블로그와 동일하게 폴더 안에 두고 `![](demo.png)` 상대경로로 참조.

## blogflow 활용

```bash
pip install -e tools/blogflow
blogflow init --topic "글 주제" --post-path content/blog/<slug>/index.md
blogflow brief && blogflow draft && blogflow review && blogflow finalize && blogflow approve && blogflow publish
```

발행 경로는 포스트별 폴더 규칙(`content/blog/<slug>/index.md`)을 그대로 쓰면 되고, `.blogflow/config.yaml`의 `blog_dir: content/blog` 아래라면 유효.

## 참고

- 수동으로 한 번 동기화하려면 `npm run sync:assets`.
