// Type definitions for all site content.
// Keeping these in one place gives every component a clear contract
// and makes the data files self documenting.

/** A single headline metric shown on a project, like "1,038 counties". */
export interface Metric {
  value: string;
  label: string;
}

/** An external link attached to a project, like a repo or live demo. */
export interface ProjectLink {
  label: string;
  url: string;
}

/** One titled prose block inside a project case study. */
export interface ProjectSection {
  heading: string;
  body: string;
}

/** The category a project belongs to. Drives filtering on the Research and VC pages. */
export type ProjectCategory =
  | "Venture"
  | "Data Science"
  | "ML / NLP Research"
  | "HCI / UX Research";

/** A full project case study. Renders as a card and its own detail page. */
export interface Project {
  slug: string;
  title: string;
  role: string;
  category: ProjectCategory;
  period: string;
  tagline: string;
  featured: boolean;
  tags: string[];
  links: ProjectLink[];
  metrics: Metric[];
  sections: ProjectSection[];
}

/** A grouped set of skills shown on the home page. */
export interface SkillPillar {
  title: string;
  blurb: string;
  skills: string[];
}

/** An honor, program, or fellowship shown on the About page. */
export interface Credential {
  name: string;
  detail: string;
}