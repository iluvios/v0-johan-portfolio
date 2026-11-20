import type { Language } from "@/lib/i18n";
import type { Faq, FunnelStage, ProofId, TitledText } from "@/lib/agency/copy";
import type { PlanInput } from "@/lib/agency/pricing";

// One entry per industry landing page (/industries/[slug]) on the agency site.
// To add an industry: add its slug to INDUSTRY_SLUGS and an entry to INDUSTRIES.
// Stats come from our own scan of the 11,951 US business websites in the prospect
// list (.local-audits/exports/industry-benchmarks-report.md); keep them sourced.
// House rule: no dashes in any visible text.

export const INDUSTRY_SLUGS = ["event-venues", "law-firms", "home-services"] as const;
export type IndustrySlug = (typeof INDUSTRY_SLUGS)[number];

export interface IndustryStat {
  value: string;
  label: string;
}

export interface IndustryCopy {
  name: string;
  eyebrow: string;
  hero: string[];
  intro: string;
  metaTitle: string;
  metaDescription: string;
  teaser: string;
  statsTitle: string;
  stats: IndustryStat[];
  statsSource: string;
  painsTitle: string;
  pains: TitledText[];
  funnelTitle: string;
  funnel: Omit<FunnelStage, "tags">[];
  proofTitle: string;
  proofNote: string;
  faq: Faq[];
  ctaTitle: string;
}

export interface Industry {
  slug: IndustrySlug;
  proof: ProofId[];
  preset: Omit<PlanInput, "payment">;
  copy: Record<Language, IndustryCopy>;
}

const STAGES = {
  en: ["Attract", "Convert", "Follow up", "Measure"],
  es: ["Atraer", "Convertir", "Hacer seguimiento", "Medir"],
};

function stages(language: Language, bodies: [string, string][]): Omit<FunnelStage, "tags">[] {
  return bodies.map(([title, body], i) => ({ stage: STAGES[language][i], title, body }));
}

export const INDUSTRIES: Record<IndustrySlug, Industry> = {
  "event-venues": {
    slug: "event-venues",
    proof: ["tecno", "nurses", "autobruder"],
    preset: {
      setup: ["website", "crm", "tracking", "email"],
      channels: ["meta", "google", "social"],
      campaigns: 3,
      videosPerWeek: 1,
      graphicsPerMonth: 8,
    },
    copy: {
      en: {
        name: "Event venues",
        eyebrow: "For wedding and event venues",
        hero: ["More tours booked,", "more dates", "sold."],
        intro:
          "We run the ads, social content, website, follow up and tracking for wedding and event venues, so couples and planners find you, see what you offer and book a tour while your team runs events.",
        metaTitle: "Marketing for Wedding and Event Venues",
        metaDescription:
          "Energy Media runs ads, social media, websites, follow up and tracking for wedding and event venues, so more inquiries turn into tours and booked dates.",
        teaser: "Fill more dates with tour bookings, fast replies and ads for engaged couples and planners.",
        statsTitle: "What we found on 1,861 venue websites",
        stats: [
          { value: "7%", label: "show a starting price or clear offer on the homepage" },
          { value: "7%", label: "let people book a tour online" },
          { value: "12%", label: "show their reviews on the homepage" },
          { value: "35%", label: "run Google or Meta ads at all" },
        ],
        statsSource: "From our own scan of 1,861 US wedding and event venue websites.",
        painsTitle: "Where venues lose bookings",
        pains: [
          {
            title: "Couples leave to compare prices",
            body: "Most venue sites hide pricing behind a contact form. Couples and planners want a starting point before they reach out, so they move on to a venue that shows one.",
          },
          {
            title: "Inquiries wait for a reply",
            body: "People write to several venues at once. The first one to answer with dates and a tour slot usually gets the visit.",
          },
          {
            title: "Instagram gets attention, the site loses it",
            body: "Your photos win attention on social, but the website does not turn that attention into tour bookings.",
          },
          {
            title: "Slow seasons stay empty",
            body: "Without ads and email running ahead of the slow months, weekday and off season dates go unsold.",
          },
        ],
        funnelTitle: "The funnel we build for your venue",
        funnel: stages("en", [
          [
            "Ads and content that show the room",
            "Meta and Google ads for engaged couples and corporate planners near you, plus short videos of real events every week.",
          ],
          [
            "A site that answers the first questions",
            "Website and landing pages with starting prices or packages, real reviews, capacity, availability and a tour booking button.",
          ],
          [
            "A reply before they ask the next venue",
            "An AI assistant on your site, WhatsApp and Instagram answers every inquiry in seconds with dates, packages and a tour link, then reminders follow until they book or decide.",
          ],
          [
            "Know which ads fill the calendar",
            "Tracking from ad to tour to signed contract, so budget goes to the campaigns that book dates.",
          ],
        ]),
        proofTitle: "What this funnel has done elsewhere",
        proofNote:
          "We have not published a venue case study yet, so these results come from other industries using the same pieces: fast replies, ads and pages built to convert.",
        faq: [
          {
            q: "Do you only work with wedding venues?",
            a: "No. Wedding, banquet, corporate and private event venues all sell the same way: people compare, ask about dates, visit, then book.",
          },
          {
            q: "Should we show prices on the website?",
            a: "We usually recommend a starting price or packages. It filters out people who are not a fit and brings more serious tour requests. You decide what to show.",
          },
          {
            q: "What do you need from us?",
            a: "Access to your ad accounts and website, photos and videos from past events, and someone who can answer about dates and pricing.",
          },
        ],
        ctaTitle: "Let’s fill your calendar.",
      },
      es: {
        name: "Venues de eventos",
        eyebrow: "Para venues de bodas y eventos",
        hero: ["Más visitas agendadas,", "más fechas", "vendidas."],
        intro:
          "Operamos la pauta, el contenido para redes, el sitio web, el seguimiento y la medición de venues de bodas y eventos, para que parejas y organizadores te encuentren, vean lo que ofreces y agenden una visita mientras tu equipo hace eventos.",
        metaTitle: "Marketing para venues de bodas y eventos",
        metaDescription:
          "Energy Media opera pauta, redes sociales, sitio web, seguimiento y medición para venues de bodas y eventos, para que más consultas se conviertan en visitas y fechas reservadas.",
        teaser: "Llena más fechas con visitas agendadas, respuestas rápidas y pauta para parejas y organizadores.",
        statsTitle: "Lo que encontramos en 1,861 sitios de venues",
        stats: [
          { value: "7%", label: "muestran un precio desde o una oferta clara en la página principal" },
          { value: "7%", label: "permiten agendar una visita en línea" },
          { value: "12%", label: "muestran sus reseñas en la página principal" },
          { value: "35%", label: "pautan en Google o Meta" },
        ],
        statsSource: "De nuestro propio análisis de 1,861 sitios web de venues de bodas y eventos en EE. UU.",
        painsTitle: "Dónde pierden reservas los venues",
        pains: [
          {
            title: "Las parejas se van a comparar precios",
            body: "La mayoría de sitios esconde los precios detrás de un formulario. Parejas y organizadores quieren una referencia antes de escribir, así que pasan a un venue que la muestra.",
          },
          {
            title: "Las consultas esperan respuesta",
            body: "La gente escribe a varios venues a la vez. El primero que responde con fechas y un horario de visita suele ganarse la cita.",
          },
          {
            title: "Instagram atrae, el sitio pierde",
            body: "Tus fotos ganan atención en redes, pero el sitio web no convierte esa atención en visitas agendadas.",
          },
          {
            title: "Las temporadas bajas quedan vacías",
            body: "Sin pauta y email antes de los meses lentos, las fechas entre semana y de temporada baja no se venden.",
          },
        ],
        funnelTitle: "El embudo que construimos para tu venue",
        funnel: stages("es", [
          [
            "Pauta y contenido que muestran el lugar",
            "Anuncios en Meta y Google para parejas comprometidas y organizadores corporativos cerca de ti, más videos cortos de eventos reales cada semana.",
          ],
          [
            "Un sitio que responde las primeras preguntas",
            "Sitio web y landing pages con precios desde o paquetes, reseñas reales, capacidad, disponibilidad y un botón para agendar la visita.",
          ],
          [
            "Una respuesta antes de que escriban a otro venue",
            "Un asistente de IA en tu sitio, WhatsApp e Instagram responde cada consulta en segundos con fechas, paquetes y un enlace para la visita, y luego llegan recordatorios hasta que reservan o deciden.",
          ],
          [
            "Saber qué anuncios llenan el calendario",
            "Medición desde el anuncio hasta la visita y el contrato firmado, para invertir en las campañas que reservan fechas.",
          ],
        ]),
        proofTitle: "Lo que este embudo ha logrado en otros negocios",
        proofNote:
          "Aún no publicamos un caso de un venue, así que estos resultados vienen de otras industrias con las mismas piezas: respuestas rápidas, pauta y páginas hechas para convertir.",
        faq: [
          {
            q: "¿Solo trabajan con venues de bodas?",
            a: "No. Venues de bodas, banquetes, eventos corporativos y privados venden igual: la gente compara, pregunta por fechas, visita y reserva.",
          },
          {
            q: "¿Debemos mostrar precios en el sitio?",
            a: "Normalmente recomendamos un precio desde o paquetes. Filtra a quien no encaja y trae solicitudes de visita más serias. Tú decides qué mostrar.",
          },
          {
            q: "¿Qué necesitan de nosotros?",
            a: "Acceso a tus cuentas publicitarias y al sitio, fotos y videos de eventos pasados, y alguien que pueda responder sobre fechas y precios.",
          },
        ],
        ctaTitle: "Llenemos tu calendario.",
      },
    },
  },
  "law-firms": {
    slug: "law-firms",
    proof: ["bi", "nurses", "rainforest"],
    preset: {
      setup: ["website", "crm", "tracking", "seo"],
      channels: ["google", "seo", "email"],
      campaigns: 3,
      videosPerWeek: 0,
      graphicsPerMonth: 4,
    },
    copy: {
      en: {
        name: "Law firms",
        eyebrow: "For law firms",
        hero: ["More signed cases,", "not just", "more calls."],
        intro:
          "We run the ads, website, lead follow up, email and tracking for law firms, so the right people find you, book a consultation and sign, and you can see which ads paid for themselves.",
        metaTitle: "Marketing for Law Firms",
        metaDescription:
          "Energy Media runs Google Ads, SEO and AEO, landing pages, lead follow up and tracking for law firms, so more searches turn into consultations and signed cases.",
        teaser: "Turn searches into booked consultations and signed cases, with tracking to prove it.",
        statsTitle: "What we found on 1,818 law firm websites",
        stats: [
          { value: "4%", label: "let people book a consultation online" },
          { value: "19%", label: "offer chat on the website" },
          { value: "52%", label: "run Google or Meta ads" },
          { value: "78%", label: "have weak or missing email authentication (DMARC)" },
        ],
        statsSource: "From our own scan of 1,818 US law firm websites.",
        painsTitle: "Where firms lose cases",
        pains: [
          {
            title: "After hours leads go to voicemail",
            body: "People with a legal problem contact several firms. If nobody answers that night, the next firm gets the consultation.",
          },
          {
            title: "Ads bring calls you cannot use",
            body: "Without tracking down to signed cases, budget keeps going to searches that bring the wrong matters.",
          },
          {
            title: "One homepage for every practice area",
            body: "Someone searching for an immigration lawyer lands on a general homepage instead of a page about their problem.",
          },
          {
            title: "Happy clients are never asked again",
            body: "Without email, the reviews and referrals your past clients would give you never get asked for.",
          },
        ],
        funnelTitle: "The funnel we build for your firm",
        funnel: stages("en", [
          [
            "Show up for the cases you want",
            "Google search ads for your practice areas and cities, plus SEO and AEO so you appear when people ask Google or ChatGPT for a lawyer.",
          ],
          [
            "A page for each practice area",
            "Landing pages that speak to one legal problem, with clear next steps, reviews and online booking for consultations.",
          ],
          [
            "Every lead answered, day or night",
            "An AI intake assistant on your site, WhatsApp and email answers every lead day or night, asks your intake questions and books the consultation. It never gives legal advice and hands off to your team.",
          ],
          [
            "Know your real cost per case",
            "Tracking from ad click to signed case in your CRM, so budget moves to the campaigns that sign clients.",
          ],
        ]),
        proofTitle: "What this funnel has done elsewhere",
        proofNote:
          "We have not published a law firm case study yet, so these results come from other businesses that also sell through a consultation: targeted pages, follow up and search.",
        faq: [
          {
            q: "Which practice areas do you work with?",
            a: "Personal injury, immigration, family, estate planning and business law are the most common. Each gets its own landing pages and campaigns.",
          },
          {
            q: "Do you take intake calls?",
            a: "No, your team or intake service takes the calls. We make sure every web lead gets an instant reply, the right questions and a booking link, and that nothing falls through.",
          },
          {
            q: "Who approves what the ads say?",
            a: "Your firm. Every ad, page and email is approved by you before it goes live, so your attorneys stay in control of what is said.",
          },
        ],
        ctaTitle: "Let’s turn searches into signed cases.",
      },
      es: {
        name: "Firmas de abogados",
        eyebrow: "Para firmas de abogados",
        hero: ["Más casos firmados,", "no solo", "más llamadas."],
        intro:
          "Operamos la pauta, el sitio web, el seguimiento de leads, el email y la medición de firmas de abogados, para que las personas correctas te encuentren, agenden una consulta y firmen, y puedas ver qué anuncios se pagaron solos.",
        metaTitle: "Marketing para firmas de abogados",
        metaDescription:
          "Energy Media opera Google Ads, SEO y AEO, landing pages, seguimiento de leads y medición para firmas de abogados, para que más búsquedas se conviertan en consultas y casos firmados.",
        teaser: "Convierte búsquedas en consultas agendadas y casos firmados, con medición que lo demuestra.",
        statsTitle: "Lo que encontramos en 1,818 sitios de firmas",
        stats: [
          { value: "4%", label: "permiten agendar una consulta en línea" },
          { value: "19%", label: "ofrecen chat en el sitio web" },
          { value: "52%", label: "pautan en Google o Meta" },
          { value: "78%", label: "tienen autenticación de email débil o ausente (DMARC)" },
        ],
        statsSource: "De nuestro propio análisis de 1,818 sitios web de firmas de abogados en EE. UU.",
        painsTitle: "Dónde pierden casos las firmas",
        pains: [
          {
            title: "Los leads de la noche llegan al buzón de voz",
            body: "Quien tiene un problema legal contacta varias firmas. Si nadie responde esa noche, la siguiente firma se queda con la consulta.",
          },
          {
            title: "La pauta trae llamadas que no sirven",
            body: "Sin medición hasta el caso firmado, el presupuesto sigue yendo a búsquedas que traen asuntos equivocados.",
          },
          {
            title: "Una sola página para todas las áreas",
            body: "Quien busca un abogado de inmigración llega a una página general en vez de una página sobre su problema.",
          },
          {
            title: "A los clientes felices nunca se les vuelve a pedir nada",
            body: "Sin email, las reseñas y referidos que te darían tus clientes anteriores nunca se piden.",
          },
        ],
        funnelTitle: "El embudo que construimos para tu firma",
        funnel: stages("es", [
          [
            "Aparecer en los casos que quieres",
            "Anuncios de búsqueda en Google para tus áreas y ciudades, más SEO y AEO para aparecer cuando le piden un abogado a Google o ChatGPT.",
          ],
          [
            "Una página por área de práctica",
            "Landing pages que hablan de un solo problema legal, con pasos claros, reseñas y agenda en línea para consultas.",
          ],
          [
            "Cada lead respondido, de día o de noche",
            "Un asistente de admisión con IA en tu sitio, WhatsApp y email responde cada lead de día o de noche, hace tus preguntas de admisión y agenda la consulta. Nunca da asesoría legal y pasa el caso a tu equipo.",
          ],
          [
            "Conocer tu costo real por caso",
            "Medición desde el clic en el anuncio hasta el caso firmado en tu CRM, para mover el presupuesto a las campañas que firman clientes.",
          ],
        ]),
        proofTitle: "Lo que este embudo ha logrado en otros negocios",
        proofNote:
          "Aún no publicamos un caso de una firma de abogados, así que estos resultados vienen de otros negocios que también venden con una consulta: páginas específicas, seguimiento y búsqueda.",
        faq: [
          {
            q: "¿Con qué áreas de práctica trabajan?",
            a: "Lesiones personales, inmigración, familia, sucesiones y derecho empresarial son las más comunes. Cada una tiene sus propias landing pages y campañas.",
          },
          {
            q: "¿Ustedes atienden las llamadas?",
            a: "No, tu equipo o tu servicio de admisión atiende las llamadas. Nos aseguramos de que cada lead web reciba respuesta inmediata, las preguntas correctas y un enlace para agendar, y que nada se pierda.",
          },
          {
            q: "¿Quién aprueba lo que dicen los anuncios?",
            a: "Tu firma. Apruebas cada anuncio, página y email antes de publicarlo, así tus abogados controlan lo que se dice.",
          },
        ],
        ctaTitle: "Convirtamos búsquedas en casos firmados.",
      },
    },
  },
  "home-services": {
    slug: "home-services",
    proof: ["tecno", "revy", "autobruder"],
    preset: {
      setup: ["website", "crm", "tracking"],
      channels: ["google", "meta"],
      campaigns: 3,
      videosPerWeek: 1,
      graphicsPerMonth: 8,
    },
    copy: {
      en: {
        name: "Home services",
        eyebrow: "For roofing, HVAC, plumbing and solar",
        hero: ["More booked jobs", "from every", "ad dollar."],
        intro:
          "We run the ads, website, quote follow up, email and tracking for roofing, HVAC, plumbing and solar companies, so homeowners reach you first, book an estimate, and you know which ads paid off.",
        metaTitle: "Marketing for Home Service Companies",
        metaDescription:
          "Energy Media runs Google and Meta ads, landing pages, lead follow up and tracking for roofing, HVAC, plumbing and solar companies, so more leads turn into booked jobs.",
        teaser: "Turn ad spend into booked estimates and sold jobs, with fast follow up on every lead.",
        statsTitle: "What we found on 1,658 home service websites",
        stats: [
          { value: "2%", label: "let homeowners book an estimate online" },
          { value: "12%", label: "offer chat on the website" },
          { value: "47%", label: "already run Google or Meta ads" },
          { value: "87%", label: "have weak or missing email authentication (DMARC)" },
        ],
        statsSource: "From our own scan of 1,658 US roofing, HVAC, plumbing and solar company websites.",
        painsTitle: "Where contractors lose jobs",
        pains: [
          {
            title: "Homeowners hire whoever answers first",
            body: "People ask three or four companies for a quote. A slow reply hands the job to a competitor.",
          },
          {
            title: "Paying for clicks that never become jobs",
            body: "Without tracking to booked jobs, ads keep paying for calls about services you do not offer or areas you do not cover.",
          },
          {
            title: "Busy seasons arrive unprepared",
            body: "When storms or heat waves hit, campaigns and pages are not ready. When demand drops, there is no email or reviews engine to keep work coming.",
          },
          {
            title: "Estimates go out, nobody follows up",
            body: "Quotes sit in inboxes with no second touch, so jobs that were almost won are lost quietly.",
          },
        ],
        funnelTitle: "The funnel we build for your company",
        funnel: stages("en", [
          [
            "Ads for the jobs you want",
            "Google search ads for your services in the areas you serve, Meta ads for seasonal offers, and SEO and AEO for local searches.",
          ],
          [
            "Pages that book estimates",
            "Landing pages for each service and city, with financing or free estimate offers, reviews and online booking.",
          ],
          [
            "Every lead answered fast",
            "An AI assistant on your site, WhatsApp and Facebook answers every lead in seconds and books the estimate, then reminders and review requests follow after the job.",
          ],
          [
            "Know which ads bring work",
            "Tracking from ad to booked estimate to sold job, so budget moves to what brings work.",
          ],
        ]),
        proofTitle: "What this funnel has done elsewhere",
        proofNote:
          "We have not published a home services case study yet, so these results come from other industries using the same pieces: search ads, fast follow up and pages built to convert.",
        faq: [
          {
            q: "Which trades do you work with?",
            a: "Roofing and storm restoration, HVAC, plumbing, and solar and energy storage. The same funnel works for most home service trades.",
          },
          {
            q: "Do you sell us shared leads?",
            a: "No. We run ads in your own accounts, so every lead is yours alone and never shared with other contractors.",
          },
          {
            q: "Can you track sold jobs, not just calls?",
            a: "When your CRM or job software records the sale, yes. We connect it during setup so reports show booked and sold jobs.",
          },
        ],
        ctaTitle: "Let’s book more jobs.",
      },
      es: {
        name: "Servicios para el hogar",
        eyebrow: "Para techos, HVAC, plomería y solar",
        hero: ["Más trabajos agendados", "por cada", "dólar en pauta."],
        intro:
          "Operamos la pauta, el sitio web, el seguimiento de cotizaciones, el email y la medición de empresas de techos, HVAC, plomería y energía solar, para que los propietarios te contacten primero, agenden una visita y sepas qué anuncios dieron resultado.",
        metaTitle: "Marketing para empresas de servicios para el hogar",
        metaDescription:
          "Energy Media opera pauta en Google y Meta, landing pages, seguimiento de leads y medición para empresas de techos, HVAC, plomería y solar, para que más leads se conviertan en trabajos agendados.",
        teaser: "Convierte la pauta en visitas agendadas y trabajos vendidos, con seguimiento rápido a cada lead.",
        statsTitle: "Lo que encontramos en 1,658 sitios de servicios para el hogar",
        stats: [
          { value: "2%", label: "permiten agendar una visita de cotización en línea" },
          { value: "12%", label: "ofrecen chat en el sitio web" },
          { value: "47%", label: "ya pautan en Google o Meta" },
          { value: "87%", label: "tienen autenticación de email débil o ausente (DMARC)" },
        ],
        statsSource:
          "De nuestro propio análisis de 1,658 sitios web de empresas de techos, HVAC, plomería y solar en EE. UU.",
        painsTitle: "Dónde pierden trabajos los contratistas",
        pains: [
          {
            title: "El propietario contrata a quien responde primero",
            body: "La gente pide cotización a tres o cuatro empresas. Una respuesta lenta le entrega el trabajo a la competencia.",
          },
          {
            title: "Pagar clics que nunca se vuelven trabajos",
            body: "Sin medición hasta el trabajo agendado, la pauta sigue pagando llamadas de servicios que no ofreces o zonas que no cubres.",
          },
          {
            title: "Las temporadas altas llegan sin preparación",
            body: "Cuando llegan tormentas u olas de calor, las campañas y páginas no están listas. Cuando baja la demanda, no hay email ni reseñas que mantengan el trabajo.",
          },
          {
            title: "Se envían cotizaciones y nadie hace seguimiento",
            body: "Las cotizaciones quedan en la bandeja sin un segundo contacto, y los trabajos casi ganados se pierden en silencio.",
          },
        ],
        funnelTitle: "El embudo que construimos para tu empresa",
        funnel: stages("es", [
          [
            "Pauta para los trabajos que quieres",
            "Anuncios de búsqueda en Google para tus servicios en las zonas que cubres, Meta Ads para ofertas de temporada, y SEO y AEO para búsquedas locales.",
          ],
          [
            "Páginas que agendan cotizaciones",
            "Landing pages por servicio y ciudad, con ofertas de financiación o cotización gratis, reseñas y agenda en línea.",
          ],
          [
            "Cada lead respondido rápido",
            "Un asistente de IA en tu sitio, WhatsApp y Facebook responde cada lead en segundos y agenda la cotización, y luego llegan recordatorios y solicitudes de reseña al terminar el trabajo.",
          ],
          [
            "Saber qué anuncios traen trabajo",
            "Medición desde el anuncio hasta la visita agendada y el trabajo vendido, para mover el presupuesto a lo que trae trabajo.",
          ],
        ]),
        proofTitle: "Lo que este embudo ha logrado en otros negocios",
        proofNote:
          "Aún no publicamos un caso de servicios para el hogar, así que estos resultados vienen de otras industrias con las mismas piezas: anuncios de búsqueda, seguimiento rápido y páginas hechas para convertir.",
        faq: [
          {
            q: "¿Con qué oficios trabajan?",
            a: "Techos y reparación por tormentas, HVAC, plomería, y energía solar y almacenamiento. El mismo embudo sirve para la mayoría de servicios para el hogar.",
          },
          {
            q: "¿Nos venden leads compartidos?",
            a: "No. Pautamos en tus propias cuentas, así cada lead es solo tuyo y nunca se comparte con otros contratistas.",
          },
          {
            q: "¿Pueden medir trabajos vendidos, no solo llamadas?",
            a: "Sí, cuando tu CRM o software de trabajos registra la venta. Lo conectamos en la configuración para que los reportes muestren trabajos agendados y vendidos.",
          },
        ],
        ctaTitle: "Agendemos más trabajos.",
      },
    },
  },
};

export function isIndustrySlug(value: string): value is IndustrySlug {
  return (INDUSTRY_SLUGS as readonly string[]).includes(value);
}

export function getIndustry(slug: string): Industry | null {
  return isIndustrySlug(slug) ? INDUSTRIES[slug] : null;
}
