import type { Language } from "@/lib/i18n";
import type { TitledText } from "@/lib/agency/copy";

// About page copy for the Energy Media agency site.
// Team bios describe each person's role on client work; add facts only when confirmed.
// To add a photo, drop it in public/media/team and set `photo` (4:5 portrait).
// House rule: no dashes in any visible text.

export interface TeamMember {
  id: "johan" | "sebastian" | "santiago" | "nidward";
  name: string;
  /** Years of experience, shown on each team card (confirmed by Johan). */
  years: number;
  photo?: string;
  link?: string;
}

export const TEAM: TeamMember[] = [
  {
    id: "johan",
    name: "Johan Alvarez",
    years: 12,
    photo: "/images/johan-portrait.webp",
    link: "https://asjohan.com",
  },
  { id: "sebastian", name: "Sebastian", years: 10, photo: "/media/team/sebastian.webp" },
  { id: "santiago", name: "Santiago", years: 5, photo: "/media/team/santiago.webp" },
  { id: "nidward", name: "Nidward Pernía", years: 2, photo: "/media/team/nidward.webp" },
];

interface MemberCopy {
  role: string;
  body: string;
  tags: string[];
}

export const aboutCopy = {
  en: {
    eyebrow: "About us",
    title: "A small team that does the work itself.",
    description:
      "Energy Media is a team of experienced marketing professionals in Medellín, Colombia. We build and run marketing for small businesses in the US and Latin America, and you talk directly to the people doing the work.",
    teamEyebrow: "The team",
    teamTitle: "The people behind your funnel.",
    team: {
      sebastian: {
        role: "Paid Media Expert",
        body: "Plans and runs your Google and Meta campaigns: audiences, creative testing, budgets and weekly optimization, so your money goes to what brings customers.",
        tags: ["Google Ads", "Meta Ads", "Creative testing"],
      },
      johan: {
        role: "GTM Engineer · Cofounder",
        body: "Builds the system behind the funnel: websites, CRM, automations, chat assistants and tracking, connected so every lead lands in one place.",
        tags: ["CRM and automation", "Tracking", "Websites"],
      },
      santiago: {
        role: "Digital Design Lead",
        body: "Designs everything digital: the UX of your website and landing pages, your brand, your videos and your social media content, so your business looks as good as it works.",
        tags: ["UX and UI", "Brand", "Video and social media"],
      },
      nidward: {
        role: "Paid Media Specialist (Junior)",
        body: "Works with Sebastian on your campaigns every day: setting up ads, launching creative tests, watching budgets and preparing the weekly numbers.",
        tags: ["Google Ads", "Meta Ads", "Reporting"],
      },
    } satisfies Record<TeamMember["id"], MemberCopy>,
    years: (n: number) => `${n} years of experience`,
    portfolio: "Portfolio",
    storyEyebrow: "Our story",
    storyTitle: "Growth breaks in the gaps between ads, website and follow up.",
    storyBody:
      "Ads agencies buy traffic, web designers build pages, and nobody owns what happens after the click. Energy Media was cofounded in 2019 as a web design, marketing and software agency. Today we bring ads, design, websites, email, CRM and tracking together in one small team, and use AI to move faster and keep prices fair.",
    storyWork: "See our work",
    principlesEyebrow: "How we work",
    principlesTitle: "What you can expect from us.",
    principles: [
      {
        title: "New customers over vanity metrics",
        body: "Impressions and clicks don’t pay payroll. We report on leads, booked calls, sales and cost per customer.",
      },
      {
        title: "One team, no telephone game",
        body: "The people who plan the campaign also build the landing page, set up the CRM and check the tracking.",
      },
      {
        title: "Plain words, upfront prices",
        body: "You see the price before the call and get a short monthly report you can actually read.",
      },
      {
        title: "Everything stays yours",
        body: "Ad accounts, domains, websites, CRM automations and dashboards stay in your company’s name.",
      },
    ] as TitledText[],
    toolsLabel: "Tools we work with",
  },
  es: {
    eyebrow: "Nosotros",
    title: "Un equipo pequeño que hace el trabajo.",
    description:
      "Energy Media es un equipo de profesionales de marketing con amplia experiencia, en Medellín, Colombia. Construimos y operamos el marketing de pequeñas empresas en EE. UU. y Latinoamérica, y hablas directamente con quienes hacen el trabajo.",
    teamEyebrow: "El equipo",
    teamTitle: "Las personas detrás de tu embudo.",
    team: {
      sebastian: {
        role: "Experto en pauta digital",
        body: "Planea y opera tus campañas en Google y Meta: audiencias, pruebas de creatividades, presupuestos y optimización semanal, para que tu dinero vaya a lo que trae clientes.",
        tags: ["Google Ads", "Meta Ads", "Pruebas creativas"],
      },
      johan: {
        role: "Ingeniero GTM · Cofundador",
        body: "Construye el sistema detrás del embudo: sitios web, CRM, automatizaciones, asistentes de chat y medición, conectados para que cada lead llegue a un solo lugar.",
        tags: ["CRM y automatización", "Medición", "Sitios web"],
      },
      santiago: {
        role: "Líder de diseño digital",
        body: "Diseña todo lo digital: la experiencia de tu sitio web y tus landing pages, tu marca, tus videos y el contenido de tus redes, para que tu negocio se vea tan bien como trabaja.",
        tags: ["UX y UI", "Marca", "Video y redes sociales"],
      },
      nidward: {
        role: "Especialista en pauta digital (junior)",
        body: "Trabaja con Sebastian en tus campañas todos los días: configura anuncios, lanza pruebas de creatividades, vigila presupuestos y prepara los números de cada semana.",
        tags: ["Google Ads", "Meta Ads", "Reportes"],
      },
    } satisfies Record<TeamMember["id"], MemberCopy>,
    years: (n: number) => `${n} años de experiencia`,
    portfolio: "Portafolio",
    storyEyebrow: "Nuestra historia",
    storyTitle: "El crecimiento se rompe entre la pauta, el sitio y el seguimiento.",
    storyBody:
      "Las agencias de pauta compran tráfico, los diseñadores hacen páginas, y nadie responde por lo que pasa después del clic. Energy Media fue cofundada en 2019 como agencia de diseño web, marketing y software. Hoy unimos pauta, diseño, sitios web, email, CRM y medición en un solo equipo pequeño, y usamos IA para ir más rápido y mantener precios justos.",
    storyWork: "Ver nuestro trabajo",
    principlesEyebrow: "Cómo trabajamos",
    principlesTitle: "Lo que puedes esperar de nosotros.",
    principles: [
      {
        title: "Clientes nuevos antes que métricas de vanidad",
        body: "Las impresiones y los clics no pagan la nómina. Reportamos leads, llamadas agendadas, ventas y costo por cliente.",
      },
      {
        title: "Un solo equipo, sin teléfono roto",
        body: "Quienes planean la campaña también hacen la landing page, configuran el CRM y revisan la medición.",
      },
      {
        title: "Palabras simples, precios a la vista",
        body: "Ves el precio antes de la llamada y recibes un reporte mensual corto que sí se entiende.",
      },
      {
        title: "Todo queda a tu nombre",
        body: "Cuentas publicitarias, dominios, sitios web, automatizaciones del CRM y tableros quedan a nombre de tu empresa.",
      },
    ] as TitledText[],
    toolsLabel: "Herramientas con las que trabajamos",
  },
};
