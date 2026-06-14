<p align="center">
  <img width="200" src="public/assets/bongo.jpg" alt="mybongocat"/>
</p>
<p align="center">
<em>비엔봉 개발 블로그</em>
<p align="center">
<img src="https://img.shields.io/badge/Next-black.svg?style=flat&logo=next.js&logoColor=white" alt="Next.js"/>
<img src="https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB" alt="React"/>
<img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white" alt="TypeScript"/>
</p>

---

히히 블로그 발사

## 기술 스택

- **Next.js 15** (App Router, `output: "export"` 정적 export) · **React 19** · TypeScript
- **Markdown** 콘텐츠 — `gray-matter`(frontmatter) + `marked` + 커스텀 전처리기([lib/markdown.ts](lib/markdown.ts))
- **giscus** 댓글 (GitHub Discussions) · **Google Analytics 4**
- 폰트: Pretendard(self-hosted) · Space Grotesk · JetBrains Mono · 브랜드 컬러 `#E1B978`
- 디자인: Claude Design

## 개발

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # 정적 사이트를 out/ 에 export
```
