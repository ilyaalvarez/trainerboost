import type { BlogArticle } from './types'

const article: BlogArticle = {
  slug: 'ficha-cliente-entrenador-personal',
  title: 'Ficha de cliente para entrenador personal: qué incluir y cómo usarla',
  description: 'Aprende a crear fichas de cliente completas para tu negocio de entrenamiento personal. Qué datos recopilar, cómo estructurarlos y por qué marcan la diferencia en la retención.',
  datePublished: '2026-07-01',
  dateModified: '2026-07-01',
  category: 'Gestión',
  categorySlug: 'gestion',
  readingTime: 7,
  relatedSlugs: [
    'como-organizar-clientes-entrenamiento-personal',
    'como-cobrar-clientes-entrenamiento-personal',
    'mejor-software-entrenador-personal',
  ],
  faqs: [
    {
      q: '¿Qué debe incluir una ficha de cliente de entrenamiento personal?',
      a: 'Una ficha completa incluye datos personales básicos, historial médico y de lesiones, objetivos a corto y largo plazo, nivel de condición física inicial, disponibilidad horaria y método de pago acordado.',
    },
    {
      q: '¿Es obligatorio tener ficha de cada cliente por ley?',
      a: 'No existe obligación legal específica de tener fichas de entrenamiento, pero sí debes cumplir con el RGPD en el tratamiento de datos personales. Además, la ficha médica inicial te protege ante posibles reclamaciones si un cliente se lesiona.',
    },
    {
      q: '¿Cómo guardo las fichas de mis clientes de forma segura?',
      a: 'Lo más seguro es usar un software específico para entrenadores que almacene los datos en servidores con cifrado y cumpla con la normativa RGPD europea. Evita guardar datos sensibles en hojas de cálculo sin protección o en el móvil sin copia de seguridad.',
    },
    {
      q: '¿Puedo usar la misma ficha para todos mis clientes?',
      a: 'Sí, la estructura puede ser la misma pero el contenido debe personalizarse para cada cliente. Lo que varía es la información de salud, objetivos y plan de entrenamiento.',
    },
  ],
  sections: [
    {
      type: 'p',
      text: 'La ficha de cliente es el documento más importante que tienes como entrenador personal. No es papeleo — es la base que diferencia un servicio amateur de uno profesional, y la herramienta que te permite dar seguimiento real a cada persona.',
    },
    {
      type: 'p',
      text: 'En este artículo te explico qué debe incluir una ficha completa, cómo estructurarla para usarla en el día a día y cuál es la mejor forma de gestionarla cuando tienes varios clientes.',
    },
    {
      type: 'h2',
      text: 'Por qué la ficha de cliente importa más de lo que parece',
    },
    {
      type: 'p',
      text: 'Una ficha bien hecha cumple tres funciones que van más allá de tener los datos ordenados:',
    },
    {
      type: 'ul',
      items: [
        'Protección legal: si un cliente tiene una lesión previa y no la declaró, la ficha firmada es tu respaldo',
        'Personalización real: no puedes diseñar un programa efectivo sin conocer el historial, los objetivos y las limitaciones de cada persona',
        'Retención: un cliente que ve que recopilas información detallada sobre él percibe más valor en tu servicio y permanece más tiempo',
      ],
    },
    {
      type: 'h2',
      text: 'Qué incluir en la ficha de cliente: los 6 bloques esenciales',
    },
    {
      type: 'h3',
      text: 'Bloque 1: Datos personales básicos',
    },
    {
      type: 'ul',
      items: [
        'Nombre completo',
        'Fecha de nacimiento y edad',
        'Email y teléfono de contacto',
        'Dirección (si haces entrenamiento a domicilio)',
        'Contacto de emergencia',
      ],
    },
    {
      type: 'h3',
      text: 'Bloque 2: Historial de salud y médico',
    },
    {
      type: 'p',
      text: 'Este es el bloque más crítico. Aquí debes recopilar información que pueda afectar al entrenamiento:',
    },
    {
      type: 'ul',
      items: [
        'Patologías diagnosticadas (diabetes, hipertensión, problemas cardíacos, etc.)',
        'Lesiones previas y estado actual de recuperación',
        'Medicación habitual que pueda afectar al rendimiento o la frecuencia cardíaca',
        'Cirugías recientes o limitaciones de movimiento',
        'Alergias relevantes',
      ],
    },
    {
      type: 'callout',
      variant: 'tip',
      text: 'Incluye siempre una pregunta abierta: "¿Hay algo más que deba saber sobre tu salud antes de empezar a entrenarte?" Los clientes a veces no saben qué es relevante — dales la oportunidad de contártelo.',
    },
    {
      type: 'h3',
      text: 'Bloque 3: Objetivos y motivaciones',
    },
    {
      type: 'p',
      text: 'Los objetivos del cliente son lo que da sentido a todo lo demás. Distingue entre:',
    },
    {
      type: 'ul',
      items: [
        'Objetivo principal: lo que quiere conseguir (perder grasa, ganar músculo, mejorar condición física, correr una maratón...)',
        'Fecha objetivo: si tiene una fecha concreta (una boda, un evento deportivo, el verano)',
        'Motivación real: por qué es importante para él ahora — esto es lo que usarás cuando la motivación baje',
        'Qué ha intentado antes y por qué no funcionó',
      ],
    },
    {
      type: 'h3',
      text: 'Bloque 4: Condición física inicial',
    },
    {
      type: 'p',
      text: 'Esta es la fotografía del punto de partida — imprescindible para poder mostrar progreso:',
    },
    {
      type: 'ul',
      items: [
        'Peso y talla',
        'Porcentaje de grasa si tienes medición disponible',
        'Perímetros corporales básicos (cintura, cadera, pecho, brazos, muslos)',
        'Test de condición física inicial: resistencia, fuerza, flexibilidad',
        'Nivel de actividad física habitual previo',
      ],
    },
    {
      type: 'h3',
      text: 'Bloque 5: Disponibilidad y preferencias',
    },
    {
      type: 'ul',
      items: [
        'Días y horarios disponibles para entrenar',
        'Modalidad preferida (presencial, online o mixta)',
        'Equipamiento disponible si entrena en casa',
        'Actividades deportivas que practica o le gustan',
        'Actividades o tipos de ejercicio que no quiere hacer',
      ],
    },
    {
      type: 'h3',
      text: 'Bloque 6: Condiciones del servicio y pago',
    },
    {
      type: 'ul',
      items: [
        'Plan contratado y precio acordado',
        'Forma de pago (transferencia, tarjeta, efectivo)',
        'Periodicidad del cobro (mensual, por sesión, por pack)',
        'Política de cancelación de sesiones',
        'Consentimiento informado y protección de datos (RGPD)',
      ],
    },
    {
      type: 'h2',
      text: 'Cómo usar la ficha en el día a día',
    },
    {
      type: 'p',
      text: 'La ficha no es un documento que rellenas el primer día y no vuelves a mirar. Debe ser un archivo vivo que actualizas conforme avanza el cliente:',
    },
    {
      type: 'ul',
      items: [
        'Al inicio de cada mes: actualiza las métricas corporales',
        'Cuando hay un cambio de objetivo: anota qué cambió y por qué',
        'Si el cliente sufre una lesión menor: regístrala con fecha y circunstancias',
        'Al renovar el plan: actualiza condiciones y precio',
      ],
    },
    {
      type: 'h2',
      text: 'Ficha en papel vs. software: la diferencia real',
    },
    {
      type: 'p',
      text: 'Muchos entrenadores empiezan con fichas en papel o en PDF. Funciona para 3 o 4 clientes. A partir de ahí, los problemas son predecibles: no puedes buscar información rápidamente, no tienes copia de seguridad, y el cliente no puede acceder a sus propios datos.',
    },
    {
      type: 'p',
      text: 'Con un software específico para entrenadores, la ficha del cliente está integrada con su plan de entrenamiento, su historial de sesiones y su historial de pagos. Toda la información de una persona en tres clics.',
    },
    {
      type: 'cta',
      text: 'Gestiona las fichas de todos tus clientes en TrainerBoost',
    },
    {
      type: 'h2',
      text: 'Conclusión',
    },
    {
      type: 'p',
      text: 'Una ficha de cliente bien estructurada es la diferencia entre conocer de verdad a las personas que entrenas y simplemente acordarte de sus nombres. Los seis bloques que hemos visto — datos personales, historial médico, objetivos, condición inicial, disponibilidad y condiciones del servicio — cubren todo lo que necesitas para dar un servicio profesional y protegerte legalmente.',
    },
    {
      type: 'p',
      text: 'El siguiente paso es elegir cómo vas a gestionar esas fichas: papel, hoja de cálculo o software específico. A partir de 8-10 clientes activos, la tercera opción deja de ser un lujo y se convierte en una necesidad.',
    },
  ],
}

export default article
