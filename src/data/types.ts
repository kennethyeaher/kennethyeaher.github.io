// Type definitions for all site content.
// Keeping these in one place gives every component a clear contract
// and makes the data files self documenting.

/** A single headline metric shown on a project, like "1,038 counties". */
export interface Metric {
  value: string;
  label: string;
}

/** An external link attached to a project, like a repo, slide deck, or Figma file. */
export interface ProjectLink {
  label: string;
  url: string;
}

/** One titled prose block inside a project case study. */
export interface ProjectSection {
  heading: string;
  body: string;
}

/** The kind of external content an embed points at. Drives how it renders later. */
export type EmbedKind = "slides" | "doc" | "figma" | "pdf";

/** An inline embed of external content. Added now, rendered when URLs are ready. */
export interface ProjectEmbed {
  kind: EmbedKind;
  title: string;
  url: string;
}

/** The category a project belongs to. Drives filtering on the Projects page. */
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
  /** Optional inline embeds (slides, docs, Figma). Omit if none. */
  embeds?: ProjectEmbed[];
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
/** A skill group shown as a card on the About page, with a line icon. */
export interface SkillGroup {
  title: string;
  icon: string;
  skills: string[];
}

/** One role in the work experience timeline. */
export interface WorkExperience {
  title: string;
  org: string;
  location: string;
  period: string;
  bullets: string[];
  tags: string[];
}

/** A degree or education entry. */
export interface Education {
  degree: string;
  school: string;
  location: string;
  period: string;
  honors: string[];
  activities: string[];
  /** Optional prose description of the degree. */
  description?: string;
  /** Optional GPA, like "4.0". */
  gpa?: string;
}

/** A program, fellowship, or certification shown as a card. */
export interface Certification {
  name: string;
  issuer: string;
  detail: string;
  /** Optional issue date, like "Apr 2026". */
  issued?: string;
}

/** A hobby or interest shown as a small card. */
export interface Hobby {
  name: string;
  blurb: string;
  icon: string;
  /** Optional image path under /images. */
  image?: string;
  /** Alt text for the image. */
  imageAlt?: string;
}
