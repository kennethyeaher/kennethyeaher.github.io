import { caseStudies } from "./caseStudies.mjs";

/** Public identity, writing, and contact details used across the portfolio. */
export const profile = {
  name: "Kenneth Yeaher",
  shortName: "Ken",
  roleLine: "Product Specialist, Data Scientist, Venture Capitalist",
  headline: "I’m Ken, a product specialist led by evidence.",
  intro:
    "I study how people move through systems, build with the data those systems leave behind, and use both to decide what should exist next.",
  aboutHeadline: "I build where people, data, and decisions meet.",
  aboutParagraphs: [
    "Human-computer interaction is the thread connecting my work. I’m a Master of Information Management student at the University of Maryland, and I start projects by learning how people actually navigate a system before I decide what to build, measure, or recommend.",
    "That approach is personal. I was born in Monrovia, Liberia, where many clinics still run on paper. The gap between what technology can do and who can reliably use it pulled me toward healthcare access, product research, and the decisions behind both.",
    "I have built and evaluated companies. As the founder of Frontground, I raised $25K in non-dilutive funding and ran more than 60 physician interviews for a mobile-first electronic medical record for low-resource clinics. At the USM Maryland Momentum Fund, I screened companies, led sourcing-stage diligence, supported expert panels, and co-authored investment work for the fund’s leadership.",
    "I also work from raw data to a decision someone can act on. At Towers Surgical Partners, I built Python ETL pipelines and Tableau dashboards that helped leadership see provider coverage, referral patterns, and revenue-cycle problems more clearly. Across product, venture, and data work, my job is the same: find the signal, explain it plainly, and make the next move more useful for the people involved.",
  ],
  availability:
    "Open to product, venture, data, and HCI opportunities where research can shape what gets built.",
  email: "kennethyeaher@gmail.com",
  links: {
    linkedin: "https://linkedin.com/in/kennethyeaher",
    github: "https://github.com/kennethyeaher",
    resume: "/resume/kyresume.pdf",
  },
};

/** Compact professional history shown beside the home-page thesis. */
export const experience = [
  {
    year: "2026",
    organization: "USM Maryland Momentum Fund",
    role: "Summer Investment Associate",
  },
  {
    year: "2026",
    organization: "USM Maryland Momentum Fund",
    role: "Venture Fellow",
  },
  {
    year: "2025",
    organization: "Towers Surgical Partners",
    role: "Data Analyst",
  },
  {
    year: "2024",
    organization: "Towers Surgical Partners",
    role: "Data Analyst Intern",
  },
  {
    year: "2022",
    organization: "Frontground",
    role: "Founder",
  },
];

/**
 * Available About-page photography. Additional user-supplied photographs can
 * be added here without rendering empty image placeholders in the meantime.
 */
export const aboutGallery = [
  {
    src: "/images/kenneth.jpg",
    alt: "Portrait of Kenneth Yeaher",
    group: "01. Product specialist",
    caption: "Listening first, then turning evidence into a product decision.",
    ratio: "portrait",
  },
];

/** Five publishable project records that drive the Work page and case studies. */
export const projects = caseStudies;

/** Return the selected work in its approved narrative order. */
export function getFeaturedProjects() {
  return [...projects];
}

/** Find one project by its stable route slug. */
export function getProjectBySlug(slug) {
  return projects.find((project) => project.slug === slug);
}

/** Resolve the previous or next project and wrap at either end. */
export function getAdjacentProject(slug, direction) {
  const index = projects.findIndex((project) => project.slug === slug);
  if (index === -1) {
    throw new Error(`Unknown project slug: ${slug}`);
  }
  if (direction !== "previous" && direction !== "next") {
    throw new Error(`Unknown project direction: ${direction}`);
  }

  const offset = direction === "next" ? 1 : -1;
  const targetIndex = (index + offset + projects.length) % projects.length;
  return projects[targetIndex];
}
