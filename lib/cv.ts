export type CvLanguage = "en" | "es";
export type LocalizedText = Record<CvLanguage, string>;

export const cvCopy = {
  en: {
    label: "Curriculum vitae",
    role: "Senior Martech Specialist",
    intro: "Connecting marketing, technology, and business to turn complex challenges into measurable growth.",
    download: "Download CV", print: "Print", pdfNote: "Original PDF · English",
    navigation: "On this page", overview: "Profile", experience: "Experience", skills: "Skills & tools", education: "Education", languages: "Languages",
    summary: [
      "Senior Digital Marketing Specialist with 10+ years of experience leading marketing projects and teams. I drive revenue growth through data-driven strategies, marketing automation, and team leadership.",
      "My background in fullstack development and business management helps me bridge strategy and implementation — building the technical solutions that modern marketing needs.",
    ],
    experienceNote: "From building software to building growth.",
    skillsNote: "The strategy, systems, and tools behind the work.",
    scholarship: "Full scholarship for academic achievement",
    business: "Business Management and Innovation", design: "Graphic and Multimedia Design",
    english: "English", proficiency: "C2 · Proficient", certification: "TOEFL · 2022",
    contactTitle: "Let’s put this experience to work.", contactText: "Have a role or a project in mind? I’d love to hear about it.", contactAction: "Get in touch",
    latest: "Most recent role", back: "Back to top",
  },
  es: {
    label: "Hoja de vida",
    role: "Especialista Senior en Martech",
    intro: "Conecto marketing, tecnología y negocio para transformar retos complejos en crecimiento medible.",
    download: "Descargar CV", print: "Imprimir", pdfNote: "PDF original · Inglés",
    navigation: "En esta página", overview: "Perfil", experience: "Experiencia", skills: "Habilidades y herramientas", education: "Educación", languages: "Idiomas",
    summary: [
      "Especialista Senior en Marketing Digital con más de 10 años de experiencia liderando proyectos y equipos de marketing. Impulso el crecimiento de ingresos con estrategias basadas en datos, automatización y liderazgo de equipos.",
      "Mi formación en desarrollo fullstack y administración de negocios me permite conectar la estrategia con la implementación: construir las soluciones tecnológicas que necesita el marketing actual.",
    ],
    experienceNote: "De crear software a impulsar el crecimiento.",
    skillsNote: "Las estrategias, los sistemas y las herramientas detrás del trabajo.",
    scholarship: "Beca completa por excelencia académica",
    business: "Administración de Negocios e Innovación", design: "Diseño Gráfico y Multimedia",
    english: "Inglés", proficiency: "C2 · Competente", certification: "TOEFL · 2022",
    contactTitle: "Pongamos esta experiencia en acción.", contactText: "¿Tienes un puesto o un proyecto en mente? Me encantaría conocerlo.", contactAction: "Hablemos",
    latest: "Experiencia más reciente", back: "Volver arriba",
  },
};

export const cvExperience: {
  company: string;
  role: LocalizedText;
  period: LocalizedText;
  summary: LocalizedText;
  achievements: Record<CvLanguage, string[]>;
}[] = [
  {
    company: "Freelance",
    role: { en: "Senior Martech Specialist", es: "Especialista Senior en Martech" },
    period: { en: "Mar 2026 — Present", es: "Mar 2026 — Presente" },
    summary: {
      en: "Developing AI-powered marketing infrastructure, automated B2B outbound funnels, and modern web applications.",
      es: "Desarrollo de infraestructura de marketing con IA, embudos automatizados de prospección B2B y aplicaciones web modernas.",
    },
    achievements: {
      en: [
        "Built automated AI content workflows using Claude and n8n to centralize paid media creation, ad copy variations, and cross-channel performance analytics.",
        "Developed responsive websites and high-converting landing pages from Figma designs and AI prototypes (v0), strictly aligned with client brand guidelines.",
        "Built automated B2B outbound and enrichment funnels with Clay, Apollo, and Salesforce for NY startup Building Intelligence, targeting enterprise decision-makers.",
        "Led a complete website redesign and copy overhaul, modernizing brand positioning and improving visual clarity and user engagement.",
      ],
      es: [
        "Construí flujos de contenido con IA usando Claude y n8n para centralizar la creación de pauta, variaciones de copy y analítica entre canales.",
        "Desarrollé sitios web responsivos y páginas de aterrizaje de alta conversión a partir de diseños en Figma y prototipos con IA (v0), cumpliendo con las guías de marca.",
        "Implementé embudos automatizados de prospección y enriquecimiento B2B con Clay, Apollo y Salesforce para la startup neoyorquina Building Intelligence, dirigidos a tomadores de decisiones.",
        "Lideré el rediseño completo del sitio web y la optimización de copy, modernizando el posicionamiento de marca y mejorando la claridad visual y la conversión.",
      ],
    },
  },
  {
    company: "Pvragon",
    role: { en: "Senior Martech Specialist", es: "Especialista Senior en Martech" },
    period: { en: "Apr 2025 — Mar 2026", es: "Abr 2025 — Mar 2026" },
    summary: { en: "Managed Martech implementation for a go-to-market agency serving startups.", es: "Gestioné la implementación de Martech en una agencia de go-to-market para startups." },
    achievements: {
      en: ["Managed online advertising budgets of up to $70,000 USD per month.", "Implemented attribution with Wicked Reports and Triple Whale, alongside CRM systems and email automations.", "Built n8n workflows for analytics, support, and cross-platform lead qualification.", "Grew daily user registrations from 30 to 200."],
      es: ["Gestioné presupuestos de publicidad digital de hasta $70.000 USD al mes.", "Implementé atribución con Wicked Reports y Triple Whale, además de CRM y automatizaciones de email.", "Automaticé flujos de analítica, soporte y calificación de leads entre plataformas con n8n.", "Aumenté los registros diarios de usuarios de 30 a 200."],
    },
  },
  {
    company: "Freelance",
    role: { en: "Marketing Freelancer", es: "Consultor de Marketing Independiente" },
    period: { en: "Nov 2022 — Mar 2025", es: "Nov 2022 — Mar 2025" },
    summary: { en: "Managed end-to-end marketing projects for clients across South America and the USA.", es: "Gestioné proyectos de marketing de principio a fin para clientes en Sudamérica y Estados Unidos." },
    achievements: {
      en: ["Delivered email marketing, copywriting, SEO, and paid advertising through Meta and Google Ads.", "Sourced and coordinated UX designers, developers, and photographers as project manager.", "Generated over $500,000 USD in attributable new client revenue through funnel and campaign optimization."],
      es: ["Ejecuté email marketing, copywriting, SEO y publicidad de pago en Meta y Google Ads.", "Como Project Manager, seleccioné y coordiné diseñadores UX, desarrolladores y fotógrafos.", "Generé más de $500.000 USD en nuevos ingresos atribuibles para clientes mediante la optimización de embudos y campañas."],
    },
  },
  {
    company: "Savant International",
    role: { en: "Marketing & Automation Lead", es: "Líder de Marketing y Automatización" },
    period: { en: "Mar 2022 — Nov 2022", es: "Mar 2022 — Nov 2022" },
    summary: { en: "Implemented full-funnel strategies, from website launches to automated email, retargeting, and SMS campaigns.", es: "Implementé estrategias de embudo completo: sitios web, email automatizado, retargeting y campañas de SMS." },
    achievements: {
      en: ["Implemented RPA and workflow automation, reducing manual workload by 60%.", "Helped upsell services to existing clients, increasing average client value.", "Scaled the automation team from 1 to 6 full-time employees."],
      es: ["Implementé RPA y automatización de procesos, reduciendo la carga de trabajo manual en un 60%.", "Contribuí a vender nuevos servicios a clientes existentes, aumentando su valor promedio.", "Amplié el equipo de automatización de 1 a 6 empleados de tiempo completo."],
    },
  },
  {
    company: "Energy Media Agency",
    role: { en: "Marketing and Sales Lead", es: "Líder de Marketing y Ventas" },
    period: { en: "Jan 2019 — Mar 2022", es: "Ene 2019 — Mar 2022" },
    summary: { en: "Co-founded a digital marketing and software development agency.", es: "Cofundé una agencia de marketing digital y desarrollo de software." },
    achievements: {
      en: ["Led sales and managed client projects from discovery through delivery.", "Directed marketing service implementation for clients across industries.", "Managed 8 full-time employees across UX design, advertising, and software development."],
      es: ["Lideré ventas y gestioné proyectos de clientes de principio a fin.", "Dirigí la implementación de servicios de marketing para clientes de distintas industrias.", "Gestioné un equipo de 8 empleados de tiempo completo en UX, publicidad y desarrollo de software."],
    },
  },
  {
    company: "PSL Software",
    role: { en: "Digital Marketing Analyst", es: "Analista de Marketing Digital" },
    period: { en: "Jan 2018 — Nov 2018", es: "Ene 2018 — Nov 2018" },
    summary: { en: "Implemented marketing for two SaaS products in the ERP industry, including email, blog content, and webinars.", es: "Implementé marketing para dos productos SaaS del sector ERP, con email, contenido de blog y webinars." },
    achievements: {
      en: ["Increased email open rates from 12% to 35% and webinar attendance rates from 20% to 55%.", "Generated over 50,000 new monthly website visits through SEO strategies."],
      es: ["Aumenté las tasas de apertura de emails del 12% al 35% y la asistencia a webinars del 20% al 55%.", "Generé más de 50.000 nuevas visitas mensuales al sitio web con estrategias SEO."],
    },
  },
  {
    company: "Loopitems.com",
    role: { en: "Digital Marketing Analyst", es: "Analista de Marketing Digital" },
    period: { en: "Apr 2017 — Jan 2018", es: "Abr 2017 — Ene 2018" },
    summary: { en: "Managed Meta and Google Ads, SEO, and email campaigns for a gaming ecommerce store.", es: "Gestioné campañas de Meta y Google Ads, SEO y email para un ecommerce de gaming." },
    achievements: {
      en: ["Oversaw daily social content and community engagement.", "Grew the main social media account from 0 to 5,000 followers in 12 months."],
      es: ["Supervisé el contenido diario en redes sociales y la interacción con la comunidad.", "Hice crecer la cuenta principal de redes sociales de 0 a 5.000 seguidores en 12 meses."],
    },
  },
  {
    company: "Grandpa Devs",
    role: { en: "Fullstack Software Developer", es: "Desarrollador de Software Fullstack" },
    period: { en: "Jan 2014 — Apr 2017", es: "Ene 2014 — Abr 2017" },
    summary: { en: "Developed features and applications using HTML5, CSS, JavaScript, Node.js, Python, and Meteor.js.", es: "Desarrollé funcionalidades y aplicaciones con HTML5, CSS, JavaScript, Node.js, Python y Meteor.js." },
    achievements: {
      en: ["Contributed to internal startup projects and prototypes."],
      es: ["Contribuí al desarrollo de proyectos internos y prototipos para startups."],
    },
  },
];

export const cvSkills: { title: LocalizedText; description: LocalizedText; tools: string[] }[] = [
  {
    title: { en: "Marketing & growth", es: "Marketing y crecimiento" },
    description: { en: "Expert in full-funnel strategy and email marketing. Advanced on-page, off-page, and technical SEO; paid media and conversion optimization.", es: "Experto en embudos completos y email marketing. SEO on-page, off-page y técnico avanzado; publicidad de pago y optimización de conversiones." },
    tools: ["Meta Ads", "Google Ads", "SEO", "A/B Testing"],
  },
  {
    title: { en: "CRM & automation", es: "CRM y automatización" },
    description: { en: "CRM setup, integration, and workflow automation, with custom implementations for connected marketing operations.", es: "Configuración e integración de CRM, automatización de procesos e implementaciones a medida para conectar las operaciones de marketing." },
    tools: ["HubSpot", "Salesforce", "ActiveCampaign", "n8n", "Zapier", "Make", "Airtable", "Google Sheets"],
  },
  {
    title: { en: "Analytics & attribution", es: "Analítica y atribución" },
    description: { en: "Web analytics, tracking, and attribution to connect campaign performance to business results.", es: "Analítica web, seguimiento y atribución para conectar el rendimiento de las campañas con los resultados del negocio." },
    tools: ["Google Analytics", "Tag Manager", "Search Console", "Triple Whale", "Wicked Reports"],
  },
  {
    title: { en: "Development & AI", es: "Desarrollo e IA" },
    description: { en: "Fullstack development, API integrations, and AI tools that bring marketing ideas into production.", es: "Desarrollo fullstack, integraciones de APIs y herramientas de IA para llevar las ideas de marketing a producción." },
    tools: ["JavaScript", "Node.js", "Next.js", "HTML", "CSS", "Tailwind", "MongoDB", "APIs", "OpenAI API", "Gemini API", "Gemini", "ElevenLabs", "Captions.ai"],
  },
  {
    title: { en: "Web & low-code platforms", es: "Plataformas web y low-code" },
    description: { en: "Advanced experience building with ecommerce, content management, and low-code platforms.", es: "Experiencia avanzada con plataformas de ecommerce, gestión de contenidos y desarrollo low-code." },
    tools: ["WordPress", "Shopify", "Webflow", "Lovable", "v0.app"],
  },
];
