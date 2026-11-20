import type { Language } from "@/lib/i18n";
import type { ChannelId, SetupId } from "@/lib/agency/pricing";

// Copy for the Energy Media agency site (energymedia tenant).
// House rule: no dashes in any visible text.

export type ProofId = "revy" | "autobruder" | "rainforest" | "bi" | "nurses" | "tecno";

export interface ProofItem {
  client: string;
  value: string;
  label: string;
  context: string;
  href?: string;
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

const PROOF_LINKS: Partial<Record<ProofId, string>> = {
  revy: "/projects/50",
  autobruder: "/projects/25",
  rainforest: "/projects/29",
  nurses: "/projects/43",
  tecno: "/projects/41",
};

const proofText: Record<Language, Record<ProofId, Omit<ProofItem, "href">>> = {
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
  return ids.map((id) => ({ ...proofText[language][id], href: PROOF_LINKS[id] }));
}

export const agencyHomeCopy = {
  en: {
    eyebrow: "360 AI powered marketing",
    hero: ["Your whole online", "sales effort,", "updated to 2026."],
    intro:
      "Ads, social media, email, websites, CRM and tracking, plus AI assistants that answer your customers on your site, WhatsApp, email and social DMs, day and night. One team builds it, runs it and answers for one number: new customers.",
    primaryCta: "Book a call",
    secondaryCta: "Price your plan",
    facts: ["Taking new clients", "Medellín · working on US hours", "English and Spanish"],
    scroll: "Scroll to explore",
    problemEyebrow: "The problem",
    problemTitle: "Four vendors, and nobody owns the result.",
    problems: [
      {
        title: "Ads point to pages that do not convert",
        body: "One team buys the traffic and another built the site, so every click costs more than it should.",
      },
      {
        title: "Leads go cold in the inbox",
        body: "Forms land in an email nobody watches. People hire whoever answers first.",
      },
      {
        title: "Nobody knows what works",
        body: "Without clean tracking you cannot tell which campaign brought a paying customer, so budget goes to guesses.",
      },
      {
        title: "Every fix is a new invoice",
        body: "Each vendor owns one piece. Changing anything means meetings, tickets and waiting.",
      },
    ] as TitledText[],
    funnelEyebrow: "What we do",
    funnelTitle: "Every stage of the funnel, under one roof.",
    funnel: [
      {
        stage: "Attract",
        title: "Paid media and social media",
        body: "Google and Meta campaigns, short videos and graphics, plus SEO and AEO so you show up when people search Google or ask ChatGPT.",
        tags: ["Google Ads", "Meta Ads", "Social media", "SEO and AEO"],
      },
      {
        stage: "Convert",
        title: "Websites and landing pages",
        body: "Fast websites, online stores and a landing page for each campaign, written to turn visits into calls, bookings and sales.",
        tags: ["Websites", "Landing pages", "Online stores", "Booking and forms"],
      },
      {
        stage: "Follow up",
        title: "Email marketing and CRM",
        body: "Every lead lands in a CRM and gets an instant answer from an AI assistant, then a follow up sequence, so fewer of them go cold.",
        tags: ["AI assistants", "CRM setup", "Email campaigns", "Automations"],
      },
      {
        stage: "Measure",
        title: "Tracking and reporting",
        body: "Pixels, GA4 and conversion APIs connected to your CRM, so we see which ads bring customers and move budget there.",
        tags: ["Pixels and GA4", "Conversion APIs", "Dashboards", "Monthly report"],
      },
    ] as FunnelStage[],
    aiEyebrow: "The AI layer",
    aiTitle: "AI across everything, not bolted on.",
    aiIntro:
      "AI runs through every stage: it answers your customers wherever they write, and it lets us build and test far more than a traditional agency.",
    ai: [
      {
        title: "AI chat on your website",
        body: "Answers questions about your services and prices, qualifies the visitor and books the call, at any hour.",
      },
      {
        title: "AI on WhatsApp",
        body: "Replies to new inquiries in seconds, sends the details people ask for and offers a time to talk.",
      },
      {
        title: "AI in your inbox",
        body: "Answers lead emails right away and keeps following up until they book or say no.",
      },
      {
        title: "AI in social DMs",
        body: "Replies to Instagram and Facebook messages so interest from your content turns into conversations.",
      },
      {
        title: "More ads, tested faster",
        body: "We produce many ad versions, videos and graphics each month and keep only the winners.",
      },
      {
        title: "Pages in days, not months",
        body: "AI writes most of the code, so a landing page for a new offer takes days.",
      },
      {
        title: "Follow up in minutes",
        body: "Automations route every lead, remind people before their call and bring back the ones who went quiet.",
      },
      {
        title: "Reports in plain words",
        body: "Every month you get a short report: what we spent, what it brought, and what we change next.",
      },
    ] as TitledText[],
    aiNote:
      "Every assistant is trained on your business, hands the conversation to your team when a person is needed, and logs each chat in your CRM. A person sets the strategy and approves every ad, page and email before it goes live.",
    processEyebrow: "How it works",
    processTitle: "From first call to a running funnel.",
    process: [
      {
        title: "Free audit call",
        body: "We look at your ads, website, tracking and CRM, and show you where customers are slipping away.",
      },
      {
        title: "Set up the system",
        body: "We build or fix the pieces you need: website, CRM, email, tracking and SEO, all in your own accounts.",
      },
      {
        title: "Run and improve every month",
        body: "We run the campaigns, make the content, follow up the leads and change what is not working.",
      },
    ] as TitledText[],
    proofEyebrow: "Proof",
    proofTitle: "Real results, with the numbers.",
    proofNote:
      "Our cofounder Johan Alvarez led most of this work for clients and employers before it came under the agency. Tecnoprotejidos was Energy Media work in 2021. Each result links to its case study.",
    caseStudy: "Case study",
    industriesEyebrow: "Industries",
    industriesTitle: "Built for businesses like yours.",
    industriesLink: "See the plan",
    pricingEyebrow: "Pricing",
    pricingTitle: "Price your plan.",
    pricingIntro:
      "Pick what you need. Setup is half price when you keep a monthly plan, and you choose how to pay: a monthly fee, or a smaller fee plus commission.",
    faqEyebrow: "Questions",
    faqTitle: "Good to know.",
    faq: [
      {
        q: "Is ad spend included?",
        a: "No. You pay Google, Meta and other platforms directly, on your own card. Our fee covers the work.",
      },
      {
        q: "Who owns the accounts?",
        a: "You do. Ad accounts, website, domain, CRM and data stay in your company’s name.",
      },
      {
        q: "How does the commission plan work?",
        a: "You pay the setup at plan price and half the monthly fee. On top of that we earn 10% of the new revenue our tracking shows came from our work. It needs tracking and a CRM in place, so those are part of the setup.",
      },
      {
        q: "What is AEO?",
        a: "Answer engine optimization: getting your business recommended when people ask ChatGPT, Gemini or Google’s AI answers, not just listed in search results.",
      },
      {
        q: "How are the AI assistants priced?",
        a: "They depend on the channels (website, WhatsApp, email, social DMs) and how many conversations you get, so we quote them on the call.",
      },
    ] as Faq[],
    ctaEyebrow: "Next step",
    ctaTitle: "Let’s find the leaks in your funnel.",
    ctaBody:
      "Book a call. We review your ads, site and follow up, and you leave with a plan and a price, whether you hire us or not.",
    ctaButton: "Book a call",
  },
  es: {
    eyebrow: "Marketing 360 con IA",
    hero: ["Todas tus ventas", "en línea,", "al nivel de 2026."],
    intro:
      "Pauta, redes sociales, email, sitios web, CRM y medición, más asistentes de IA que atienden a tus clientes en tu sitio, WhatsApp, email y mensajes de redes, de día y de noche. Un solo equipo lo construye, lo opera y responde por un número: clientes nuevos.",
    primaryCta: "Agenda una llamada",
    secondaryCta: "Calcula tu plan",
    facts: ["Recibiendo nuevos clientes", "Medellín · horario de EE. UU.", "Español e inglés"],
    scroll: "Sigue explorando",
    problemEyebrow: "El problema",
    problemTitle: "Cuatro proveedores, y nadie responde por el resultado.",
    problems: [
      {
        title: "La pauta llega a páginas que no convierten",
        body: "Un equipo compra el tráfico y otro hizo el sitio, así que cada clic cuesta más de lo que debería.",
      },
      {
        title: "Los leads se enfrían en la bandeja",
        body: "Los formularios llegan a un correo que nadie revisa. La gente contrata a quien responde primero.",
      },
      {
        title: "Nadie sabe qué funciona",
        body: "Sin una medición limpia no sabes qué campaña trajo un cliente que pagó, y el presupuesto se va en suposiciones.",
      },
      {
        title: "Cada cambio es una factura nueva",
        body: "Cada proveedor tiene una pieza. Cambiar algo significa reuniones, tickets y esperar.",
      },
    ] as TitledText[],
    funnelEyebrow: "Lo que hacemos",
    funnelTitle: "Cada etapa del embudo, en un solo equipo.",
    funnel: [
      {
        stage: "Atraer",
        title: "Pauta digital y redes sociales",
        body: "Campañas en Google y Meta, videos cortos y piezas gráficas, más SEO y AEO para aparecer cuando buscan en Google o le preguntan a ChatGPT.",
        tags: ["Google Ads", "Meta Ads", "Redes sociales", "SEO y AEO"],
      },
      {
        stage: "Convertir",
        title: "Sitios web y landing pages",
        body: "Sitios rápidos, tiendas online y una landing page por campaña, escritas para convertir visitas en llamadas, reservas y ventas.",
        tags: ["Sitios web", "Landing pages", "Tiendas online", "Reservas y formularios"],
      },
      {
        stage: "Hacer seguimiento",
        title: "Email marketing y CRM",
        body: "Cada lead entra a un CRM y recibe respuesta inmediata de un asistente de IA, y luego una secuencia de seguimiento, para que se enfríen menos.",
        tags: ["Asistentes de IA", "Configuración CRM", "Campañas de email", "Automatizaciones"],
      },
      {
        stage: "Medir",
        title: "Medición y reportes",
        body: "Píxeles, GA4 y APIs de conversión conectados a tu CRM, para ver qué anuncios traen clientes y mover el presupuesto allí.",
        tags: ["Píxeles y GA4", "APIs de conversión", "Tableros", "Reporte mensual"],
      },
    ] as FunnelStage[],
    aiEyebrow: "La capa de IA",
    aiTitle: "IA en todo, no como un parche.",
    aiIntro:
      "La IA atraviesa cada etapa: atiende a tus clientes donde sea que escriban y nos deja construir y probar mucho más que una agencia tradicional.",
    ai: [
      {
        title: "Chat con IA en tu sitio web",
        body: "Responde preguntas sobre tus servicios y precios, califica al visitante y agenda la llamada, a cualquier hora.",
      },
      {
        title: "IA en WhatsApp",
        body: "Responde las consultas nuevas en segundos, envía la información que piden y ofrece un horario para hablar.",
      },
      {
        title: "IA en tu correo",
        body: "Responde los emails de leads al instante y sigue haciendo seguimiento hasta que agendan o dicen que no.",
      },
      {
        title: "IA en mensajes de redes",
        body: "Responde mensajes de Instagram y Facebook para que el interés que genera tu contenido se vuelva conversación.",
      },
      {
        title: "Más anuncios, probados más rápido",
        body: "Producimos muchas versiones de anuncios, videos y piezas cada mes y nos quedamos solo con las ganadoras.",
      },
      {
        title: "Páginas en días, no en meses",
        body: "La IA escribe la mayor parte del código, así una landing page para una oferta nueva toma días.",
      },
      {
        title: "Seguimiento en minutos",
        body: "Las automatizaciones asignan cada lead, recuerdan la llamada y recuperan a quienes dejaron de responder.",
      },
      {
        title: "Reportes en palabras simples",
        body: "Cada mes recibes un reporte corto: cuánto invertimos, qué trajo y qué cambiamos después.",
      },
    ] as TitledText[],
    aiNote:
      "Cada asistente se entrena con la información de tu negocio, pasa la conversación a tu equipo cuando hace falta una persona y guarda cada chat en tu CRM. Una persona define la estrategia y aprueba cada anuncio, página y email antes de publicarlo.",
    processEyebrow: "Cómo funciona",
    processTitle: "De la primera llamada a un embudo funcionando.",
    process: [
      {
        title: "Llamada de auditoría gratis",
        body: "Revisamos tu pauta, sitio web, medición y CRM, y te mostramos dónde se te están yendo los clientes.",
      },
      {
        title: "Montamos el sistema",
        body: "Construimos o arreglamos lo que necesitas: sitio web, CRM, email, medición y SEO, todo en tus propias cuentas.",
      },
      {
        title: "Operamos y mejoramos cada mes",
        body: "Corremos las campañas, hacemos el contenido, damos seguimiento a los leads y cambiamos lo que no funciona.",
      },
    ] as TitledText[],
    proofEyebrow: "Resultados",
    proofTitle: "Resultados reales, con los números.",
    proofNote:
      "Nuestro cofundador Johan Alvarez lideró la mayor parte de este trabajo para clientes y empleadores antes de que llegara a la agencia. Tecnoprotejidos fue trabajo de Energy Media en 2021. Cada resultado enlaza a su caso de estudio.",
    caseStudy: "Caso de estudio",
    industriesEyebrow: "Industrias",
    industriesTitle: "Pensado para negocios como el tuyo.",
    industriesLink: "Ver el plan",
    pricingEyebrow: "Precios",
    pricingTitle: "Calcula tu plan.",
    pricingIntro:
      "Elige lo que necesitas. La configuración inicial cuesta la mitad si mantienes un plan mensual, y tú eliges cómo pagar: una tarifa mensual, o una tarifa menor más comisión.",
    faqEyebrow: "Preguntas",
    faqTitle: "Bueno saberlo.",
    faq: [
      {
        q: "¿La inversión en pauta está incluida?",
        a: "No. Le pagas a Google, Meta y las demás plataformas directamente, con tu propia tarjeta. Nuestra tarifa cubre el trabajo.",
      },
      {
        q: "¿De quién son las cuentas?",
        a: "Tuyas. Cuentas publicitarias, sitio web, dominio, CRM y datos quedan a nombre de tu empresa.",
      },
      {
        q: "¿Cómo funciona el plan por comisión?",
        a: "Pagas la configuración a precio de plan y la mitad de la tarifa mensual. Además ganamos el 10% de los ingresos nuevos que la medición muestra que vinieron de nuestro trabajo. Necesita medición y CRM, por eso hacen parte de la configuración.",
      },
      {
        q: "¿Qué es AEO?",
        a: "Optimización para motores de respuesta: que ChatGPT, Gemini o las respuestas con IA de Google recomienden tu negocio, no solo que aparezca en los resultados.",
      },
      {
        q: "¿Cuánto cuestan los asistentes de IA?",
        a: "Depende de los canales (sitio web, WhatsApp, email, mensajes de redes) y de cuántas conversaciones recibes, así que los cotizamos en la llamada.",
      },
    ] as Faq[],
    ctaEyebrow: "Siguiente paso",
    ctaTitle: "Encontremos las fugas de tu embudo.",
    ctaBody:
      "Agenda una llamada. Revisamos tu pauta, tu sitio y tu seguimiento, y sales con un plan y un precio, nos contrates o no.",
    ctaButton: "Agenda una llamada",
  },
};

export type AgencyHomeCopy = (typeof agencyHomeCopy)["en"];

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
      email: { label: "Email sending system", body: "Domain authentication, templates and welcome flows." },
      crm: { label: "CRM setup", body: "Pipeline, forms, lead routing and follow up." },
      tracking: { label: "Tracking", body: "Pixels, GA4, conversion APIs and a dashboard." },
      seo: { label: "SEO cleanup and AEO setup", body: "Fix technical issues and get found in AI answers." },
    } satisfies Record<SetupId, TitledTextShort>,
    monthlyTitle: "What we run every month",
    monthlyNote: "Ad spend not included.",
    channels: {
      google: { label: "Google Ads", body: "Search, Maps and YouTube campaigns." },
      meta: { label: "Meta Ads", body: "Facebook and Instagram campaigns." },
      seo: { label: "SEO and AEO", body: "Content and fixes to rank and get recommended." },
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
    estimate: "From prices. We confirm the final quote after the audit call.",
    cta: "Book a call about this plan",
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
      email: { label: "Sistema de envío de email", body: "Autenticación del dominio, plantillas y flujos de bienvenida." },
      crm: { label: "Configuración del CRM", body: "Pipeline, formularios, asignación de leads y seguimiento." },
      tracking: { label: "Medición", body: "Píxeles, GA4, APIs de conversión y un tablero." },
      seo: { label: "Limpieza SEO y configuración AEO", body: "Arreglos técnicos y presencia en respuestas de IA." },
    } satisfies Record<SetupId, TitledTextShort>,
    monthlyTitle: "Lo que operamos cada mes",
    monthlyNote: "No incluye la inversión en pauta.",
    channels: {
      google: { label: "Google Ads", body: "Campañas en Búsqueda, Maps y YouTube." },
      meta: { label: "Meta Ads", body: "Campañas en Facebook e Instagram." },
      seo: { label: "SEO y AEO", body: "Contenido y ajustes para posicionar y ser recomendado." },
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
    estimate: "Precios desde. Confirmamos la cotización final después de la llamada.",
    cta: "Agenda una llamada sobre este plan",
    messageIntro: "Hola Energy Media, calculé este plan en su sitio:",
    messageSetup: "Configuración",
    messageMonthly: "Mensual",
    messageContent: "Contenido",
    messagePayment: "Pago",
    messageEstimate: "Estimado",
    none: "ninguno",
  },
};

interface TitledTextShort {
  label: string;
  body: string;
}

export type CalculatorCopy = (typeof calculatorCopy)["en"];
