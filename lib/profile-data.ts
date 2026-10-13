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
  summary: "Growth marketer with 12+ years across software development, performance marketing and GTM, mostly helping startups go from zero to one. I run the full funnel (paid media, landing pages, lifecycle email and SEO) and build the stack underneath it: attribution, CRM and automations, with a heavy focus on A/B testing at every step.\n\nRecent results: cut Meta cost per registered user 61% while scaling spend 13× (RevyAutos.com), +132% orders on Autobruder.com's Shopify store, 3.7× Google search clicks for RainforestFoundation.org, and $108K+ in prepaid B2B contracts from cold email at Savant.",
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
        "Managed five-figure monthly ad budgets across Meta, Google, Reddit, TikTok and YouTube Shorts.",
        "Implemented and maintained multi-touch attribution with Wicked Reports and Triple Whale to guide analysis and spend across revenue channels.",
        "Automated customer support routing to manage 100+ daily tickets.",
        "Built startup MVPs end-to-end with AI coding tools (Claude Code, OpenAI Codex), including getmilotrack.com: a HIPAA-compliant mileage app for non-profits that report to insurers and US government agencies, built from requirements to field testing with the first client, plus its outreach pipeline (Apollo, ActiveCampaign, Calendly).",
        "Conformational Aesthetics: set up the Shopify store, Triple Whale attribution, Klaviyo flows and UGC paid social campaigns, and built the B2B pipeline for finding med spa partners (Apollo, ActiveCampaign, Calendly).",
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
        "Autobruder 4WD: rebuilt the Shopify store, tracking and ad accounts from scratch, added 10,000+ products and a custom camping-setup app; conversion rate went from 0.33% to 0.7% and orders grew 132% in 3 months.",
        "Rainforest Foundation US: led the technical rebuild of a 35-page nonprofit site and 220 blog posts with no lost URLs (2024); a 2025 SEO optimization (speed, content structure, internal linking, AEO) grew Google search clicks 3.7× and lifted average position from 16.5 to 6.5.",
        "International Nurses: rebuilt the brand, website and funnel for a $3K consultancy that helps nurses across Latin America work abroad. Added weekly group webinars (30–80 nurses a week) before the one-on-one interview and built email lists from nursing associations; new clients went from 3–4 to 6–7 a month.",
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
        "Rebuilt the brand, the Webflow website, Salesforce CRM and tracking; the company still uses the brand, website and emails.",
        "Ran cold email to a 90K-contact trucking list with A/B tests and GPT-3-personalized opening lines: about 60 qualified leads, closed into 6 new clients on prepaid yearly contracts starting at $1.5K/month ($108K+).",
        "Managed implementation for about 6 upsold clients, automating invoicing, trucker and truck document checks and manual data entry with UiPath, Python and early AI tools that read invoices and emails.",
        "Grew and led a 4-person automation team, and handled Salesforce setup, updates and custom Apex widget development.",
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
      role: "Marketing & Sales Lead (Co-founder)",
      company: "Energy Media Agency",
      period: "Jan 2019 - Mar 2022",
      location: "Medellín, Colombia",
      type: "Full-time",
      achievements: [
        "Co-founded a web design, marketing and software agency with 3 partners; I ran sales and client relationships from the first call to delivery.",
        "Took the agency from zero to about $15K a month in revenue: about 100 websites in three years (growing from about 10 the first year to about 70 the last), about 40 paid media accounts, and app projects of up to $30K.",
        "Ran a team of 8 full-time (4 partners, 2 designers, 2 WordPress developers), and brought in up to 6 contract software developers at a time for app and platform projects, plus video editors on demand. Hybrid team, about half remote.",
        "Clients included nonprofits, restaurant groups, real estate agencies, clinics, e-commerce brands, an international consultancy and early-stage startups.",
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
        "Ran B2B demand generation for 2 SaaS products (accounting software and an ERP): email nurture, SEO, Google Ads and webinars.",
        "Increased email open rates from 12% to 35% through segmentation and subject-line A/B testing.",
        "Raised webinar show-up rate from 20% to 55% with multi-touch reminder sequences.",
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
      period: "Apr 2017 - Jan 2018",
      location: "Medellín, Colombia",
      type: "Self-employed",
      achievements: [
        "Built and ran my own gaming dropshipping store from scratch on Shopify, with orders automated to AliExpress suppliers: about $5K in sales in its first year.",
        "Made about 80% of the memes, ads and creatives myself (a designer helped with the rest), launched about 5 new ads a week and A/B tested them on Meta and Google Ads, alongside SEO and Klaviyo email.",
        "Posted 3 times a day, scheduled two weeks ahead, and handled customer support myself; grew the social account from 0 to 5,000 followers in 12 months through partnerships with other gaming Facebook and Instagram pages and in-person gaming events.",
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
      period: "Jan 2014 - Apr 2017",
      location: "Medellín, Colombia",
      type: "Part-time from 11th grade, then full-time",
      achievements: [
        "Started part-time (about 35 hours a week) in 11th grade, then worked full-time for a year and a half before starting college on a scholarship.",
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
        "Full-funnel strategy",
        "Paid media: Meta, Google, Reddit, TikTok, YouTube, LinkedIn (five-figure monthly budgets)",
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
        "Saber 11 national exam: top 0.05% in Colombia",
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
