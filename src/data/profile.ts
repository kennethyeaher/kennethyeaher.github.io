import type { SkillPillar, Credential } from "./types";

// Core identity.
export const profile = {
  name: "Kenneth Yeaher",
  tagline:
    "Master of Information Management student building at the intersection of healthcare, data, and access.",
  shortBio:
    "Health tech founder and venture fellow. I build data products and study the gap between the research lab and the clinic floor, spanning data science, ML and NLP research, and HCI.",
  location: "Maryland, USA",
  college: "University of Maryland, College Park",
  email: "kennethyeaher@gmail.com",
  links: {
    github: "https://github.com/kennethyeaher",
    linkedin: "https://linkedin.com/in/kennethyeaher",
    resume: "/resume/kyresume.pdf",
  },
};

// Four practice areas. Each one is backed by a real project,
// which keeps the grid credible instead of a keyword dump.
export const skillPillars: SkillPillar[] = [
  {
    title: "Venture and Product",
    blurb: "Diligence, memos, and product market validation.",
    skills: [
      "Investment diligence",
      "Investment memos",
      "PMF validation",
      "Stakeholder management",
      "Fundraising",
      "PitchBook",
      "Salesforce",
    ],
  },
  {
    title: "Data Science and Analytics",
    blurb: "Pipelines and analysis that drive decisions.",
    skills: [
      "Python (pandas, NumPy)",
      "SQL",
      "Spark",
      "ETL pipelines",
      "Power BI and DAX",
      "Tableau",
      "Excel (PivotTables, VBA)",
    ],
  },
  {
    title: "ML and NLP Research",
    blurb: "Rigorous, statistically grounded experiments.",
    skills: [
      "PyTorch",
      "scikit-learn",
      "LLM evaluation",
      "Zero shot extraction",
      "Bootstrap and McNemar testing",
      "Experimental design",
    ],
  },
  {
    title: "HCI and UX Research",
    blurb: "Understanding people before building product.",
    skills: [
      "User interviews",
      "Usability studies",
      "User centered design",
      "Prototyping",
      "Field research",
    ],
  },
];

// Honors and programs shown on the About page.
export const credentials: Credential[] = [
  {
    name: "Phi Kappa Phi Honor Society",
    detail: "Top 10 percent of graduate students, University of Maryland",
  },
  {
    name: "VC University (NVCA and Berkeley Law)",
    detail: "10 week program on fund economics, term sheets, deal structuring, cap tables",
  },
  {
    name: "Startup Shell Founder",
    detail: "Fall 2022 cohort, top 10 percent of applicants, UMD startup incubator",
  },
  {
    name: "USM Maryland Momentum Fund",
    detail: "Venture Fellow, 2026",
  },
];