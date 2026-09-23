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
  title: "Senior Martech & GTM Engineer",
  phone: "+57 318 406 4960",
  email: "contact@asjohan.com",
  location: "Medellín, Colombia · Remote (US hours)",
  website: "https://asjohan.com",
  linkedin: "https://linkedin.com/in/johanalvarez",
  summary:
    "Martech and GTM engineer with 10+ years across software development, growth marketing, and marketing operations, most of it helping startups go from zero to one. I work both halves of growth: the campaigns and creative — paid media on Meta, Google, Reddit, and LinkedIn (up to $70K/month), lifecycle email, SEO, and direct-response copy — and the systems that generate and measure the pipeline they produce: outbound and enrichment (Clay, Apollo), CRM and lifecycle automation (Salesforce, HubSpot, ActiveCampaign, n8n), and attribution (server-side GTM, GA4, Triple Whale, Wicked Reports).\n\nI started as a fullstack developer and now ship production apps with AI coding tools — including Refio.so, a platform I built end-to-end and took from idea to active users in under two months. I've set up Salesforce from scratch for four projects, including custom Apex, and I came up through agencies leading design, copy, and delivery teams, so I build with CAC, ROAS, and conversion in mind.",
  experiences: [
    {
      role: "Martech & GTM Engineer",
      company: "Freelance",
      period: "Mar 2026 - Present",
      location: "Medellín, Colombia / Remote",
      type: "Freelance",
      achievements: [
        "Built automated B2B outbound and enrichment funnels with Clay, Apollo, and Salesforce for NY startup Building Intelligence, targeting enterprise decision-makers.",
        "Built AI content workflows with Claude and n8n that centralize paid media creation, ad copy variations, and cross-channel performance analytics.",
        "Implemented full-funnel attribution and tracking with Google Tag Manager, GA4, and Triple Whale to follow multi-touch journeys and measure blended ROAS.",
        "Built responsive websites and landing pages from Figma designs and v0 prototypes, aligned with client brand guidelines.",
        "Led a complete website redesign and copy overhaul, modernizing brand positioning.",
      ],
      tools: ["Clay", "Apollo", "Salesforce", "HubSpot", "n8n", "Claude", "Codex", "v0", "GA4", "GTM", "Twilio"],
    },
    {
      role: "Senior Martech Specialist",
      company: "Pvragon",
      period: "Apr 2025 - Mar 2026",
      location: "Medellín, Colombia / Remote",
      type: "Full-time",
      achievements: [
        "Designed and implemented the martech and GTM automation stack for the agency's venture-backed startup clients.",
        "Managed multi-channel advertising (Meta, Google, Reddit, LinkedIn) with monthly budgets up to $70K USD.",
        "Implemented and maintained multi-touch attribution with Wicked Reports and Triple Whale to guide spend across revenue channels.",
        "Automated real-time analytics sync, customer support routing, and cross-platform lead qualification with n8n.",
        "Deployed CRM architecture and lifecycle email automation in ActiveCampaign, growing user registrations from 30/day to 200/day.",
        "Built startup MVPs end-to-end with AI coding tools (Claude Code, OpenAI Codex), including Refio.so — taken from idea to a working platform with active users in under 2 months (Next.js, Supabase, Twilio).",
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
      ],
    },
    {
      role: "Marketing Freelancer",
      company: "Independent Consultant",
      period: "Nov 2022 - May 2025",
      location: "Medellín, Colombia / Remote",
      type: "Freelance",
      description:
        "Marketing automation, full-funnel strategy, and digital transformation for clients across South America and the US.",
      achievements: [
        "Ran end-to-end digital marketing for clients: lifecycle email, direct-response copywriting, technical SEO, and paid media (Meta Ads, Google Ads).",
        "Served as project manager, sourcing and coordinating UX designers, developers, and photographers across delivery sprints.",
        "Generated $500K+ USD in attributable new revenue for clients through funnel optimization and CRO testing.",
      ],
      tools: ["HubSpot", "ActiveCampaign", "Salesforce", "GoHighLevel", "Meta Ads", "Google Ads", "GA4", "SEMrush", "Webflow", "WordPress", "Figma"],
    },
    {
      role: "Marketing & Automation Lead",
      company: "Savant International",
      period: "Mar 2022 - Nov 2022",
      location: "Medellín, Colombia",
      type: "Full-time",
      achievements: [
        "Launched full-funnel acquisition programs: Webflow landing pages, automated lifecycle email journeys, and SMS retargeting.",
        "Led RPA and workflow automation across client operations, reducing manual workload by 60%.",
        "Helped upsell automation retainers to existing accounts, increasing average client value.",
        "Grew and mentored the automation team from 1 to 6 full-time specialists.",
      ],
      tools: ["Zapier", "Make", "Twilio SMS", "ActiveCampaign", "Webflow", "Python", "Google Sheets API", "ClickUp"],
    },
    {
      role: "Marketing & Sales Lead (Co-founder)",
      company: "Energy Media Agency",
      period: "Jan 2019 - Mar 2022",
      location: "Medellín, Colombia",
      type: "Full-time",
      achievements: [
        "Co-founded a digital marketing and software development agency; ran sales and managed client engagements from discovery to delivery.",
        "Led delivery of full-service marketing for e-commerce and B2B clients across industries.",
        "Managed a team of 8 full-time professionals across UX design, advertising, and software development.",
      ],
      tools: ["WordPress", "WooCommerce", "HubSpot CRM", "Google Analytics", "Meta Business Suite", "Trello", "Slack"],
    },
    {
      role: "Digital Marketing Analyst",
      company: "PSL Software",
      period: "Jan 2018 - Nov 2018",
      location: "Medellín, Colombia",
      type: "Full-time",
      achievements: [
        "Ran B2B demand generation for 2 SaaS ERP products: email nurture, blog content, and webinars.",
        "Increased email open rates from 12% to 35% through segmentation and subject-line A/B testing.",
        "Raised webinar attendance from 20% to 55% with multi-touch reminder sequences.",
        "Grew organic traffic by 50,000+ monthly visits through technical, on-page, and off-page SEO.",
      ],
      tools: ["Mailchimp", "GoToWebinar", "WordPress", "Ahrefs", "Google Search Console", "Google Analytics"],
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
      tools: ["Shopify", "Klaviyo", "Meta Ads", "Google Ads", "Photoshop", "Premiere Pro"],
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
      tools: ["JavaScript", "Node.js", "Python", "Meteor.js", "MongoDB", "HTML5", "CSS3", "Git"],
    },
  ],
  skillCategories: [
    {
      category: "GTM & Marketing Automation",
      skills: [
        "Clay (enrichment, outbound)",
        "Apollo",
        "n8n, Make, Zapier",
        "Salesforce (4 orgs set up from scratch, custom Apex, integrations)",
        "HubSpot, ActiveCampaign, GoHighLevel",
        "Lifecycle email & SMS (Twilio)",
      ],
    },
    {
      category: "Growth Marketing",
      skills: [
        "Full-funnel strategy",
        "Paid media: Meta, Google, Reddit, LinkedIn (up to $70K/mo)",
        "Email & lifecycle marketing",
        "Technical, on-page & off-page SEO",
        "Direct-response copywriting",
      ],
    },
    {
      category: "Content, Brand & Creative",
      skills: [
        "Ad creative and copy variations (AI-assisted production workflows)",
        "Landing pages and websites from Figma designs and v0 prototypes",
        "Brand positioning and website copy overhauls",
        "Blog, webinar, and email content programs",
        "Social and community management; Photoshop, Premiere Pro",
      ],
    },
    {
      category: "Analytics & Attribution",
      skills: [
        "Server-side GTM & server-side events",
        "Google Tag Manager, GA4, Search Console",
        "Triple Whale, Wicked Reports",
        "PostHog",
        "CRO & A/B testing",
      ],
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
      ],
    },
  ],
  education: [
    {
      degree: "Business Management and Innovation",
      institution: "Universidad EAFIT",
      period: "2016 - 2022",
      location: "Medellín, Colombia",
      achievements: ["Full scholarship for academic achievement", "GPA 4.3/5.0 while working full time"],
    },
    {
      degree: "Technical Program in Multimedia Design & Integration",
      institution: "SENA",
      period: "2014 - 2015",
      location: "Medellín, Colombia",
      achievements: ["Two-year technical track (media técnica) completed during high school"],
    },
    {
      degree: "High School Diploma, with honors",
      institution: "",
      period: "",
      location: "Antioquia, Colombia",
      achievements: [
        "Saber 11 (ICFES) national exam: ranked 291st of 548,584 students in Colombia (top 0.1%) and 46th of 73,990 in Antioquia",
        "Top 2 of the class throughout school",
      ],
    },
  ],
  languages: ["English — C2 (TOEFL, 2022)", "Spanish — Native"],
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
