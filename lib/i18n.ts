export type Language = "en" | "es"

export const translations = {
  en: {
    // Navigation
    nav: {
      home: "HOME",
      projects: "PROJECTS",
      articles: "ARTICLES",
      about: "ABOUT ME",
      contact: "CONTACT",
    },
    projects: {
      title: "Projects",
      subtitle: "Explore my portfolio of innovative digital solutions and successful campaigns",
      search: "Search projects...",
      noResults: "No projects found matching your search.",
      viewDetails: "View Details",
      featured: "Featured",
      loading: "Loading projects...",
      backToProjects: "Back to Projects",
      client: "Client",
      gallery: "Project Gallery",
      autoScroll: "Auto-scrolling enabled",
      resumeAutoScroll: "Resume auto-scroll",
      technologies: "Technologies & Skills",
      projectQuote: "Project analysis complete. Implementation successful.",
      viewLive: "View Live Project",
      notFound: "Project Not Found",
      pressEsc: "Press ESC or click outside to close",
    },
    about: {
      title: "About Me",
      subtitle: "Senior Marketing & Innovation Strategist with 8+ years of experience transforming digital landscapes",
      currentRole: "Marketing Automation Specialist",
      location: "Medellín, Colombia",
      experience: "8+ Years Experience",
      bio: "Passionate about leveraging cutting-edge technologies and data-driven strategies to transform marketing landscapes. Specialized in automation, full-funnel optimization, and innovative digital solutions that drive measurable business growth.",
      getInTouch: "Get In Touch",
      linkedinProfile: "LinkedIn Profile",
      professionalExperience: "Professional Experience",
      education: "Education",
      technicalSkills: "Technical Skills & Expertise",
      letsWorkTogether: "Let's Work Together",
      ctaDescription:
        "Ready to transform your marketing strategy with cutting-edge automation and data-driven insights? Let's discuss how we can drive your business forward.",
      startConversation: "Start a Conversation",
      viewMyWork: "View My Work",
      fullTime: "Full-time",
      freelance: "Freelance",
      // Work experiences
      work: {
        pvragon: {
          role: "Marketing Automation Specialist",
          company: "Pvragon",
          period: "June 2025 - Current",
          location: "Medellín, Colombia (Remote)",
          achievements: [
            "Leading marketing automation initiatives for international clients",
            "Implementing advanced funnel strategies and conversion optimization",
            "Developing data-driven marketing solutions and analytics frameworks",
          ],
        },
        independent: {
          role: "INDEPENDENT / FREELANCE",
          company: "Marketing & Innovation Strategist",
          period: "November 2022 - June 2025",
          location: "Medellín, Colombia",
          description:
            "Specialized in marketing automation, full-funnel strategies, and digital transformation for diverse clients across multiple industries.",
          achievements: [
            "Delivered 50+ successful marketing automation projects",
            "Increased client conversion rates by an average of 35%",
            "Built comprehensive marketing funnels generating $2M+ in revenue",
            "Developed custom analytics dashboards and reporting systems",
          ],
        },
        grandpaDevs: {
          role: "GRANDPA DEVS",
          company: "Marketing Automation Specialist",
          period: "September 2021 - November 2022",
          location: "Medellín, Colombia",
          achievements: [
            "Implemented marketing automation workflows for 20+ clients",
            "Reduced manual marketing tasks by 60% through automation",
            "Created comprehensive lead nurturing campaigns",
            "Developed ROI tracking and performance analytics systems",
          ],
        },
      },
      // Education
      edu: {
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
    },
    articles: {
      title: "Blog & Articles",
      subtitle: "Insights, tutorials, and thoughts on technology, marketing automation, and development",
      search: "Search articles...",
      noResults: "No articles found matching your search.",
      readMore: "Read More",
      loading: "Loading articles...",
    },
    // Home Page
    home: {
      title: "Transformando marcas",
      subtitle: "con soluciones digitales",
      description:
        "Implementing cutting edge technologies and techniques to boost results through data-driven strategies in marketing, automation, and innovative design.",
      hero: {
        subtitle: "Senior Marketing & Innovation Strategist",
        description:
          "Implementing cutting edge technologies and techniques to boost results through data-driven strategies in marketing, automation, and innovative design.",
        cta: {
          projects: "View Projects",
          contact: "Get In Touch",
        },
      },
      intro: {
        title: "About Me",
        greeting: "Hi, I'm A.S. Johan.",
        passion: "I have a deep passion for understanding the world, and implementing ways to make it better.",
        paragraph1:
          "Hi, I'm A.S. Johan. I have a deep passion for understanding the world, and implementing ways to make it better.",
        paragraph2:
          "With over 8 years of experience in marketing automation and digital strategy, I help brands transform their digital presence through innovative solutions.",
        paragraph3:
          "My approach combines data-driven insights with creative problem-solving to deliver measurable results that drive business growth.",
      },
      values: {
        title: "MY VALUES",
        subtitle: "Core principles that drive my work and decisions",
        innovation: {
          title: "Innovation",
          description: "Embracing cutting-edge technologies and creative solutions to solve complex challenges.",
        },
        excellence: {
          title: "Excellence",
          description: "Delivering high-quality work that exceeds expectations and drives meaningful results.",
        },
        learning: {
          title: "Always Learning",
          description: "Continuous growth and adaptation in an ever-evolving digital landscape.",
        },
        curiosity: {
          title: "Curiosity",
          description: "Asking the right questions to uncover innovative solutions and opportunities.",
        },
        agility: {
          title: "Quick to Change",
          description: "Embracing change and pivoting strategies based on data and market feedback.",
        },
      },
      portfolio: {
        title: "FEATURED PROJECTS",
        subtitle: "Strategic implementations with measurable impact",
        viewAll: "View All Projects",
      },
      projects: {
        title: "Featured Projects",
        viewAll: "View All Projects",
        sample: {
          ecommerce: "A modern e-commerce platform with advanced features and seamless user experience.",
          automation: "Comprehensive marketing automation system that increased conversion rates by 40%.",
          mobile: "Cross-platform mobile application with real-time synchronization and offline capabilities.",
        },
      },
      blog: {
        title: "LATEST INSIGHTS",
        subtitle: "Thoughts on innovation, marketing, and digital transformation",
        viewAll: "Read All Articles",
        sample: {
          ai: {
            title: "The Future of AI in Marketing",
            excerpt:
              "Exploring how artificial intelligence is reshaping marketing strategies and customer experiences.",
          },
          automation: {
            title: "Marketing Automation Best Practices",
            excerpt: "Key strategies for implementing effective marketing automation that drives results.",
          },
          future: {
            title: "The Future of Digital Marketing",
            excerpt: "Trends and predictions for the evolution of digital marketing in the coming years.",
          },
        },
      },
      cta: {
        title: "LET'S WORK TOGETHER",
        subtitle: "Ready to transform your digital presence?",
        description: "Ready to take your digital presence to the next level? Let's collaborate on your next project.",
        aboutMe: "Know More About Me",
        contact: "Get In Touch",
        portfolio: "View Portfolio",
      },
    },
    // Contact
    contact: {
      header: {
        title: "INITIATE CONNECTION",
        alvaIntro: {
          line1: "Connection Interface.",
          line2: "Ready to discuss your next strategic initiative?",
          line3: "Communication protocols: Active",
        },
      },
      form: {
        title: "Send Message",
        nameLabel: "Name",
        emailLabel: "Email",
        messageLabel: "Message",
        messagePlaceholder: "Tell me about your project or initiative...",
        submitButton: "Send Message",
        submitMessage: "Form submitted successfully!",
      },
      info: {
        directTitle: "Direct Contact",
        location: "Medellín, Colombia",
        linkedin: "LinkedIn Profile",
        responseTitle: "Response Time",
        responseText:
          "I typically respond to inquiries within 24 hours. For urgent matters, please indicate the priority level in your message.",
        remoteTitle: "Remote Collaboration",
        remoteText:
          "With 8+ years of experience, I'm ready for challenging remote opportunities across marketing automation, full-funnel strategies, and team leadership.",
        alvaQuote: "Connection protocols active. Standby for strategic alignment. - A.S. Johan",
      },
    },
    // Common
    common: {
      readMore: "Read More",
      getInTouch: "Get In Touch",
      viewProjects: "View Projects",
      readArticles: "Read Articles",
      quotes: {
        projects:
          "Innovation is seeing what everybody has seen and thinking what nobody has thought. - Albert Szent-Györgyi",
        articles: "Information processed. Dissemination active. - A.S. Johan",
        about:
          "Profile analysis complete. Academic excellence and strategic capabilities confirmed. 8+ years of proven results documented. - A.S. Johan",
        contact: "Connection protocols active. Standby for strategic alignment. - A.S. Johan",
      },
    },
  },
  es: {
    // Navigation
    nav: {
      home: "INICIO",
      projects: "PROYECTOS",
      articles: "ARTÍCULOS",
      about: "SOBRE MÍ",
      contact: "CONTACTO",
    },
    projects: {
      title: "Proyectos",
      subtitle: "Explora mi portafolio de soluciones digitales innovadoras y campañas exitosas",
      search: "Buscar proyectos...",
      noResults: "No se encontraron proyectos que coincidan con tu búsqueda.",
      viewDetails: "Ver Detalles",
      featured: "Destacado",
      loading: "Cargando proyectos...",
      backToProjects: "Volver a Proyectos",
      client: "Cliente",
      gallery: "Galería del Proyecto",
      autoScroll: "Desplazamiento automático activado",
      resumeAutoScroll: "Reanudar desplazamiento automático",
      technologies: "Tecnologías y Habilidades",
      projectQuote: "Análisis del proyecto completo. Implementación exitosa.",
      viewLive: "Ver Proyecto en Vivo",
      notFound: "Proyecto No Encontrado",
      pressEsc: "Presiona ESC o haz clic afuera para cerrar",
    },
    about: {
      title: "Sobre Mí",
      subtitle:
        "Estratega Senior en Marketing e Innovación con más de 8 años de experiencia transformando paisajes digitales",
      currentRole: "Especialista en Automatización de Marketing",
      location: "Medellín, Colombia",
      experience: "8+ Años de Experiencia",
      bio: "Apasionado por aprovechar tecnologías de vanguardia y estrategias basadas en datos para transformar paisajes de marketing. Especializado en automatización, optimización de embudo completo y soluciones digitales innovadoras que impulsan el crecimiento empresarial medible.",
      getInTouch: "Ponte en Contacto",
      linkedinProfile: "Perfil de LinkedIn",
      professionalExperience: "Experiencia Profesional",
      education: "Educación",
      technicalSkills: "Habilidades Técnicas y Experiencia",
      letsWorkTogether: "Trabajemos Juntos",
      ctaDescription:
        "¿Listo para transformar tu estrategia de marketing con automatización de vanguardia e insights basados en datos? Hablemos sobre cómo podemos impulsar tu negocio.",
      startConversation: "Iniciar una Conversación",
      viewMyWork: "Ver Mi Trabajo",
      fullTime: "Tiempo completo",
      freelance: "Freelance",
      // Work experiences
      work: {
        pvragon: {
          role: "Especialista en Automatización de Marketing",
          company: "Pvragon",
          period: "Junio 2025 - Actual",
          location: "Medellín, Colombia (Remoto)",
          achievements: [
            "Liderando iniciativas de automatización de marketing para clientes internacionales",
            "Implementando estrategias avanzadas de embudo y optimización de conversiones",
            "Desarrollando soluciones de marketing basadas en datos y frameworks de análisis",
          ],
        },
        independent: {
          role: "INDEPENDIENTE / FREELANCE",
          company: "Estratega de Marketing e Innovación",
          period: "Noviembre 2022 - Junio 2025",
          location: "Medellín, Colombia",
          description:
            "Especializado en automatización de marketing, estrategias de embudo completo y transformación digital para diversos clientes en múltiples industrias.",
          achievements: [
            "Entregué más de 50 proyectos exitosos de automatización de marketing",
            "Aumenté las tasas de conversión de clientes en un promedio del 35%",
            "Construí embudos de marketing integrales generando más de $2M en ingresos",
            "Desarrollé dashboards de análisis personalizados y sistemas de reportes",
          ],
        },
        grandpaDevs: {
          role: "GRANDPA DEVS",
          company: "Especialista en Automatización de Marketing",
          period: "Septiembre 2021 - Noviembre 2022",
          location: "Medellín, Colombia",
          achievements: [
            "Implementé flujos de automatización de marketing para más de 20 clientes",
            "Reduje tareas manuales de marketing en un 60% a través de automatización",
            "Creé campañas integrales de nutrición de leads",
            "Desarrollé sistemas de seguimiento de ROI y análisis de rendimiento",
          ],
        },
      },
      // Education
      edu: {
        degree: "Ingeniería de Sistemas",
        institution: "Universidad de Antioquia",
        period: "2016 - 2021",
        location: "Medellín, Colombia",
        achievements: [
          "Beneficiario de Beca de Excelencia Académica",
          "Graduado con honores en Desarrollo de Software",
          "Especializado en Análisis de Datos e Inteligencia de Negocios",
        ],
      },
    },
    articles: {
      title: "Blog y Artículos",
      subtitle: "Reflexiones, tutoriales y pensamientos sobre tecnología, automatización de marketing y desarrollo",
      search: "Buscar artículos...",
      noResults: "No se encontraron artículos que coincidan con tu búsqueda.",
      readMore: "Leer Más",
      loading: "Cargando artículos...",
    },
    // Home Page
    home: {
      title: "Transformando marcas",
      subtitle: "con soluciones digitales",
      description:
        "Implementando tecnologías y técnicas de vanguardia para potenciar resultados a través de estrategias basadas en datos en marketing, automatización y diseño innovador.",
      hero: {
        subtitle: "Estratega Senior en Marketing e Innovación",
        description:
          "Implementando tecnologías y técnicas de vanguardia para potenciar resultados a través de estrategias basadas en datos en marketing, automatización y diseño innovador.",
        cta: {
          projects: "Ver Proyectos",
          contact: "Ponte en Contacto",
        },
      },
      intro: {
        title: "Sobre Mí",
        greeting: "Hola, soy A.S. Johan.",
        passion: "Tengo una profunda pasión por entender el mundo e implementar formas de mejorarlo.",
        paragraph1:
          "Hola, soy A.S. Johan. Tengo una profunda pasión por entender el mundo e implementar formas de mejorarlo.",
        paragraph2:
          "Con más de 8 años de experiencia en automatización de marketing y estrategia digital, ayudo a las marcas a transformar su presencia digital a través de soluciones innovadoras.",
        paragraph3:
          "Mi enfoque combina insights basados en datos con resolución creativa de problemas para entregar resultados medibles que impulsan el crecimiento empresarial.",
      },
      values: {
        title: "MIS VALORES",
        subtitle: "Principios fundamentales que impulsan mi trabajo y decisiones",
        innovation: {
          title: "Innovación",
          description: "Abrazando tecnologías de vanguardia y soluciones creativas para resolver desafíos complejos.",
        },
        excellence: {
          title: "Excelencia",
          description:
            "Entregando trabajo de alta calidad que supera expectativas e impulsa resultados significativos.",
        },
        learning: {
          title: "Siempre Aprendiendo",
          description: "Crecimiento continuo y adaptación en un panorama digital en constante evolución.",
        },
        curiosity: {
          title: "Curiosidad",
          description: "Hacer las preguntas correctas para descubrir soluciones innovadoras y oportunidades.",
        },
        agility: {
          title: "Rápido para Cambiar",
          description: "Abrazando el cambio y pivoteando estrategias basadas en datos y retroalimentación del mercado.",
        },
      },
      portfolio: {
        title: "PROYECTOS DESTACADOS",
        subtitle: "Implementaciones estratégicas con impacto medible",
        viewAll: "Ver Todos los Proyectos",
      },
      projects: {
        title: "Proyectos Destacados",
        viewAll: "Ver Todos los Proyectos",
        sample: {
          ecommerce:
            "Una plataforma de e-commerce moderna con características avanzadas y experiencia de usuario fluida.",
          automation: "Sistema integral de automatización de marketing que aumentó las tasas de conversión en un 40%.",
          mobile: "Aplicación móvil multiplataforma con sincronización en tiempo real y capacidades offline.",
        },
      },
      blog: {
        title: "ÚLTIMAS REFLEXIONES",
        subtitle: "Pensamientos sobre innovación, marketing y transformación digital",
        viewAll: "Leer Todos los Artículos",
        sample: {
          ai: {
            title: "El Futuro de la IA en Marketing",
            excerpt:
              "Explorando cómo la inteligencia artificial está remodelando las estrategias de marketing y las experiencias del cliente.",
          },
          automation: {
            title: "Mejores Prácticas de Automatización de Marketing",
            excerpt: "Estrategias clave para implementar automatización de marketing efectiva que genere resultados.",
          },
          future: {
            title: "El Futuro del Marketing Digital",
            excerpt: "Tendencias y predicciones para la evolución del marketing digital en los próximos años.",
          },
        },
      },
      cta: {
        title: "TRABAJEMOS JUNTOS",
        subtitle: "¿Listo para transformar tu presencia digital?",
        description: "¿Listo para llevar tu presencia digital al siguiente nivel? Colaboremos en tu próximo proyecto.",
        aboutMe: "Conoce Más Sobre Mí",
        contact: "Ponte en Contacto",
        portfolio: "Ver Portafolio",
      },
    },
    // Contact
    contact: {
      header: {
        title: "INICIAR CONEXIÓN",
        alvaIntro: {
          line1: "Interfaz de Conexión.",
          line2: "¿Listo para discutir tu próxima iniciativa estratégica?",
          line3: "Protocolos de comunicación: Activos",
        },
      },
      form: {
        title: "Enviar Mensaje",
        nameLabel: "Nombre",
        emailLabel: "Correo Electrónico",
        messageLabel: "Mensaje",
        messagePlaceholder: "Cuéntame sobre tu proyecto o iniciativa...",
        submitButton: "Enviar Mensaje",
        submitMessage: "¡Formulario enviado exitosamente!",
      },
      info: {
        directTitle: "Contacto Directo",
        location: "Medellín, Colombia",
        linkedin: "Perfil de LinkedIn",
        responseTitle: "Tiempo de Respuesta",
        responseText:
          "Típicamente respondo a consultas dentro de 24 horas. Para asuntos urgentes, por favor indica el nivel de prioridad en tu mensaje.",
        remoteTitle: "Colaboración Remota",
        remoteText:
          "Con más de 8 años de experiencia, estoy listo para oportunidades remotas desafiantes en automatización de marketing, estrategias de embudo completo y liderazgo de equipos.",
        alvaQuote: "Protocolos de conexión activos. En espera de alineación estratégica. - A.S. Johan",
      },
    },
    // Common
    common: {
      readMore: "Leer Más",
      getInTouch: "Ponte en Contacto",
      viewProjects: "Ver Proyectos",
      readArticles: "Leer Artículos",
      quotes: {
        projects:
          "Innovar es ver lo que todo el mundo ha visto y pensar lo que nadie ha pensado. - Albert Szent-Györgyi",
        articles: "Información procesada. Diseminación activa. - A.S. Johan",
        about:
          "Análisis de perfil completo. Excelencia académica y capacidades estratégicas confirmadas. Más de 8 años de resultados comprobados documentados. - A.S. Johan",
        contact: "Protocolos de conexión activos. En espera de alineación estratégica. - A.S. Johan",
      },
    },
  },
}

export function getBrowserLanguage(): Language {
  if (typeof window === "undefined") return "en"

  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith("es")) return "es"
  return "en"
}
