<p align="center">
  <img src="docs/readme/banner.svg" alt="Kenneth Yeaher. Product, research, data, and venture." width="100%">
</p>

<p align="center">
  <img alt="Astro + TypeScript" src="https://img.shields.io/badge/Astro%20%2B%20TypeScript-243D69?style=flat-square">
  <a href="https://kennethyeaher.github.io/"><img alt="Open live site" src="https://img.shields.io/badge/demo-live-243D69?style=flat-square"></a>
</p>

<p align="center"><a href="https://kennethyeaher.github.io/">Live site ↗</a> &nbsp; · &nbsp; <a href="src/data/portfolio.mjs">Content model</a> &nbsp; · &nbsp; <a href=".github/workflows/deploy.yml">Deployment workflow</a></p>

## Overview

An editorial portfolio connecting product design, human-computer interaction, data analysis, and venture work. Built with Astro and TypeScript, with shared case-study components and one maintained content model.

## At a glance

| Area | What to look for |
| --- | --- |
| **Work** | Project stories connect the problem, process, source artifacts, and decisions. |
| **About** | A focused biography and gallery use the same content model as the rest of the site. |
| **Implementation** | Reusable layouts, typed diagnostics, content checks, and automated Pages deployment. |

## Start here

```sh
npm ci
npm run dev
```

The repository also provides `npm test`, `npm run check`, and `npm run build` for verification.

## Scope

Case-study media and project claims are source-backed. The documentation banner is a visual identifier, not a substitute for project evidence.

---

<details>
<summary><strong>Routes, content editing, verification, and repository structure</strong></summary>

# Kenneth Yeaher Portfolio

A light-mode editorial portfolio for Kenneth Yeaher’s product, data, venture, and human-computer interaction work. The site is built with Astro and TypeScript and uses one verified content model for the Work page and five case studies.

## Local preview

```bash
npm ci
npm run dev
```

The default local address is `http://127.0.0.1:4321/` when the preview is started with the host and port used during QA.

## Verification

```bash
npm test
npm run check
npm run build
```

- `npm test` checks the content model, navigation shell, Work and About pages, case-study routes, factual guardrails, media references, and résumé integrity.
- `npm run check` runs Astro and TypeScript diagnostics.
- `npm run build` produces the static site in `dist/`.

## Current routes

| Route | Purpose |
|---|---|
| `/` | Work page with the editorial introduction, experience, and five featured projects |
| `/about` | HCI-focused biography, identity lanes, and the real-photo-only gallery |
| `/work/[slug]` | Reusable evidence-led case-study page |
| `/resume/kyresume.pdf` | Byte-for-byte copy of the supplied master résumé PDF |

Former `/projects`, `/contact`, and `/education` URLs are retained as redirects so stale duplicate pages are not published.

## Editing content

The current public content lives in [`src/data/portfolio.mjs`](src/data/portfolio.mjs). It controls:

- header identity and contact links;
- home-page experience;
- About writing and gallery entries;
- project order, copy, metrics, media, and case-study chapters.

Add future user-supplied About photographs to the `aboutGallery` array only after placing the real files in `public/images/`. The page intentionally creates no empty photo placeholders.

Project visuals live under `public/images/work/`. Every visible project image is a user-approved source artifact or a direct Figma export. Do not substitute CSS drawings, handcrafted SVGs, emoji, or generic placeholders for evidence.

## Structure

```text
src/
  components/       Shared navigation, cards, gallery, media, and case-study UI
  data/portfolio.mjs
  layouts/Base.astro
  pages/
    index.astro
    about.astro
    work/[slug].astro
  scripts/site.ts   Mobile navigation, reveal behavior, chapter state, and cursor
  styles/global.css
public/
  images/work/
  resume/kyresume.pdf
tests/
qa/                 Browser captures and the source-to-implementation comparison
design-qa.md         Final visual QA record
```

## Published site

The portfolio is published at [kennethyeaher.github.io](https://kennethyeaher.github.io/). Pushes to `main` are verified and deployed automatically through GitHub Pages.

</details>
