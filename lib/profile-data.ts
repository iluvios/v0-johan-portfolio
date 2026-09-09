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

export const DEFAULT_CV_DATA: CVProfile = {
  name: "Johan Alvarez",
  title: "Senior Martech Specialist",
  phone: "+57 3184064960",
  email: "contact@asjohan.com",
  location: "Medellin, Colombia",
  website: "https://asjohan.com",
  linkedin: "https://linkedin.com/in/johanalvarez",
  summary:
    "Senior Digital Marketing Specialist with 10+ years of experience leading diverse marketing projects and teams. I have a proven ability to drive revenue growth through data-driven strategies across marketing, automation, and team leadership.\n\nMy background as a Fullstack Software Developer and Business Manager provides the technical expertise to efficiently implement and manage the tech and business aligned solutions essential for modern marketing.",
  experiences: [
    {
      role: "Senior Martech Specialist",
      company: "Pvragon",
      period: "Apr 2025 - Mar 2026",
      location: "Medellin, Colombia",
      type: "Full-time",
      achievements: [
        "Managed Martech implementation for a GTM agency for startups",
        "Managed online advertising with budgets up to 70kusd/month",
        "Implemented and managed attribution tools like Wicked Reports and Triple Whale",
        "Automated marketing flows with n8n for analytics, support, lead qualification between platforms",
        "CRM implementation, email automations",
        "Grew user registrations from 30 a day to 200 a day",
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
      ],
    },
    {
      role: "Marketing Freelancer",
      company: "Freelance",
      period: "Nov 2022 - Jun 2025",
      location: "Medellin, Colombia / USA (Remote)",
      type: "Freelance",
      achievements: [
        "Manage end-to-end marketing projects for clients across South America and the USA.",
        "Execute digital marketing tasks including email marketing, copywriting, SEO, and paid advertising campaigns (Meta, Google Ads).",
        "Serve as Project Manager, sourcing and coordinating necessary talent (UX designers, software developers, photographers).",
        "Drove significant client growth through funnel/campaign optimization resulting in over $500k+ usd in attributable new revenue for past clients.",
      ],
      tools: [
        "HubSpot",
        "ActiveCampaign",
        "Meta Ads",
        "Google Ads",
        "Webflow",
        "WordPress",
        "Figma",
        "GA4",
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
        "Implemented full-funnel strategies: launched websites, automated email marketing, and managed retargeting/SMS campaigns.",
        "Led the implementation of RPA and automation solutions across diverse client workflows, achieving a 60% reduction in manual workload.",
        "Contributed to upselling new services to existing clients, increasing average client value.",
        "Scaled the automation team from 1 to 6 full-time employees.",
      ],
      tools: [
        "Zapier",
        "Make",
        "Twilio SMS",
        "ActiveCampaign",
        "Webflow",
        "Python",
        "Google Sheets",
      ],
    },
    {
      role: "Marketing and Sales Lead",
      company: "Energy Media Agency",
      period: "Jan 2019 - Mar 2022",
      location: "Medellin, Colombia",
      type: "Full-time",
      achievements: [
        "Co-founded a digital marketing and software development agency.",
        "Drove sales efforts and managed client projects from start to finish.",
        "Led the implementation of marketing services sold to clients across various industries.",
        "Managed a multidisciplinary team of 8 full-time employees (UX designers, advertising specialists, software developers, etc.).",
      ],
      tools: [
        "WordPress",
        "WooCommerce",
        "HubSpot CRM",
        "Google Analytics",
        "Meta Business Suite",
        "Trello",
      ],
    },
    {
      role: "Digital Marketing Analyst",
      company: "PSL Software",
      period: "Jan 2018 - Nov 2018",
      location: "Medellin, Colombia",
      type: "Full-time",
      achievements: [
        "Implemented marketing strategies for 2 SaaS products within the ERP industry, including email marketing, blog writing, and online webinar setup and promotion.",
        "Increased email open rates from 12% to 35%, Boosted webinar attendance rates from 20% to 55%, Generated over 50,000 new monthly website visits through SEO strategies.",
      ],
      tools: [
        "HubSpot",
        "Mailchimp",
        "WordPress",
        "GoToWebinar",
        "Google Analytics",
        "Ahrefs",
      ],
    },
    {
      role: "Digital Marketing Analyst",
      company: "Loopitems.com",
      period: "Apr 2017 - Jan 2018",
      location: "Medellin, Colombia",
      type: "Full-time",
      achievements: [
        "Managed digital marketing campaigns (Meta/Google Ads, SEO, Email) for a gamer e-commerce store.",
        "Oversaw social media presence, including daily content creation and community engagement.",
        "Grew the main social media account from 0 to 5,000 followers in 12 months.",
      ],
      tools: [
        "Shopify",
        "Klaviyo",
        "Meta Ads",
        "Google Ads",
        "Photoshop",
        "Premiere Pro",
      ],
    },
    {
      role: "Fullstack Software Developer",
      company: "Grandpa Devs",
      period: "Jan 2014 - Apr 2017",
      location: "Medellin, Colombia",
      type: "Full-time",
      achievements: [
        "Developed features and applications using HTML5, CSS, JavaScript, Node.js, Python, and Meteor.js.",
        "Assisted in the development of internal startup projects and prototypes.",
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
      ],
    },
  ],
  skillCategories: [
    {
      category: "Marketing (7 años)",
      skills: [
        "Full-Funnel Strategy & Development (Expert)",
        "Email Marketing Automation & Campaigns (Expert)",
        "SEO (On-page, Off-page, Technical - Advanced)",
        "Paid Media Management (Meta Ads, Google Ads)",
        "CRM Setup & Integration (Active Campaign, Salesforce, Hubspot)",
        "Workflow Automation (Zapier, Make, etc.)",
        "Google sheets",
        "Airtable and custom implementations",
        "N8N, Zapier, Make",
        "Web Analytics (Google Analytics, Tag Manager, Google Search Console)",
        "Attribution tools (Triplewhale, Wicked Reports)",
        "Conversion Rate Optimization (A/B Testing)",
        "Other AI tools: ElevenLabs, Captions.ai, Gemini, ChatGPT",
      ],
    },
    {
      category: "Low-Code Platforms",
      skills: [
        "WordPress (Advanced)",
        "Shopify (Advanced)",
        "Webflow (Advanced)",
        "Lovable, V0.app (advanced)",
      ],
    },
    {
      category: "Web Development Skills",
      skills: [
        "OpenAI API, Gemini API",
        "Node.js, Javascript, Html, CSS",
        "Next.js, Mongo DB, APIs, Tailwind",
        "Python, Git, REST APIs",
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
        "Fully paid scholarship for academic achievement",
      ],
    },
    {
      degree: "Graphic and multimedia design",
      institution: "SENA, Medellin, Colombia",
      period: "2014 - 2015",
      location: "Medellin, Colombia",
      achievements: [],
    },
  ],
  languages: [
    "English Level C2 (TOEFL, 2022)",
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
