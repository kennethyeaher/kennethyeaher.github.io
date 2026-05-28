# Kenneth Yeaher Portfolio

A personal portfolio built with Astro and Tailwind, deployed to GitHub Pages.
Positioning is broad across venture, consulting, and data science, with a
foundation in healthcare, data, and access.

## Quick start

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output to ./dist
npm run check    # type and content check
```

## Editing content

Almost everything lives in the data layer under `src/data`.

- `src/data/profile.ts` controls name, tagline, bio, email, links, skills, credentials.
- `src/data/projects.ts` holds every project. Each one auto generates a card and a page at `/projects/[slug]`.
- `src/data/types.ts` is the shared type contract.

To change brand colors or fonts, edit `tailwind.config.mjs`.

## Project structure

```
src/
  pages/        Astro pages, one file per route
  layouts/      Base shell with head, nav, footer
  components/   Nav, Footer, Card, Badge, ProjectCard
  data/         Single source of truth for content
  scripts/      reveal.ts scroll animation
  styles/       global.css theme and fonts
public/         resume PDF and .nojekyll
```

## Deploying

Push to main. The workflow at `.github/workflows/deploy.yml` builds and deploys
to GitHub Pages. In repo settings, set Pages source to GitHub Actions.

## Code standards

Astro and TypeScript project mapped to the Ischool standards.

- Hierarchical folders that segment by function
- Docstrings on every component and exported function
- Comments before major blocks stating purpose
- Descriptive component and function names
- Shared pieces written once and reused
- package.json and package-lock.json for reproducible installs
- See SECURITY.md for the dependency audit decisions

## Tech stack

Astro, Tailwind CSS, TypeScript. Scroll reveal and project filtering use a few
lines of vanilla JavaScript instead of a framework.
