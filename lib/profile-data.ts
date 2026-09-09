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
  summary: string
  experiences: WorkExperience[]
  skillCategories: SkillCategory[]
  education: EducationItem[]
  languages: string[]
}

export const DEFAULT_CV_DATA: CVProfile = {
  name: "Johan Alvarez",
  title: "Senior Martech Specialist",
  phone: "+57 3184064960",
  email: "contact@asjohan.com",
  location: "Medellin, Colombia",
  website: "https://asjohan.com",
  summary:
    "Senior Digital Marketing Specialist with 10+ years of experience leading diverse marketing projects and teams. Proven ability to drive revenue growth through data-driven strategies across marketing, automation, and team leadership. Background as a Fullstack Software Developer and Business Manager provides the technical expertise to efficiently implement and manage the tech- and business-aligned solutions essential for modern marketing.",
  experiences: [
    {
      role: "Senior Martech Specialist",
      company: "Pvragon",
      period: "Apr 2025 - Mar 2026",
      location: "Medellin, Colombia (Remote)",
      type: "Full-time",
      achievements: [
        "Architected end-to-end Martech implementation & GTM automation infrastructure for venture-backed startups.",
        "Managed multi-channel online advertising campaigns with monthly budgets scaling up to $70k USD/month at target CAC.",
        "Implemented and maintained multi-touch attribution modeling utilizing Wicked Reports and Triple Whale to pinpoint revenue channels.",
        "Automated mission-critical marketing flows with n8n for real-time analytics sync, customer support routing, and cross-platform lead qualification.",
        "Deployed CRM architecture and lifecycle email automations in HubSpot, accelerating user registrations from 30/day to 200/day (+566% growth).",
      ],
      tools: [
        "n8n",
        "Triple Whale",
        "Wicked Reports",
        "HubSpot",
        "Meta Ads",
        "Google Ads",
        "GA4",
        "GTM",
        "Webhooks / REST APIs",
      ],
    },
    {
      role: "Marketing Freelancer",
      company: "Independent Consultant",
      period: "Nov 2022 - Jun 2025",
      location: "Medellin, Colombia / USA (Remote)",
      type: "Freelance",
      description:
        "Specialized in marketing automation, full-funnel strategies, and digital transformation for diverse clients across South America and the USA.",
      achievements: [
        "Executed 360° digital marketing operations including lifecycle email marketing, direct-response copywriting, technical SEO, and paid media (Meta Ads, Google Ads).",
        "Served as Project Manager, sourcing and orchestrating multidisciplinary teams (UX designers, software developers, photographers) across sprint cycles.",
        "Drove substantial client growth through rigorous funnel optimization and CRO testing, generating over $500k+ USD in attributable new revenue for past clients.",
      ],
      tools: [
        "HubSpot",
        "ActiveCampaign",
        "Meta Ads Manager",
        "Google Ads",
        "Webflow",
        "WordPress",
        "Figma",
        "Google Analytics 4",
        "SEMrush",
        "Asana",
      ],
    },
    {
      role: "Marketing & Automation Lead",
      company: "Savant International",
      period: "Mar 2022 - Nov 2022",
      location: "Medellin, Colombia",
      type: "Full-time",
      achievements: [
        "Implemented full-funnel acquisition strategies: launched high-converting Webflow landing pages, automated lifecycle email journeys, and managed targeted SMS retargeting.",
        "Led the architecture and deployment of RPA and workflow automations across diverse client operations, achieving a verified 60% reduction in manual workload.",
        "Contributed to upselling strategic automation retainers to existing accounts, significantly lifting average customer lifetime value.",
        "Scaled and mentored the automation engineering team from 1 to 6 full-time technical specialists.",
      ],
      tools: [
        "Zapier",
        "Make (Integromat)",
        "Twilio SMS",
        "ActiveCampaign",
        "Webflow",
        "ClickUp",
        "Python",
        "Google Sheets API",
      ],
    },
    {
      role: "Marketing & Sales Lead",
      company: "Energy Media Agency",
      period: "Jan 2019 - Mar 2022",
      location: "Medellin, Colombia",
      type: "Full-time",
      achievements: [
        "Co-founded a digital marketing and software development agency, directing sales pipelines and managing client engagements from inception to delivery.",
        "Led client implementation of full-service marketing packages sold across diverse e-commerce and B2B industry verticals.",
        "Managed a high-performance multidisciplinary team of 8 full-time professionals (UX designers, advertising specialists, software engineers).",
      ],
      tools: [
        "WordPress",
        "WooCommerce",
        "HubSpot CRM",
        "Google Analytics",
        "Meta Business Suite",
        "Trello",
        "Slack",
      ],
    },
    {
      role: "Digital Marketing Analyst",
      company: "PSL Software",
      period: "Jan 2018 - Nov 2018",
      location: "Medellin, Colombia",
      type: "Full-time",
      achievements: [
        "Implemented targeted B2B demand-generation strategies for 2 SaaS ERP platforms, incorporating automated email drips, technical blog writing, and online webinars.",
        "Increased email campaign open rates from 12% to 35% through behavioral segmentation and subject-line A/B testing.",
        "Boosted webinar attendance rates from 20% to 55% via multi-touch reminder sequences.",
        "Generated over 50,000 new monthly organic website visits by executing technical on-page and off-page SEO strategies.",
      ],
      tools: [
        "Mailchimp",
        "GoToWebinar",
        "Zoom",
        "WordPress",
        "Ahrefs",
        "Google Search Console",
        "Google Analytics",
      ],
    },
    {
      role: "Digital Marketing Analyst",
      company: "Loopitems.com",
      period: "Apr 2017 - Jan 2018",
      location: "Medellin, Colombia",
      type: "Full-time",
      achievements: [
        "Managed performance marketing campaigns across Meta Ads, Google Ads, SEO, and Klaviyo email marketing for a high-volume gamer e-commerce store.",
        "Oversaw daily social media presence and content production, maintaining high community engagement.",
        "Organically scaled the brand's core social media presence from 0 to 5,000 active followers within 12 months.",
      ],
      tools: [
        "Shopify",
        "Klaviyo",
        "Meta Ads Manager",
        "Google Ads",
        "Adobe Photoshop",
        "Adobe Premiere Pro",
      ],
    },
    {
      role: "Fullstack Software Developer",
      company: "Grandpa Devs",
      period: "Jan 2014 - Apr 2017",
      location: "Medellin, Colombia",
      type: "Full-time",
      achievements: [
        "Architected and deployed fullstack web applications and rapid prototypes using HTML5, CSS3, JavaScript (ES6+), Node.js, Python, and Meteor.js.",
        "Assisted in the development and agile prototyping of internal startup ventures, building solid engineering foundations that directly empower modern Martech integrations.",
      ],
      tools: [
        "JavaScript (ES6+)",
        "Node.js",
        "Python",
        "Meteor.js",
        "MongoDB",
        "HTML5/CSS3",
        "REST APIs",
        "Git",
      ],
    },
  ],
  skillCategories: [
    {
      category: "Marketing & Martech (7+ Years)",
      skills: [
        "Full-Funnel Strategy & Development (Expert)",
        "Email Marketing Automation & Campaigns (Expert)",
        "Technical, On-Page & Off-Page SEO",
        "Paid Media Management (Meta Ads, Google Ads)",
        "CRM Architecture (HubSpot, Salesforce, ActiveCampaign)",
        "Workflow Automation (n8n, Zapier, Make)",
        "Web Analytics (GA4, Google Tag Manager, Search Console)",
        "Attribution Modeling (Triple Whale, Wicked Reports)",
        "Conversion Rate Optimization (CRO & A/B Testing)",
        "AI Marketing Tools (ElevenLabs, Captions.ai, Gemini, ChatGPT)",
        "Airtable & Google Sheets API Automation",
      ],
    },
    {
      category: "Low-Code Platforms",
      skills: [
        "WordPress (Advanced)",
        "Shopify (Advanced)",
        "Webflow (Advanced)",
        "Lovable",
        "v0.app (Advanced)",
      ],
    },
    {
      category: "Web Development & AI Engineering",
      skills: [
        "OpenAI API & Gemini API Integration",
        "JavaScript (ES6+) & TypeScript",
        "Next.js & React",
        "Node.js & Python",
        "HTML5, CSS3 & Tailwind CSS",
        "MongoDB & PostgreSQL (Neon)",
        "RESTful APIs & Webhook Pipelines",
        "Git & CI/CD Deployment",
      ],
    },
  ],
  education: [
    {
      degree: "Business Management and Innovation",
      institution: "Universidad EAFIT, Medellin",
      period: "2016 - 2022",
      location: "Medellin, Colombia",
      achievements: [
        "Fully paid scholarship recipient for outstanding academic achievement",
        "Graduated with honors in Business Strategy & Technology Management",
      ],
    },
    {
      degree: "Graphic and Multimedia Design",
      institution: "SENA, Medellin",
      period: "2014 - 2015",
      location: "Medellin, Colombia",
      achievements: [
        "Specialized in Digital Media Creation, UI/UX Layouts, and Brand Identity",
      ],
    },
  ],
  languages: [
    "English — Level C2 (Proficient / Bilingual, TOEFL 2022)",
    "Spanish — Native",
  ],
}

// Backward compatibility exports
export const DEFAULT_WORK_EXPERIENCES = DEFAULT_CV_DATA.experiences
export const DEFAULT_EDUCATION = DEFAULT_CV_DATA.education
export const DEFAULT_SKILLS = DEFAULT_CV_DATA.skillCategories.flatMap((c) => c.skills)

export async function getCVData(): Promise<CVProfile> {
  try {
    if (typeof window !== "undefined") {
      const res = await fetch("/api/cv")
      if (res.ok) {
        const data = await res.json()
        if (data && data.name) return data
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
