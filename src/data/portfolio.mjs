import { caseStudies } from "./caseStudies.mjs";

/** Public identity, writing, and contact details used across the portfolio. */
export const profile = {
  name: "Kenneth Yeaher",
  shortName: "Ken",
  roleLine: "Product Designer and Data Scientist",
  headline: "I’m Ken, a product designer and data scientist.",
  intro:
    "I study how people move through systems, build with the data those systems leave behind, and use both to decide what should exist next.",
  aboutParagraphs: [
    "I’m a Master of Science in Human-Computer Interaction student at the University of Maryland, and I start projects by learning how people actually navigate a system before I decide what to build, measure, or recommend.",
    "I was born in Monrovia, Liberia, where many clinics still run on paper. That gap pulled me toward healthcare access, product research, and the decisions behind both.",
  ],
  availability:
    "Open to product, venture, data, and HCI opportunities where research can shape what gets built.",
  email: "kennethyeaher@gmail.com",
  links: {
    linkedin: "https://linkedin.com/in/kennethyeaher",
    github: "https://github.com/kennethyeaher",
    resume: "/resume/kyresume.pdf",
    // the footer's email link (home v2 note, figma 131:2038).
    email: "mailto:kyeaher@umd.edu",
  },
};

/**
 * The two short lines under the home thesis (home v3, figma 176:1721 and 177:1723): where Ken is now, one line per
 * entry, and one sentence on where he has been.
 */
export const homeNow = {
  currently: ["Studying HCIM @ UMD", "in College Park, Maryland"],
  previously:
    "Screened deals @ USM Maryland Momentum Fund, analyzed data @ Towers Surgical Partners, founded Frontground, and more.",
};

/**
 * Compact professional history: the About page's Experience list (about v3, figma 255:1842). Home v3 shows `homeNow`
 * instead. Pinned by tests/portfolio-model.test.mjs.
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

/** Education entries for the About page, newest first. */
export const education = [
  {
    degree: "Master of Science, Human-Computer Interaction",
    school: "University of Maryland",
    location: "College Park, MD",
    period: "Expected May 2028",
    activities: [
      "Phi Kappa Phi Honor Society",
      "Investing Club",
      "The Black Business Association",
      "xFoundry Xtrapreneurs",
      "Black Graduate Student Union",
    ],
    description:
      "Interdisciplinary graduate study in human-computer interaction, combining research methods, interaction design, and usability evaluation to understand how people use technology and design systems around their needs.",
    notableCourses: [
      {
        code: "INST630",
        title: "Programming Human-Centered Interfaces",
      },
      {
        code: "INST631",
        title: "Fundamentals of Human-Computer Interaction",
      },
      {
        code: "INST711",
        title: "Interaction Design Studio",
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
    ],
  },
];

/** Personal interests shown at the end of the About page. */
export const interests = [
  {
    name: "Watching Sports",
    blurb: "Devoted Manchester United fan, die hard Lakers fan, and a massive Maryland Lacrosse fan. I travel for matches whenever I can.",
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
 * About-page photography and the alt text source for the photo chapters. width and height are the files' pixel
 * sizes, which set each photo's share of its justified row. an optional chip replaces the alt text in the cursor chip.
 */
export const aboutGallery = [
  { src: "/images/about/about-10.jpg", width: 1024, height: 683, alt: "Talking with a teammate on the sideline" },
  { src: "/images/about/about-12.jpg", width: 894, height: 1400, alt: "Looking out over a snowy mountain run" },
  { src: "/images/about/about-13.jpg", width: 1170, height: 878, alt: "With friends outside Pat's King of Steaks in Philadelphia" },
  { src: "/images/about/about-14.jpg", width: 1179, height: 1183, alt: "Old Trafford's East Stand from the street in Manchester" },
  { src: "/images/about/about-15.jpg", width: 1050, height: 1400, alt: "Working on a laptop in a study room" },
  { src: "/images/about/about-16.jpg", width: 980, height: 1400, alt: "Feet up on a beach lounger at night, boats lit across the water" },
  { src: "/images/about/about-17.jpg", width: 1105, height: 1400, alt: "A campfire burning at night" },
  { src: "/images/about/about-18.jpg", width: 1121, height: 1400, alt: "Sunset over a soccer field, a player by the goal under the floodlights" },
  { src: "/images/about/about-19.jpg", width: 1400, height: 1067, alt: "A startup office with a screen, a whiteboard and a Nelson Mandela quote on a lime wall" },
  { src: "/images/about/about-20.jpg", width: 1170, height: 1342, alt: "A guitarist playing live at The Dubliner" },
  { src: "/images/about/about-21.jpg", width: 930, height: 1400, alt: "A pink-lit airplane window at night, rain on the glass" },
  { src: "/images/about/about-01.jpg", width: 788, height: 1400, alt: "Techstars AI Health Baltimore, before the room filled up" },
  { src: "/images/about/about-02.jpg", width: 1050, height: 1400, alt: "With three friends at a PwC recruiting event" },
  { src: "/images/about/about-03.jpg", width: 1400, height: 900, alt: "Carrying the ball upfield in a lacrosse game", chip: "Coast to coast" },
  { src: "/images/about/about-04.jpg", width: 1050, height: 1400, alt: "With my parents on the field after a home game" },
  { src: "/images/about/about-05.jpg", width: 1400, height: 538, alt: "The room at a student startup showcase" },
  { src: "/images/about/about-06.jpg", width: 788, height: 1400, alt: "With friends outside the stadium" },
  { src: "/images/about/about-07.jpg", width: 1400, height: 936, alt: "Team photo on the field after a win" },
  { src: "/images/about/about-08.jpg", width: 1400, height: 1216, alt: "With friends before a night out" },
  { src: "/images/about/about-09.jpg", width: 1400, height: 933, alt: "Full squad and supporters on the track" },
];

/**
 * The four photo chapters (about v3, figma 255:1842 and 256:1910). each names a lead photo and rows of smaller ones by
 * file name; every row shares one height and fills the 584px photo column. `leadWidth` narrows the lead to a share of
 * the column (with my people, 484 of 584), and `leadCrop` crops it to a width / height box (on the road, 584 by 420).
 */
export const aboutChapters = [
  {
    title: "On the field",
    line: "You’ll either catch me on the lax field saving shots or on the football pitch doing my best Kanté impression.",
    lead: "about-03",
    rows: [["about-10", "about-07", "about-09", "about-18"]],
  },
  {
    title: "In the room",
    line: "Pitch nights, recruiting events and the startup showcases that got me into venture.",
    lead: "about-05",
    rows: [["about-01", "about-02"], ["about-15", "about-19"]],
  },
  {
    title: "With my people",
    line: "Family on the sideline and friends on the road.",
    lead: "about-08",
    leadWidth: 484 / 584,
    rows: [["about-04", "about-06", "about-13"]],
  },
  {
    title: "On the road",
    line: "Old Trafford in Manchester, live music at The Dubliner, a night on the beach, and a window seat after dark.",
    lead: "about-14",
    leadCrop: [584, 420],
    rows: [["about-12", "about-17", "about-16"], ["about-20", "about-21"]],
  },
];

/** home grid order (figma 428:2684): elms leads (436:1866), then terpcarehub, sohive and ovara, then the capstone,
    terpcare and frontground. next and previous follow it too, so kairo wraps round to elms. */
const order = [
  "elms-redesign",
  "terpcarehub",
  "sohive",
  "ovara",
  "college-park-capstone",
  "terpcare",
  "frontground",
  "kairo-health",
];

/** Eight publishable project records that drive the Work page and case studies, in the home order. */
export const projects = order.map((slug) => {
  const project = caseStudies.find((entry) => entry.slug === slug);
  if (!project) throw new Error(`Unknown project slug in the home order: ${slug}`);
  return project;
});

/** Return the selected work in the home order. */
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
