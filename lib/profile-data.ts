export interface WorkExperience {
  role: string
  company: string
  period: string
  location: string
  type: string
  description?: string
  achievements: string[]
}

export interface EducationItem {
  degree: string
  institution: string
  period: string
  location: string
  achievements: string[]
}

export const DEFAULT_WORK_EXPERIENCES: WorkExperience[] = [
  {
    role: "Marketing Automation Specialist",
    company: "Pvragon",
    period: "June 2025 - Current",
    location: "Medellín, Colombia (Remote)",
    type: "Full-time",
    achievements: [
      "Leading marketing automation initiatives for international clients",
      "Implementing advanced funnel strategies and conversion optimization",
      "Developing data-driven marketing solutions and analytics frameworks",
    ],
  },
  {
    role: "INDEPENDENT / FREELANCE",
    company: "Marketing & Innovation Strategist",
    period: "November 2022 - June 2025",
    location: "Medellín, Colombia",
    type: "Freelance",
    description:
      "Specialized in marketing automation, full-funnel strategies, and digital transformation for diverse clients across multiple industries.",
    achievements: [
      "Delivered 50+ successful marketing automation projects",
      "Increased client conversion rates by an average of 35%",
      "Built comprehensive marketing funnels generating $2M+ in revenue",
      "Developed custom analytics dashboards and reporting systems",
    ],
  },
  {
    role: "GRANDPA DEVS",
    company: "Marketing Automation Specialist",
    period: "September 2021 - November 2022",
    location: "Medellín, Colombia",
    type: "Full-time",
    achievements: [
      "Implemented marketing automation workflows for 20+ clients",
      "Reduced manual marketing tasks by 60% through automation",
      "Created comprehensive lead nurturing campaigns",
      "Developed ROI tracking and performance analytics systems",
    ],
  },
]

export const DEFAULT_EDUCATION: EducationItem[] = [
  {
    degree: "Systems Engineering",
    institution: "Universidad de Antioquia",
    period: "2016 - 2021",
    location: "Medellín, Colombia",
    achievements: [
      "Academic Excellence Scholarship recipient",
      "Graduated with honors in Software Development",
      "Specialized in Data Analytics and Business Intelligence",
    ],
  },
]

export const DEFAULT_SKILLS = [
  "Marketing Automation",
  "HubSpot",
  "Salesforce",
  "Google Analytics",
  "Facebook Ads",
  "Google Ads",
  "Email Marketing",
  "Lead Generation",
  "Conversion Optimization",
  "A/B Testing",
  "Data Analysis",
  "Python",
  "JavaScript",
  "React",
  "Next.js",
  "SQL",
  "Tableau",
  "Power BI",
]
