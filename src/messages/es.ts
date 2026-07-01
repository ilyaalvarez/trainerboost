import type { Messages } from './types'

export const es: Messages = {
  nav: {
    howItWorks: 'Cómo funciona',
    faq: 'FAQ',
    waitlist: 'Lista de espera',
    ariaLabel: 'Navegación principal',
    goToTop: 'Ir al inicio',
  },
  hero: {
    h1: 'Gestiona tus clientes\ncomo un profesional',
    sub: 'Clientes organizados. Seguimiento automático.\nCobros sin perseguir a nadie. Todo en un sitio.',
    hint: 'Sin compromiso · Te avisamos antes del lanzamiento',
  },
  pain: {
    sectionTitle: 'Sin TrainerBoost, así\nes el día de un\nEntrenador Personal',
    items: [
      {
        bad: 'Planes de entrenamiento en PDF por WhatsApp',
        good: 'Rutinas digitales que el cliente ve desde su móvil',
      },
      {
        bad: 'Cobros manuales y recordatorios incómodos',
        good: 'Stripe integrado — el cobro llega solo, sin perseguir',
      },
      {
        bad: 'Clientes que abandonan porque no ven su progreso',
        good: 'Gráficas automáticas que los mantienen comprometidos',
      },
    ],
    closeTitle: 'Todo lo que necesitas\npara gestionar mejor\ny cobrar a tiempo.',
  },
  faq: {
    sectionTitle: 'Preguntas frecuentes\nde Entrenadores Personales',
    items: [
      {
        q: '¿Cuándo estará disponible?',
        a: 'Estamos en beta privada con entrenadores seleccionados. El lanzamiento público está previsto para más adelante en 2026. Únete a la lista para tener acceso antes que nadie.',
      },
      {
        q: '¿Tengo que instalar alguna app?',
        a: 'No. TrainerBoost funciona desde el navegador, en cualquier dispositivo.',
      },
      {
        q: '¿Mis clientes necesitan descargarse algo?',
        a: 'Tampoco. Tus clientes acceden a su área desde el móvil o la tablet directamente, sin descargar nada.',
      },
      {
        q: '¿Qué pasa con mis datos si cancelo?',
        a: 'Son tuyos. Puedes exportar clientes, historial y rutinas en cualquier momento, en formatos estándar.',
      },
      {
        q: '¿Funciona para entrenadores con muchos clientes?',
        a: 'Sí. Desde 5 hasta más de 100 clientes sin cambiar de herramienta. La plataforma escala contigo.',
      },
      {
        q: '¿En qué se diferencia de una app genérica de fitness?',
        a: 'Las apps de fitness están pensadas para el cliente final. TrainerBoost está pensado para ti: para gestionar tu negocio, hacer seguimiento y cobrar. Sin ruido extra.',
      },
    ],
  },
  cta: {
    h2: 'Empieza hoy.',
    sub: 'Apúntate. Te avisamos antes del lanzamiento.',
  },
  footer: {
    copy: '© 2026 TrainerBoost · España',
    ariaLabel: 'Pie de página',
    legalLinks: 'Páginas legales',
  },
  form: {
    placeholder: 'tu@email.com',
    buttonText: 'Avísame al lanzar',
    ariaEmail: 'Tu email para unirte a la lista de espera',
    ariaSubmit: 'Unirme a la lista de espera',
    errorDefault: 'Error al unirse. Inténtalo de nuevo.',
    errorNetwork: 'Sin conexión. Comprueba tu red e inténtalo de nuevo.',
    successNew: 'Recibido. Te avisamos antes del lanzamiento.',
    successAlready: 'Ya estás en la lista. Te avisamos cuando abramos.',
    spotsLeft: '{n} personas en la lista de espera',
  },
  a11y: {
    skipToContent: 'Saltar al contenido principal',
    mainContent: 'Contenido principal',
    painLabel: 'El problema',
    ctaLabel: 'Únete a la lista de espera',
  },
}
