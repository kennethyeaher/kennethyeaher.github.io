import { caseStudies } from "./caseStudies.mjs";

/** Public identity, writing, and contact details used across the portfolio. */
export const profile = {
  name: "Kenneth Yeaher",
  shortName: "Ken",
  roleLine: "Product Designer and Data Scientist",
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

/**
 * Compact professional history shown beside the home-page thesis.
 * NOTE: `experience` is the compact home-page list pinned by
 * tests/portfolio-model.test.mjs, and `roles` below is the full About-page
 * timeline. They overlap on purpose; do not reconcile or merge them.
 */
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
  {
    year: "2021",
    organization: "hiveSocial",
    role: "Product Design Intern",
  },
];

/**
 * Full About-page career timeline.
 * NOTE: `experience` above is the compact home-page list pinned by
 * tests/portfolio-model.test.mjs, and `roles` is the full About-page
 * timeline. They overlap on purpose; do not reconcile or merge them.
 */
export const roles = [
  {
    title: "Summer Investment Associate",
    organization: "USM Maryland Momentum Fund",
    location: "Baltimore, MD",
    period: "June 2026 to Present",
    bullets: [
      "Joining the investment team to support sourcing and diligence across early stage deals, building on a fellowship that earned a return offer for the role.",
      "Contributing to founder diligence and the structured analysis behind investment memos delivered to fund partners.",
      "Tracking deal flow and market research to help surface high potential companies for the fund.",
    ],
  },
  {
    title: "Venture Fellow",
    organization: "USM Maryland Momentum Fund",
    location: "Baltimore, MD",
    period: "Jan 2026 to June 2026",
    bullets: [
      "Led sourcing stage diligence on early stage startups, building structured theses across technology, market, business model, traction, team, and moat from primary founder materials and external research.",
      "Drove founder diligence calls with structured question sets on moat defensibility, unit economics, scalability, and failure modes, then coauthored the resulting investment memos delivered to the fund partners.",
      "Surfaced a deal highest conviction risks, including pre revenue projections, manufacturing scale up, and customer concentration, and issued pursue, track, or pass recommendations grounded in them.",
    ],
  },
  {
    title: "Data Analyst",
    organization: "Towers Surgical Partners",
    location: "Rockville, MD",
    period: "Jan 2025 to June 2025",
    bullets: [
      "Architected an end to end Python ETL pipeline aggregating provider data across fragmented healthcare directories, reducing manual research workload 70 percent and accelerating provider network expansion analysis.",
      "Delivered Tableau dashboards analyzing referral flow, revenue, and procedure trends to improve decision visibility for leadership.",
      "Analyzed reimbursement and claims data to surface revenue cycle inefficiencies during litigation billing review, building a pipeline that processed 5,000 plus insurance documents.",
      "Built geographic coverage models across major US metros to guide provider recruitment priorities.",
    ],
  },
  {
    title: "Data Analyst Intern",
    organization: "Towers Surgical Partners",
    location: "Rockville, MD",
    period: "May 2024 to Dec 2024",
    bullets: [
      "Built internal tracking tools adopted by leadership to monitor provider network growth, enabling the team to prioritize outreach and manage a growing portfolio of partner relationships.",
      "Scraped and verified physician data across 100 major US metro areas for NGYNSS, a national gynecological specialist directory supporting patient navigation and healthcare market analysis.",
    ],
  },
  {
    title: "Founder",
    organization: "Frontground",
    location: "College Park, MD",
    period: "Sept 2022 to May 2024",
    bullets: [
      "Founded and led an early stage health tech startup from concept to go to market, securing $25K in non dilutive funding across competitive pitch processes, including the Pitch Dingman Competition Social Impact Award.",
      "Ran more than 60 physician interviews across Liberian healthcare facilities to validate product market fit and map adoption barriers, turning primary field research into the product roadmap.",
      "Built and managed relationships with physicians and health administrators in Monrovia and university advisors, converting their feedback into product and partnership decisions.",
    ],
  },
  {
    title: "Product Design Intern",
    organization: "hiveSocial",
    location: "Remote",
    period: "Nov 2021 to Mar 2022",
    bullets: [
      "Designed product flows and interface mockups in Figma and Adobe XD for an early stage social platform, translating product requirements into clickable prototypes.",
      "Partnered with founders and engineers to iterate on user interface decisions, contributing visual and interaction design across multiple product surfaces.",
    ],
  },
];

/**
 * Four practice areas for the About page, HCI first and venture last.
 * Every claimed capability cites a case study that exists on this site.
 */
export const practiceAreas = [
  {
    number: "01",
    title: "HCI and UX research",
    blurb: "Understanding people before building product.",
    skills: ["User interviews", "Field research", "Personas", "Journey mapping", "Usability studies"],
    caseStudy: { label: "Information Science Capstone", href: "/work/college-park-capstone" },
  },
  {
    number: "02",
    title: "Data and analytics",
    blurb: "Pipelines and analysis that turn fragmented data into a decision.",
    skills: ["Python (pandas, NumPy)", "SQL", "ETL pipelines", "Tableau", "Power BI"],
    caseStudy: { label: "Ovara", href: "/work/ovara" },
  },
  {
    number: "03",
    title: "ML and evaluation",
    blurb: "Experiments designed so the result survives scrutiny.",
    skills: ["PyTorch", "scikit-learn", "LLM evaluation", "Experimental design", "Bootstrap testing"],
    caseStudy: { label: "Kairo Health", href: "/work/kairo-health" },
  },
  {
    number: "04",
    title: "Product and venture",
    blurb: "Diligence, benchmarking, and product market validation.",
    skills: ["Investment diligence", "Venture benchmarking", "PMF validation", "Fundraising"],
    caseStudy: { label: "USM Venture Benchmark", href: "/work/usm-venture-benchmark" },
  },
];

/** Education entries for the About page, newest first. */
export const education = [
  {
    degree: "Master of Science, Information Management",
    school: "University of Maryland",
    location: "College Park, MD",
    period: "Expected May 2027",
    activities: [
      "Phi Kappa Phi Honor Society",
      "Investing Club",
      "The Black Business Association",
      "xFoundry Xtrapreneurs",
      "Black Graduate Student Union",
    ],
    description:
      "STEM designated program combining technical, analytical, and leadership skills to prepare graduates for senior information roles. Pursuing the Data Science and Analytics specialization, with coursework spanning machine learning, ETL, predictive analytics, data visualization, and emerging technologies, alongside hands on projects with industry partners in the DC region.",
    notableCourses: [
      {
        code: "INST664",
        title: "Transforming Unstructured Content with AI",
        note: "Building applied AI pipelines that turn unstructured text, images, and audio into structured data, spanning NLP representation, entity extraction, OCR, and LLM prompting, with attention to evaluation and bias.",
      },
      {
        code: "INST737",
        title: "Data Science Techniques",
        note: "End to end data science pipeline from project design to deployment, applying supervised and unsupervised learning across clustering, classification, and regression in Python.",
      },
      {
        code: "INST762",
        title: "Visual Analytics",
        note: "Interactive visual interfaces for analytical reasoning, pairing human perception with machine learning to explore real-world datasets.",
      },
      {
        code: "INST627",
        title: "Data Analytics for Information Professionals",
        note: "Inferential statistics on structured data, covering study design, hypothesis testing, and multiple regression, with analysis in R.",
      },
      {
        code: "INFM600",
        title: "Information Management Ecosystems",
        note: "Models and methods for managing information across teams, organizations, and platforms, including data modeling, descriptive statistics, and visualization.",
      },
      {
        code: "INST610",
        title: "Information Ethics",
        note: "Ethical frameworks for the information age applied to privacy, access, and intellectual freedom, including non-Western and feminist perspectives.",
      },
    ],
  },
  {
    degree: "Bachelor of Science, Information Science",
    school: "University of Maryland",
    location: "College Park, MD",
    period: "Graduated Dec 2024",
    activities: [
      "Black and Latinx in STEM",
      "Code: Black",
      "Startup Shell",
      "Do Good Accelerator",
      "UXTerps",
      "The Black Student Union",
      "ColorStack at UMD",
      "Business and Information Technology Society",
    ],
    description:
      "Interdisciplinary program blending technical foundations in database design, data analytics, programming, and information architecture with the social and organizational side of information. Prepares graduates for careers in data science and analytics, user experience research, and information systems.",
    notableCourses: [
      {
        code: "BMGT468R",
        title: "Fearless Founders Venture Practicum",
        note: "Lean startup venture practicum advised by the Dingman Center: customer discovery interviews, business model validation, and building a venture pitch.",
      },
      {
        code: "INST402",
        title: "Designing Patient-Centered Technologies",
        note: "Studying patients' health and wellness needs, then designing and evaluating digital health technologies to meet them.",
      },
      {
        code: "INST408A",
        title: "Consumer Health Informatics",
        note: "Consumer health information behavior and health justice: how people find and use health information, and the access gaps behind health disparities.",
      },
      {
        code: "INST362",
        title: "User-Centered Design",
        note: "The user centered design process end to end: user research, personas, task analysis, wireframing, and usability testing.",
      },
      {
        code: "INST327",
        title: "Database Design and Modeling",
        note: "Relational database design through entity relationship modeling and normalization, building and querying a working database in SQL.",
      },
      {
        code: "INST314",
        title: "Statistics for Information Science",
        note: "Foundations of inferential statistics for decision making: study design, measurement, data exploration, and hypothesis testing in R.",
      },
      {
        code: "INST326",
        title: "Object-Oriented Programming",
        note: "Object oriented programming in Python, covering design, inheritance, testing, and documentation through applied projects.",
      },
      {
        code: "INST346",
        title: "Technologies, Infrastructure, and Architecture",
        note: "Computing infrastructure from hardware and networking to client server and cloud architectures, including deploying a virtual system in a distributed environment.",
      },
    ],
  },
];

/** Honors, programs, and certifications shown as About-page credential rows. */
export const credentials = [
  {
    name: "Phi Kappa Phi Honor Society",
    meta: "University of Maryland",
    detail: "Graduate honor society.",
  },
  {
    name: "USM Maryland Momentum Fund",
    meta: "Venture Fellow, 2026",
    detail: "Fellowship on the investment team of the University System of Maryland's early stage fund.",
  },
  {
    name: "Startup Shell Founder",
    meta: "Fall 2022 cohort",
    detail: "UMD's student run startup incubator, joined while building Frontground.",
  },
  {
    name: "VC University",
    meta: "NVCA and Berkeley Law, Apr 2026",
    detail: "10 week program on fund economics, term sheets, deal structuring, and cap table modeling, taught by partners at Andreessen Horowitz, Bessemer, and Forerunner.",
  },
  {
    name: "Neo4j Graph Data Science Certification",
    meta: "Neo4j, Mar 2026",
    detail: "Graph data science with Neo4j, covering Cypher, graph algorithms, and applied analytics on connected data.",
  },
  {
    name: "Neo4j Certified Professional",
    meta: "Neo4j, Feb 2026",
    detail: "Core Neo4j and Cypher query language proficiency for designing and querying graph databases at scale.",
  },
  {
    name: "Neo4j Fundamentals",
    meta: "Neo4j, Feb 2026",
    detail: "Foundations of Neo4j and the Cypher query language, covering graph databases and modeling connected data.",
  },
  {
    name: "Equity Incubator Fellow",
    meta: "The Lab for Entrepreneurship and Transformative Leadership",
    detail: "Feb 2023 to Apr 2023. Startup fundraising and investor pitching.",
  },
  {
    name: "Do Good Accelerator Fellow",
    meta: "Do Good Institute, University of Maryland",
    detail: "Two cohorts, 2022 and 2023. Social impact venture acceleration.",
  },
  {
    name: "Startup School Student",
    meta: "Y Combinator",
    detail: "2022. Early stage startup curriculum.",
  },
  {
    name: "Freshman Leadership Summit",
    meta: "PwC",
    detail: "2020. Leadership case competition and professional pitching.",
  },
];

/** Personal interests shown at the end of the About page. */
export const interests = [
  {
    name: "Watching Sports",
    blurb: "Devoted Manchester United fan, die hard Lakers fan, and a massive Maryland Lacrosse fan. I travel for matches when I can.",
  },
  {
    name: "Mens League Sports",
    blurb: "Lacrosse goalie and LSM, central defensive midfielder in soccer, and intramural flag football and basketball at UMD.",
  },
  {
    name: "The Outdoors",
    blurb: "Camping with horses at Assateague Island National Seashore, hiking Sugarloaf Mountain, and kayaking at Black Hill Regional Park.",
  },
  {
    name: "Volunteering",
    blurb: "On campus, at my church, and across the county, I love helping out wherever I can.",
  },
  {
    name: "Legos",
    blurb: "Building intricate sets piece by piece.",
  },
  {
    name: "Film",
    blurb: "Watching and reviewing films on Letterboxd.",
  },
];

/**
 * Available About-page photography. Additional user-supplied photographs can
 * be added here without rendering empty image placeholders in the meantime.
 */
export const aboutGallery = [
  { src: "/images/about/about-01.jpg", alt: "Techstars AI Health Baltimore, before the room filled up" },
  { src: "/images/about/about-02.jpg", alt: "With three friends at a PwC recruiting event" },
  { src: "/images/about/about-03.jpg", alt: "Carrying the ball upfield in a lacrosse game" },
  { src: "/images/about/about-04.jpg", alt: "With my parents on the field after a home game" },
  { src: "/images/about/about-05.jpg", alt: "The room at a student startup showcase" },
  { src: "/images/about/about-06.jpg", alt: "With friends outside the stadium" },
  { src: "/images/about/about-07.jpg", alt: "Team photo on the field after a win" },
  { src: "/images/about/about-08.jpg", alt: "With friends before a night out" },
  { src: "/images/about/about-09.jpg", alt: "Full squad and supporters on the track" },
  { src: "/images/about/about-10.jpg", alt: "Talking with a teammate on the sideline" },
  { src: "/images/about/about-11.jpg", alt: "Cherry blossoms on a Baltimore street corner" },
  { src: "/images/about/about-12.jpg", alt: "Looking out over a snowy mountain run" },
  { src: "/images/about/about-13.jpg", alt: "With friends outside Pat's King of Steaks in Philadelphia" },
];

/** Eight publishable project records that drive the Work page and case studies. */
export const projects = caseStudies;

/** Return the selected work in reverse chronological order, newest first. */
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
