<div align="center">

# Kenneth Yeaher Portfolio

### Venture, Data, and Access

![Astro](https://img.shields.io/badge/Astro-5.18-FF5D01?style=flat&logo=astro&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript&logoColor=white)
![Node](https://img.shields.io/badge/Node-24-339933?style=flat&logo=node.js&logoColor=white)
![Deploy](https://img.shields.io/badge/Deploy-GitHub_Pages-181717?style=flat&logo=github&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)
![Status](https://img.shields.io/badge/Status-Live-brightgreen?style=flat)

**Personal portfolio for venture capital, tech consulting, and data science work, grounded in healthcare, data, and access.**

[Live Site](https://kennethyeaher.github.io) · [Quick Start](#quick-start) · [Editing Content](#editing-content) · [Architecture](#architecture) · [Design Decisions](#design-decisions)

---

</div>

<div align="center">

![Kenneth Yeaher Portfolio hero](public/images/portfolio-hero.png)

</div>

## Overview

A static, hand coded portfolio site that also doubles as INST graded coursework. Every commit is intentional, every component is documented, and the data layer is the single source of truth for everything visible on the site. The visual identity uses a deep green accent over cool grays, with Fraunces for display, Newsreader for body, and JetBrains Mono for labels.

The site positions me across three tracks: venture capital, tech consulting, and data science, with healthcare access as the throughline. It replaces my earlier Adobe portfolio with a static, version controlled rebuild that ships quickly and can be edited almost entirely from the data layer.

> **Core principle:** Content is data. Design is code. Every change is a commit.

---

## Quick Start

```bash
# 1. Clone the repository
git clone git@github.com:kennethyeaher/kennethyeaher.github.io.git
cd kennethyeaher.github.io

# 2. Install dependencies
npm install

# 3. Run the dev server
npm run dev        # http://localhost:4321

# 4. Build a static export
npm run build      # output to ./dist

# 5. Type and content check, must show 0 errors before every commit
npm run check
```

> **Note:** Node 24 and npm 11 are required. Use `nvm use 24` if you manage Node versions through nvm. The check step prints a few harmless `languageId not found .../astro` lines that are not errors.

---

## Editing Content

Almost everything visible on the site lives in the data layer under `src/data`. Components read from these files, so editing a single TypeScript object updates every place that data appears.

| File | Controls |
|---|---|
| `src/data/profile.ts` | Name, tagline, bio, email, links, skills, credentials, work experience, education, certifications, case studies, coursework, hobbies |
| `src/data/projects.ts` | Every project. Each entry creates a card on the Projects page and a detail page at `/projects/[slug]` |
| `src/data/types.ts` | Shared TypeScript contracts for all data files |
| `tailwind.config.mjs` | Brand colors and fonts |

<details>
<summary><strong>Adding a new project</strong></summary>

<br>

Add a new object to the `projects` array in `src/data/projects.ts`. The required fields are defined by the `Project` interface in `types.ts`: slug, title, role, category, period, tagline, featured flag, tags, links, metrics, and sections. Astro statically creates a route for the slug at build time through `getStaticPaths` in `src/pages/projects/[slug].astro`, so no extra wiring is needed.

</details>

<details>
<summary><strong>Adding a new project category</strong></summary>

<br>

Three places must stay in sync:

1. `src/data/types.ts`, add the new string to the `ProjectCategory` union.
2. `src/data/projects.ts`, use the new category on relevant entries.
3. `src/pages/projects/index.astro`, add the new string to the `filters` array.

TypeScript will catch any mismatch when you run `npm run check`.

</details>

<details>
<summary><strong>Adjusting brand colors</strong></summary>

<br>

The palette is defined in `tailwind.config.mjs` under `theme.extend.colors`. Four token families drive the site: `ink` for text, `paper` for light mode surfaces, `accent` for the green highlight and its dark mode and warm reserve variants, and `night` for dark mode surfaces. Components reference tokens by name, never raw hex, so a single edit updates the full site.

</details>

---

## Architecture

```text
src/
  pages/         Astro pages, one file per route
    index.astro
    about.astro
    contact.astro
    projects/
      index.astro    Project grid with category filter
      [slug].astro   Project detail page, statically generated per slug
  layouts/
    Base.astro       Head, nav, footer shell
  components/
    Nav.astro        Sticky site header with theme toggle
    Footer.astro
    Card.astro       Bordered surface used everywhere
    Badge.astro      Mono uppercase chip
    ProjectCard.astro
  data/
    profile.ts       Identity, skills, experience, education, hobbies
    projects.ts      All projects
    types.ts         TypeScript interfaces shared across the site
  scripts/
    reveal.ts        Scroll triggered fade in animation
  styles/
    global.css       Tailwind layers, font face declarations, base styles
public/
  images/            Photos, lab screenshots
  projects/          Project artifacts like infographics and PDFs
  resume/            Resume PDF
  .nojekyll          Tells GitHub Pages to skip Jekyll processing
.github/workflows/
  deploy.yml         Build and deploy on push to main
SECURITY.md          Dependency audit decisions
```

<details>
<summary><strong>Page Routes</strong></summary>

<br>

| Route | File | Description |
|---|---|---|
| `/` | `src/pages/index.astro` | Home page with centered hero, credential line, skills grid, featured projects |
| `/about` | `src/pages/about.astro` | Full profile, summary, skills, work experience, education, certifications, case studies, coursework, hobbies |
| `/projects` | `src/pages/projects/index.astro` | Project grid with category filter |
| `/projects/[slug]` | `src/pages/projects/[slug].astro` | Project detail page generated per slug at build time |
| `/contact` | `src/pages/contact.astro` | Email, LinkedIn, GitHub, resume |

</details>

<details>
<summary><strong>Component Catalog</strong></summary>

<br>

| Component | Purpose |
|---|---|
| `Base.astro` | Layout shell. Wraps every page with head, sticky nav, and footer |
| `Nav.astro` | Sticky site header with active link highlighting, theme toggle, and brand wordmark |
| `Footer.astro` | Copyright and links to GitHub, LinkedIn, and email |
| `Card.astro` | Bordered surface used for skill cards, education cards, project cards, hobby cards, and case study cards |
| `Badge.astro` | Mono uppercase chip used for tags, honors, activities, and credential pills |
| `ProjectCard.astro` | Summary card for one project. Renders tags, title, role, tagline, and optional metrics. Wraps the full card in a link to the project detail page |

</details>

---

## Design Decisions

<details>
<summary><strong>Why Astro over Next.js</strong></summary>

<br>

Astro ships zero JavaScript by default. The site is content heavy and interaction light, so React or Vue level reactivity would be extra weight. The two interactive pieces, the project category filter and scroll reveal animation, are written in a few lines of vanilla JavaScript that never enter a large bundle. The result is a static export that loads quickly on a cold cache.

</details>

<details>
<summary><strong>Data layer as single source of truth</strong></summary>

<br>

Every piece of content on the site, from the skills grid to project metrics to hobby blurbs, lives in `src/data`. Components are pure renderers that take that data and lay it out. Adding a new role, certification, or project does not require editing a component. This makes the site easier to maintain and keeps the visual layer free of hardcoded strings.

</details>

<details>
<summary><strong>Palette and typography</strong></summary>

<br>

The visual system uses one deep green accent on cool grays, with maroon held in reserve. Green connects to growth and health without falling into the generic blue fintech look. Fraunces for display, Newsreader for body, and JetBrains Mono for labels gives each page a serif anchor and a more editorial feel than the usual sans serif startup default.

</details>

<details>
<summary><strong>No icon library, hand drawn SVG paths</strong></summary>

<br>

Every line icon on the About page is a hand drawn SVG path defined inline in `about.astro`. No icon library is loaded, there are no extra HTTP requests, and the path strokes inherit the accent color through `currentColor`. Sections have unique icons: target for Skills, briefcase for Work, graduation cap for Education, award for Certifications, flask for Case Studies, bar chart for Coursework, heart for Hobbies, plus a unique icon per skill and hobby card.

</details>

<details>
<summary><strong>Static export to GitHub Pages</strong></summary>

<br>

The site is a static export served from GitHub Pages, with no CDN configuration, no AWS, and no runtime server. `.github/workflows/deploy.yml` builds the site and deploys it on every push to `main`. Pages source in repo settings must be set to GitHub Actions, not default branch deploy. Total infrastructure footprint: one workflow file.

</details>

---

## Deploy Pipeline

```bash
# Local
git add .
git commit -m "short message"
git push origin main

# Remote
# GitHub Actions runs .github/workflows/deploy.yml
# Builds with npm run build, uploads ./dist as a Pages artifact, deploys to https://kennethyeaher.github.io
```

<details>
<summary><strong>First time setup</strong></summary>

<br>

GitHub Pages on this repo uses the Actions deploy source, not the default Jekyll branch deploy. The Pages source must be set to **GitHub Actions** in repo settings, otherwise Jekyll tries to build and fails. The `.nojekyll` file in `public/` ensures any future Jekyll source override still skips Jekyll processing.

</details>

---

## Code Standards

Astro and TypeScript project mapped to iSchool standards.

| Standard | Where it lives |
|---|---|
| Hierarchical folders segmented by function | `src/pages`, `src/components`, `src/data`, `src/layouts`, `src/scripts`, `src/styles` |
| Docstrings on every component and exported function | Astro component frontmatter, TypeScript JSDoc on exports |
| Comments before major blocks stating purpose | Above every `section`, `map`, and conditional render |
| Descriptive component and function names | `ProjectCard`, `getProjectBySlug`, `getFeaturedProjects` |
| Shared pieces written once and reused | `Card`, `Badge`, `Base` used across every page |
| Reproducible installs | `package.json` and `package-lock.json` committed |
| Type and content check before every commit | `npm run check` must report `0 errors` |

Writing style is enforced for all prose and comments:

- No em dashes anywhere
- No hyphenated words in prose, comments, or commit messages. Hyphens are allowed only in CSS classes, URL slugs, and package names
- Commit messages are short, sentence cased, and no colons

See `SECURITY.md` for the dependency audit decisions, including the dev only `npm audit` findings deliberately left unfixed.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Astro 5 |
| Styling | Tailwind CSS 3 |
| Language | TypeScript 5 |
| Runtime | Node 24, npm 11 |
| Hosting | GitHub Pages |
| CI | GitHub Actions |
| Fonts | Fraunces, Newsreader, JetBrains Mono |
| Icons | Hand drawn inline SVG paths |
| Animation | Vanilla JavaScript scroll reveal |

---

<div>

## Author

**Kenneth Yeaher**  
Master of Information Management, Class of 2027  
University of Maryland, College Park  
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Kenneth_Yeaher-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/kennethyeaher/)  
[![GitHub](https://img.shields.io/badge/GitHub-kennethyeaher-181717?style=flat&logo=github&logoColor=white)](https://github.com/kennethyeaher)  
[![Email](https://img.shields.io/badge/Email-kennethyeaher@gmail.com-D14836?style=flat&logo=gmail&logoColor=white)](mailto:kennethyeaher@gmail.com)

`Venture Capital` · `Data Science` · `Tech Consulting` · `Healthcare Access`

</div>