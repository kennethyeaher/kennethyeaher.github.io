import type {
  SkillPillar,
  Credential,
  SkillGroup,
  WorkExperience,
  Education,
  Certification,
  Hobby,
} from "./types";

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
// Credential pills shown under the name on the About page header.
export const credentialPills: string[] = [
  "Venture Fellow",
  "Founder",
  "Data Analyst",
  "MIM Candidate",
];

// Professional summary paragraphs for the About page.
export const summary: string[] = [
  "I am a Master of Information Management student at the University of Maryland aiming at venture capital, tech consulting, and data science. My throughline is access. I was born in Monrovia, Liberia, where most clinics still run on paper, and that problem is what pulled me into technology and the decisions behind it.",
  "I have built and evaluated companies. As a founder I raised $25K and ran more than 60 physician interviews for Frontground, a mobile first EMR for low resource clinics. As a Venture Fellow at the USM Maryland Momentum Fund I run sourcing stage diligence and coauthor investment memos. In between I have shipped data products and clinical NLP research grounded in real healthcare problems.",
  "Having sat in the founder seat, I read companies and problems from the inside, which is the judgment venture, consulting, and data roles reward. Healthcare access stays the value underneath the work, but the throughline is broader. I want to evaluate and build at the intersection of data, technology, and the decisions that move them.",
];

// Skill groups shown as cards. Icon is a lucide style line icon name.
export const skillGroups: SkillGroup[] = [
  {
    title: "Venture and Investing",
    icon: "trending-up",
    skills: [
      "Investment Diligence",
      "Investment Memos",
      "Cap Table Modeling",
      "Term Sheets",
      "Early Stage Investing",
      "Founder Diligence",
      "PitchBook",
    ],
  },
  {
    title: "Data and Analytics",
    icon: "bar-chart",
    skills: [
      "Python (pandas, NumPy)",
      "SQL",
      "Spark",
      "R (tidyverse)",
      "ETL Pipelines",
      "Power BI",
      "Tableau",
      "Excel (VBA)",
      "Neo4j",
    ],
  },
  {
    title: "ML and Research",
    icon: "flask",
    skills: [
      "PyTorch",
      "scikit-learn",
      "LLM Evaluation",
      "Experimental Design",
      "Statistical Testing",
      "Quantitative Research",
    ],
  },
  {
    title: "Tools and Platforms",
    icon: "wrench",
    skills: [
      "Salesforce",
      "Jira",
      "Trello",
      "Airtable",
      "Notion",
      "Figma",
      "Git",
    ],
  },
];

// Work experience timeline. Strongest roles first.
export const workExperience: WorkExperience[] = [
  {
    title: "Venture Fellow",
    org: "USM Maryland Momentum Fund",
    location: "Baltimore, MD",
    period: "Jan 2026 to Present",
    bullets: [
      "Lead sourcing stage diligence on early stage startups, building structured theses across technology, market, business model, traction, team, and moat from primary founder materials and external research.",
      "Drive founder diligence calls with structured question sets on moat defensibility, unit economics, scalability, and failure modes, then coauthor the resulting investment memos delivered to the fund partners.",
      "Surface a deal highest conviction risks, including pre revenue projections, manufacturing scale up, and customer concentration, and issue pursue, track, or pass recommendations grounded in them.",
    ],
    tags: ["Early Stage Investing", "Venture Financing", "Diligence", "Investment Memos"],
  },
  {
    title: "Data Analyst",
    org: "Towers Surgical Partners",
    location: "Rockville, MD",
    period: "May 2024 to June 2025",
    bullets: [
      "Engineered a Python ETL pipeline aggregating provider data across fragmented healthcare directories, reducing manual research workload 70 percent and accelerating provider network expansion analysis.",
      "Built Tableau dashboards and geographic coverage models across major US metros analyzing referral flow, revenue, and procedure trends, which leadership used to set provider recruitment priorities.",
      "Built network tracking tools adopted by leadership and a pipeline processing 5,000 plus insurance documents, surfacing revenue cycle inefficiencies to support litigation billing review.",
    ],
    tags: ["Python", "ETL", "Tableau", "Data Cleaning", "Healthcare"],
  },
  {
    title: "Cofounder and CEO",
    org: "Frontground",
    location: "College Park, MD",
    period: "Sept 2022 to May 2024",
    bullets: [
      "Founded and led an early stage health tech startup from concept to go to market, securing $25K in non dilutive funding across competitive pitch processes, including the Pitch Dingman Competition Social Impact Award.",
      "Ran more than 60 physician interviews across Liberian healthcare facilities to validate product market fit and map adoption barriers, turning primary field research into the product roadmap.",
      "Built and managed relationships with physicians and health administrators in Monrovia and university advisors, converting their feedback into product and partnership decisions.",
    ],
    tags: ["Founder", "Fundraising", "Product Management", "User Research"],
  },
  {
    title: "Member, Founder Track",
    org: "Startup Shell",
    location: "College Park, MD",
    period: "Oct 2022 to Dec 2024",
    bullets: [
      "Admitted to the Fall 2022 cohort, top 10 percent of applicants, of UMD student run startup incubator, joining a community of founders building venture stage companies while developing Frontground.",
    ],
    tags: ["Venture Capital", "Entrepreneurship"],
  },
];

// Compact list of earlier fellowships and programs.
export const fellowships: Certification[] = [
  {
    name: "Equity Incubator Fellow",
    issuer: "The Lab for Entrepreneurship and Transformative Leadership",
    detail: "Feb 2023 to Apr 2023. Startup fundraising and investor pitching.",
  },
  {
    name: "Do Good Accelerator Fellow",
    issuer: "Do Good Institute, University of Maryland",
    detail: "Two cohorts, 2022 and 2023. Social impact venture acceleration.",
  },
  {
    name: "Startup School Student",
    issuer: "Y Combinator",
    detail: "2022. Early stage startup curriculum.",
  },
  {
    name: "Product Design Intern",
    issuer: "hiveSocial",
    detail: "Nov 2021 to Mar 2022. Figma and Adobe XD product design.",
  },
  {
    name: "Freshman Leadership Summit",
    issuer: "PwC",
    detail: "2020. Leadership case competition and professional pitching.",
  },
];

// Education entries.
export const education: Education[] = [
  {
    degree: "Master of Science, Information Management",
    school: "University of Maryland",
    location: "College Park, MD",
    period: "Expected May 2027",
    honors: ["Phi Kappa Phi Honor Society"],
    activities: [],
  },
  {
    degree: "Bachelor of Science, Information Science",
    school: "University of Maryland",
    location: "College Park, MD",
    period: "Dec 2024",
    honors: [],
    activities: [],
  },
];

// Programs and certifications shown as cards.
export const certifications: Certification[] = [
  {
    name: "VC University",
    issuer: "NVCA and Berkeley Law",
    detail: "10 week program on fund economics, term sheets, deal structuring, and cap table modeling, taught by partners at Andreessen Horowitz, Bessemer, and Forerunner.",
  },
  {
    name: "Phi Kappa Phi Honor Society",
    issuer: "University of Maryland",
    detail: "Inducted into the nation oldest and most selective honor society, top 10 percent of graduate students.",
  },
  {
    name: "Startup Shell Founder",
    issuer: "University of Maryland",
    detail: "Fall 2022 cohort, top 10 percent of applicants, of the student run startup incubator.",
  },
];

// Hobbies and interests.
export const hobbies: Hobby[] = [
  {
    name: "Manchester United",
    blurb: "Devoted EPL supporter, never missing a match.",
    icon: "trophy",
  },
  { name: "Hiking", blurb: "Getting out on trails whenever I can.", icon: "mountain" },
  { name: "Camping", blurb: "Time outdoors away from the screen.", icon: "tent" },
  { name: "Legos", blurb: "Building intricate sets piece by piece.", icon: "blocks" },
  { name: "Lacrosse", blurb: "Playing and following the game.", icon: "target" },
  { name: "Soccer", blurb: "Playing pickup whenever there is a game.", icon: "circle-dot" },
];
