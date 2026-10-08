export interface WorkExperience {
  role: string
  company: string
  period: string
  location: string
  type: string
  description?: string
  achievements: string[]
  tools: string[]
}

export interface EducationItem {
  degree: string
  institution: string
  period: string
  location: string
  achievements: string[]
}

export interface SkillCategory {
  category: string
  skills: string[]
}

export interface CVProfile {
  name: string
  title: string
  phone: string
  email: string
  location: string
  website: string
  linkedin: string
  summary: string
  experiences: WorkExperience[]
  skillCategories: SkillCategory[]
  education: EducationItem[]
  languages: string[]
}

// Fallback CV used when the database is unavailable. The live CV is edited in /admin and
// stored in Neon; every claim here is taken from that record or confirmed directly by Johan.
export const DEFAULT_CV_DATA: CVProfile = {
  name: "Johan Alvarez",
  title: "Senior Growth Marketer · Martech & Automation",
  phone: "+57 318 406 4960",
  email: "contact@asjohan.com",
  location: "Medellín, Colombia · Remote (US hours)",
  website: "https://asjohan.com",
  linkedin: "https://linkedin.com/in/johanalvarez",
  summary: "Growth marketer with 12+ years across software development, performance marketing and GTM, mostly helping startups go from zero to one. I run the full funnel (paid media, landing pages, lifecycle email and SEO) and build the stack underneath it: attribution, CRM and automations. I heavily focus on A/B testing across all funnel steps.\n\nRecent results: cut Meta cost per registered user 61% while scaling spend 13× on RevyAutos.com, +132% orders for the Shopify store of Autobruder.com, and 3.7× Google search clicks after a complete website update and SEO optimization for RainforestFoundation.org.",
  experiences: [
    {
      role: "Growth & Martech Consultant",
      company: "Freelance",
      period: "Mar 2026 - Present",
      location: "Medellín, Colombia / Remote",
      type: "Freelance",
      achievements: [
        "Building Intelligence (NY startup): 65 qualified sales calls and 4 closed deals worth $87K a year. Built automated B2B outbound to enterprise decision-makers with Clay, Apollo, industry-specific landing pages and Salesforce tracking, and led a full website redesign and copy overhaul.",
        "Built an AI marketing platform with Claude, Next.js and Vercel for 2 companies and moved their marketing onto it: one control center for paid media creative, ad copy variations, website, email, and cross-channel analytics, used to decide what creative to make, iterate on what works, and A/B test every step of the funnel.",
        "Helped clients improve their strategy and execution with funnels, from brand updates and website redesigns to Apollo prospecting, A/B-tested email flows, and paid media strategy, plus custom bots that answer emails and social media messages.",
      ],
      tools: [
        "Clay",
        "Apollo",
        "Salesforce",
        "HubSpot",
        "n8n",
        "Claude",
        "Codex",
        "v0",
        "Next.js",
        "Vercel",
        "GA4",
        "GTM",
        "Twilio",
      ]
    },
    {
      role: "Senior Martech Specialist",
      company: "Pvragon",
      period: "Apr 2025 - Mar 2026",
      location: "Medellín, Colombia / Remote",
      type: "Full-time, then contract from Jan 2026",
      achievements: [
        "Revy Autos: cut Meta cost per registered user 61% ($17.94 → $7.07) while scaling monthly Meta spend 13×, by pushing for persona landing pages and creative testing at up to 30 new ads a week.",
        "Grew daily user registrations from ~30 to 200 with paid media and ActiveCampaign lifecycle automation.",
        "Designed and implemented the martech and GTM automation stack for the agency's venture-backed startup clients.",
        "Managed multi-channel advertising (Meta, Google, Reddit, LinkedIn) with monthly budgets up to $70K.",
        "Implemented and maintained multi-touch attribution with Wicked Reports and Triple Whale to guide analysis and spend across revenue channels.",
        "Automated customer support routing to manage 100+ daily tickets.",
        "Built startup MVPs end-to-end with AI coding tools (Claude Code, OpenAI Codex), including getmilotrack.com, taken from idea to a working platform with active users in under 2 months (Next.js, Supabase, Twilio) following strict guidelines to capture information and deliver reports to insurance companies and US government agencies.",
      ],
      tools: [
        "n8n",
        "ActiveCampaign",
        "Salesforce",
        "Clay",
        "Triple Whale",
        "Wicked Reports",
        "PostHog",
        "GA4",
        "GTM",
        "Meta Ads",
        "Google Ads",
        "Webhooks / REST APIs",
        "Twilio",
        "Shopify",
        "Next.js",
        "Supabase",
        "Vercel",
        "v0",
      ]
    },
    {
      role: "Marketing Freelancer",
      company: "Independent Consultant",
      period: "Nov 2022 - May 2025",
      location: "Medellín, Colombia / Remote",
      type: "Freelance",
      description: "Marketing automation, full-funnel strategy, and digital transformation for clients across South America and the US.",
      achievements: [
        "Autobruder 4WD: rebuilt the Shopify store from scratch, added 10,000+ products and a custom camping-setup app; orders +132% and conversion rate +114% in the last two months measured.",
        "Rainforest Foundation US: led the technical rebuild of a 35-page nonprofit site and 220 blog posts with no lost URLs (2024); a 2025 SEO optimization (speed, content structure, internal linking, AEO) grew Google search clicks 3.7× and lifted average position from 16.5 to 6.5.",
        "International Nurses: rebuilt the brand, developed a new website and email for a $3K consulting service. We replaced 1-on-1 sales calls with group webinars, generating 200 qualified leads a month on a $700 paid media budget.",
        "Ran end-to-end digital marketing for clients: lifecycle email, direct-response copywriting, technical SEO, and paid media (Meta Ads, Google Ads).",
        "Served as project manager, sourcing and coordinating UX designers, developers, and photographers across delivery sprints.",
      ],
      tools: [
        "HubSpot",
        "ActiveCampaign",
        "Salesforce",
        "GoHighLevel",
        "Meta Ads",
        "Google Ads",
        "GA4",
        "SEMrush",
        "Webflow",
        "WordPress",
        "Figma",
      ]
    },
    {
      role: "Marketing & Automation Lead",
      company: "Savant International",
      period: "Mar 2022 - Nov 2022",
      location: "Medellín, Colombia",
      type: "Full-time",
      achievements: [
        "Generated 90 qualified leads from a 100K-contact list managed in Segment, with email, SMS and landing-page journeys that ended in a booked sales meeting: 15 new clients at an average ticket of $2K/month.",
        "Upsold 8 existing clients into automating 19 workflows, such as invoicing, truck loading, and trucker and truck document verification.",
        "Led RPA with UiPath and Python, mostly on Salesforce and clients' internal software, reducing manual workload by 60%.",
        "Grew and mentored the automation team from 1 to 6 full-time specialists.",
      ],
      tools: [
        "UiPath",
        "Python",
        "Salesforce",
        "Segment",
        "Twilio SMS",
        "Zapier",
        "Make",
        "ActiveCampaign",
        "Webflow",
        "Google Sheets API",
        "ClickUp",
      ]
    },
    {
      role: "Marketing & Sales Lead (Co-founder)",
      company: "Energy Media Agency",
      period: "Jan 2019 - Mar 2022",
      location: "Medellín, Colombia",
      type: "Full-time",
      achievements: [
        "Co-founded a digital marketing and software development agency; ran sales and managed client engagements from discovery to delivery.",
        "Fundación Lupines: secured Google Ad Grants and ran the account for three years, turning $59.8K in donated ads into 69K site visits.",
        "Triada Academy: built a trading-academy platform from scratch (brand, UX, courses, live classes, forum and a trading-signals app) serving about 1,200 active students.",
        "Led delivery of full-service marketing for e-commerce and B2B clients across industries.",
        "Managed a team of 8 full-time professionals across UX design, advertising, and software development.",
      ],
      tools: [
        "WordPress",
        "WooCommerce",
        "HubSpot CRM",
        "Google Analytics",
        "Meta Business Suite",
        "Trello",
        "Slack",
      ]
    },
    {
      role: "Digital Marketing Analyst",
      company: "PSL Software (Loggro)",
      period: "Jan 2018 - Nov 2018",
      location: "Medellín, Colombia",
      type: "Full-time",
      achievements: [
        "Ran B2B demand generation for 2 SaaS ERP products: email nurture, blog content, and webinars.",
        "Increased email open rates from 12% to 35% through segmentation and subject-line A/B testing.",
        "Raised webinar attendance from 20% to 55% with multi-touch reminder sequences.",
        "Built software-contable.co, a comparison site for accounting software used for SEO and display-ad traffic; three years later it still drew ~1,500 Google clicks a month.",
      ],
      tools: [
        "Mailchimp",
        "GoToWebinar",
        "WordPress",
        "Ahrefs",
        "Google Search Console",
        "Google Analytics",
      ]
    },
    {
      role: "Digital Marketing Analyst",
      company: "Loopitems.com",
      period: "Apr 2017 - Jan 2018",
      location: "Medellín, Colombia",
      type: "Full-time",
      achievements: [
        "Managed Meta Ads, Google Ads, SEO, and Klaviyo email for a gaming e-commerce store.",
        "Ran daily social content and community management.",
        "Grew the brand's main social account from 0 to 5,000 followers in 12 months.",
      ],
      tools: [
        "Shopify",
        "Klaviyo",
        "Meta Ads",
        "Google Ads",
        "Photoshop",
        "Premiere Pro",
      ]
    },
    {
      role: "Fullstack Software Developer",
      company: "Grandpa Devs",
      period: "Jan 2014 - Apr 2017",
      location: "Medellín, Colombia",
      type: "Full-time",
      achievements: [
        "Built features, web applications, and rapid prototypes with JavaScript, Node.js, Python, Meteor.js, and MongoDB.",
        "Contributed to internal startup projects and prototypes.",
      ],
      tools: [
        "JavaScript",
        "Node.js",
        "Python",
        "Meteor.js",
        "MongoDB",
        "HTML5",
        "CSS3",
        "Git",
      ]
    },
  ],
  skillCategories: [
    {
      category: "Growth Marketing",
      skills: [
        "Full-funnel strategy",
        "Paid media: Meta, Google, Reddit, LinkedIn (up to $70K/mo)",
        "Email & lifecycle marketing",
        "Technical, on-page & off-page SEO",
        "Direct-response copywriting",
      ]
    },
    {
      category: "Analytics & Attribution",
      skills: [
        "Server-side GTM & server-side events",
        "Google Tag Manager, GA4, Search Console",
        "Triple Whale, Wicked Reports",
        "PostHog",
        "CRO & A/B testing",
      ]
    },
    {
      category: "Martech & Automation",
      skills: [
        "Clay (enrichment, outbound)",
        "Apollo",
        "n8n, Make, Zapier",
        "Salesforce (4 orgs set up from scratch, custom Apex, integrations)",
        "HubSpot, ActiveCampaign, GoHighLevel",
        "Lifecycle email & SMS (Twilio)",
      ]
    },
    {
      category: "Development & AI",
      skills: [
        "AI-assisted development: Claude Code, OpenAI Codex, v0, Lovable",
        "Next.js & React, JavaScript / TypeScript, Node.js",
        "Supabase, PostgreSQL (Neon), MongoDB",
        "Python scripting",
        "REST APIs & webhooks; Claude, OpenAI & Gemini APIs",
        "WordPress, Shopify, Webflow",
      ]
    },
  ],
  education: [
    {
      degree: "Business Management and Innovation",
      institution: "Universidad EAFIT",
      period: "2016 - 2022",
      location: "Medellín, Colombia",
      achievements: [
        "Full scholarship for academic achievement",
        "GPA 4.3/5.0 while working full time",
      ]
    },
    {
      degree: "Technical Program in Multimedia Design & Integration",
      institution: "SENA",
      period: "2014 - 2015",
      location: "Medellín, Colombia",
      achievements: [
        "Two-year technical track (media técnica) completed during high school",
      ]
    },
    {
      degree: "High School Diploma, with honors",
      institution: "",
      period: "",
      location: "Antioquia, Colombia",
      achievements: [
        "Saber 11 (ICFES) national exam: ranked 291st of 548,584 students in Colombia (top 0.1%) and 46th of 73,990 in Antioquia",
        "Top 2 of the class throughout school",
      ]
    },
  ],
  languages: [
    "English — C2 (TOEFL, 2022)",
    "Spanish — Native",
  ]
}

// Backward compatibility exports
export const DEFAULT_WORK_EXPERIENCES = DEFAULT_CV_DATA.experiences
export const DEFAULT_EDUCATION = DEFAULT_CV_DATA.education
export const DEFAULT_SKILLS = DEFAULT_CV_DATA.skillCategories.flatMap((c) => c.skills)

// Records saved from /admin can be missing fields (e.g. older rows have no `linkedin`),
// so fill gaps from the defaults instead of letting the CV page crash.
export function normalizeCV(raw: Partial<CVProfile>): CVProfile {
  const list = <T,>(value: T[] | undefined, fallback: T[]) => (Array.isArray(value) ? value : fallback)
  return {
    ...DEFAULT_CV_DATA,
    ...raw,
    phone: raw.phone || DEFAULT_CV_DATA.phone,
    email: raw.email || DEFAULT_CV_DATA.email,
    linkedin: raw.linkedin || DEFAULT_CV_DATA.linkedin,
    website: raw.website || DEFAULT_CV_DATA.website,
    summary: raw.summary ?? "",
    experiences: list(raw.experiences, DEFAULT_CV_DATA.experiences).map((exp) => ({
      ...exp,
      achievements: list(exp.achievements, []),
      tools: list(exp.tools, []),
    })),
    skillCategories: list(raw.skillCategories, DEFAULT_CV_DATA.skillCategories).map((category) => ({
      ...category,
      skills: list(category.skills, []),
    })),
    education: list(raw.education, DEFAULT_CV_DATA.education).map((edu) => ({
      ...edu,
      achievements: list(edu.achievements, []),
    })),
    languages: list(raw.languages, DEFAULT_CV_DATA.languages),
  }
}

export async function getCVData(): Promise<CVProfile> {
  try {
    if (typeof window !== "undefined") {
      const res = await fetch("/api/cv")
      if (res.ok) {
        const data = await res.json()
        if (data && data.name) return normalizeCV(data)
      }
    }
  } catch (error) {
    console.warn("Could not fetch CV data from API, using default:", error)
  }
  return DEFAULT_CV_DATA
}

export async function updateCVData(profile: CVProfile): Promise<CVProfile> {
  try {
    const res = await fetch("/api/cv", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || "Failed to update CV data")
    }
    return await res.json()
  } catch (error) {
    console.error("Error updating CV data:", error)
    throw error
  }
}
