import type { BlogArticle } from './types'

const article: BlogArticle = {
  slug: 'como-cobrar-clientes-entrenamiento-personal',
  title: 'Cómo cobrar a tus clientes de entrenamiento personal: métodos y automatización',
  description: 'Guía para entrenadores personales sobre cómo estructurar los cobros, evitar impagos y automatizar las mensualidades sin tener que perseguir a nadie.',
  datePublished: '2026-07-01',
  dateModified: '2026-07-01',
  category: 'Negocio',
  categorySlug: 'negocio',
  readingTime: 9,
  relatedSlugs: [
    'como-organizar-clientes-entrenamiento-personal',
    'cuanto-cobra-entrenador-personal-espana',
    'mejor-software-entrenador-personal',
  ],
  faqs: [
    {
      q: '¿Cuál es la mejor forma de cobrar a clientes de entrenamiento personal?',
      a: 'La mensualidad con pago automático por tarjeta o domiciliación bancaria es la opción más profesional. Elimina los impagos, no tienes que recordar cobrar y el cliente lo percibe como un servicio más serio.',
    },
    {
      q: '¿Cómo evito que mis clientes me deban dinero?',
      a: 'La clave es cobrar por adelantado (al inicio del mes o antes de la sesión) y usar un sistema de pago automático. Si el pago falla, el cliente lo sabe de inmediato — no tú después de dar el servicio.',
    },
    {
      q: '¿Tengo que facturar a mis clientes de entrenamiento personal?',
      a: 'Si estás dado de alta como autónomo, sí debes emitir factura por cada cobro. Si trabajas en una academia o gimnasio, la facturación puede estar centralizada. En cualquier caso, siempre es recomendable tener un registro de todos los cobros.',
    },
    {
      q: '¿Es mejor cobrar por sesión o por mensualidad?',
      a: 'La mensualidad favorece la retención y la previsibilidad de ingresos. El cobro por sesión tiene más rotación de clientes. Para la mayoría de entrenadores, la mensualidad con número mínimo de sesiones garantizadas es el modelo que mejor funciona.',
    },
  ],
  sections: [
    {
      type: 'p',
      text: 'Hablar de dinero con los clientes incomoda a muchos entrenadores. Pero la gestión de cobros es una parte fundamental del negocio — hacerla bien marca la diferencia entre un entrenador que tiene ingresos estables y uno que vive con incertidumbre cada mes.',
    },
    {
      type: 'p',
      text: 'En esta guía vemos los modelos de cobro más usados en el sector, cómo evitar impagos y cómo automatizar el proceso para no tener que perseguir a nadie.',
    },
    {
      type: 'h2',
      text: 'Los tres modelos de cobro principales en entrenamiento personal',
    },
    {
      type: 'h3',
      text: 'Modelo 1: Pago por sesión',
    },
    {
      type: 'p',
      text: 'El cliente paga cada sesión por separado, normalmente en el momento o al final. Es el modelo más flexible para el cliente pero el más inestable para el entrenador. Los ingresos varían según la asistencia y hay mayor probabilidad de cancelaciones de última hora.',
    },
    {
      type: 'p',
      text: 'Funciona bien para: clientes con horario irregular, servicios puntuales, primeras sesiones de prueba.',
    },
    {
      type: 'h3',
      text: 'Modelo 2: Pack de sesiones',
    },
    {
      type: 'p',
      text: 'El cliente compra un número fijo de sesiones por adelantado (pack de 5, 10 o 20 sesiones) con un pequeño descuento respecto al precio unitario. Da más previsibilidad al entrenador y compromiso al cliente.',
    },
    {
      type: 'p',
      text: 'El riesgo: si el cliente no usa todas las sesiones, hay tensión en la relación. Define siempre una fecha de caducidad para el pack.',
    },
    {
      type: 'h3',
      text: 'Modelo 3: Mensualidad',
    },
    {
      type: 'p',
      text: 'El cliente paga una cuota mensual fija que cubre un número determinado de sesiones o acceso ilimitado a tus servicios. Es el modelo con mayor previsibilidad de ingresos y el que mejor funciona para retener clientes a largo plazo.',
    },
    {
      type: 'p',
      text: 'La mensualidad es el modelo recomendado para la mayoría de entrenadores a partir de 8-10 clientes activos.',
    },
    {
      type: 'callout',
      variant: 'tip',
      text: 'Combina modelos según el perfil del cliente: mensualidad para clientes fijos, pack para clientes semi-regulares y sesión suelta para nuevos clientes en periodo de prueba.',
    },
    {
      type: 'h2',
      text: 'Cómo estructurar tus precios',
    },
    {
      type: 'p',
      text: 'Antes de hablar de métodos de cobro, asegúrate de que tus precios son sostenibles. Los errores más comunes:',
    },
    {
      type: 'ul',
      items: [
        'Poner precios demasiado bajos por miedo a perder clientes — acaba en agotamiento',
        'No actualizar tarifas durante años — la inflación come el margen',
        'Ofrecer descuentos sin límite — desvaloriza el servicio',
        'No cobrar el tiempo de desplazamiento en entrenamiento a domicilio',
      ],
    },
    {
      type: 'p',
      text: 'Una referencia para 2026: el precio medio de una sesión individual de entrenamiento personal en España está entre 30€ y 60€ dependiendo de la ciudad y la especialización. En Madrid y Barcelona los precios superiores son más habituales.',
    },
    {
      type: 'h2',
      text: 'Métodos de cobro: cuál elegir',
    },
    {
      type: 'h3',
      text: 'Efectivo',
    },
    {
      type: 'p',
      text: 'Cómodo para el cliente, problemático para el entrenador. No hay registro automático, hay que gestionar el cambio y favorece el olvido. No recomendado como método principal.',
    },
    {
      type: 'h3',
      text: 'Transferencia bancaria',
    },
    {
      type: 'p',
      text: 'Mejor que el efectivo: hay registro y no requiere estar presente. El problema es que depende de que el cliente recuerde transferir — y muchos lo olvidan, especialmente en los primeros meses.',
    },
    {
      type: 'h3',
      text: 'Domiciliación bancaria (SEPA)',
    },
    {
      type: 'p',
      text: 'El cliente firma una autorización y el cobro se hace automáticamente cada mes. Elimina los olvidos y profesionaliza el servicio. Requiere un sistema de gestión de pagos que lo soporte.',
    },
    {
      type: 'h3',
      text: 'Pago con tarjeta online',
    },
    {
      type: 'p',
      text: 'El cliente introduce su tarjeta una vez y los cobros se procesan automáticamente. Es el método más moderno y el que mejor experiencia da al cliente. Requiere integración con un procesador de pagos como Stripe.',
    },
    {
      type: 'callout',
      variant: 'tip',
      text: 'El pago automático con tarjeta no solo elimina impagos — también elimina la conversación incómoda de recordar que hay que pagar. El cliente lo vive como más profesional y el entrenador pierde el miedo a pedir el dinero.',
    },
    {
      type: 'h2',
      text: 'Cómo evitar impagos',
    },
    {
      type: 'p',
      text: 'Los impagos en entrenamiento personal son más comunes de lo que parece. Las causas más frecuentes:',
    },
    {
      type: 'ul',
      items: [
        'El cliente simplemente se olvida (no hay automatización)',
        'El cliente no tiene claro cuándo debe pagar',
        'El entrenador no tiene un sistema claro y da margen indefinido',
        'El cliente cancela el servicio pero el entrenador no lo gestiona formalmente',
      ],
    },
    {
      type: 'p',
      text: 'Las medidas que eliminan el 90% de los impagos:',
    },
    {
      type: 'ul',
      items: [
        'Cobrar siempre por adelantado — el servicio se presta después del pago',
        'Automatizar los cobros recurrentes con tarjeta o domiciliación',
        'Definir en el contrato inicial qué pasa si un pago falla',
        'Suspender el servicio automáticamente si hay un impago sin justificar',
        'No dar más de 7 días de margen para regularizar un pago fallido',
      ],
    },
    {
      type: 'h2',
      text: 'Facturación: lo que necesitas saber',
    },
    {
      type: 'p',
      text: 'Si eres autónomo, tienes obligación de emitir factura por cada cobro. Los datos obligatorios en una factura española:',
    },
    {
      type: 'ul',
      items: [
        'Número de factura correlativo',
        'Fecha de emisión',
        'Tus datos fiscales (nombre/razón social, NIF, dirección fiscal)',
        'Datos del cliente (si es empresa, también su NIF)',
        'Descripción del servicio',
        'Base imponible, tipo de IVA aplicable y cuota de IVA',
        'Total a pagar',
      ],
    },
    {
      type: 'p',
      text: 'En entrenamiento personal, el IVA puede estar exento si el servicio cumple los requisitos del artículo 20 de la Ley del IVA (servicios de enseñanza). Consulta con un asesor fiscal tu situación específica.',
    },
    {
      type: 'h2',
      text: 'Automatizar los cobros con software específico',
    },
    {
      type: 'p',
      text: 'Gestionar cobros manualmente con más de 10 clientes es una fuente de estrés constante. Un software para entrenadores que integre la gestión de pagos permite:',
    },
    {
      type: 'ul',
      items: [
        'Configurar cobros recurrentes automáticos por cliente',
        'Ver en un panel quién ha pagado y quién no en tiempo real',
        'Enviar recordatorios automáticos antes del cobro',
        'Registrar el historial completo de pagos de cada cliente',
        'Emitir facturas automáticamente tras cada cobro',
      ],
    },
    {
      type: 'cta',
      text: 'Automatiza los cobros de tu negocio con TrainerBoost',
    },
    {
      type: 'h2',
      text: 'Conclusión',
    },
    {
      type: 'p',
      text: 'La gestión de cobros no tiene por qué ser incómoda ni manual. Con el modelo correcto (mensualidad por adelantado), el método correcto (pago automático con tarjeta) y las herramientas adecuadas, los impagos desaparecen y el tiempo que dedicabas a perseguir pagos se invierte en entrenar mejor a tus clientes.',
    },
  ],
}

export default article
