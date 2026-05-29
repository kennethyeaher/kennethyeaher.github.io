import type {
  SkillPillar,
  Credential,
  SkillGroup,
  WorkExperience,
  Education,
  Certification,
  Coursework,
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
  "I have built and evaluated companies. As a founder I raised $25K in non dilutive funding and ran more than 60 physician interviews for Frontground, a mobile first EMR for low resource clinics, turning primary field research into a product roadmap and pitching in front of judges and large audiences. As a Venture Capital Intern at the USM Maryland Momentum Fund I run sourcing stage diligence and coauthor investment memos delivered to the fund partners.",
  "On the data side, I worked hands on with large datasets at Towers Surgical Partners, writing SQL, building Python ETL pipelines, and shipping Tableau dashboards. My focus was never just the numbers but explaining what they meant, helping leadership find patterns, surface inefficiencies, and make informed decisions. That work taught me how to move from raw data to insights that are actionable and easy to digest for non technical audiences.",
  "Having sat in the founder seat, I read companies and problems from the inside, which is the judgment venture, consulting, and data roles reward. I combine analytical thinking with founder empathy, and I understand both the excitement and the challenges entrepreneurs face because I have built and competed in the startup ecosystem myself.",
  "Healthcare access stays the value underneath the work, but the throughline is broader. I want to evaluate and build at the intersection of data, technology, and the decisions that move them, spotting strong companies, supporting the founders behind them, and turning bold ideas into something durable.",
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
      "Startup Valuation",
      "Financial Modeling",
      "Pitch Deck Evaluation",
      "Deal Sourcing",
      "Portfolio Management",
      "Go to Market Strategy",
      "Customer Discovery",
    ],
  },
  {
    title: "Data and Analytics",
    icon: "bar-chart",
    skills: [
      "Python (pandas, NumPy)",
      "SQL",
      "Apache Spark",
      "R (tidyverse)",
      "ETL Pipelines",
      "Web Scraping (Beautiful Soup)",
      "Data Modeling",
      "Statistical Data Analysis",
      "Medical Data Interpretation",
      "Power BI",
      "Tableau",
      "Excel (VBA)",
      "Bokeh",
      "Folium",
      "Geospatial Data Analysis",
      "Choropleth Mapping",
      "Interactive Mapping",
      "MongoDB",
      "NoSQL",
      "Neo4j",
      "Databricks",
      "Cloud Computing",
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
      "Predictive Analytics",
      "Linear Regression",
      "Decision Trees",
      "Classification",
      "Ensemble Methods",
      "Random Forest",
      "Gradient Boosting",
      "Data Splitting",
      "Graph Data Science",
      "Graph Embeddings",
      "Link Prediction",
      "Community Detection",
      "Centrality Analysis",
      "Cypher Query Language",
    ],
  },
  {
    title: "Design and Research",
    icon: "compass",
    skills: [
      "Figma",
      "Adobe XD",
      "Adobe Creative Suite",
      "User Experience Research",
      "User Interviews",
      "User Centered Design",
      "Prototyping",
      "User Personas",
      "Journey Mapping",
    ],
  },
  {
    title: "Tools and Platforms",
    icon: "wrench",
    skills: [
      "PitchBook",
      "Crunchbase",
      "Affinity",
      "Salesforce",
      "Slack",
      "Microsoft Office",
      "Google Workspace",
      "Notion",
      "Airtable",
      "Jira",
      "Trello",
      "GitHub",
      "Git",
    ],
  },
];

// Work experience timeline. Strongest roles first.
export const workExperience: WorkExperience[] = [
  {
    title: "Venture Capital Intern",
    org: "USM Maryland Momentum Fund",
    location: "Baltimore, MD",
    period: "June 2026 to Present",
    bullets: [
      "Joining the investment team to support sourcing and diligence across early stage deals, building on a fellowship that earned a return offer for the role.",
      "Contributing to founder diligence and the structured analysis behind investment memos delivered to fund partners.",
      "Tracking deal flow and market research to help surface high potential companies for the fund.",
    ],
    tags: ["Early Stage Investing", "Diligence", "Investment Memos", "Sourcing"],
  },
  {
    title: "Venture Fellow",
    org: "USM Maryland Momentum Fund",
    location: "Baltimore, MD",
    period: "Jan 2026 to June 2026",
    bullets: [
      "Led sourcing stage diligence on early stage startups, building structured theses across technology, market, business model, traction, team, and moat from primary founder materials and external research.",
      "Drove founder diligence calls with structured question sets on moat defensibility, unit economics, scalability, and failure modes, then coauthored the resulting investment memos delivered to the fund partners.",
      "Surfaced a deal highest conviction risks, including pre revenue projections, manufacturing scale up, and customer concentration, and issued pursue, track, or pass recommendations grounded in them.",
    ],
    tags: ["Early Stage Investing", "Venture Financing", "Diligence", "Investment Memos"],
  },
  {
    title: "Data Analyst",
    org: "Towers Surgical Partners",
    location: "Rockville, MD",
    period: "Jan 2025 to June 2025",
    bullets: [
      "Architected an end to end Python ETL pipeline aggregating provider data across fragmented healthcare directories, reducing manual research workload 70 percent and accelerating provider network expansion analysis.",
      "Delivered Tableau dashboards analyzing referral flow, revenue, and procedure trends to improve decision visibility for leadership.",
      "Analyzed reimbursement and claims data to surface revenue cycle inefficiencies during litigation billing review, building a pipeline that processed 5,000 plus insurance documents.",
      "Built geographic coverage models across major US metros to guide provider recruitment priorities.",
    ],
    tags: ["Python", "ETL", "Tableau", "SQL", "Healthcare"],
  },
  {
    title: "Data Analyst Intern",
    org: "Towers Surgical Partners",
    location: "Rockville, MD",
    period: "May 2024 to Dec 2024",
    bullets: [
      "Built internal tracking tools adopted by leadership to monitor provider network growth, enabling the team to prioritize outreach and manage a growing portfolio of partner relationships.",
      "Scraped and verified physician data across 100 major US metro areas for NGYNSS, a national gynecological specialist directory supporting patient navigation and healthcare market analysis.",
    ],
    tags: ["Python", "Data Cleaning", "Provider Research", "Healthcare"],
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
  {
    title: "Product Design Intern",
    org: "hiveSocial",
    location: "Remote",
    period: "Nov 2021 to Mar 2022",
    bullets: [
      "Designed product flows and interface mockups in Figma and Adobe XD for an early stage social platform, translating product requirements into clickable prototypes.",
      "Partnered with founders and engineers to iterate on user interface decisions, contributing visual and interaction design across multiple product surfaces.",
    ],
    tags: ["Figma", "Adobe XD", "Product Design", "Prototyping"],
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
    gpa: "4.0",
    honors: [],
    activities: [
      "Phi Kappa Phi Honor Society",
      "Investing Club",
      "The Black Business Association",
      "xFoundry Xtrapreneurs",
      "Black Graduate Student Union",
    ],
    description: "STEM designated program combining technical, analytical, and leadership skills to prepare graduates for senior information roles. Pursuing the Data Science and Analytics specialization, with coursework spanning machine learning, ETL, predictive analytics, data visualization, and emerging technologies, alongside hands on projects with industry partners in the DC region.",
  },
  {
    degree: "Bachelor of Science, Information Science",
    school: "University of Maryland",
    location: "College Park, MD",
    period: "Graduated Dec 2024",
    honors: [],
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
    description: "Interdisciplinary program blending technical foundations in database design, data analytics, programming, and information architecture with the social and organizational side of information. Prepares graduates for careers in data science and analytics, user experience research, and information systems.",
  },
];

// Programs and certifications shown as cards.
export const certifications: Certification[] = [
  {
    name: "VC University",
    issuer: "NVCA and Berkeley Law",
    issued: "Apr 2026",
    detail: "10 week program on fund economics, term sheets, deal structuring, and cap table modeling, taught by partners at Andreessen Horowitz, Bessemer, and Forerunner.",
  },
  {
    name: "Neo4j Graph Data Science Certification",
    issuer: "Neo4j",
    issued: "Mar 2026",
    detail: "Graph data science with Neo4j, covering Cypher, graph algorithms, and applied analytics on connected data.",
  },
  {
    name: "Neo4j Certified Professional",
    issuer: "Neo4j",
    issued: "Feb 2026",
    detail: "Core Neo4j and Cypher query language proficiency for designing and querying graph databases at scale.",
  },
  {
    name: "Neo4j Fundamentals",
    issuer: "Neo4j",
    issued: "Feb 2026",
    detail: "Foundations of Neo4j and the Cypher query language, covering graph databases and modeling connected data.",
  },
];

// Applied case studies and continued learning, separate from formal certifications.
// Ordered newest to oldest.
export const caseStudies: Certification[] = [
  {
    name: "Case Study: Analyzing Job Market Data in Power BI",
    issuer: "DataCamp",
    issued: "May 2026",
    detail: "Examined job market trends in Power BI, surfacing patterns across roles, locations, and compensation.",
  },
  {
    name: "AI Agents Fundamentals",
    issuer: "Hugging Face",
    issued: "Apr 2026",
    detail: "Foundations of building and evaluating LLM powered agents, covering tool use, planning, and multi step reasoning.",
  },
  {
    name: "LLM Course Unit 3: Fine-tuning Language Models",
    issuer: "Hugging Face",
    issued: "Apr 2026",
    detail: "Hands on fine tuning of language models, including data preparation, training loops, and evaluation strategies.",
  },
  {
    name: "Case Study: Analyzing Healthcare Data in Power BI",
    issuer: "DataCamp",
    issued: "Apr 2026",
    detail: "Analyzed healthcare datasets in Power BI, building dashboards that surface operational and clinical insights.",
  },
  {
    name: "Case Study: Ecommerce Analysis in Power BI",
    issuer: "DataCamp",
    issued: "Mar 2026",
    detail: "Investigated a fictitious online retailer dataset, applying market basket analysis and shipping cost strategies, then built dashboard style pages with combination graphs, treemaps, and maps.",
  },
  {
    name: "Case Study: Supply Chain Analytics in Power BI",
    issuer: "DataCamp",
    issued: "Mar 2026",
    detail: "Built a make versus buy quote analysis tool in Power BI, modeling costs across production volumes and integrating internal manufacturing cost data.",
  },
  {
    name: "Case Study: Analyzing Customer Churn in Power BI",
    issuer: "DataCamp",
    issued: "Feb 2026",
    detail: "Modeled customer churn drivers in Power BI, building dashboards that flag retention risk and segment behavior.",
  },
];

// Coursework and labs from the MIM program.
// Sustained problem set series and labs grouped by course.
export const coursework: Coursework[] = [
  {
    title: "Machine Learning Problem Sets",
    course: "INST737, Introduction to Data Science",
    period: "Fall 2025",
    detail: "Engineered four end to end machine learning workflows in Python with scikit-learn. Cleaned input data, split it into train and test sets, fit and tuned linear regression, decision tree, classification, and ensemble models, and evaluated each model with R squared, accuracy, and confusion matrix diagnostics. Each problem set is its own repository, committed end to end.",
    tags: ["scikit-learn", "Python", "Classification", "Decision Trees", "Ensemble Methods", "Random Forest", "Gradient Boosting"],
    repoUrls: [
      { label: "Problem Set 1", url: "https://github.com/kennethyeaher/problem-set-1" },
      { label: "Problem Set 2", url: "https://github.com/kennethyeaher/problem-set-2" },
      { label: "Problem Set 3", url: "https://github.com/kennethyeaher/problem-set-3" },
      { label: "Problem Set 4", url: "https://github.com/kennethyeaher/problem-set-4" },
    ],
  },
  {
    title: "Modeling and Analysis Labs",
    course: "INST737, Introduction to Data Science",
    period: "Fall 2025",
    detail: "Fit linear regression and decision tree models in Python with scikit-learn, validated each one with train and test splitting, and contrasted the two by comparing training and testing R squared and classification accuracy. Wrote Python scripts in VS Code to verify predictions row by row and surface where the non linear tree based model outperformed the linear baseline.",
    tags: ["Linear Regression", "Decision Trees", "scikit-learn", "Data Splitting", "Predictive Analytics", "Python"],
  },
  {
    title: "ETL and NoSQL Lab",
    course: "INST627, Data Analytics for Information Professionals",
    period: "Fall 2025",
    detail: "Provisioned a MongoDB Atlas cluster on AWS, secured it with IP whitelisting, and connected through VS Code to query BSON documents from Python. Compared schema flexible NoSQL document modeling against the relational tables I had been working with all semester, with hands on practice writing queries that traverse nested documents.",
    tags: ["MongoDB", "MongoDB Atlas", "NoSQL", "Cloud Computing", "BSON", "Python"],
  },
  {
    title: "Data Visualization Labs",
    course: "INST627, Data Analytics for Information Professionals",
    period: "Fall 2025",
    detail: "Built two interactive Python visualization projects. Engineered a Folium choropleth that joins ecological footprint per capita data to world country polygons with custom color ramps, opacity, and zoom defaults, and built Bokeh dashboards for stock market closing prices and Iris classification with hover tooltips, markers, and alpha blending. Both deployed as standalone HTML for browser sharing.",
    tags: ["Bokeh", "Folium", "Geospatial Data Analysis", "Choropleth Mapping", "Interactive Mapping", "Python"],
  },
];

// Hobbies and interests.
export const hobbies: Hobby[] = [
  {
    name: "Watching Sports",
    blurb: "Devoted Manchester United fan, die hard Lakers fan, and a massive Maryland Lacrosse fan. I travel for matches when I can.",
    icon: "trophy",
    image: "",
    imageAlt: "Kenneth on a trip to a Manchester United match",
  },
  {
    name: "Mens League Sports",
    blurb: "Lacrosse goalie and LSM, central defensive midfielder in soccer, and intramural flag football and basketball at UMD.",
    icon: "target",
    image: "",
    imageAlt: "Kenneth playing in a mens league match",
  },
  {
    name: "The Outdoors",
    blurb: "Camping with horses at Assateague Island National Seashore, hiking Sugarloaf Mountain, and kayaking at Black Hill Regional Park.",
    icon: "mountain",
    image: "",
    imageAlt: "View from Sugarloaf Mountain",
  },
  {
    name: "Volunteering",
    blurb: "On campus, at my church, and across the county, I love helping out wherever I can.",
    icon: "heart",
  },
  {
    name: "Legos",
    blurb: "Building intricate sets piece by piece.",
    icon: "blocks",
  },
  {
    name: "Film",
    blurb: "Watching and reviewing films on Letterboxd.",
    icon: "circle-dot",
  },
];
