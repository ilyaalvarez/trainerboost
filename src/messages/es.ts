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
    h1: 'Deja de gestionar\ntu negocio desde\nWhatsApp',
    sub: 'Agenda semanal, rutinas con vídeo y seguimiento automático.\nTodo lo que necesitas para llevar 20 clientes con la misma energía que llevas 5.',
    hint: 'Sin compromiso · Te avisamos antes del lanzamiento',
  },
  pain: {
    sectionTitle: 'Sin TrainerBoost, así\nes el día de un\nEntrenador Personal',
    items: [
      {
        bad: 'Persigues a tus clientes para agendar sesiones y confirmar cambios de última hora',
        good: 'Agenda semanal visual. Ellos reservan, tú recibes la notificación.',
      },
      {
        bad: 'PDF por WhatsApp que nadie vuelve a abrir',
        good: 'Rutinas con vídeo integrado que el cliente sigue desde su móvil, paso a paso.',
      },
      {
        bad: 'Con más de 10 clientes el caos se multiplica y el tiempo desaparece',
        good: 'De 5 a 50 clientes sin cambiar de herramienta. TrainerBoost escala contigo.',
      },
    ],
    closeTitle: 'Recupera el tiempo que\nahora gestionas. Úsalo\npara crecer de verdad.',
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
        q: '¿En qué se diferencia de otras plataformas para entrenadores?',
        a: 'La mayoría no tienen agenda semanal visual para organizar tus entrenamientos. Los vídeos de ejercicios en TrainerBoost funcionan mediante enlace — sin subidas que fallen. Todo está en español, pensado para el mercado español, con soporte de precios en euros y cumplimiento RGPD.',
      },
    ],
  },
  cta: {
    h2: 'El primer paso para dejar\nde perseguir clientes.',
    sub: 'Apúntate. Te avisamos antes que a nadie.',
  },
  footer: {
    copy: '© 2026 TrainerBoost · España',
    ariaLabel: 'Pie de página',
    legalLinks: 'Páginas legales',
    privacy: 'Privacidad',
    terms: 'Términos',
    cookies: 'Cookies',
    legalNotice: 'Aviso Legal',
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
