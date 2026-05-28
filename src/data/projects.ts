import type { Project } from "./types";

// Every project lives here. Each one auto generates a card on the index
// and its own detail page at /projects/[slug]. Add a project by adding
// an object to this array. Copy is written to sound natural and direct,
// with no em dashes and no hyphenated words.
export const projects: Project[] = [
  {
    slug: "frontground",
    title: "Frontground",
    role: "Founder",
    category: "Venture",
    period: "Sept 2022 to May 2024",
    tagline:
      "An early stage health tech startup. A mobile first EMR for low resource clinics.",
    featured: true,
    tags: ["Founder", "Fundraising", "User Research", "Health Tech"],
    links: [],
    metrics: [
      { value: "$25K", label: "non dilutive funding raised" },
      { value: "60+", label: "physician interviews" },
      { value: "$10K", label: "Social Impact Award, Pitch Dingman" },
    ],
    sections: [
      {
        heading: "The problem",
        body: "I was born in Monrovia, Liberia, and most of my family still lives there. Most clinics in the country run on paper records. Files get misplaced, water damaged, or lost between visits. Frontground started from that firsthand problem. It is a mobile first electronic medical record built for clinics where paper is the default and the paper itself is not preserved well.",
      },
      {
        heading: "What I did",
        body: "I founded and led the company from concept to go to market. I secured $25K in non dilutive funding across competitive pitch processes, including the Pitch Dingman Competition where Frontground won the Social Impact Award and $10K. I ran more than 60 physician interviews across Liberian healthcare facilities to validate product market fit and map adoption barriers, turning primary field research directly into the product roadmap.",
      },
      {
        heading: "Relationships and partnerships",
        body: "I built and managed relationships with physicians and health administrators in Monrovia and with my university advisors. I converted their feedback into product and partnership decisions. Customer discovery interviews at the MSF clinic in Monrovia later became the seed for my clinical NLP research.",
      },
    ],
  },
  {
    slug: "momentum-fund",
    title: "USM Maryland Momentum Fund",
    role: "Venture Fellow",
    category: "Venture",
    period: "Feb 2026 to May 2026",
    tagline:
      "Sourcing stage diligence and an investment memo on an early stage deep tech startup.",
    featured: true,
    tags: ["Venture", "Diligence", "Investment Memo"],
    links: [],
    metrics: [
      { value: "1", label: "investment memo coauthored" },
      { value: "6", label: "diligence dimensions assessed" },
    ],
    sections: [
      {
        heading: "What I did",
        body: "I led sourcing stage diligence on a deep tech materials startup. I built a structured thesis across technology, market, business model, traction, team, and moat, drawing on primary founder materials and external research.",
      },
      {
        heading: "Founder diligence",
        body: "I drove a founder diligence call with a structured question set on moat defensibility, unit economics, scalability, and failure modes. I then coauthored the resulting investment memo delivered to the fund partners.",
      },
      {
        heading: "Recommendation",
        body: "I surfaced the deal highest conviction risks, including pre revenue hockey stick projections, a 100x manufacturing scale up, and customer concentration exposure. I issued a pursue, track, or pass recommendation grounded in those risks.",
      },
    ],
  },
  {
    slug: "ovara",
    title: "Ovara",
    role: "Data Scientist",
    category: "Data Science",
    period: "Jan 2026 to May 2026",
    tagline:
      "A fertility access intelligence platform that maps reproductive health access deserts across the US.",
    featured: true,
    tags: ["Data Science", "Power BI", "Python", "Healthcare"],
    links: [],
    metrics: [
      { value: "1,038", label: "zero provider access desert counties" },
      { value: "14.5M", label: "people living in those counties" },
      { value: "1.00", label: "precision against federal HRSA designations" },
    ],
    sections: [
      {
        heading: "The problem",
        body: "Reproductive endocrinology and infertility care is heavily concentrated in major US metros, but no public facing tool clearly shows where the gaps are. HRSA shortage designations focus on primary care and OB GYN broadly, so they do not surface subspecialty deserts. Ovara fills that gap and frames fertility access as a visual analytics problem, not just a data problem.",
      },
      {
        heading: "What I built",
        body: "A 17 stage Python pipeline that turns six public federal datasets (CMS NPPES, Census CBSA and ACS, HRSA, KFF) into an access intelligence product. From an 11 GB, 8 million provider NPPES file I filtered to 13 reproductive health taxonomy codes, cleaned to about 100 thousand active providers, and normalized against a metro reference table. A model uses metro population and workforce features to estimate expected provider density. Residuals classify states into risk tiers and fixed thresholds classify counties from access desert to well served.",
      },
      {
        heading: "The dashboard",
        body: "A four page Power BI report. Each page is designed around a different stakeholder decision. An Overview ranks states by residual, a State Drill explores county density, an auto generated County Detail narrative explains a selected county, and a Method page shows the predicted versus actual scatter and the HRSA validation cards.",
      },
      {
        heading: "Findings",
        body: "26 of 51 states classify as moderate to high risk, and Delaware is the most underserved in the model. 1,038 counties have zero registered reproductive health providers, home to about 14.5 million people. The high risk tier hits 100 percent precision against HRSA designations at 30 percent recall. The design is deliberately conservative. When Ovara flags a place, it is usually pointing at a real access problem.",
      },
    ],
  },
  {
    slug: "kairo-health",
    title: "Kairo Health",
    role: "NLP Researcher",
    category: "ML / NLP Research",
    period: "Jan 2026 to May 2026",
    tagline:
      "A controlled study of how OCR noise breaks clinical information extraction. Regex baseline versus a zero shot LLM.",
    featured: true,
    tags: ["NLP Research", "LLM Evaluation", "Healthcare", "Python"],
    links: [{ label: "View Code", url: "https://github.com/kennethyeaher/kairoHealth" }],
    metrics: [
      { value: "150", label: "synthetic triage documents, 5 noise tiers" },
      { value: "+0.092", label: "LLM F1 advantage at severe noise" },
      { value: "2 of 30", label: "dangerous under triage errors at heavy noise" },
    ],
    sections: [
      {
        heading: "The question",
        body: "Most clinical NLP pipelines report aggregate accuracy without isolating OCR noise as a variable. Kairo holds input content fixed and varies only OCR quality across five calibrated noise tiers. The question is whether LLM based extraction stays more robust than a regex baseline as OCR degrades, where each method fails, and what each failure looks like.",
      },
      {
        heading: "Design",
        body: "A proof of concept pipeline from form image to structured JSON, run on synthetic data modeled on the MSF Aweil Pediatric Triage form. I chose that form because clinicians I interviewed at the MSF clinic in Monrovia during Frontground discovery used a near identical version. Two extractors, a Python regex baseline and a zero shot LLM, run on identical OCR text across 30 forms, 5 tiers, and 14 fields, with bootstrap confidence intervals, McNemar exact tests, and per field error categorization.",
      },
      {
        heading: "What I found",
        body: "The methods are statistically indistinguishable on clean and moderate input. The LLM holds a significant advantage at heavy and severe noise, with the largest gap of 0.092 F1 at severe, and both fail at extreme noise. The failure modes differ in kind. At heavy noise 92 percent of regex errors are missing values while 86 percent of LLM errors are substitutions. A wrong value is visible and can be cross checked, but a null silently disappears downstream. The LLM hallucinated only 4 times in 2,100 attempts, all at the worst tiers.",
      },
      {
        heading: "The safety finding",
        body: "On triage color at heavy noise, 2 of 30 LLM predictions were dangerous under triage errors where a RED patient was classified as YELLOW. That is a 6.7 percent rate on the highest stakes field. The regex method produced 30 missing values on the same field, which is not safer. A null routes the patient by the system default, usually lowest urgency. The conclusion is that neither method should drive autonomous routing without human review, and the robustness claim is narrow. The LLM is more robust only within a defined window of OCR quality.",
      },
    ],
  },
  {
    slug: "capstone-user-research",
    title: "Capstone: User Research and Development",
    role: "UX Researcher",
    category: "HCI / UX Research",
    period: "2024",
    tagline: "A capstone user research and product development project.",
    featured: false,
    tags: ["HCI", "UX Research", "User Centered Design"],
    links: [
      {
        label: "View on portfolio",
        url: "https://kyeahere72e.myportfolio.com/capstone-user-research-and-development",
      },
    ],
    metrics: [],
    sections: [
      {
        heading: "Overview",
        body: "A capstone project grounded in user centered design and primary user research. Add a short summary of the problem, your research method, and the outcome here. Pull the strongest details from your existing portfolio writeup.",
      },
    ],
  },
];

/** Return only the projects flagged as featured, used on the home page. */
export function getFeaturedProjects(): Project[] {
  return projects.filter((project) => project.featured);
}

/** Find one project by its url slug. Returns undefined if none matches. */
export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

/** Return projects whose category is in the given list. Used by Research and VC pages. */
export function getProjectsByCategories(categories: string[]): Project[] {
  return projects.filter((project) => categories.includes(project.category));
}