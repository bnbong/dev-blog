/**
 * Site-wide configuration — profile, navigation, analytics, and comments.
 * Migrated from the legacy MkDocs site (bnbong.github.io).
 */

export const profile = {
  name: "이준혁",
  nameEn: "JunHyeok Lee",
  handle: "@bnbong",
  role: "Server Programmer / Backend Engineer",
  initials: "bb",
  avatar: "/assets/bongo.jpg",
  resume: "/assets/resume.pdf",
  portfolio: "/assets/portfolio.pdf",
  headline: "문제를 흐름으로 보고, 병목은 계측하고 반복은 자동화합니다.",
  bio: "문제를 기능 단위가 아니라 사용자·개발자·운영자의 흐름 단위로 보는 서버 개발자입니다. FastAPI·Spring Boot API, 오픈소스 CLI, AI 추론 서버까지 서버 개발과 운영 자동화를 함께 경험했고, 성과는 latency·비용·WAF/IOPS·다운로드 수처럼 검증 가능한 수치로 확인합니다.",
  intro: "백엔드를 만들고, 배운 것을 기록합니다.",
  location: "경기도 성남시 분당구",
  github: "https://github.com/bnbong",
  email: "bbbong9@gmail.com",
  linkedin: "https://www.linkedin.com/in/%EC%A4%80%ED%98%81-%EC%9D%B4-669733231/",
  naverBlog: "https://blog.naver.com/bnbong",
  instagram: "https://www.instagram.com/j_hyeok__lee/",
  rss: "/feed.xml",
};

/** Categorized tech stack (from the latest portfolio). Rendered grouped on About. */
export const skillGroups: { label: string; items: string[] }[] = [
  { label: "Languages", items: ["Python", "Java", "C", "JavaScript"] },
  { label: "Server", items: ["FastAPI", "Spring Boot", "REST API", "WebSocket", "SQLAlchemy", "JPA", "pytest", "PyTorch"] },
  { label: "Data", items: ["PostgreSQL", "Redis", "MongoDB", "MySQL / MariaDB"] },
  { label: "Infra & Cloud", items: ["Docker", "Kubernetes / OKE", "GitHub Actions", "Jenkins", "OCI", "AWS", "Azure", "GCP", "Nginx"] },
  { label: "Observability & Tools", items: ["EFK / ELK", "Uptime Kuma", "Prometheus / Grafana", "Git", "Slack", "Jira", "Confluence"] },
  { label: "Learning", items: ["TypeScript", "Go", "Terraform / Pulumi", "Helm"] },
];

export const education = [
  {
    org: "한양대학교 ERICA 컴퓨터학부",
    period: "2019.03 – 2026.08 졸업예정",
    notes: [
      "학점 3.76 / 4.5 · 클라우드SW 중급 마이크로전공 이수",
      "졸업 프로젝트: \"CNN + BERT Multimodal Qshing Detection\"",
    ],
  },
  { org: "이매고등학교 졸업", period: "2016.03 – 2019.02", notes: [] },
];

export const work = [
  {
    org: "카카오엔터프라이즈",
    role: "IaaS 기술기획 인턴",
    period: "2024.07 – 2024.08",
    notes: [
      "카카오클라우드 IaaS 제품 기술기획 및 사내 문서화",
      "서비스 개선 6건 · 신규 서비스 기획 5건 수행",
    ],
  },
  {
    org: "K-Buddy 창업팀",
    role: "Backend & DevOps",
    period: "2023.09 – 2024.06",
    notes: [
      "Spring Boot 메인 서버 + FastAPI Mock API 분리로 프론트 연동 테스트와 서버 개발을 병렬화",
      "OCI · Docker · Jenkins · GitHub Actions · EFK · Uptime Kuma 기반 배포/로그/헬스체크 환경 구축",
    ],
  },
  {
    org: "대한민국 공군",
    role: "정보체계관리 / 병장 만기전역",
    period: "2021.04 – 2023.01",
    notes: ["중앙방공통제소 서버 장비 정비, 이중화 인프라·장애 대응 체계 점검"],
  },
  {
    org: "GiftMusic 창업팀",
    role: "Backend",
    period: "2020.09 – 2021.04",
    notes: ["지도 기반 음악 공유 SNS 백엔드(Django) 개발 및 유지보수 (Mugip)"],
  },
];

export const certifications = [
  "정보처리기사 (필기 합격)",
  "정보처리산업기사 (2023.06)",
  "정보처리기능사 (2020.12)",
];

export const awards = [
  { title: "창업우수상", date: "2024.11" },
  { title: "창업우수상", date: "2023.11" },
  { title: "제4회 예술데이터가 바꾸는 세상 아이디어톤 우수상", date: "2023.08" },
];

export const activities = [
  "통기타동아리 JOY — 강사(2020–2025) · 회장(2023) · 부회장(2020)",
  "SW 학회 JARAM 학회원 (2023)",
  "알고리즘 연구 학회 0&1 학회원 (2019)",
];

/** Slugs of the projects to surface as "Featured" on the About page. */
export const featuredProjectSlugs = ["wegis", "fastapi-fastkit", "femu-monitoring"];

/**
 * Open Source — maintained projects and external contributions.
 * Migrated from the legacy docs/open-source/index.md. `slug` links to the
 * project write-up; `upstream` links to the GitHub repo.
 */
export const openSource = {
  intro:
    "오픈소스는 저에게 \"코드로 쓰는 자기소개\"이자 \"빠른 피드백 루프\"입니다. 매일 쓰는 도구의 부족한 부분을 직접 고치거나, 한국어 사용자의 언어 장벽을 낮추는 작은 번역 커밋이라도 꾸준히 쌓아 두려 합니다.",
  maintained: [
    {
      name: "FastAPI-fastkit",
      slug: "fastapi-fastkit",
      upstream: "https://github.com/bnbong/FastAPI-fastkit",
      desc: "FastAPI 기반 백엔드 프로젝트의 부트스트랩을 가속하는 CLI + 템플릿 모음. Python 생태계 의존성 관리와 프로젝트 구조 표준화에 초점을 맞췄습니다.",
      contributions: [
        "템플릿 스캐폴딩 CLI 설계 및 유지보수",
        "다중 템플릿(Async/Sync) 관리 구조",
        "문서화 및 사용자 피드백 반영 사이클 운영",
      ],
    },
  ],
  contributions: [
    {
      name: "Azure SDK for Python",
      slug: "azure-sdk-python",
      upstream: "https://github.com/Azure/azure-sdk-for-python",
      desc: "Microsoft Azure의 Python SDK 저장소에 기여.",
      contributions: ["샘플 및 문서 개선 PR", "재현 가능한 이슈 리포트"],
    },
    {
      name: "Azure SDK for Python — Korean Docs",
      slug: "azure-sdk-python-kor",
      upstream: "https://github.com/Azure/azure-docs-sdk-python",
      desc: "Azure Python SDK 공식 문서의 한국어 번역/현지화 기여.",
      contributions: ["기술 용어 일관성을 지킨 번역 커밋", "오탈자/링크 교정"],
    },
    {
      name: "Blog Post Workflow",
      slug: "blog-post-workflow",
      upstream: "https://github.com/gautamkrishnar/blog-post-workflow",
      desc: "GitHub 프로필 README에 블로그 RSS 목록을 자동 동기화해 주는 GitHub Action.",
      contributions: ["특정 피드 파싱 케이스 버그 수정 / 기능 PR"],
    },
    {
      name: "FEMU Monitoring & Hot/Cold",
      slug: "femu-monitoring",
      upstream: "https://github.com/MoatLab/FEMU",
      desc: "가상 SSD 에뮬레이터 FEMU에 WAF/IOPS/Latency 계측 모듈을 추가하고, Hot/Cold 데이터 분리 기법을 얹은 개인 연구 프로젝트.",
      contributions: ["WAF / Throughput / Latency 계측 모듈", "Hot/Cold write pointer 분리 및 FTL 수정"],
    },
  ],
};

/** Google Analytics 4 — migrated from the legacy mkdocs.yml. */
export const analytics = {
  gaId: "G-G1E1JBX2WR",
};

/**
 * giscus (GitHub Discussions comments) — attached to the bnbong/dev-blog repo.
 *
 * `repoId` and `categoryId` are GitHub node IDs unique to this repo + category,
 * so they must be generated from https://giscus.app and pasted below. Until
 * they are filled in, the comments section renders a styled placeholder
 * instead of breaking. Setup steps are in README.md ("giscus 댓글 연결").
 */
export const giscus = {
  enabled: true,
  repo: "bnbong/dev-blog",
  repoId: "R_kgDOS6Y17Q",
  category: "Announcements",
  categoryId: "DIC_kwDOS6Y17c4C_I46",
  mapping: "pathname" as const,
  strict: "0" as const,
  reactionsEnabled: "1" as const,
  inputPosition: "bottom" as const,
  // The blog has no dark-mode toggle — it's always light (warm paper #FDFBF6).
  // `preferred_color_scheme` would follow the visitor's OS and flip to dark,
  // mismatching the page. Use a fixed light theme instead.
  theme: "light" as const,
  // Optional exact match: host the bundled custom theme on the deployed site
  // and put its ABSOLUTE url here (e.g. "https://bnbong.github.io/giscus-theme.css").
  // When set, it overrides `theme`. Leave "" to use the built-in `light` theme.
  // (Must be an absolute https URL — a relative path won't load inside the giscus iframe.)
  themeUrl: "",
  lang: "ko" as const,
};
