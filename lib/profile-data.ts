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
  title: "Senior Growth Marketer · Demand Generation & Martech",
  phone: "+57 318 406 4960",
  email: "contact@asjohan.com",
  location: "Medellín, Colombia · Remote (US hours)",
  website: "https://asjohan.com",
  linkedin: "https://linkedin.com/in/johanalvarez",
  summary: "Growth marketer with 12+ years across performance marketing, GTM and software development, mostly helping startups go from zero to one. I build programs that turn marketing into pipeline (paid media, outbound, landing pages, lifecycle email and SEO) and the stack underneath them: attribution, CRM and automations, with a heavy focus on A/B testing at every step. I've run sales myself at the agency I cofounded, and I work side by side with sales teams: I learn how they sell, then build the tools and automations that make their work easier.\n\nMost of my work has been for B2B and SaaS companies, ecommerce brands and nonprofits across the US and Latin America, usually as a growth team of one, and I've also led teams of up to 8.",
  experiences: [
    {
      role: "Growth & Martech Consultant",
      company: "Freelance",
      period: "Mar 2026 to Present",
      location: "Medellín, Colombia / Remote",
      type: "Freelance",
      achievements: [
        "Building Intelligence (NY security tech company): 65 qualified sales calls and 4 closed deals worth $87K a year from automated account based outbound to named enterprise accounts, reaching several decision makers at each over sales cycles of several months (Clay, Apollo, landing pages for each industry, Salesforce tracking), plus a full website redesign and copy overhaul.",
        "Built an AI marketing platform for 2 companies and moved their marketing onto it: one control center for creative, ad copy, website, email and analytics, used to decide what to make next and A/B test every step of the funnel.",
        "Growth partner for brands and startups, from strategy to execution: brand and design updates, websites, tracking, CRM and email marketing. Current and recent clients include Rainforest Foundation US, Building Intelligence and Agentic Software.",
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
      company: "Pvragon (San Diego, CA)",
      period: "Apr 2025 to Mar 2026",
      location: "San Diego, CA / Remote",
      type: "Full time, then contract from Jan 2026",
      achievements: [
        "Revy Autos: cut Meta cost per registered user 61% ($17.94 → $7.07) while scaling monthly Meta spend 13×, by pushing for persona landing pages and creative testing at up to 30 new ads a week.",
        "Grew daily user registrations from ~30 to 200 with paid media and ActiveCampaign lifecycle automation.",
        "Managed monthly ad budgets in the five figures across Meta, Google, Reddit, TikTok and YouTube Shorts.",
        "Implemented and maintained multitouch attribution with Wicked Reports and Triple Whale to guide analysis and spend across revenue channels.",
        "Conformational Aesthetics: set up the Shopify store, Triple Whale attribution, Klaviyo flows and UGC paid social campaigns, and built the B2B sales pipeline for finding med spa partners, with automated email flows for every stage (Apollo, ActiveCampaign, Calendly).",
        "Built startup MVPs end to end with AI coding tools (Claude Code, OpenAI Codex), including getmilotrack.com: a HIPAA compliant mileage app for nonprofits that report to insurers and US government agencies, built from requirements to field testing with the first client, plus its outreach pipeline (Apollo, ActiveCampaign, Calendly).",
        "Automated customer support routing to manage 100+ daily tickets.",
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
      period: "Nov 2022 to May 2025",
      location: "Medellín, Colombia / Remote",
      type: "Freelance",
      description: "Marketing automation, full funnel strategy, and digital transformation for clients across South America and the US.",
      achievements: [
        "International Nurses: rebuilt the brand, website and funnel for a $3K consultancy that helps nurses across Latin America work abroad. Added weekly group webinars (30 to 80 nurses a week) to qualify nurses before the one on one interview and built email lists from nursing associations; new clients went from 3 or 4 to 6 or 7 a month.",
        "Autobruder 4WD: rebuilt the Shopify store, tracking and ad accounts from scratch, added 10,000+ products and a custom camping setup app; conversion rate went from 0.33% to 0.7% and orders grew 132% in 3 months.",
        "Rainforest Foundation US: led the technical rebuild of a nonprofit site of 35 pages and 220 blog posts with no lost URLs (2024); a 2025 SEO optimization (speed, content structure, internal linking, AEO) grew Google search clicks 3.7× and lifted average position from 16.5 to 6.5.",
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
      period: "Mar 2022 to Nov 2022",
      location: "Medellín, Colombia",
      type: "Full time",
      achievements: [
        "Ran cold email to a trucking list of 90K contacts with A/B tests and opening lines personalized with GPT-3: about 60 qualified leads, closed into 6 new clients on prepaid yearly contracts starting at $1.5K/month ($108K+).",
        "Rebuilt the brand, the Webflow website, Salesforce CRM and tracking; the company still uses the brand, website and emails.",
        "Grew and led an automation team of 4, and handled Salesforce setup, updates and custom Apex widget development.",
        "Managed implementation for about 6 upsold clients, automating invoicing, trucker and truck document checks and manual data entry with UiPath, Python and early AI tools that read invoices and emails.",
      ],
      tools: [
        "UiPath",
        "Python",
        "Salesforce",
        "Apex",
        "Segment",
        "Twilio SendGrid",
        "GPT-3",
        "Zapier",
        "Make",
        "Webflow",
        "Google Sheets API",
        "ClickUp",
      ]
    },
    {
      role: "Marketing & Sales Lead (Cofounder)",
      company: "Energy Media Agency",
      period: "Jan 2019 to Mar 2022",
      location: "Medellín, Colombia",
      type: "Full time",
      achievements: [
        "Cofounded a web design, marketing and software agency with 3 partners; I ran sales and client relationships from the first call to delivery.",
        "Took the agency from zero to about $15K a month in revenue: about 100 websites in three years (growing from about 10 the first year to about 70 the last), about 40 paid media accounts, and app projects of up to $30K.",
        "Ran a team of 8 full time (4 partners, 2 designers, 2 WordPress developers), and brought in up to 6 contract software developers at a time for app and platform projects, plus video editors on demand. Hybrid team, about half remote.",
        "Clients included nonprofits, restaurant groups, real estate agencies, clinics, ecommerce brands, an international consultancy and early stage startups.",
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
      period: "Jan 2018 to Nov 2018",
      location: "Medellín, Colombia",
      type: "Full time",
      achievements: [
        "Ran B2B demand generation for 2 SaaS products (accounting software and an ERP) together with the sales team: email nurture, SEO, Google Ads and webinars.",
        "Increased email open rates from 12% to 35% through segmentation and subject line A/B testing.",
        "Raised webinar turnout from 20% to 55% with reminder sequences with several touches.",
        "Built software-contable.co, an SEO comparison site for accounting software; about two years after I left, it still drew 1,496 Google clicks and 34.1K impressions in a single month.",
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
      role: "Founder",
      company: "Loopitems.com",
      period: "Apr 2017 to Jan 2018",
      location: "Medellín, Colombia",
      type: "Self employed",
      achievements: [
        "Built and ran my own gaming dropshipping store from scratch on Shopify, with orders automated to AliExpress suppliers: about $5K in sales in its first year.",
        "Made about 80% of the memes, ads and creatives myself (a designer helped with the rest), launched about 5 new ads a week and A/B tested them on Meta and Google Ads, alongside SEO and Klaviyo email.",
        "Posted 3 times a day, scheduled two weeks ahead, and handled customer support myself; grew the social account from 0 to 5,000 followers in 12 months through partnerships with other gaming Facebook and Instagram pages and in person gaming events.",
      ],
      tools: [
        "Shopify",
        "AliExpress dropshipping",
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
      period: "Jan 2014 to Apr 2017",
      location: "Medellín, Colombia",
      type: "Part time from 11th grade, then full time",
      achievements: [
        "Started part time (about 35 hours a week) in 11th grade, then worked full time for a year and a half before starting college on a scholarship.",
        "Built features, web applications, and rapid prototypes with JavaScript, Node.js, Python, Meteor.js, and MongoDB.",
        "Worked on the company's own startup projects, including a year in Apps.co, iNNpulsa Colombia's startup accelerator.",
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
        "Full funnel strategy",
        "B2B demand generation: account based outbound, webinars and email nurture",
        "Paid media: Meta, Google, Reddit, TikTok, YouTube, LinkedIn (monthly budgets in the five figures)",
        "Email & lifecycle marketing",
        "Technical, on page & off page SEO",
        "Direct response copywriting",
      ]
    },
    {
      category: "Marketing Ops & Automation",
      skills: [
        "HubSpot, ActiveCampaign, GoHighLevel",
        "Salesforce (4 orgs set up from scratch, custom Apex, integrations)",
        "Sales pipeline automation and tools for sales teams",
        "Clay (enrichment, outbound)",
        "Apollo",
        "n8n, Make, Zapier",
        "Lifecycle email & SMS (Twilio)",
      ]
    },
    {
      category: "Analytics & Attribution",
      skills: [
        "Server GTM & server events",
        "Google Tag Manager, GA4, Search Console",
        "Triple Whale, Wicked Reports",
        "PostHog",
        "CRO & A/B testing",
      ]
    },
    {
      category: "Development & AI",
      skills: [
        "AI assisted development: Claude Code, OpenAI Codex, v0, Lovable",
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
      period: "2016 to 2022",
      location: "Medellín, Colombia",
      achievements: [
        "Full scholarship for academic achievement",
        "GPA 4.3/5.0 while working full time",
      ]
    },
    {
      degree: "Technical Program in Multimedia Design & Integration",
      institution: "SENA",
      period: "2014 to 2015",
      location: "Medellín, Colombia",
      achievements: [
        "Two year technical track (media técnica) completed during high school",
      ]
    },
    {
      degree: "High School Diploma, with honors",
      institution: "",
      period: "",
      location: "Antioquia, Colombia",
      achievements: [
        "Saber 11 national exam: top 0.05% in Colombia",
      ]
    },
  ],
  languages: [
    "English: C2 (TOEFL, 2022)",
    "Spanish: Native",
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
