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
    slug: "college-park-capstone",
    title: "City of College Park Capstone",
    role: "Project Manager",
    category: "HCI / UX Research",
    period: "2024",
    tagline:
      "Led a team improving communication strategies for the City of College Park through user research.",
    featured: false,
    tags: ["UX Research", "Project Management", "User Personas", "Civic"],
    links: [
      {
        label: "View Trello board",
        url: "https://trello.com/b/KcPtpgd4/city-of-college-park-capstone",
      },
    ],
    metrics: [],
    sections: [
      {
        heading: "What I did",
        body: "For my capstone at the University of Maryland College of Information, I served as project manager, leading my team to improve communication strategies for the City of College Park. I owned the client relationship with Bill Gardiner, the Assistant City Manager, along with the city team and our institutional advisors. The role meant aligning team effort with client expectations, running regular updates, and holding our deliverables to a high standard.",
      },
      {
        heading: "The research",
        body: "We worked to address the needs of a diverse community of families, students, and bilingual residents. Through interviews, surveys, and contextual inquiries at events like College Park Day, we collected insight about the challenges residents faced. We learned that Spanish speaking families felt excluded by limited bilingual resources, while students wanted stronger connections to city initiatives.",
      },
      {
        heading: "The outcome",
        body: "We turned the research into detailed user personas and journey maps that surfaced pain points and clear opportunities for better engagement, then presented actionable recommendations to the city. The project sharpened my skills in research, teamwork, and problem solving, and confirmed my decision to pursue human computer interaction.",
      },
    ],
  },
  {
    slug: "cognitive-wellness-garden",
    title: "Cognitive Wellness Garden",
    role: "UX Designer",
    category: "HCI / UX Research",
    period: "2024",
    tagline:
      "A health centered design concept for elderly individuals with early dementia.",
    featured: false,
    tags: ["UX Research", "Health Tech", "Accessibility", "User Centered Design"],
    links: [
    ],
    metrics: [],
    sections: [
      {
        heading: "The concept",
        body: "A case study from my user centered design course where I developed a Cognitive Wellness Garden for elderly individuals with early dementia. Inspired by my mother work with this population, I focused on safety, accessibility, and sensory engagement. The goal was an environment that supports physical, emotional, and cognitive well being while encouraging social interaction and independence.",
      },
      {
        heading: "The design",
        body: "Every feature addresses a specific challenge. Non slip circular pathways let people navigate without the fear of getting lost. Sensory areas with lavender, rosemary, and a small waterfall help reduce anxiety. Raised garden beds make gardening accessible for people with mobility challenges. Central gathering spaces and interactive elements like bird feeders create opportunities for social connection and help combat isolation.",
      },
      {
        heading: "What it shows",
        body: "The project reflects how I apply human centered design to complex healthcare challenges, grounded in research and guided by the goal of a welcoming, therapeutic experience for an underserved community.",
      },
    ],
  },
  {
    slug: "terpcare",
    title: "TerpCare",
    role: "UX Designer",
    category: "HCI / UX Research",
    period: "2024",
    tagline:
      "A mental health app prototype designed to close gaps in support for UMD students.",
    featured: false,
    tags: ["UX Research", "Figma", "Health Tech", "Prototyping"],
    links: [
    ],
    metrics: [],
    sections: [
      {
        heading: "The problem",
        body: "TerpCare is a mental health app prototype my group and I designed to address gaps in mental health resources for UMD students. The idea came from the barriers students face when seeking support, including stigma, limited availability, and high cost. Competitive analysis helped us find the gaps in existing solutions and tailor the app to a university community.",
      },
      {
        heading: "What I built",
        body: "Built in Figma, the app prioritizes accessibility and usability with a mood calendar, chat options with mental health professionals, campus resources, and a discussion board. We used UMD branding colors to build familiarity and trust. I worked on an intuitive prototype that balanced functionality and aesthetics, moving through research, wireframing, and iteration based on user feedback.",
      },
      {
        heading: "What it shows",
        body: "The project brought together UX and UI principles, creativity, and collaboration to design a user friendly, accessible app for a specific audience, and reflects my commitment to using technology to address real world mental health challenges.",
      },
    ],
  },
  {
    slug: "bookscout",
    title: "BookScout",
    role: "Developer",
    category: "Data Science",
    period: "2023",
    tagline:
      "A GUI book search app over 50,000 Goodreads records, merging data analysis and front end design.",
    featured: false,
    tags: ["Python", "Data Analysis", "tkinter", "pandas"],
    links: [
    ],
    metrics: [
      { value: "50,000+", label: "books in the searchable dataset" },
    ],
    sections: [
      {
        heading: "What I built",
        body: "BookScout is a GUI application I developed with my classmate Lillian Gunn for our object oriented programming course. It lets users search for books by title or author across a dataset of more than 50,000 books scraped from Goodreads. I built the interface with Python tkinter and handled data with pandas, including dropdown menus, search and clear buttons, and a results listbox.",
      },
      {
        heading: "The challenge",
        body: "Managing a 50,000 row dataset meant optimizing queries for fast, responsive performance. Troubleshooting GUI responsiveness and dataset handling taught me to approach problems systematically and deepened my Python skills, especially with tkinter and pandas.",
      },
      {
        heading: "What it shows",
        body: "BookScout reflects my ability to combine data analysis with intuitive design, taking ownership of both the technical and design sides to produce something functional and user friendly.",
      },
    ],
  },
  {
    slug: "fitdish",
    title: "FitDish",
    role: "UX Designer",
    category: "HCI / UX Research",
    period: "2021",
    tagline:
      "A dietary app concept and my first steps into user centered design.",
    featured: false,
    tags: ["UX Research", "Prototyping", "User Centered Design"],
    links: [
    ],
    metrics: [],
    sections: [
      {
        heading: "The concept",
        body: "FitDish is a dietary app concept I created in my second year of college. It was designed to provide personalized meal plans and recipes tailored to dietary preferences, fitness goals, and restrictions, with a dietary quiz, a searchable recipe catalog, and a My Recipes tab. The goal was a free, inclusive platform that addressed common gaps like high cost, limited healthy options, and accessibility challenges.",
      },
      {
        heading: "What it shows",
        body: "This was my first experience with prototyping and using research to align design features with user needs. It introduced me to wireframing, competitive analysis, and accessibility focused design, and set the foundation for my growth in human computer interaction.",
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