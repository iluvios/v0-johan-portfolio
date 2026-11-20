import type { Language } from "@/lib/i18n";
import type { ChannelId, ExamplePlanId, SetupId } from "@/lib/agency/pricing";

// Copy for the Energy Media agency site (energymedia tenant).
// Audience: small business owners who want results that are good, fast and affordable.
// AI is mentioned only where it helps the buyer: speed, savings, and connected follow up.
// House rule: no dashes in any visible text.

export type ProofId = "revy" | "autobruder" | "rainforest" | "bi" | "nurses" | "tecno";

export interface ProofItem {
  client: string;
  value: string;
  label: string;
  context: string;
  href?: string;
  image?: string;
}

export interface TitledText {
  title: string;
  body: string;
}

export interface FunnelStage {
  stage: string;
  title: string;
  body: string;
  tags: string[];
}

export interface Faq {
  q: string;
  a: string;
}

export interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

const PROOF_MEDIA: Partial<Record<ProofId, { href: string; image: string }>> = {
  revy: { href: "/projects/50", image: "/media/blog-images/1790987526320-main-1790987524830.webp" },
  autobruder: {
    href: "/projects/25",
    image: "/media/portfolio-images/optimized/Autobruder-portada-C12oRgpzU4orVHEbcFmEPuconyr4cn.webp",
  },
  rainforest: {
    href: "/projects/29",
    image: "/media/portfolio-images/optimized/Home-Hero-OqhxrsoA3Wd1J2wbduWjo6pDG3W3Nz.webp",
  },
  nurses: {
    href: "/projects/43",
    image: "/media/portfolio-images/optimized/international-nurses-4emYrFAqRipI9pSojWKLg6IR4gMqJW.webp",
  },
  tecno: {
    href: "/projects/41",
    image: "/media/portfolio-images/optimized/tecnoprotejidos-hero-1-ZuwF95Vi8cCoS9l2B2NAgq47h3FPa9.webp",
  },
};

const proofText: Record<Language, Record<ProofId, Omit<ProofItem, "href" | "image">>> = {
  en: {
    revy: {
      client: "Revy Autos",
      value: "61%",
      label: "lower Meta cost per registered user while monthly spend grew 13x",
      context: "Car selling app · led by our founder at Pvragon",
    },
    autobruder: {
      client: "Autobruder 4WD",
      value: "+132%",
      label: "orders in 3 months, with the conversion rate more than doubled",
      context: "Ecommerce · led by our founder",
    },
    rainforest: {
      client: "Rainforest Foundation US",
      value: "3.7x",
      label: "more Google search clicks after a website rebuild and SEO overhaul",
      context: "Nonprofit · led by our founder",
    },
    bi: {
      client: "Building Intelligence",
      value: "60+",
      label: "qualified sales meetings and $90K+ in new ARR in 4 months",
      context: "B2B security tech · led by our founder",
    },
    nurses: {
      client: "International Nurses",
      value: "~2x",
      label: "new clients a month after adding weekly webinars and email",
      context: "Professional services · led by our founder",
    },
    tecno: {
      client: "Tecnoprotejidos",
      value: "676",
      label: "WhatsApp leads from Google Ads at under $2 each",
      context: "Manufacturer · Energy Media, 2021",
    },
  },
  es: {
    revy: {
      client: "Revy Autos",
      value: "61%",
      label: "menos costo por usuario registrado en Meta mientras la inversión mensual creció 13x",
      context: "App para vender carros · liderado por nuestro fundador en Pvragon",
    },
    autobruder: {
      client: "Autobruder 4WD",
      value: "+132%",
      label: "pedidos en 3 meses, con la tasa de conversión más que duplicada",
      context: "Ecommerce · liderado por nuestro fundador",
    },
    rainforest: {
      client: "Rainforest Foundation US",
      value: "3.7x",
      label: "más clics desde Google tras rehacer el sitio web y su SEO",
      context: "ONG · liderado por nuestro fundador",
    },
    bi: {
      client: "Building Intelligence",
      value: "60+",
      label: "reuniones de venta calificadas y más de $90K en nuevo ARR en 4 meses",
      context: "Tecnología de seguridad B2B · liderado por nuestro fundador",
    },
    nurses: {
      client: "International Nurses",
      value: "~2x",
      label: "nuevos clientes al mes tras sumar webinars semanales y email",
      context: "Servicios profesionales · liderado por nuestro fundador",
    },
    tecno: {
      client: "Tecnoprotejidos",
      value: "676",
      label: "leads por WhatsApp desde Google Ads a menos de $2 cada uno",
      context: "Fabricante · Energy Media, 2021",
    },
  },
};

export function getProof(language: Language, ids: ProofId[]): ProofItem[] {
  return ids.map((id) => ({ ...proofText[language][id], ...PROOF_MEDIA[id] }));
}

// Example conversation for the connected system mock. Clearly labeled as an example on the page.
export interface MockCopy {
  label: string;
  channels: string[];
  thread: string;
  messages: { from: "customer" | "assistant"; text: string }[];
  booked: string;
  contact: string;
  rows: [string, string][];
}

export const agencyHomeCopy = {
  en: {
    eyebrow: "Full funnel marketing for small businesses",
    hero: ["Good, fast, affordable.", "Pick all three."],
    intro:
      "Ads, website, social media, email and follow up, built as one connected system and run by one team. We use AI to work faster, and we pass the savings on to you.",
    primaryCta: "Get a free audit",
    secondaryCta: "See prices",
    facts: ["Taking new clients", "Upfront prices", "Everything stays in your name"],
    toolsLabel: "Built on tools you already know",
    statsEyebrow: "The problem",
    statsTitle: "Customers want to buy. Most websites make it hard.",
    statsIntro: "We checked 11,813 US small business websites.",
    stats: [
      { value: 83, suffix: "%", label: "give visitors no way to book or chat. They have to call or fill a form and wait." },
      { value: 43, suffix: "%", label: "pay for Google or Meta ads to bring those visitors in." },
      { value: 33, suffix: "%", label: "show their reviews on the homepage. The rest hide their best sales tool." },
    ] as StatItem[],
    statsSource:
      "From our own scan of venues, law firms, home services, clinics, auto shops, real estate and other local businesses.",
    problems: [
      {
        title: "Slow replies lose the sale",
        body: "People contact two or three businesses at once. The first one to answer usually wins.",
      },
      {
        title: "Tools that don’t talk",
        body: "Website forms, Instagram DMs, WhatsApp and email land in different places, so leads slip through.",
      },
      {
        title: "Ads you can’t measure",
        body: "Without tracking you can’t tell which ad brought a paying customer, so money goes to guesses.",
      },
    ] as TitledText[],
    connectedEyebrow: "The fix",
    connectedTitle: "One connected system, from first click to paying customer.",
    connectedIntro:
      "Most businesses add a chatbot here and a form there, and none of it talks to each other. We set everything up as one system, so every message and every lead ends up in the same place.",
    connectedPoints: [
      {
        title: "Every channel, one inbox",
        body: "Website chat, WhatsApp, Instagram, Facebook and email answered from one place, with the same information everywhere.",
      },
      {
        title: "Instant answers, any hour",
        body: "An assistant replies in seconds, answers common questions and books the appointment. Your team steps in when a person is needed.",
      },
      {
        title: "One record per customer",
        body: "Every lead lands in one CRM with where it came from, so follow up never slips and you see which ads pay off.",
      },
    ] as TitledText[],
    mock: {
      label: "Example",
      channels: ["Website", "WhatsApp", "Instagram", "Facebook", "Email"],
      thread: "New message · Instagram",
      messages: [
        { from: "customer", text: "Hi! Do you have anything open this week?" },
        { from: "assistant", text: "Hi Maria! Thursday at 10 am or Friday at 3 pm. Want me to book one for you?" },
        { from: "customer", text: "Friday works 🙌" },
      ],
      booked: "Booked for Friday 3 pm · reminder set on WhatsApp",
      contact: "Maria G.",
      rows: [
        ["Came from", "Instagram ad"],
        ["Stage", "Appointment booked"],
        ["Next step", "Friday, 3:00 pm"],
        ["Follow up", "Automatic"],
      ],
    } as MockCopy,
    funnelEyebrow: "What we do",
    funnelTitle: "Everything that brings customers in.",
    funnel: [
      {
        stage: "Get found",
        title: "Ads and social media",
        body: "Google and Meta ads, short videos and posts, plus SEO so people find you on Google and in AI answers.",
        tags: ["Google Ads", "Meta Ads", "Social media", "SEO"],
      },
      {
        stage: "Win the visit",
        title: "Website and landing pages",
        body: "A fast, good looking website and a page for each offer, built so visitors call, book or buy.",
        tags: ["Website", "Landing pages", "Online store", "Online booking"],
      },
      {
        stage: "Follow up",
        title: "Chat, email and CRM",
        body: "Every lead answered in seconds on any channel, then reminders and emails until they buy.",
        tags: ["Chat assistant", "WhatsApp", "Email", "CRM"],
      },
      {
        stage: "Measure",
        title: "Clear numbers",
        body: "A short monthly report: what you spent, what it brought in, and what we change next.",
        tags: ["Tracking", "Monthly report", "Cost per customer"],
      },
    ] as FunnelStage[],
    pillarsEyebrow: "Why Energy Media",
    pillarsTitle: "Good, fast and affordable. Here’s how.",
    pillars: [
      {
        title: "Good.",
        body: "A senior team plans and approves every ad, page and message. Everything is built to work together, looks professional and is measured.",
      },
      {
        title: "Fast.",
        body: "Like most marketers today, we use AI to write, design and build. New pages, ads and changes take days, not weeks.",
      },
      {
        title: "Affordable.",
        body: "We’re open about using AI and pass the time we save on to you. Prices are on this page, and setup is half off with a monthly plan.",
      },
    ] as TitledText[],
    proofEyebrow: "Results",
    proofTitle: "Real businesses, real numbers.",
    proofNote:
      "Our cofounder Johan Alvarez led most of this work for clients and employers before it came under the agency. Tecnoprotejidos was Energy Media work in 2021.",
    caseStudy: "Case study",
    industriesEyebrow: "Industries",
    industriesTitle: "Made for your kind of business.",
    industriesLink: "See how it works for you",
    processEyebrow: "How it works",
    processTitle: "Three steps to more customers.",
    process: [
      {
        title: "Free audit",
        body: "We look at your website, ads and follow up, and show you where customers slip away. No cost, no commitment.",
      },
      {
        title: "We set it up",
        body: "Website, chat, CRM, email and tracking connected as one system, all in your name.",
      },
      {
        title: "We run it every month",
        body: "Ads, content and follow up, improved every month based on real numbers.",
      },
    ] as TitledText[],
    pricingEyebrow: "Pricing",
    pricingTitle: "Simple prices, on the page.",
    pricingIntro:
      "Start with one of these or build your own plan. Ad spend is paid by you, straight to Google or Meta.",
    plans: {
      starter: {
        name: "Starter",
        body: "Get found on Google, with tracking that shows what works.",
        items: ["Google Ads", "Tracking setup", "Monthly report"],
      },
      growth: {
        name: "Growth",
        body: "A new website, a connected CRM and ads on Google and Meta.",
        items: ["New website", "CRM and tracking", "Google and Meta Ads", "4 graphics a month"],
      },
      full: {
        name: "Full funnel",
        body: "Everything connected and run for you, content included.",
        items: [
          "Website, CRM, email and tracking",
          "SEO cleanup",
          "Google and Meta Ads",
          "Email marketing and social media",
          "1 video a week, 8 graphics a month",
        ],
      },
    } satisfies Record<ExamplePlanId, { name: string; body: string; items: string[] }>,
    planMonthly: "/mo",
    planSetup: "setup",
    planRecommended: "Recommended",
    planCta: "Customize this plan",
    planCustom: "Build your own plan",
    commissionNote:
      "Prefer to pay on results? Choose commission: half the monthly fee plus 10% of the new revenue we bring.",
    pricingTitleFull: "Price your plan.",
    pricingIntroFull:
      "Pick what you need. Setup is half price when you keep a monthly plan, and you choose how to pay: a monthly fee, or a smaller fee plus commission.",
    faqEyebrow: "Questions",
    faqTitle: "Good to know.",
    faq: [
      {
        q: "Do I need a big budget?",
        a: "No. The Starter plan is $1,000 a month plus your ad spend, and you add more only when it pays off.",
      },
      {
        q: "Is ad spend included?",
        a: "No. You pay Google, Meta and other platforms directly, on your own card. Our fee covers the work.",
      },
      {
        q: "Who owns the accounts?",
        a: "You do. Ad accounts, website, domain, CRM and data stay in your company’s name.",
      },
      {
        q: "Do you use AI?",
        a: "Yes, like most marketers today. We’re open about it: it lets us work faster and charge less. A person plans and approves everything that goes out.",
      },
      {
        q: "How does the commission plan work?",
        a: "You pay the setup at plan price and half the monthly fee. On top of that we earn 10% of the new revenue our tracking shows came from our work.",
      },
      {
        q: "How is the chat assistant priced?",
        a: "It depends on your channels and how many messages you get, so we include it in your quote after the free audit.",
      },
    ] as Faq[],
    ctaEyebrow: "Next step",
    ctaTitle: "Let’s see where you’re losing customers.",
    ctaBody:
      "Get a free audit of your website, ads and follow up. You leave with a plan and a price, whether you hire us or not.",
    ctaButton: "Get a free audit",
  },
  es: {
    eyebrow: "Marketing completo para pequeñas empresas",
    hero: ["Bueno, bonito", "y barato."],
    intro:
      "Pauta, sitio web, redes, email y seguimiento, construidos como un solo sistema conectado y operados por un solo equipo. Usamos IA para trabajar más rápido y te pasamos el ahorro.",
    primaryCta: "Pide tu auditoría gratis",
    secondaryCta: "Ver precios",
    facts: ["Recibiendo nuevos clientes", "Precios a la vista", "Todo queda a tu nombre"],
    toolsLabel: "Con herramientas que ya conoces",
    statsEyebrow: "El problema",
    statsTitle: "Los clientes quieren comprar. La mayoría de sitios se lo pone difícil.",
    statsIntro: "Revisamos 11,813 sitios web de pequeñas empresas en EE. UU.",
    stats: [
      { value: 83, suffix: "%", label: "no dejan agendar ni chatear. Hay que llamar o llenar un formulario y esperar." },
      { value: 43, suffix: "%", label: "pagan pauta en Google o Meta para traer esas visitas." },
      { value: 33, suffix: "%", label: "muestran sus reseñas en la página principal. El resto esconde su mejor argumento de venta." },
    ] as StatItem[],
    statsSource:
      "De nuestro propio análisis de venues, firmas de abogados, servicios para el hogar, clínicas, talleres, inmobiliarias y otros negocios locales.",
    problems: [
      {
        title: "Responder tarde pierde la venta",
        body: "La gente escribe a dos o tres negocios a la vez. El primero que responde casi siempre gana.",
      },
      {
        title: "Herramientas que no se hablan",
        body: "Formularios, mensajes de Instagram, WhatsApp y email llegan a lugares distintos, y los leads se pierden.",
      },
      {
        title: "Pauta que no se puede medir",
        body: "Sin medición no sabes qué anuncio trajo un cliente que pagó, y el dinero se va en suposiciones.",
      },
    ] as TitledText[],
    connectedEyebrow: "La solución",
    connectedTitle: "Un solo sistema conectado, del primer clic al cliente que paga.",
    connectedIntro:
      "La mayoría de negocios pone un chatbot aquí y un formulario allá, y nada se conecta. Nosotros lo montamos todo como un solo sistema, para que cada mensaje y cada lead terminen en el mismo lugar.",
    connectedPoints: [
      {
        title: "Todos los canales, una bandeja",
        body: "Chat del sitio, WhatsApp, Instagram, Facebook y email atendidos desde un solo lugar, con la misma información en todos.",
      },
      {
        title: "Respuestas al instante, a cualquier hora",
        body: "Un asistente responde en segundos, resuelve preguntas comunes y agenda la cita. Tu equipo entra cuando hace falta una persona.",
      },
      {
        title: "Un solo registro por cliente",
        body: "Cada lead entra a un CRM con su origen, así el seguimiento no falla y ves qué anuncios dan resultado.",
      },
    ] as TitledText[],
    mock: {
      label: "Ejemplo",
      channels: ["Sitio web", "WhatsApp", "Instagram", "Facebook", "Email"],
      thread: "Mensaje nuevo · Instagram",
      messages: [
        { from: "customer", text: "¡Hola! ¿Tienen cita disponible esta semana?" },
        { from: "assistant", text: "¡Hola María! Jueves a las 10 am o viernes a las 3 pm. ¿Te agendo una?" },
        { from: "customer", text: "El viernes me sirve 🙌" },
      ],
      booked: "Agendada para el viernes 3 pm · recordatorio por WhatsApp",
      contact: "María G.",
      rows: [
        ["Llegó por", "Anuncio en Instagram"],
        ["Etapa", "Cita agendada"],
        ["Siguiente paso", "Viernes, 3:00 pm"],
        ["Seguimiento", "Automático"],
      ],
    } as MockCopy,
    funnelEyebrow: "Lo que hacemos",
    funnelTitle: "Todo lo que te trae clientes.",
    funnel: [
      {
        stage: "Que te encuentren",
        title: "Pauta y redes sociales",
        body: "Anuncios en Google y Meta, videos cortos y publicaciones, más SEO para aparecer en Google y en respuestas de IA.",
        tags: ["Google Ads", "Meta Ads", "Redes sociales", "SEO"],
      },
      {
        stage: "Ganar la visita",
        title: "Sitio web y landing pages",
        body: "Un sitio rápido y bonito, con una página por oferta, hecho para que te llamen, agenden o compren.",
        tags: ["Sitio web", "Landing pages", "Tienda online", "Agenda en línea"],
      },
      {
        stage: "Hacer seguimiento",
        title: "Chat, email y CRM",
        body: "Cada lead respondido en segundos en cualquier canal, y luego recordatorios y emails hasta que compra.",
        tags: ["Asistente de chat", "WhatsApp", "Email", "CRM"],
      },
      {
        stage: "Medir",
        title: "Números claros",
        body: "Un reporte mensual corto: cuánto invertiste, qué trajo y qué cambiamos después.",
        tags: ["Medición", "Reporte mensual", "Costo por cliente"],
      },
    ] as FunnelStage[],
    pillarsEyebrow: "Por qué Energy Media",
    pillarsTitle: "Bueno, bonito y barato. Así lo hacemos.",
    pillars: [
      {
        title: "Bueno.",
        body: "Un equipo senior planea y aprueba cada anuncio, página y mensaje. Todo está hecho para funcionar junto, y cada resultado se mide.",
      },
      {
        title: "Bonito.",
        body: "Diseño moderno para tu sitio, tus anuncios y tus redes, para que tu negocio se vea tan bien como trabaja.",
      },
      {
        title: "Barato.",
        body: "Como la mayoría de agencias hoy, usamos IA para escribir, diseñar y construir más rápido. Somos transparentes y te pasamos el ahorro: precios a la vista y configuración a mitad de precio con un plan mensual.",
      },
    ] as TitledText[],
    proofEyebrow: "Resultados",
    proofTitle: "Negocios reales, números reales.",
    proofNote:
      "Nuestro cofundador Johan Alvarez lideró la mayor parte de este trabajo para clientes y empleadores antes de que llegara a la agencia. Tecnoprotejidos fue trabajo de Energy Media en 2021.",
    caseStudy: "Caso de estudio",
    industriesEyebrow: "Industrias",
    industriesTitle: "Pensado para negocios como el tuyo.",
    industriesLink: "Mira cómo funciona para ti",
    processEyebrow: "Cómo funciona",
    processTitle: "Tres pasos para tener más clientes.",
    process: [
      {
        title: "Auditoría gratis",
        body: "Revisamos tu sitio, tu pauta y tu seguimiento, y te mostramos dónde se te van los clientes. Sin costo y sin compromiso.",
      },
      {
        title: "Lo montamos",
        body: "Sitio web, chat, CRM, email y medición conectados como un solo sistema, todo a tu nombre.",
      },
      {
        title: "Lo operamos cada mes",
        body: "Pauta, contenido y seguimiento, mejorados cada mes con números reales.",
      },
    ] as TitledText[],
    pricingEyebrow: "Precios",
    pricingTitle: "Precios simples y a la vista.",
    pricingIntro:
      "Empieza con uno de estos o arma tu propio plan. La inversión en pauta la pagas tú, directo a Google o Meta.",
    plans: {
      starter: {
        name: "Inicial",
        body: "Aparece en Google, con medición que muestra qué funciona.",
        items: ["Google Ads", "Configuración de medición", "Reporte mensual"],
      },
      growth: {
        name: "Crecimiento",
        body: "Sitio web nuevo, CRM conectado y pauta en Google y Meta.",
        items: ["Sitio web nuevo", "CRM y medición", "Google y Meta Ads", "4 piezas gráficas al mes"],
      },
      full: {
        name: "Embudo completo",
        body: "Todo conectado y operado por nosotros, con contenido incluido.",
        items: [
          "Sitio, CRM, email y medición",
          "Limpieza SEO",
          "Google y Meta Ads",
          "Email marketing y redes sociales",
          "1 video a la semana, 8 piezas al mes",
        ],
      },
    } satisfies Record<ExamplePlanId, { name: string; body: string; items: string[] }>,
    planMonthly: "/mes",
    planSetup: "configuración",
    planRecommended: "Recomendado",
    planCta: "Ajustar este plan",
    planCustom: "Arma tu propio plan",
    commissionNote:
      "¿Prefieres pagar por resultados? Elige comisión: la mitad de la tarifa mensual más el 10% de los ingresos nuevos que traemos.",
    pricingTitleFull: "Calcula tu plan.",
    pricingIntroFull:
      "Elige lo que necesitas. La configuración cuesta la mitad si mantienes un plan mensual, y tú eliges cómo pagar: una tarifa mensual, o una tarifa menor más comisión.",
    faqEyebrow: "Preguntas",
    faqTitle: "Bueno saberlo.",
    faq: [
      {
        q: "¿Necesito un presupuesto grande?",
        a: "No. El plan Inicial cuesta $1,000 al mes más tu inversión en pauta, y agregas más solo cuando da resultado.",
      },
      {
        q: "¿La inversión en pauta está incluida?",
        a: "No. Le pagas a Google, Meta y las demás plataformas directamente, con tu propia tarjeta. Nuestra tarifa cubre el trabajo.",
      },
      {
        q: "¿De quién son las cuentas?",
        a: "Tuyas. Cuentas publicitarias, sitio web, dominio, CRM y datos quedan a nombre de tu empresa.",
      },
      {
        q: "¿Usan IA?",
        a: "Sí, como la mayoría de agencias hoy. Somos transparentes: nos deja trabajar más rápido y cobrar menos. Una persona planea y aprueba todo lo que sale.",
      },
      {
        q: "¿Cómo funciona el plan por comisión?",
        a: "Pagas la configuración a precio de plan y la mitad de la tarifa mensual. Además ganamos el 10% de los ingresos nuevos que la medición muestra que vinieron de nuestro trabajo.",
      },
      {
        q: "¿Cuánto cuesta el asistente de chat?",
        a: "Depende de tus canales y de cuántos mensajes recibes, así que lo incluimos en tu cotización después de la auditoría gratis.",
      },
    ] as Faq[],
    ctaEyebrow: "Siguiente paso",
    ctaTitle: "Veamos dónde estás perdiendo clientes.",
    ctaBody:
      "Pide una auditoría gratis de tu sitio, tu pauta y tu seguimiento. Sales con un plan y un precio, nos contrates o no.",
    ctaButton: "Pide tu auditoría gratis",
  },
};

export type AgencyHomeCopy = (typeof agencyHomeCopy)["en"];

interface TitledTextShort {
  label: string;
  body: string;
}

export const calculatorCopy = {
  en: {
    paymentTitle: "How do you want to pay?",
    payment: {
      monthly: { label: "Monthly fee", body: "Pay for what we operate each month." },
      commission: {
        label: "Commission",
        body: "Half the monthly fee, plus 10% of the new revenue we bring.",
      },
    },
    setupTitle: "Set up the system",
    setupNote: "One time. Half price with a monthly plan.",
    setup: {
      website: { label: "New website or online store", body: "Design, build and copy, ready for ads." },
      email: { label: "Email sending system", body: "Your domain set up so emails reach the inbox, plus welcome emails." },
      crm: { label: "CRM setup", body: "Pipeline, forms, lead routing and follow up." },
      tracking: { label: "Tracking", body: "See which ads bring customers, in one dashboard." },
      seo: { label: "SEO cleanup", body: "Fix technical issues so Google and AI answers find you." },
    } satisfies Record<SetupId, TitledTextShort>,
    monthlyTitle: "What we run every month",
    monthlyNote: "Ad spend not included.",
    channels: {
      google: { label: "Google Ads", body: "Search, Maps and YouTube campaigns." },
      meta: { label: "Meta Ads", body: "Facebook and Instagram campaigns." },
      seo: { label: "SEO", body: "Content and fixes to rank on Google and get recommended." },
      email: { label: "Email marketing", body: "Campaigns and automated sequences." },
      social: { label: "Social media management", body: "Planning, posting and replies." },
    } satisfies Record<ChannelId, TitledTextShort>,
    campaigns: "Campaigns per ad channel",
    campaignsHint: "3 included. Each extra campaign is $200 a month per channel.",
    contentTitle: "Content we create",
    videos: "Short videos per week",
    videosHint: "$150 per video.",
    graphics: "Graphic pieces per month",
    graphicsHint: "$50 per piece.",
    decrease: "Fewer",
    increase: "More",
    summaryTitle: "Your estimate",
    setupLine: "Setup, one time",
    monthlyLine: "Every month",
    commissionLine: "Plus commission",
    commissionValue: "10% of new revenue",
    perMonth: "/mo",
    savings: "You save {amount} on setup with a monthly plan.",
    noPlanCommission: "Commission needs at least one monthly service.",
    nothing: "Pick at least one item to see an estimate.",
    adSpend: "Ad spend is paid by you, directly to the platforms.",
    estimate: "From prices. We confirm the final quote after the free audit.",
    cta: "Get this plan",
    messageIntro: "Hi Energy Media, I priced this plan on your site:",
    messageSetup: "Setup",
    messageMonthly: "Monthly",
    messageContent: "Content",
    messagePayment: "Payment",
    messageEstimate: "Estimate",
    none: "none",
  },
  es: {
    paymentTitle: "¿Cómo quieres pagar?",
    payment: {
      monthly: { label: "Tarifa mensual", body: "Pagas por lo que operamos cada mes." },
      commission: {
        label: "Comisión",
        body: "La mitad de la tarifa mensual, más el 10% de los ingresos nuevos que traemos.",
      },
    },
    setupTitle: "Montamos el sistema",
    setupNote: "Pago único. A mitad de precio con un plan mensual.",
    setup: {
      website: { label: "Sitio web o tienda online nueva", body: "Diseño, desarrollo y textos, listo para pauta." },
      email: { label: "Sistema de envío de email", body: "Tu dominio listo para que los emails lleguen a la bandeja, más emails de bienvenida." },
      crm: { label: "Configuración del CRM", body: "Pipeline, formularios, asignación de leads y seguimiento." },
      tracking: { label: "Medición", body: "Ve qué anuncios traen clientes, en un solo tablero." },
      seo: { label: "Limpieza SEO", body: "Arreglos técnicos para que Google y las respuestas de IA te encuentren." },
    } satisfies Record<SetupId, TitledTextShort>,
    monthlyTitle: "Lo que operamos cada mes",
    monthlyNote: "No incluye la inversión en pauta.",
    channels: {
      google: { label: "Google Ads", body: "Campañas en Búsqueda, Maps y YouTube." },
      meta: { label: "Meta Ads", body: "Campañas en Facebook e Instagram." },
      seo: { label: "SEO", body: "Contenido y ajustes para posicionar en Google y ser recomendado." },
      email: { label: "Email marketing", body: "Campañas y secuencias automáticas." },
      social: { label: "Gestión de redes sociales", body: "Planeación, publicación y respuestas." },
    } satisfies Record<ChannelId, TitledTextShort>,
    campaigns: "Campañas por canal de pauta",
    campaignsHint: "3 incluidas. Cada campaña extra cuesta $200 al mes por canal.",
    contentTitle: "Contenido que creamos",
    videos: "Videos cortos por semana",
    videosHint: "$150 por video.",
    graphics: "Piezas gráficas por mes",
    graphicsHint: "$50 por pieza.",
    decrease: "Menos",
    increase: "Más",
    summaryTitle: "Tu estimado",
    setupLine: "Configuración, pago único",
    monthlyLine: "Cada mes",
    commissionLine: "Más comisión",
    commissionValue: "10% de ingresos nuevos",
    perMonth: "/mes",
    savings: "Ahorras {amount} en la configuración con un plan mensual.",
    noPlanCommission: "La comisión necesita al menos un servicio mensual.",
    nothing: "Elige al menos un servicio para ver un estimado.",
    adSpend: "La inversión en pauta la pagas tú, directo a las plataformas.",
    estimate: "Precios desde. Confirmamos la cotización final después de la auditoría gratis.",
    cta: "Quiero este plan",
    messageIntro: "Hola Energy Media, calculé este plan en su sitio:",
    messageSetup: "Configuración",
    messageMonthly: "Mensual",
    messageContent: "Contenido",
    messagePayment: "Pago",
    messageEstimate: "Estimado",
    none: "ninguno",
  },
};

export type CalculatorCopy = (typeof calculatorCopy)["en"];
